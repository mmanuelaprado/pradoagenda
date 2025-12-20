
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
  const [step, setStep] = useState(1); // 1: Serviço, 2: Data, 3: Horário, 4: Dados
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', obs: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handleConfirm = async () => {
    if (!clientInfo.name.trim() || clientInfo.phone.length < 10) return;
    
    await onComplete({
      serviceId: selectedService?.id || '',
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
      status: 'pending'
    });
    setIsSuccess(true);
  };

  // Lógica de Calendário
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long' });
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentYear, currentMonth]);

  // Lógica de Horários Disponíveis Real
  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedService || !config.expediente) return [];
    
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    
    // 1. Verificar se o dia está aberto no expediente
    const dayConfig = config.expediente.find(d => d.day.toLowerCase() === dayName);
    if (!dayConfig || !dayConfig.active) return [];

    // 2. Verificar se a data está bloqueada (inativações)
    const isBlocked = inactivations.some(inact => inact.date === selectedDate);
    if (isBlocked) return [];

    const slots: string[] = [];
    
    dayConfig.shifts.forEach(shift => {
      if (!shift.active) return;
      
      let current = new Date(`${selectedDate}T${shift.start}`);
      const end = new Date(`${selectedDate}T${shift.end}`);
      
      while (current < end) {
        const timeString = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const slotEnd = new Date(current.getTime() + (selectedService.duration * 60000));

        // Regra: O serviço deve caber dentro do turno
        if (slotEnd > end) break;

        // Regra: Não pode sobrepor agendamentos existentes
        const isConflict = appointments.some(appt => {
          const apptDate = new Date(appt.date);
          if (apptDate.toISOString().split('T')[0] !== selectedDate) return false;
          
          const apptService = services.find(s => s.id === appt.serviceId);
          const apptDuration = apptService?.duration || 30;
          const apptEnd = new Date(apptDate.getTime() + (apptDuration * 60000));
          
          return (current < apptEnd && slotEnd > apptDate);
        });

        // Regra: Se for hoje, não mostrar horários que já passaram
        const now = new Date();
        const isToday = selectedDate === now.toISOString().split('T')[0];
        const isPast = isToday && current < now;

        if (!isConflict && !isPast) {
          slots.push(timeString);
        }

        // Avança conforme o intervalo configurado na empresa (ex: a cada 30 min)
        current = new Date(current.getTime() + (config.interval * 60000));
      }
    });

    return slots;
  }, [selectedDate, selectedService, config, appointments, inactivations, services]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Icons.Check className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">Confirmado!</h1>
        <p className="text-gray-500 mb-10 font-medium">Seu horário foi reservado com sucesso.</p>
        
        <div className="w-full max-w-sm bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 text-left mb-10">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumo do Agendamento</p>
          <div className="space-y-4">
             <div>
               <p className="text-xs font-black text-black uppercase">{selectedService?.name}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase">{selectedService?.duration} min</p>
             </div>
             <div>
               <p className="text-xs font-black text-black uppercase">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'long'})}</p>
               <p className="text-[10px] font-bold text-[#FF1493] uppercase">às {selectedTime}h</p>
             </div>
          </div>
        </div>
        
        <button onClick={onHome} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-xl">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <header className="p-5 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">P</div>
          <span className="font-black text-black uppercase tracking-tighter text-base">{professional.businessName}</span>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center">
            <Icons.ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </button>
        )}
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full p-4 md:p-10">
        {/* Progress Bar */}
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 w-10 rounded-full transition-all ${step >= s ? 'bg-[#FF1493]' : 'bg-gray-100'}`}></div>
          ))}
        </div>

        {/* Passo 1: Serviço */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8 text-center">Qual serviço deseja?</h2>
            <div className="grid grid-cols-1 gap-4">
              {services.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(2); }}
                  className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-[#FF1493] text-left transition-all shadow-sm flex items-center justify-between group"
                >
                  <div>
                    <h3 className="font-black text-black uppercase tracking-tight text-lg">{s.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.duration} min • R$ {s.price}</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-50 text-[#FF1493] rounded-full flex items-center justify-center group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                    <Icons.Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Data */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8 text-center">Para quando?</h2>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                 <span className="font-black uppercase tracking-widest text-xs text-black">{monthName} {currentYear}</span>
                 <div className="flex space-x-2">
                   <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-gray-50 rounded-lg"><Icons.ArrowLeft /></button>
                   <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-gray-50 rounded-lg rotate-180"><Icons.ArrowLeft /></button>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center mb-4">
                 {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                   <span key={d} className="text-[10px] font-black text-gray-200 uppercase tracking-widest">{d}</span>
                 ))}
               </div>
               <div className="grid grid-cols-7 gap-2">
                 {calendarDays.map((day, i) => {
                   if (!day) return <div key={i} />;
                   const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   const isSelected = selectedDate === dateStr;
                   const isPast = new Date(dateStr + 'T23:59:59') < new Date();
                   
                   return (
                     <button 
                       key={i}
                       disabled={isPast}
                       onClick={() => { setSelectedDate(dateStr); setStep(3); }}
                       className={`aspect-square flex items-center justify-center rounded-2xl font-black text-sm transition-all ${
                         isSelected 
                           ? 'bg-[#FF1493] text-white shadow-lg' 
                           : isPast ? 'opacity-10 cursor-not-allowed' : 'bg-gray-50 text-black hover:bg-pink-50 hover:text-[#FF1493]'
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
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8 text-center">Qual o melhor horário?</h2>
            <div className="grid grid-cols-3 gap-3">
              {availableTimes.length > 0 ? availableTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => { setSelectedTime(time); setStep(4); }}
                  className={`py-5 rounded-2xl font-black text-sm transition-all border-2 ${
                    selectedTime === time 
                      ? 'bg-[#FF1493] border-[#FF1493] text-white' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'
                  }`}
                >
                  {time}
                </button>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-300 font-bold italic">Nenhum horário disponível para este dia.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 4: Dados */}
        {step === 4 && (
          <div className="animate-fade-in-up max-w-md mx-auto">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8 text-center">Para finalizar...</h2>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Seu Nome Completo</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none font-bold text-black border border-transparent focus:border-pink-200" 
                  placeholder="Como devemos te chamar?"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp (com DDD)</label>
                <input 
                  type="tel" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none font-bold text-black border border-transparent focus:border-pink-200" 
                  placeholder="71900000000"
                  value={clientInfo.phone}
                  onChange={e => setClientInfo({...clientInfo, phone: e.target.value.replace(/\D/g, '')})}
                />
              </div>
              
              <div className="bg-pink-50/50 p-6 rounded-[2rem] border border-pink-100">
                <p className="text-[10px] font-black text-[#FF1493] uppercase tracking-widest mb-2">Resumo</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-black text-black uppercase">{selectedService?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{selectedDate.split('-').reverse().join('/')} às {selectedTime}h</p>
                  </div>
                  <p className="text-lg font-black text-black">R$ {selectedService?.price}</p>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={!clientInfo.name || clientInfo.phone.length < 10}
                className="w-full bg-[#FF1493] text-white py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:bg-pink-700 transition-all disabled:opacity-30"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 bg-[#FF1493] rounded flex items-center justify-center text-white font-bold text-[8px]">P</div>
          <span className="text-[10px] font-black tracking-widest text-gray-300 uppercase">Tecnologia Prado Agenda</span>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
