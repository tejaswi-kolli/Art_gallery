import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Added imports
import api from '../api/api';
import '../styles/Auth.css'; // Borrowing auth styles for the form

const AccountSettings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Toggle States
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUser({ name: userInfo.name, email: userInfo.email });

        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
        if (!pwdRegex.test(passwords.newPassword)) {
            setError('New Password must have 1 uppercase, 1 lowercase, 1 special char');
            return;
        }

        try {
            await api.put('/auth/update-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            setMessage('Password changed successfully! Please login again.');

            // Logout and Redirect - Clear ALL user data
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('cart');
                // Dispatch storage event to force TopBar to update
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('cartUpdated'));
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        }
    };

    const handleViewInvoice = (order) => {
        // Navigate to OrderSuccess page which acts as Invoice View
        navigate('/success', { state: { order } });
    };

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [reviewItem, setReviewItem] = useState(null); // Item being reviewed
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

    const openReviewList = (order) => {
        setSelectedOrderForReview(order);
        setReviewItem(null); // specific item not yet selected
        setShowReviewModal(true);
        setReviewSuccess('');
        setReviewError('');
    };

    const openReviewForm = (item) => {
        setReviewItem(item);
        setRating(5);
        setComment('');
        setReviewError('');
    };

    const submitReview = async (e) => {
        e.preventDefault();
        console.log('Submitting review for item:', reviewItem); // DEBUG
        if (!reviewItem) return;

        // Safer ID extraction in case of population
        const artId = (typeof reviewItem.artworkId === 'object' && reviewItem.artworkId !== null)
            ? reviewItem.artworkId._id
            : reviewItem.artworkId;

        console.log(`Submitting to: /artworks/${artId}/reviews`); // DEBUG

        try {
            const res = await api.post(`/artworks/${artId}/reviews`, {
                rating,
                comment
            });
            console.log('Review submitted:', res.data); // DEBUG
            setReviewSuccess('Review submitted successfully!');
            setTimeout(() => {
                setReviewItem(null); // Go back to list
                setReviewSuccess('');
            }, 2000);
        } catch (error) {
            console.error('Review submission error:', error); // DEBUG
            console.log('Error response:', error.response); // DEBUG

            const serverMessage = error.response?.data?.message;
            const debugInfo = error.response?.data?.debug ? JSON.stringify(error.response.data.debug) : '';

            setReviewError(serverMessage ? `${serverMessage} ${debugInfo}` : `Failed: ${error.message}`);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '900px', marginTop: '50px' }}>
            {/* Only show Tabs for non-artists (who have multiple tabs) */}
            {localStorage.getItem('role') !== 'artist' && (
                <div className="tabs" style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '10px 0',
                            borderBottom: activeTab === 'profile' ? '2px solid var(--accent-primary)' : 'none',
                            color: activeTab === 'profile' ? '#ffffff' : '#f1eeeeff',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Change Password
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '10px 0',
                            borderBottom: activeTab === 'orders' ? '2px solid var(--accent-primary)' : 'none',
                            color: activeTab === 'orders' ? '#ffffff' : '#ffffff',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Order History
                    </button>
                </div>
            )}

            {activeTab === 'profile' && (
                <>
                    {/* Just the Form with constrained width and a small heading */}
                    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                        <h4 style={{ marginBottom: '25px', color: '#ffffff', fontWeight: '600' }}>Change Password</h4>

                        {message && <div style={{ color: '#4caf50', marginBottom: '15px' }}>{message}</div>}
                        {error && <div style={{ color: '#f44336', marginBottom: '15px' }}>{error}</div>}

                        <form onSubmit={handleUpdatePassword} className="auth-form">
                            <div className="form-group">
                                <label style={{color:'#fff'}}>Current Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwords.currentPassword}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                        style={{ padding: '10px' }} // Slightly smaller input padding
                                    />
                                    <span className="password-toggle-icon" onClick={() => setShowCurrent(!showCurrent)}>
                                        {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{color:'#fff'}}>New Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                        style={{ padding: '10px' }}
                                    />
                                    <span className="password-toggle-icon" onClick={() => setShowNew(!showNew)}>
                                        {showNew ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{color:'#fff'}}>Confirm New Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwords.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '10px' }}
                                    />
                                    <span className="password-toggle-icon" onClick={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className="btn" style={{ padding: '10px', marginTop: '10px' }}>Update Password</button>
                        </form>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <div className="order-history-section">
                    {ordersLoading ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Order ID</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Items</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>#{order._id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '10px' }}>₹{order.amount}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: order.status === 'Paid' || order.status === 'Delivered' ? '#e8f5e9' : '#fff3cd',
                                                color: order.status === 'Paid' || order.status === 'Delivered' ? '#2e7d32' : '#f57f17',
                                                fontWeight: 'bold',
                                                fontSize: '0.85em'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>{order.orderItems.length} items</td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleViewInvoice(order)}
                                                className="btn-sm btn-outline"
                                                style={{ fontSize: '0.8rem', padding: '4px 10px',color:'#fff' }}
                                            >
                                                Invoice
                                            </button>
                                            <button
                                                onClick={() => openReviewList(order)}
                                                className="btn-sm"
                                                style={{ fontSize: '0.8rem', padding: '4px 10px', opacity: ['Paid', 'Shipped', 'Delivered'].includes(order.status) ? 1 : 0.5 }}
                                                disabled={!['Paid', 'Shipped', 'Delivered'].includes(order.status)}
                                                title={!['Paid', 'Shipped', 'Delivered'].includes(order.status) ? "Payment must be completed to review" : "Review purchased items"}
                                            >
                                                Review Items
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowReviewModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>

                        {!reviewItem ? (
                            <>
                                <h3>Select Item to Review</h3>
                                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {selectedOrderForReview?.orderItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#181212ff', borderRadius: '6px' }}>
                                            <span style={{ fontWeight: '500' }}>{item.title}</span>
                                            <button onClick={() => openReviewForm(item)} className="btn-sm" style={{ padding: '5px 10px' }}>Rate</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Review: {reviewItem.title}</h3>
                                {reviewSuccess ? (
                                    <div style={{ color: 'green', margin: '20px 0', textAlign: 'center' }}>{reviewSuccess}</div>
                                ) : (
                                    <form onSubmit={submitReview} style={{ marginTop: '20px' }}>
                                        {reviewError && <div style={{ color: 'red', marginBottom: '10px' }}>{reviewError}</div>}

                                        <div className="form-group">
                                            <label>Rating</label>
                                            <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        style={{ color: star <= rating ? '#f5c518' : '#ddd' }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Comment</label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                                placeholder="Share your thoughts..."
                                                style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                            <button type="button" onClick={() => setReviewItem(null)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Back</button>
                                            <button type="submit" className="btn" style={{ flex: 1, padding: '10px' }}>Submit Review</button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;
