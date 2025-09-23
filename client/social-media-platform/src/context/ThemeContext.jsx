import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('social-point-theme');
    return savedTheme || 'dark';
  });

  const themes = {
    light: {
      name: 'Light',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#06B6D4',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        surfaceVariant: '#F1F5F9',
        text: '#1E293B',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        hover: '#F1F5F9',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#60A5FA',
        secondary: '#A78BFA',
        accent: '#22D3EE',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceVariant: '#334155',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1',
        border: '#475569',
        hover: '#334155',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA'
      }
    },
    purple: {
      name: 'Purple',
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#1A0B2E',
        surface: '#2D1B69',
        surfaceVariant: '#4C1D95',
        text: '#F3E8FF',
        textSecondary: '#C4B5FD',
        border: '#6B46C1',
        hover: '#4C1D95',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#8B5CF6'
      }
    },
    ocean: {
      name: 'Ocean',
      colors: {
        primary: '#06B6D4',
        secondary: '#3B82F6',
        accent: '#10B981',
        background: '#0C4A6E',
        surface: '#075985',
        surfaceVariant: '#0369A1',
        text: '#E0F2FE',
        textSecondary: '#BAE6FD',
        border: '#0284C7',
        hover: '#0369A1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4'
      }
    },
    sunset: {
      name: 'Sunset',
      colors: {
        primary: '#F97316',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#7C2D12',
        surface: '#9A3412',
        surfaceVariant: '#C2410C',
        text: '#FED7AA',
        textSecondary: '#FDBA74',
        border: '#EA580C',
        hover: '#C2410C',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#F97316'
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('social-point-theme', theme);
    const currentTheme = themes[theme];
    
    // Apply CSS custom properties
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Update body class for theme
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    themes,
    currentTheme: themes[theme],
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
