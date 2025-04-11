import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import OrderModal from '../components/OrderModal';
import handleDownloadCSV from "../services/exportCSV";
import { getSales } from '../services/api';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';

function Sales() {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDelSale, setSelectedDelSale] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

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

  const filteredSales = useMemo(() => {
    const filtered = sales.filter(sale =>
      sale.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return filtered.sort((a, b) => {
      const dateA = new Date(a.sale_date);
      const dateB = new Date(b.sale_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sales, searchTerm, sortOrder]);

  const handleSaleAdded = () => {
    fetchSales();
  };

  const handleSaleEdited = () => {
    fetchSales();
  };

  const handleSaleDeleted = () => {
    fetchSales();
  };


  const handleExport = () => handleDownloadCSV("sales");

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <OrderModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onRecordAdded={handleSaleAdded}
        title="Add Sale Order"
        successMessage="Sale Order added successfully!"
        type="sale"
        fields={[
          { name: "product_code", placeholder: "Product Code" },
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1"  },
          { name: "sold_price", placeholder: "Sold Price", type: "number", min: "0", step: "5"  },
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
          { name: "quantity", placeholder: "Quantity", type: "number", min: "1", step: "1" },
          { name: "sold_price", placeholder: "Sold Price", type: "number", min: "0", step: "5" },
          { name: "sale_date", placeholder: "Sale Date", type: "date" },
        ]}
      />
      <DeleteModal
        isOpen={showDeleteModal} 
        item={selectedDelSale} 
        onClose={() => setShowDeleteModal(false)} 
        onItemEdited={handleSaleDeleted}
        title="Delete Sale Order"
        successMessage="Sale Order deleted successfully!"
        type="sale"
      />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Sales</h1>
        
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="w-64">
            <input 
              type="text" 
              placeholder="Search product code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300"
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
              New Sale
            </button>
            <button 
            onClick={handleExport}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
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
            <div className="max-h-[500px] overflow-y-auto" style={{ position: "relative" }}>
              <table className="min-w-full dark:bg-gray-800 border-gray-600">
                <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
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
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {sale.sale_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {sale.product_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        ${((sale.sold_price || 0)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        ${(((sale.sold_price || 0) * sale.quantity)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDelSale(sale);
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

export default Sales;