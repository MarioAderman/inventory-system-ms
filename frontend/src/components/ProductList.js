import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Product Inventory</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Product Code</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Current Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_code} className="border-b hover:bg-gray-50">
                <td className="p-3">{product.product_code}</td>
                <td className="p-3">{product.description}</td>
                <td className="p-3">${(product.current_price / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;