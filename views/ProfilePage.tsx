
import React, { useState } from 'react';
import { Professional, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface ProfilePageProps {
  user: Professional | null;
  onUpdate: (u: Professional) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate, onLogout, navigate }) => {
  const [formData, setFormData] = useState<Professional>(user || {
    name: '',
    businessName: '',
    email: '',
    slug: '',
    bio: '',
    instagram: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    onUpdate(formData);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="company" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-4xl mx-auto w-full pb-24 md:pb-10">
        <button 
          onClick={() => navigate('dashboard')}
          className="flex items-center text-gray-400 hover:text-[#FF1493] mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">
            <Icons.ArrowLeft />
          </span>
          Voltar ao Painel
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Minha Empresa</h1>
          <p className="text-gray-500 font-medium tracking-tight">Personalize como os clientes visualizam seu espaço e agendam seus serviços.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tight">
              <span className="w-1.5 h-6 bg-[#FF1493] rounded-full"></span>
              Informações de Identidade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Profissional Responsável</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#FF1493] outline-none bg-gray-50 font-bold text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail de Contato Comercial</label>
                <input 
                  type="email" 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#FF1493] outline-none bg-gray-50 font-bold text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Público do Estabelecimento</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#FF1493] outline-none bg-gray-50 font-bold text-lg"
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tight">
              <span className="w-1.5 h-6 bg-[#FF1493] rounded-full"></span>
              Página de Agendamento
            </h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Biografia Profissional</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#FF1493] outline-none bg-gray-50 font-bold text-sm"
                  placeholder="Conte um pouco sobre sua trajetória e especialidades..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL Personalizada (Seu Link)</label>
                <div className="flex items-center bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FF1493]">
                  <span className="px-5 py-4 text-gray-400 font-black text-xs uppercase tracking-widest border-r border-gray-200">prado.com/b/</span>
                  <input 
                    type="text" 
                    className="flex-grow px-5 py-4 outline-none bg-transparent font-bold text-sm text-[#FF1493]"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuário Instagram (@)</label>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5">
                   <span className="text-gray-300 font-bold mr-1">@</span>
                   <input 
                    type="text" 
                    className="w-full py-4 outline-none bg-transparent font-bold text-sm"
                    placeholder="seu.espaco"
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className={`px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center space-x-3 ${
                saveStatus === 'saved' ? 'bg-green-600 text-white shadow-green-100' : 'bg-[#FF1493] text-white hover:bg-pink-700 shadow-pink-200'
              }`}
            >
              <span>
                {saveStatus === 'idle' && 'Salvar Empresa'}
                {saveStatus === 'saving' && 'Processando...'}
                {saveStatus === 'saved' && 'Dados Atualizados!'}
              </span>
              {saveStatus === 'saved' && <Icons.Check />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;
