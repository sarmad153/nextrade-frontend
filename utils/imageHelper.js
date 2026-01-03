export const getImageUrl = (imagePath, type = 'category') => {
    if (!imagePath || imagePath.trim() === '') {
        const text = type === 'category' ? 'Category' : 'Product';
        return `https://via.placeholder.com/150/cccccc/969696?text=${text}+Image`;
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    if (imagePath.startsWith('/uploads/') || imagePath.includes('localhost')) {
        return `https://via.placeholder.com/150/cccccc/969696?text=Image+Coming+Soon`;
    }

    return imagePath;
};