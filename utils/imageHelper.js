export const getImageUrl = (imageData, fallback = "/placeholder-category.jpg") => {
    if (!imageData) return fallback;

    console.log('getImageUrl called with:', {
        imageData: imageData,
        type: typeof imageData
    });

    // If it's already a string
    if (typeof imageData === 'string') {
        const trimmed = imageData.trim();

        // If it's empty, return fallback
        if (!trimmed) return fallback;

        // Check if it's a valid URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') ||
            trimmed.startsWith('/') || trimmed.startsWith('data:')) {
            return trimmed;
        }

        // If it's a relative path without leading slash
        if (trimmed.includes('.jpg') || trimmed.includes('.jpeg') ||
            trimmed.includes('.png') || trimmed.includes('.webp')) {
            return `/${trimmed}`;
        }

        return fallback;
    }

    // If it's an object with url property
    if (imageData && typeof imageData === 'object' && imageData.url) {
        return imageData.url;
    }

    return fallback;
};