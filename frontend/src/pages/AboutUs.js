import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css';
import { FaGem, FaGlobe, FaHandshake, FaPalette } from 'react-icons/fa';

const AboutUs = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <header className="about-hero">
                <h1 style={{ color: '#ffffff' }}>REDEFINING ART OWNERSHIP</h1>
                <p>Connecting the world's most visionary artists with collectors who appreciate the extraordinary.</p>
            </header>

            {/* Mission Statement */}
            <section className="about-section">
                <h2>Our Mission</h2>
                <p className="mission-text">
                    ArtHub was born from a simple yet ambitious desire: to democratize access to high-end art while preserving the sanctity of creative expression. We bridge the gap between studio and sanctuary.
                </p>
            </section>

            {/* Core Values */}
            <section className="about-section">
                <h2>Why Choose ArtHub</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <FaGem className="value-icon" />
                        <h3>Curated Excellence</h3>
                        <p>Every piece on our platform is hand-selected or vetted to ensure it meets our rigorous standards of quality and originality.</p>
                    </div>
                    <div className="value-card">
                        <FaHandshake className="value-icon" />
                        <h3>Direct Connection</h3>
                        <p>We facilitate direct relationships between artists and buyers, ensuring transparency and fair value for all creators.</p>
                    </div>
                    <div className="value-card">
                        <FaGlobe className="value-icon" />
                        <h3>Global Reach</h3>
                        <p>From Paris to New York, Tokyo to Mumbai. We bring the world's art to your doorstep with secure, insured shipping.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-section">
                <div className="cta-container">
                    <h2>Join the Movement</h2>
                    <p>Whether you create art or collect it, there is a place for you here.</p>
                    <div className="cta-buttons">
                        <button
                            className="btn"
                            onClick={() => {
                                const element = document.getElementById('featured-collection');
                                if (element) {
                                    const headerOffset = 100;
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                                }
                            }}
                        >
                            Explore Collection
                        </button>
                        <Link to="/artist/register" className="btn btn-outline">Become an Artist</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
