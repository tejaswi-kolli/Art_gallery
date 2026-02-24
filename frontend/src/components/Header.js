import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart'); // Clear cart on logout
        navigate('/login');
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">Arthub</Link>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <a href="/#featured-collection">Artworks</a>
                    <a href="#contact">Contact Us</a>
                    {token && <Link to="/community">Community</Link>}

                    {token ? (
                        <>
                            {role === 'buyer' && (
                                <Link to="/cart" className="icon-link" title="Cart">
                                    <FaShoppingCart size={20} />
                                </Link>
                            )}

                            <div className="dropdown" ref={dropdownRef}>
                                <button className="icon-btn dropbtn" onClick={toggleDropdown}>
                                    <FaUser size={20} />
                                </button>
                                <div className={`dropdown-content ${showDropdown ? 'show' : ''}`}>
                                    <div className="dropdown-header">
                                        Signed in as <br /><strong>{userInfo.name || role}</strong>
                                    </div>

                                    <Link to="/account-settings" onClick={() => setShowDropdown(false)}>Your Details</Link>

                                    {role === 'buyer' && (
                                        <Link to="/profile" onClick={() => setShowDropdown(false)}>My Orders</Link>
                                    )}

                                    {role === 'artist' && (
                                        <>
                                            <Link to="/dashboard" onClick={() => setShowDropdown(false)}>Dashboard</Link>
                                            <Link to="/artist/edit-profile" onClick={() => setShowDropdown(false)}>Edit Artist Profile</Link>
                                        </>
                                    )}

                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-register">Register</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header >
    );
};

export default Header;
