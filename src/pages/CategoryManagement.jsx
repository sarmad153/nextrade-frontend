import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaShoppingBasket, FaArrowLeft, FaSearch, FaSave } from 'react-icons/fa';

const CategoryManagement = () => {
  // Dummy categories data
  const dummyCategories = [
    { _id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
    { _id: '2', name: 'Clothing', description: 'Men, women and kids clothing' },
    { _id: '3', name: 'Home & Kitchen', description: 'Home appliances and kitchenware' },
    { _id: '4', name: 'Books', description: 'Fiction and non-fiction books' },
    { _id: '5', name: 'Sports', description: 'Sports equipment and accessories' },
  ];

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Simulate API fetch with dummy data
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setCategories(dummyCategories);
      setFilteredCategories(dummyCategories);
      setError('');
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Handle form submission for create
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new category with dummy ID
      const newCategory = {
        _id: Date.now().toString(),
        name,
        description
      };
      
      // Update state with new category
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      
      setSuccess('Category created successfully!');
      setName('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3000);
      setCurrentView('list');
    } catch (err) {
      setError('Failed to create category');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle form submission for edit
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the category in the list
      const updatedCategories = categories.map(cat => 
        cat._id === currentCategory._id ? { ...cat, name, description } : cat
      );
      
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setSuccess('Category updated successfully!');
      setName('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3000);
      setCurrentView('list');
    } catch (err) {
      setError('Failed to update category');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove the category from the list
      const updatedCategories = categories.filter(cat => cat._id !== id);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete category');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Set up edit form
  const setupEditForm = (category) => {
    setCurrentCategory(category);
    setName(category.name);
    setDescription(category.description);
    setCurrentView('edit');
  };

  // Reset form and go back to list
  const handleBackToList = () => {
    setName('');
    setDescription('');
    setCurrentView('list');
  };

  return (
    <div className="min-h-screen bg-background-light font-inter">
      {/* Header */}
      <div className="p-6 text-white shadow-md bg-primary-700">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center">
            <FaShoppingBasket className="mr-3 text-3xl" />
            <h1 className="text-2xl font-bold">NexTrade Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView('create')}
              className="flex items-center px-4 py-2 font-medium transition duration-300 rounded-lg text-primary-600 bg-background"
            >
              <FaPlus className="mr-2" /> Create Category
            </button>
          </div>
        </div>
      </div>

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

        {/* List View */}
        {currentView === 'list' && (
          <div className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="flex flex-col p-6 border-b border-neutral-300 md:flex-row md:items-center md:justify-between">
              <h3 className="mb-4 text-xl font-semibold text-neutral-800 md:mb-0">All Categories</h3>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setCurrentView('create')}
                  className="flex items-center justify-center px-4 py-2 font-medium text-white transition duration-300 rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <FaPlus className="mr-2" /> Add New
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 mb-4 border-t-2 border-b-2 rounded-full animate-spin border-primary-600"></div>
                <p className="text-neutral-600">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-8 text-center">
                {searchTerm ? (
                  <p className="text-neutral-600">No categories found matching "{searchTerm}"</p>
                ) : (
                  <p className="text-neutral-600">No categories found. Create your first category!</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-6 py-3 font-medium text-left text-neutral-700">Category Name</th>
                      <th className="px-6 py-3 font-medium text-left text-neutral-700">Description</th>
                      <th className="px-6 py-3 font-medium text-left text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <tr key={category._id} className={index % 2 === 0 ? 'bg-white' : 'bg-background-subtle'}>
                        <td className="px-6 py-4 border-b border-neutral-300">{category.name}</td>
                        <td className="px-6 py-4 border-b border-neutral-300">{category.description}</td>
                        <td className="px-6 py-4 border-b border-neutral-300">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setupEditForm(category)}
                              className="p-2 transition duration-300 rounded-full text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100"
                              title="Edit category"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="p-2 text-red-500 transition duration-300 rounded-full hover:text-red-700 hover:bg-red-100"
                              title="Delete category"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit View */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="flex items-center p-6 border-b border-neutral-300">
              <button 
                onClick={handleBackToList}
                className="p-2 mr-4 transition duration-300 rounded-full text-primary-600 hover:text-primary-800 hover:bg-primary-100"
                title="Back to list"
              >
                <FaArrowLeft />
              </button>
              <h3 className="text-xl font-semibold text-neutral-800">
                {currentView === 'create' ? 'Create New Category' : 'Edit Category'}
              </h3>
            </div>

            <form onSubmit={currentView === 'create' ? handleCreate : handleEdit} className="p-6">
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="name">
                  Category Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-neutral-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-6 py-3 transition duration-300 border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 font-medium text-white transition duration-300 rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <FaSave className="mr-2" /> 
                  {currentView === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;