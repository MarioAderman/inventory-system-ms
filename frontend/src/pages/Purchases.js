import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import OrderModal from '../components/OrderModal';
import { getPurchases } from '../services/api';
import { exportCsv } from "../services/api";
import { useLocation } from "react-router-dom";

function Purchases() {

  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const page = location.pathname.replace("/", "");

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
    purchase.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadCSV = async () => {
    try {
      const response = await exportCsv(page || "data"); // Default to "data" if no page
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `export_${page}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handlePurchaseAdded = () => {
    fetchPurchases();
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <OrderModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onRecordAdded={handlePurchaseAdded}
        title="Add Purchase Order"
        successMessage="Purchase Order added successfully!"
        type="purchase"
        fields={[
          { name: "product_code", placeholder: "Product Code" },
          { name: "batch_id", placeholder: "Batch ID" },
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1" },
          { name: "cost_per_unit", placeholder: "Cost Per Unit", type: "number", min: "0", step: "5" },
          { name: "purchase_date", placeholder: "Purchase Date", type: "date" },
        ]}
      />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Purchases</h1>
        
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="w-64">
            <input 
              type="text" 
              placeholder="Search product code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-300"
            />
          </div>
          <div>
            <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
              New Purchase
            </button>
            <button 
            onClick={handleDownloadCSV}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
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
              <div className="max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:bg-gray-800 shadow rounded overflow-hidden border-gray-600">
                  <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Product Code
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                        Cost Per Unit
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