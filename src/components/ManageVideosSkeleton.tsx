'use client';

import {
  Container,
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export default function ManageVideosSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Title */}
      <Skeleton variant="text" width={200} height={48} sx={{ mb: 3 }} animation="wave" />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Skeleton variant="text" width={60} height={20} animation="wave" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={80} height={20} animation="wave" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={70} height={20} animation="wave" />
              </TableCell>
              <TableCell align="right">
                <Skeleton variant="text" width={50} height={20} sx={{ ml: 'auto' }} animation="wave" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {/* Thumbnail */}
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={68}
                      sx={{ borderRadius: 1, flexShrink: 0 }}
                      animation="wave"
                    />
                    {/* Title and Description */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={24}
                        sx={{ mb: 0.5 }}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={20}
                        animation="wave"
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} height={20} animation="wave" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} height={20} animation="wave" />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
