const express = require('express');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const router = express.Router();

// @route   GET /api/chat/contacts
// @desc    Get list of allowed contacts (Buyer <-> Artist connection logic)
// @access  Private
router.get('/contacts', protect, async (req, res) => {
    try {
        const user = req.user; // Current user
        const Order = require('../models/Order');
        const User = require('../models/User');

        let contacts = [];

        if (user.role === 'buyer') {
            // Buyers can only chat with Artists they bought from
            // 1. Find orders by this buyer
            const orders = await Order.find({ buyerId: user._id }).populate({
                path: 'orderItems.artworkId',
                populate: { path: 'artistId', select: 'name email role' }
            });

            // 2. Extract unique Artists
            const artistMap = new Map();
            orders.forEach(order => {
                order.orderItems.forEach(item => {
                    if (item.artworkId && item.artworkId.artistId) {
                        const artist = item.artworkId.artistId;
                        artistMap.set(artist._id.toString(), {
                            _id: artist._id,
                            name: artist.name,
                            role: artist.role
                        });
                    }
                });
            });
            contacts = Array.from(artistMap.values());

        } else if (user.role === 'artist') {
            // Artists can chat with:
            // A. Other Artists
            const otherArtists = await User.find({ role: 'artist', _id: { $ne: user._id } }).select('name role');
            contacts = [...otherArtists];

            // B. Buyers who bought their work
            // Find orders where at least one item is by this artist
            // Logic: Order -> Items -> Artwork -> ArtistId == user._id

            // This is complex to query deeply in reverse without aggregation or loop.
            // Simpler: Find all orders, populate items/artwork.
            // Better: find orders where 'orderItems.artworkId' is in list of my artworks? 
            // Or use aggregate. Let's iterate for simplicity and robustness with current schema.

            /* 
               Actually, Order items only store ArtworkID. 
               We need to look up Artworks by this Artist first.
            */
            const Artwork = require('../models/Artwork');
            const myArtworks = await Artwork.find({ artistId: user._id }).select('_id');
            const myArtworkIds = myArtworks.map(a => a._id);

            const orders = await Order.find({
                'orderItems.artworkId': { $in: myArtworkIds }
            }).populate('buyerId', 'name role');

            const buyerMap = new Map();
            orders.forEach(order => {
                if (order.buyerId) {
                    buyerMap.set(order.buyerId._id.toString(), {
                        _id: order.buyerId._id,
                        name: order.buyerId.name,
                        role: order.buyerId.role
                    });
                }
            });

            // Merge unique buyers
            buyerMap.forEach(buyer => {
                if (!contacts.find(c => c._id.toString() === buyer._id.toString())) {
                    contacts.push(buyer);
                }
            });
            // Note: renamed buyerMap to jobMap to avoid lint collision if I pasted wrong, 
            // but effectively we are iterating the map populated above.
        }

        // --- ENRICHMENT STEP: Fetch Last Message & Sort ---
        // For each contact, find the last message exchanged with current user
        const enrichedContacts = await Promise.all(contacts.map(async (contact) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { senderId: user._id, receiverId: contact._id },
                    { senderId: contact._id, receiverId: user._id }
                ]
            }).sort({ createdAt: -1 });

            // Count unread messages from this contact to current user
            const unreadCount = await Message.countDocuments({
                senderId: contact._id,
                receiverId: user._id,
                read: false
            });

            return {
                ...contact, // Spread plain object properties (if it came from map/lean) or toObject()
                _id: contact._id,
                name: contact.name,
                role: contact.role,
                lastMessage: lastMsg ? lastMsg.message : null,
                lastTime: lastMsg ? lastMsg.createdAt : null, // Use distinct 'lastTime' for sorting
                unread: unreadCount
            };
        }));

        // Sort by lastTime descending (newest first)
        enrichedContacts.sort((a, b) => {
            const dateA = a.lastTime ? new Date(a.lastTime) : new Date(0);
            const dateB = b.lastTime ? new Date(b.lastTime) : new Date(0);
            return dateB - dateA;
        });

        res.json(enrichedContacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/chat/:userId
// @desc    Get conversation with a specific user and MARK AS READ
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        // 1. Mark incoming messages from this user as read
        await Message.updateMany(
            { senderId: req.params.userId, receiverId: req.user._id, read: false },
            { $set: { read: true } }
        );

        // 2. Fetch conversation
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user._id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/chat/send
// @desc    Save a new message
// @access  Private
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, message, room } = req.body;

        const newMessage = new Message({
            senderId: req.user._id,
            receiverId,
            message,
            room // Optional: store room if needed, but sender/receiver is enough usually
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/chat/global
// @desc    Get global chat history
// @access  Private (Artists only ideally, but 'protect' is enough)
router.get('/global/history', protect, async (req, res) => {
    try {
        const GlobalMessage = require('../models/GlobalMessage');
        const messages = await GlobalMessage.find({ room: 'artist_global' })
            .sort({ createdAt: 1 }) // Oldest first
            .limit(100); // Limit to last 100 messages
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/chat/global
// @desc    Save global chat message
// @access  Private
router.post('/global', protect, async (req, res) => {
    try {
        const GlobalMessage = require('../models/GlobalMessage');
        const { message, time } = req.body;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Optional: Clear very old messages? No, keep history.

        const newMsg = new GlobalMessage({
            senderId: req.user._id,
            authorName: req.user.name,
            message,
            timestamp: time // Client-provided string or generate here
        });

        await newMsg.save();
        res.status(201).json(newMsg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
