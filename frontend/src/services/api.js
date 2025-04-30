import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // If run locally
});

// Endpoints for products table
export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Endpoints for purchases table
export const getPurchases = () => api.get('/purchases');
export const addPurchase = (purchase) => api.post('/purchases', purchase);
export const updatePurchase = (id, data) => api.put(`/purchases/${id}`, data);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);

// Endpoints for sales table
export const getSales = () => api.get('/sales');
export const addSale = (sale) => api.post('/sales', sale);
export const updateSale = (id, data) => api.put(`/sales/${id}`, data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// Endpoints for export CSV process
export const exportCsv = (page) => api.get(`/export-csv?page=${page}`, { responseType: "blob" })

export default api;