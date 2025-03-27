import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { calculateStock } from '../services/StockCalculator';
import handleDownloadCSV from "../services/exportCSV";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockData, setStockData] = useState({});
  const [filterOption, setFilterOption] = useState('');
  const [filterValues, setFilterValues] = useState([]);
  const [selectedFilterValue, setSelectedFilterValue] = useState('');
  const [searchMode, setSearchMode] = useState('description');

  useEffect(() => {
    fetchProducts();
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const stock = await calculateStock();
      setStockData(stock);
    } catch (err) {
      console.error('Error fetching stock data:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFilterValues = (selectedFilter) => {
    if (!selectedFilter) {
      setFilterValues([]);
      setSelectedFilterValue('');
      return;
    }
    // Get unique values for the selected filter option
  const uniqueValues = [...new Set(products.map(product => {
    if (selectedFilter === 'brand') return product.brand;
    if (selectedFilter === 'stock') return stockData[product.product_code] || 0;
    if (selectedFilter === 'cost') return product.cost;
    if (selectedFilter === 'current_price') return product.current_price;
    return null;
    }))].filter(value => value !== null && value !== undefined);
  
    setFilterValues(uniqueValues.sort((a, b) => a -b));
    setSelectedFilterValue('');
  };

  const filteredProducts = products.filter(product => {
    // Priority 1: Search input
    const matchesSearchTerm = searchMode === 'description'
      ? product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : product.product_code?.toLowerCase().includes(searchTerm.toLowerCase());

      // Priority 2: Filter options (only applied if search term is empty)
      if (matchesSearchTerm && filterOption && selectedFilterValue) {
        const productValue = (() => {
          switch (filterOption) {
            case 'brand':
              return product.brand === selectedFilterValue;
            case 'stock':
              return (stockData[product.product_code] || 0) === selectedFilterValue;
            case 'cost':
              return product.cost === selectedFilterValue;
            case 'current_price':
              return product.current_price === selectedFilterValue;
            default:
              return null;
        }
      })();

      return filterOption === 'brand' 
      ? productValue === selectedFilterValue
      : Number(productValue) === Number(selectedFilterValue);
  }
      
      return matchesSearchTerm;
    });
  
  const handleExport = () => handleDownloadCSV("products");

  return (
    <div>
      {/* Search and filters row */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          {/* NEW: Switch button for search mode */}
          <div className="flex">
            <button
              onClick={() => setSearchMode('description')}
              className={`w-30 px-4 py-2 rounded-l ${
                searchMode === "description"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setSearchMode('code')}
              className={`w-32 px-4 py-2 rounded-r ${
                searchMode === "code"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Code
            </button>
          </div>
          <div className="w-64">
            <input 
              type="text" 
              placeholder={`Search by ${searchMode}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:text-gray-300"
            />
            </div>
          </div>
          <div className="relative">
              <select 
                value={filterOption}
                onChange={(e) => {
                  setFilterOption(e.target.value);
                  updateFilterValues(e.target.value);
                }}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 appearance-none pr-8 text-left w-full"
              >
                <option value="">Filter by...</option>
                <option value="brand">Brand</option>
                <option value="stock">Stock</option>
                <option value="cost">Cost</option>
                <option value="current_price">Current Price</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {/* Second dropdown: Filter values */}
            <div className="relative">
              <select 
                value={selectedFilterValue}
                onChange={(e) => setSelectedFilterValue(e.target.value)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 appearance-none pr-8 text-left w-full"
                disabled={!filterOption} // Disable if no filter option is selected
              >
                <option value="">Select {filterOption}...</option>
                {filterValues.map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-gray-700 dark:text-gray-300">
          Export
        </button>
      </div>
      
      {/* Products table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden border-gray-200 dark:border-gray-700">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Product Code
                </th>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredProducts.map((product) => (
                <tr key={product.id || product.product_code} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {product.product_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {stockData[product.product_code] || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                  $0.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    ${((product.current_price || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductList;