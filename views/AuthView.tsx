import React, { useState } from 'react';
import { db } from '../services/db.ts';
import { Professional } from '../types';

interface AuthViewProps {
  type: 'login' | 'signup';
  onAuth: (user: Professional) => void;
  onToggle: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ type, onToggle, onAuth }) => {
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
        if (data) onAuth(data as any);
        else setError("E-mail não encontrado. Por favor, cadastre-se.");
      }
    } catch (err: any) {
      setError("Verifique seus dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="md:w-2/5 bg-black flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full blur-[100px] opacity-10 -translate-y-1/2"></div>
        <div className="max-w-md mx-auto relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-10">
            <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Pradoagenda</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-none">A gestão que sua beleza merece.</h2>
          <p className="text-gray-400 text-sm font-medium">Sincronização segura e em tempo real.</p>
        </div>
      </div>
      <div className="md:w-3/5 bg-white flex flex-col justify-center p-6 md:p-20">
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-black text-black mb-1 tracking-tight">
            {type === 'login' ? 'Bem-vinda(o)!' : 'Comece agora'}
          </h1>
          <p className="text-gray-400 text-xs font-medium mb-8">Gerencie sua agenda de forma simples e rápida.</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-bold mb-6 border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Seu Nome</label>
                  <input required type="text" className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-sm focus:border-[#FF1493]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Nome da Empresa</label>
                  <input required type="text" className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-sm focus:border-[#FF1493]" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">E-mail</label>
              <input required type="email" className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-sm focus:border-[#FF1493]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Senha</label>
              <input required type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-sm focus:border-[#FF1493]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full bg-[#FF1493] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl mt-2 disabled:opacity-50 active:scale-95">
              {loading ? 'Aguarde...' : (type === 'login' ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={onToggle} className="text-gray-400 hover:text-[#FF1493] font-black text-[9px] uppercase tracking-widest transition-colors">
              {type === 'login' ? 'Não tem conta? Crie sua agenda' : 'Já possui conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;