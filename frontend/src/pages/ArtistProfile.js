import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import ArtworkCard from '../components/ArtworkCard';

const ArtistProfile = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        // Fetch artist profile (Need public route for this)
        // Ignoring implementation details for public profile fetch if protected

        // Mocking behavior or fetching artworks directly
        const fetchArtistData = async () => {
            // Fetch artworks by this artist logic would go here
            // For now just showing a placeholder
        };
        fetchArtistData();
    }, [id]);

    return (
        <div className="home-page">
            <div className="hero-section" style={{ background: '#333' }}>
                <h1>Artist Profile</h1>
                <p>Explore the portfolio</p>
            </div>
            {/* Logic to display specific artist artworks */}
            <p style={{ textAlign: 'center' }}>Artist ID: {id}</p>
            <p style={{ textAlign: 'center' }}>Portfolio display coming soon...</p>
        </div>
    );
};

export default ArtistProfile;
