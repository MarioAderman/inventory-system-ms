import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { addProduct } from '../services/api';

function AddProduct() {
  
  // Initialize the form
  const [formData, setFormData] = useState({
    product_code: '',
    brand: '',
    description: '',
    current_price: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isToggle, setIsToggle] = useState(false);
  const brandOptions = ["HotWheels", "MiniGT", "Auto World", "Greenlight", "Johnny Lightning", "Tarmac", "Inno"]

  const handleChange = (e) => {
    const { name, value } = e.target;

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

  const handleToggle = () => {
    // Toggle between dropdown menu and input
    setIsToggle(prevToggle => {
      const newToggle = !prevToggle;
      setFormData(prev => ({
        ...prev,
        brand: ''
      }));
      return newToggle;
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert price to cents for API call
      const productData = {
        ...formData,
        current_price: formData.current_price ? Math.round(parseFloat(formData.current_price)) : 0
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

          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" class="sr-only peer" onChange={handleToggle} />
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Select or Entry?</span>
          </label>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="brand">
                Brand
              </label>
              
              {isToggle ?
                <input
                  id="brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                /> :
                <div className="relative">
                  <select
                    name="brand"
                    id="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="" disabled selected>--- Select an option ---</option>
                    {brandOptions.map((option, index) => 
                      <option key={index} value={option}>
                        {option}
                      </option>)
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              }         
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
                className="max-h-[200px] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                step="1"
                min="0"
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