import React from 'react';
import { Icons } from './constants.tsx';
import { View } from './types.ts';

interface SidebarProps {
  activeView: View;
  navigate: (v: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, navigate, onLogout }) => {
  const menuItems: { view: View; icon: React.FC; label: string }[] = [
    { view: 'dashboard', icon: Icons.Home, label: 'Início' },
    { view: 'agenda', icon: Icons.Calendar, label: 'Agenda' },
    { view: 'clients', icon: Icons.Users, label: 'Clientes' },
    { view: 'services', icon: Icons.Scissors, label: 'Serviços' },
    { view: 'professionals', icon: Icons.Users, label: 'Profissionais' },
    { view: 'finance', icon: Icons.Finance, label: 'Financeiro' },
    { view: 'recurring', icon: Icons.Repeat, label: 'Recorrente' },
    { view: 'inactivation', icon: Icons.Ban, label: 'Inativação' },
    { view: 'company', icon: Icons.Building, label: 'Empresa' },
    { view: 'settings', icon: Icons.Settings, label: 'Ajustes' },
    { view: 'apps', icon: Icons.Smartphone, label: 'Baixar App' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black text-white p-6 sticky top-0 h-screen overflow-y-auto custom-scrollbar border-r border-white/5 flex-shrink-0">
      <div className="flex items-center space-x-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold">P</div>
        <span className="text-lg font-bold tracking-tight">Pradoagenda</span>
      </div>
      
      <nav className="flex-grow space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => navigate(item.view)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl font-medium transition-all ${
              activeView === item.view 
                ? 'bg-[#FF1493] text-white shadow-lg shadow-pink-900/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon />
            <span className="text-[13px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center space-x-3 p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Icons.Logout className="w-5 h-5" />
          <span className="font-bold text-[11px] uppercase tracking-widest">Sair</span>
        </button>

        <div className="px-3 pb-2 text-center">
          <p className="text-[8px] font-black text-gray-600 tracking-wider">
            © 2024 PRADO AGENDA
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;