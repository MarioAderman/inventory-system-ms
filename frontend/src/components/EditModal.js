import React, { useState, useEffect } from 'react';

const EditModal = ({ isOpen, item, onClose, onItemEdited, title = "Edit Item", fields }) => {
  const initialFormState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Reset form data when the item changes
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Call the parent's handler with edited fields
      onItemEdited(formData);
      setMessage({ text: 'Item updated successfully.', type: 'success' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        onClose();
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error updating item.', type: 'error' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-6 rounded-lg shadow-lg w-1/3 bg-white dark:bg-gray-800 dark:text-white">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {message.text && (
          <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg transition-opacity duration-500 ${
            message.type === 'success'
              ? 'bg-green-500 text-white dark:bg-green-700'
              : 'bg-red-500 text-white dark:bg-red-700'
          }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <input
              key={field.name}
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
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
  );
};

export default EditModal;