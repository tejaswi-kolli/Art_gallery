const express = require('express');
const Artwork = require('../models/Artwork');
const ArtistProfile = require('../models/ArtistProfile');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/search
// @desc    Global search (Artists and Artworks)
// @access  Public
router.get('/', async (req, res) => {
    const { q, type } = req.query; // q=query, type=artist|artwork|all

    try {
        let results = {};

        if (type === 'artwork' || type === 'all' || !type) {
            results.artworks = await Artwork.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { style: { $regex: q, $options: 'i' } }
                ]
            }).populate('artistId', 'name');
        }

        if (type === 'artist' || type === 'all' || !type) {
            // Find users with role artist matching name
            const artists = await User.find({
                role: 'artist',
                name: { $regex: q, $options: 'i' }
            }).select('_id name email');

            // Get their profiles
            const artistIds = artists.map(a => a._id);
            results.artists = await ArtistProfile.find({ userId: { $in: artistIds } }).populate('userId', 'name');
        }

        res.json(results);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
