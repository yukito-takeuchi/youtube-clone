package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo    *repository.UserRepository
	profileRepo *repository.ProfileRepository
	jwtSecret   string
}

func NewAuthService(userRepo *repository.UserRepository, profileRepo *repository.ProfileRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		profileRepo: profileRepo,
		jwtSecret:   jwtSecret,
	}
}

func (s *AuthService) Register(ctx context.Context, req *model.RegisterRequest) (*model.AuthResponse, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user, err := s.userRepo.Create(ctx, req.Email, string(hashedPassword))
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Create profile for the new user
	_, err = s.profileRepo.Create(ctx, user.ID)
	if err != nil {
		// If profile creation fails, we still return the user
		// Profile can be created later
		fmt.Printf("Warning: failed to create profile for user %d: %v\n", user.ID, err)
	}

	// Generate token
	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	// Find user
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate token
	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) generateToken(userID int64) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *AuthService) ValidateToken(tokenString string) (int64, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := int64(claims["user_id"].(float64))
		return userID, nil
	}

	return 0, errors.New("invalid token")
}
