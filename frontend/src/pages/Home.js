import React from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';

function Home() {
  return (
    <div className="flex h-screen bg-gray-100:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Inventory</h1>
        <ProductList />
      </div>
    </div>
  );
}

export default Home;