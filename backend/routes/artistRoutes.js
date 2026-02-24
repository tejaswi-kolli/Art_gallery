const express = require('express');
const { protect, artistOnly } = require('../middleware/auth');
const ArtistProfile = require('../models/ArtistProfile');
const Artwork = require('../models/Artwork');
const upload = require('../middleware/upload');
const router = express.Router();

// @route   GET /api/artists/profile
// @desc    Get current artist profile
// @access  Private (Artist)
router.get('/profile', protect, artistOnly, async (req, res) => {
    try {
        const profile = await ArtistProfile.findOne({ userId: req.user._id }).populate('userId', 'name email');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/artists/profile
// @desc    Update artist profile (Bio, Socials, Image, Portfolio)
// @access  Private (Artist)
router.put('/profile', protect, artistOnly, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'portfolio', maxCount: 1 }]), async (req, res) => {
    try {
        const profile = await ArtistProfile.findOne({ userId: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Update Text Fields
        if (req.body.bio) profile.bio = req.body.bio;

        // Handle Social Links
        if (req.body.socialLinks) {
            try {
                const links = typeof req.body.socialLinks === 'string'
                    ? JSON.parse(req.body.socialLinks)
                    : req.body.socialLinks;
                profile.socialLinks = { ...profile.socialLinks, ...links };
            } catch (e) {
                console.error("Error parsing socialLinks:", e);
            }
        }

        // Handle Profile Image
        if (req.files && req.files.profileImage) {
            // Store relative path 'uploads/filename'
            profile.profileImage = 'uploads/' + req.files.profileImage[0].filename;
        }

        // Handle Portfolio
        if (req.files && req.files.portfolio) {
            // Store relative path 'uploads/filename'
            profile.portfolio = ['uploads/' + req.files.portfolio[0].filename];
        }

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/artists/upload-artwork
// @desc    Upload new artwork
// @access  Private (Artist)
router.post('/upload-artwork', protect, artistOnly, upload.array('images', 10), async (req, res) => {
    try {
        console.log('Upload Request Body:', req.body);
        console.log('Upload Request Files:', req.files);

        const { title, description, price, medium, style, quantity } = req.body;

        // 1. Validate Required Fields
        if (!title || !description || !price || !medium || !style) {
            return res.status(400).json({ message: 'All fields (Title, Description, Price, Medium, Style) are required.' });
        }

        // 2. Validate Image Upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one artwork image is required.' });
        }

        let imagePaths = [];
        if (req.files) {
            // Store relative paths
            imagePaths = req.files.map(file => 'uploads/' + file.filename);
        }

        let collaborators = [];
        if (req.body.collaboratorEmail) {
            const User = require('../models/User');
            // Assuming single email for now based on user request "2 artists"
            const emails = req.body.collaboratorEmail.split(',').map(e => e.trim());
            for (const email of emails) {
                if (email) {
                    const collabUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
                    if (collabUser && collabUser.role === 'artist' && collabUser._id.toString() !== req.user._id.toString()) {
                        collaborators.push(collabUser._id);
                    } else if (!collabUser) {
                        console.warn(`Collaborator email not found: ${email}`);
                    }
                }
            }
        }

        const artwork = await Artwork.create({
            artistId: req.user._id,
            title,
            description,
            price,
            medium,
            style,
            images: imagePaths,
            quantity: quantity || 1,
            collaborators
        });

        console.log('Artwork Created:', artwork);
        res.status(201).json(artwork);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artists/inventory
// @desc    Get all artworks by current artist
// @access  Private (Artist)
router.get('/inventory', protect, artistOnly, async (req, res) => {
    try {
        const artworks = await Artwork.find({
            $or: [
                { artistId: req.user._id },
                { collaborators: req.user._id }
            ]
        })
            .populate('artistId', 'name')
            .populate('collaborators', 'name'); // Populate collaborator names

        res.json(artworks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/artists/artwork/:id
// @desc    Update artwork details
// @access  Private (Artist)
router.put('/artwork/:id', protect, artistOnly, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        // Verify ownership
        if (artwork.artistId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this artwork' });
        }

        const { title, description, price, medium, style, quantity } = req.body;

        const updateData = {
            title: title || artwork.title,
            description: description || artwork.description,
            price: price !== undefined ? price : artwork.price,
            medium: medium || artwork.medium,
            style: style || artwork.style,
            quantity: quantity !== undefined ? Number(quantity) : artwork.quantity,
            available: (quantity !== undefined ? Number(quantity) : (artwork.quantity || 0)) > 0
        };

        const updatedArtwork = await Artwork.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Artwork Updated via findByIdAndUpdate:', updatedArtwork);
        res.json(updatedArtwork);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/artists/artwork/:id
// @desc    Delete artwork
// @access  Private (Artist)
router.delete('/artwork/:id', protect, artistOnly, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        // Verify ownership
        if (artwork.artistId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this artwork' });
        }

        await Artwork.deleteOne({ _id: artwork._id });
        res.json({ message: 'Artwork removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artists/analytics
// @desc    Get artist analytics (Revenue, Sales, Inventory Stats)
// @access  Private (Artist)
const Order = require('../models/Order'); // Import Order model

// ... (other routes)

// @route   GET /api/artists/analytics
// @desc    Get artist analytics (Revenue, Sales, Inventory Stats, Graphs)
// @access  Private (Artist)
router.get('/analytics', protect, artistOnly, async (req, res) => {
    try {
        const artistId = req.user._id;

        // 1. Fetch all artworks by this artist
        const artworks = await Artwork.find({ artistId });
        const artworkIds = artworks.map(a => a._id.toString());
        const totalInventory = artworks.length;

        // 2. Fetch all orders containing these artworks
        const orders = await Order.find({ "orderItems.artworkId": { $in: artworkIds } });

        // 3. Process Data
        let totalSales = 0;
        let totalRevenue = 0;
        const salesByDate = {}; // { "YYYY-MM-DD": revenue }
        const salesByCategory = {}; // { "Oil": count, "Digital": count }
        const recentSales = [];

        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];

            order.orderItems.forEach(item => {
                if (artworkIds.includes(item.artworkId.toString())) {
                    const qty = item.quantity || 1; // Safely handle quantity
                    totalSales += qty;
                    totalRevenue += (item.price * qty);

                    // Sales Trend
                    salesByDate[date] = (salesByDate[date] || 0) + (item.price * qty);

                    // Category Stats (Find artwork to get medium/style)
                    const art = artworks.find(a => a._id.toString() === item.artworkId.toString());
                    if (art) {
                        const cat = art.medium || 'Other';
                        salesByCategory[cat] = (salesByCategory[cat] || 0) + qty;
                    }

                    // Flatten for Recent Sales (Optional, can duplicate if order has multiple items)
                    // A simple way to just show distinct sale events
                }
            });

            // Add to recent sales list if it contains artist's work
            const relevantItems = order.orderItems.filter(item => artworkIds.includes(item.artworkId.toString()));
            if (relevantItems.length > 0) {
                recentSales.push({
                    id: order._id,
                    title: relevantItems.map(i => i.title).join(', '),
                    price: relevantItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0),
                    date: order.createdAt
                });
            }
        });

        // 4. Format Graphs Data
        const salesTrend = Object.keys(salesByDate).sort().map(date => ({
            date,
            revenue: salesByDate[date]
        }));

        const categoryDist = Object.keys(salesByCategory).map(cat => ({
            name: cat,
            value: salesByCategory[cat]
        }));

        // Sort recent sales
        recentSales.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            totalRevenue,
            totalSales,
            totalInventory,
            recentSales: recentSales.slice(0, 5),
            salesTrend,
            categoryDist
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artists/reviews
// @desc    Get all reviews for the current artist's artworks
// @access  Private (Artist)
router.get('/reviews', protect, artistOnly, async (req, res) => {
    try {
        const artistId = req.user._id;

        // Find all artworks by this artist
        const artworks = await Artwork.find({ artistId }).select('_id title images');
        const artworkIds = artworks.map(a => a._id);

        // Find reviews for these artworks
        const Review = require('../models/Review');
        const reviews = await Review.find({ artworkId: { $in: artworkIds } })
            .populate('userId', 'name')
            .populate('artworkId', 'title images') // Populate artwork details for context
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
