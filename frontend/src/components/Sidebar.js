// // import React, { useState, useEffect } from 'react';
// // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // import { FaHome, FaInfoCircle, FaImages, FaEnvelope, FaComments, FaShoppingCart, FaChartLine, FaUpload, FaHandshake } from 'react-icons/fa';
// // import '../styles/Sidebar.css';

// // // Helper function to scroll to element with offset
// // const scrollToElement = (id) => {
// //     const element = document.getElementById(id);
// //     if (element) {
// //         const headerOffset = 100; // TopBar height + buffer
// //         const elementPosition = element.getBoundingClientRect().top;
// //         const offsetPosition = elementPosition + window.scrollY - headerOffset;

// //         window.scrollTo({
// //             top: offsetPosition,
// //             behavior: "smooth"
// //         });
// //     }
// // };

// // // Stable sub-component for sidebar navigation items
// // const SidebarItem = ({ to, hash, icon: Icon, label, title, active, onClick, currentPath }) => {
// //     const navigate = useNavigate();

// //     const handleClick = (e) => {
// //         e.preventDefault(); // Always prevent default, we control navigation

// //         if (onClick) onClick(e);

// //         const id = hash ? hash.replace('#', '') : null;

// //         if (window.location.pathname === to) {
// //             // Already on the target page - just scroll
// //             if (id) {
// //                 scrollToElement(id);
// //             } else {
// //                 window.scrollTo({ top: 0, behavior: 'smooth' });
// //             }
// //         } else {
// //             // Navigate to the page with hash in URL, then scroll after page renders
// //             navigate(`${to}${hash || ''}`);
// //             if (id) {
// //                 // Wait for page to fully render, then scroll
// //                 setTimeout(() => {
// //                     scrollToElement(id);
// //                 }, 300);
// //             }
// //         }
// //     };

// //     return (
// //         <a
// //             href={`${to}${hash || ''}`}
// //             className={`nav-item ${active ? 'active' : ''}`}
// //             title={title}
// //             onClick={handleClick}
// //         >
// //             <Icon size={24} />
// //             <span className="nav-label">{label}</span>
// //         </a>
// //     );
// // };

// // const Sidebar = () => {
// //     const location = useLocation();
// //     const [token, setToken] = useState(localStorage.getItem('token'));
// //     const [role, setRole] = useState(localStorage.getItem('role'));
// //     const [activeHash, setActiveHash] = useState('');

// //     useEffect(() => {
// //         const handleAuthChange = () => {
// //             setToken(localStorage.getItem('token'));
// //             setRole(localStorage.getItem('role'));
// //         };

// //         window.addEventListener('authChange', handleAuthChange);
// //         window.addEventListener('storage', handleAuthChange);
// //         return () => {
// //             window.removeEventListener('authChange', handleAuthChange);
// //             window.removeEventListener('storage', handleAuthChange);
// //         };
// //     }, []);

// //     useEffect(() => {
// //         const handleScroll = () => {
// //             // 1. Check if Contact (Footer) is visible. Priority #1
// //             const contactSection = document.getElementById('contact');
// //             if (contactSection) {
// //                 const rect = contactSection.getBoundingClientRect();
// //                 // If footer top is entering the viewport
// //                 if (rect.top < window.innerHeight - 50) {
// //                     if (activeHash !== '#contact') setActiveHash('#contact');
// //                     return;
// //                 }
// //             }

// //             // 2. Check other sections
// //             // Added 'my-collection' for Artist Active State
// //             const sections = ['featured-collection', 'about', 'my-collection'];
// //             let found = false;

// //             for (const section of sections) {
// //                 const element = document.getElementById(section);
// //                 if (element) {
// //                     const rect = element.getBoundingClientRect();
// //                     // Standard overlap check: Top is above middle-ish, Bottom is below top
// //                     // Or precise: Top is within upper viewport area
// //                     const offset = 150; // accounting for header

// //                     if (rect.top <= offset && rect.bottom >= offset) {
// //                         if (activeHash !== `#${section}`) setActiveHash(`#${section}`);
// //                         found = true;
// //                         break;
// //                     }
// //                 }
// //             }

// //             if (found) return;

// //             // 3. Check Top/Home
// //             if (window.scrollY < 100) {
// //                 if (activeHash !== 'top') setActiveHash('top');
// //                 return;
// //             }

// //             // If nothing found and we are drifting, maybe clear it or keep last?
// //             // Optional: setActiveHash(''); 
// //         };

// //         window.addEventListener('scroll', handleScroll);
// //         handleScroll(); // Check on mount
// //         return () => window.removeEventListener('scroll', handleScroll);
// //     }, [activeHash]);

// //     // Helper to check active status (modified to use Scroll Spy)
// //     const isActive = (path, hash) => {
// //         if (location.pathname !== path) return false;

// //         // If we have a hash from scroll spy, prioritize it
// //         if (activeHash) {
// //             if (activeHash === 'top') {
// //                 // specific check for Home
// //                 return !hash;
// //             }
// //             return activeHash === hash;
// //         }

// //         // Fallback to URL hash if just navigated
// //         if (hash) {
// //             return location.hash === hash;
// //         }
// //         return !location.hash;
// //     };

// //     return (
// //         <aside className="sidebar">
// //             <nav className="sidebar-nav">
// //                 {/* ARTIST SIDEBAR */}
// //                 {role === 'artist' ? (
// //                     // ... (Artist sidebar content remains same, mostly separate pages)
// //                     <>
// //                         <SidebarItem
// //                             to="/dashboard"
// //                             hash=""
// //                             icon={FaHome}
// //                             label="Home"
// //                             title="Dashboard"
// //                             active={isActive('/dashboard', '')}
// //                             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
// //                         />
// //                         <SidebarItem
// //                             to="/dashboard"
// //                             hash="#my-collection"
// //                             icon={FaImages}
// //                             label="My Artwork"
// //                             title="My Inventory"
// //                             active={isActive('/dashboard', '#my-collection')}
// //                         />
// //                         <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Chat">
// //                             <FaComments size={24} />
// //                             <span className="nav-label">Chat</span>
// //                         </Link>
// //                         <Link to="/dashboard/analytics" className={`nav-item ${location.pathname === '/dashboard/analytics' ? 'active' : ''}`} title="Analytics">
// //                             <FaChartLine size={24} />
// //                             <span className="nav-label">Analytics</span>
// //                         </Link>
// //                         <Link to="/dashboard/upload" className={`nav-item ${location.pathname === '/dashboard/upload' ? 'active' : ''}`} title="Upload">
// //                             <FaUpload size={24} />
// //                             <span className="nav-label">Upload</span>
// //                         </Link>
// //                         <SidebarItem
// //                             to="/"
// //                             hash="#contact"
// //                             icon={FaEnvelope}
// //                             label="Contact"
// //                             active={isActive('/', '#contact')}
// //                         />
// //                     </>
// //                 ) : (
// //                     /* BUYER / GUEST SIDEBAR */
// //                     <>
// //                         <SidebarItem
// //                             to="/"
// //                             hash=""
// //                             icon={FaHome}
// //                             label="Home"
// //                             title="Home"
// //                             active={isActive('/', '')} // Only active if no hash active
// //                             onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveHash('top'); }}
// //                             currentPath={location.pathname}
// //                         />

// //                         <SidebarItem
// //                             to="/"
// //                             hash="#featured-collection"
// //                             icon={FaImages}
// //                             label="Artworks"
// //                             title="Artworks"
// //                             active={isActive('/', '#featured-collection')}
// //                             currentPath={location.pathname}
// //                         />

// //                         <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`} title="About Us">
// //                             <FaInfoCircle size={24} />
// //                             <span className="nav-label">About Us</span>
// //                         </Link>

// //                         {token && (
// //                             <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Community & Chat">
// //                                 <FaComments size={24} />
// //                                 <span className="nav-label">Chat</span>
// //                             </Link>
// //                         )}

// //                         <SidebarItem
// //                             to="/"
// //                             hash="#contact"
// //                             icon={FaEnvelope}
// //                             label="Contact"
// //                             title="Contact Us"
// //                             active={isActive('/', '#contact')}
// //                             currentPath={location.pathname}
// //                         />
// //                     </>
// //                 )}
// //             </nav>
// //         </aside>
// //     );
// // };

// // export default Sidebar;


// import React, { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { FaHome, FaInfoCircle, FaImages, FaEnvelope, FaComments, FaShoppingCart, FaChartLine, FaUpload, FaHandshake } from 'react-icons/fa';
// import '../styles/Sidebar.css';

// // Helper function to scroll to element with offset
// const scrollToElement = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//         const headerOffset = 100; // TopBar height + buffer
//         const elementPosition = element.getBoundingClientRect().top;
//         const offsetPosition = elementPosition + window.scrollY - headerOffset;

//         window.scrollTo({
//             top: offsetPosition,
//             behavior: "smooth"
//         });
//     }
// };

// // Stable sub-component for sidebar navigation items
// const SidebarItem = ({ to, hash, icon: Icon, label, title, active, onClick, currentPath }) => {
//     const navigate = useNavigate();

//     const handleClick = (e) => {
//         e.preventDefault(); // Always prevent default, we control navigation

//         if (onClick) onClick(e);

//         const id = hash ? hash.replace('#', '') : null;

//         // If navigating to home ("/"), always do a clean navigation to clear search params
//         if (to === '/') {
//             navigate('/', { replace: true });
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//             return;
//         }

//         if (window.location.pathname === to) {
//             // Already on the target page - just scroll
//             if (id) {
//                 scrollToElement(id);
//             } else {
//                 window.scrollTo({ top: 0, behavior: 'smooth' });
//             }
//         } else {
//             // Navigate to the page with hash in URL, then scroll after page renders
//             navigate(`${to}${hash || ''}`);
//             if (id) {
//                 // Wait for page to fully render, then scroll
//                 setTimeout(() => {
//                     scrollToElement(id);
//                 }, 300);
//             }
//         }
//     };

//     return (
//         <a
//             href={`${to}${hash || ''}`}
//             className={`nav-item ${active ? 'active' : ''}`}
//             title={title}
//             onClick={handleClick}
//         >
//             <Icon size={24} />
//             <span className="nav-label">{label}</span>
//         </a>
//     );
// };

// const Sidebar = () => {
//     const location = useLocation();
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [role, setRole] = useState(localStorage.getItem('role'));
//     const [activeHash, setActiveHash] = useState('');

//     useEffect(() => {
//         const handleAuthChange = () => {
//             setToken(localStorage.getItem('token'));
//             setRole(localStorage.getItem('role'));
//         };

//         window.addEventListener('authChange', handleAuthChange);
//         window.addEventListener('storage', handleAuthChange);
//         return () => {
//             window.removeEventListener('authChange', handleAuthChange);
//             window.removeEventListener('storage', handleAuthChange);
//         };
//     }, []);

//     useEffect(() => {
//         const handleScroll = () => {
//             // 1. Check if Contact (Footer) is visible. Priority #1
//             const contactSection = document.getElementById('contact');
//             if (contactSection) {
//                 const rect = contactSection.getBoundingClientRect();
//                 // If footer top is entering the viewport
//                 if (rect.top < window.innerHeight - 50) {
//                     if (activeHash !== '#contact') setActiveHash('#contact');
//                     return;
//                 }
//             }

//             // 2. Check other sections
//             // Added 'my-collection' for Artist Active State
//             const sections = ['featured-collection', 'about', 'my-collection'];
//             let found = false;

//             for (const section of sections) {
//                 const element = document.getElementById(section);
//                 if (element) {
//                     const rect = element.getBoundingClientRect();
//                     // Standard overlap check: Top is above middle-ish, Bottom is below top
//                     // Or precise: Top is within upper viewport area
//                     const offset = 150; // accounting for header

//                     if (rect.top <= offset && rect.bottom >= offset) {
//                         if (activeHash !== `#${section}`) setActiveHash(`#${section}`);
//                         found = true;
//                         break;
//                     }
//                 }
//             }

//             if (found) return;

//             // 3. Check Top/Home
//             if (window.scrollY < 100) {
//                 if (activeHash !== 'top') setActiveHash('top');
//                 return;
//             }

//             // If nothing found and we are drifting, maybe clear it or keep last?
//             // Optional: setActiveHash(''); 
//         };

//         window.addEventListener('scroll', handleScroll);
//         handleScroll(); // Check on mount
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [activeHash]);

//     // Helper to check active status (modified to use Scroll Spy)
//     const isActive = (path, hash) => {
//         if (location.pathname !== path) return false;

//         // If we have a hash from scroll spy, prioritize it
//         if (activeHash) {
//             if (activeHash === 'top') {
//                 // specific check for Home
//                 return !hash;
//             }
//             return activeHash === hash;
//         }

//         // Fallback to URL hash if just navigated
//         if (hash) {
//             return location.hash === hash;
//         }
//         return !location.hash;
//     };

//     return (
//         <aside className="sidebar">
//             <nav className="sidebar-nav">
//                 {/* ARTIST SIDEBAR */}
//                 {role === 'artist' ? (
//                     // ... (Artist sidebar content remains same, mostly separate pages)
//                     <>
//                         <SidebarItem
//                             to="/dashboard"
//                             hash=""
//                             icon={FaHome}
//                             label="Home"
//                             title="Dashboard"
//                             active={isActive('/dashboard', '')}
//                             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//                         />
//                         <SidebarItem
//                             to="/dashboard"
//                             hash="#my-collection"
//                             icon={FaImages}
//                             label="My Artwork"
//                             title="My Inventory"
//                             active={isActive('/dashboard', '#my-collection')}
//                         />
//                         <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Chat">
//                             <FaComments size={24} />
//                             <span className="nav-label">Chat</span>
//                         </Link>
//                         <Link to="/dashboard/analytics" className={`nav-item ${location.pathname === '/dashboard/analytics' ? 'active' : ''}`} title="Analytics">
//                             <FaChartLine size={24} />
//                             <span className="nav-label">Analytics</span>
//                         </Link>
//                         <Link to="/dashboard/upload" className={`nav-item ${location.pathname === '/dashboard/upload' ? 'active' : ''}`} title="Upload">
//                             <FaUpload size={24} />
//                             <span className="nav-label">Upload</span>
//                         </Link>
//                         <SidebarItem
//                             to="/"
//                             hash="#contact"
//                             icon={FaEnvelope}
//                             label="Contact"
//                             active={isActive('/', '#contact')}
//                         />
//                     </>
//                 ) : (
//                     /* BUYER / GUEST SIDEBAR */
//                     <>
//                         <SidebarItem
//                             to="/"
//                             hash=""
//                             icon={FaHome}
//                             label="Home"
//                             title="Home"
//                             active={isActive('/', '')} // Only active if no hash active
//                             onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveHash('top'); }}
//                             currentPath={location.pathname}
//                         />

//                         <SidebarItem
//                             to="/"
//                             hash="#featured-collection"
//                             icon={FaImages}
//                             label="Artworks"
//                             title="Artworks"
//                             active={isActive('/', '#featured-collection')}
//                             currentPath={location.pathname}
//                         />

//                         <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`} title="About Us">
//                             <FaInfoCircle size={24} />
//                             <span className="nav-label">About Us</span>
//                         </Link>

//                         {token && (
//                             <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Community & Chat">
//                                 <FaComments size={24} />
//                                 <span className="nav-label">Chat</span>
//                             </Link>
//                         )}

//                         <SidebarItem
//                             to="/"
//                             hash="#contact"
//                             icon={FaEnvelope}
//                             label="Contact"
//                             title="Contact Us"
//                             active={isActive('/', '#contact')}
//                             currentPath={location.pathname}
//                         />
//                     </>
//                 )}
//             </nav>
//         </aside>
//     );
// };

// export default Sidebar;


import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaImages, FaEnvelope, FaComments, FaShoppingCart, FaChartLine, FaUpload, FaHandshake } from 'react-icons/fa';
import '../styles/Sidebar.css';

// Helper function to scroll to element with offset
const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
        const headerOffset = 100; // TopBar height + buffer
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
};

// Stable sub-component for sidebar navigation items
const SidebarItem = ({ to, hash, icon: Icon, label, title, active, onClick, currentPath }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault(); // Always prevent default, we control navigation

        if (onClick) onClick(e);

        const id = hash ? hash.replace('#', '') : null;

        // If navigating to home ("/"), always do a clean navigation to clear search params
        if (to === '/') {
            navigate('/', { replace: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (window.location.pathname === to) {
            // Already on the target page - just scroll
            if (id) {
                scrollToElement(id);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Navigate to the page with hash in URL, then scroll after page renders
            navigate(`${to}${hash || ''}`);
            if (id) {
                // Wait for page to fully render, then scroll
                setTimeout(() => {
                    scrollToElement(id);
                }, 300);
            }
        }
    };

    return (
        <a
            href={`${to}${hash || ''}`}
            className={`nav-item ${active ? 'active' : ''}`}
            title={title}
            onClick={handleClick}
        >
            <Icon size={24} />
            <span className="nav-label">{label}</span>
        </a>
    );
};

const Sidebar = () => {
    const location = useLocation();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [activeHash, setActiveHash] = useState('');

    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem('token'));
            setRole(localStorage.getItem('role'));
        };

        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // 1. Check if Contact (Footer) is visible. Priority #1
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const rect = contactSection.getBoundingClientRect();
                // If footer top is entering the viewport
                if (rect.top < window.innerHeight - 50) {
                    if (activeHash !== '#contact') setActiveHash('#contact');
                    return;
                }
            }

            // 2. Check other sections
            // Added 'my-collection' for Artist Active State
            const sections = ['featured-collection', 'about', 'my-collection'];
            let found = false;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Standard overlap check: Top is above middle-ish, Bottom is below top
                    // Or precise: Top is within upper viewport area
                    const offset = 150; // accounting for header

                    if (rect.top <= offset && rect.bottom >= offset) {
                        if (activeHash !== `#${section}`) setActiveHash(`#${section}`);
                        found = true;
                        break;
                    }
                }
            }

            if (found) return;

            // 3. Check Top/Home
            if (window.scrollY < 100) {
                if (activeHash !== 'top') setActiveHash('top');
                return;
            }

            // If nothing found and we are drifting, maybe clear it or keep last?
            // Optional: setActiveHash(''); 
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeHash]);

    // Helper to check active status (modified to use Scroll Spy)
    const isActive = (path, hash) => {
        if (location.pathname !== path) return false;

        // If we have a hash from scroll spy, prioritize it
        if (activeHash) {
            if (activeHash === 'top') {
                // specific check for Home
                return !hash;
            }
            return activeHash === hash;
        }

        // Fallback to URL hash if just navigated
        if (hash) {
            return location.hash === hash;
        }
        return !location.hash;
    };

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {/* ARTIST SIDEBAR */}
                {role === 'artist' ? (
                    // ... (Artist sidebar content remains same, mostly separate pages)
                    <>
                        <SidebarItem
                            to="/dashboard"
                            hash=""
                            icon={FaHome}
                            label="Home"
                            title="Dashboard"
                            active={isActive('/dashboard', '')}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        />
                        <SidebarItem
                            to="/dashboard"
                            hash="#my-collection"
                            icon={FaImages}
                            label="My Artwork"
                            title="My Inventory"
                            active={isActive('/dashboard', '#my-collection')}
                        />
                        <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Chat">
                            <FaComments size={24} />
                            <span className="nav-label">Chat</span>
                        </Link>
                        <Link to="/dashboard/analytics" className={`nav-item ${location.pathname === '/dashboard/analytics' ? 'active' : ''}`} title="Analytics">
                            <FaChartLine size={24} />
                            <span className="nav-label">Analytics</span>
                        </Link>
                        <Link to="/dashboard/upload" className={`nav-item ${location.pathname === '/dashboard/upload' ? 'active' : ''}`} title="Upload">
                            <FaUpload size={24} />
                            <span className="nav-label">Upload</span>
                        </Link>
                        <SidebarItem
                            to="/"
                            hash="#contact"
                            icon={FaEnvelope}
                            label="Contact"
                            active={isActive('/', '#contact')}
                        />
                    </>
                ) : (
                    /* BUYER / GUEST SIDEBAR */
                    <>
                        <SidebarItem
                            to="/"
                            hash=""
                            icon={FaHome}
                            label="Home"
                            title="Home"
                            active={isActive('/', '')} // Only active if no hash active
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveHash('top'); }}
                            currentPath={location.pathname}
                        />

                        <SidebarItem
                            to="/"
                            hash="#featured-collection"
                            icon={FaImages}
                            label="Artworks"
                            title="Artworks"
                            active={isActive('/', '#featured-collection')}
                            currentPath={location.pathname}
                        />

                        <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`} title="About Us">
                            <FaInfoCircle size={24} />
                            <span className="nav-label">About Us</span>
                        </Link>

                        {token && (
                            <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`} title="Community & Chat">
                                <FaComments size={24} />
                                <span className="nav-label">Chat</span>
                            </Link>
                        )}

                        <SidebarItem
                            to="/"
                            hash="#contact"
                            icon={FaEnvelope}
                            label="Contact"
                            title="Contact Us"
                            active={isActive('/', '#contact')}
                            currentPath={location.pathname}
                        />
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;