
import React, { useState } from 'react';
import { Professional, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface ServicesPageProps {
  user: Professional | null;
  services: Service[];
  onAdd: (s: Omit<Service, 'id'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ user, services, onAdd, onToggle, onDelete, onLogout, navigate }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, active: true });
    setShowModal(false);
    setFormData({ name: '', description: '', duration: 30, price: 0 });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="services" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <button 
          onClick={() => navigate('dashboard')}
          className="flex items-center text-gray-400 hover:text-[#FF1493] mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">
            <Icons.ArrowLeft />
          </span>
          Voltar ao Painel
        </button>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight uppercase">Seus Serviços</h1>
            <p className="text-gray-500 font-medium tracking-tight">Gerencie o que você oferece aos seus clientes.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#FF1493] text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center space-x-2"
          >
            <Icons.Plus />
            <span>Adicionar Serviço</span>
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-pink-50 p-4 rounded-2xl text-[#FF1493] group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                    <Icons.Scissors />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => onDelete(service.id)}
                      className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={service.active} onChange={() => onToggle(service.id)} className="sr-only peer" />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF1493]"></div>
                    </label>
                  </div>
                </div>
                <h3 className="text-xl font-black text-black mb-1 uppercase tracking-tight">{service.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-4 line-clamp-2">{service.description}</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 text-gray-400">
                    <Icons.Clock />
                    <span className="text-xs font-black uppercase tracking-widest">{service.duration} min</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-black">R$ {service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-black uppercase tracking-tight">Novo Serviço</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-black transition-colors font-bold text-xl">✕</button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nome do Serviço</label>
                 <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Descrição Curta</label>
                 <textarea className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Duração (min)</label>
                   <input required type="number" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Preço (R$)</label>
                   <input required type="number" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                 </div>
               </div>
               <button className="w-full bg-[#FF1493] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-100 mt-4">Criar Serviço Agora</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
