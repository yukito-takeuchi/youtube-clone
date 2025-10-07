package storage

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOStorage struct {
	client     *minio.Client
	bucketName string
	useSSL     bool
	endpoint   string
}

func NewMinIOStorage(endpoint, accessKey, secretKey, bucketName string, useSSL bool) (*MinIOStorage, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	storage := &MinIOStorage{
		client:     client,
		bucketName: bucketName,
		useSSL:     useSSL,
		endpoint:   endpoint,
	}

	// Create bucket if it doesn't exist
	if err := storage.ensureBucket(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket: %w", err)
	}

	return storage, nil
}

func (s *MinIOStorage) ensureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return err
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return err
		}

		// Set bucket policy to public read
		policy := fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": {"AWS": ["*"]},
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}
			]
		}`, s.bucketName)

		err = s.client.SetBucketPolicy(ctx, s.bucketName, policy)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *MinIOStorage) UploadFile(ctx context.Context, file io.Reader, filename string, contentType string, fileSize int64) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(filename)
	uniqueFilename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)

	// Upload file
	_, err := s.client.PutObject(ctx, s.bucketName, uniqueFilename, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// Generate URL
	protocol := "http"
	if s.useSSL {
		protocol = "https"
	}
	url := fmt.Sprintf("%s://%s/%s/%s", protocol, s.endpoint, s.bucketName, uniqueFilename)

	return url, nil
}

func (s *MinIOStorage) DeleteFile(ctx context.Context, fileURL string) error {
	// Extract object name from URL
	// URL format: http://endpoint/bucket/objectname
	objectName := filepath.Base(fileURL)

	err := s.client.RemoveObject(ctx, s.bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}
