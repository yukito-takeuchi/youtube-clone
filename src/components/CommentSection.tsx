'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { Comment as CommentType, Profile } from '@/types';
import { api } from '@/lib/api';
import CommentInput from './CommentInput';
import Comment from './Comment';

interface CommentSectionProps {
  videoId: number;
  videoCreatorId: number;
  currentUserId?: number;
  currentUserProfile?: Profile;
}

export default function CommentSection({
  videoId,
  videoCreatorId,
  currentUserId,
  currentUserProfile,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [repliesMap, setRepliesMap] = useState<Record<number, CommentType[]>>({});
  const [loadingRepliesMap, setLoadingRepliesMap] = useState<Record<number, boolean>>({});
  const [repliesOffsetMap, setRepliesOffsetMap] = useState<Record<number, number>>({});
  const [repliesHasMoreMap, setRepliesHasMoreMap] = useState<Record<number, boolean>>({});

  const observerTarget = useRef<HTMLDivElement>(null);
  const LIMIT = 20;
  const REPLIES_LIMIT = 20;
  const MIN_LOADING_TIME = 500; // Minimum time to show loading indicator (ms)

  // Load initial comments and comment count
  useEffect(() => {
    loadCommentCount();
    loadComments(true);
  }, [videoId]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadComments(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, offset]);

  const loadCommentCount = async () => {
    try {
      const count = await api.getCommentCount(videoId);
      setCommentCount(count);
    } catch (error) {
      console.error('Failed to load comment count:', error);
    }
  };

  const loadComments = async (reset: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const currentOffset = reset ? 0 : offset;
      const newComments = await api.getCommentsByVideoID(videoId, LIMIT, currentOffset);

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }

      if (reset) {
        setComments(newComments);
        setOffset(LIMIT);
      } else {
        setComments((prev) => [...prev, ...newComments]);
        setOffset((prev) => prev + LIMIT);
      }

      setHasMore(newComments.length === LIMIT);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReplies = async (commentId: number, reset: boolean = true) => {
    if (loadingRepliesMap[commentId]) return;

    setLoadingRepliesMap((prev) => ({ ...prev, [commentId]: true }));
    const startTime = Date.now();

    try {
      const currentOffset = reset ? 0 : (repliesOffsetMap[commentId] || 0);
      const replies = await api.getRepliesByParentID(commentId, REPLIES_LIMIT, currentOffset);

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }

      if (reset) {
        setRepliesMap((prev) => ({ ...prev, [commentId]: replies }));
        setRepliesOffsetMap((prev) => ({ ...prev, [commentId]: REPLIES_LIMIT }));
      } else {
        setRepliesMap((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), ...replies],
        }));
        setRepliesOffsetMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] || 0) + REPLIES_LIMIT,
        }));
      }

      setRepliesHasMoreMap((prev) => ({
        ...prev,
        [commentId]: replies.length === REPLIES_LIMIT,
      }));
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingRepliesMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const loadMoreReplies = async (commentId: number) => {
    await loadReplies(commentId, false);
  };

  const handleCreateComment = async (content: string) => {
    if (!currentUserId) return;

    try {
      await api.createComment({
        video_id: videoId,
        content,
      });
      // Reload comments and count
      await loadCommentCount();
      await loadComments(true);
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const handleCreateReply = async (parentCommentId: number, content: string) => {
    if (!currentUserId) return;

    try {
      await api.createComment({
        video_id: videoId,
        parent_comment_id: parentCommentId,
        content,
      });
      // Reload comments, count, and replies
      await loadCommentCount();
      await loadComments(true);
      await loadReplies(parentCommentId);
    } catch (error) {
      console.error('Failed to create reply:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUserId) return;

    try {
      await api.deleteComment(commentId);
      // Reload comments and count
      await loadCommentCount();
      await loadComments(true);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeChange = useCallback(() => {
    // Reload comments to reflect like changes
    loadComments(true);
  }, []);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Comment Count Header */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {commentCount.toLocaleString()} 件のコメント
      </Typography>

      {/* Comment Input */}
      {currentUserId && (
        <CommentInput
          onSubmit={handleCreateComment}
          userIconUrl={currentUserProfile?.icon_url}
        />
      )}

      <Divider sx={{ my: 2 }} />

      {/* Comments List */}
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          videoCreatorId={videoCreatorId}
          onReply={handleCreateReply}
          onDelete={handleDeleteComment}
          onLikeChange={handleLikeChange}
          onLoadReplies={loadReplies}
          onLoadMoreReplies={loadMoreReplies}
          replies={repliesMap[comment.id] || []}
          isLoadingReplies={loadingRepliesMap[comment.id] || false}
          hasMoreReplies={repliesHasMoreMap[comment.id] || false}
        />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Infinite Scroll Observer Target */}
      <div ref={observerTarget} style={{ height: '20px' }} />

      {/* No More Comments */}
      {!hasMore && comments.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            すべてのコメントを表示しました
          </Typography>
        </Box>
      )}

      {/* No Comments Yet */}
      {!isLoading && comments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
            コメントはまだありません
          </Typography>
          {!currentUserId && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              最初にコメントするにはログインしてください
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
