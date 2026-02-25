// Image validation constants matching backend validation
export const IMAGE_VALIDATION = {
    // Maximum image file size: 5MB
    MAX_SIZE: 5 * 1024 * 1024,

    // Maximum image dimensions
    MAX_WIDTH: 4096,
    MAX_HEIGHT: 4096,

    // Minimum image dimensions
    MIN_WIDTH: 10,
    MIN_HEIGHT: 10,

    // Allowed MIME types
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],

    // Aspect ratio limits
    MAX_ASPECT_RATIO: 5.0,
    MIN_ASPECT_RATIO: 0.2,
} as const;

export interface ImageValidationError {
    message: string;
}

/**
 * Validates an image file against size, type, and dimension constraints
 * @param file - The file to validate
 * @returns Promise that resolves to null if valid, or an error message string if invalid
 */
export async function validateImage(file: File): Promise<string | null> {
    // Check if file exists
    if (!file) {
        return 'No file provided';
    }

    // Check file size
    if (file.size === 0) {
        return 'Image file is empty';
    }

    if (file.size > IMAGE_VALIDATION.MAX_SIZE) {
        const maxSizeMB = (IMAGE_VALIDATION.MAX_SIZE / (1024 * 1024)).toFixed(2);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return `Image size exceeds maximum allowed size of ${maxSizeMB} MB (current: ${fileSizeMB} MB)`;
    }

    // Check file type
    if (!IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type as any)) {
        return `Invalid image type: ${file.type}. Only JPEG, PNG, and GIF are allowed`;
    }

    // Validate image dimensions by loading it
    try {
        const dimensions = await getImageDimensions(file);

        // Check minimum dimensions
        if (
            dimensions.width < IMAGE_VALIDATION.MIN_WIDTH ||
            dimensions.height < IMAGE_VALIDATION.MIN_HEIGHT
        ) {
            return `Image dimensions too small. Minimum: ${IMAGE_VALIDATION.MIN_WIDTH}x${IMAGE_VALIDATION.MIN_HEIGHT} pixels`;
        }

        // Check maximum dimensions
        if (
            dimensions.width > IMAGE_VALIDATION.MAX_WIDTH ||
            dimensions.height > IMAGE_VALIDATION.MAX_HEIGHT
        ) {
            return `Image dimensions too large. Maximum: ${IMAGE_VALIDATION.MAX_WIDTH}x${IMAGE_VALIDATION.MAX_HEIGHT} pixels (current: ${dimensions.width}x${dimensions.height})`;
        }

        // Check aspect ratio
        const aspectRatio = dimensions.width / dimensions.height;
        if (
            aspectRatio > IMAGE_VALIDATION.MAX_ASPECT_RATIO ||
            aspectRatio < IMAGE_VALIDATION.MIN_ASPECT_RATIO
        ) {
            return 'Image aspect ratio is too extreme (width:height must be between 1:5 and 5:1)';
        }

        return null; // Valid
    } catch (error) {
        return 'File is not a valid image or is corrupted';
    }
}

/**
 * Gets the dimensions of an image file
 * @param file - The image file
 * @returns Promise that resolves to {width, height}
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get the maximum file size as a human-readable string
 * @returns Formatted string (e.g., "5 MB")
 */
export function getMaxFileSizeString(): string {
    return formatFileSize(IMAGE_VALIDATION.MAX_SIZE);
}
