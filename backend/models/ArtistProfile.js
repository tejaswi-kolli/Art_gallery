const mongoose = require('mongoose');

const artistProfileSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String },
    portfolio: [{ type: String }], // Array of file paths
    profileImage: { type: String },
    socialLinks: {
        instagram: { type: String },
        twitter: { type: String },
        website: { type: String }
    }
}, { timestamps: true });

const ArtistProfile = mongoose.model('ArtistProfile', artistProfileSchema);
module.exports = ArtistProfile;
