
import React from 'react';
import { Icons } from '../constants.tsx';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF1493] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <span className="text-white font-black text-lg md:text-xl">P</span>
          </div>
          <span className="text-lg md:text-2xl font-black tracking-tighter text-black uppercase">Prado Agenda</span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          <button onClick={onLogin} className="text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-[#FF1493] transition-colors">Entrar</button>
          <button onClick={onStart} className="bg-black text-white px-5 py-2 md:px-8 md:py-3 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Grátis</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center px-4 md:px-6 pt-10 md:pt-16 pb-20 md:pb-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/20 to-pink-100/30 -z-10"></div>
        
        <div className="max-w-4xl mb-12 md:mb-24 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 md:space-x-3 bg-white/80 backdrop-blur-sm text-[#FF1493] px-4 py-2 md:px-6 md:py-3 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 border border-pink-50 shadow-sm">
            <Icons.Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span>Futuro Digital do seu Salão</span>
          </div>
          
          <h1 className="text-4xl md:text-8xl font-black text-black leading-[1.1] mb-6 md:mb-8 tracking-tighter">
            Organize sua agenda <br className="hidden md:block"/> com <span className="text-[#FF1493]">perfeição.</span>
          </h1>
          
          <p className="text-base md:text-2xl text-gray-500 mb-8 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            A ferramenta de agendamento online inteligente que converte seguidores em clientes fiéis.
          </p>

          <button onClick={onStart} className="bg-[#FF1493] text-white px-10 py-5 md:px-16 md:py-7 rounded-full text-base md:text-lg font-black uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-200 active:scale-95">
            Começar Agora
          </button>
        </div>

        {/* MOCKUP CONTAINER */}
        <div className="relative w-full max-w-5xl mx-auto px-2 md:px-4 mt-4 md:mt-10">
          
          {/* Relógio Flutuante (Ajustado) */}
          <div className="absolute -top-8 left-0 md:-top-16 md:-left-12 z-30 animate-bounce-slow scale-50 md:scale-100">
            <div className="w-24 h-24 bg-[#FF1493] rounded-full border-[8px] border-white shadow-2xl flex items-center justify-center">
               <Icons.Clock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Browser Window Mockup (Versão Desktop simplificada) */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-[2.5rem] md:rounded-[5rem] shadow-2xl border border-white p-4 md:p-14 flex flex-col md:flex-row gap-6 md:gap-14 animate-fade-in-up overflow-hidden">
            <div className="flex-grow opacity-40 md:opacity-100">
              <div className="grid grid-cols-7 gap-1 md:gap-6 mb-4 md:mb-8 text-center mt-4">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <span key={d} className="text-[7px] md:text-[10px] font-black text-gray-300 uppercase">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-6">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square flex items-center justify-center rounded-lg md:rounded-[2rem] font-black text-[10px] md:text-xl ${
                      [10, 16, 20].includes(i+1) ? 'bg-[#FF1493] text-white shadow-lg' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:flex md:w-72 bg-white rounded-[4rem] shadow-2xl border border-gray-50 p-10 flex-col gap-4">
               <div className="h-1 bg-pink-100 w-12 mx-auto mb-4 rounded-full"></div>
              {['10:00', '14:00', '16:00', '18:00'].map(time => (
                <div key={time} className="py-6 bg-gray-50 rounded-[2rem] text-center font-black text-gray-400 text-xl border border-transparent hover:border-pink-200 transition-colors cursor-default">{time}</div>
              ))}
            </div>
          </div>

          {/* SMARTPHONE MOCKUP RECONSTRUÍDO (UI DE AGENDA REAL) */}
          <div className="absolute -right-2 md:-right-20 -bottom-16 md:bottom-10 w-44 md:w-80 z-40 transform rotate-[6deg] animate-float">
             <div className="bg-[#1A1A20] p-2.5 md:p-5 rounded-[2.5rem] md:rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] border-[4px] md:border-[8px] border-[#2A2A30] relative">
                {/* Speaker e Camera do Celular */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-5 md:h-7 bg-[#1A1A20] rounded-b-2xl z-50 flex items-center justify-center space-x-1">
                   <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                   <div className="w-6 md:w-10 h-1 bg-white/10 rounded-full"></div>
                </div>

                <div className="bg-white rounded-[1.8rem] md:rounded-[4rem] aspect-[9/19.5] overflow-hidden flex flex-col shadow-inner">
                  {/* Smartphone App Header */}
                  <div className="bg-[#FF1493] p-4 md:p-6 pt-8 md:pt-14 text-white">
                    <div className="flex items-center space-x-2 md:space-x-3 mb-4">
                       <div className="w-6 h-6 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-[#FF1493] font-black text-[8px] md:text-xs">PA</div>
                       <div>
                         <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest opacity-80">Seu Link</p>
                         <p className="text-[7px] md:text-[10px] font-bold">prado.com/b/espaco-beauty</p>
                       </div>
                    </div>
                  </div>

                  {/* Smartphone Content - Mini Agenda */}
                  <div className="p-3 md:p-6 space-y-3 md:space-y-6 flex-grow flex flex-col">
                    {/* Mini Calendar Grid */}
                    <div className="space-y-2 md:space-y-4">
                      <p className="text-[6px] md:text-[8px] font-black text-gray-300 uppercase tracking-widest">Novembro 2024</p>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 21 }).map((_, i) => (
                          <div key={i} className={`aspect-square rounded md:rounded-lg flex items-center justify-center text-[5px] md:text-[8px] font-black ${i === 15 ? 'bg-[#FF1493] text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Service Selection Card */}
                    <div className="bg-pink-50 p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-pink-100 animate-pulse">
                       <div className="flex justify-between items-center mb-1 md:mb-2">
                         <span className="text-[5px] md:text-[7px] font-black text-[#FF1493] uppercase">Selecionado</span>
                         <span className="text-[6px] md:text-[9px] font-black text-[#FF1493]">R$ 85</span>
                       </div>
                       <p className="text-[7px] md:text-[11px] font-black text-black uppercase">Design + Henna</p>
                    </div>

                    {/* Time Slots List */}
                    <div className="space-y-1.5 md:space-y-3">
                       <p className="text-[5px] md:text-[7px] font-black text-gray-300 uppercase tracking-widest">Horários Disponíveis</p>
                       <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">09:00</div>
                          <div className="py-2 md:py-3 bg-black text-white rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold shadow-lg">10:00</div>
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">11:00</div>
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">14:00</div>
                       </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                       <div className="w-full bg-[#FF1493] h-6 md:h-10 rounded-lg md:rounded-2xl shadow-lg flex items-center justify-center">
                          <span className="text-white text-[5px] md:text-[8px] font-black uppercase tracking-widest">Confirmar Agendamento</span>
                       </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-40 md:mt-60 w-full mb-16 md:mb-32 px-4">
           {[
             { title: "Simples", desc: "Agendamento autônomo sem troca de mensagens.", icon: <Icons.Smartphone /> },
             { title: "Elegante", desc: "Design que eleva sua autoridade profissional.", icon: <Icons.Sparkles /> },
             { title: "Link na Bio", desc: "Sua agenda aberta 24h para novas marcações.", icon: <Icons.Calendar /> }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-50 text-left hover:shadow-2xl transition-all hover:-translate-y-1">
               <div className="w-10 h-10 md:w-16 md:h-16 bg-pink-50 text-[#FF1493] rounded-xl md:rounded-[2rem] flex items-center justify-center mb-4 md:mb-8">
                 {item.icon}
               </div>
               <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-tight mb-2 md:mb-4">{item.title}</h3>
               <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </main>

      {/* Footer Rosa Pink Reduzido */}
      <footer className="py-6 md:py-10 text-center bg-[#FF1493] relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-[#FF1493] font-black text-[10px] md:text-xs">P</span>
            </div>
            <span className="text-[10px] md:text-xs font-black tracking-[0.3em] text-white uppercase">Prado Social</span>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 mb-4">
             <button className="text-white text-[8px] font-black uppercase tracking-widest hover:opacity-100 opacity-60">Instagram</button>
             <button className="text-white text-[8px] font-black uppercase tracking-widest hover:opacity-100 opacity-60">Ajuda</button>
             <span className="hidden md:block text-white/40 text-[8px] font-black uppercase tracking-[0.4em]">&copy; 2024 PRADO AGENDA.</span>
          </div>
          <p className="md:hidden text-white/40 text-[8px] font-black uppercase tracking-[0.4em] mb-2">&copy; 2024 PRADO AGENDA.</p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-15px) rotate(4deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
