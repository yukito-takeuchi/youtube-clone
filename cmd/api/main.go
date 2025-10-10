package main

import (
	"context"
	"log"
	"os"

	"strconv"

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

	minioEndpoint := os.Getenv("MINIO_ENDPOINT")
	minioPublicEndpoint := os.Getenv("MINIO_PUBLIC_ENDPOINT")
	minioAccessKey := os.Getenv("MINIO_ACCESS_KEY")
	minioSecretKey := os.Getenv("MINIO_SECRET_KEY")
	minioBucket := os.Getenv("MINIO_BUCKET")
	minioUseSSL := false
	if os.Getenv("MINIO_USE_SSL") != "" {
		minioUseSSL, _ = strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))
	}

	// Initialize database
	db, err := database.NewDatabase(databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize MinIO storage
	minioStorage, err := storage.NewMinIOStorage(minioEndpoint, minioPublicEndpoint, minioAccessKey, minioSecretKey, minioBucket, minioUseSSL)
	if err != nil {
		log.Fatalf("Failed to connect to MinIO: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	profileRepo := repository.NewProfileRepository(db)
	videoRepo := repository.NewVideoRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, profileRepo, jwtSecret)
	profileService := service.NewProfileService(profileRepo, minioStorage)
	videoService := service.NewVideoService(videoRepo, profileRepo, minioStorage)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	profileHandler := handler.NewProfileHandler(profileService)
	videoHandler := handler.NewVideoHandler(videoService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtSecret)

	// Setup router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
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
			videos.GET("", videoHandler.List)
			videos.GET("/:id", videoHandler.GetByID)

			// Protected routes
			videos.Use(authMiddleware.RequireAuth())
			videos.POST("", videoHandler.Create)
			videos.PUT("/:id", videoHandler.Update)
			videos.DELETE("/:id", videoHandler.Delete)
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
