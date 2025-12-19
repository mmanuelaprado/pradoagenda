
import React from 'react';
import { Icons } from '../constants.tsx';
import { Professional, View } from '../types.ts';

// Added Props interface to handle commonProps spread
interface AppsPageProps {
  user: Professional | null;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const AppsPage: React.FC<AppsPageProps> = ({ user, onLogout, navigate }) => {
  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">Baixar Apps</h1>
        <p className="text-gray-500 font-medium">Leve o Prado Agenda no seu bolso e receba notificações em tempo real.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-black text-white p-12 rounded-[4rem] flex flex-col justify-between shadow-2xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
             <Icons.Smartphone />
           </div>
           
           <div>
             <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">iOS / iPhone</h2>
             <p className="text-gray-400 font-medium text-lg mb-10">Baixe agora na App Store e gerencie sua empresa com a elegância que ela merece.</p>
           </div>
           
           <button className="bg-[#FF1493] text-white w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-900/50 hover:bg-pink-700 transition-all flex items-center justify-center space-x-3">
              <span>Baixar na App Store</span>
           </button>
        </div>

        <div className="bg-white border-4 border-black p-12 rounded-[4rem] flex flex-col justify-between shadow-xl relative overflow-hidden group">
           <div>
             <h2 className="text-4xl font-black text-black mb-4 uppercase tracking-tighter">Android</h2>
             <p className="text-gray-500 font-medium text-lg mb-10">Disponível na Google Play Store para todos os smartphones e tablets.</p>
           </div>
           
           <button className="bg-black text-white w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-3">
              <span>Baixar na Play Store</span>
           </button>
        </div>
      </div>

      <div className="mt-20 text-center">
         <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-xs">Versão do Sistema 3.4.0</p>
      </div>
    </main>
  );
};

export default AppsPage;
