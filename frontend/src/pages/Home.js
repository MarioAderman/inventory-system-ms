import React from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';

function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Inventory</h1>
        <ProductList />
      </div>
    </div>
  );
}

export default Home;