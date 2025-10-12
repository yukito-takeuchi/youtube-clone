package handler

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/service"
)

type VideoHandler struct {
	videoService *service.VideoService
}

func NewVideoHandler(videoService *service.VideoService) *VideoHandler {
	return &VideoHandler{videoService: videoService}
}

func (h *VideoHandler) Create(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Check if request is multipart/form-data
	contentType := c.GetHeader("Content-Type")
	if len(contentType) > 19 && contentType[:19] == "multipart/form-data" {
		h.CreateWithFiles(c)
		return
	}

	// JSON request (backward compatibility)
	var req model.CreateVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	video, err := h.videoService.Create(c.Request.Context(), userID.(int64), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, video)
}

func (h *VideoHandler) CreateWithFiles(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Get form values
	title := c.PostForm("title")
	description := c.PostForm("description")

	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	// Get video file
	videoFileHeader, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video file is required"})
		return
	}

	videoFile, err := videoFileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open video file"})
		return
	}
	defer videoFile.Close()

	// Get thumbnail file (optional)
	var thumbnailFile io.ReadCloser
	var thumbnailFilename, thumbnailContentType string
	var thumbnailSize int64

	thumbnailFileHeader, err := c.FormFile("thumbnail")
	if err == nil {
		thumbnailFile, err = thumbnailFileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open thumbnail file"})
			return
		}
		defer thumbnailFile.Close()
		thumbnailFilename = thumbnailFileHeader.Filename
		thumbnailContentType = thumbnailFileHeader.Header.Get("Content-Type")
		thumbnailSize = thumbnailFileHeader.Size
	}

	// Create video with files
	video, err := h.videoService.CreateWithFiles(
		c.Request.Context(),
		userID.(int64),
		title,
		description,
		videoFile,
		videoFileHeader.Filename,
		videoFileHeader.Header.Get("Content-Type"),
		videoFileHeader.Size,
		thumbnailFile,
		thumbnailFilename,
		thumbnailContentType,
		thumbnailSize,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, video)
}

func (h *VideoHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video ID"})
		return
	}

	video, err := h.videoService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "video not found"})
		return
	}

	c.JSON(http.StatusOK, video)
}

func (h *VideoHandler) List(c *gin.Context) {
	videos, err := h.videoService.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, videos)
}

func (h *VideoHandler) Update(c *gin.Context) {
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

	// Check if request is multipart/form-data
	contentType := c.GetHeader("Content-Type")
	if len(contentType) > 19 && contentType[:19] == "multipart/form-data" {
		h.UpdateWithFiles(c, videoID)
		return
	}

	// JSON request (backward compatibility)
	var req model.UpdateVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	video, err := h.videoService.Update(c.Request.Context(), userID.(int64), videoID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, video)
}

func (h *VideoHandler) UpdateWithFiles(c *gin.Context, videoID int64) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Get form values
	title := c.PostForm("title")
	description := c.PostForm("description")

	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	// Get video file (optional for update)
	var videoFile io.ReadCloser
	var videoFilename, videoContentType string
	var videoSize int64

	videoFileHeader, err := c.FormFile("video")
	if err == nil {
		videoFile, err = videoFileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open video file"})
			return
		}
		defer videoFile.Close()
		videoFilename = videoFileHeader.Filename
		videoContentType = videoFileHeader.Header.Get("Content-Type")
		videoSize = videoFileHeader.Size
	}

	// Get thumbnail file (optional)
	var thumbnailFile io.ReadCloser
	var thumbnailFilename, thumbnailContentType string
	var thumbnailSize int64

	thumbnailFileHeader, err := c.FormFile("thumbnail")
	if err == nil {
		thumbnailFile, err = thumbnailFileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open thumbnail file"})
			return
		}
		defer thumbnailFile.Close()
		thumbnailFilename = thumbnailFileHeader.Filename
		thumbnailContentType = thumbnailFileHeader.Header.Get("Content-Type")
		thumbnailSize = thumbnailFileHeader.Size
	}

	// Update video with files
	video, err := h.videoService.UpdateWithFiles(
		c.Request.Context(),
		userID.(int64),
		videoID,
		title,
		description,
		videoFile,
		videoFilename,
		videoContentType,
		videoSize,
		thumbnailFile,
		thumbnailFilename,
		thumbnailContentType,
		thumbnailSize,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, video)
}

func (h *VideoHandler) Delete(c *gin.Context) {
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

	if err := h.videoService.Delete(c.Request.Context(), userID.(int64), videoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "video deleted successfully"})
}
