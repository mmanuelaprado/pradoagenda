
import React, { useState, useMemo } from 'react';
import { Professional, Service, Appointment, BusinessConfig } from '../types.ts';
import { Icons } from '../constants.tsx';

interface BookingPageProps {
  professional: Professional;
  services: Service[];
  config: BusinessConfig;
  onComplete: (a: Omit<Appointment, 'id'>) => void;
  onHome: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ professional, services, config, onComplete, onHome }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handleConfirm = () => {
    if (!clientInfo.name.trim()) {
      alert("Por favor, informe seu nome.");
      return;
    }
    if (clientInfo.phone.length < 10) {
      alert("Por favor, informe um WhatsApp válido com DDD.");
      return;
    }

    onComplete({
      serviceId: selectedService?.id || '',
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
      status: 'confirmed'
    });
    setIsSuccess(true);
  };

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

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  }, [selectedDate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 text-center animate-fade-in">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-pink-50 text-[#FF1493] rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce-slow">
            <Icons.Check className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-black mb-2 uppercase tracking-tighter">Tudo certo!</h1>
          <p className="text-gray-500 mb-6 md:mb-10 max-w-sm text-sm md:text-base font-medium">
            Seu agendamento para <b>{selectedService?.name}</b> foi realizado.
          </p>
          <div className="w-full max-w-md bg-gray-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-gray-100 text-left mb-8 md:mb-10">
            <div className="space-y-3 md:space-y-4 text-sm md:text-base">
              <div className="flex justify-between border-b border-gray-100 pb-2 md:pb-4">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Data</span>
                <span className="font-bold text-black">{selectedDate.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 md:pb-4">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Horário</span>
                <span className="font-bold text-black">{selectedTime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Profissional</span>
                <span className="font-bold text-black">{professional.businessName}</span>
              </div>
            </div>
          </div>
          <button onClick={onHome} className="bg-black text-white px-10 py-4 md:px-12 md:py-5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all">Concluir</button>
        </div>
        <footer className="p-2 md:p-3 text-center bg-[#FF1493]">
           <div className="flex items-center justify-center space-x-2">
             <div className="w-4 h-4 bg-white rounded flex items-center justify-center text-[#FF1493] font-bold text-[7px]">P</div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white">Prado Agenda</span>
           </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <header className="p-4 md:p-6 bg-white border-b border-gray-50 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF1493] rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-pink-100">P</div>
          <span className="font-black text-black uppercase tracking-tighter text-sm md:text-base">{professional.businessName}</span>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-black font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center">
            <Icons.ArrowLeft className="mr-1 md:mr-2 w-4 h-4" /> Voltar
          </button>
        )}
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full p-4 md:p-6 py-6 md:py-12">
        <div className="mb-6 md:mb-12 text-center">
          <div className="flex justify-center space-x-1.5 md:space-x-2 mb-3 md:mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 w-6 md:h-1.5 md:w-8 rounded-full transition-all ${step >= s ? 'bg-[#FF1493]' : 'bg-gray-100'}`}></div>
            ))}
          </div>
          <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tight">
            {step === 1 && "Escolha o Serviço"}
            {step === 2 && "Data e Horário"}
            {step === 3 && "Finalizar"}
          </h2>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 animate-fade-in">
            {services.map(s => (
              <button 
                key={s.id}
                onClick={() => { setSelectedService(s); setStep(2); }}
                className="p-5 md:p-8 bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 hover:border-[#FF1493] text-left transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-pink-50 text-[#FF1493] rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-[#FF1493] group-hover:text-white transition-all">
                    <Icons.Scissors className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-lg md:text-2xl font-black text-[#FF1493]">R$ {s.price}</span>
                </div>
                <h3 className="font-black text-black uppercase tracking-tight text-base md:text-xl">{s.name}</h3>
                <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.duration} MINUTOS</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-fade-in">
            <div className="lg:col-span-7 bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-pink-50">
              <div className="flex items-center justify-between mb-6 md:mb-10">
                <span className="font-black uppercase tracking-widest text-[9px] md:text-xs text-gray-300">{monthName} {currentYear}</span>
                <div className="flex space-x-1">
                  <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 hover:bg-gray-50 rounded-lg"><Icons.ArrowLeft className="w-4 h-4" /></button>
                  <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 hover:bg-gray-50 rounded-lg rotate-180"><Icons.ArrowLeft className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <span key={d} className="text-[8px] md:text-[10px] font-black text-gray-200 uppercase tracking-widest">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5 md:gap-4">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isPast = new Date(dateStr + 'T23:59:59') < new Date();
                  
                  return (
                    <button 
                      key={i}
                      disabled={isPast}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square flex items-center justify-center rounded-xl md:rounded-3xl font-black text-xs md:text-xl transition-all ${
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

            <div className="lg:col-span-5 bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100">
              <h3 className="text-gray-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-center mb-6 md:mb-10">Horário</h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-4">
                {selectedDate ? availableTimes.map(time => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 md:py-5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-lg transition-all border-2 ${
                      selectedTime === time 
                        ? 'bg-[#FF1493] border-[#FF1493] text-white shadow-lg' 
                        : 'bg-gray-50 border-transparent text-gray-400 hover:bg-pink-50'
                    }`}
                  >
                    {time}
                  </button>
                )) : (
                  <p className="col-span-full text-center py-10 md:py-20 text-gray-300 italic text-xs font-medium">Selecione o dia primeiro.</p>
                )}
              </div>
              {selectedTime && (
                <button onClick={() => setStep(3)} className="w-full mt-6 md:mt-10 bg-black text-white py-4 md:py-6 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl animate-fade-in">
                  Próximo Passo
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto animate-fade-in space-y-4 md:space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100 space-y-4 md:space-y-6">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Seu Nome</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full px-5 py-3.5 md:px-6 md:py-5 rounded-xl md:rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#FF1493] outline-none font-bold text-sm md:text-base text-black transition-all" 
                  placeholder="Nome e Sobrenome"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp</label>
                <input 
                  type="tel" 
                  className="w-full px-5 py-3.5 md:px-6 md:py-5 rounded-xl md:rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#FF1493] outline-none font-bold text-sm md:text-base text-black transition-all" 
                  placeholder="(00) 00000-0000"
                  value={clientInfo.phone}
                  onChange={e => setClientInfo({...clientInfo, phone: e.target.value.replace(/\D/g, '')})}
                />
              </div>
              
              <div className="bg-pink-50/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border border-pink-100">
                <p className="text-[9px] font-black text-[#FF1493] uppercase tracking-widest mb-2 md:mb-4">Resumo</p>
                <p className="text-lg md:text-xl font-black text-black uppercase tracking-tighter">{selectedService?.name}</p>
                <p className="text-xs font-bold text-gray-500">{selectedDate.split('-').reverse().join('/')} às {selectedTime}h</p>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full bg-[#FF1493] text-white py-4 md:py-6 rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl hover:bg-pink-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirmar Agora</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-2 md:p-3 text-center bg-[#FF1493]">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-white rounded flex items-center justify-center text-[#FF1493] font-bold text-[7px]">P</div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Prado Agenda</span>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
