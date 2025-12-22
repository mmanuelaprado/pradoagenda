
import React from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import { db } from '../services/db.ts';

interface ReportsPageProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user, appointments, services, navigate }) => {
  // Filtra agendamentos confirmados ou concluídos para compor a receita
  const financialAppts = (appointments || []).filter(a => 
    a.status === 'confirmed' || a.status === 'completed'
  );
  
  const revenue = financialAppts.reduce((acc, curr) => {
    const service = services.find(s => s.id === curr.serviceId);
    return acc + (service?.price || 0);
  }, 0);

  // Busca a cor do tema do profissional ou usa o rosa padrão
  const config = user?.id ? db.table('business_config').find({ professional_id: user.id }) : null;
  const brandColor = config?.themeColor || '#FF1493';

  // Estatísticas por serviço
  const serviceStats = (services || []).map(s => {
    const count = financialAppts.filter(a => a.serviceId === s.id).length;
    return { name: s.name, count, total: count * s.price };
  }).sort((a, b) => b.total - a.total);

  // Dados mockados para o gráfico semanal (em um sistema real viriam do banco)
  const weeklyData = [
    { day: 'Seg', val: 45 },
    { day: 'Ter', val: 70 },
    { day: 'Qua', val: 55 },
    { day: 'Qui', val: 90 },
    { day: 'Sex', val: 100 },
    { day: 'Sáb', val: 85 },
    { day: 'Dom', val: 20 },
  ];

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10 animate-fade-in">
      <button 
        onClick={() => navigate('dashboard')}
        className="flex items-center mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
        style={{ color: brandColor }}
      >
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">
          <Icons.ArrowLeft />
        </span>
        Voltar ao Painel
      </button>

      <header className="mb-10">
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">Relatórios Financeiros</h1>
        <p className="text-gray-500 font-medium tracking-tight">Sincronização de faturamento (Confirmados + Concluídos).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icons.Finance className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Receita Bruta</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">R$ {revenue.toLocaleString('pt-BR')}</h3>
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-green-500 text-[10px] font-black uppercase">↑ 100% Sincronizado</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Ticket Médio</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">
            R$ {financialAppts.length > 0 ? (revenue / financialAppts.length).toFixed(0) : '0'}
          </h3>
          <p className="text-gray-300 text-[10px] mt-4 font-black uppercase tracking-widest">Média por atendimento</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Total de Vendas</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">{financialAppts.length}</h3>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: brandColor }}></div>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group" style={{ backgroundColor: brandColor }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Icons.Sparkles className="w-12 h-12" />
          </div>
          <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-3">Produtividade</p>
          <h3 className="text-3xl font-black tracking-tighter">Alta</h3>
          <p className="text-white/40 text-[10px] mt-4 font-black uppercase tracking-widest">Análise de Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">Movimentação</h2>
            <div className="bg-gray-50 rounded-xl text-[10px] font-black uppercase px-4 py-2">
              Últimos Atendimentos
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-grow flex flex-col items-center group">
                <div 
                  className="w-full bg-gray-50 rounded-2xl transition-all duration-500 relative group-hover:opacity-80"
                  style={{ height: `${d.val}%`, backgroundColor: brandColor }}
                >
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase mt-4 tracking-widest">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight">Ranking de Serviços</h2>
          <div className="space-y-6">
            {serviceStats.length > 0 ? serviceStats.slice(0, 5).map((stat, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-gray-400 group-hover:text-white transition-colors" style={{ backgroundColor: i === 0 ? brandColor : '', color: i === 0 ? 'white' : '' }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-black uppercase tracking-tight">{stat.name}</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.count} Atendimentos</p>
                  </div>
                </div>
                <p className="font-black text-black text-sm">R$ {stat.total.toLocaleString('pt-BR')}</p>
              </div>
            )) : (
              <p className="text-center py-10 text-gray-300 font-black uppercase text-xs">Sem dados financeiros.</p>
            )}
          </div>
          
          <button 
            className="w-full mt-10 py-5 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            Exportar Relatório
          </button>
        </div>
      </div>
    </main>
  );
};

export default ReportsPage;
