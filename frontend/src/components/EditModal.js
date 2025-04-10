import { useState, useEffect } from 'react';
import { updatePurchase } from '../services/api'; // Update this path/logic based on type

export default function EditModal(props) {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (props.item) {
      setFormData({ ...props.item });
    }
  }, [props.item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (props.type === 'purchase') {
        if (!formData.purchase_id) {
          console.error("Missing purchase_id for update");
          return;
        }
        await updatePurchase(formData.purchase_id, formData); // assumes `id` is part of formData
      } else if (props.type === 'sale') {
        // Add updateSale here if needed
      }

      props.onItemEdited(formData);

      setMessage({ text: props.successMessage, type: 'success' });

      setTimeout(() => {
        setMessage({ text: '', type: '' });
        props.onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error updating record.', type: 'error' });

      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  function handleClick() {
    props.onClose();
  }

  return (
    props.isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="p-6 rounded-lg shadow-lg w-1/3 bg-white dark:bg-gray-800 dark:text-white">
          <h2 className="text-lg font-bold mb-4">{props.title}</h2>

          {message.text && (
            <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg transition-opacity duration-500 ${
              message.type === 'success' 
              ? 'bg-green-500 text-white dark:bg-green-700' 
              : 'bg-red-500 text-white dark:bg-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {props.fields.map((field) => (
              <input
                key={field.name}
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            ))}

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
    )
  );
}