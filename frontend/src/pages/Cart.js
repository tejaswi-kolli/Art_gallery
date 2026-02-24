import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api'; // Import API
import { useToast } from '../context/ToastContext'; // Import Toast
import '../styles/Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const { showToast } = useToast(); // Use Toast

    useEffect(() => {
        const fetchLatestStock = async () => {
            const localItems = JSON.parse(localStorage.getItem('cart')) || [];

            if (localItems.length === 0) {
                setCartItems([]);
                return;
            }

            try {
                // Fetch fresh details for all items in parallel
                const updatedItems = await Promise.all(localItems.map(async (item) => {
                    try {
                        const { data } = await api.get(`/artworks/${item._id}`);
                        // Update maxStock from fresh data (Just for reference/sold out check, not limit)
                        const freshMaxStock = data.quantity !== undefined ? Number(data.quantity) : 1;

                        const validQuantity = Number(item.quantity) || 1;
                        // REMOVED CAP LOGIC

                        return {
                            ...item,
                            ...data,
                            quantity: validQuantity,
                            maxStock: freshMaxStock
                        };
                    } catch (error) {
                        return item;
                    }
                }));

                setCartItems(updatedItems);
                localStorage.setItem('cart', JSON.stringify(updatedItems));
            } catch (error) {
                console.error('Error refreshing cart:', error);
                setCartItems(localItems);
            }
        };

        fetchLatestStock();
    }, []);

    const updateQuantity = (id, delta) => {
        const newItems = cartItems.map(item => {
            if (item._id === id) {
                const currentQty = Number(item.quantity) || 1;
                // REMOVED MAX STOCK CHECK

                const newQty = currentQty + delta;
                return { ...item, quantity: newQty < 1 ? 1 : newQty };
            }
            return item;
        });
        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeFromCart = (id) => {
        const newItems = cartItems.filter(item => item._id !== id);
        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    };

    const checkoutHandler = () => {
        // Only check if sold out (quantity === 0 or similar indicator if backend provides)
        // Ignoring limits
        navigate('/checkout');
    };

    return (
        <div className="cart-container">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. <Link to="/">Go Shopping</Link></p>
            ) : (
                <div className="cart-items">
                    {cartItems.map(item => {
                        const isExternal = item.images && item.images[0]?.startsWith('http');
                        const imageUrl = item.images && item.images.length > 0
                            ? (isExternal ? item.images[0] : `http://localhost:5000/${item.images[0].replace(/\\/g, '/')}`)
                            : 'https://via.placeholder.com/100';

                        return (
                            <div key={item._id} className="cart-item">
                                <img
                                    src={imageUrl}
                                    alt={item.title}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                />
                                <div className="item-details">
                                    <Link to={`/artwork/${item._id}`}>{item.title}</Link>
                                    <p>₹{item.price}</p>
                                </div>

                                <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 20px' }}>
                                    <button onClick={() => updateQuantity(item._id, -1)} className="btn-sm" style={{ padding: '2px 8px' }}>-</button>
                                    <span>{item.quantity || 1}</span>
                                    <button onClick={() => updateQuantity(item._id, 1)} className="btn-sm" style={{ padding: '2px 8px' }}>+</button>
                                </div>

                                <button onClick={() => removeFromCart(item._id)} className="btn btn-sm btn-danger">Remove</button>
                            </div>
                        );
                    })}
                    <div className="cart-summary">
                        <h3>Total: ₹{calculateTotal()}</h3>
                        <button onClick={checkoutHandler} className="btn">Proceed to Checkout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
