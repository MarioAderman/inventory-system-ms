import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import handleDownloadCSV from "../services/exportCSV";
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('description');
  const [expandedProducts, setExpandedProducts] = useState([]);
  const [hideZeroStock, setHideZeroStock] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDelProduct, setSelectedDelProduct] = useState(null);

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

  const filteredProducts = products.filter(product => {
    // Checks which category is selected to look up into (Description, Code or Brand)
    const matchesSearchTerm = 
      searchMode === 'description' ? 
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) :
      searchMode === 'code' ? 
        product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) :
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const totalStock = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const meetsStockCondition = hideZeroStock ? totalStock > 0 : true;
    
    return matchesSearchTerm && meetsStockCondition;
  });
  
  const handleExport = () => handleDownloadCSV("products");

  const toggleExpand = (productCode) => {
    // Expandable rows to show all batches linked to a product code
    setExpandedProducts(prev => 
      prev.includes(productCode)
        ? prev.filter(code => code !== productCode)
        : [...prev, productCode]
    );
  };

  const toggleHideZeroStock = () => {
    setHideZeroStock((prev) => !prev);
  };

  // NEW: Function to open the edit modal
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // NEW: Function to close the edit modal
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleProductEdited = () => {
    fetchProducts();
  };

  const handleProductDeleted = () => {
    fetchProducts();
  }; 

  return (
    <div>

      {/* Modals */}
      <EditModal 
        isOpen={showEditModal} 
        item={selectedProduct} 
        onClose={() => handleCloseEdit()} 
        onItemEdited={handleProductEdited}
        title="Edit Product Info"
        successMessage="Product updated successfully!"
        type="product"
        fields={[
          { name: "product_code", placeholder: "Product Code" },
          { name: "brand", placeholder: "Brand" },
          { name: "description", placeholder: "Description"},
          { name: "size", placeholder: "Size"},
          { name: "current_price", placeholder: "Current Price", type: "number", min: "0", step: "0.1" },
        ]}
      />
      <DeleteModal
        isOpen={showDeleteModal} 
        item={selectedDelProduct} 
        onClose={() => setShowDeleteModal(false)} 
        onItemEdited={handleProductDeleted}
        title="Delete Product"
        successMessage="Product deleted successfully!"
        type="product"
      />
      
      {/* Search, filters row and Export CSV control */}
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
              className={`w-32 px-4 py-2 ${
                searchMode === "code"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setSearchMode('brand')}
              className={`w-32 px-4 py-2 rounded-r ${
                searchMode === "brand"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Brand
            </button>
          </div>
          <div className="w-64">
            <input 
              type="text" 
              placeholder={
                searchMode === 'description' ? 'Search by description...' :
                searchMode === 'code' ? 'Search by product code...' :
                'Search by brand...'
              } 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:text-gray-300"
            />
            </div>
          </div>
        </div>
        
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={hideZeroStock}
            onChange={toggleHideZeroStock}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700 dark:text-gray-300">Hide Zero Stock Products</span>
        </label>

        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-gray-700 dark:text-gray-300">
          Export CSV
        </button>
      </div>
      
      {/* Products table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden border-gray-200 dark:border-gray-700">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-500 dark:bg-blue-800 sticky top-0 z-10">
              <tr>
                <th className="w-[160px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Product Code
                </th>
                <th className="w-[140px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Brand
                </th>
                <th className="w-[120px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="w-[120px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Size
                </th>
                <th className="w-[120px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="w-[140px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="w-[140px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="w-[160px] px-6 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">
                  Current Price
                </th>
                <th className="w-[120px] px-6 py-3 text-right text-white text-sm font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredProducts.map((product) => {
                const totalStock = product.batches
                  ? product.batches.reduce((sum, batch) => sum + batch.quantity, 0)
                  : 0;
                const isExpanded = expandedProducts.includes(product.product_code);
                const totalCost = product.batches
                  ? product.batches.reduce((sum, batch) => sum + batch.quantity * batch.cost_per_unit, 0)
                  : 0;
                return (

                  <React.Fragment key={product.product_code}>
                    {/* Main product row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="w-[120px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.product_code}
                      </td>
                      <td className="w-[150px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.brand}
                      </td>
                      <td className="w-[500px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.description}
                      </td>
                      <td className="w-[100px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        {product.size}
                      </td>
                      <td className="w-[100px] px-6 py-4 whitespace-nowrap dark:text-gray-300 font-bold" colSpan="2">
                        {totalStock}
                      </td>
                      <td className="w-[120px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        ${parseFloat(totalCost).toFixed(2)}
                      </td>
                      <td className="w-[120px] px-6 py-4 whitespace-nowrap dark:text-gray-300">
                        ${parseFloat(product.current_price || 0).toFixed(2)}
                      </td>
                      <td className="w-[150px] px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => toggleExpand(product.product_code)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                        <button 
                          onClick={() => 
                            handleOpenEdit(product)
                          }
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDelProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
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
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500" colSpan="2">
                          ${parseFloat(batch.quantity * batch.cost_per_unit || 0).toFixed(2)}
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