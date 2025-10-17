package handler

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/service"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(profileService *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{profileService: profileService}
}

// GetMyProfile - 自分のプロフィール取得
func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	profile, err := h.profileService.GetByUserID(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetProfileByUserID - 他人のプロフィール（チャンネル）取得
func (h *ProfileHandler) GetProfileByUserID(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	profile, err := h.profileService.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile - プロフィール更新
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Check if request is multipart/form-data
	contentType := c.GetHeader("Content-Type")
	if len(contentType) > 19 && contentType[:19] == "multipart/form-data" {
		h.UpdateProfileWithFiles(c)
		return
	}

	// JSON request
	var req model.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.profileService.Update(c.Request.Context(), userID.(int64), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfileWithFiles - ファイル付きプロフィール更新
func (h *ProfileHandler) UpdateProfileWithFiles(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Get form values
	channelName := c.PostForm("channel_name")
	description := c.PostForm("description")

	// Get icon file (optional)
	var iconFile io.ReadCloser
	var iconFilename, iconContentType string
	var iconSize int64

	iconFileHeader, err := c.FormFile("icon")
	if err == nil {
		iconFile, err = iconFileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open icon file"})
			return
		}
		defer iconFile.Close()
		iconFilename = iconFileHeader.Filename
		iconContentType = iconFileHeader.Header.Get("Content-Type")
		iconSize = iconFileHeader.Size
	}

	// Get banner file (optional)
	var bannerFile io.ReadCloser
	var bannerFilename, bannerContentType string
	var bannerSize int64

	bannerFileHeader, err := c.FormFile("banner")
	if err == nil {
		bannerFile, err = bannerFileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open banner file"})
			return
		}
		defer bannerFile.Close()
		bannerFilename = bannerFileHeader.Filename
		bannerContentType = bannerFileHeader.Header.Get("Content-Type")
		bannerSize = bannerFileHeader.Size
	}

	// Update profile with files
	profile, err := h.profileService.UpdateWithFiles(
		c.Request.Context(),
		userID.(int64),
		channelName,
		description,
		iconFile,
		iconFilename,
		iconContentType,
		iconSize,
		bannerFile,
		bannerFilename,
		bannerContentType,
		bannerSize,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}
