
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
  const [step, setStep] = useState(1); // 1: Serviço, 2: Data, 3: Horário, 4: Confirmação Final
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', obs: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

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

  // Cálculo de horários disponíveis considerando expediente e agenda ocupada
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
          // Verifica se o slot está livre na agenda do profissional
          const isOccupied = appointments.some(appt => {
            const apptDate = new Date(appt.date);
            // Assume-se que se não tivermos a duração do outro serviço, usamos a duração padrão do atual para checagem simples
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
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [viewDate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <Icons.Check className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-black uppercase mb-4 tracking-tighter">Agendado com Sucesso!</h1>
        <p className="text-gray-500 mb-12 max-w-xs font-medium">Tudo pronto, {clientInfo.name.split(' ')[0]}! O profissional foi notificado do seu agendamento.</p>
        
        <div className="bg-gray-50 w-full max-w-sm rounded-[2.5rem] p-8 border border-gray-100 mb-10 text-left">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Resumo do Horário</p>
          <div className="space-y-4">
             <div>
               <p className="text-xs font-black text-black uppercase">{selectedService?.name}</p>
               <p className="text-[10px] font-bold text-[#FF1493] uppercase">{selectedService?.duration} minutos</p>
             </div>
             <div>
               <p className="text-xs font-black text-black uppercase">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'long'})}</p>
               <p className="text-sm font-black text-black uppercase">às {selectedTime}h</p>
             </div>
          </div>
        </div>

        <button onClick={onHome} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-gray-800 transition-all active:scale-95">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      {/* Header Público Simplificado */}
      <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-pink-100">P</div>
          <div>
            <span className="font-black text-black uppercase tracking-tighter block leading-none">{professional.businessName}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Agendamento Online</span>
          </div>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center group">
            <Icons.ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar
          </button>
        )}
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full p-6 pb-24">
        {/* Barra de Progresso */}
        <div className="flex justify-center space-x-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#FF1493]' : 'bg-gray-100'}`}></div>
          ))}
        </div>

        {/* Passo 1: Escolha de Serviço */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Escolha o Serviço</h2>
            <p className="text-gray-400 text-xs font-medium mb-8">Selecione o que deseja realizar hoje.</p>
            <div className="space-y-4">
              {services.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(2); }}
                  className="w-full p-6 bg-white rounded-[2rem] border border-gray-100 text-left hover:border-[#FF1493] hover:shadow-xl transition-all shadow-sm flex items-center justify-between group"
                >
                  <div className="flex-grow">
                    <h3 className="font-black text-black uppercase tracking-tight text-lg group-hover:text-[#FF1493] transition-colors">{s.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.duration} min • R$ {s.price}</p>
                    {s.description && <p className="text-[11px] text-gray-400 mt-2 font-medium line-clamp-1">{s.description}</p>}
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                    <Icons.Plus className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Calendário */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Selecione o Dia</h2>
            <p className="text-gray-400 text-xs font-medium mb-8">Quando você gostaria de ser atendida?</p>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                 <span className="font-black uppercase tracking-[0.2em] text-[11px] text-black">
                   {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
                 <div className="flex space-x-2">
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-3 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors"><Icons.ArrowLeft className="w-4 h-4" /></button>
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-3 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors rotate-180"><Icons.ArrowLeft className="w-4 h-4" /></button>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center mb-6">
                 {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                   <span key={d} className="text-[10px] font-black text-gray-300 uppercase">{d}</span>
                 ))}
               </div>
               <div className="grid grid-cols-7 gap-3">
                 {calendarDays.map((day, i) => {
                   if (!day) return <div key={i} />;
                   const dStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   const isPast = new Date(dStr + 'T23:59:59') < new Date();
                   const isSelected = selectedDate === dStr;
                   
                   return (
                     <button 
                       key={i}
                       disabled={isPast}
                       onClick={() => { setSelectedDate(dStr); setStep(3); }}
                       className={`aspect-square rounded-[1.2rem] font-black text-sm flex items-center justify-center transition-all ${
                         isSelected ? 'bg-[#FF1493] text-white shadow-xl shadow-pink-100 scale-110' : 
                         isPast ? 'opacity-5 cursor-not-allowed' : 'bg-gray-50 text-black hover:bg-pink-50 hover:text-[#FF1493]'
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

        {/* Passo 3: Horários Disponíveis */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Qual o Horário?</h2>
            <p className="text-gray-400 text-xs font-medium mb-8">Horários livres para o dia selecionado.</p>
            <div className="grid grid-cols-3 gap-3">
              {availableTimes.length > 0 ? availableTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => { setSelectedTime(time); setStep(4); }}
                  className={`py-6 rounded-3xl font-black text-sm border-2 transition-all duration-300 ${
                    selectedTime === time ? 'bg-[#FF1493] border-[#FF1493] text-white shadow-xl shadow-pink-100' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200 hover:text-black'
                  }`}
                >
                  {time}
                </button>
              )) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dotted border-gray-50">
                  <Icons.Clock className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Infelizmente não há horários livres.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 4: Dados Finais */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Só Mais Um Passo</h2>
            <p className="text-gray-400 text-xs font-medium mb-8">Confirme seus dados para reservar o horário.</p>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Seu Nome Completo</label>
                 <input 
                  autoFocus
                  type="text" 
                  className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white outline-none font-bold transition-all" 
                  placeholder="Como devemos te chamar?"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">WhatsApp (com DDD)</label>
                 <input 
                  type="tel" 
                  className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white outline-none font-bold transition-all" 
                  placeholder="Ex: 11999999999"
                  value={clientInfo.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                />
               </div>
               
               <div className="p-6 bg-pink-50 rounded-[2.5rem] border border-pink-100 mt-4">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black text-[#FF1493] uppercase tracking-widest">Resumo do Agendamento</p>
                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-pink-300 uppercase hover:text-[#FF1493]">Alterar</button>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-black uppercase text-sm leading-tight">{selectedService?.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} às {selectedTime}h
                    </p>
                  </div>
               </div>

               <button 
                onClick={handleConfirm}
                disabled={isSubmitting || !clientInfo.name || clientInfo.phone.length < 10}
                className="w-full bg-[#FF1493] text-white py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-pink-200 hover:bg-pink-600 transition-all disabled:opacity-30 active:scale-95"
               >
                 {isSubmitting ? 'Confirmando...' : 'Reservar Horário Agora'}
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 text-center mt-auto">
        <div className="flex items-center justify-center space-x-2 opacity-20 hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 bg-[#FF1493] rounded flex items-center justify-center text-white font-bold text-[8px]">P</div>
          <span className="text-[9px] font-black tracking-[0.4em] text-gray-400 uppercase">Tecnologia Prado Agenda</span>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
