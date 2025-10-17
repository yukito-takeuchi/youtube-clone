package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yukito/video-platform/internal/service"
)

type WatchHistoryHandler struct {
	historyService *service.WatchHistoryService
}

func NewWatchHistoryHandler(historyService *service.WatchHistoryService) *WatchHistoryHandler {
	return &WatchHistoryHandler{historyService: historyService}
}

// AddToHistory handles POST /api/videos/:id/history
func (h *WatchHistoryHandler) AddToHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	videoID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video ID"})
		return
	}

	if err := h.historyService.AddToHistory(c.Request.Context(), userID.(int64), videoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "added to history successfully"})
}

// GetWatchHistory handles GET /api/history
func (h *WatchHistoryHandler) GetWatchHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Parse pagination parameters
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	// Limit max limit to 100
	if limit > 100 {
		limit = 100
	}

	history, err := h.historyService.GetWatchHistory(c.Request.Context(), userID.(int64), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}

// RemoveFromHistory handles DELETE /api/history/:video_id
func (h *WatchHistoryHandler) RemoveFromHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	videoID, err := strconv.ParseInt(c.Param("video_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video ID"})
		return
	}

	if err := h.historyService.RemoveFromHistory(c.Request.Context(), userID.(int64), videoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed from history successfully"})
}

// ClearHistory handles DELETE /api/history
func (h *WatchHistoryHandler) ClearHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	if err := h.historyService.ClearHistory(c.Request.Context(), userID.(int64)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "history cleared successfully"})
}

// GetHistoryCount handles GET /api/history/count
func (h *WatchHistoryHandler) GetHistoryCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	count, err := h.historyService.GetHistoryCount(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}
