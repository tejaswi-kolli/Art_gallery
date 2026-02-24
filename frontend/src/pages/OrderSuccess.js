import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <h2>No Order Found</h2>
                <Link to="/" className="btn">Go Home</Link>
            </div>
        );
    }

    const { shippingAddress, orderItems, paymentId, amount, createdAt, _id } = order;

    return (
        <div className="invoice-container">
            <div className="invoice-header">
                <div className="invoice-logo">Arthub Invoice</div>
                <div className="invoice-meta">
                    <p>Order ID: #{_id.slice(-8).toUpperCase()}</p>
                    <p>Date: {new Date(createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="invoice-details">
                <div className="section">
                    <h3>Billed To:</h3>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.country}</p>
                </div>
                <div className="section">
                    <h3>Payment Info:</h3>
                    <p>Status: <span className="status-badge paid">PAID</span></p>
                    <p><strong>Total:</strong> ₹{order.amount}</p>
                    <p>Transaction ID: {paymentId}</p>
                    <p>Method: Online (Razorpay)</p>
                </div>
            </div>

            <table className="invoice-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Artist</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {orderItems.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <div className="item-cell">
                                    {item.title}
                                </div>
                            </td>
                            <td>Artist (Ref ID: {item.artworkId.slice(-4)})</td>
                            <td>₹{item.price}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                        <td className="total-amount">₹{amount}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="invoice-footer">
                <p>Thank you for your purchase!</p>
                <div className="invoice-actions">
                    <button className="btn btn-outline" onClick={() => window.print()}>Print Invoice</button>
                    <Link to="/" className="btn">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
