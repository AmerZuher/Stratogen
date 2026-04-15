import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// FIX: Expanded the Theme type to include all available themes.
export type Theme = 'light' | 'dark' | 'green' | 'orange' | 'lavender' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // FIX: Changed the default state to 'light' for consistency.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('clarity-ppm-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    // Create a list of all possible theme classes to ensure they are all removed.
    const allThemes: Theme[] = ['light', 'dark', 'green', 'orange', 'lavender', 'ocean'];
    
    // Remove any existing theme classes from the body.
    allThemes.forEach(t => body.classList.remove(`theme-${t}`));

    // Add the class for the currently selected theme.
    // This now correctly adds 'theme-light' when the light theme is active.
    body.classList.add(`theme-${theme}`);
    
    // Save the current theme to localStorage
    localStorage.setItem('clarity-ppm-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
