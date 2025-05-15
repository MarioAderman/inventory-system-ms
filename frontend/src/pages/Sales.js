import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import OrderModal from '../components/OrderModal';
import handleDownloadCSV from "../services/exportCSV";
import { getSales } from '../services/api'; // Assuming getSales fetches the detailed sales data
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';

function Sales() {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDelSale, setSelectedDelSale] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedSales, setExpandedSales] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await getSales(); // This should fetch sales with affected_batches
      setSales(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    const filtered = sales.filter(sale =>
      sale.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_id?.toString().includes(searchTerm) // Allow searching by sale_id too
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a.sale_date);
      const dateB = new Date(b.sale_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sales, searchTerm, sortOrder]);

  const handleSaleAdded = () => {
    fetchSalesData(); // Refetch sales after adding
  };

  const handleSaleEdited = () => {
    fetchSalesData(); // Refetch sales after editing
  };

  const handleSaleDeleted = () => {
    fetchSalesData(); // Refetch sales after deleting
  };

  const handleExport = () => handleDownloadCSV("sales");

  // Function to toggle the expansion state of a sale row
  const toggleExpandSale = (saleId) => {
    setExpandedSales(prevExpanded =>
      prevExpanded.includes(saleId)
        ? prevExpanded.filter(id => id !== saleId)
        : [...prevExpanded, saleId]
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onRecordAdded={handleSaleAdded}
        title="Add Sale Order"
        successMessage="Sale Order added successfully!"
        type="sale"
        fields={[
          { name: "product_code", placeholder: "Product Code", type: "text" },
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1" },
          { name: "sold_price", placeholder: "Sold Price (per unit)", type: "number", min: "0", step: "0.1" }, // Allow decimals
          { name: "sale_date", placeholder: "Sale Date", type: "date" },
        ]}
      />
      <EditModal
        isOpen={showEditModal}
        item={selectedSale}
        onClose={() => setShowEditModal(false)}
        onItemEdited={handleSaleEdited}
        title="Edit Sale Order"
        successMessage="Sale Order updated successfully!"
        type="sale"
        fields={[
          { name: "sold_price", placeholder: "Sold Price", type: "number", min: "0", step: "0.1" },
          { name: "sale_date", placeholder: "Sale Date", type: "date" },
        ]}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        item={selectedDelSale}
        onClose={() => setShowDeleteModal(false)}
        onItemEdited={handleSaleDeleted} // This should be onItemDeleted or similar if it triggers deletion
        title="Delete Sale Order"
        successMessage="Sale Order deleted successfully!"
        type="sale" // API endpoint for deletion will be /api/sales/:id
      />

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Sales Records</h1>

        <div className="mb-4 flex justify-between items-center">
          <div className="w-72"> {/* Increased width for search input */}
            <input
              type="text"
              placeholder="Search by Product Code or Sale ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* Sort controls */}
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
              New Sale
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
            <p className="text-gray-500 dark:text-gray-400">Loading sales...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
            {sales.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No sales records found.</div>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto" style={{ position: "relative" }}> {/* Adjusted max-h */}
                <table className="min-w-full dark:bg-gray-800 border-gray-600">
                  <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Sale ID</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Product Code</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Total Qty</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Unit Price Sold</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Total Sale Value</th>
                      <th className="px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Total Profit</th>
                      <th className="px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredSales.map((sale) => {
                      const isExpanded = expandedSales.includes(sale.sale_id);
                      
                      // Calculate Total Profit for the entire sale
                      let totalSaleProfit = 0;
                      if (sale.affected_batches && sale.affected_batches.length > 0) {
                        totalSaleProfit = sale.affected_batches.reduce((acc, batchDetail) => {
                          const unitProfit = (sale.sold_price || 0) - (batchDetail.cost_per_unit || 0);
                          const batchProfit = unitProfit * batchDetail.quantity_from_batch;
                          return acc + batchProfit;
                        }, 0);
                      }
                      return (
                        <React.Fragment key={sale.sale_id}>
                          {/* Main sale row */}
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{new Date(sale.sale_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{sale.sale_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{sale.product_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{sale.total_quantity_sold}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">${(sale.sold_price || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">${((sale.sold_price || 0) * sale.total_quantity_sold).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">${totalSaleProfit.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleExpandSale(sale.sale_id)}
                                className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!sale.affected_batches || sale.affected_batches.length === 0}
                              >
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </button>
                              <button
                                onClick={() => { setSelectedSale(sale); setShowEditModal(true); }}
                                className="text-green-600 hover:text-green-900 mr-3">
                                Edit
                              </button>
                              <button
                                onClick={() => { setSelectedDelSale(sale); setShowDeleteModal(true); }}
                                className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>

                          {/* Nested batch details rows (displayed if expanded) */}
                          {isExpanded && sale.affected_batches && sale.affected_batches.length > 0 && (
                            <>
                              <tr className="bg-gray-200 dark:bg-gray-700">
                                <td className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400" colSpan="2"></td> {/* Spacer for Date column */}
                                <td className="pl-8 pr-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Batch ID</td>
                                <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Qty from Batch</td>
                                <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Batch Cost/Unit</td>
                                <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Unit Profit</td>
                                <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Total Profit (Batch)</td>
                                <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400"></td> {/* Spacer for actions column */}
                              </tr>
                              {sale.affected_batches.map((batchDetail) => {
                                const unitProfit = (sale.sold_price || 0) - (batchDetail.cost_per_unit || 0);
                                const totalBatchProfit = unitProfit * batchDetail.quantity_from_batch;
                                return (
                                  <tr key={batchDetail.sales_detail_id || `${sale.sale_id}-batch-${batchDetail.purchase_id}`} className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500">
                                    <td className="px-4 py-2" colSpan="2"></td> {/* Spacer */}
                                    <td className="pl-8 pr-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{batchDetail.batch_id || 'N/A'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{batchDetail.quantity_from_batch}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(batchDetail.cost_per_unit || 0).toFixed(2)}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${unitProfit.toFixed(2)}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${totalBatchProfit.toFixed(2)}</td>
                                    <td className="px-2 py-2"></td> {/* Spacer */}
                                  </tr>
                                );
                              })}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
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