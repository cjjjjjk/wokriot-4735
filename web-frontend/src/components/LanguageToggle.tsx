import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="language-toggle">
            <button
                className={`lang-btn ${language === 'vi' ? 'active' : ''}`}
                onClick={() => setLanguage('vi')}
                aria-label="Chuyển sang tiếng Việt"
            >
                VI
            </button>
            <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
            >
                EN
            </button>
        </div>
    );
};

export default LanguageToggle;
