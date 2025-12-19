
import React, { useState } from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface AgendaPageProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onLogout: () => void;
  navigate: (v: View) => void;
  onAddManualAppointment: (a: Omit<Appointment, 'id'>) => void;
}

const AgendaPage: React.FC<AgendaPageProps & { onAddManualAppointment: (a: Omit<Appointment, 'id'>) => void }> = ({ 
  user, appointments, services, onLogout, navigate, onAddManualAppointment 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ clientName: '', clientPhone: '', serviceId: '', time: '09:00' });

  const dailyAppointments = appointments.filter(a => 
    new Date(a.date).toISOString().split('T')[0] === selectedDate
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long' });
  
  const calendarDays = [];
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="agenda" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight uppercase">Sua Agenda</h1>
            <p className="text-gray-500 font-medium tracking-tight">O controle total do seu tempo em um só lugar.</p>
          </div>
          <button 
            onClick={() => setShowManualModal(true)}
            className="bg-[#FF1493] text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center space-x-2"
          >
            <Icons.Plus />
            <span>Novo Agendamento Manual</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Esquerdo: Calendário */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 sticky top-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-black uppercase tracking-tight capitalize">
                  {monthName} <span className="text-gray-300 ml-1">{currentYear}</span>
                </h2>
                <div className="flex space-x-2">
                  <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Icons.ArrowLeft /></button>
                  <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors rotate-180"><Icons.ArrowLeft /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-6">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <span key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const dayDate = day ? new Date(currentYear, currentMonth, day).toISOString().split('T')[0] : null;
                  const isSelected = dayDate === selectedDate;
                  const apptOnDay = dayDate && appointments.some(a => new Date(a.date).toISOString().split('T')[0] === dayDate);
                  
                  return (
                    <div key={idx} className="aspect-square flex items-center justify-center">
                      {day ? (
                        <button
                          onClick={() => setSelectedDate(dayDate!)}
                          className={`w-full h-full rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center relative ${
                            isSelected ? 'bg-[#FF1493] text-white shadow-xl shadow-pink-200 scale-110 z-10' : 'text-black hover:bg-pink-50'
                          }`}
                        >
                          {day}
                          {apptOnDay && !isSelected && <span className="absolute bottom-2 w-1.5 h-1.5 bg-[#FF1493] rounded-full"></span>}
                        </button>
                      ) : <div className="w-full h-full"></div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF1493]"><Icons.Calendar /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Dia Ativo</p>
                    <p className="font-black text-black uppercase text-sm">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Horários */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {dailyAppointments.length > 0 ? dailyAppointments.map((appt) => {
              const service = services.find(s => s.id === appt.serviceId);
              return (
                <div key={appt.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between hover:shadow-xl transition-all group">
                  <div className="flex items-center space-x-6 w-full sm:w-auto">
                    <div className="text-center min-w-[80px]">
                      <p className="text-2xl font-black text-black leading-none">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Check-in</p>
                    </div>
                    <div className="h-12 w-px bg-gray-100 hidden sm:block"></div>
                    <div>
                      <h4 className="font-black text-black text-lg tracking-tight uppercase group-hover:text-[#FF1493] transition-colors">{appt.clientName}</h4>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Serviço: {service?.name || 'Manual'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-6 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                      {appt.status}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-gray-100 animate-fade-in">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200"><Icons.Calendar /></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Agenda livre para este dia. ✨</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Manual */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl animate-fade-in-up">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-black uppercase tracking-tight">Manual Booking</h2>
                 <button onClick={() => setShowManualModal(false)} className="text-gray-300 hover:text-black transition-colors font-bold text-xl">✕</button>
               </div>
               <form onSubmit={handleManualSubmit} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Nome do Cliente</label>
                   <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" value={manualForm.clientName} onChange={e => setManualForm({...manualForm, clientName: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">WhatsApp</label>
                   <input required type="tel" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" value={manualForm.clientPhone} onChange={e => setManualForm({...manualForm, clientPhone: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Serviço</label>
                     <select required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" value={manualForm.serviceId} onChange={e => setManualForm({...manualForm, serviceId: e.target.value})}>
                       <option value="">Selecione...</option>
                       {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Horário</label>
                     <input required type="time" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" value={manualForm.time} onChange={e => setManualForm({...manualForm, time: e.target.value})} />
                   </div>
                 </div>
                 <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl mt-4">Confirmar no Sistema</button>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgendaPage;
