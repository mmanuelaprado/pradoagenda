
import React, { useState } from 'react';
import { Professional, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface ProfessionalsPageProps {
  user: Professional | null;
  professionals: Professional[];
  onAdd: (p: Professional) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ProfessionalsPage: React.FC<ProfessionalsPageProps> = ({ user, professionals, onAdd, onLogout, navigate }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: user?.businessName || '',
    email: '',
    slug: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-')
    });
    setShowModal(false);
    setFormData({ name: '', businessName: user?.businessName || '', email: '', slug: '' });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="professionals" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight uppercase">Sua Equipe</h1>
            <p className="text-gray-500 font-medium tracking-tight">Gerencie os profissionais que atendem em seu estabelecimento.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl flex items-center space-x-2"
          >
            <Icons.Plus />
            <span>Adicionar Profissional</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {professionals.map((prof, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative group hover:shadow-2xl transition-all">
               <div className="absolute top-6 right-6">
                 <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
               </div>
               
               <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center text-[#FF1493] text-3xl font-black mb-6 group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                  {prof.name.charAt(0)}
               </div>
               
               <h3 className="text-xl font-black text-black uppercase tracking-tight mb-1">{prof.name}</h3>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">{prof.email}</p>
               
               <div className="space-y-3 border-t border-gray-50 pt-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Expediente</span>
                    <span className="text-black">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Link Individual</span>
                    <span className="text-[#FF1493] lowercase">prado.com/b/{prof.slug}</span>
                  </div>
               </div>
               
               <button className="w-full mt-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-black group-hover:text-white transition-all">Configurar Agenda</button>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-black uppercase tracking-tight">Novo Profissional</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-black transition-colors font-bold text-xl">✕</button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nome Completo</label>
                 <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">E-mail para Acesso</label>
                 <input required type="email" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <button className="w-full bg-[#FF1493] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-100 mt-4">Convidar Profissional</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsPage;
