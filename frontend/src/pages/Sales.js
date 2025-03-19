import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getSales } from '../services/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await getSales();
      setSales(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.quantity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sold_price?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Sales</h1>
        
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="w-64">
            <input 
              type="text" 
              placeholder="Search sales..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
              New Sale
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Export
            </button>
          </div>
        </div>
        
        {/* Sales table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading sales...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
            {sales.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No sales records found.</div>
            ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-blue-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Sale ID
                    </th>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Product Code
                    </th>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.sale_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.product_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${((sale.sold_price || 0)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(((sale.sold_price || 0) * sale.quantity)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                        <button className="text-green-600 hover:text-green-900">Invoice</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;