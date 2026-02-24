import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/Auth.css'; // Reusing form styles

const ArtistProfileEdit = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        bio: '',
        instagram: '',
        twitter: '',
        website: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/artists/profile');
                console.log('Fetched Profile Data:', data); // DEBUG
                if (data) {
                    setFormData({
                        bio: data.bio || '',
                        instagram: data.socialLinks?.instagram || '',
                        twitter: data.socialLinks?.twitter || '',
                        website: data.socialLinks?.website || ''
                    });
                    if (data.profileImage) {
                        console.log('Setting Preview URL from DB:', `http://localhost:5000/${data.profileImage}`); // DEBUG
                        setPreviewUrl(`http://localhost:5000/${data.profileImage}`);

                        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

                        // Force update if missing or different
                        if (!currentUserInfo.profileImage || currentUserInfo.profileImage !== data.profileImage) {
                            console.log('Forcing localStorage sync:', data.profileImage);
                            currentUserInfo.profileImage = data.profileImage;
                            localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));

                            // Dispatch event multiple times to ensure listeners catch it
                            window.dispatchEvent(new Event('authChange'));
                            setTimeout(() => window.dispatchEvent(new Event('authChange')), 100);
                            setTimeout(() => window.dispatchEvent(new Event('authChange')), 500);
                        }
                    }
                    if (data.portfolio && data.portfolio.length > 0) {
                        setCurrentPortfolio(data.portfolio[0]);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile", error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePortfolioChange = (e) => {
        setPortfolioFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const data = new FormData();
        data.append('bio', formData.bio);

        // Prepare Social Links JSON or flat structure
        const socialLinks = {
            instagram: formData.instagram,
            twitter: formData.twitter,
            website: formData.website
        };
        data.append('socialLinks', JSON.stringify(socialLinks));

        if (imageFile) {
            data.append('profileImage', imageFile);
        }
        if (portfolioFile) {
            data.append('portfolio', portfolioFile);
        }

        try {
            const response = await api.put('/artists/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedArtistProfile = response.data; // The backend returns the updated ArtistProfile document

            // Update LocalStorage 'userInfo' to include the new profile image so TopBar updates
            const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (updatedArtistProfile.profileImage) {
                currentUserInfo.profileImage = updatedArtistProfile.profileImage; // Path already normalized by backend
                localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                window.dispatchEvent(new Event('authChange')); // Trigger TopBar update
            }

            setMessage('Profile updated successfully!');
            setIsError(false);
            window.scrollTo(0, 0); // Scroll to top
            // Optional: navigate back or stay
        } catch (error) {
            console.error(error);
            setIsError(true);
            setMessage(error.response?.data?.message || 'Failed to update profile.');
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="auth-container" style={{ maxWidth: '800px', padding: '0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'white', borderRadius: '12px' }}>
            {/* Banner Section */}
            <div style={{
                height: '150px',
                background: 'linear-gradient(135deg, #1e3c72 0%, #622f45ff 100%)', // Premium Blue Gradient
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                
            </div>

            <div style={{ padding: '0 40px 40px', position: 'relative', marginTop: '-75px' }}>
                {/* Profile Picture Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <div style={{
                            width: '150px', height: '150px', borderRadius: '50%', background: '#fff',
                            overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {console.log('Current Preview URL:', previewUrl)}
                            {previewUrl ? (
                                <img
                                    key={previewUrl} // Force re-render when URL changes to reset display:none
                                    src={previewUrl}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        console.error('Image failed to load:', previewUrl);
                                        e.target.onerror = null;
                                        e.target.style.display = 'none'; // Hide broken image
                                        // e.target.src = 'placeholder.jpg'; // Could set placeholder here
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#ccc', fontSize: '3rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
                                </span>
                            )}
                        </div>
                        <label className="btn btn-sm btn-outline" style={{
                            position: 'absolute', bottom: '5px', right: '5px',
                            padding: '0', borderRadius: '50%', minWidth: 'auto',
                            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'white', border: '1px solid #ddd', cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }} title="Change Profile Picture">
                            <span style={{ fontSize: '1.5rem', marginTop: '-4px', color: '#333' }}>+</span>
                            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                        </label>
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '10px',
                        background: isError ? '#f8d7da' : '#d4edda',
                        color: isError ? '#721c24' : '#155724',
                        marginBottom: '20px',
                        borderRadius: '4px'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Profile Picture Section REMOVED (Moved up) */}

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Tell us about your art..."
                        ></textarea>
                    </div>

                    <h3>Social Links</h3>
                    <div className="form-group">
                        <label style={{color:'#000000'}}>Instagram URL</label>
                        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="form-group">
                        <label style={{color:'#000000'}}>Twitter/X URL</label>
                        <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
                    </div>
                    <div className="form-group">
                        <label style={{color:'#000000'}}>Portfolio</label>
                        {currentPortfolio && (
                            <div style={{ marginBottom: '10px' }}>
                                <a
                                    href={`http://localhost:5000/${currentPortfolio}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#007bff' }}
                                >
                                    View Current Portfolio
                                </a>
                            </div>
                        )}
                        <input type="file" onChange={handlePortfolioChange} accept=".pdf,image/*" />
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            Upload new file to replace current one (PDF or Image)
                        </small>
                    </div>

                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </div> {/* End of inner container */}
        </div>
    );
};

export default ArtistProfileEdit;
