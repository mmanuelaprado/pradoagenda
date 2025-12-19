
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
  const [copied, setCopied] = useState(false);
  // Use current origin instead of hardcoded domain
  const bookingUrl = `${window.location.origin}/?b=${user?.slug || 'demo'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-20 md:pb-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-4">
        <div className="animate-fade-in text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-black tracking-tighter uppercase mb-1">Olá, {user?.name.split(' ')[0]}!</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium tracking-tight">O mercado da beleza não para. Sua agenda também não.</p>
        </div>
        
        <div className="flex items-center bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] p-2 md:p-3 pl-4 md:pl-8 shadow-sm group animate-fade-in">
          <div className="flex flex-col mr-4 md:mr-8 overflow-hidden">
            <span className="text-[8px] md:text-[10px] text-gray-300 uppercase font-black tracking-widest mb-0.5">Seu Link Público</span>
            <span className="text-[10px] md:text-sm font-bold text-black truncate max-w-[120px] md:max-w-[200px]">{bookingUrl}</span>
          </div>
          <button 
            onClick={handleCopy} 
            className={`p-3 md:p-5 rounded-xl md:rounded-3xl transition-all flex items-center justify-center space-x-2 active:scale-95 ${
              copied ? 'bg-green-500 text-white' : 'bg-[#FF1493] text-white'
            }`}
          >
            <Icons.Copy className="w-4 h-4" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest pr-1">{copied ? 'OK' : 'Link'}</span>
          </button>
        </div>
      </header>

      {/* Quick Actions Grid - Smaller on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
         {[
           { label: 'Novo Agend.', icon: Icons.Plus, color: 'bg-black', view: 'agenda' },
           { label: 'Marketing AI', icon: Icons.Brain, color: 'bg-[#FF1493]', view: 'marketing' },
           { label: 'Minha Equipe', icon: Icons.Users, color: 'bg-gray-800', view: 'professionals' },
           { label: 'Ajustes', icon: Icons.Settings, color: 'bg-gray-400', view: 'settings' }
         ].map((act, i) => (
           <button 
            key={i} 
            onClick={() => navigate(act.view as View)}
            className={`${act.color} text-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col items-start justify-between shadow-lg active:scale-95 transition-all`}
           >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <act.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-left mt-4 leading-tight">{act.label}</span>
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
        <div className="xl:col-span-4 space-y-6 md:space-y-10">
          <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] shadow-sm border border-gray-100">
             <h3 className="text-[10px] md:text-sm font-black text-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2">
               <Icons.Finance className="w-4 h-4 md:w-5 md:h-5" /> Performance
             </h3>
             <div className="space-y-6 md:space-y-8">
               <div>
                 <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Receita Prevista</p>
                 <p className="text-2xl md:text-4xl font-black text-black tracking-tighter">
                   R$ {todayAppts.reduce((acc, curr) => acc + (services.find(s => s.id === curr.serviceId)?.price || 0), 0)}
                 </p>
               </div>
               <div className="grid grid-cols-2 gap-2 pt-6 border-t border-gray-50">
                 <div>
                   <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Visitas</p>
                   <p className="text-xl md:text-2xl font-black text-black">{todayAppts.length}</p>
                 </div>
                 <div>
                   <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Pendentes</p>
                   <p className="text-xl md:text-2xl font-black text-[#FF1493]">{appointments.filter(a => a.status === 'pending').length}</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white rounded-2xl md:rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base md:text-xl font-black text-black tracking-tight uppercase">Próximas Visitas</h2>
              <button onClick={() => navigate('agenda')} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#FF1493]">Ver Tudo</button>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments.length > 0 ? appointments.slice(0, 4).map((appt) => (
                <div key={appt.id} className="p-5 md:p-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3 md:space-x-6">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-pink-50 rounded-xl md:rounded-[2rem] flex items-center justify-center text-[#FF1493] text-sm md:text-xl font-black">
                      {appt.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-black text-sm md:text-lg tracking-tight uppercase truncate max-w-[100px] md:max-w-none">{appt.clientName}</h4>
                      <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{appt.clientPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8">
                     <div className="text-right">
                       <span className="text-[10px] md:text-xs font-black text-black block">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <div className={`px-3 py-1 md:px-6 md:py-2 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest border ${
                       appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                     }`}>
                       {appt.status === 'confirmed' ? 'Ok' : 'Pendente'}
                     </div>
                  </div>
                </div>
              )) : (
                <div className="p-10 md:p-24 text-center">
                  <p className="text-gray-300 font-black uppercase text-[10px]">Agenda vazia.</p>
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
