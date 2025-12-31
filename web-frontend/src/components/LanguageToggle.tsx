import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 neu-card px-3 py-2">
            <Languages className="w-4 h-4 text-neu-light-text dark:text-neu-dark-text" />
            <div className="flex gap-1">
                <button
                    onClick={() => setLanguage('vi')}
                    aria-label="Chuyển sang tiếng Việt"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                     ${language === 'vi'
                            ? 'bg-primary-500 text-white shadow-neu-sm'
                            : 'text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg'
                        }`}
                >
                    VI
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    aria-label="Switch to English"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                     ${language === 'en'
                            ? 'bg-primary-500 text-white shadow-neu-sm'
                            : 'text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg'
                        }`}
                >
                    EN
                </button>
            </div>
        </div>
    );
};

export default LanguageToggle;
