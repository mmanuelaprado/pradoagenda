
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
    { view: 'recurring', icon: Icons.Repeat, label: 'Agendamento recorrente' },
    { view: 'inactivation', icon: Icons.Ban, label: 'Inativação de horários' },
    { view: 'company', icon: Icons.Building, label: 'Minha empresa' },
    { view: 'settings', icon: Icons.Settings, label: 'Configurações' },
    { view: 'apps', icon: Icons.Smartphone, label: 'Baixar Apps' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-black text-white p-6 sticky top-0 h-screen overflow-y-auto custom-scrollbar border-r border-white/5 flex-shrink-0">
      <div className="flex items-center space-x-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold">P</div>
        <span className="text-xl font-bold tracking-tight">Pradoagenda</span>
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
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <button 
        onClick={onLogout} 
        className="flex items-center space-x-3 p-3 text-gray-400 hover:text-red-400 transition-colors mt-8 border-t border-white/5 pt-6"
      >
        <Icons.Logout />
        <span className="font-bold text-sm uppercase tracking-widest">Sair da Conta</span>
      </button>
    </aside>
  );
};

export default Sidebar;
