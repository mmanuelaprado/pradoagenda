import React from 'react';
import { Icons } from '../constants.tsx';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const currentHost = "pradoagenda.vercel.app";

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center shadow-lg shadow-pink-200">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-black uppercase">Prado Agenda</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onLogin} className="text-black font-black text-[10px] uppercase tracking-widest hover:text-[#FF1493] transition-colors">Entrar</button>
          <button onClick={onStart} className="bg-black text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Cadastrar</button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/20 to-pink-100/30 -z-10"></div>
        
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-[#FF1493] px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 border border-pink-50 shadow-sm">
            <Icons.Sparkles className="w-3 h-3" />
            <span>Futuro Digital do seu Salão</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-black leading-[1.1] mb-6 tracking-tighter">
            Organize sua agenda <br className="hidden md:block"/> com <span className="text-[#FF1493]">perfeição.</span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-500 mb-8 max-w-xl mx-auto font-medium leading-relaxed px-4">
            Gere seu link personalizado e transforme seguidores em clientes fiéis agora mesmo.
          </p>

          <button onClick={onStart} className="bg-[#FF1493] text-white px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-pink-700 transition-all shadow-2xl shadow-pink-200">
            Começar Agora
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full px-4">
           {[
             { title: "Sincronizado", desc: "Suas clientes agendam, sua agenda atualiza na hora.", icon: <Icons.Smartphone /> },
             { title: "Personalizado", desc: "Cada profissional tem seu próprio link exclusivo.", icon: <Icons.Sparkles /> },
             { title: "Link na Bio", desc: "Sua agenda aberta 24h para novas marcações.", icon: <Icons.Calendar /> }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-left hover:shadow-xl transition-all">
               <div className="w-12 h-12 bg-pink-50 text-[#FF1493] rounded-2xl flex items-center justify-center mb-6">
                 {item.icon}
               </div>
               <h3 className="text-sm font-black text-black uppercase mb-2">{item.title}</h3>
               <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </main>

      <footer className="py-8 bg-black relative text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center shadow-2xl shadow-pink-900/40 mb-4">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <h2 className="text-white font-black text-sm uppercase tracking-tighter mb-1">Prado Agenda</h2>
            <p className="text-gray-500 text-[8px] font-medium uppercase tracking-[0.3em]">Gestão Inteligente</p>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <a href="https://instagram.com/pradosocial" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors font-black text-[9px] uppercase tracking-widest">Instagram</a>
            <button className="text-gray-500 hover:text-white transition-colors font-black text-[9px] uppercase tracking-widest">Privacidade</button>
          </div>

          <p className="text-gray-600 text-[9px] font-black tracking-widest">
            &copy; 2024 Prado Agenda. Desenvolvido por Manuela Prado.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;