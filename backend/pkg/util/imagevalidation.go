package util

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
)

const (
	// Maximum image file size: 5MB
	MaxImageSize = 5 * 1024 * 1024

	// Maximum image dimensions
	MaxImageWidth  = 4096
	MaxImageHeight = 4096

	// Minimum image dimensions
	MinImageWidth  = 10
	MinImageHeight = 10
)

// AllowedImageTypes defines the MIME types we accept
var AllowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/gif":  true,
}

// ImageValidationError represents an image validation error
type ImageValidationError struct {
	Message string
}

func (e *ImageValidationError) Error() string {
	return e.Message
}

// ValidateImage performs comprehensive validation on an uploaded image
func ValidateImage(file multipart.File, filename string) ([]byte, string, int, int, error) {
	// Read the file data
	data, err := io.ReadAll(file)
	if err != nil {
		return nil, "", 0, 0, &ImageValidationError{Message: "failed to read image file"}
	}

	// Check file size
	if len(data) > MaxImageSize {
		return nil, "", 0, 0, &ImageValidationError{
			Message: fmt.Sprintf("image size exceeds maximum allowed size of %d bytes (%.2f MB)",
				MaxImageSize, float64(MaxImageSize)/(1024*1024)),
		}
	}

	if len(data) == 0 {
		return nil, "", 0, 0, &ImageValidationError{Message: "image file is empty"}
	}

	// Detect content type
	contentType := http.DetectContentType(data)

	// Validate content type against whitelist
	if !AllowedImageTypes[contentType] {
		return nil, "", 0, 0, &ImageValidationError{
			Message: fmt.Sprintf("invalid image type: %s. Only JPEG, PNG, and GIF are allowed", contentType),
		}
	}

	// Decode image to validate it's a real image and get dimensions
	img, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, "", 0, 0, &ImageValidationError{
			Message: "file is not a valid image or is corrupted",
		}
	}

	// Verify format matches detected content type
	if !isFormatValid(format, contentType) {
		return nil, "", 0, 0, &ImageValidationError{
			Message: "image format does not match file content",
		}
	}

	// Validate dimensions
	if img.Width < MinImageWidth || img.Height < MinImageHeight {
		return nil, "", 0, 0, &ImageValidationError{
			Message: fmt.Sprintf("image dimensions too small. Minimum: %dx%d pixels",
				MinImageWidth, MinImageHeight),
		}
	}

	if img.Width > MaxImageWidth || img.Height > MaxImageHeight {
		return nil, "", 0, 0, &ImageValidationError{
			Message: fmt.Sprintf("image dimensions too large. Maximum: %dx%d pixels",
				MaxImageWidth, MaxImageHeight),
		}
	}

	// Validate aspect ratio to prevent extremely stretched images
	aspectRatio := float64(img.Width) / float64(img.Height)
	if aspectRatio > 5.0 || aspectRatio < 0.2 {
		return nil, "", 0, 0, &ImageValidationError{
			Message: "image aspect ratio is too extreme (width:height must be between 1:5 and 5:1)",
		}
	}

	return data, contentType, img.Width, img.Height, nil
}

// isFormatValid checks if the decoded format matches the detected MIME type
func isFormatValid(format, contentType string) bool {
	validFormats := map[string][]string{
		"image/jpeg": {"jpeg"},
		"image/jpg":  {"jpeg"},
		"image/png":  {"png"},
		"image/gif":  {"gif"},
	}

	formats, ok := validFormats[contentType]
	if !ok {
		return false
	}

	for _, f := range formats {
		if f == format {
			return true
		}
	}
	return false
}

// ValidateImageFile is a convenience function that validates an image from a multipart form
func ValidateImageFile(file multipart.File, handler *multipart.FileHeader) ([]byte, string, int, int, error) {
	// Check file size from header first (quick check)
	if handler.Size > MaxImageSize {
		return nil, "", 0, 0, &ImageValidationError{
			Message: fmt.Sprintf("image size exceeds maximum allowed size of %.2f MB",
				float64(MaxImageSize)/(1024*1024)),
		}
	}

	return ValidateImage(file, handler.Filename)
}
