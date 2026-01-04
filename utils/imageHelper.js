export const getImageUrl = (imageData, fallback = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop") => {
    if (!imageData) return fallback;

    console.log('getImageUrl processing:', {
        imageData,
        type: typeof imageData
    });

    // Handle string input
    if (typeof imageData === 'string') {
        const trimmed = imageData.trim();

        if (!trimmed) return fallback;

        // If it's already a full URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        // If it's a relative path starting with /uploads or similar
        if (trimmed.startsWith('/')) {
            return `https://nextrade-backend-production-a486.up.railway.app${trimmed}`;
        }

        // If it's just a filename or path without leading slash
        return `https://nextrade-backend-production-a486.up.railway.app/${trimmed}`;
    }

    // Handle object input
    if (typeof imageData === 'object' && imageData !== null) {
        // Try all common image object properties
        const possibleUrls = [
            imageData.url,
            imageData.secure_url,
            imageData.path,
            imageData.src,
            imageData.imageUrl,
            imageData.image_url
        ].filter(Boolean); // Remove null/undefined

        // Get the first valid URL
        const url = possibleUrls[0];

        if (url) {
            if (typeof url === 'string') {
                return getImageUrl(url, fallback); // Recursively process the URL string
            }
        }

        // If no URL found in object
        return fallback;
    }

    return fallback;
};