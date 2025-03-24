import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getPurchases } from '../services/api';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await getPurchases();
      setPurchases(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => 
    purchase.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.batch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.quantity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.cost_per_unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.purchase_date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Purchases</h1>
        
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="w-64">
            <input 
              type="text" 
              placeholder="Search purchases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-300"
            />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
              New Purchase
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Export
            </button>
          </div>
        </div>
        
        {/* Purchases table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-600">Loading purchases...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
            {purchases.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-600">No purchase records found.</div>
            ) : (
              <div className="max-h-[700px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:bg-gray-800 shadow rounded overflow-hidden border-gray-600">
                  <thead className="bg-blue-500 sticky top-0 z-10 dark:bg-blue-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Batch ID
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
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {purchase.product_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {purchase.batch_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          ${((purchase.cost_per_unit || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          ${(((purchase.cost_per_unit || 0) * purchase.quantity)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
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

export default Purchases;