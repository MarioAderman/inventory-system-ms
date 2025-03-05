{/* Import modules */}
import React from 'react';
import ProductList from '../components/ProductList';

function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-6">Inventory Management System</h1>
      <ProductList />
    </div>
  );
}

export default Home;