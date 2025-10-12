'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";
import { useState } from "react";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 動画詳細ページかどうかをチェック (/videos/123 のようなパス)
  const isVideoDetailPage = pathname ? /^\/videos\/\d+$/.test(pathname) : false;

  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Box sx={{ display: 'flex' }}>
              <Header onMenuClick={handleDrawerToggle} />
              {!isVideoDetailPage && (
                <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
              )}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: isVideoDetailPage ? 2 : 3,
                  width: '100%',
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
