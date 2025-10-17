package storage

import (
	"context"
	"io"
)

// Storage is an interface for file storage operations
type Storage interface {
	UploadFile(ctx context.Context, file io.Reader, filename string, contentType string, fileSize int64) (string, error)
	DeleteFile(ctx context.Context, fileURL string) error
}
