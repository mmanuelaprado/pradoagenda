import React, { useState, useEffect } from 'react';
import { Icons } from '../constants.tsx';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  forcePrivacy?: boolean;
  onHome?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, forcePrivacy = false, onHome }) => {
  const currentHost = "pradoagenda.vercel.app";
  const [showPrivacy, setShowPrivacy] = useState(forcePrivacy);

  useEffect(() => {
    if (forcePrivacy) {
      setShowPrivacy(true);
    }
  }, [forcePrivacy]);

  const scrollToTop = () => {
    if (onHome) {
      onHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClosePrivacy = () => {
    setShowPrivacy(false);
    if (forcePrivacy && onHome) {
      onHome();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" onClick={scrollToTop}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF1493] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 group-active:scale-95 transition-transform">
            <span className="text-white font-black text-lg md:text-xl">P</span>
          </div>
          <span className="text-lg md:text-2xl font-black tracking-tighter text-black uppercase group-hover:text-[#FF1493] transition-colors">Prado Agenda</span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          <button onClick={onLogin} className="text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-[#FF1493] transition-colors">Entrar</button>
          <button onClick={onStart} className="bg-black text-white px-5 py-2 md:px-8 md:py-3 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Cadastre-se</button>
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
            Gere seu link personalizado e transforme seguidores em clientes fiéis.
          </p>

          <button onClick={onStart} className="bg-[#FF1493] text-white px-10 py-5 md:px-16 md:py-7 rounded-full text-base md:text-lg font-black uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-200 active:scale-95">
            Começar Agora
          </button>
        </div>

        {/* MOCKUP CONTAINER */}
        <div className="relative w-full max-w-5xl mx-auto px-2 md:px-4 mt-4 md:mt-10">
          <div className="absolute -top-8 left-0 md:-top-16 md:-left-12 z-30 animate-bounce-slow scale-50 md:scale-100">
            <div className="w-24 h-24 bg-[#FF1493] rounded-full border-[8px] border-white shadow-2xl flex items-center justify-center">
               <Icons.Clock className="w-12 h-12 text-white" />
            </div>
          </div>

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

          <div className="absolute -right-2 md:-right-20 -bottom-16 md:bottom-10 w-44 md:w-80 z-40 transform rotate-[6deg] animate-float">
             <div className="bg-[#1A1A20] p-2.5 md:p-5 rounded-[2.5rem] md:rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] border-[4px] md:border-[8px] border-[#2A2A30] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-5 md:h-7 bg-[#1A1A20] rounded-b-2xl z-50 flex items-center justify-center space-x-1">
                   <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                   <div className="w-6 md:w-10 h-1 bg-white/10 rounded-full"></div>
                </div>

                <div className="bg-white rounded-[1.8rem] md:rounded-[4rem] aspect-[9/19.5] overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-[#FF1493] p-4 md:p-6 pt-8 md:pt-14 text-white">
                    <div className="flex items-center space-x-2 md:space-x-3 mb-4">
                       <div className="w-6 h-6 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-[#FF1493] font-black text-[8px] md:text-xs">PA</div>
                       <div>
                         <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest opacity-80">Link de Agendamento</p>
                         <p className="text-[7px] md:text-[10px] font-bold truncate max-w-[120px]">{currentHost}/meu-espaco</p>
                       </div>
                    </div>
                  </div>

                  <div className="p-3 md:p-6 space-y-3 md:space-y-6 flex-grow flex flex-col">
                    <div className="space-y-2 md:space-y-4">
                      <p className="text-[6px] md:text-[8px] font-black text-gray-300 uppercase tracking-widest">Escolha a Data</p>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 21 }).map((_, i) => (
                          <div key={i} className={`aspect-square rounded md:rounded-lg flex items-center justify-center text-[5px] md:text-[8px] font-black ${i === 15 ? 'bg-[#FF1493] text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-pink-50 p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-pink-100 animate-pulse">
                       <div className="flex justify-between items-center mb-1 md:mb-2">
                         <span className="text-[5px] md:text-[7px] font-black text-[#FF1493] uppercase">Selecionado</span>
                         <span className="text-[6px] md:text-[9px] font-black text-[#FF1493]">Agendar</span>
                       </div>
                       <p className="text-[7px] md:text-[11px] font-black text-black uppercase">Agendamento Online</p>
                    </div>

                    <div className="space-y-1.5 md:space-y-3">
                       <p className="text-[5px] md:text-[7px] font-black text-gray-300 uppercase tracking-widest">Horários Disponíveis</p>
                       <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">09:00</div>
                          <div className="py-2 md:py-3 bg-black text-white rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold shadow-lg">10:00</div>
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">11:00</div>
                          <div className="py-2 md:py-3 bg-white border border-gray-100 rounded-lg md:rounded-xl text-center text-[6px] md:text-[9px] font-bold text-gray-400">14:00</div>
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
             { title: "Sincronizado", desc: "Suas clientes agendam, sua agenda atualiza na hora.", icon: <Icons.Smartphone /> },
             { title: "Sistema Completo", desc: "Cada profissional tem seu próprio link exclusivo.", icon: <Icons.Sparkles /> },
             { title: "Link na Bio", desc: "Sua agenda aberta 24h para novas marcações.", icon: <Icons.Calendar /> }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100 text-left hover:shadow-2xl transition-all hover:-translate-y-1">
               <div className="w-10 h-10 md:w-16 md:h-16 bg-pink-50 text-[#FF1493] rounded-xl md:rounded-[2rem] flex items-center justify-center mb-4 md:mb-8">
                 {item.icon}
               </div>
               <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-tight mb-2 md:mb-4">{item.title}</h3>
               <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </main>

      {/* Footer Atualizado */}
      <footer className="py-12 md:py-16 bg-black relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#FF1493]/30 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-[#FF1493] rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-900/40 mb-6 cursor-pointer group active:scale-95 transition-transform" onClick={scrollToTop}>
              <span className="text-white font-black text-xl">P</span>
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-tighter mb-2 cursor-pointer group hover:text-[#FF1493] transition-colors" onClick={scrollToTop}>Prado Agenda</h2>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.3em]">Gestão de agendamento Inteligente</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            <a 
              href="https://instagram.com/pradosocial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest flex items-center space-x-2"
            >
              <Icons.Instagram className="w-4 h-4" />
              <span>Instagram @pradosocial</span>
            </a>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-gray-400 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              Privacidade
            </button>
          </div>

          <div className="border-t border-white/5 pt-10">
            <p className="text-gray-500 text-[9px] md:text-[10px] font-black leading-loose tracking-widest">
              &copy; 2024 Prado Agenda. Todos os direitos reservados. <br className="md:hidden" /> 
              Desenvolvido por <span className="text-[#FF1493]">Manuela Prado</span>.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Privacidade */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2rem] md:rounded-[4rem] shadow-2xl flex flex-col relative">
            <button 
              onClick={handleClosePrivacy}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-10 h-10 md:w-14 md:h-14 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-black font-bold text-lg md:text-2xl transition-all z-10"
            >
              ✕
            </button>
            
            <div className="p-8 md:p-16 overflow-y-auto custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 bg-[#FF1493] rounded-2xl flex items-center justify-center text-white font-black text-xl">P</div>
                  <h2 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight">Política de Privacidade</h2>
                </div>
                
                <div className="prose prose-pink max-w-none text-gray-600 font-medium leading-relaxed space-y-8">
                  <p className="text-sm font-black text-[#FF1493] uppercase tracking-widest bg-pink-50 inline-block px-4 py-2 rounded-full">
                    Última atualização: 07 de JANEIRO DE 2026.
                  </p>
                  
                  <p>O aplicativo Prado Agenda tem o compromisso de proteger a privacidade e os dados pessoais de seus usuários. Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos e protegemos as informações fornecidas durante o uso do aplicativo.</p>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">1. Informações coletadas</h3>
                    <p>O Prado Agenda pode coletar as seguintes informações:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Nome do usuário</li>
                      <li>Número de telefone</li>
                      <li>Endereço de e-mail</li>
                      <li>Informações relacionadas a agendamentos (datas, horários e serviços)</li>
                      <li>Dados básicos de uso do aplicativo</li>
                    </ul>
                    <p>As informações são fornecidas voluntariamente pelo usuário ao utilizar as funcionalidades do app.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">2. Finalidade do uso dos dados</h3>
                    <p>Os dados coletados são utilizados para:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Permitir o funcionamento correto do sistema de agendamento</li>
                      <li>Identificar usuários dentro da plataforma</li>
                      <li>Facilitar a comunicação entre profissionais e clientes</li>
                      <li>Melhorar a experiência do usuário</li>
                      <li>Garantir segurança e estabilidade do aplicativo</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">3. Compartilhamento de informações</h3>
                    <p>O Prado Agenda não vende, aluga ou comercializa dados pessoais dos usuários. As informações poderão ser compartilhadas apenas:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Quando necessário para o funcionamento do aplicativo</li>
                      <li>Para cumprimento de obrigações legais ou determinações judiciais</li>
                      <li>Com serviços de terceiros essenciais ao funcionamento do app (ex.: hospedagem, autenticação ou análise de desempenho)</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">4. Uso de serviços de terceiros</h3>
                    <p>O aplicativo pode utilizar serviços de terceiros, como ferramentas de análise e infraestrutura (ex.: Firebase), que podem coletar dados de forma automática para garantir o desempenho e a segurança do app. Esses serviços seguem suas próprias políticas de privacidade.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">5. Segurança dos dados</h3>
                    <p>Adotamos medidas técnicas e administrativas adequadas para proteger os dados pessoais contra acesso não autorizado, perda, alteração ou divulgação indevida.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">6. Direitos do usuário</h3>
                    <p>O usuário tem direito de: acessar seus dados pessoais, solicitar correção ou atualização, solicitar a exclusão de seus dados e revogar consentimentos. Essas solicitações podem ser feitas por meio do contato informado nesta política.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">7. Retenção de dados</h3>
                    <p>Os dados pessoais são armazenados apenas pelo tempo necessário para cumprir as finalidades descritas nesta Política, respeitando obrigações legais aplicáveis.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">8. Privacidade de menores</h3>
                    <p>O Prado Agenda não é destinado a menores de 13 anos. Não coletamos intencionalmente dados de crianças.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">9. Alterações nesta Política de Privacidade</h3>
                    <p>Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que o usuário revise este documento regularmente.</p>
                  </section>

                  <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
                    <h3 className="text-black font-black uppercase text-lg tracking-tight">10. Contato</h3>
                    <p>Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados, entre em contato:</p>
                    <p className="font-black text-black">📧 E-mail: <span className="text-[#FF1493]">agenciapradosocial@gmail.com</span></p>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-12 bg-gray-50 rounded-b-[2rem] md:rounded-b-[4rem] flex justify-center border-t border-gray-100">
              <button 
                onClick={handleClosePrivacy}
                className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
              >
                Entendi e Aceito
              </button>
            </div>
          </div>
        </div>
      )}

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