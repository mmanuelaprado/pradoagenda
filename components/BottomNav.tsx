
import React from 'react';
import { Icons } from '../constants.tsx';
import { View } from '../types.ts';

interface BottomNavProps {
  activeView: View;
  navigate: (v: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, navigate }) => {
  const navItems = [
    { view: 'dashboard' as View, icon: Icons.Home, label: 'Início' },
    { view: 'agenda' as View, icon: Icons.Calendar, label: 'Agenda' },
    { view: 'clients' as View, icon: Icons.Users, label: 'Clientes' },
    { view: 'services' as View, icon: Icons.Scissors, label: 'Serviços' },
    { view: 'settings' as View, icon: Icons.Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around px-2 pb-safe pt-2 z-50 h-16">
      {navItems.map((item) => {
        const isActive = activeView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => navigate(item.view)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-[#FF1493]' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-pink-50' : ''}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
