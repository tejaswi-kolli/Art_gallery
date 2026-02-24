const express = require('express');
const Artwork = require('../models/Artwork');
const Review = require('../models/Review');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { protect, artistOnly } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/artworks
// @desc    Get all artworks with advanced search and filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { keyword, medium, minPrice, maxPrice } = req.query;

        console.log('\n--- SEARCH REQUEST (SIMPLIFIED) ---');
        console.log('Query Params:', req.query);

        let query = {};

        // 1. Keyword Search (Global Search Bar)
        if (keyword) {
            const keywordRegex = { $regex: keyword, $options: 'i' };

            // Find artists matching name
            const matchingArtists = await User.find({
                role: 'artist',
                name: keywordRegex
            }).select('_id');

            const artistIds = matchingArtists.map(a => a._id);

            // This $or condition block filters the base set of results
            query.$or = [
                { title: keywordRegex },
                { style: keywordRegex },
                { medium: keywordRegex },
                { artistId: { $in: artistIds } }
            ];
        }

        // 2. Specific Filters (Sidebar)
        // These are added as top-level properties, creating an implicit AND with the $or above.

        if (medium) {
            query.medium = { $regex: medium, $options: 'i' };
        }

        if (req.query.style) {
            query.style = { $regex: req.query.style, $options: 'i' };
        }

        if (req.query.artist) {
            const artistRegex = { $regex: req.query.artist, $options: 'i' };
            const specificArtists = await User.find({
                role: 'artist',
                name: artistRegex
            }).select('_id');
            const specificArtistIds = specificArtists.map(a => a._id);

            if (specificArtistIds.length === 0) {
                // Filter active but no artist found -> return nothing
                // Use a non-existent ID to force 0 results
                query.artistId = "000000000000000000000000";
            } else {
                query.artistId = { $in: specificArtistIds };
            }
        }

        // 3. Price Filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        console.log('Final Query:', JSON.stringify(query, null, 2));

        const artworks = await Artwork.find(query).populate('artistId', 'name');
        res.json(artworks);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artworks/suggestions
// @desc    Get related artwork suggestions (random or based on style)
// @access  Public
router.get('/suggestions', async (req, res) => {
    try {
        const suggestions = await Artwork.aggregate([{ $sample: { size: 3 } }]);
        await User.populate(suggestions, { path: 'artistId', select: 'name' });
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artworks/:id
// @desc    Get single artwork by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id).populate('artistId', 'name email');
        if (artwork) {
            res.json(artwork);
        } else {
            res.status(404).json({ message: 'Artwork not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/artworks/:id
// @desc    Update artwork details
// @access  Private (Artist/Owner)
router.put('/:id', protect, artistOnly, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (artwork.artistId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this artwork' });
        }

        const { title, description, price, medium, style } = req.body;

        artwork.title = title || artwork.title;
        artwork.description = description || artwork.description;
        artwork.price = price || artwork.price;
        artwork.medium = medium || artwork.medium;
        artwork.style = style || artwork.style;

        const updatedArtwork = await artwork.save();
        res.json(updatedArtwork);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/artworks/:id
// @desc    Delete artwork
// @access  Private (Artist/Owner)
router.delete('/:id', protect, artistOnly, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (artwork.artistId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this artwork' });
        }

        await Artwork.deleteOne({ _id: artwork._id });
        res.json({ message: 'Artwork removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/artworks/:id/reviews
// @desc    Get reviews for an artwork
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ artworkId: req.params.id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/artworks/:id/reviews
// @desc    Create a review (Verified Purchase only)
// @access  Private (Buyer)
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const artworkId = req.params.id;
        const userId = req.user._id;

        const Order = require('../models/Order');
        const hasPurchased = await Order.findOne({
            buyerId: userId,
            'orderItems.artworkId': artworkId,
            status: { $in: ['Paid', 'Shipped', 'Delivered'] }
        });

        if (!hasPurchased) {
            const anyOrder = await Order.findOne({ buyerId: userId, 'orderItems.artworkId': artworkId });
            if (anyOrder) {
                return res.status(403).json({
                    message: `Cannot review: Order status is '${anyOrder.status}'. Must be Paid, Shipped, or Delivered.`,
                    debug: { orderId: anyOrder._id, status: anyOrder.status }
                });
            } else {
                return res.status(403).json({
                    message: 'Purchase verification failed. No order found for this item.',
                    debug: { artworkId, userId }
                });
            }
        }

        const existingReview = await Review.findOne({ artworkId, userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this artwork.' });
        }

        const review = await Review.create({
            artworkId,
            userId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
