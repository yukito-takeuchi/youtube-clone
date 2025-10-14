"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  MoreVert as MoreVertIcon,
  PushPin as PushPinIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { Comment as CommentType, Profile } from "@/types";
import { api } from "@/lib/api";
import { getIconUrl } from "@/lib/defaults";
import CommentInput from "./CommentInput";

interface CommentProps {
  comment: CommentType;
  currentUserId?: number;
  videoCreatorId: number;
  videoCreatorProfile?: Profile;
  onReply?: (commentId: number, content: string) => Promise<void>;
  onUpdate?: (commentId: number, content: string) => Promise<void>;
  onDelete?: (commentId: number) => Promise<void>;
  onLikeChange?: () => void;
  onLoadReplies?: (commentId: number) => void;
  onLoadMoreReplies?: (commentId: number) => Promise<void>;
  replies?: CommentType[];
  isLoadingReplies?: boolean;
  hasMoreReplies?: boolean;
}

// Minimum time to show loading indicator (ms)
const MIN_LOADING_TIME = 300;

// Helper function to format relative date
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears}年前`;
  } else if (diffMonths > 0) {
    return `${diffMonths}ヶ月前`;
  } else if (diffWeeks > 0) {
    return `${diffWeeks}週間前`;
  } else if (diffDays > 0) {
    return `${diffDays}日前`;
  } else if (diffHours > 0) {
    return `${diffHours}時間前`;
  } else if (diffMins > 0) {
    return `${diffMins}分前`;
  } else {
    return "数秒前";
  }
}

export default function Comment({
  comment,
  currentUserId,
  videoCreatorId,
  videoCreatorProfile,
  onReply,
  onUpdate,
  onDelete,
  onLikeChange,
  onLoadReplies,
  onLoadMoreReplies,
  replies = [],
  isLoadingReplies = false,
  hasMoreReplies = false,
}: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.like_count);
  const [localUserLikeType, setLocalUserLikeType] = useState(
    comment.user_like_type
  );

  // Update local state when comment prop changes (fixes reload issue)
  useEffect(() => {
    setLocalLikeCount(comment.like_count);
    setLocalUserLikeType(comment.user_like_type);
  }, [comment.id, comment.like_count, comment.user_like_type]);

  const isOwner = currentUserId === comment.user_id;
  const isVideoCreator = currentUserId === videoCreatorId;
  const isCommentByCreator = comment.is_video_creator;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);
    const startTime = Date.now();

    try {
      if (localUserLikeType === "like") {
        // Unlike
        await api.unlikeComment(comment.id);
        setLocalUserLikeType(null);
        setLocalLikeCount((prev) => prev - 1);
      } else if (localUserLikeType === "dislike") {
        // Change from dislike to like
        await api.likeComment(comment.id, { like_type: "like" });
        setLocalUserLikeType("like");
        setLocalLikeCount((prev) => prev + 1);
      } else {
        // Like
        await api.likeComment(comment.id, { like_type: "like" });
        setLocalUserLikeType("like");
        setLocalLikeCount((prev) => prev + 1);
      }

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
        );
      }

      onLikeChange?.();
    } catch (error) {
      console.error("Failed to like comment:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);
    const startTime = Date.now();

    try {
      if (localUserLikeType === "dislike") {
        // Remove dislike
        await api.unlikeComment(comment.id);
        setLocalUserLikeType(null);
      } else if (localUserLikeType === "like") {
        // Change from like to dislike
        await api.likeComment(comment.id, { like_type: "dislike" });
        setLocalUserLikeType("dislike");
        setLocalLikeCount((prev) => prev - 1);
      } else {
        // Dislike
        await api.likeComment(comment.id, { like_type: "dislike" });
        setLocalUserLikeType("dislike");
      }

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
        );
      }

      onLikeChange?.();
    } catch (error) {
      console.error("Failed to dislike comment:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async (content: string) => {
    if (onReply) {
      await onReply(comment.id, content);
      setShowReplyInput(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(comment.id);
    }
    handleMenuClose();
  };

  const handlePin = async () => {
    try {
      await api.pinComment(comment.id, !comment.is_pinned);
      onLikeChange?.(); // Refresh comments
    } catch (error) {
      console.error("Failed to pin comment:", error);
    }
    handleMenuClose();
  };

  const handleCreatorLike = async () => {
    try {
      await api.setCreatorLiked(comment.id, !comment.is_creator_liked);
      onLikeChange?.(); // Refresh comments
    } catch (error) {
      console.error("Failed to set creator liked:", error);
    }
    handleMenuClose();
  };

  const handleShowReplies = () => {
    if (!showReplies && onLoadReplies) {
      onLoadReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 2,
      }}
    >
      <Link
        href={`/profile/${comment.user_id}`}
        style={{ textDecoration: "none" }}
      >
        <Avatar
          src={getIconUrl(comment.profile?.icon_url)}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
        >
          {comment.profile?.channel_name?.[0]?.toUpperCase() || "U"}
        </Avatar>
      </Link>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          {comment.is_pinned && (
            <PushPinIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          )}
          <Link
            href={`/profile/${comment.user_id}`}
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "text.primary",
                cursor: "pointer",
                bgcolor: isCommentByCreator ? "action.selected" : "transparent",
                px: isCommentByCreator ? 0.75 : 0,
                py: isCommentByCreator ? 0.25 : 0,
                borderRadius: isCommentByCreator ? 0.5 : 0,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {comment.profile?.channel_name || "ユーザー"}
            </Typography>
          </Link>
          {isCommentByCreator && (
            <Box
              sx={{
                bgcolor: "grey.300",
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              作成者
            </Box>
          )}
          {comment.is_creator_liked && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Avatar
                src={getIconUrl(videoCreatorProfile?.icon_url)}
                sx={{ width: 16, height: 16 }}
              >
                {videoCreatorProfile?.channel_name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <FavoriteIcon sx={{ fontSize: 14, color: "error.main" }} />
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {getRelativeTime(comment.created_at)}
          </Typography>
        </Box>

        {/* Content */}
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            mb: 1,
          }}
        >
          {comment.content}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleLike}
            disabled={isLiking || !currentUserId}
            sx={{ "&:hover": { bgcolor: "action.hover" } }}
          >
            {localUserLikeType === "like" ? (
              <ThumbUpIcon fontSize="small" />
            ) : (
              <ThumbUpOutlinedIcon fontSize="small" />
            )}
          </IconButton>
          {localLikeCount > 0 && (
            <Typography variant="caption" sx={{ mr: 1 }}>
              {localLikeCount}
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={handleDislike}
            disabled={isLiking || !currentUserId}
            sx={{ "&:hover": { bgcolor: "action.hover" } }}
          >
            {localUserLikeType === "dislike" ? (
              <ThumbDownIcon fontSize="small" />
            ) : (
              <ThumbDownOutlinedIcon fontSize="small" />
            )}
          </IconButton>

          {onReply && !comment.parent_comment_id && (
            <Button
              size="small"
              onClick={() => setShowReplyInput(!showReplyInput)}
              disabled={!currentUserId}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                ml: 1,
              }}
            >
              返信
            </Button>
          )}

          {(isOwner || isVideoCreator) && (
            <>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {isVideoCreator && !comment.parent_comment_id && (
                  <MenuItem onClick={handlePin}>
                    {comment.is_pinned ? "固定を解除" : "コメントを固定"}
                  </MenuItem>
                )}
                {isVideoCreator && (
                  <MenuItem onClick={handleCreatorLike}>
                    {comment.is_creator_liked
                      ? "ハートを解除"
                      : "ハートをつける"}
                  </MenuItem>
                )}
                {isOwner && <MenuItem onClick={handleDelete}>削除</MenuItem>}
              </Menu>
            </>
          )}
        </Box>

        {/* Reply Input */}
        {showReplyInput && currentUserId && (
          <Box sx={{ mt: 2 }}>
            <CommentInput
              onSubmit={handleReplySubmit}
              placeholder={`@${
                comment.profile?.channel_name || "ユーザー"
              } に返信...`}
              autoFocus
            />
          </Box>
        )}

        {/* Show Replies Button */}
        {!comment.parent_comment_id && comment.reply_count! > 0 && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={handleShowReplies}
              startIcon={
                isLoadingReplies ? <CircularProgress size={16} /> : null
              }
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "primary.main",
              }}
            >
              {showReplies
                ? "返信を非表示"
                : `${comment.reply_count} 件の返信を表示`}
            </Button>
          </Box>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                videoCreatorId={videoCreatorId}
                videoCreatorProfile={videoCreatorProfile}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLikeChange={onLikeChange}
              />
            ))}
            {/* Load More Replies Button */}
            {hasMoreReplies && onLoadMoreReplies && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => onLoadMoreReplies(comment.id)}
                  disabled={isLoadingReplies}
                  startIcon={
                    isLoadingReplies ? <CircularProgress size={16} /> : null
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    color: "primary.main",
                  }}
                >
                  {isLoadingReplies ? "読み込み中..." : "さらに返信を読み込む"}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
