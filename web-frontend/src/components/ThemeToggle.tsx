import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="neu-icon-button"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-neu-light-text dark:text-neu-dark-text" />
            ) : (
                <Sun className="w-5 h-5 text-neu-light-text dark:text-neu-dark-text" />
            )}
        </button>
    );
};

export default ThemeToggle;
