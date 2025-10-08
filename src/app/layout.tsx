'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Box sx={{ display: 'flex' }}>
              <Header onMenuClick={handleDrawerToggle} />
              <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  width: {
                    xs: '100%',
                    md: 'calc(100% - 5vw)',
                    lg: 'calc(100% - 5vw)',
                  },
                  minWidth: { md: 'calc(100% - 80px)' },
                  mt: 8,
                }}
              >
                {children}
              </Box>
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
