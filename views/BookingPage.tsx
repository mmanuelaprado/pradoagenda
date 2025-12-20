
import React, { useState, useMemo } from 'react';
import { Professional, Service, Appointment, BusinessConfig } from '../types.ts';
import { Icons } from '../constants.tsx';

interface BookingPageProps {
  professional: Professional;
  services: Service[];
  config: BusinessConfig;
  appointments: Appointment[];
  inactivations: any[];
  onComplete: (a: Omit<Appointment, 'id'>) => Promise<void>;
  onHome: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ professional, services, config, appointments, inactivations, onComplete, onHome }) => {
  const [step, setStep] = useState(1); // 1: Serviço, 2: Data, 3: Horário, 4: Confirmação
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', obs: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // Máscara de Telefone
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    setClientInfo({ ...clientInfo, phone: cleaned });
  };

  const handleConfirm = async () => {
    if (!clientInfo.name || clientInfo.phone.length < 10) return;
    setIsSubmitting(true);
    await onComplete({
      serviceId: selectedService?.id || '',
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
      status: 'pending'
    });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Cálculo de Horários Disponíveis
  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedService || !config.expediente) return [];
    
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    const dayConfig = config.expediente.find(d => d.day.toLowerCase() === dayName);
    
    if (!dayConfig || !dayConfig.active) return [];

    const isBlocked = inactivations.some(i => i.date === selectedDate);
    if (isBlocked) return [];

    const slots: string[] = [];
    dayConfig.shifts.forEach(shift => {
      if (!shift.active) return;
      let current = new Date(`${selectedDate}T${shift.start}`);
      const end = new Date(`${selectedDate}T${shift.end}`);
      
      while (current < end) {
        const timeStr = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const slotEnd = new Date(current.getTime() + (selectedService.duration * 60000));
        
        if (slotEnd <= end) {
          const isOccupied = appointments.some(appt => {
            const apptDate = new Date(appt.date);
            const apptEnd = new Date(apptDate.getTime() + (selectedService.duration * 60000));
            return (current < apptEnd && slotEnd > apptDate);
          });

          const now = new Date();
          const isPast = selectedDate === now.toISOString().split('T')[0] && current < now;

          if (!isOccupied && !isPast) slots.push(timeStr);
        }
        current = new Date(current.getTime() + (config.interval * 60000));
      }
    });
    return slots;
  }, [selectedDate, selectedService, config, appointments, inactivations]);

  // Calendário
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [viewDate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8">
          <Icons.Check className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-black uppercase mb-2">Agendado!</h1>
        <p className="text-gray-500 mb-10">Tudo certo, {clientInfo.name.split(' ')[0]}! Seu horário está reservado.</p>
        <button onClick={onHome} className="bg-black text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      {/* Header Público */}
      <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-bold">P</div>
          <div>
            <span className="font-black text-black uppercase tracking-tighter block leading-none">{professional.businessName}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Agendamento Online</span>
          </div>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center">
            <Icons.ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </button>
        )}
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full p-6">
        <div className="flex justify-center space-x-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 w-8 rounded-full ${step >= s ? 'bg-[#FF1493]' : 'bg-gray-100'}`}></div>
          ))}
        </div>

        {/* Passo 1: Serviço */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8">O que vamos fazer hoje?</h2>
            <div className="space-y-4">
              {services.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(2); }}
                  className="w-full p-6 bg-white rounded-[2rem] border border-gray-100 text-left hover:border-[#FF1493] transition-all shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-black text-black uppercase tracking-tight text-lg">{s.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.duration} min • R$ {s.price}</p>
                  </div>
                  <Icons.Plus className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Data */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8">Escolha o melhor dia</h2>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                 <span className="font-black uppercase tracking-widest text-xs text-black">
                   {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
                 <div className="flex space-x-2">
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 bg-gray-50 rounded-lg"><Icons.ArrowLeft /></button>
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 bg-gray-50 rounded-lg rotate-180"><Icons.ArrowLeft /></button>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center mb-4">
                 {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                   <span key={d} className="text-[9px] font-black text-gray-300 uppercase">{d}</span>
                 ))}
               </div>
               <div className="grid grid-cols-7 gap-2">
                 {calendarDays.map((day, i) => {
                   if (!day) return <div key={i} />;
                   const dStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   const isPast = new Date(dStr + 'T23:59:59') < new Date();
                   return (
                     <button 
                       key={i}
                       disabled={isPast}
                       onClick={() => { setSelectedDate(dStr); setStep(3); }}
                       className={`aspect-square rounded-2xl font-black text-sm flex items-center justify-center transition-all ${
                         selectedDate === dStr ? 'bg-[#FF1493] text-white shadow-lg' : isPast ? 'opacity-10 cursor-not-allowed' : 'bg-gray-50 text-black hover:bg-pink-50'
                       }`}
                     >
                       {day}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {/* Passo 3: Horário */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8">Qual o melhor horário?</h2>
            <div className="grid grid-cols-3 gap-3">
              {availableTimes.length > 0 ? availableTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => { setSelectedTime(time); setStep(4); }}
                  className={`py-5 rounded-2xl font-black text-sm border-2 transition-all ${
                    selectedTime === time ? 'bg-[#FF1493] border-[#FF1493] text-white' : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  {time}
                </button>
              )) : (
                <div className="col-span-full py-10 text-center text-gray-300 italic font-bold">Infelizmente não há horários livres neste dia.</div>
              )}
            </div>
          </div>
        )}

        {/* Passo 4: Dados */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8">Quase lá! Só seus dados...</h2>
            <div className="space-y-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome Completo</label>
                 <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold" 
                  placeholder="Seu nome"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                />
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                 <input 
                  type="tel" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold" 
                  placeholder="(00) 00000-0000"
                  value={clientInfo.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                />
               </div>
               
               <div className="p-6 bg-pink-50 rounded-[2rem] border border-pink-100">
                  <p className="text-[10px] font-black text-[#FF1493] uppercase mb-1">Resumo</p>
                  <p className="font-black text-black uppercase text-sm">{selectedService?.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{selectedDate.split('-').reverse().join('/')} às {selectedTime}h</p>
               </div>

               <button 
                onClick={handleConfirm}
                disabled={isSubmitting || !clientInfo.name || clientInfo.phone.length < 10}
                className="w-full bg-[#FF1493] text-white py-6 rounded-full font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-50"
               >
                 {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 text-center opacity-30">
        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Tecnologia Prado Agenda</span>
      </footer>
    </div>
  );
};

export default BookingPage;
