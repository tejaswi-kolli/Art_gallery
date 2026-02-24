import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Auth.css';

const LoginSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRegister = location.pathname === '/register';

    const handleSelection = (role) => {
        const path = `/${role}/${isRegister ? 'register' : 'login'}`;
        navigate(path);
    };

    return (
        <div className="auth-selection-container">
            <h2>{isRegister ? 'Join Arthub' : 'Welcome'}</h2>
            <p className="subtitle">Please select your role to {isRegister ? 'register' : 'login'}</p>

            <div className="role-cards">
                <div className="role-card clickable" onClick={() => handleSelection('buyer')}>
                    <h3>I am a Buyer</h3>
                    <p>Discover and purchase unique artworks.</p>
                </div>

                <div className="role-card clickable" onClick={() => handleSelection('artist')}>
                    <h3>I am an Artist</h3>
                    <p>Showcase your portfolio and sell your art.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSelection;
