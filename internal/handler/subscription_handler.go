package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yukito/video-platform/internal/service"
)

type SubscriptionHandler struct {
	subscriptionService *service.SubscriptionService
}

func NewSubscriptionHandler(subscriptionService *service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{subscriptionService: subscriptionService}
}

// Subscribe handles POST /api/users/:id/subscribe
func (h *SubscriptionHandler) Subscribe(c *gin.Context) {
	subscriberUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	subscribedToUserID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	if err := h.subscriptionService.Subscribe(c.Request.Context(), subscriberUserID.(int64), subscribedToUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "subscribed successfully"})
}

// Unsubscribe handles DELETE /api/users/:id/unsubscribe
func (h *SubscriptionHandler) Unsubscribe(c *gin.Context) {
	subscriberUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	subscribedToUserID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	if err := h.subscriptionService.Unsubscribe(c.Request.Context(), subscriberUserID.(int64), subscribedToUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "unsubscribed successfully"})
}

// GetSubscriptionStatus handles GET /api/users/:id/subscription-status
func (h *SubscriptionHandler) GetSubscriptionStatus(c *gin.Context) {
	subscriberUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	subscribedToUserID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	isSubscribed, err := h.subscriptionService.IsSubscribed(c.Request.Context(), subscriberUserID.(int64), subscribedToUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_subscribed": isSubscribed})
}

// GetSubscriberCount handles GET /api/users/:id/subscriber-count
func (h *SubscriptionHandler) GetSubscriberCount(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	count, err := h.subscriptionService.GetSubscriberCount(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"subscriber_count": count})
}

// GetSubscribedChannels handles GET /api/subscriptions
func (h *SubscriptionHandler) GetSubscribedChannels(c *gin.Context) {
	subscriberUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	subscriptions, err := h.subscriptionService.GetSubscribedChannels(c.Request.Context(), subscriberUserID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, subscriptions)
}

// GetSubscriptionFeed handles GET /api/feed/subscriptions
func (h *SubscriptionHandler) GetSubscriptionFeed(c *gin.Context) {
	subscriberUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Parse query parameters for pagination
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	videos, err := h.subscriptionService.GetSubscriptionFeed(c.Request.Context(), subscriberUserID.(int64), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, videos)
}
