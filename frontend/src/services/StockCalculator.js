{/*import { getPurchases, getSales } from './api';

export const calculateStock = async () => {
  try {
    const [purchasesRes, salesRes] = await Promise.all([getPurchases(), getSales()]);

    const purchases = purchasesRes.data;
    const sales = salesRes.data;

    // Create a stock object mapping product codes to stock values
    const stockData = {};

    // Sum up all purchases per product
    purchases.forEach(({ product_code, quantity }) => {
      if (!stockData[product_code]) stockData[product_code] = 0;
      stockData[product_code] += quantity;
    });

    // Subtract sales per product
    sales.forEach(({ product_code, quantity }) => {
      if (!stockData[product_code]) stockData[product_code] = 0;
      stockData[product_code] -= quantity;
    });

    return stockData; // Returns an object { product_code: stock }
  } catch (err) {
    console.error('Error calculating stock:', err);
    return {};
  }
};*/}
