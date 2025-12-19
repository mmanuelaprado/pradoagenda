
import React from 'react';
import { View, Professional } from '../types.ts';

interface MobileHeaderProps {
  user: Professional | null;
  navigate: (v: View) => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user, navigate }) => {
  return (
    <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40 h-16">
      <div className="flex items-center space-x-2" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center font-bold shadow-lg shadow-pink-100">
          <span className="text-white text-xs">P</span>
        </div>
        <span className="font-black text-black text-sm uppercase tracking-tighter">Prado Agenda</span>
      </div>
      
      <button 
        onClick={() => navigate('company')}
        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200"
      >
        {user?.name.charAt(0) || <div className="w-4 h-4 bg-gray-200 rounded-full" />}
      </button>
    </header>
  );
};

export default MobileHeader;
