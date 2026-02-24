import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { FaInstagram, FaTwitter, FaFacebook, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container footer-content">
                {/* Column 1: Brand & Mission */}
                <div className="footer-column brand-column">
                    <h3 className="footer-logo">ARTHUB</h3>
                    <p className="footer-description">
                        Discover the extraordinary. Connecting the world's finest artists with luxurious spaces. Experience art that speaks to you.
                    </p>
                    <div className="social-links">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                    </div>
                </div>

                {/* Column 2: Explore */}
                <div className="footer-column">
                    <h4>Explore</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/?keyword=">Featured Artworks</Link></li>
                        <li><Link to="/community">Community</Link></li>
                        <li><Link to="/login">Join as Artist</Link></li>
                    </ul>
                </div>

                {/* Column 3: Customer Care */}
                <div className="footer-column">
                    <h4>Support</h4>
                    <ul className="footer-links">
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/shipping">Shipping & Returns</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                        <li><Link to="/terms">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Column 4: Contact */}
                <div className="footer-column">
                    <h4>Contact Us</h4>
                    <ul className="footer-contact">
                        <li>
                            <FaMapMarkerAlt className="contact-icon" />
                            <span>123 Art Avenue, Design District, NY 10001</span>
                        </li>
                        <li>
                            <FaPhone className="contact-icon" />
                            <span>+1 (555) 123-4567</span>
                        </li>
                        <li>
                            <FaEnvelope className="contact-icon" />
                            <span>support@arthub.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} ArtHub. All rights reserved. | Crafted with <span style={{ color: 'var(--accent-primary)' }}>♥</span> for Art.</p>
            </div>
        </footer>
    );
};

export default Footer;
