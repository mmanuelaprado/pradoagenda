
import React, { useState } from 'react';
import { Professional, Client, View, Appointment } from '../types.ts';
import { Icons } from '../constants.tsx';

interface ClientsPageProps {
  user: Professional | null;
  clients: Client[];
  appointments: Appointment[];
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ user, clients, appointments, onLogout, navigate }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const clientHistory = selectedClient 
    ? appointments.filter(a => a.clientPhone === selectedClient.phone)
    : [];

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
      <button 
        onClick={() => navigate('dashboard')}
        className="flex items-center text-gray-400 hover:text-[#FF1493] mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
      >
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">
          <Icons.ArrowLeft />
        </span>
        Voltar ao Painel
      </button>

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Base de Clientes</h1>
          <p className="text-gray-500 font-medium tracking-tight">Gerencie os dados e a fidelidade das suas clientes.</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Nome ou WhatsApp..."
            className="w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-[#FF1493] transition-all font-bold text-sm bg-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
             <Icons.Users />
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Frequência</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.length > 0 ? filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-pink-50 text-[#FF1493] rounded-[1.5rem] flex items-center justify-center font-black text-xl group-hover:bg-[#FF1493] group-hover:text-white transition-all shadow-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-black uppercase tracking-tight">{client.name}</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Desde {new Date().getFullYear()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-gray-500 font-bold text-sm">{client.phone}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className="px-5 py-2 bg-pink-50 rounded-2xl text-[10px] font-black text-[#FF1493] uppercase tracking-widest border border-pink-100">
                      {client.totalBookings} Visitas
                    </span>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fiel</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                      <Icons.Users />
                    </div>
                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Nenhum cliente cadastrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl animate-fade-in-up relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <Icons.Users className="w-48 h-48" />
             </div>
             
             <div className="flex justify-between items-start mb-12">
               <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-[#FF1493] rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                     {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter">{selectedClient.name}</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">{selectedClient.phone}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedClient(null)} className="p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-300 hover:text-black">✕</button>
             </div>

             <div className="grid grid-cols-3 gap-6 mb-12">
               <div className="bg-gray-50 p-6 rounded-3xl text-center">
                 <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Total Gasto</p>
                 <p className="text-xl font-black text-black">R$ {clientHistory.length * 85}</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl text-center">
                 <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Frequência</p>
                 <p className="text-xl font-black text-black">{selectedClient.totalBookings}x</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl text-center">
                 <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Fidelidade</p>
                 <p className="text-xl font-black text-green-600">Alta</p>
               </div>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Histórico de Visitas</h3>
               <div className="max-h-60 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                 {clientHistory.length > 0 ? clientHistory.map(a => (
                   <div key={a.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                     <div>
                       <p className="font-black text-black uppercase text-xs">Agendamento Realizado</p>
                       <p className="text-gray-400 text-[10px] font-bold uppercase">{new Date(a.date).toLocaleDateString('pt-BR')} • {new Date(a.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                     </div>
                     <span className="text-green-500 font-black text-[10px] uppercase tracking-widest">Finalizado</span>
                   </div>
                 )) : (
                   <p className="text-gray-300 font-bold italic text-xs">Sem registros antigos.</p>
                 )}
               </div>
             </div>
             
             <button onClick={() => setSelectedClient(null)} className="w-full mt-12 py-6 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-xl">Fechar Detalhes</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientsPage;
