'use client';

import { Card, CardContent, Box, Skeleton } from '@mui/material';

export default function VideoCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'transparent',
      }}
    >
      {/* Thumbnail Skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          paddingTop: '56.25%', // 16:9 aspect ratio
          borderRadius: 2,
        }}
        animation="wave"
      />

      {/* Info Skeleton */}
      <CardContent sx={{ px: 0, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Avatar Skeleton */}
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            animation="wave"
          />

          {/* Text Skeletons */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title - 2 lines */}
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ mb: 0.5 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="80%"
              height={20}
              sx={{ mb: 0.5 }}
              animation="wave"
            />

            {/* Channel name */}
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              sx={{ mb: 0.25 }}
              animation="wave"
            />

            {/* View count and date */}
            <Skeleton
              variant="text"
              width="60%"
              height={16}
              animation="wave"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
