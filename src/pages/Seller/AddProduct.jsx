import React, { useState } from 'react';
import { FaPlus, FaArrowLeft, FaUpload, FaImage, FaDollarSign, FaBox, FaTag, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    mainImage: null,
    galleryImages: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, mainImage: file }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.galleryImages.length > 5) {
      setError('Maximum 5 gallery images allowed');
      return;
    }
    setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...files] }));
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, mainImage: null }));
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Product added:', formData);
      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        mainImage: null,
        galleryImages: []
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="container p-6 mx-auto">
        {/* Alerts */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
            <p>{success}</p>
          </div>
        )}

        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-6 border-b border-neutral-300">
            <h2 className="text-xl font-semibold text-neutral-800">Product Information</h2>
            <p className="text-sm text-neutral-600">Fill in the details of your product</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="name">
                  Product Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaTag className="text-neutral-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="category">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBox className="text-neutral-400" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    className="w-full py-3 pl-10 pr-10 border rounded-lg appearance-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books</option>
                    <option value="sports">Sports</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaBox className="text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="price">
                  Price (PKR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaDollarSign className="text-neutral-400" />
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className='md:col-span-2'>
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="stock">
                  Stock Quantity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBox className="text-neutral-400" />
                  </div>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Main Product Image */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Main Product Image
                </label>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-neutral-300">
                  {formData.mainImage ? (
                    <div className="relative w-full text-center">
                      <img
                        src={URL.createObjectURL(formData.mainImage)}
                        alt="Main product"
                        className="object-cover w-32 h-32 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute p-1 text-white transform translate-x-1/2 bg-red-500 rounded-full top-1 right-1/2"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaImage className="mb-3 text-3xl text-neutral-400" />
                      <p className="mb-2 text-sm text-neutral-600">Set main product image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="absolute opacity-0 cursor-pointer"
                        id="main-image-upload"
                      />
                      <label
                        htmlFor="main-image-upload"
                        className="px-4 py-2 mt-4 text-sm font-medium text-white transition duration-300 rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-700"
                      >
                        Upload Main Image
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Gallery Images
                </label>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-neutral-300">
                  <FaUpload className="mb-3 text-3xl text-neutral-400" />
                  <p className="mb-2 text-sm text-neutral-600">
                    Drag & drop gallery images here or click to browse
                  </p>
                  <p className="text-xs text-neutral-500">Maximum 5 images (JPEG, PNG, JPG)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="absolute opacity-0 cursor-pointer"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="px-4 py-2 mt-4 text-sm font-medium text-white transition duration-300 rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-700"
                  >
                    Browse Gallery Images
                  </label>
                </div>

                {/* Gallery Preview Images */}
                {formData.galleryImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-neutral-700">Gallery Images:</h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                      {formData.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Gallery ${index + 1}`}
                            className="object-cover w-full h-24 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 transition duration-300 border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 font-medium text-white transition duration-300 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;