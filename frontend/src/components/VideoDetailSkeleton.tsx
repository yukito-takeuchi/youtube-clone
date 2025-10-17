'use client';

import { Container, Box, Skeleton } from '@mui/material';
import VideoCardSkeleton from './VideoCardSkeleton';

export default function VideoDetailSkeleton() {
  return (
    <Container
      maxWidth={false}
      sx={{ px: 0, maxWidth: 2400, mx: "auto", py: 1 }}
    >
      <Box sx={{ display: "flex", gap: 3, px: 2 }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Video Player Skeleton */}
          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: 2,
              mb: 2,
            }}
            animation="wave"
          />

          {/* Title Skeleton */}
          <Skeleton
            variant="text"
            width="90%"
            height={32}
            sx={{ mb: 1 }}
            animation="wave"
          />
          <Skeleton
            variant="text"
            width="60%"
            height={32}
            sx={{ mb: 2 }}
            animation="wave"
          />

          {/* Channel Info and Actions Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Channel Info Skeleton */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                animation="wave"
              />
              <Box>
                <Skeleton
                  variant="text"
                  width={120}
                  height={20}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={16}
                  animation="wave"
                />
              </Box>
              <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                sx={{ borderRadius: 50, ml: 1 }}
                animation="wave"
              />
            </Box>

            {/* Actions Skeleton */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton
                variant="rectangular"
                width={120}
                height={36}
                sx={{ borderRadius: 50 }}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                sx={{ borderRadius: 50 }}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                sx={{ borderRadius: 50 }}
                animation="wave"
              />
            </Box>
          </Box>

          {/* Description Box Skeleton */}
          <Box
            sx={{
              bgcolor: "action.hover",
              borderRadius: 2,
              p: 2,
              mt: 2,
            }}
          >
            <Skeleton
              variant="text"
              width="40%"
              height={20}
              sx={{ mb: 1 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="100%"
              height={16}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="90%"
              height={16}
              animation="wave"
            />
          </Box>

          {/* Comments Section Skeleton */}
          <Box sx={{ mt: 4 }}>
            <Skeleton
              variant="text"
              width={200}
              height={28}
              sx={{ mb: 2 }}
              animation="wave"
            />
            {/* Comment skeletons */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  animation="wave"
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={16}
                    sx={{ mb: 0.5 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={16}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="95%"
                    height={16}
                    animation="wave"
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Sidebar - Related Videos Skeleton */}
        <Box sx={{ width: 402, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1.5 }}>
                <Skeleton
                  variant="rectangular"
                  width={168}
                  height={94}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                  animation="wave"
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={18}
                    sx={{ mb: 0.5 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={18}
                    sx={{ mb: 0.5 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={14}
                    animation="wave"
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
