import React, { useState } from 'react';
import { db } from '../services/db.ts';
import { Professional, View } from '../types';

interface AuthViewProps {
  type: 'login' | 'signup';
  onAuth: (user: Professional) => void;
  onToggle: () => void;
  navigate: (v: View) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ type, onToggle, onAuth, navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (type === 'signup') {
        const { data, error: signupError } = await db.auth.signup({
          email: formData.email,
          name: formData.name,
          businessName: formData.businessName
        });
        
        if (signupError) throw signupError;
        if (data) onAuth(data as any);
      } else {
        const { data, error: loginError } = await db.auth.login(formData.email);
        if (loginError) throw loginError;
        
        if (data) {
          onAuth(data as any);
        } else {
          setError("E-mail não encontrado. Por favor, cadastre-se para entrar.");
        }
      }
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      const errMsg = err.message || JSON.stringify(err);
      
      // Tratamento de erros específicos em português para o usuário final
      if (errMsg.includes("professionals_slug_key")) {
        setError("Este nome de estabelecimento já está em uso. Tente adicionar uma diferenciação no nome (ex: " + formData.businessName + " - Centro).");
      } else if (errMsg.includes("professionals_email_key")) {
        setError("Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.");
      } else if (errMsg.includes("coerce") || errMsg.includes("PGRST116")) {
        setError("E-mail não encontrado. Por favor, cadastre-se para entrar.");
      } else {
        setError("Ops! Ocorreu um erro: " + (errMsg || "Tente novamente mais tarde."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fade-in">
      <div className="md:w-2/5 bg-black flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center space-x-2 mb-12 cursor-pointer group" onClick={() => navigate('landing')}>
            <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center shadow-lg shadow-pink-900/50 group-active:scale-95 transition-transform">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase group-hover:text-[#FF1493] transition-colors">Pradoagenda</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-none tracking-tight">O sistema que sua beleza merece.</h2>
          <p className="text-gray-400 text-lg font-medium">Sincronização em tempo real com Supabase.</p>
        </div>
      </div>
      <div className="md:w-3/5 bg-white flex flex-col justify-center p-8 md:p-24">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            {type === 'login' ? 'Bem-vinda(o)!' : 'Comece agora'}
          </h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Seu Nome</label>
                  <input required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nome do Estabelecimento</label>
                  <input required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">E-mail</label>
              <input required type="email" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Senha</label>
              <input required type="password" placeholder="Digite sua senha" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-[#FF1493] text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-100 mt-4 disabled:opacity-50"
            >
              {loading ? 'Processando...' : (type === 'login' ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={onToggle} className="text-gray-400 hover:text-[#FF1493] font-black text-[10px] uppercase tracking-widest transition-colors">
              {type === 'login' ? 'Não tem conta? Crie sua agenda' : 'Já possui conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default AuthView;