import React from 'react';
import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] w-64 transition-all"
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-1"></div>
          
          <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#003366]/10 flex items-center justify-center text-[#003366]">
              <User size={18} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
