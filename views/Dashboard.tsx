
import React, { useState } from 'react';
import { Professional, Appointment, Service, View, BusinessConfig } from '../types.ts';
import { Icons } from '../constants.tsx';
import { db } from '../services/db.ts';

interface DashboardProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
  config: BusinessConfig | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, appointments = [], services = [], onUpdateStatus, navigate, config }) => {
  const [copyStatus, setCopyStatus] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = (appointments || []).filter(a => a.date && a.date.startsWith(todayStr));
  
  const brandColor = config?.themeColor || '#FF1493';

  // Usando o domínio oficial conforme solicitado pelo usuário
  const baseDomain = "pradoagenda.vercel.app";
  const publicLink = user?.slug ? `https://${baseDomain}/${user.slug}` : '';

  const handleCopy = () => {
    if (!publicLink) { navigate('company'); return; }
    navigator.clipboard.writeText(publicLink);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá ${name}, aqui é do ${user?.businessName}. Gostaria de confirmar seu agendamento.`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const todayRevenue = todayAppts
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((acc, curr) => {
      const s = (services || []).find(serv => serv.id === curr.serviceId);
      return acc + (s?.price || 0);
    }, 0);

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-black tracking-tighter uppercase mb-1">Olá, {user?.name?.split(' ')[0] || 'Profissional'}!</h1>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium tracking-tight">Gestão inteligente para sua beleza.</p>
        </div>
        
        {user?.slug ? (
          <div 
            className="bg-white px-5 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-md w-full md:w-auto transition-colors"
            style={{ borderColor: brandColor + '40' }}
          >
             <div className="flex-grow min-w-0">
               <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Seu Link Público</p>
               <p className="text-[11px] font-bold text-black truncate">{baseDomain}/{user.slug}</p>
             </div>
             <div className="flex gap-2">
               <button onClick={handleCopy} className={`p-2 rounded-xl transition-all ${copyStatus ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                 {copyStatus ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
               </button>
               <button 
                onClick={() => window.open(publicLink, '_blank')} 
                className="p-2 rounded-xl text-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: brandColor }}
               >
                 <Icons.Eye className="w-3.5 h-3.5" />
               </button>
             </div>
          </div>
        ) : (
          <button onClick={() => navigate('company')} className="bg-pink-50 border border-pink-200 px-6 py-4 rounded-3xl flex items-center gap-4 animate-pulse">
            <div className="text-left"><p className="text-[11px] font-bold text-black uppercase">Configurar link público</p></div>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2"><Icons.Chart className="w-4 h-4" /> Caixa de Hoje</h3>
             <div className="grid grid-cols-2 gap-4">
               <div><p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Receita</p><p className="text-xl font-black text-black">R$ {todayRevenue.toLocaleString('pt-BR')}</p></div>
               <div><p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Atendimentos</p><p className="text-xl font-black text-black">{todayAppts.length}</p></div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm md:text-xl font-black text-black tracking-tight uppercase">Próximos Horários</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments
                .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
                .slice(0, 10)
                .map((appt) => (
                <div key={appt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black uppercase"
                      style={{ backgroundColor: brandColor }}
                    >
                      {appt.clientName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-black text-[13px] uppercase tracking-tight">{appt.clientName}</h4>
                      <p className="text-[9px] font-black uppercase" style={{ color: brandColor }}>{(services || []).find(s => s.id === appt.serviceId)?.name || 'Serviço'}</p>
                      <p className="text-[9px] font-black text-gray-300 uppercase">{appt.date ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => openWhatsApp(appt.clientPhone, appt.clientName)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><Icons.WhatsApp className="w-4 h-4" /></button>
                    {appt.status === 'pending' && (
                      <button onClick={() => onUpdateStatus(appt.id, 'confirmed')} className="px-4 py-2 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md" style={{ backgroundColor: brandColor }}>Confirmar</button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => onUpdateStatus(appt.id, 'completed')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-md">Concluir</button>
                    )}
                    <button onClick={() => onUpdateStatus(appt.id, 'cancelled')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Icons.Trash className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length === 0 && <div className="p-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest">Nenhum agendamento pendente</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
