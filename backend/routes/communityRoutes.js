const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');

// @route   GET /api/community/posts/:type
// @desc    Get posts by type (collaboration, tip)
// @access  Public (or Private? Let's keep public for visibility, but creation is private)
router.get('/posts/:type', async (req, res) => {
    try {
        const posts = await CommunityPost.find({ type: req.params.type })
            .populate('author', 'name role')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/community/posts
// @desc    Create a new community post
// @access  Private
const upload = require('../middleware/upload');

router.post('/posts', protect, upload.single('image'), async (req, res) => {
    const { type, title, content } = req.body;
    try {
        const post = new CommunityPost({
            author: req.user._id,
            type,
            title,
            content,
            image: req.file ? 'uploads/' + req.file.filename : null
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/community/posts/:id
// @desc    Delete a community post
// @access  Private (Only author can delete)
router.delete('/posts/:id', protect, async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await CommunityPost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
