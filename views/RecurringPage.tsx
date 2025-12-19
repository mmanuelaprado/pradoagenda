
import React from 'react';
import { Icons } from '../constants.tsx';
import { Professional, View } from '../types.ts';

interface RecurringPageProps {
  user: Professional | null;
  // Added missing onLogout to match commonProps in App.tsx
  onLogout: () => void;
  navigate: (v: View) => void;
}

const RecurringPage: React.FC<RecurringPageProps> = ({ user, navigate, onLogout }) => {
  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">Agendamento Recorrente</h1>
        <p className="text-gray-500 font-medium">Automatize horários para clientes que frequentam seu espaço toda semana.</p>
      </header>

      <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center shadow-sm">
        <div className="w-20 h-20 bg-pink-50 text-[#FF1493] rounded-3xl flex items-center justify-center mx-auto mb-8">
           <Icons.Repeat />
        </div>
        <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter">Fidelize suas clientes</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
          Em breve você poderá configurar planos mensais e quinzenais para garantir sua agenda cheia o ano todo.
        </p>
        <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
          Ser avisado no lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {[
          { title: 'Toda Semana', desc: 'Garanta o horário da sua cliente fiel.' },
          { title: 'Quinzenal', desc: 'Perfeito para manutenção de alongamentos.' },
          { title: 'Mensal', desc: 'Controle total de planos de recorrência.' }
        ].map((card, i) => (
          <div key={i} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
             <h4 className="font-black text-black uppercase text-sm mb-2">{card.title}</h4>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default RecurringPage;
