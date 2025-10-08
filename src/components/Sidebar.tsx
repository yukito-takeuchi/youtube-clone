'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  Toolbar,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  VideoCall as VideoCallIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Subscriptions as SubscriptionsIcon,
  VideoLibrary as VideoLibraryIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const DRAWER_WIDTH_VW = '5vw'; // Viewport width based
const DRAWER_MIN_WIDTH = '72px';
const DRAWER_MAX_WIDTH = '80px';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const handleNavigation = (path: string) => {
    router.push(path);
    onMobileClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    onMobileClose();
  };

  const menuItems = [
    { icon: <HomeIcon />, text: 'ホーム', path: '/' },
    { icon: <SubscriptionsIcon />, text: '登録チャンネル', path: '#', disabled: true },
    { icon: <VideoLibraryIcon />, text: 'ライブラリ', path: '#', disabled: true },
    { icon: <HistoryIcon />, text: '履歴', path: '#', disabled: true },
  ];

  const drawerContent = (
    <Box sx={{ width: '100%', pt: 1 }}>
      <List sx={{ px: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path && !item.disabled}
              onClick={() => !item.disabled && handleNavigation(item.path)}
              disabled={item.disabled}
              sx={{
                flexDirection: 'column',
                py: 2,
                px: 1,
                gap: 0.5,
                alignItems: 'center',
                minHeight: 74,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  justifyContent: 'center',
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.625rem',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.text}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}

        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton
              selected={pathname === '/videos/upload'}
              onClick={() => handleNavigation('/videos/upload')}
              sx={{
                flexDirection: 'column',
                py: 2,
                px: 1,
                gap: 0.5,
                alignItems: 'center',
                minHeight: 74,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  justifyContent: 'center',
                  color: pathname === '/videos/upload' ? 'primary.main' : 'inherit',
                }}
              >
                <VideoCallIcon />
              </ListItemIcon>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.625rem',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                アップロード
              </Typography>
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton
            onClick={isAuthenticated ? handleLogout : () => handleNavigation('/login')}
            sx={{
              flexDirection: 'column',
              py: 2,
              px: 1,
              gap: 0.5,
              alignItems: 'center',
              minHeight: 74,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 'auto',
                justifyContent: 'center',
              }}
            >
              {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
            </ListItemIcon>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.625rem',
                textAlign: 'center',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {isAuthenticated ? 'ログアウト' : 'ログイン'}
            </Typography>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH_VW,
          minWidth: DRAWER_MIN_WIDTH,
          maxWidth: DRAWER_MAX_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH_VW,
            minWidth: DRAWER_MIN_WIDTH,
            maxWidth: DRAWER_MAX_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH_VW as DRAWER_WIDTH, DRAWER_MIN_WIDTH, DRAWER_MAX_WIDTH };
