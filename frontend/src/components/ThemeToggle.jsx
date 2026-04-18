import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        padding: '0.6rem',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
