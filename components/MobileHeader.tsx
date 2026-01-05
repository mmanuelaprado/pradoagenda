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
    <header className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40 h-16">
      <div className="flex items-center space-x-2" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold shadow-lg shadow-pink-100 transition-transform active:scale-95">
          <span className="text-white text-xs">P</span>
        </div>
        <span className="font-black text-black text-sm uppercase tracking-tighter">Prado Agenda</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={onLogout}
          className="flex flex-col items-center justify-center text-gray-300 hover:text-red-500 transition-all active:scale-90"
        >
          <Icons.Logout className="w-5 h-5" />
          <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5">Sair</span>
        </button>
        <button 
          onClick={() => navigate('company')}
          className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-[#FF1493] border border-pink-100 font-black text-xs shadow-sm transition-all active:scale-95 overflow-hidden"
        >
          {user?.name?.charAt(0) || "U"}
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;