
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { Professional } from '../types';

interface AuthViewProps {
  type: 'login' | 'signup';
  onAuth: (user: Professional) => void;
  onToggle: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ type, onToggle }) => {
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
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Criar Perfil Profissional no Banco
          const { error: profError } = await supabase.from('professionals').insert([{
            id: authData.user.id,
            name: formData.name,
            business_name: formData.businessName,
            slug: formData.businessName.toLowerCase().replace(/\s+/g, '-'),
            email: formData.email
          }]);

          if (profError) throw profError;

          // Criar Configuração Inicial
          await supabase.from('business_config').insert([{
            professional_id: authData.user.id,
            interval: 60,
            expediente: []
          }]);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-none tracking-tight">O sistema que sua beleza merece.</h2>
          <p className="text-gray-400 text-lg font-medium">Sincronização total. Dados seguros na nuvem.</p>
        </div>
      </div>
      <div className="md:w-3/5 bg-white flex flex-col justify-center p-8 md:p-24">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            {type === 'login' ? 'Bem-vinda(o)!' : 'Comece agora'}
          </h1>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6">{error}</div>}

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
              <input required type="password" placeholder="••••••••" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#FF1493] outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
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
    </div>
  );
};

export default AuthView;
