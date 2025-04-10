import { useState } from 'react';
import { deletePurchase } from '../services/api';

export default function DeleteModal(props) {

    const [message, setMessage] = useState({ text: '', type: '' });

    const handleFormSubmit = async (e) => {

        e.preventDefault();
        
        try {
            if (props.type === 'purchase') 
                if (!props.item) {
                    console.error("Missing purchase_id for delete");
                return;
                }
                await deletePurchase(props.item.purchase_id); // assumes `id` is part of formData

            setMessage({ text: props.successMessage, type: 'success' });

            setTimeout(() => {
                setMessage({ text: '', type: '' });
                props.onClose();
                props.onItemEdited();
            }, 3000);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Error updating record.', type: 'error' });

            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    function handleCancel() {
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
                <div className="flex justify-end gap-2 items-center gap-4">
                <label className="text-gray-800 dark:text-gray-300">
                    Are you sure you want to delete this record?
                </label>
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
                        Delete
                    </button>
                </div>
            </form>
            </div>
        </div>
        )
    );
    }