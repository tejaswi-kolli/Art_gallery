import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/Payment.css';
import { FaMobileAlt, FaCreditCard, FaUniversity, FaQrcode } from 'react-icons/fa';

const Payment = () => {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking
    const [upiApp, setUpiApp] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const navigate = useNavigate();

    // Mock Card State
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

    useEffect(() => {
        if (showQR && timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [showQR, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        // Validation based on method
        if (paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.cvv) {
                alert('Please enter valid card details');
                return;
            }
        }
        if (paymentMethod === 'upi' && !upiApp && !showQR) {
            alert('Please select a UPI app or generate QR');
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load.');
            return;
        }

        // 1. Create Order
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartItems.length === 0) {
            alert('Cart is empty');
            return;
        }

        const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);
        const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));

        if (!shippingAddress) {
            alert('Shipping address missing');
            navigate('/checkout');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/orders', {
                orderItems: cartItems.map(item => ({
                    artworkId: item._id,
                    title: item.title,
                    price: item.price,
                    image: item.images[0]
                })),
                shippingAddress,
                totalPrice
            });

            // 2. Open Razorpay
            // Fetch Key from Backend
            const keyRes = await api.get('/orders/razorpay-key');
            const razorpayKey = keyRes.data.key;

            const options = {
                key: razorpayKey,
                amount: data.createdOrder.amount * 100,
                currency: 'INR',
                name: 'Arthub',
                description: 'Artwork Purchase',
                image: 'https://via.placeholder.com/150', // Logo
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/orders/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            db_order_id: data.createdOrder._id
                        });

                        // Clear cart
                        localStorage.removeItem('cart');

                        // Redirect to success with Order Details
                        navigate('/success', { state: { order: verifyRes.data.order } });

                    } catch (error) {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: 'Arthub User',
                    email: 'user@arthub.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#2c3e50'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('Order creation failed');
        }
    };

    return (
        <div className="payment-page-container">
            <div className="payment-wrapper">
                <h2>Select Payment Method</h2>

                <div className="payment-tabs">
                    <button
                        className={`tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('upi')}
                    >
                        <FaMobileAlt /> UPI
                    </button>
                    <button
                        className={`tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <FaCreditCard /> Card
                    </button>
                    <button
                        className={`tab-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('netbanking')}
                    >
                        <FaUniversity /> Netbanking
                    </button>
                </div>

                <div className="payment-content">
                    {/* UPI Section */}
                    {paymentMethod === 'upi' && (
                        <div className="method-section">
                            <h3>UPI Payment</h3>
                            <p>Select App or Scan QR</p>

                            <div className="upi-options">
                                <div
                                    className={`upi-app ${upiApp === 'gpay' ? 'selected' : ''}`}
                                    onClick={() => { setUpiApp('gpay'); setShowQR(false); }}
                                >
                                    Google Pay
                                </div>
                                <div
                                    className={`upi-app ${upiApp === 'phonepe' ? 'selected' : ''}`}
                                    onClick={() => { setUpiApp('phonepe'); setShowQR(false); }}
                                >
                                    PhonePe
                                </div>
                            </div>

                            <div className="qr-section">
                                <button className="btn-outline btn-sm" onClick={() => setShowQR(!showQR)}>
                                    {showQR ? 'Hide QR' : 'Generate QR Code'}
                                </button>

                                {showQR && (
                                    <div className="qr-display">
                                        <FaQrcode size={100} />
                                        <p>Scan with any UPI App</p>
                                        <p className="timer">Time remaining: {formatTime(timer)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Card Section */}
                    {paymentMethod === 'card' && (
                        <div className="method-section">
                            <h3>Credit / Debit Card</h3>
                            <div className="form-group">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    maxLength="16"
                                    value={cardDetails.number}
                                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                />
                            </div>
                            <div className="card-row">
                                <div className="form-group">
                                    <label>Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        placeholder="123"
                                        maxLength="3"
                                        value={cardDetails.cvv}
                                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Netbanking Section */}
                    {paymentMethod === 'netbanking' && (
                        <div className="method-section">
                            <h3>Netbanking</h3>
                            <div className="form-group">
                                <label>Select Bank</label>
                                <select>
                                    <option>HDFC Bank</option>
                                    <option>SBI</option>
                                    <option>ICICI Bank</option>
                                    <option>Axis Bank</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pay-action">
                        <button onClick={handlePayment} disabled={loading} className="btn btn-block">
                            {loading ? 'Processing...' : 'Proceed to Pay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
