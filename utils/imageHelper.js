export const getCategoryImage = (category) => {
    if (!category) return "/placeholder-category.jpg";

    // Handle both old and new structures
    if (typeof category.image === 'object' && category.image.url) {
        return category.image.url;
    }

    if (typeof category.image === 'string' && category.image) {
        return category.image;
    }

    return "/placeholder-category.jpg";
};

export const getImageUrl = (imageData, fallback = "/placeholder-category.jpg") => {
    if (!imageData) return fallback;

    // If it's already a string URL
    if (typeof imageData === 'string') {
        // Check if it's a valid URL
        if (imageData.startsWith('http') || imageData.startsWith('/')) {
            return imageData;
        }
        return fallback;
    }

    // If it's an object with url property
    if (imageData.url) {
        return imageData.url;
    }

    return fallback;
};