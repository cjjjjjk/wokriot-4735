import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
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
        ? ['general', 'profile', 'manager', 'devices']
        : ['general', 'profile'];

    return (
        <header className="sticky top-0 z-50 bg-neu-light-surface dark:bg-neu-dark-surface backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-2">
                <div className="flex items-center justify-between h-8">
                    {/* logo và tabs */}
                    <div className="flex items-center gap-3">
                        {/* logo */}
                        <div className="flex items-center">
                            <span className="text-sm font-black bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                W
                            </span>
                            <span className="text-sm font-bold text-neu-light-text dark:text-neu-dark-text hidden sm:block">
                                okriot
                            </span>
                        </div>

                        {/* navigation tabs */}
                        <nav className="flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange(tab)}
                                    className={`px-2 py-1 text-xs font-medium transition-all duration-200
                           ${activeTab === tab
                                            ? 'bg-primary-500 text-white'
                                            : 'text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50'
                                        }`}
                                >
                                    {t(`tabs.${tab}`)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* right side: language, theme, user */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                            className="p-1 px-2 text-xs font-medium text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50 transition-colors uppercase"
                            title={t('header.language')}
                        >
                            {language}
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50 transition-colors"
                            title={t('header.theme')}
                        >
                            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* user dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-1 px-1.5 py-0.5 text-xs transition-all duration-200 hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50"
                            >
                                <span className="hidden sm:inline text-[10px] text-neu-light-text/70 dark:text-neu-dark-text/70">
                                    {t('header.hello')},
                                </span>
                                <span className="font-medium text-neu-light-text dark:text-neu-dark-text text-[10px]">
                                    {user?.full_name?.split(' ').pop()}
                                </span>
                                <ChevronDown
                                    className={`w-3 h-3 text-neu-light-text/50 dark:text-neu-dark-text/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* dropdown menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-1 w-48 bg-neu-light-surface dark:bg-neu-dark-surface border border-white/10 shadow-lg animate-fade-in">
                                    {/* user info */}
                                    <div className="p-2 border-b border-white/10">
                                        <p className="font-medium text-neu-light-text dark:text-neu-dark-text text-xs">
                                            {user?.full_name}
                                        </p>
                                        <p className="text-[10px] text-neu-light-text/60 dark:text-neu-dark-text/60 mt-0.5">
                                            {user?.email}
                                        </p>
                                        {user?.is_admin && (
                                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                                Admin
                                            </span>
                                        )}
                                    </div>

                                    {/* menu items */}
                                    <div className="py-0.5">
                                        <button
                                            onClick={() => { onTabChange('profile'); setShowDropdown(false); }}
                                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs
                               text-neu-light-text dark:text-neu-dark-text
                               hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg
                               transition-colors"
                                        >
                                            <User className="w-3 h-3" />
                                            {t('header.profile')}
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs
                               text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10
                               transition-colors"
                                        >
                                            <LogOut className="w-3 h-3" />
                                            {t('header.logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
