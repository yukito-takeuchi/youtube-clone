'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedMode = localStorage.getItem('theme') as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#ff0000',
            light: '#ff4444',
            dark: '#cc0000',
          },
          background: {
            default: mode === 'light' ? '#f9f9f9' : '#0f0f0f',
            paper: mode === 'light' ? '#ffffff' : '#212121',
          },
          text: {
            primary: mode === 'light' ? '#0f0f0f' : '#f1f1f1',
            secondary: mode === 'light' ? '#606060' : '#aaaaaa',
          },
        },
        typography: {
          fontFamily: 'Roboto, "Noto Sans JP", sans-serif',
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#212121',
                color: mode === 'light' ? '#0f0f0f' : '#f1f1f1',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#212121',
                borderRight: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #303030',
              },
            },
          },
        },
      }),
    [mode]
  );

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
