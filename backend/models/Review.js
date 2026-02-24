const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    artworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Prevent multiple reviews for same artwork by same user
reviewSchema.index({ artworkId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
