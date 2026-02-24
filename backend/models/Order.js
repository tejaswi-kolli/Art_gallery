const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
            title: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    amount: { type: Number, required: true },
    paymentId: { type: String }, // Razorpay payment ID
    status: { type: String, default: 'Pending' }, // Pending, Paid, Shipped, Delivered
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
