import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import '../styles/Auth.css'; // Reuse form styles

const EditArtwork = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
       
        medium: '',
        style: ''
    });

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                // Get artwork details (public route is fine, we own it)
                const { data } = await api.get(`/artworks/${id}`);

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price || '',
                    quantity: data.quantity !== undefined ? data.quantity : 1,
                    medium: data.medium || '',
                    style: data.style || ''
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to load artwork details.');
                setLoading(false);
            }
        };
        fetchArtwork();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure quantity is sent as a number
            const payload = { ...formData, quantity: Number(formData.quantity) };
            await api.put(`/artists/artwork/${id}`, payload);
            navigate('/dashboard');
        } catch (err) {
            console.error("Update failed", err);
            console.error("Update error:", err);
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="auth-container">
            <h2>Edit Artwork</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label style={{color:'#fff'}}>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Price (₹)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Medium</label>
                    <input name="medium" value={formData.medium} onChange={handleChange} required />
                </div>
                

                <div className="form-group">
                    <label style={{color:'#ffffff'}}>Style</label>
                    <input name="style" value={formData.style} onChange={handleChange} required />
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn">Update Artwork</button>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', color: '#fff' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditArtwork;
