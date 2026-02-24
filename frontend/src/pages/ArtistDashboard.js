import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import ArtworkCard from '../components/ArtworkCard'; // Reuse card or create row component
import '../styles/Home.css'; // Reuse or create Dashboard.css

const ArtistDashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [medium, setMedium] = useState('');
    const [style, setStyle] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [availability, setAvailability] = useState('all'); // 'all', 'available', 'sold'

    const [reviews, setReviews] = useState([]);

    const location = window.location;

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo || {});

        const fetchInventory = async () => {
            try {
                const { data } = await api.get('/artists/inventory');
                setInventory(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/artists/reviews');
                // Ensure data is an array
                setReviews(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };

        fetchInventory();
        fetchReviews();
    }, []);

    // Handle hash scrolling on mount/update
    React.useLayoutEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }, 100); // Small delay to ensure render
            }
        }
    }, [location.hash, inventory]); // Re-run when inventory loads to ensure element exists

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this artwork?')) {
            try {
                // Use standard REST path
                await api.delete(`/artworks/${id}`);
                // Remove from local state to update UI immediately
                setInventory(inventory.filter(item => item._id !== id));
            } catch (error) {
                console.error('Delete failed:', error.response?.data || error.message);
                alert('Failed to delete artwork: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/edit/${id}`);
    };

    // Advanced Filtering Logic
    const filterArtwork = (art) => {
        // 1. Search Term (Title)
        // 1. Search Term (Title, Medium, Style)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchTitle = art.title.toLowerCase().includes(term);
            const matchMedium = art.medium.toLowerCase().includes(term);
            const matchStyle = art.style.toLowerCase().includes(term);
            if (!matchTitle && !matchMedium && !matchStyle) return false;
        }

        // 2. Medium
        if (medium && !art.medium.toLowerCase().includes(medium.toLowerCase())) return false;

        // 3. Style
        if (style && !art.style.toLowerCase().includes(style.toLowerCase())) return false;

        // 4. Price Range
        if (minPrice && art.price < Number(minPrice)) return false;
        if (maxPrice && art.price > Number(maxPrice)) return false;

        // 5. Availability
        if (availability === 'available' && !art.available) return false;
        if (availability === 'sold' && art.available) return false;

        return true;
    };

    const myArtworks = inventory.filter(art => (art.artistId?._id === user._id || art.artistId === user._id) && filterArtwork(art));
    const collaborations = inventory.filter(art => (art.collaborators?.some(c => c._id === user._id || c === user._id)) && filterArtwork(art));

    return (
        <div className="dashboard-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* 1. Intro Section */}
            <div className="dashboard-intro" style={{
                marginBottom: '50px',
                textAlign: 'center',
                padding: '60px 20px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #2a081d 100%)',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(74, 15, 51, 0.2)'
            }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', marginBottom: '10px', fontWeight: 'normal', color: 'white' }}>
                    Welcome, {user.name?.split(' ')[0]}
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                    Your creative studio is ready. Manage your collection, engage with buyers, and track your growing influence.
                </p>
                <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <strong style={{ fontSize: '1.5rem', display: 'block' }}>{myArtworks.length}</strong>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>My Artworks</span>
                    </div>
                    <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <strong style={{ fontSize: '1.5rem', display: 'block' }}>{collaborations.length}</strong>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Collaborations</span>
                    </div>
                </div>
            </div>

            {/* 2. My Inventory Section with Integrated Search */}
            <div id="my-collection" className="inventory-section" style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', margin: 0 }}>My Collection</h3>

                    {/* Controls: Just the Filter Toggle (Search is Global) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {searchTerm && (
                            <span style={{ fontSize: '0.9rem', color: '#666', background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px' }}>
                                Searching: "{searchTerm}"
                            </span>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-outline"
                            style={{
                                padding: '8px 20px',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                borderRadius: '20px',
                                background: showFilters ? 'var(--accent-primary)' : 'transparent',
                                color: showFilters ? 'white' : 'var(--accent-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontWeight: '500'
                            }}
                        >
                            {showFilters ? 'Hide Filters' : 'Filter Options'}
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters Panel */}
                {showFilters && (
                    <div className="filters-panel fade-in" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '15px',
                        background: '#fff',
                        padding: '20px',
                        marginBottom: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: '1px solid #eee'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#888' }}>Medium</label>
                            <input type="text" placeholder="e.g. Oil" value={medium} onChange={(e) => setMedium(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#888' }}>Style</label>
                            <input type="text" placeholder="e.g. Abstract" value={style} onChange={(e) => setStyle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#888' }}>Min Price</label>
                            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#888' }}>Max Price</label>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'end' }}>
                            <button
                                onClick={() => { setMedium(''); setStyle(''); setMinPrice(''); setMaxPrice(''); setAvailability('all'); }}
                                style={{
                                    background: '#eee',
                                    color: '#333',
                                    padding: '8px 15px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontSize: '0.9rem',
                                    height: '35px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {myArtworks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '12px', border: '2px dashed #ddd' }}>
                        <p style={{ color: '#888', marginBottom: '20px', fontSize: '1.1rem' }}>Your studio is empty.</p>
                        <Link to="/dashboard/upload" className="btn">Upload Your First Masterpiece</Link>
                    </div>
                ) : (
                    <div className="grid-container">
                        {myArtworks.map(art => (
                            <div key={art._id} style={{ position: 'relative' }}>
                                <ArtworkCard
                                    artwork={art}
                                    showActions={false}
                                    artistName={user.name}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Collaborations Section */}
            {collaborations.length > 0 && (
                <div className="inventory-section" style={{ marginBottom: '60px' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '30px', fontSize: '1.8rem', color: 'var(--text-dark)' }}>My Collaborations</h3>
                    <div className="grid-container">
                        {collaborations.map(art => (
                            <div key={art._id} style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', top: '10px', left: '10px', zIndex: 10,
                                    background: '#333', color: 'white', padding: '4px 12px',
                                    borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase'
                                }}>
                                    Co-Authored
                                </div>
                                <ArtworkCard
                                    artwork={art}
                                    showActions={false}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Upload Section */}
            <div className="upload-callout" style={{
                marginBottom: '40px',
                padding: '40px',
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Ready to showcase something new?</h3>
                <p style={{ color: '#666', marginBottom: '25px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Expand your portfolio and reach more collectors by adding your latest creation to the gallery.
                </p>
                <Link to="/dashboard/upload" className="btn" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                    Upload New Artwork
                </Link>
            </div>

            {/* 6. Customer Reviews Section */}
            <div className="reviews-section" style={{ marginBottom: '60px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '30px', fontSize: '1.8rem', color: 'var(--text-dark)' }}>Customer Reviews</h3>
                {reviews.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>No reviews yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {reviews.map(review => (
                            <div key={review._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img
                                            src={review.artworkId?.images?.[0] ? (review.artworkId.images[0].startsWith('http') ? review.artworkId.images[0] : `http://localhost:5000/${review.artworkId.images[0]}`) : 'https://via.placeholder.com/50'}
                                            alt="art"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{review.artworkId?.title || 'Unknown Artwork'}</h4>
                                        <span style={{ fontSize: '0.9rem', color: '#f5c518' }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: '#555', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '10px' }}>"{review.comment}"</p>
                                <div style={{ fontSize: '0.8rem', color: '#999', textAlign: 'right' }}>
                                    — {review.userId?.name || 'Anonymous'}, {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 7. Analytics Section */}
            <div className="dashboard-footer" style={{
                padding: '40px',
                background: '#f8f5f6',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(74, 15, 51, 0.1)'
            }}>
                <h3 style={{ color: 'var(--accent-primary)' }}>Performance Insights</h3>
                <p style={{ marginBottom: '25px', color: '#666' }}>
                    Deep dive into your sales trends, audience engagement, and revenue growth.
                </p>
                <Link to="/dashboard/analytics" className="btn">
                    View Full Analytics
                </Link>
            </div>
        </div>
    );
};

export default ArtistDashboard;
