const mongoose = require('mongoose');

const globalMessageSchema = mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true }, // Store name snapshot
    message: { type: String, required: true },
    room: { type: String, default: 'artist_global' },
    timestamp: { type: String } // Store formatted time string if needed, or use createdAt
}, { timestamps: true });

const GlobalMessage = mongoose.model('GlobalMessage', globalMessageSchema);
module.exports = GlobalMessage;
