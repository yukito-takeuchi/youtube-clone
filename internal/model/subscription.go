package model

import "time"

// Subscription represents a channel subscription
type Subscription struct {
	ID               int64     `json:"id"`
	SubscriberUserID int64     `json:"subscriber_user_id"` // The user who subscribes
	SubscribedToUserID int64   `json:"subscribed_to_user_id"` // The channel/user being subscribed to
	CreatedAt        time.Time `json:"created_at"`
}

// SubscriptionWithProfile represents a subscription with profile information
type SubscriptionWithProfile struct {
	Subscription
	Profile *Profile `json:"profile"`
}
