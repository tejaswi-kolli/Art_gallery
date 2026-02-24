import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/api';
import Captcha from '../components/Captcha';
import '../styles/Auth.css';

const ArtistRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [portfolio, setPortfolio] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Toggle Password

    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Field-specific errors
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Validation Logic
    const validateField = (field, value) => {
        let errors = { ...formErrors };

        switch (field) {
            case 'name':
                const nameRegex = /^[a-zA-Z\s]*$/;
                if (!value.trim()) errors.name = "Enter this field";
                else if (!nameRegex.test(value)) errors.name = "Name should contain only alphabets";
                else if (value.length > 50) errors.name = "Max length should be 50 Characters";
                else delete errors.name;
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) errors.email = "Enter this field";
                else if (!emailRegex.test(value)) errors.email = "Enter a valid email address";
                else delete errors.email;
                break;
            case 'password':
                const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
                if (!value) errors.password = "Enter this field";
                else if (!pwdRegex.test(value)) errors.password = "Password must be at least 6 characters, have 1 uppercase, 1 lowercase, 1 special char";
                else delete errors.password;
                break;
            case 'bio':
                if (!value.trim()) errors.bio = "Enter this field";
                else delete errors.bio;
                break;
            default:
                break;
        }
        setFormErrors(errors);
    };

    const handleInputChange = (field, value) => {
        if (field === 'name') setName(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);
        if (field === 'bio') setBio(value);

        validateField(field, value);
    };

    const handleFileChange = (e) => {
        setPortfolio(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation Check
        const errors = {};
        const nameRegex = /^[a-zA-Z\s]*$/;
        if (!name.trim()) errors.name = "Enter this field";
        else if (!nameRegex.test(name)) errors.name = "Name should contain only alphabets";
        else if (name.length > 50) errors.name = "Max length should be 50 Characters";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) errors.email = "Enter this field";
        else if (!emailRegex.test(email)) errors.email = "Enter a valid email address";

        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
        if (!password) errors.password = "Enter this field";
        else if (!pwdRegex.test(password)) errors.password = "Password must be at least 6 characters, have 1 uppercase, 1 lowercase, 1 special char";

        if (!bio.trim()) errors.bio = "Enter this field";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return;

        if (!isCaptchaValid) {
            setFormErrors({ ...errors, captcha: 'Wrong Captcha' });
            return;
        }

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('password', password);
        data.append('bio', bio);
        if (portfolio) {
            data.append('portfolio', portfolio);
        }

        try {
            const response = await api.post('/auth/register-artist', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Auto-login
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role); // Fix for Sidebar visibility
            window.dispatchEvent(new Event('authChange')); // Force UI update

            setSuccessMessage('Successfully Registered! Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Artist Registration</h2>
            {successMessage && (
                <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                    {successMessage}
                </div>
            )}
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-group">
                    <label style={{color:'#fff'}}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        placeholder="Enter name"
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'input-error' : ''}
                        autoFocus
                    />
                    {formErrors.name && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.name}</span>}
                </div>

                <div className="form-group">
                    <label style={{color:'#fff'}}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        placeholder="Enter email"
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={formErrors.email ? 'input-error' : ''}
                    />
                    {formErrors.email === "Enter a valid email address" && (
                        <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>
                            Format: abc@gmail.com
                        </span>
                    )}
                    {formErrors.email === "Enter this field" && (
                        <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>Enter this field</span>
                    )}
                </div>

                <div className="form-group">
                    <label style={{color:'#fff'}}>Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            placeholder="Enter password"
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={formErrors.password ? 'input-error' : ''}
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {formErrors.password && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.password}</span>}
                </div>

                <div className="form-group">
                    <label style={{color:'#fff'}}>Bio</label>
                    <textarea
                        rows="4"
                        value={bio}
                        placeholder="Enter bio"
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className={formErrors.bio ? 'input-error' : ''}
                    ></textarea>
                    {formErrors.bio && <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.bio}</span>}
                </div>

                <div className="form-group">
                    <label style={{color:'#fff'}}>Upload Portfolio (PDF/Image)</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                {/* CAPTCHA */}
                <Captcha onValidate={setIsCaptchaValid} />
                {formErrors.captcha && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '5px' }}>{formErrors.captcha}</div>}

                <button type="submit" className="btn btn-secondary" disabled={Object.keys(formErrors).length > 0 && false}>Register as Artist</button>
            </form>
            <div className="register-link">
                Already have an account? <Link to="/artist/login">Login</Link>
            </div>
        </div>
    );
};

export default ArtistRegister;
