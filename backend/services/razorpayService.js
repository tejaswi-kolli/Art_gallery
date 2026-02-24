const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('Razorpay Configured with Key ID:', process.env.RAZORPAY_KEY_ID ? 'Exists' : 'MISSING');


const createOrder = async (amount, currency = 'INR') => {
    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: `receipt_order_${Date.now()}`,
    };
    try {
        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        console.error("Razorpay Error:", error);
        throw error;
    }
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};

module.exports = { createOrder, verifyPaymentSignature };
