import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
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
        <div className="neu-container flex items-center justify-center p-4 relative overflow-hidden">
            {/* theme và language toggles */}
            <div className="absolute top-6 right-6 flex gap-3 z-10">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            {/* animated background orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* brand section - left */}
                <div className="hidden md:flex flex-col items-center justify-center space-y-6 p-8">
                    <div className="relative">
                        {/* giant W logo với neumorphism effect */}
                        <div className="text-[200px] font-black leading-none neu-card inline-block px-8 py-4">
                            <span className="bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                W
                            </span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-neu-light-text dark:text-neu-dark-text">
                            okriot
                        </h1>
                        <p className="text-6xl font-black text-primary-500">
                            4735
                        </p>
                    </div>
                </div>

                {/* form section - right */}
                <div className="neu-card max-w-md w-full mx-auto animate-fade-in">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-neu-light-text dark:text-neu-dark-text mb-2 flex items-center gap-2">
                            {t('login.welcome')}
                            <span className="inline-block w-1 h-8 bg-primary-500 animate-pulse"></span>
                        </h2>
                        <p className="text-neu-light-text/70 dark:text-neu-dark-text/70">
                            {t('login.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* email input */}
                        <div className="relative">
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
                                className="neu-input peer"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-4 -top-2.5 px-2 text-sm font-medium transition-all
                         bg-neu-light-surface dark:bg-neu-dark-surface
                         text-neu-light-text/70 dark:text-neu-dark-text/70
                         peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                         peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-500"
                            >
                                {t('login.email')}
                            </label>
                        </div>

                        {/* password input */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder=" "
                                required
                                disabled={isLoading}
                                className="neu-input peer pr-12"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-4 -top-2.5 px-2 text-sm font-medium transition-all
                         bg-neu-light-surface dark:bg-neu-dark-surface
                         text-neu-light-text/70 dark:text-neu-dark-text/70
                         peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                         peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-500"
                            >
                                {t('login.password')}
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 neu-icon-button p-2"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="neu-button w-full flex items-center justify-center gap-2 text-lg
                       bg-gradient-to-r from-primary-500 to-primary-600 text-white
                       hover:from-primary-600 hover:to-primary-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {t('login.submit').toUpperCase()}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;