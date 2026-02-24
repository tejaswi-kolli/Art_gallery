import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/Auth.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }
            try {
                // Assuming backend POST /verify-email expects JSON body { token }
                // We're simulating the GET from email opening a page, which triggers the POST
                const { data } = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="auth-container">
            <div className="auth-form" style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Email Verification</h2>

                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <div style={{ color: 'green' }}>
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Go to Login</Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ color: 'red' }}>
                        <p>{message}</p>
                        <Link to="/register" className="btn btn-outline" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Register</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
