import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
// import { calculateStock } from '../services/StockCalculator';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [stockData, setStockData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product => 
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search and filters row */}
      <div className="mb-4 flex justify-between items-center">
        <div className="w-64">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Export
        </button>
      </div>
      
      {/* Products table */}
      <div className="bg-white shadow rounded overflow-hidden border-gray-200">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-500 sticky top-0 z-10">
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
                  Current Price
                </th>
                <th className="px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id || product.product_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.product_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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