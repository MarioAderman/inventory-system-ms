import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [darkMode, setDarkMode] = React.useState(false);

  // Add useEffect to sync state with actual dark mode status
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Toggle dark class on html element
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md h-screen flex flex-col">
      <div className="p-4 bg-blue-600 dark:bg-blue-800 text-white">
        <h2 className="text-xl font-semibold">Inventory System</h2>
      </div>
      <nav className="mt-6 flex-grow">
        <Link 
          to="/" 
          className={`flex items-center px-4 py-3 ${
            currentPath === '/' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-4 border-blue-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <span>Home</span>
        </Link>
        <Link 
          to="/add-product" 
          className={`flex items-center px-4 py-3 ${
            currentPath === '/add-product' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-4 border-blue-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <span>Add Product</span>
        </Link>
        <Link 
          to="/purchases" 
          className={`flex items-center px-4 py-3 ${
            currentPath === '/purchases' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-4 border-blue-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <span>Purchases</span>
        </Link>
        <Link 
          to="/sales" 
          className={`flex items-center px-4 py-3 ${
            currentPath === '/sales' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-4 border-blue-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <span>Sales</span>
        </Link>
      </nav>
      {/* Theme switcher button */}
      <div className="p-4 border-t dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? (
            <>
              <span className="mr-2">🌞</span> Light Mode
            </>
          ) : (
            <>
              <span className="mr-2">🌙</span> Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;