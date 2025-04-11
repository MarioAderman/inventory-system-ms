import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import OrderModal from '../components/OrderModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import handleDownloadCSV from "../services/exportCSV";
import { getPurchases } from '../services/api';

function Purchases() {

  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedDelPurchase, setSelectedDelPurchase] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await getPurchases();
      setPurchases(res.data.filter(p => !p.is_deleted));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    const filtered = purchases.filter(purchase =>
      purchase.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return filtered.sort((a, b) => {
      const dateA = new Date(a.purchase_date);
      const dateB = new Date(b.purchase_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [purchases, searchTerm, sortOrder]);

  const handlePurchaseAdded = () => {
    fetchPurchases();
  };

  const handlePurchaseEdited = () => {
    fetchPurchases();
  };

  const handlePurchaseDeleted = () => {
    fetchPurchases();
  };  

  function batchIdConcat(batch_id) {
    let serialBatchId = '';
    if(batch_id <= 9){
      serialBatchId = `B000${batch_id}`;
    } else if(batch_id <= 99){
      serialBatchId = `B00${batch_id}`;
    }
    else if(batch_id <= 999){
      serialBatchId = `B0${batch_id}`;
    }
    else{
        serialBatchId = `B${batch_id}`;
    }
    return serialBatchId;
  }

  const handleExport = () => handleDownloadCSV("purchases");

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
      <EditModal 
        isOpen={showEditModal} 
        item={selectedPurchase} 
        onClose={() => setShowEditModal(false)} 
        onItemEdited={handlePurchaseEdited}
        title="Edit Purchase Order"
        successMessage="Purchase Order updated successfully!"
        type="purchase"
        fields={[
          { name: "batch_id", placeholder: "Batch ID" },
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1" },
          { name: "cost_per_unit", placeholder: "Cost Per Unit", type: "number", min: "0", step: "5" },
          { name: "purchase_date", placeholder: "Purchase Date", type: "date" },
        ]}
      />
      <DeleteModal
        isOpen={showDeleteModal} 
        item={selectedDelPurchase} 
        onClose={() => setShowDeleteModal(false)} 
        onItemEdited={handlePurchaseDeleted}
        title="Delete Purchase Order"
        successMessage="Purchase Order deleted successfully!"
        type="purchase"
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
          <div className="mb-2 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="asc"
                checked={sortOrder === 'asc'}
                onChange={() => setSortOrder('asc')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Oldest First</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="desc"
                checked={sortOrder === 'desc'}
                onChange={() => setSortOrder('desc')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Newest First</span>
            </label>
          </div>
          <div>
            <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
              New Purchase
            </button>
            <button 
            onClick={handleExport}
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
                      <tr key={purchase.purchase_id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {purchase.product_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {batchIdConcat(purchase.batch_id)}
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
                        <button 
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDelPurchase(purchase);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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