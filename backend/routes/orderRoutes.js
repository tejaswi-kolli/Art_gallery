const express = require('express');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const User = require('../models/User'); // Added User import
const { createOrder, verifyPaymentSignature } = require('../services/razorpayService');
const { sendOrderConfirmation } = require('../services/emailService'); // Added Email Service
const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (Initialize Payment)
// @access  Private
router.post('/', protect, async (req, res) => {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else {
        try {
            // 1. Create Razorpay Order
            const paymentOrder = await createOrder(totalPrice);

            // 2. Save Order in DB with status 'Pending'
            const order = new Order({
                buyerId: req.user._id,
                orderItems,
                amount: totalPrice,
                shippingAddress,
                paymentId: paymentOrder.id // Storing Razorpay Order ID initially
            });

            const createdOrder = await order.save();

            res.status(201).json({ createdOrder, razorpayOrderId: paymentOrder.id });
        } catch (error) {
            console.error('Order Route Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
});

// @route   POST /api/orders/verify
// @desc    Verify Razorpay Payment
// @access  Private
router.post('/verify', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = req.body;

    try {
        const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            const order = await Order.findById(db_order_id);
            if (order) {
                order.paymentId = razorpay_payment_id;
                order.status = 'Paid';
                await order.save();

                // Loop through items to update quantity and availability
                for (const item of order.orderItems) {
                    const artwork = await Artwork.findById(item.artworkId);
                    if (artwork) {
                        const qtyPurchased = item.quantity || 1;
                        artwork.quantity -= qtyPurchased;
                        artwork.salesCount += qtyPurchased;

                        // Mark as sold out if quantity is exhausted
                        if (artwork.quantity <= 0) {
                            artwork.quantity = 0; // Prevent negative
                            artwork.available = false;
                        }

                        await artwork.save();
                    }
                }

                // Send Confirmation Email
                const buyer = await User.findById(order.buyerId);
                sendOrderConfirmation(order, buyer, order.orderItems).catch(err => console.error('Email Error:', err));

                res.json({ message: 'Payment verified', order });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/razorpay-key
// @desc    Get Razorpay Key ID
// @access  Public
router.get('/razorpay-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
