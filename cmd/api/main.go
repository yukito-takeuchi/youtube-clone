package main

import (
	"context"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/handler"
	"github.com/yukito/video-platform/internal/middleware"
	"github.com/yukito/video-platform/internal/repository"
	"github.com/yukito/video-platform/internal/service"
	"github.com/yukito/video-platform/internal/storage"
)

func main() {
	// Load .env file
	_ = godotenv.Load()

	// Get environment variables
	databaseURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Default profile images
	defaultIconURL := os.Getenv("DEFAULT_ICON_URL")
	if defaultIconURL == "" {
		defaultIconURL = "" // Empty string means no default icon
	}
	defaultBannerURL := os.Getenv("DEFAULT_BANNER_URL")
	if defaultBannerURL == "" {
		defaultBannerURL = "" // Empty string means no default banner
	}

	// Storage configuration
	storageType := os.Getenv("STORAGE_TYPE") // "minio" or "gcs"
	if storageType == "" {
		storageType = "minio" // Default to MinIO for local development
	}

	// Initialize database
	db, err := database.NewDatabase(databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize storage based on type
	var fileStorage storage.Storage

	if storageType == "gcs" {
		// GCP Cloud Storage
		gcpProjectID := os.Getenv("GCP_PROJECT_ID")
		gcpBucketName := os.Getenv("GCP_BUCKET_NAME")
		gcpCredentials := os.Getenv("GCP_CREDENTIALS") // Base64-encoded JSON or file path

		gcsStorage, err := storage.NewGCSStorage(context.Background(), gcpProjectID, gcpBucketName, gcpCredentials)
		if err != nil {
			log.Fatalf("Failed to connect to GCS: %v", err)
		}
		defer gcsStorage.Close()
		fileStorage = gcsStorage
		log.Printf("Using GCP Cloud Storage (bucket: %s)", gcpBucketName)
	} else {
		// MinIO (default for local development)
		minioEndpoint := os.Getenv("MINIO_ENDPOINT")
		minioPublicEndpoint := os.Getenv("MINIO_PUBLIC_ENDPOINT")
		minioAccessKey := os.Getenv("MINIO_ACCESS_KEY")
		minioSecretKey := os.Getenv("MINIO_SECRET_KEY")
		minioBucket := os.Getenv("MINIO_BUCKET")
		minioUseSSL := false
		if os.Getenv("MINIO_USE_SSL") != "" {
			minioUseSSL, _ = strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))
		}

		minioStorage, err := storage.NewMinIOStorage(minioEndpoint, minioPublicEndpoint, minioAccessKey, minioSecretKey, minioBucket, minioUseSSL)
		if err != nil {
			log.Fatalf("Failed to connect to MinIO: %v", err)
		}
		fileStorage = minioStorage
		log.Printf("Using MinIO storage (endpoint: %s)", minioEndpoint)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	profileRepo := repository.NewProfileRepository(db)
	videoRepo := repository.NewVideoRepository(db)
	playlistRepo := repository.NewPlaylistRepository(db)
	subscriptionRepo := repository.NewSubscriptionRepository(db)

	// Initialize services with the storage interface
	authService := service.NewAuthService(userRepo, profileRepo, playlistRepo, jwtSecret, defaultIconURL, defaultBannerURL)
	profileService := service.NewProfileService(profileRepo, fileStorage)
	videoService := service.NewVideoService(videoRepo, profileRepo, fileStorage)
	playlistService := service.NewPlaylistService(playlistRepo, videoRepo)
	subscriptionService := service.NewSubscriptionService(subscriptionRepo, userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	profileHandler := handler.NewProfileHandler(profileService)
	videoHandler := handler.NewVideoHandler(videoService)
	playlistHandler := handler.NewPlaylistHandler(playlistService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtSecret)

	// Setup router
	r := gin.Default()

	// Get allowed origins from environment variable
	allowedOrigins := []string{"http://localhost:3000"}
	if originsEnv := os.Getenv("ALLOWED_ORIGINS"); originsEnv != "" {
		allowedOrigins = strings.Split(originsEnv, ",")
		// Trim whitespace from each origin
		for i, origin := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(origin)
		}
	}

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
		}

		// Profile routes
		profile := api.Group("/profile")
		{
			// Public route
			profile.GET("/:user_id", profileHandler.GetProfileByUserID)

			// Protected routes
			profile.Use(authMiddleware.RequireAuth())
			profile.GET("", profileHandler.GetMyProfile)
			profile.PUT("", profileHandler.UpdateProfile)
		}

		// Video routes
		videos := api.Group("/videos")
		{
			// Public routes
			videos.GET("", videoHandler.List)
			videos.GET("/:id", videoHandler.GetByID)

			// Protected routes
			videos.Use(authMiddleware.RequireAuth())
			videos.POST("", videoHandler.Create)
			videos.PUT("/:id", videoHandler.Update)
			videos.DELETE("/:id", videoHandler.Delete)

			// Like routes
			videos.POST("/:id/like", playlistHandler.LikeVideo)
			videos.DELETE("/:id/like", playlistHandler.UnlikeVideo)
			videos.GET("/:id/like", playlistHandler.GetLikeStatus)
			videos.GET("/liked", playlistHandler.GetLikedVideos)
		}

		// Playlist routes
		playlists := api.Group("/playlists")
		{
			// Public routes
			playlists.GET("/:id", playlistHandler.GetByID)
			playlists.GET("/:id/videos", playlistHandler.GetPlaylistVideos)

			// Protected routes
			playlists.Use(authMiddleware.RequireAuth())
			playlists.POST("", playlistHandler.Create)
			playlists.GET("", playlistHandler.GetUserPlaylists)
			playlists.PUT("/:id", playlistHandler.Update)
			playlists.DELETE("/:id", playlistHandler.Delete)
			playlists.POST("/:id/videos", playlistHandler.AddVideo)
			playlists.DELETE("/:id/videos/:videoId", playlistHandler.RemoveVideo)
			playlists.GET("/check/:videoId", playlistHandler.GetPlaylistsContainingVideo)
		}

		// Subscription routes
		users := api.Group("/users")
		{
			// Public route for subscriber count
			users.GET("/:id/subscriber-count", subscriptionHandler.GetSubscriberCount)

			// Protected routes
			users.Use(authMiddleware.RequireAuth())
			users.POST("/:id/subscription", subscriptionHandler.Subscribe)
			users.DELETE("/:id/subscription", subscriptionHandler.Unsubscribe)
			users.GET("/:id/subscription", subscriptionHandler.GetSubscriptionStatus)
		}

		// Subscription management routes
		subscriptions := api.Group("/subscriptions")
		{
			subscriptions.Use(authMiddleware.RequireAuth())
			subscriptions.GET("", subscriptionHandler.GetSubscribedChannels)
		}

		// Feed routes
		feed := api.Group("/feed")
		{
			feed.Use(authMiddleware.RequireAuth())
			feed.GET("/subscriptions", subscriptionHandler.GetSubscriptionFeed)
		}
	}

	// Run migrations
	if err := db.RunMigrations(context.Background()); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
