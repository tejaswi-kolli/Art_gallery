import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/api';
import Captcha from '../components/Captcha';
import '../styles/Auth.css';

const BuyerRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle Password
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Field-specific errors

    // General error/success messages
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
            default:
                break;
        }
        setFormErrors(errors);
    };

    const handleInputChange = (field, value) => {
        if (field === 'name') setName(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);

        validateField(field, value);
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

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return;

        if (!isCaptchaValid) {
            setFormErrors({ ...errors, captcha: 'Wrong Captcha' });
            return;
        }

        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
                role: 'buyer'
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
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
            <h2>Buyer Registration</h2>
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
                    {/* Show format helper ONLY if there is a specific format error */}
                    {formErrors.email === "Enter a valid email address" && (
                        <span className="error-text" style={{ color: 'red', fontSize: '0.85rem' }}>
                            Format: abc@gmail.com
                        </span>
                    )}
                    {/* Show generic required error */}
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

                {/* CAPTCHA */}
                <Captcha onValidate={setIsCaptchaValid} />
                {formErrors.captcha && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '5px' }}>{formErrors.captcha}</div>}

                <button type="submit" className="btn" disabled={Object.keys(formErrors).length > 0 && false}>Register</button>
            </form>
            <div className="register-link">
                Already have an account? <Link to="/buyer/login">Login</Link>
            </div>
        </div>
    );
};

export default BuyerRegister;
