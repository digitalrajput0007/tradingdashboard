import React, { useState } from 'react';
import Header from './Header';

const SidebarContent = () => (
  <>
    <h1 className="text-2xl font-bold text-cyan-400 mb-8">TradeDash</h1>
    <nav className="space-y-2">
      <a href="/" className="block py-2 px-4 rounded bg-gray-700">Dashboard</a>
      <a href="/ledger" className="block py-2 px-4 rounded hover:bg-gray-700">Ledger</a>
      <a href="/paper-trade" className="block py-2 px-4 rounded hover:bg-gray-700">Paper Trade</a>
      <a href="/position-sizer" className="block py-2 px-4 rounded hover:bg-gray-700">Position Size Calculator</a>
      <a href="/portfolio" className="block py-2 px-4 rounded hover:bg-gray-700">Portfolio</a>
    </nav>
  </>
);

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex overflow-x-hidden"> {/* FIX: Added overflow-x-hidden */}
      {/* Mobile Sidebar (Overlay) */}
      <aside className={`fixed inset-y-0 left-0 bg-gray-800 w-64 p-4 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30 lg:hidden`}>
        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-gray-800 p-4">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full"> {/* FIX: Added w-full */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
