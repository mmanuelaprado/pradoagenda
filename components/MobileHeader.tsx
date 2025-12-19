
import React, { useState } from 'react';
import { Icons } from '../constants.tsx';
import { View, Professional } from '../types.ts';

interface MobileHeaderProps {
  user: Professional | null;
  navigate: (v: View) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden bg-black text-white p-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-2" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold">P</div>
        <span className="font-bold">Pradoagenda</span>
      </div>
      
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black z-50 p-6 flex flex-col animate-fade-in">
          <div className="flex justify-between items-center mb-10">
            <span className="text-xl font-bold uppercase tracking-widest text-[#FF1493]">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-white text-2xl">✕</button>
          </div>
          <nav className="flex-grow space-y-4 overflow-y-auto pb-10 custom-scrollbar">
            {[
              { view: 'dashboard', label: 'Início', icon: Icons.Home },
              { view: 'agenda', label: 'Agenda', icon: Icons.Calendar },
              { view: 'clients', label: 'Clientes', icon: Icons.Users },
              { view: 'services', label: 'Serviços', icon: Icons.Scissors },
              { view: 'professionals', label: 'Profissionais', icon: Icons.Users },
              { view: 'finance', label: 'Financeiro', icon: Icons.Finance },
              { view: 'recurring', label: 'Agendamento recorrente', icon: Icons.Repeat },
              { view: 'inactivation', label: 'Inativação de horários', icon: Icons.Ban },
              { view: 'company', label: 'Minha empresa', icon: Icons.Building },
              { view: 'settings', label: 'Configurações', icon: Icons.Settings },
              { view: 'apps', label: 'Baixar Apps', icon: Icons.Smartphone },
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => { navigate(item.view as View); setIsOpen(false); }}
                className="w-full flex items-center space-x-4 p-4 bg-white/5 rounded-2xl text-left"
              >
                <item.icon />
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
