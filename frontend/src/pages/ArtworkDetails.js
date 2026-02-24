import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import '../styles/Artwork.css'; // Reuse existing or create specific

const ArtworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [artwork, setArtwork] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + artwork.images.length) % artwork.images.length);
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch Artwork
                const artRes = await api.get(`/artworks/${id}`);
                setArtwork(artRes.data);
                // No need to set selectedImage, using index

                // Fetch Reviews
                const reviewRes = await api.get(`/artworks/${id}/reviews`);
                setReviews(reviewRes.data);
            } catch (error) {
                console.error('Error fetching details:', error);

            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const addToCart = () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item._id === artwork._id);

        if (existingItemIndex > -1) {
            const currentQty = cart[existingItemIndex].quantity || 1;
            const maxStock = artwork.quantity || 1;

            // REMOVED CHECK: if (currentQty < maxStock)
            cart[existingItemIndex].quantity = currentQty + 1;
            cart[existingItemIndex].maxStock = maxStock; // Update maxStock
            showToast('Item quantity updated', 'success');
        } else {
            cart.push({ ...artwork, quantity: 1, maxStock: Number(artwork.quantity) || 1 });
            showToast('Item added to cart', 'success');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Masterpiece...</div>;
    if (!artwork) return <div style={{ padding: '50px', textAlign: 'center' }}>Artwork not found.</div>;

    // Helper for Image URLs
    const getImageUrl = (path) => path.startsWith('http') ? path : `http://localhost:5000/${path}`;

    return (
        <div className="artwork-details-page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                {/* 1. Image Carousel */}
                <div className="gallery-section" style={{ flex: '1 1 500px' }}>
                    <div className="carousel-container">
                        {artwork.images.length > 1 && (
                            <button className="carousel-arrow left" onClick={prevImage}>&#10094;</button>
                        )}
                        <div className="carousel-slide">
                            <img
                                src={getImageUrl(artwork.images[currentImageIndex])}
                                alt={artwork.title}
                                className="carousel-image"
                            />
                        </div>
                        {artwork.images.length > 1 && (
                            <button className="carousel-arrow right" onClick={nextImage}>&#10095;</button>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {artwork.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', justifyContent: 'center' }}>
                            {artwork.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={getImageUrl(img)}
                                    alt={`View ${idx}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    style={{
                                        width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                                        border: currentImageIndex === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        opacity: currentImageIndex === idx ? 1 : 0.6
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Info Section */}
                <div className="info-section" style={{ flex: '1 1 400px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>{artwork.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>by <strong>{artwork.artistId?.name}</strong></p>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '20px' }}>
                        ₹{artwork.price}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ lineHeight: '1.6', color: '#444' }}>{artwork.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                        <div><strong>Medium:</strong> {artwork.medium}</div>
                        <div><strong>Style:</strong> {artwork.style}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn" onClick={() => {
                                const token = localStorage.getItem('token');
                                if (!token) { navigate('/login'); return; }
                                addToCart();
                                navigate('/cart');
                            }} style={{ flex: 1, padding: '15px' }}>
                                Buy Now
                            </button>
                            <button className="btn btn-outline" onClick={() => {
                                const token = localStorage.getItem('token');
                                if (!token) { navigate('/login'); return; }
                                addToCart();
                            }} style={{ flex: 1, padding: '15px' }}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Reviews Section */}
            <div className="reviews-section" style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                <h3>Customer Reviews ({reviews.length})</h3>

                {reviews.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>No reviews yet. Be the first to review this masterpiece!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                        {reviews.map(review => (
                            <div key={review._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong>{review.userId?.name}</strong>
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ color: '#f5c518', marginBottom: '10px' }}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <p style={{ color: '#555' }}>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtworkDetails;
