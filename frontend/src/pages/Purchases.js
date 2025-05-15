import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import OrderModal from '../components/OrderModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import handleDownloadCSV from "../services/exportCSV";
import { getPurchases } from '../services/api'; // Assuming getPurchases fetches the data

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); // Renamed from isOpen for clarity
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedDelPurchase, setSelectedDelPurchase] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPurchasesData();
  }, []);

  const fetchPurchasesData = async () => {
    try {
      setLoading(true);
      const res = await getPurchases();
      // Assuming your API or this component filters out deleted items.
      // If getPurchases already returns non-deleted, this filter is redundant.
      setPurchases(res.data.filter(p => !p.is_deleted)); 
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
      setLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    const filtered = purchases.filter(purchase =>
      purchase.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.batch_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) // Allow searching by batch_id
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a.purchase_date);
      const dateB = new Date(b.purchase_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [purchases, searchTerm, sortOrder]);

  const handlePurchaseAdded = () => {
    fetchPurchasesData();
  };

  const handlePurchaseEdited = () => {
    fetchPurchasesData();
  };

  const handlePurchaseDeleted = () => {
    fetchPurchasesData();
  };

  // Batch ID format... BXXXX (Your existing function)
  function batchIdConcat(batch_id) {
    if (batch_id === null || batch_id === undefined) return 'N/A';
    let num_batch_id = Number(batch_id); // Ensure it's a number for comparison
    if (isNaN(num_batch_id)) return batch_id.toString(); // If not a number, return as is

    if (num_batch_id <= 9) return `B000${num_batch_id}`;
    if (num_batch_id <= 99) return `B00${num_batch_id}`;
    if (num_batch_id <= 999) return `B0${num_batch_id}`;
    return `B${num_batch_id}`;
  }

  const handleExport = () => handleDownloadCSV("purchases");

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onRecordAdded={handlePurchaseAdded}
        title="Add Purchase Order"
        successMessage="Purchase Order added successfully!"
        type="purchase"
        fields={[
          { name: "product_code", placeholder: "Product Code", type: "text" },
          { name: "batch_id", placeholder: "Batch ID (e.g., 1, 23)", type: "number" }, // Assuming batch_id is numeric before formatting
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1" },
          { name: "cost_per_unit", placeholder: "Cost Per Unit", type: "number", min: "0", step: "0.01" }, // Changed step for currency
          { name: "purchase_date", placeholder: "Purchase Date", type: "date" },
          // Add original_quantity if it's meant to be set at creation and is different from quantity
          // { name: "original_quantity", placeholder: "Original Quantity", type: "number", min: "1", step: "1" },
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
        fields={[ // Define fields for editing a purchase
          // product_code is usually not editable for an existing purchase record linked to stock
          { name: "batch_id", placeholder: "Batch ID", type: "number" },
          { name: "quantity", placeholder: "Current Quantity", type: "number", min: "0", step: "1" }, // min 0 if stock can be 0
          { name: "cost_per_unit", placeholder: "Cost Per Unit", type: "number", min: "0", step: "0.01" },
          { name: "purchase_date", placeholder: "Purchase Date", type: "date" },
          // { name: "original_quantity", placeholder: "Original Quantity", type: "number", min: "1", step: "1" },
        ]}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        item={selectedDelPurchase}
        onClose={() => setShowDeleteModal(false)}
        onItemEdited={handlePurchaseDeleted} // This should be onItemDeleted or similar
        title="Delete Purchase Order"
        successMessage="Purchase Order deleted successfully!"
        type="purchase" // API endpoint for deletion will be /api/purchases/:id
      />

      <div className="flex-1 p-8 overflow-auto"> {/* Consistent with Sales.js */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Purchase Records</h1>

        <div className="mb-4 flex justify-between items-center">
          <div className="w-72"> {/* Consistent search input width */}
            <input
              type="text"
              placeholder="Search by Product Code or Batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center space-x-4"> {/* Sort controls container */}
            <label className="flex items-center space-x-2">
              <input type="radio" value="asc" checked={sortOrder === 'asc'} onChange={() => setSortOrder('asc')} className="form-radio h-4 w-4 text-blue-600"/>
              <span className="text-gray-700 dark:text-gray-300">Oldest First</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" value="desc" checked={sortOrder === 'desc'} onChange={() => setSortOrder('desc')} className="form-radio h-4 w-4 text-blue-600"/>
              <span className="text-gray-700 dark:text-gray-300">Newest First</span>
            </label>
          </div>
          <div>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
              New Purchase
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading purchases...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
            {purchases.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No purchase records found.</div>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto" style={{ position: "relative" }}> {/* Consistent height */}
                <table className="min-w-full dark:bg-gray-800 border-gray-600">
                  <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Product Code</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Batch ID</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Original Qty</th> {/* Added Original Qty */}
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Current Qty</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Cost Per Unit</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Total Cost</th>
                      <th className="px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.purchase_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                          {purchase.original_quantity !== undefined ? purchase.original_quantity : 'N/A'} {/* Display Original Qty */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          ${(parseFloat(purchase.cost_per_unit) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                          {/* Total cost should ideally be based on original_quantity if that's the intent of "total cost of purchase" */}
                          ${((parseFloat(purchase.cost_per_unit) || 0) * (purchase.original_quantity !== undefined ? purchase.original_quantity : purchase.quantity)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => { setSelectedPurchase(purchase); setShowEditModal(true); }}
                            className="text-green-600 hover:text-green-900 mr-3">
                            Edit
                          </button>
                          <button
                            onClick={() => { setSelectedDelPurchase(purchase); setShowDeleteModal(true); }}
                            className="text-red-600 hover:text-red-900">
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