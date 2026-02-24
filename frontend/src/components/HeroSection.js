import React, { useEffect, useState } from 'react';
import './HeroSection.css';

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="premium-hero">
            {/* Animated Background */}
            <div className="hero-bg-animation">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="gradient-overlay"></div>
            </div>

            {/* Main Content */}
            <div className={`hero-main-content ${isVisible ? 'visible' : ''}`}>
                <h1 className="hero-headline">
                    <span className="line-1">Discover</span>
                    <span className="line-2">Extraordinary</span>
                    <span className="line-3 highlight">Masterpieces</span>
                </h1>

                <p className="hero-subtitle">
                    Connect with world-class artists and curate your collection
                    with pieces that speak to your soul.
                </p>
            </div>
        </section>
    );
};

export default HeroSection;
