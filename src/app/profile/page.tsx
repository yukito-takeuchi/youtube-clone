'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container, CircularProgress } from '@mui/material';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        router.replace(`/profile/${user.id}`);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );
}
