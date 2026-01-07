
import React from 'react';
import { Icons } from '../constants.tsx';

interface ContactViewProps {
  onHome: () => void;
}

const ContactView: React.FC<ContactViewProps> = ({ onHome }) => {
  const whatsappNumber = "71996463245";
  const emailAddress = "agenciapradosocial@gmail.com";
  const instagramHandle = "pradosocial";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-[#FF1493] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-pink-200 mb-6 cursor-pointer active:scale-95 transition-transform" onClick={onHome}>
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-2">Fale Conosco</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Suporte e Atendimento Prado Agenda</p>
        </div>

        <div className="space-y-4">
          <a 
            href={`https://wa.me/55${whatsappNumber}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Icons.WhatsApp />
            </div>
            <div className="ml-6 text-left">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">WhatsApp</p>
              <p className="text-lg font-black text-black">(71) 99646-3245</p>
            </div>
          </a>

          <a 
            href={`mailto:${emailAddress}`}
            className="flex items-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-lg font-bold">@</span>
            </div>
            <div className="ml-6 text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">E-mail</p>
              <p className="text-lg font-black text-black break-all">{emailAddress}</p>
            </div>
          </a>

          <a 
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-pink-50 rounded-[2rem] border border-pink-100 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-[#FF1493] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Icons.Instagram />
            </div>
            <div className="ml-6 text-left">
              <p className="text-[10px] font-black text-[#FF1493] uppercase tracking-widest leading-none mb-1">Instagram</p>
              <p className="text-lg font-black text-black">@{instagramHandle}</p>
            </div>
          </a>
        </div>

        <button 
          onClick={onHome} 
          className="mt-12 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#FF1493] transition-colors"
        >
          Voltar para Início
        </button>
      </div>
    </div>
  );
};

export default ContactView;
