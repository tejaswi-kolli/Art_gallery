const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const upload = require('../middleware/upload');
const { sendWelcomeEmail } = require('../services/emailService'); // Import Email Service
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Buyer or Artist)
// @access  Public
// Helper for validation
const validateInput = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email address format';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return null;
};

// @route   POST /api/auth/register
// @desc    Register a new user (Buyer or Artist)
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Format Validation
    const validationError = validateInput(email, password);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        // Case insensitive check
        const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email, // Save as provided, but matching is case-insensitive
            password,
            role,
            isVerified: true // User Requirement: Immediate Login
        });

        if (user) {
            // Send Welcome Email
            sendWelcomeEmail(user).catch(err => console.error('Email Error:', err));

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/register-artist
// @desc    Register a new Artist
// @access  Public
router.post('/register-artist', upload.single('portfolio'), async (req, res) => {
    const { name, email, password, bio } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create User
        const user = await User.create({
            name,
            email,
            password,
            role: 'artist',
            isVerified: true
        });

        if (user) {
            // Send Welcome Email
            sendWelcomeEmail(user).catch(err => console.error('Email Error:', err));

            // Create Artist Profile
            await ArtistProfile.create({
                userId: user._id,
                bio,
                portfolio: req.file ? ['uploads/' + req.file.filename] : [] // Store uploaded file relative path
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Artist Reg Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Case insensitive check
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (user && (await user.matchPassword(password))) {
            // Disabled strict verification check as requested for simpler flow
            // if (!user.isVerified) ... 

            let profileImage = null;
            if (user.role === 'artist') {
                const profile = await ArtistProfile.findOne({ userId: user._id });
                if (profile && profile.profileImage) {
                    profileImage = profile.profileImage.replace(/\\/g, '/'); // Normalize path
                }
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear token
        await user.save();

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
const { protect } = require('../middleware/auth'); // Ensure middleware is imported

router.put('/update-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // Will be hashed by pre-save hook
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
