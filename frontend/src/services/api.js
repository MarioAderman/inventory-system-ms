import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const getPurchases = () => api.get('/purchases');
export const addPurchase = (purchase) => api.post('/purchases', purchase);
export const getSales = () => api.get('/sales');
export const addSale = (sale) => api.post('/sales', sale);

export default api;