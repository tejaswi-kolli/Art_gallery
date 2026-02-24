import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import '../styles/Artwork.css';

const ArtworkCard = ({ artwork, showActions = true, artistName, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Check if image is local upload or external
    const images = artwork.images || [];
    
    
    const currentImage = images[currentImageIndex];
    
    
    const isExternal = currentImage && currentImage.startsWith('http');
    
    
    const imageUrl = currentImage
        ? (isExternal ? currentImage : `http://localhost:5000/${currentImage}`)
        : 'https://via.placeholder.com/300';
    console.log(imageUrl);
    
    
    const handleNextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const checkAuthAndAction = (action) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            action();
        }
    };

    const { showToast } = useToast();

    const addToCart = () => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item._id === artwork._id);

        if (existingItemIndex > -1) {
            // Increment duplicate WITHOUT LIMIT
            const currentQty = cart[existingItemIndex].quantity || 1;
            const maxStock = artwork.quantity || 1;

            // REMOVED CHECK: if (currentQty < maxStock)
            cart[existingItemIndex].quantity = currentQty + 1;
            cart[existingItemIndex].maxStock = maxStock;
            showToast('Item quantity updated', 'success');
        } else {
            // Add new with quantity and maxStock
            cart.push({ ...artwork, quantity: 1, maxStock: Number(artwork.quantity) || 1 });
            showToast('Item added to cart successfully', 'success');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        // Dispatch custom event for TopBar updates
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // User is logged in - add to cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item._id === artwork._id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
            showToast('Item quantity updated', 'success');
        } else {
            cart.push({ ...artwork, quantity: 1, maxStock: Number(artwork.quantity) || 1 });
            showToast('Item added to cart successfully', 'success');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // User is logged in - add to cart and go to checkout
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const exists = cart.find(item => item._id === artwork._id);
        if (!exists) {
            cart.push({ ...artwork, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        navigate('/cart');
    };

    return (
        <div className="artwork-card">
            <Link to={`/product/${artwork._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="artwork-image" style={{ position: 'relative' }}>
                    <img src={imageUrl} alt={artwork.title} />

                    {images.length > 1 && (
                        <>
                            <button
                                className="card-carousel-arrow left"
                                onClick={handlePrevImage}
                            >
                                &#8249;
                            </button>
                            <button
                                className="card-carousel-arrow right"
                                onClick={handleNextImage}
                            >
                                &#8250;
                            </button>
                        </>
                    )}
                </div>
            </Link>
            <div className="artwork-details">
                <Link to={`/product/${artwork._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{artwork.title}</h3>
                </Link>
                <p className="artist-name">
                    by {artistName || artwork.artistId?.name || 'Unknown'}
                    {artwork.collaborators && artwork.collaborators.length > 0 && (
                        <span> & {artwork.collaborators.map(c => c.name || c.email).join(' & ')}</span>
                    )}
                </p>
                <div className="artwork-meta">
                    <span>{artwork.medium}</span>
                    <span>{artwork.style}</span>
                </div>
                <div className="artwork-footer">
                    <span className="price">₹{artwork.price}</span>


                    {/* Management Actions (Owner triggers via props) */}
                    {(onEdit || onDelete) ? (
                        <div className="card-actions">
                            {onEdit && <button onClick={() => onEdit(artwork._id)} className="btn-sm">Edit</button>}
                            {onDelete && <button onClick={() => onDelete(artwork._id)} className="btn-sm btn-danger">Delete</button>}
                        </div>
                    ) : (
                        /* Buyer Actions (Default) */
                        showActions && (
                            <div className="card-actions">
                                <button onClick={handleBuyNow} className="btn-sm">Buy Now</button>
                                <button onClick={handleAddToCart} className="btn-sm btn-outline">Add to Cart</button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtworkCard;
