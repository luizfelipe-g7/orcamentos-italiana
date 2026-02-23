import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />
      
      <div 
        className={clsx(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Outlet context={{ collapsed }} />
      </div>
    </div>
  );
}
