import { useState } from 'react'
import { addPurchase } from '../services/api';

export default function PurchaseOrderModal(props) {

    const [formData, setFormData] = useState({
        product_code: "",
        batch_id: "",
        quantity: "",
        cost_per_unit: "",
        purchase_date: "",
      });
    
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value, // Update the corresponding field
        });
        console.log(formData)
    };

    const handleAddPurchase = async (e) => {
        e.preventDefault();
        try {
          const purchaseData = {
            ...formData,
            cost_per_unit: formData.cost_per_unit ? Math.round(parseFloat(formData.cost_per_unit)) : 0
          };
          
          await addPurchase(purchaseData); // Ensure it's saved in the DB first
          props.onPurchaseAdded(); // Trigger re-fetch in parent

          setMessage({ text: 'PO added successfully!', type: 'success' });
          setFormData({ product_code: '', batch_id: '', quantity: '', cost_per_unit: '', purchase_date: '' });
          
          setTimeout(() => {
            setMessage({ text: '', type: '' });
          }, 3000);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Error adding PO.', type: 'error' });
            
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        }
      };
    
    function handleClick() {
        setFormData({ product_code: '', batch_id: '', quantity: '', cost_per_unit: '', purchase_date: '' });
        props.onClose();
    }

  return (
    <div>
      {props.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-lg shadow-lg w-1/3 bg-white dark:bg-gray-800 dark:text-white">
            <h2 className="text-lg font-bold mb-4">Add Purchase Order</h2>

            {message.text && (
                <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg transition-opacity duration-500 ease-in-out  ${
                    message.type === 'success' 
                    ? 'bg-green-500 text-white dark:bg-green-700' 
                    : 'bg-red-500 text-white dark:bg-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleAddPurchase}>
              <input
                id="product_code"
                type="text"
                name="product_code"
                placeholder="Product Code"
                value={formData.product_code}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <input
                id="batch_id"
                type="text"
                name="batch_id"
                placeholder="Batch ID"
                value={formData.batch_id}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <input
                id="quantity"
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <input
                id="cost_per_unit"
                type="number"
                name="cost_per_unit"
                placeholder="Cost Per Unit"
                value={formData.cost_per_unit}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <input
                id="purchase_date"
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="px-4 py-2 bg-gray-400 text-white rounded dark:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded dark:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}