
import React, { useState } from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

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
  
  const bookingUrl = `pradoagenda.com/b/${user?.slug || 'demo'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="dashboard" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-black text-black tracking-tighter uppercase mb-1">Olá, {user?.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 font-medium tracking-tight">O mercado da beleza não para. Sua agenda também não.</p>
          </div>
          
          <div className="flex items-center bg-white border border-gray-100 rounded-[2.5rem] p-3 pl-8 shadow-xl shadow-gray-200/50 group animate-fade-in">
            <div className="flex flex-col mr-8">
              <span className="text-[10px] text-gray-300 uppercase font-black tracking-widest mb-1">Seu Link Público</span>
              <span className="text-sm font-bold text-black truncate max-w-[200px]">{bookingUrl}</span>
            </div>
            <button 
              onClick={handleCopy} 
              className={`p-5 rounded-3xl transition-all flex items-center justify-center space-x-3 active:scale-95 ${
                copied ? 'bg-green-500 text-white' : 'bg-[#FF1493] text-white hover:bg-pink-700'
              }`}
            >
              <Icons.Copy />
              <span className="text-[10px] font-black uppercase tracking-widest pr-2">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </header>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Novo Agendamento', icon: Icons.Plus, color: 'bg-black', view: 'agenda' },
             { label: 'Criar Marketing', icon: Icons.Brain, color: 'bg-[#FF1493]', view: 'marketing' },
             { label: 'Gerir Equipe', icon: Icons.Users, color: 'bg-gray-800', view: 'professionals' },
             { label: 'Configurações', icon: Icons.Settings, color: 'bg-gray-400', view: 'settings' }
           ].map((act, i) => (
             <button 
              key={i} 
              onClick={() => navigate(act.view as View)}
              className={`${act.color} text-white p-8 rounded-[2.5rem] flex flex-col items-start justify-between shadow-2xl hover:-translate-y-2 transition-all group`}
             >
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <act.icon />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-left mt-6 leading-tight">{act.label}</span>
             </button>
           ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left Column: Metrics & Alerts */}
          <div className="xl:col-span-4 space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
               <h3 className="text-sm font-black text-black uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Icons.Finance /> Performance do Dia
               </h3>
               <div className="space-y-8">
                 <div>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Receita Prevista</p>
                   <p className="text-4xl font-black text-black tracking-tighter">
                     R$ {todayAppts.reduce((acc, curr) => acc + (services.find(s => s.id === curr.serviceId)?.price || 0), 0)}
                   </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                   <div>
                     <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Atendimentos</p>
                     <p className="text-2xl font-black text-black">{todayAppts.length}</p>
                   </div>
                   <div>
                     <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Pendentes</p>
                     <p className="text-2xl font-black text-[#FF1493]">{appointments.filter(a => a.status === 'pending').length}</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-black p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                 <Icons.Sparkles />
               </div>
               <h3 className="text-sm font-black uppercase tracking-widest mb-4">Dica do Especialista</h3>
               <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
                 "Você tem 3 horários vagos hoje à tarde. Que tal gerar uma promoção rápida usando IA no menu de Marketing?"
               </p>
               <button onClick={() => navigate('marketing')} className="text-[#FF1493] font-black text-[10px] uppercase tracking-widest hover:underline">Otimizar minha agenda agora →</button>
            </div>
          </div>

          {/* Right Column: Recent Appointments */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-black text-black tracking-tight uppercase">Próximas Visitas</h2>
                <button onClick={() => navigate('agenda')} className="text-[10px] font-black uppercase tracking-widest text-[#FF1493] hover:underline">Acessar Agenda Completa</button>
              </div>
              <div className="divide-y divide-gray-50">
                {appointments.length > 0 ? appointments.slice(0, 6).map((appt) => (
                  <div key={appt.id} className="p-10 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-all group">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-pink-50 rounded-[2rem] flex items-center justify-center text-[#FF1493] text-xl font-black group-hover:bg-[#FF1493] group-hover:text-white transition-all shadow-sm">
                        {appt.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-black text-lg tracking-tight uppercase">{appt.clientName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{appt.clientPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 mt-6 sm:mt-0">
                       <div className="flex flex-col items-end">
                         <span className="text-xs font-black text-black">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Horário</span>
                       </div>
                       <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                         appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                       }`}>
                         {appt.status}
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                      <Icons.Calendar />
                    </div>
                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Sua agenda está vazia por enquanto.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
