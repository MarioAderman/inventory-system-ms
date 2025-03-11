import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-semibold">Inventory System</h2>
      </div>
      <nav className="mt-6">
        <Link 
          to="/" 
          className={`flex items-center px-4 py-3 ${currentPath === '/' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
        >
          <span>Home</span>
        </Link>
        <Link 
          to="/add-product" 
          className={`flex items-center px-4 py-3 ${currentPath === '/add-product' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
        >
          <span>Add Product</span>
        </Link>
        <Link 
          to="/purchases" 
          className={`flex items-center px-4 py-3 ${currentPath === '/purchases' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
        >
          <span>Purchases</span>
        </Link>
        <Link 
          to="/sales" 
          className={`flex items-center px-4 py-3 ${currentPath === '/sales' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
        >
          <span>Sales</span>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;