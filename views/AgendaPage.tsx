
import React, { useState } from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';

interface AgendaPageProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onLogout: () => void;
  navigate: (v: View) => void;
  onAddManualAppointment: (a: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  inactivations?: any[];
}

const AgendaPage: React.FC<AgendaPageProps> = ({ 
  user, appointments, services, onLogout, navigate, onAddManualAppointment, onUpdateStatus, inactivations = [] 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ clientName: '', clientPhone: '', serviceId: '', time: '09:00' });

  const dailyAppointments = appointments.filter(a => 
    new Date(a.date).toISOString().split('T')[0] === selectedDate
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isBlockedDay = inactivations.find(inv => inv.date === selectedDate);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long' });
  
  const calendarDays = [];
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddManualAppointment({
      serviceId: manualForm.serviceId,
      clientName: manualForm.clientName,
      clientPhone: manualForm.clientPhone,
      date: new Date(`${selectedDate}T${manualForm.time}`).toISOString(),
      status: 'confirmed'
    });
    setShowManualModal(false);
    setManualForm({ clientName: '', clientPhone: '', serviceId: '', time: '09:00' });
  };

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10 animate-fade-in">
      <button 
        onClick={() => navigate('dashboard')}
        className="flex items-center text-gray-400 hover:text-[#FF1493] mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
      >
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">
          <Icons.ArrowLeft />
        </span>
        Voltar ao Painel
      </button>

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase">Minha Agenda</h1>
          <p className="text-gray-500 font-medium tracking-tight">Gestão profissional do seu tempo e faturamento.</p>
        </div>
        <button 
          onClick={() => setShowManualModal(true)}
          className="bg-[#FF1493] text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center space-x-2"
        >
          <Icons.Plus />
          <span>Agendamento Manual</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-gray-50 sticky top-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-black uppercase tracking-tight capitalize">
                {monthName} <span className="text-gray-200 ml-1">{currentYear}</span>
              </h2>
              <div className="flex space-x-2">
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 bg-gray-50 rounded-xl hover:bg-white transition-all"><Icons.ArrowLeft /></button>
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 bg-gray-50 rounded-xl hover:bg-white transition-all rotate-180"><Icons.ArrowLeft /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-6">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                <span key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarDays.map((day, idx) => {
                const dayDate = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const isSelected = dayDate === selectedDate;
                const apptOnDay = dayDate && appointments.some(a => a.status !== 'cancelled' && new Date(a.date).toISOString().split('T')[0] === dayDate);
                const isDayBlocked = dayDate && inactivations.some(inv => inv.date === dayDate);
                
                return (
                  <div key={idx} className="aspect-square">
                    {day ? (
                      <button
                        onClick={() => setSelectedDate(dayDate!)}
                        className={`w-full h-full rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center relative ${
                          isSelected ? 'bg-[#FF1493] text-white shadow-xl shadow-pink-200 scale-110 z-10' : 
                          isDayBlocked ? 'bg-gray-100 text-gray-300' : 'text-black hover:bg-pink-50'
                        }`}
                      >
                        {day}
                        {apptOnDay && !isSelected && <span className="absolute bottom-2 w-1.5 h-1.5 bg-[#FF1493] rounded-full"></span>}
                        {isDayBlocked && !isSelected && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gray-300 rounded-full"></span>}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {isBlockedDay && (
            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2.5rem] mb-6 animate-pulse">
               <div className="flex items-center space-x-3 text-red-600">
                  <Icons.Ban className="w-5 h-5" />
                  <span className="font-black uppercase tracking-widest text-xs">DIA BLOQUEADO: {isBlockedDay.description}</span>
               </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6 px-4">
             <div className="w-2 h-2 rounded-full bg-[#FF1493]"></div>
             <span className="font-black text-black uppercase tracking-widest text-xs">Visitas para {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
          </div>
          
          {dailyAppointments.length > 0 ? dailyAppointments.map((appt) => {
            const service = services.find(s => s.id === appt.serviceId);
            return (
              <div key={appt.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col items-stretch hover:shadow-xl transition-all group">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                  <div className="flex items-center space-x-6 w-full md:w-auto">
                    <div className="bg-gray-50 px-6 py-4 rounded-3xl text-center min-w-[100px] group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                      <p className="text-2xl font-black leading-none">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">Horário</p>
                    </div>
                    <div>
                      <h4 className="font-black text-black text-xl tracking-tight uppercase">{appt.clientName}</h4>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{service?.name || 'Agendamento Manual'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-sm font-bold text-black">{appt.clientPhone}</p>
                    </div>
                    <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                      appt.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                      {appt.status}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end gap-3">
                  <button 
                    onClick={() => onUpdateStatus(appt.id, 'confirmed')}
                    className="flex-1 md:flex-none px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                  >
                    Confirmar
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                    className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white p-24 rounded-[4rem] text-center border-4 border-dotted border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200"><Icons.Calendar /></div>
              <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Sem clientes agendados para este dia.</p>
            </div>
          )}
        </div>
      </div>

      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl animate-fade-in-up">
             <div className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black text-black uppercase tracking-tight">Novo Registro</h2>
               <button onClick={() => setShowManualModal(false)} className="text-gray-300 hover:text-black font-bold text-xl">✕</button>
             </div>
             {isBlockedDay && <p className="mb-6 bg-red-50 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase">Atenção: Este dia está marcado como inativo ({isBlockedDay.description})</p>}
             <form onSubmit={handleManualSubmit} className="space-y-6">
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Cliente</label>
                 <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold text-black" value={manualForm.clientName} onChange={e => setManualForm({...manualForm, clientName: e.target.value})} />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">WhatsApp</label>
                 <input required type="tel" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold text-black" value={manualForm.clientPhone} onChange={e => setManualForm({...manualForm, clientPhone: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Serviço</label>
                   <select required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold text-black" value={manualForm.serviceId} onChange={e => setManualForm({...manualForm, serviceId: e.target.value})}>
                     <option value="">Selecione...</option>
                     {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Hora</label>
                   <input required type="time" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold text-black" value={manualForm.time} onChange={e => setManualForm({...manualForm, time: e.target.value})} />
                 </div>
               </div>
               <button className="w-full bg-[#FF1493] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pink-100 mt-4 active:scale-95 transition-all">Confirmar no Sistema</button>
             </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AgendaPage;
