
import React, { useState } from 'react';
import { Professional } from '../types';

interface AuthViewProps {
  type: 'login' | 'signup';
  onAuth: (user: Professional) => void;
  onToggle: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ type, onAuth, onToggle }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth({
      name: formData.name || 'Especialista',
      businessName: formData.businessName || 'Prado Beauty',
      email: formData.email,
      slug: (formData.businessName || 'prado-beauty').toLowerCase().replace(/\s+/g, '-')
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-2/5 bg-black flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center shadow-lg shadow-pink-900/50">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Pradoagenda</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-none tracking-tight">Especialista em soluções digitais para beleza.</h2>
          <p className="text-gray-400 text-lg font-medium">
            Profissionalize seu atendimento hoje e deixe o sistema organizar sua agenda automaticamente.
          </p>
          <div className="mt-12 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#FF1493]"></div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF1493]">Prado Social</span>
          </div>
        </div>
      </div>
      <div className="md:w-3/5 bg-white flex flex-col justify-center p-8 md:p-24">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            {type === 'login' ? 'Bem-vinda(o) de volta!' : 'Crie sua agenda agora'}
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            {type === 'login' ? 'Acesse o painel administrativo do Prado Agenda.' : 'Sua gestão profissional começa aqui.'}
          </p>

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
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">E-mail Profissional</label>
              <input required type="email" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Senha</label>
              <input required type="password" placeholder="••••••••" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button className="w-full bg-[#FF1493] text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-100 mt-4">
              {type === 'login' ? 'Entrar no painel' : 'Registrar Agora'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={onToggle} className="text-gray-400 hover:text-[#FF1493] font-black text-[10px] uppercase tracking-widest transition-colors">
              {type === 'login' ? 'Não tem conta? Crie sua agenda gratuita' : 'Já possui conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
