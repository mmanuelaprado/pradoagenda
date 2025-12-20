
import React, { useState } from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';

interface DashboardProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, appointments, services, onUpdateStatus, onLogout, navigate }) => {
  const [copyStatus, setCopyStatus] = useState(false);
  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  
  const baseDomain = window.location.origin;
  const publicLink = `${baseDomain}/?b=${user?.slug || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
        <div className="animate-fade-in">
          <h1 className="text-xl md:text-4xl font-black text-black tracking-tighter uppercase mb-1">Olá, {user?.name.split(' ')[0]}!</h1>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium tracking-tight">O mercado da beleza não para. Sua agenda também não.</p>
        </div>
        
        <div className="bg-white px-5 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-md w-full md:w-auto group hover:border-[#FF1493] transition-colors">
           <div className="flex-grow min-w-0">
             <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Link de Agendamento</p>
             <p className="text-[11px] font-bold text-black truncate">{publicLink.replace(/(^\w+:|^)\/\//, '')}</p>
           </div>
           <div className="flex gap-2">
             <button 
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all ${copyStatus ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}`}
             >
               {copyStatus ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
             </button>
             <button 
              onClick={() => window.open(publicLink, '_blank')}
              className="p-2 rounded-xl bg-black text-white shadow-lg"
             >
               <Icons.Eye className="w-3.5 h-3.5" />
             </button>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
         {[
           { label: 'Nova Agenda', icon: Icons.Plus, color: 'bg-black', view: 'agenda' },
           { label: 'Equipe', icon: Icons.Users, color: 'bg-gray-800', view: 'professionals' },
           { label: 'Apps', icon: Icons.Smartphone, color: 'bg-gray-400', view: 'apps' }
         ].map((act, i) => (
           <button 
            key={i} 
            onClick={() => navigate(act.view as View)}
            className={`${act.color} text-white p-5 rounded-3xl flex flex-col items-start justify-between shadow-lg active:scale-95 transition-all flex`}
           >
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <act.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-left mt-4">{act.label}</span>
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
             <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2">
               <Icons.Finance className="w-4 h-4" /> Resumo Hoje
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Receita</p>
                 <p className="text-xl font-black text-black">
                   R$ {todayAppts.reduce((acc, curr) => acc + (services.find(s => s.id === curr.serviceId)?.price || 0), 0)}
                 </p>
               </div>
               <div>
                 <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Atendimentos</p>
                 <p className="text-xl font-black text-black">{todayAppts.length}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm md:text-xl font-black text-black tracking-tight uppercase">Próximos Horários</h2>
              <button onClick={() => navigate('agenda')} className="text-[8px] font-black uppercase tracking-widest text-[#FF1493]">Ver Todos</button>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments.length > 0 ? appointments.slice(0, 10).map((appt) => (
                <div key={appt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF1493] text-lg font-black uppercase">
                      {appt.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-black text-[13px] uppercase tracking-tight">{appt.clientName}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <span className="text-[9px] text-gray-300">•</span>
                        <p className="text-[9px] font-black text-[#FF1493] uppercase">{services.find(s => s.id === appt.serviceId)?.name || 'Serviço'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdateStatus(appt.id, 'confirmed')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                          appt.status === 'confirmed' ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700'
                        }`}
                      >
                        <Icons.Check className="w-3 h-3" />
                        <span className="hidden sm:inline">Confirmar</span>
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                          appt.status === 'cancelled' ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        <Icons.Trash className="w-3 h-3" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20"><Icons.Calendar /></div>
                  <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Nenhum horário registrado para hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
