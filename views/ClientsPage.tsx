
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

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá ${name}! Tudo bem?`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">CRM de Clientes</h1>
          <p className="text-gray-500 font-medium">Sua base de dados organizada automaticamente.</p>
        </div>
        <div className="relative w-full md:w-96">
          <input type="text" placeholder="Buscar cliente..." className="w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 shadow-sm outline-none font-bold text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><Icons.Users /></div>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Visitas</th>
                <th className="px-10 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-pink-50 text-[#FF1493] rounded-2xl flex items-center justify-center font-black">{client.name.charAt(0)}</div>
                      <div><p className="font-black text-black uppercase">{client.name}</p><p className="text-[10px] text-gray-300 font-bold">{client.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center"><span className="px-4 py-1.5 bg-pink-50 rounded-full text-[10px] font-black text-[#FF1493] uppercase">{client.totalBookings}x</span></td>
                  <td className="px-10 py-8 text-right flex justify-end gap-2">
                    <button onClick={() => openWhatsApp(client.phone, client.name)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><Icons.WhatsApp className="w-4 h-4" /></button>
                    <button onClick={() => setSelectedClient(client)} className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">Ficha</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ClientsPage;
