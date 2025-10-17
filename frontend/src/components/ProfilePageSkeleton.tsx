'use client';

import { Container, Box, Skeleton, Card } from '@mui/material';

export default function ProfilePageSkeleton() {
  return (
    <Container maxWidth={false} sx={{ px: 2, maxWidth: 1800, mx: "auto", py: 3 }}>
      {/* Compact Profile Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={56} height={56} animation="wave" />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 0.5 }} animation="wave" />
          <Skeleton variant="text" width={250} height={20} animation="wave" />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} animation="wave" />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} animation="wave" />
        </Box>
      </Box>

      {/* History Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
            <Skeleton variant="text" width={80} height={28} animation="wave" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="text" width={100} height={20} animation="wave" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc((100% - 16px) / 2)",
                  md: "calc((100% - 32px) / 3)",
                  lg: "calc((100% - 64px) / 5)",
                },
                flex: "0 0 auto",
                bgcolor: "transparent",
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  aspectRatio: "16/9",
                }}
                animation="wave"
              />
              <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="90%" height={20} animation="wave" />
                <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="60%" height={16} animation="wave" />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Playlists Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
            <Skeleton variant="text" width={100} height={28} animation="wave" />
            <Skeleton variant="text" width={30} height={20} animation="wave" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="text" width={100} height={20} animation="wave" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc((100% - 16px) / 2)",
                  md: "calc((100% - 32px) / 3)",
                  lg: "calc((100% - 64px) / 5)",
                },
                flex: "0 0 auto",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '100%',
                  paddingTop: '56.25%',
                }}
                animation="wave"
              />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} animation="wave" />
                <Skeleton variant="text" width="60%" height={16} animation="wave" />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Watch Later Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
            <Skeleton variant="text" width={120} height={28} animation="wave" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="text" width={100} height={20} animation="wave" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc((100% - 16px) / 2)",
                  md: "calc((100% - 32px) / 3)",
                  lg: "calc((100% - 64px) / 5)",
                },
                flex: "0 0 auto",
                bgcolor: "transparent",
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  aspectRatio: "16/9",
                }}
                animation="wave"
              />
              <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="90%" height={20} animation="wave" />
                <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="60%" height={16} animation="wave" />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Liked Videos Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
            <Skeleton variant="text" width={150} height={28} animation="wave" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="text" width={100} height={20} animation="wave" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc((100% - 16px) / 2)",
                  md: "calc((100% - 32px) / 3)",
                  lg: "calc((100% - 64px) / 5)",
                },
                flex: "0 0 auto",
                bgcolor: "transparent",
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  aspectRatio: "16/9",
                }}
                animation="wave"
              />
              <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="90%" height={20} animation="wave" />
                <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="60%" height={16} animation="wave" />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
