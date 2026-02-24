import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';
import ArtworkCard from '../components/ArtworkCard';
import HeroSection from '../components/HeroSection';
import AboutUs from './AboutUs';
import ArtistDashboard from './ArtistDashboard';
import '../styles/Home.css';
import { FaSearch, FaFilter } from 'react-icons/fa';

// Helper Component for Horizontal Scroll Rows with CSS Marquee
const ScrollRow = ({ title, artworks, id }) => {
    // Only duplicate for infinite scroll IF we have enough items
    const shouldInfiniteScroll = artworks && artworks.length >= 4;

    // CSS Marquee Logic
    // We duplicate the items TWICE (3 sets total) to ensure smooth infinite loop
    const displayArtworks = React.useMemo(() => {
        if (!artworks || artworks.length === 0) return [];
        if (!shouldInfiniteScroll) return artworks;
        return [...artworks, ...artworks, ...artworks]; // 3 sets
    }, [artworks, shouldInfiniteScroll]);

    if (!artworks || artworks.length === 0) return null;

    return (
        <section id={id} className={`collection-section ${!shouldInfiniteScroll ? 'static-list' : ''}`}>
            {/* Section Header */}
            <div style={{ padding: '0 50px', marginBottom: '1.5rem' }}>
                <h2 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
                    <span>{title}</span>
                    <span style={{
                        display: 'block',
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #913E4D, #D4AF37)',
                        marginTop: '10px',
                        borderRadius: '2px'
                    }}></span>
                </h2>
            </div>

            <div className="scroll-wrapper">
                {/* Fixed Overlay Arrow Removed based on feedback */}

                {/* Check if we should animate */}
                {shouldInfiniteScroll ? (
                    <div className="marquee-container">
                        <div className="marquee-track">
                            {displayArtworks.map((art, index) => (
                                <div
                                    key={`${art._id}-${index}`}
                                    className="scroll-card-item"
                                    style={{
                                        width: '300px',
                                        height: '480px'
                                    }}
                                >
                                    <ArtworkCard artwork={art} showActions={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Static List for few items
                    <div className="horizontal-scroll-container" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        padding: '0 50px'
                    }}>
                        {artworks.map((art) => (
                            <div
                                key={art._id}
                                style={{
                                    width: '300px',
                                    height: '480px',
                                    flex: '0 0 300px'
                                }}
                            >
                                <ArtworkCard artwork={art} showActions={true} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// Main Home Component
const Home = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams(); // Hook inside component

    // Filter State
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [medium, setMedium] = useState('');
    const [style, setStyle] = useState('');
    const [artist, setArtist] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [isSearchActive, setIsSearchActive] = useState(searchParams.get('search') === 'true');
    const [showFilters, setShowFilters] = useState(false);

    // Dropdown Constants
    const MEDIUM_OPTIONS = ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Charcoal', 'Photography', 'Sculpture'];
    const STYLE_OPTIONS = ['Abstract', 'Realism', 'Impressionism', 'Surrealism', 'Portrait', 'Landscape', 'Modern'];

    const [isCustomMedium, setIsCustomMedium] = useState(false);
    const [isCustomStyle, setIsCustomStyle] = useState(false);

    // Initial check if current values are custom
    useEffect(() => {
        if (medium && !MEDIUM_OPTIONS.includes(medium)) setIsCustomMedium(true);
        if (style && !STYLE_OPTIONS.includes(style)) setIsCustomStyle(true);
    }, []); // Run once on mount

    // Sync State with URL Params (Fix for Back/Home navigation)
    useEffect(() => {
        setKeyword(searchParams.get('keyword') || '');
        setMedium(searchParams.get('medium') || '');
        setStyle(searchParams.get('style') || '');
        setArtist(searchParams.get('artist') || '');
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');

        // If URL has no params, ensure we are in a "reset" state
        if (!searchParams.toString()) {
            setIsSearchActive(false);
            setShowFilters(false);
        }
    }, [searchParams]);

    // Legacy support for manual sections
    const [showAll, setShowAll] = useState(false);
    const displayLimit = 4;

    const [debugInfo, setDebugInfo] = useState({});

    const fetchArtworks = async () => {
        setLoading(true);
        try {
            // Get keyword from URL params (already defined above as const keyword)

            const params = new URLSearchParams();
            if (keyword.trim()) params.append('keyword', keyword);
            if (medium.trim()) params.append('medium', medium);
            if (style.trim()) params.append('style', style);
            if (artist.trim()) params.append('artist', artist);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const queryStr = params.toString() ? `?${params.toString()}` : '';
            const url = `/artworks${queryStr}`;

            console.log("Fetching:", url);
            const { data } = await api.get(url);

            setArtworks(data || []);
            setDebugInfo({ url, count: data?.length || 0, error: null });
        } catch (error) {
            console.error('Error fetching artworks:', error);
            setDebugInfo({ url: 'failed', error: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks();
    }, [keyword, medium, style, artist, minPrice, maxPrice]); // Re-fetch when params change

    // isSearchActive already defined as state above. 
    // We should keep the state variable if we want to set it, OR use this derived logic.
    // The previous code used derived logic. 
    // However, I see I introduced state: const [isSearchActive, setIsSearchActive] = useState...
    // Let's remove this redundant const and just use the state or derived value.
    // Since we have state `setIsSearchActive` usage elsewhere possibly, let's keep state but update it?
    // Actually, derived state is better. Let's remove the const below and use a useEffect to sync state or just remove the state if unused.

    // BUT, simpler fix for user: Remove this second declaration and sync logic.
    // The previous line 101: const [isSearchActive, setIsSearchActive] = useState...
    // This line 143: const isSearchActive = ... RE-DECLARES it.

    // I will remove line 143 and instead update the state in useEffect if needed, 
    // OR just rename this local variable if it's meant to be a check?
    // "Check if search mode is active" -> seems to be derived.

    // Let's rely on the state variable defined at the top (line 101) 
    // and use an effect to update it if params change.

    useEffect(() => {
        const active = !!keyword || searchParams.get('search') === 'true';
        setIsSearchActive(active);
    }, [keyword, searchParams]);

    useEffect(() => {
        if (isSearchActive) {
            setShowFilters(true);
        } else {
            setShowFilters(false);
        }
    }, [isSearchActive]);

    // Check for Artist Role
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isArtist = userInfo && userInfo.role === 'artist';

    if (isArtist) {
        return <ArtistDashboard />;
    }

    return (
        <div className="home-page">
            {/* Show Hero Section ONLY when NOT searching */}
            {/* Premium Hero Section */}
            {!isSearchActive && <HeroSection />}



            {/* If Search IS Active, show a Results Header with Filter Toggle */}
            {isSearchActive && (
                <div className="results-header" style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2>{keyword ? `Results for "${keyword}"` : 'Refine your Search'}</h2>
                    <button
                        className="filter-toggle-btn"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ margin: 0 }} // Reset margin
                    >
                        <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            )}

            <div className="main-layout">
                {/* Sidebar Filters - Only show if toggled AND Search is Active */}
                {isSearchActive && showFilters && (
                    <aside className="filters-sidebar">
                        <h3>Filters</h3>
                        {/* ... Filters content ... */}
                        <div className="filter-group">
                            <label>Artist Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Medium</label>
                            <select
                                value={isCustomMedium ? 'Other' : (medium || '')}
                                onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                        setIsCustomMedium(true);
                                        setMedium('');
                                    } else {
                                        setIsCustomMedium(false);
                                        setMedium(e.target.value);
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">All Mediums</option>
                                {MEDIUM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                <option value="Other">Other (Add New)</option>
                            </select>
                            {isCustomMedium && (
                                <input
                                    type="text"
                                    placeholder="Enter custom medium"
                                    value={medium}
                                    onChange={(e) => setMedium(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>

                        <div className="filter-group">
                            <label>Style</label>
                            <select
                                value={isCustomStyle ? 'Other' : (style || '')}
                                onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                        setIsCustomStyle(true);
                                        setStyle('');
                                    } else {
                                        setIsCustomStyle(false);
                                        setStyle(e.target.value);
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">All Styles</option>
                                {STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                <option value="Other">Other (Add New)</option>
                            </select>
                            {isCustomStyle && (
                                <input
                                    type="text"
                                    placeholder="Enter custom style"
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <button onClick={fetchArtworks} className="btn-sm btn-secondary apply-btn" style={{ color: 'white' }}>Apply Filters</button>
                    </aside>
                )}

                <div className="content-area">
                    {/* Main Featured/Search Section */}
                    {/* Check for Empty State */}
                    {!loading && artworks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                            <h3>No artworks available</h3>
                            <p>Try adjusting your filters or search criteria.</p>
                        </div>
                    ) : (
                        <ScrollRow
                            id="featured-collection"
                            title="Featured Collection"
                            artworks={artworks}
                        />
                    )}


                    {/* Highly Rated */}
                    {!isSearchActive && (
                        <ScrollRow
                            title="Highly Rated Masterpieces"
                            artworks={[...artworks].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10)}
                        />
                    )}

                    {/* Best Sellers */}
                    {!isSearchActive && (
                        <ScrollRow
                            title="Best Sellers"
                            artworks={[...artworks].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 10)}
                        />
                    )}

                    {/* Fresh Collection */}
                    {!isSearchActive && (
                        <ScrollRow
                            title="Fresh Collection"
                            artworks={[...artworks].reverse().slice(0, 10)}
                        />
                    )}
                </div>
            </div>

            {/* About Us Section with Scroll Target */}
            {!isSearchActive && (
                <>
                    <div id="about">
                        <AboutUs />
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
