const mongoose = require('mongoose');

const artworkSchema = mongoose.Schema({
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    medium: { type: String, required: true }, // e.g., Oil, Acrylic, Digital
    style: { type: String, required: true }, // e.g., Abstract, Realism
    images: [{ type: String, required: true }],
    available: { type: Boolean, default: true },
    quantity: { type: Number, default: 1 }, // Inventory Count
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who collaborated
    rating: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 }
}, { timestamps: true });

const Artwork = mongoose.model('Artwork', artworkSchema);
module.exports = Artwork;
