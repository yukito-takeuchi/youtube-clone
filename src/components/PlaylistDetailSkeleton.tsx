'use client';

import { Container, Box, Skeleton, Card, CardContent, List, ListItem } from '@mui/material';

export default function PlaylistDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 4 }}>
        {/* Left Column - Playlist Info */}
        <Box sx={{ width: 400, flexShrink: 0 }}>
          <Card
            sx={{
              position: "sticky",
              top: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
            }}
          >
            {/* Cover Image */}
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
                borderRadius: "8px 8px 0 0",
                bgcolor: "rgba(255,255,255,0.1)",
              }}
              animation="wave"
            />

            <CardContent sx={{ p: 3 }}>
              {/* Title */}
              <Skeleton
                variant="text"
                width="90%"
                height={32}
                sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)" }}
                animation="wave"
              />

              {/* Visibility */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Skeleton
                  variant="circular"
                  width={20}
                  height={20}
                  sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={20}
                  sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                  animation="wave"
                />
              </Box>

              {/* Updated date */}
              <Skeleton
                variant="text"
                width="70%"
                height={20}
                sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.2)" }}
                animation="wave"
              />

              {/* Description */}
              <Skeleton
                variant="text"
                width="100%"
                height={16}
                sx={{ mb: 0.5, bgcolor: "rgba(255,255,255,0.2)" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="90%"
                height={16}
                sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.2)" }}
                animation="wave"
              />

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 50, bgcolor: "rgba(255,255,255,0.3)" }}
                  animation="wave"
                />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={36}
                  sx={{ borderRadius: 50, bgcolor: "rgba(255,255,255,0.2)" }}
                  animation="wave"
                />
                <Skeleton
                  variant="circular"
                  width={36}
                  height={36}
                  sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                  animation="wave"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Video List */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={150} height={28} sx={{ mb: 1 }} animation="wave" />
            <Skeleton variant="text" width={250} height={20} animation="wave" />
          </Box>

          <List sx={{ p: 0 }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ListItem
                key={index}
                sx={{
                  p: 0,
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    p: 1,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Index */}
                  <Box sx={{ width: 24, textAlign: "center", mr: 2, mt: 1 }}>
                    <Skeleton variant="text" width={20} height={20} animation="wave" />
                  </Box>

                  {/* Thumbnail */}
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={68}
                    sx={{ borderRadius: 1, flexShrink: 0, mr: 2 }}
                    animation="wave"
                  />

                  {/* Video Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} animation="wave" />
                    <Skeleton variant="text" width="70%" height={16} animation="wave" />
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Container>
  );
}
