import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/Auth.css';

const Checkout = () => {
    const [address, setAddress] = useState({
        line1: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress({ ...address, [name]: value });

        // Real-time validation
        let errors = { ...formErrors };
        if (!value.trim()) {
            errors[name] = "Enter this field";
        } else {
            delete errors[name];
        }

        // Specific checks
        if (name === 'postalCode' && value.trim()) {
            if (!/^\d{6,10}$/.test(value)) { // Basic postal check
                errors.postalCode = "Enter a valid postal code";
            } else {
                delete errors.postalCode;
            }
        }

        setFormErrors(errors);
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

    const handlePayment = async (e) => {
        e.preventDefault();

        // Validate all fields
        const errors = {};
        if (!address.line1.trim()) errors.line1 = "Enter this field";
        if (!address.city.trim()) errors.city = "Enter this field";
        if (!address.postalCode.trim()) errors.postalCode = "Enter this field";
        else if (!/^\d{6,10}$/.test(address.postalCode)) errors.postalCode = "Enter a valid postal code";
        if (!address.country.trim()) errors.country = "Enter this field";

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // Save Address
        const shippingAddress = {
            address: address.line1,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country
        };
        localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));

        // Start Razorpay Payment Flow
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load.');
            return;
        }

        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartItems.length === 0) {
            alert('Cart is empty');
            return;
        }

        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

        try {
            setLoading(true);
            // 1. Create Order
            const { data } = await api.post('/orders', {
                orderItems: cartItems.map(item => ({
                    artworkId: item._id,
                    title: item.title,
                    price: item.price,
                    image: item.images[0],
                    quantity: item.quantity || 1
                })),
                shippingAddress,
                totalPrice
            });

            // 2. Fetch Key
            const keyRes = await api.get('/orders/razorpay-key');
            const razorpayKey = keyRes.data.key;

            // 3. Open Razorpay
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

                        // Redirect to success
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
            alert('Order creation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="auth-container">
            <h2>Shipping & Payment</h2>
            <form onSubmit={handlePayment} className="auth-form" noValidate>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Address Line 1</label>
                    <input
                        name="line1"
                        value={address.line1}
                        placeholder="Enter address"
                        onChange={handleChange}
                        className={formErrors.line1 ? 'input-error' : ''}
                    />
                    {formErrors.line1 && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.line1}</span>}
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>City</label>
                    <input
                        name="city"
                        value={address.city}
                        placeholder="Enter city"
                        onChange={handleChange}
                        className={formErrors.city ? 'input-error' : ''}
                    />
                    {formErrors.city && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.city}</span>}
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Postal Code</label>
                    <input
                        name="postalCode"
                        value={address.postalCode}
                        placeholder="Enter postal code"
                        onChange={handleChange}
                        className={formErrors.postalCode ? 'input-error' : ''}
                    />
                    {formErrors.postalCode && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.postalCode}</span>}
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Country</label>
                    <input
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        placeholder="Enter country"
                        className={formErrors.country ? 'input-error' : ''}
                    />
                    {formErrors.country && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.country}</span>}
                </div>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Processing...' : 'Proceed to Pay'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;
