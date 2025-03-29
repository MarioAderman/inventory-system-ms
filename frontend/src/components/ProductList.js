import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { calculateStock } from '../services/stockCalculator';
import handleDownloadCSV from "../services/exportCSV";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockData, setStockData] = useState({});
  const [searchMode, setSearchMode] = useState('description');
  const [expandedProducts, setExpandedProducts] = useState([]);

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
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = searchMode === 'description'
      ? product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : product.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearchTerm;
  });
  
  const handleExport = () => handleDownloadCSV("products");

  const toggleExpand = (productCode) => {
    setExpandedProducts(prev => 
      prev.includes(productCode)
        ? prev.filter(code => code !== productCode)
        : [...prev, productCode]
    );
  };

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
            {/* <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
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
            </tbody> */}
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredProducts.map((product) => {
                const totalStock = product.batches
                  ? product.batches.reduce((sum, batch) => sum + batch.quantity, 0)
                  : 0;
                const isExpanded = expandedProducts.includes(product.product_code);
                return (
                  <React.Fragment key={product.product_code}>
                    {/* Main product row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.product_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300 font-bold">
                        {totalStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        ${parseFloat(product.current_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => toggleExpand(product.product_code)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    {/* Nested batch rows (displayed if expanded) */}
                    {isExpanded && product.batches && product.batches.map((batch) => (
                      <tr key={batch.batch_id} className="bg-gray-100 dark:bg-gray-700">
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500" colSpan="3">
                          Batch: {batch.batch_id}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          {batch.quantity}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          ${parseFloat(batch.cost_per_unit || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(batch.purchase_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductList;