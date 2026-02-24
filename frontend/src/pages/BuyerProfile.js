import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/Home.css'; // Using standard styles

const BuyerProfile = () => {
    const [userInfo, setUserInfo] = useState({});
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('userInfo'));
                setUserInfo(user || {});

                // Fetch Orders (Assuming endpoint exists or using mock)
                // const { data } = await api.get('/orders/myorders');
                // setOrders(data);

                // MOCK DATA FOR DEMO
                setOrders([
                    { _id: 'ord_123', totalAmount: 450, status: 'Delivered', items: 2, createdAt: '2023-10-15' },
                    { _id: 'ord_124', totalAmount: 120, status: 'Processing', items: 1, createdAt: '2023-11-01' }
                ]);

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const navigate = useNavigate();

    // ... (useEffect remains same) ...

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Profile...</div>;

    return (
        <div className="container" style={{ padding: '50px 20px' }}>
            <div className="profile-header" style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>My Profile</h1>
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Role:</strong> Buyer</p>
                </div>
                <button
                    onClick={() => navigate('/community')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span>💬</span> Messages & Community
                </button>
            </div>

            <div className="order-history">
                <h2>Order History</h2>
                {orders.length === 0 ? (
                    <p>No orders found. <a href="/">Start exploring!</a></p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Date</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Items</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Total</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>#{order._id}</td>
                                    <td style={{ padding: '12px' }}>{order.createdAt}</td>
                                    <td style={{ padding: '12px' }}>{order.items}</td>
                                    <td style={{ padding: '12px' }}>${order.totalAmount}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: order.status === 'Delivered' ? '#d4edda' : '#fff3cd',
                                            color: order.status === 'Delivered' ? '#155724' : '#856404',
                                            fontSize: '0.85rem'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button className="btn-sm btn-secondary">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BuyerProfile;
