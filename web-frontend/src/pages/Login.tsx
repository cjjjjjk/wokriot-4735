import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData);
            showToast('success', t('login.success'));
            setTimeout(() => navigate('/'), 300);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || t('login.error');
            showToast('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* language toggle button */}
            <div className="language-toggle-container">
                <LanguageToggle />
            </div>

            {/* Background Orbs Animation */}
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>

            <div className="login-container">
                {/* Brand Section (Left) */}
                <div className="brand-section">
                    <span className="brand-pattern">W</span>
                    <div className="brand-content">
                        <div className="giant-w">W</div>
                        <span className="brand-name">okriot</span>
                        <div className="brand-text-group">
                            <span className="brand-code">4375</span>
                        </div>
                    </div>
                </div>

                {/* Form Section (Right) */}
                <div className="form-section">
                    <div className="login-header">
                        <h2>{t('login.welcome')}<span className="blinking-cursor">▬</span></h2>
                        <p>{t('login.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder=" "
                                required
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <label htmlFor="email">{t('login.email')}</label>
                        </div>

                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder=" "
                                required
                                disabled={isLoading}
                            />
                            <label htmlFor="password">{t('login.password')}</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? '' : t('login.submit').toUpperCase()}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;