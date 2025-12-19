
import React, { useState } from 'react';
import { Professional, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface InactivationPageProps {
  user: Professional | null;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const InactivationPage: React.FC<InactivationPageProps> = ({ user, onLogout, navigate }) => {
  const [inactivations, setInactivations] = useState([
    { id: 1, date: '2024-12-25', description: 'Natal', type: 'full' },
    { id: 2, date: '2025-01-01', description: 'Ano Novo', type: 'full' },
  ]);

  const [formData, setFormData] = useState({ date: '', description: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;
    setInactivations([...inactivations, { ...formData, id: Date.now(), type: 'full' }]);
    setFormData({ date: '', description: '' });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="inactivation" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-4xl mx-auto w-full pb-24 md:pb-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Inativação de Horários</h1>
          <p className="text-gray-500 font-medium tracking-tight">Bloqueie datas ou horários específicos para folgas, feriados ou eventos particulares.</p>
        </header>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-10">
           <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight">Bloquear Nova Data</h2>
           <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-black outline-none bg-gray-50 font-bold"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="flex-grow-[2] space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo / Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Feriado Municipal, Médico, etc."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-black outline-none bg-gray-50 font-bold"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full md:w-auto bg-black text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Bloquear Agora</button>
              </div>
           </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Próximas Datas Inativadas</h2>
          {inactivations.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#FF1493] transition-all">
               <div className="flex items-center space-x-6">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-black">
                   <Icons.Ban />
                 </div>
                 <div>
                   <h4 className="font-black text-black uppercase tracking-tight">{item.description || 'Bloqueio de Agenda'}</h4>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                 </div>
               </div>
               <button 
                onClick={() => setInactivations(inactivations.filter(i => i.id !== item.id))}
                className="p-3 text-gray-200 hover:text-red-500 transition-colors"
               >
                 <Icons.Trash />
               </button>
            </div>
          ))}
          {inactivations.length === 0 && (
             <p className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest italic">Nenhuma inativação programada.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default InactivationPage;
