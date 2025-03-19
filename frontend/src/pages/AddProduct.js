import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { addProduct } from '../services/api';

function AddProduct() {
  const [formData, setFormData] = useState({
    product_code: '',
    brand: '',
    description: '',
    current_price: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle price input conversion to cents
    if (name === 'current_price') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert price to cents for API call
      const productData = {
        ...formData,
        current_price: formData.current_price ? Math.round(parseFloat(formData.current_price) * 100) : 0
      };
      
      await addProduct(productData);
      setMessage({ text: 'Product added successfully!', type: 'success' });
      setFormData({ product_code: '', brand: '', description: '', current_price: '' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error adding product.', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Product</h1>
        
        {message.text && (
          <div className={`p-4 mb-4 rounded ${
            message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow rounded p-6 max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="brand">
                Brand
              </label>
              <input
                id="brand"
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="product_code">
                Product Code
              </label>
              <input
                id="product_code"
                type="text"
                name="product_code"
                value={formData.product_code}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                Product Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="current_price">
                Current Price ($)
              </label>
              <input
                id="current_price"
                type="number"
                step="0.01"
                name="current_price"
                value={formData.current_price}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={() => setFormData({ product_code: '', brand: '', description: '', current_price: '' })}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;