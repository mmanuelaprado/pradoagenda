import React from 'react';
import { View, Professional } from '../types.ts';
import { Icons } from '../constants.tsx';

interface MobileHeaderProps {
  user: Professional | null;
  navigate: (v: View) => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user, navigate, onLogout }) => {
  return (
    <header 
      className="md:hidden bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pb-4 flex items-center justify-between sticky top-0 z-40 transition-all"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <div className="flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer group" onClick={() => navigate('landing')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold shadow-lg shadow-pink-200">
          <span className="text-white text-xs">P</span>
        </div>
        <span className="font-black text-black text-sm uppercase tracking-tighter group-active:text-[#FF1493]">Prado Agenda</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => navigate('company')}
          className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#FF1493] font-black text-xs overflow-hidden border border-pink-100 active:scale-90 transition-all"
        >
          {user?.name?.charAt(0) || 'P'}
        </button>

        <button 
          onClick={() => {
            if(window.confirm('Deseja realmente sair do sistema?')) {
              onLogout();
            }
          }}
          className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all border border-gray-100"
          title="Sair do App"
        >
          <Icons.Logout className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;