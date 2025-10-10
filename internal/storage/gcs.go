package storage

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

type GCSStorage struct {
	client     *storage.Client
	bucketName string
	projectID  string
}

// NewGCSStorage creates a new GCS storage client
// credentialsJSON can be either a file path or base64-encoded JSON credentials
func NewGCSStorage(ctx context.Context, projectID, bucketName, credentialsJSON string) (*GCSStorage, error) {
	var client *storage.Client
	var err error

	// Try to decode base64 credentials (for Heroku)
	if decoded, decodeErr := base64.StdEncoding.DecodeString(credentialsJSON); decodeErr == nil {
		// It's base64-encoded, use the decoded JSON
		client, err = storage.NewClient(ctx, option.WithCredentialsJSON(decoded))
	} else {
		// It's a file path or raw JSON, use it directly
		client, err = storage.NewClient(ctx, option.WithCredentialsFile(credentialsJSON))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create GCS client: %w", err)
	}

	s := &GCSStorage{
		client:     client,
		bucketName: bucketName,
		projectID:  projectID,
	}

	return s, nil
}

// UploadFile uploads a file to GCS and returns the public URL
func (s *GCSStorage) UploadFile(ctx context.Context, file io.Reader, filename string, contentType string, fileSize int64) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(filename)
	uniqueFilename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)

	// Get bucket handle
	bucket := s.client.Bucket(s.bucketName)

	// Create object writer
	obj := bucket.Object(uniqueFilename)
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.ACL = []storage.ACLRule{{Entity: storage.AllUsers, Role: storage.RoleReader}}

	// Copy file content to GCS
	if _, err := io.Copy(writer, file); err != nil {
		writer.Close()
		return "", fmt.Errorf("failed to write file to GCS: %w", err)
	}

	// Close the writer
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close GCS writer: %w", err)
	}

	// Generate public URL
	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, uniqueFilename)

	return url, nil
}

// DeleteFile deletes a file from GCS
func (s *GCSStorage) DeleteFile(ctx context.Context, fileURL string) error {
	// Extract object name from URL
	// URL format: https://storage.googleapis.com/bucket/objectname
	objectName := filepath.Base(fileURL)

	// Get bucket handle
	bucket := s.client.Bucket(s.bucketName)

	// Delete object
	obj := bucket.Object(objectName)
	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete file from GCS: %w", err)
	}

	return nil
}

// Close closes the GCS client
func (s *GCSStorage) Close() error {
	return s.client.Close()
}
