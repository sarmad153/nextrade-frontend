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

export const getImageUrl = (image, fallback = "/placeholder-category.jpg") => {
    if (!image) return fallback;

    // Handle new structure { url, publicId, ... }
    if (typeof image === 'object' && image.url) {
        return image.url;
    }

    // Handle old structure (string URL)
    if (typeof image === 'string') {
        return image;
    }

    return fallback;
};