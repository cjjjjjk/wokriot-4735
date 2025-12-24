import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../LanguageToggle';
import './Header.css';

interface HeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // tabs dựa trên role
    const tabs = user?.is_admin
        ? ['general', 'profile', 'manager']
        : ['general', 'profile'];

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="header-logo">
                    <span className="logo-w">W</span>
                    <span className="logo-text">okriot</span>
                </div>
                <nav className="header-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => onTabChange(tab)}
                        >
                            {t(`tabs.${tab}`)}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="header-right">
                <LanguageToggle />

                <div className="user-dropdown" ref={dropdownRef}>
                    <button
                        className="user-trigger"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span className="greeting">{t('header.hello')},</span>
                        <span className="user-name">{user?.full_name?.split(' ').pop()}</span>
                        <svg className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {showDropdown && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <span className="dropdown-name">{user?.full_name}</span>
                                <span className="dropdown-email">{user?.email}</span>
                                {user?.is_admin && <span className="admin-badge">Admin</span>}
                            </div>
                            <div className="dropdown-divider"></div>
                            <button
                                className="dropdown-item"
                                onClick={() => { onTabChange('profile'); setShowDropdown(false); }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                {t('header.profile')}
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                {t('header.logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
