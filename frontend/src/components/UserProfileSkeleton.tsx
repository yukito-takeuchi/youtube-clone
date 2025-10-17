'use client';

import { Container, Box, Skeleton, Paper } from '@mui/material';
import VideoCardSkeleton from './VideoCardSkeleton';

export default function UserProfileSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ overflow: "hidden", mb: 2 }}>
        {/* Banner */}
        <Skeleton
          variant="rectangular"
          sx={{
            height: 200,
            width: '100%',
          }}
          animation="wave"
        />

        {/* Profile Info */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 2 }}>
            <Skeleton
              variant="circular"
              width={100}
              height={100}
              sx={{ mt: -8, border: "4px solid white" }}
              animation="wave"
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} animation="wave" />
              <Skeleton variant="text" width={200} height={20} sx={{ mb: 1 }} animation="wave" />
              <Skeleton variant="text" width="80%" height={20} animation="wave" />
              <Skeleton variant="text" width="60%" height={20} animation="wave" />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Skeleton variant="rectangular" width={180} height={36} sx={{ borderRadius: 1 }} animation="wave" />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} animation="wave" />
            <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} animation="wave" />
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderTop: 1, borderColor: "divider", px: 3 }}>
          <Box sx={{ display: "flex", gap: 3, py: 2 }}>
            <Skeleton variant="text" width={80} height={32} animation="wave" />
            <Skeleton variant="text" width={60} height={32} animation="wave" />
            <Skeleton variant="text" width={60} height={32} animation="wave" />
          </Box>
        </Box>
      </Paper>

      {/* Tab Content - Video Grid */}
      <Box sx={{ py: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
