// // import React, { useState, useRef, useEffect } from 'react';
// // import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
// // import { FaSearch, FaUser, FaBars, FaShoppingCart } from 'react-icons/fa';
// // import '../styles/TopBar.css';
// // import api from '../api/api';

// // const TopBar = () => {
// //     const navigate = useNavigate();
// //     const location = useLocation();
// //     const [searchParams, setSearchParams] = useSearchParams();

// //     // Use state for Auth values to trigger re-renders
// //     const [token, setToken] = useState(localStorage.getItem('token'));
// //     const [role, setRole] = useState(localStorage.getItem('role'));
// //     const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo') || '{}'));

// //     const [showDropdown, setShowDropdown] = useState(false);
// //     const [searchTerm, setSearchTerm] = useState('');
// //     const [cartCount, setCartCount] = useState(0);
// //     const [imageError, setImageError] = useState(false);
// //     const dropdownRef = useRef(null);

// //     const [suggestions, setSuggestions] = useState([]);
// //     const [showSuggestions, setShowSuggestions] = useState(false);
// //     const searchWrapperRef = useRef(null);

// //     // Existing updateAuth/updateCartCount logic...
// //     const updateAuth = () => {
// //         setToken(localStorage.getItem('token'));
// //         setRole(localStorage.getItem('role'));
// //         setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
// //     };

// //     const updateCartCount = () => {
// //         const cart = JSON.parse(localStorage.getItem('cart')) || [];
// //         const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
// //         setCartCount(count);
// //     };

// //     useEffect(() => {
// //         updateCartCount();
// //         updateAuth(); // Init

// //         window.addEventListener('cartUpdated', updateCartCount);
// //         window.addEventListener('storage', updateCartCount); // Cross-tab
// //         window.addEventListener('storage', updateAuth);
// //         window.addEventListener('authChange', updateAuth); // Custom event

// //         return () => {
// //             window.removeEventListener('cartUpdated', updateCartCount);
// //             window.removeEventListener('storage', updateCartCount);
// //             window.removeEventListener('storage', updateAuth);
// //             window.removeEventListener('authChange', updateAuth);
// //         };
// //     }, []);

// //     // Logout Modal State
// //     const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

// //     const handleLogoutClick = () => {
// //         setShowLogoutConfirm(true);
// //         setShowDropdown(false);
// //     };

// //     const confirmLogout = () => {
// //         localStorage.removeItem('token');
// //         localStorage.removeItem('role');
// //         localStorage.removeItem('userInfo');
// //         localStorage.removeItem('cart');
// //         window.dispatchEvent(new Event('authChange'));
// //         navigate('/login');
// //         setShowLogoutConfirm(false);
// //     };

// //     const cancelLogout = () => {
// //         setShowLogoutConfirm(false);
// //     };

// //     // Debounced Search Suggestions
// //     useEffect(() => {
// //         const delayDebounceFn = setTimeout(async () => {
// //             if (searchTerm.trim().length > 1) { // Only search if > 1 char
// //                 try {
// //                     // Use existing search API
// //                     const { data } = await api.get(`/artworks?keyword=${encodeURIComponent(searchTerm)}`);
// //                     setSuggestions(data.slice(0, 5)); // Limit to top 5
// //                     setShowSuggestions(true);
// //                 } catch (error) {
// //                     console.error("Error fetching suggestions:", error);
// //                     setSuggestions([]);
// //                 }
// //             } else {
// //                 setSuggestions([]);
// //                 setShowSuggestions(false);
// //             }
// //         }, 300); // 300ms delay

// //         return () => clearTimeout(delayDebounceFn);
// //     }, [searchTerm]);


// //     const handleSearch = (e) => {
// //         e.preventDefault();
// //         setShowSuggestions(false); // Hide on explicit submit
// //         if (searchTerm.trim()) {
// //             navigate(`/?keyword=${encodeURIComponent(searchTerm)}&search=true`);
// //         }
// //     };

// //     const handleSuggestionClick = (artworkId) => {
// //         navigate(`/product/${artworkId}`);
// //         setShowSuggestions(false);
// //         setSearchTerm(''); // Optional: clear search or keep it? Clearing is usually better for direct nav
// //     };


// //     const handleFocus = () => {
// //         // When user clicks/focuses search, activate 'Search Mode' on Home
// //         if (location.pathname === '/') {
// //             const newParams = new URLSearchParams(searchParams);
// //             newParams.set('search', 'true');
// //             setSearchParams(newParams);
// //         } else {
// //             // If we navigate, we lose focus likely. Ideally keep query sync content.
// //             // For now, simple nav:
// //             navigate('/?search=true');
// //         }
// //         // Show suggestions if valid term exists
// //         if (searchTerm.trim().length > 1 && suggestions.length > 0) {
// //             setShowSuggestions(true);
// //         }
// //     };

// //     useEffect(() => {
// //         const handleClickOutside = (event) => {
// //             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //                 setShowDropdown(false);
// //             }
// //             if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
// //                 setShowSuggestions(false);
// //             }
// //         };
// //         document.addEventListener('mousedown', handleClickOutside);
// //         return () => document.removeEventListener('mousedown', handleClickOutside);
// //     }, []);

// //     const handleProfileClick = () => {
// //         if (!token) {
// //             navigate('/login');
// //         } else {
// //             setShowDropdown(!showDropdown);
// //         }
// //     };

// //     return (
// //         <>
// //             <header className="topbar">
// //                 <div className="topbar-left">
// //                     <Link to="/" className="brand-logo">
// //                         ARTHUB
// //                     </Link>
// //                 </div>

// //                 <div className="topbar-center">
// //                     <div ref={searchWrapperRef} className="search-bar-wrapper" style={{ position: 'relative' }}>
// //                         <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
// //                             <FaSearch className="search-icon" />
// //                             <input
// //                                 type="text"
// //                                 placeholder="Search artworks, artists..."
// //                                 value={searchTerm}
// //                                 onChange={(e) => setSearchTerm(e.target.value)}
// //                                 onFocus={handleFocus}
// //                                 className="search-input"
// //                             />
// //                         </form>

// //                         {/* Suggestions Dropdown */}
// //                         {showSuggestions && suggestions.length > 0 && (
// //                             <div className="search-suggestions" style={{
// //                                 position: 'absolute',
// //                                 top: '100%',
// //                                 left: 0,
// //                                 right: 0,
// //                                 backgroundColor: 'white',
// //                                 borderRadius: '0 0 8px 8px',
// //                                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
// //                                 zIndex: 1000,
// //                                 marginTop: '4px',
// //                                 border: '1px solid #eee'
// //                             }}>
// //                                 {suggestions.map((art) => (
// //                                     <div
// //                                         key={art._id}
// //                                         onClick={() => handleSuggestionClick(art._id)}
// //                                         style={{
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                             padding: '10px 15px',
// //                                             cursor: 'pointer',
// //                                             borderBottom: '1px solid #f5f5f5',
// //                                             transition: 'background 0.2s'
// //                                         }}
// //                                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
// //                                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
// //                                     >
// //                                         <img
// //                                             src={art.images?.[0]?.startsWith('http') ? art.images[0] : `http://localhost:5000/${art.images?.[0]}`}
// //                                             alt={art.title}
// //                                             style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }}
// //                                             onError={(e) => e.target.style.display = 'none'}
// //                                         />
// //                                         <div>
// //                                             <div style={{ fontWeight: '500', color: '#333' }}>{art.title}</div>
// //                                             <div style={{ fontSize: '0.8rem', color: '#666' }}>by {art.artistId?.name || "Unknown"}</div>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>

// //                 <div className="topbar-right">
// //                     {role !== 'artist' && token && (
// //                         <Link to="/cart" className="cart-icon-wrapper" style={{ marginRight: '20px', position: 'relative', color: 'var(--accent-primary)' }}>
// //                             <FaShoppingCart size={24} />
// //                             {cartCount > 0 && <span className="cart-badge" style={{
// //                                 position: 'absolute',
// //                                 top: '-8px',
// //                                 right: '-8px',
// //                                 background: '#d32f2f', // Red badge
// //                                 color: 'white',
// //                                 borderRadius: '50%',
// //                                 width: '18px',
// //                                 height: '18px',
// //                                 fontSize: '0.75rem',
// //                                 display: 'flex',
// //                                 alignItems: 'center',
// //                                 justifyContent: 'center'
// //                             }}>{cartCount}</span>}
// //                         </Link>
// //                     )}



// //                     <div className="profile-container" ref={dropdownRef}>
// //                         <button className="profile-btn" onClick={handleProfileClick} title={token ? userInfo.name : "Login"}>
// //                             {token && userInfo.profileImage && !imageError ? (
// //                                 <img
// //                                     key={userInfo.profileImage} // Force re-render
// //                                     src={`http://localhost:5000/${userInfo.profileImage.replace(/\\/g, '/')}`}
// //                                     alt="Profile"
// //                                     style={{
// //                                         width: '32px',
// //                                         height: '32px',
// //                                         borderRadius: '50%',
// //                                         objectFit: 'cover',
// //                                         marginRight: '8px',
// //                                         border: '1px solid #ddd'
// //                                     }}
// //                                     onError={(e) => {
// //                                         console.error('TopBar Image Failed:', e.target.src);
// //                                         setImageError(true);
// //                                     }}
// //                                 />
// //                             ) : (
// //                                 <FaUser size={20} className="profile-icon-fallback" style={{ marginRight: '8px' }} />
// //                             )}
// //                             {token && <span className="profile-name">{userInfo.name?.split(' ')[0]}</span>}
// //                         </button>

// //                         {showDropdown && token && (
// //                             <div className="dropdown-menu">
// //                                 <div className="dropdown-header">
// //                                     <p>Signed in as <strong>{userInfo.name}</strong></p>
// //                                 </div>
// //                                 <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=profile'); setShowDropdown(false); }}>Change Password</div>

// //                                 {role === 'buyer' && (
// //                                     <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=orders'); setShowDropdown(false); }}>Order History</div>
// //                                 )}

// //                                 {role === 'artist' && (
// //                                     <>
// //                                         <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowDropdown(false); }}>Dashboard</div>
// //                                         <div className="dropdown-item" onClick={() => { navigate('/artist/edit-profile'); setShowDropdown(false); }}>Edit Profile</div>
// //                                     </>
// //                                 )}

// //                                 <div className="dropdown-divider"></div>
// //                                 <div className="dropdown-item logout-item" onClick={handleLogoutClick}>Logout</div>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </header>

// //             {/* Logout Confirmation Modal */}
// //             {showLogoutConfirm && (
// //                 <div style={{
// //                     position: 'fixed',
// //                     top: 0,
// //                     left: 0,
// //                     width: '100%',
// //                     height: '100%',
// //                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     zIndex: 2000,
// //                     backdropFilter: 'blur(3px)'
// //                 }}>
// //                     <div style={{
// //                         backgroundColor: 'white',
// //                         padding: '30px',
// //                         borderRadius: '12px',
// //                         boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
// //                         textAlign: 'center',
// //                         maxWidth: '400px',
// //                         width: '90%'
// //                     }}>
// //                         <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Confirm Logout</h3>
// //                         <p style={{ marginBottom: '25px', color: '#666' }}>Are you sure you want to log out of your account?</p>
// //                         <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
// //                             <button
// //                                 onClick={cancelLogout}
// //                                 style={{
// //                                     padding: '10px 20px',
// //                                     borderRadius: '6px',
// //                                     border: '1px solid #ddd',
// //                                     background: 'white',
// //                                     cursor: 'pointer',
// //                                     fontWeight: '500'
// //                                 }}
// //                             >
// //                                 Cancel
// //                             </button>
// //                             <button
// //                                 onClick={confirmLogout}
// //                                 style={{
// //                                     padding: '10px 20px',
// //                                     borderRadius: '6px',
// //                                     border: 'none',
// //                                     background: '#d32f2f',
// //                                     color: 'white',
// //                                     cursor: 'pointer',
// //                                     fontWeight: '500'
// //                                 }}
// //                             >
// //                                 Yes, Logout
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}
// //         </>
// //     );
// // };

// // export default TopBar;


// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
// import { FaSearch, FaUser, FaBars, FaShoppingCart } from 'react-icons/fa';
// import '../styles/TopBar.css';
// import api from '../api/api';

// const TopBar = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [searchParams, setSearchParams] = useSearchParams();

//     // Use state for Auth values to trigger re-renders
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [role, setRole] = useState(localStorage.getItem('role'));
//     const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo') || '{}'));

//     const [showDropdown, setShowDropdown] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [cartCount, setCartCount] = useState(0);
//     const [imageError, setImageError] = useState(false);
//     const dropdownRef = useRef(null);

//     const [suggestions, setSuggestions] = useState([]);
//     const [showSuggestions, setShowSuggestions] = useState(false);
//     const searchWrapperRef = useRef(null);

//     // Existing updateAuth/updateCartCount logic...
//     const updateAuth = () => {
//         setToken(localStorage.getItem('token'));
//         setRole(localStorage.getItem('role'));
//         setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
//     };

//     const updateCartCount = () => {
//         const cart = JSON.parse(localStorage.getItem('cart')) || [];
//         const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
//         setCartCount(count);
//     };

//     useEffect(() => {
//         updateCartCount();
//         updateAuth(); // Init

//         window.addEventListener('cartUpdated', updateCartCount);
//         window.addEventListener('storage', updateCartCount); // Cross-tab
//         window.addEventListener('storage', updateAuth);
//         window.addEventListener('authChange', updateAuth); // Custom event

//         return () => {
//             window.removeEventListener('cartUpdated', updateCartCount);
//             window.removeEventListener('storage', updateCartCount);
//             window.removeEventListener('storage', updateAuth);
//             window.removeEventListener('authChange', updateAuth);
//         };
//     }, []);

//     // Logout Modal State
//     const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//     const handleLogoutClick = () => {
//         setShowLogoutConfirm(true);
//         setShowDropdown(false);
//     };

//     const confirmLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('role');
//         localStorage.removeItem('userInfo');
//         localStorage.removeItem('cart');
//         window.dispatchEvent(new Event('authChange'));
//         navigate('/login');
//         setShowLogoutConfirm(false);
//     };

//     const cancelLogout = () => {
//         setShowLogoutConfirm(false);
//     };

//     // Debounced Search Suggestions
//     useEffect(() => {
//         const delayDebounceFn = setTimeout(async () => {
//             if (searchTerm.trim().length > 1) { // Only search if > 1 char
//                 try {
//                     // Use existing search API
//                     const { data } = await api.get(`/artworks?keyword=${encodeURIComponent(searchTerm)}`);
//                     setSuggestions(data.slice(0, 5)); // Limit to top 5
//                     setShowSuggestions(true);
//                 } catch (error) {
//                     console.error("Error fetching suggestions:", error);
//                     setSuggestions([]);
//                 }
//             } else {
//                 setSuggestions([]);
//                 setShowSuggestions(false);
//             }
//         }, 300); // 300ms delay

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchTerm]);

//     // Clear search when navigating to home page without search params
//     useEffect(() => {
//         if (location.pathname === '/' && !searchParams.get('keyword') && !searchParams.get('search')) {
//             setSearchTerm('');
//             setSuggestions([]);
//             setShowSuggestions(false);
//         }
//     }, [location.pathname, searchParams]);


//     const handleSearch = (e) => {
//         e.preventDefault();
//         setShowSuggestions(false); // Hide on explicit submit
//         if (searchTerm.trim()) {
//             navigate(`/?keyword=${encodeURIComponent(searchTerm)}&search=true`);
//         }
//     };

//     const handleSuggestionClick = (artworkId) => {
//         navigate(`/artwork/${artworkId}`);
//         setShowSuggestions(false);
//         setSearchTerm('');
//     };


//     const handleFocus = () => {
//         // When user clicks/focuses search, activate 'Search Mode' on Home
//         if (location.pathname === '/') {
//             const newParams = new URLSearchParams(searchParams);
//             newParams.set('search', 'true');
//             setSearchParams(newParams);
//         } else {
//             // If we navigate, we lose focus likely. Ideally keep query sync content.
//             // For now, simple nav:
//             navigate('/?search=true');
//         }
//         // Show suggestions if valid term exists
//         if (searchTerm.trim().length > 1 && suggestions.length > 0) {
//             setShowSuggestions(true);
//         }
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setShowDropdown(false);
//             }
//             if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
//                 setShowSuggestions(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const handleProfileClick = () => {
//         if (!token) {
//             navigate('/login');
//         } else {
//             setShowDropdown(!showDropdown);
//         }
//     };

//     return (
//         <>
//             <header className="topbar">
//                 <div className="topbar-left">
//                     <Link to="/" className="brand-logo">
//                         ARTHUB
//                     </Link>
//                 </div>

//                 <div className="topbar-center">
//                     <div ref={searchWrapperRef} className="search-bar-wrapper" style={{ position: 'relative' }}>
//                         <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
//                             <FaSearch className="search-icon" />
//                             <input
//                                 type="text"
//                                 placeholder="Search artworks, artists..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 onFocus={handleFocus}
//                                 className="search-input"
//                             />
//                         </form>

//                         {/* Suggestions Dropdown */}
//                         {showSuggestions && suggestions.length > 0 && (
//                             <div className="search-suggestions" style={{
//                                 position: 'absolute',
//                                 top: '100%',
//                                 left: 0,
//                                 right: 0,
//                                 backgroundColor: 'white',
//                                 borderRadius: '0 0 8px 8px',
//                                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                                 zIndex: 1000,
//                                 marginTop: '4px',
//                                 border: '1px solid #eee'
//                             }}>
//                                 {suggestions.map((art) => (
//                                     <div
//                                         key={art._id}
//                                         onClick={() => handleSuggestionClick(art._id)}
//                                         style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             padding: '10px 15px',
//                                             cursor: 'pointer',
//                                             borderBottom: '1px solid #f5f5f5',
//                                             transition: 'background 0.2s'
//                                         }}
//                                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
//                                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
//                                     >
//                                         <img
//                                             src={art.images?.[0]?.startsWith('http') ? art.images[0] : `http://localhost:5000/${art.images?.[0]}`}
//                                             alt={art.title}
//                                             style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }}
//                                             onError={(e) => e.target.style.display = 'none'}
//                                         />
//                                         <div>
//                                             <div style={{ fontWeight: '500', color: '#333' }}>{art.title}</div>
//                                             <div style={{ fontSize: '0.8rem', color: '#666' }}>by {art.artistId?.name || "Unknown"}</div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="topbar-right">
//                     {role !== 'artist' && token && (
//                         <Link to="/cart" className="cart-icon-wrapper" style={{ marginRight: '20px', position: 'relative', color: 'var(--accent-primary)' }}>
//                             <FaShoppingCart size={24} />
//                             {cartCount > 0 && <span className="cart-badge" style={{
//                                 position: 'absolute',
//                                 top: '-8px',
//                                 right: '-8px',
//                                 background: '#d32f2f', // Red badge
//                                 color: 'white',
//                                 borderRadius: '50%',
//                                 width: '18px',
//                                 height: '18px',
//                                 fontSize: '0.75rem',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}>{cartCount}</span>}
//                         </Link>
//                     )}



//                     <div className="profile-container" ref={dropdownRef}>
//                         <button className="profile-btn" onClick={handleProfileClick} title={token ? userInfo.name : "Login"}>
//                             {token && userInfo.profileImage && !imageError ? (
//                                 <img
//                                     key={userInfo.profileImage} // Force re-render
//                                     src={`http://localhost:5000/${userInfo.profileImage.replace(/\\/g, '/')}`}
//                                     alt="Profile"
//                                     style={{
//                                         width: '32px',
//                                         height: '32px',
//                                         borderRadius: '50%',
//                                         objectFit: 'cover',
//                                         marginRight: '8px',
//                                         border: '1px solid #ddd'
//                                     }}
//                                     onError={(e) => {
//                                         console.error('TopBar Image Failed:', e.target.src);
//                                         setImageError(true);
//                                     }}
//                                 />
//                             ) : (
//                                 <FaUser size={20} className="profile-icon-fallback" style={{ marginRight: '8px' }} />
//                             )}
//                             {token && <span className="profile-name">{userInfo.name?.split(' ')[0]}</span>}
//                         </button>

//                         {showDropdown && token && (
//                             <div className="dropdown-menu">
//                                 <div className="dropdown-header">
//                                     <p>Signed in as <strong>{userInfo.name}</strong></p>
//                                 </div>
//                                 <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=profile'); setShowDropdown(false); }}>Your Details</div>

//                                 {role === 'buyer' && (
//                                     <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=orders'); setShowDropdown(false); }}>Order History</div>
//                                 )}

//                                 {role === 'artist' && (
//                                     <>
//                                         <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowDropdown(false); }}>Dashboard</div>
//                                         <div className="dropdown-item" onClick={() => { navigate('/artist/edit-profile'); setShowDropdown(false); }}>Edit Profile</div>
//                                     </>
//                                 )}

//                                 <div className="dropdown-divider"></div>
//                                 <div className="dropdown-item logout-item" onClick={handleLogoutClick}>Logout</div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </header>

//             {/* Logout Confirmation Modal */}
//             {showLogoutConfirm && (
//                 <div style={{
//                     position: 'fixed',
//                     top: 0,
//                     left: 0,
//                     width: '100%',
//                     height: '100%',
//                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     zIndex: 2000,
//                     backdropFilter: 'blur(3px)'
//                 }}>
//                     <div style={{
//                         backgroundColor: 'white',
//                         padding: '30px',
//                         borderRadius: '12px',
//                         boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
//                         textAlign: 'center',
//                         maxWidth: '400px',
//                         width: '90%'
//                     }}>
//                         <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Confirm Logout</h3>
//                         <p style={{ marginBottom: '25px', color: '#666' }}>Are you sure you want to log out of your account?</p>
//                         <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
//                             <button
//                                 onClick={cancelLogout}
//                                 style={{
//                                     padding: '10px 20px',
//                                     borderRadius: '6px',
//                                     border: '1px solid #ddd',
//                                     background: 'white',
//                                     cursor: 'pointer',
//                                     fontWeight: '500'
//                                 }}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmLogout}
//                                 style={{
//                                     padding: '10px 20px',
//                                     borderRadius: '6px',
//                                     border: 'none',
//                                     background: '#d32f2f',
//                                     color: 'white',
//                                     cursor: 'pointer',
//                                     fontWeight: '500'
//                                 }}
//                             >
//                                 Yes, Logout
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default TopBar;

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaSearch, FaUser, FaBars, FaShoppingCart } from 'react-icons/fa';
import '../styles/TopBar.css';
import api from '../api/api';

const TopBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Use state for Auth values to trigger re-renders
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo') || '{}'));

    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [imageError, setImageError] = useState(false);
    const dropdownRef = useRef(null);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = useRef(null);

    // Existing updateAuth/updateCartCount logic...
    const updateAuth = () => {
        setToken(localStorage.getItem('token'));
        setRole(localStorage.getItem('role'));
        setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    };

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
    };

    useEffect(() => {
        updateCartCount();
        updateAuth(); // Init

        window.addEventListener('cartUpdated', updateCartCount);
        window.addEventListener('storage', updateCartCount); // Cross-tab
        window.addEventListener('storage', updateAuth);
        window.addEventListener('authChange', updateAuth); // Custom event

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('storage', updateAuth);
            window.removeEventListener('authChange', updateAuth);
        };
    }, []);

    // Logout Modal State
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setShowDropdown(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
        setShowLogoutConfirm(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    // Debounced Search Suggestions
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 1) { // Only search if > 1 char
                try {
                    // Use existing search API
                    const { data } = await api.get(`/artworks?keyword=${encodeURIComponent(searchTerm)}`);
                    setSuggestions(data.slice(0, 5)); // Limit to top 5
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Clear search when navigating to home page without search params
    useEffect(() => {
        if (location.pathname === '/' && !searchParams.get('keyword') && !searchParams.get('search')) {
            setSearchTerm('');
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [location.pathname, searchParams]);


    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false); // Hide on explicit submit
        if (searchTerm.trim()) {
            navigate(`/?keyword=${encodeURIComponent(searchTerm)}&search=true`);
        }
    };

    const handleSuggestionClick = (artworkId) => {
        navigate(`/product/${artworkId}`);
        setShowSuggestions(false);
        setSearchTerm('');
    };


    const handleFocus = () => {
        // When user clicks/focuses search, activate 'Search Mode' on Home
        if (location.pathname === '/') {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('search', 'true');
            setSearchParams(newParams);
        } else {
            // If we navigate, we lose focus likely. Ideally keep query sync content.
            // For now, simple nav:
            navigate('/?search=true');
        }
        // Show suggestions if valid term exists
        if (searchTerm.trim().length > 1 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        if (!token) {
            navigate('/login');
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <>
            <header className="topbar">
                <div className="topbar-left">
                    <Link to="/" className="brand-logo">
                        ARTHUB
                    </Link>
                </div>

                <div className="topbar-center">
                    <div ref={searchWrapperRef} className="search-bar-wrapper" style={{ position: 'relative' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search artworks, artists..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleFocus}
                                className="search-input"
                            />
                        </form>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                borderRadius: '0 0 8px 8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                marginTop: '4px',
                                border: '1px solid #eee'
                            }}>
                                {suggestions.map((art) => (
                                    <div
                                        key={art._id}
                                        onClick={() => handleSuggestionClick(art._id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px 15px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f5f5f5',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <img
                                            src={art.images?.[0]?.startsWith('http') ? art.images[0] : `http://localhost:5000/${art.images?.[0]}`}
                                            alt={art.title}
                                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#333' }}>{art.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>by {art.artistId?.name || "Unknown"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="topbar-right">
                    {role !== 'artist' && token && (
                        <Link to="/cart" className="cart-icon-wrapper" style={{ marginRight: '20px', position: 'relative', color: 'var(--accent-primary)' }}>
                            <FaShoppingCart size={24} />
                            {cartCount > 0 && <span className="cart-badge" style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#d32f2f', // Red badge
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>{cartCount}</span>}
                        </Link>
                    )}



                    <div className="profile-container" ref={dropdownRef}>
                        <button className="profile-btn" onClick={handleProfileClick} title={token ? userInfo.name : "Login"}>
                            {token && userInfo.profileImage && !imageError ? (
                                <img
                                    key={userInfo.profileImage} // Force re-render
                                    src={`http://localhost:5000/${userInfo.profileImage.replace(/\\/g, '/')}`}
                                    alt="Profile"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginRight: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                    onError={(e) => {
                                        console.error('TopBar Image Failed:', e.target.src);
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <FaUser size={20} className="profile-icon-fallback" style={{ marginRight: '8px' }} />
                            )}
                            {token && <span className="profile-name">{userInfo.name?.split(' ')[0]}</span>}
                        </button>

                        {showDropdown && token && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <p>Signed in as <strong>{userInfo.name}</strong></p>
                                </div>
                                <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=profile'); setShowDropdown(false); }}>Change Password</div>

                                {role === 'buyer' && (
                                    <div className="dropdown-item" onClick={() => { navigate('/account-settings?tab=orders'); setShowDropdown(false); }}>Order History</div>
                                )}

                                {role === 'artist' && (
                                    <>
                                        <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowDropdown(false); }}>Dashboard</div>
                                        <div className="dropdown-item" onClick={() => { navigate('/artist/edit-profile'); setShowDropdown(false); }}>Edit Profile</div>
                                    </>
                                )}

                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout-item" onClick={handleLogoutClick}>Logout</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Confirm Logout</h3>
                        <p style={{ marginBottom: '25px', color: '#666' }}>Are you sure you want to log out of your account?</p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={cancelLogout}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#d32f2f',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopBar;