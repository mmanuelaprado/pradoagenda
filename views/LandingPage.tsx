
import React from 'react';
import { Icons } from '../constants.tsx';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-black uppercase">Prado Agenda</span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={onLogin} className="text-black font-bold text-sm uppercase tracking-widest hover:text-[#FF1493] transition-colors">Entrar</button>
          <button onClick={onStart} className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Criar Conta</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-12 pb-20 text-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-50 rounded-full blur-3xl -z-10 opacity-60 -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-pink-50 text-[#FF1493] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Icons.Sparkles />
            <span>Exclusivo para Profissionais da Beleza</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-black leading-none mb-6 tracking-tighter">
            Ainda agenda clientes pelo <span className="text-[#FF1493] underline decoration-4 underline-offset-8">WhatsApp?</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
            Chega de mensagens fora de hora, horários confusos e clientes que não aparecem. 
            Tenha um sistema de agendamento online feito para você.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
            <button onClick={onStart} className="w-full sm:w-auto bg-[#FF1493] text-white px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest hover:bg-pink-700 transition-all shadow-2xl shadow-pink-300 hover:-translate-y-1">
              Profissionalize seu atendimento hoje
            </button>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left mb-24">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-black mb-4 tracking-tight">Sua agenda trabalhando por você.</h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                Envie seu link personalizado e deixe sua cliente escolher o dia e horário disponível, diretamente na sua agenda 💅✨
              </p>
            </div>
            
            <ul className="space-y-4">
              {[
                { icon: <Icons.Calendar />, text: "Agenda organizada automaticamente" },
                { icon: <Icons.Repeat />, text: "Menos mensagens repetidas" },
                { icon: <Icons.Sparkles />, text: "Mais profissionalismo no atendimento" },
                { icon: <Icons.Scissors />, text: "Ideal para manicure, salão, cílios e sobrancelhas" },
                { icon: <Icons.Clock />, text: "Atendimento moderno e prático para suas clientes" }
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-black font-bold">
                  <div className="w-10 h-10 bg-pink-50 text-[#FF1493] rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-pink-100 rounded-[3rem] rotate-3 scale-105 -z-10"></div>
            {/* SaaS Dashboard Mockup */}
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#FF1493] rounded-2xl flex items-center justify-center text-white font-bold">P</div>
                    <div>
                      <p className="font-black text-black text-sm uppercase tracking-tight">Painel Administrativo</p>
                      <p className="text-gray-400 text-xs font-bold">Gestão Prado Agenda</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-2 rounded-full bg-green-400"></div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-black uppercase">Receita Hoje</p>
                    <p className="text-lg font-black text-black">R$ 480,00</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-black uppercase">Agendamentos</p>
                    <p className="text-lg font-black text-black">12</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#FF1493] font-bold text-xs">M</div>
                      <span className="text-xs font-bold">Maria Silva - 14:00</span>
                    </div>
                    <span className="text-[10px] font-black text-green-500 uppercase">Confirmado</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#FF1493] font-bold text-xs">J</div>
                      <span className="text-xs font-bold">Julia Costa - 15:30</span>
                    </div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase">Pendente</span>
                  </div>
               </div>
               <div className="mt-8 flex justify-center">
                  <div className="px-4 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">Acessar Agenda</div>
               </div>
            </div>
          </div>
        </div>

        {/* Target Audience / Icon Grid */}
        <div className="max-w-5xl mx-auto mb-20">
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs mb-10">Público que já utiliza</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Manicure", icon: <Icons.Nails /> },
              { label: "Salão de Beleza", icon: <Icons.Scissors /> },
              { label: "Lash Designer", icon: <Icons.EyeOff /> },
              { label: "Sobrancelhas", icon: <Icons.Sparkles /> }
            ].map((target, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-[2rem] hover:bg-pink-50 transition-colors group">
                <div className="text-black group-hover:text-[#FF1493] mb-4 flex justify-center">{target.icon}</div>
                <p className="font-black text-xs uppercase tracking-widest text-black">{target.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Section */}
        <div className="max-w-3xl mx-auto py-20 px-10 bg-black rounded-[3rem] text-white">
          <h3 className="text-2xl md:text-3xl font-black italic mb-4 leading-tight">
            "Sua agenda trabalhando por você, enquanto você foca no que faz de melhor 💖"
          </h3>
          <p className="text-pink-500 font-black uppercase tracking-widest text-xs">Autoridade Prado Social</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-[#FF1493] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="text-sm font-black tracking-widest text-black uppercase">Prado Social</span>
        </div>
        <p className="text-gray-400 text-sm font-medium mb-2">Especialista em soluções digitais para profissionais da beleza</p>
        <p className="text-gray-300 text-xs">&copy; 2024 Prado Agenda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
