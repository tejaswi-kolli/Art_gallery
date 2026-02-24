import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const UploadArtwork = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        quantity: '1',
        medium: '',
        style: '',
        collaboratorEmail: ''
    });
    const [images, setImages] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setImages(e.target.files); // array of files

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (images) {
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }
        }

        try {
            // Do NOT manually set Content-Type for FormData; axios handles it with boundary
            await api.post('/artists/upload-artwork', data);
            navigate('/dashboard');
        } catch (err) {
            console.error('Upload failed', err);
            setError(err.response?.data?.message || 'Failed to upload artwork. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Upload New Artwork</h2>
            {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label style={{color:'#fff'}}>Title</label>
                    <input name="title" placeholder="Enter title" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Description</label>
                    <textarea name="description" placeholder="Enter description" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Price</label>
                    <input type="number" name="price" placeholder="Enter price" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Medium (e.g. Oil, Digital)</label>
                    <input name="medium" onChange={handleChange} placeholder="Enter medium" required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Style (e.g. Abstract)</label>
                    <input name="style" onChange={handleChange} placeholder="Enter style" required />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Collaborator Email (Optional - Artist)</label>
                    <input type="email" name="collaboratorEmail" onChange={handleChange} placeholder="Enter artist email to collab" />
                </div>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Images</label>
                    <input type="file" multiple onChange={handleFileChange} required />
                </div>
                <button type="submit" className="btn">Upload</button>
            </form>
        </div>
    );
};

export default UploadArtwork;
