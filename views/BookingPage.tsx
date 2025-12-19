
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handleConfirm = () => {
    onComplete({
      serviceId: selectedService?.id || '',
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
      status: 'confirmed'
    });
    setIsSuccess(true);
  };

  // Lógica do Calendário Mensal
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

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    
    const d = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0,0,0,0);
    if (d < today) return [];

    const dayConfig = config.expediente.find(d => 
      dayOfWeek.toLowerCase().includes(d.day.toLowerCase())
    );

    if (!dayConfig || !dayConfig.active) return [];

    const slots: string[] = [];
    dayConfig.shifts.forEach(shift => {
      if (!shift.active) return;
      let current = new Date(`2000-01-01T${shift.start}`);
      const end = new Date(`2000-01-01T${shift.end}`);
      while (current < end) {
        slots.push(current.toTimeString().slice(0, 5));
        current = new Date(current.getTime() + config.interval * 60000);
      }
    });
    return slots;
  }, [selectedDate, config]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 max-w-md w-full animate-fade-in">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icons.Check />
          </div>
          <h1 className="text-3xl font-black text-black mb-4 tracking-tight uppercase">Reserva Confirmada!</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Tudo certo, {clientInfo.name.split(' ')[0]}! Seu horário para <span className="font-bold text-black">{selectedService?.name}</span> foi garantido.
          </p>
          <div className="bg-gray-50 p-8 rounded-[2.5rem] text-left mb-8 border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white rounded-2xl text-[#FF1493] shadow-sm"><Icons.Calendar /></div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Data e Hora</p>
                <p className="font-black text-black uppercase tracking-tight">{selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl text-[#FF1493] shadow-sm"><Icons.Building /></div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Local</p>
                <p className="font-black text-black uppercase tracking-tight">{professional.businessName}</p>
              </div>
            </div>
          </div>
          <button onClick={onHome} className="w-full bg-black text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl">Concluir</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="w-24 h-24 bg-black text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white">
             <span className="text-4xl font-black uppercase">{professional.businessName.charAt(0)}</span>
          </div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase">{professional.businessName}</h1>
          <div className="mt-2 inline-flex items-center space-x-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Agendamento Online Ativo</span>
          </div>
        </header>

        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Progress Sidebar */}
          <div className="md:w-1/3 bg-black p-10 text-white flex flex-col justify-between">
            <div>
              <p className="text-[#FF1493] font-black text-[10px] uppercase tracking-[0.3em] mb-10">Passo {step} de 3</p>
              <div className="space-y-8">
                {[
                  { n: 1, label: 'Serviço', active: step >= 1, done: step > 1 },
                  { n: 2, label: 'Data e Hora', active: step >= 2, done: step > 2 },
                  { n: 3, label: 'Seus Dados', active: step >= 3, done: step > 3 },
                ].map(s => (
                  <div key={s.n} className={`flex items-center space-x-4 transition-opacity ${s.active ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 ${s.done ? 'bg-[#FF1493] border-[#FF1493]' : s.active ? 'border-white' : 'border-white/20'}`}>
                      {s.done ? <Icons.Check /> : s.n}
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedService && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Resumo da Escolha</p>
                <p className="font-black text-lg uppercase tracking-tight text-[#FF1493]">{selectedService.name}</p>
                <p className="text-xs font-bold text-gray-400">{selectedService.duration} min • R$ {selectedService.price}</p>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-grow p-10">
            {step === 1 && (
              <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl font-black text-black tracking-tight uppercase">Escolha seu cuidado</h2>
                <div className="grid grid-cols-1 gap-4">
                  {services.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => { setSelectedService(s); setStep(2); }}
                      className="group flex items-center justify-between p-6 bg-gray-50 border-2 border-transparent hover:border-[#FF1493] hover:bg-white rounded-[2rem] transition-all text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black group-hover:bg-[#FF1493] group-hover:text-white transition-all shadow-sm">
                          <Icons.Scissors />
                        </div>
                        <div>
                          <h4 className="font-black text-black uppercase text-sm tracking-tight">{s.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.duration} min • R$ {s.price}</p>
                        </div>
                      </div>
                      <Icons.ArrowLeft className="rotate-180 text-gray-200 group-hover:text-[#FF1493]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-black tracking-tight uppercase">Data e Hora</h2>
                  <button onClick={() => setStep(1)} className="text-gray-300 hover:text-black transition-colors"><Icons.ArrowLeft /></button>
                </div>
                
                {/* Full Calendar */}
                <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-black uppercase text-sm tracking-tighter capitalize">{monthName} {currentYear}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 bg-white rounded-xl shadow-sm"><Icons.ArrowLeft /></button>
                      <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 bg-white rounded-xl shadow-sm rotate-180"><Icons.ArrowLeft /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                      <span key={d} className="text-[10px] font-black text-gray-300">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      const d = day ? new Date(currentYear, currentMonth, day) : null;
                      const isPast = d ? d < new Date(new Date().setHours(0,0,0,0)) : true;
                      return (
                        <div key={idx} className="aspect-square">
                          {day && (
                            <button 
                              disabled={isPast}
                              onClick={() => { setSelectedDate(d!.toISOString().split('T')[0]); setSelectedTime(''); }}
                              className={`w-full h-full rounded-xl font-black text-xs transition-all ${
                                selectedDate === d!.toISOString().split('T')[0] ? 'bg-[#FF1493] text-white shadow-lg' : isPast ? 'opacity-10 cursor-not-allowed' : 'bg-white hover:bg-pink-50 text-black'
                              }`}
                            >
                              {day}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="animate-fade-in">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Horários disponíveis</p>
                    {availableTimes.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimes.map(t => (
                          <button 
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-3 rounded-xl font-black text-[10px] transition-all border-2 ${selectedTime === t ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-300 font-bold text-xs uppercase italic">Sem horários para este dia.</p>
                    )}
                  </div>
                )}

                <button 
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="w-full bg-[#FF1493] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pink-100 disabled:opacity-20 mt-6"
                >
                  Confirmar Horário
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-black tracking-tight uppercase">Seus Dados</h2>
                  <button onClick={() => setStep(2)} className="text-gray-300 hover:text-black transition-colors"><Icons.ArrowLeft /></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                    <input type="text" className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF1493] outline-none font-bold" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
                    <input type="tel" className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF1493] outline-none font-bold" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} />
                  </div>
                </div>

                <div className="p-8 bg-black text-white rounded-[2.5rem] shadow-xl">
                  <h4 className="text-[10px] font-black text-[#FF1493] uppercase tracking-widest mb-4">Resumo da Reserva</h4>
                  <p className="text-xl font-black uppercase tracking-tight">{selectedService?.name}</p>
                  <p className="text-sm font-bold text-gray-400 mb-6">🗓️ {selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
                  <p className="text-3xl font-black text-[#FF1493]">R$ {selectedService?.price}</p>
                </div>

                <button 
                  disabled={!clientInfo.name || !clientInfo.phone}
                  onClick={handleConfirm}
                  className="w-full bg-[#FF1493] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 disabled:opacity-20"
                >
                  Finalizar Agendamento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
