import React, { useState, useEffect } from 'react';
import '../styles/Captcha.css';

const Captcha = ({ onValidate }) => {
    const [captchaCode, setCaptchaCode] = useState('');
    const [inputVal, setInputVal] = useState('');

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (I, 1, O, 0)
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(result);
        setInputVal('');
        onValidate(false);
    };

    const handleChange = (e) => {
        const val = e.target.value.toUpperCase(); // Force uppercase for easier typing
        setInputVal(val);

        if (val === captchaCode) {
            onValidate(true);
        } else {
            onValidate(false);
        }
    };

    return (
        <div className="captcha-container">
            <div className="captcha-wrapper">
                <div className="captcha-display" onClick={generateCaptcha} title="Click to refresh">
                    {captchaCode.split('').map((char, index) => (
                        <span key={index} style={{ transform: `rotate(${Math.random() * 20 - 10}deg)` }}>
                            {char}
                        </span>
                    ))}
                </div>
                <button type="button" onClick={generateCaptcha} className="captcha-refresh-btn">↻</button>
            </div>

            <input
                type="text"
                value={inputVal}
                onChange={handleChange}
                placeholder="Enter code above"
                className="captcha-input-text"
                required
            />
        </div>
    );
};

export default Captcha;
