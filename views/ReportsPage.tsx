
import React from 'react';
import { Professional, Appointment, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';

interface ReportsPageProps {
  user: Professional | null;
  appointments: Appointment[];
  services: Service[];
  onLogout: () => void;
  navigate: (v: View) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user, appointments, services, onLogout, navigate }) => {
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const revenue = confirmed.reduce((acc, curr) => {
    const service = services.find(s => s.id === curr.serviceId);
    return acc + (service?.price || 0);
  }, 0);

  const serviceStats = services.map(s => {
    const count = confirmed.filter(a => a.serviceId === s.id).length;
    return { name: s.name, count, total: count * s.price };
  }).sort((a, b) => b.total - a.total);

  // Simulação de dados para um gráfico de barras semanal
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="finance" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Dashboard Financeiro</h1>
          <p className="text-gray-500 font-medium tracking-tight">Análise completa do faturamento e produtividade do seu negócio.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icons.Finance className="w-16 h-16" />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Receita Bruta</p>
            <h3 className="text-3xl font-black text-black tracking-tighter">R$ {revenue.toLocaleString('pt-BR')}</h3>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-green-500 text-[10px] font-black uppercase">↑ 12.4%</span>
              <span className="text-gray-300 text-[10px] font-bold uppercase">vs mês ant.</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Ticket Médio</p>
            <h3 className="text-3xl font-black text-black tracking-tighter">
              R$ {confirmed.length > 0 ? (revenue / confirmed.length).toFixed(0) : '0'}
            </h3>
            <p className="text-gray-300 text-[10px] mt-4 font-black uppercase tracking-widest">Baseado em {confirmed.length} vendas</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Taxa de Ocupação</p>
            <h3 className="text-3xl font-black text-black tracking-tighter">78%</h3>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div className="bg-[#FF1493] p-8 rounded-[2.5rem] shadow-2xl shadow-pink-200 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Icons.Sparkles className="w-12 h-12" />
            </div>
            <p className="text-pink-100 text-[10px] font-black uppercase tracking-widest mb-3">Previsão Próx. 30d</p>
            <h3 className="text-3xl font-black tracking-tighter">R$ {(revenue * 1.4).toFixed(0)}</h3>
            <p className="text-pink-100/60 text-[10px] mt-4 font-black uppercase tracking-widest">IA Prado Insights ✨</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gráfico Semanal Simulado */}
          <div className="lg:col-span-7 bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-lg font-black text-black uppercase tracking-tight">Movimentação Semanal</h2>
              <select className="bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase px-4 py-2 outline-none">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-4 px-2">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-grow flex flex-col items-center group">
                  <div 
                    className="w-full bg-gray-50 rounded-2xl group-hover:bg-[#FF1493] transition-all duration-500 relative"
                    style={{ height: `${d.val}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-black px-2 py-1 rounded-md">
                      {d.val}%
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase mt-4 tracking-widest">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking de Serviços */}
          <div className="lg:col-span-5 bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight">Top Serviços</h2>
            <div className="space-y-6">
              {serviceStats.length > 0 ? serviceStats.slice(0, 5).map((stat, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-pink-50 group-hover:text-[#FF1493] transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-black uppercase tracking-tight">{stat.name}</p>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.count} Agendamentos</p>
                    </div>
                  </div>
                  <p className="font-black text-black text-sm">R$ {stat.total.toLocaleString('pt-BR')}</p>
                </div>
              )) : (
                <p className="text-center py-10 text-gray-300 font-black uppercase text-xs">Sem dados suficientes.</p>
              )}
            </div>
            
            <button className="w-full mt-10 py-5 bg-black text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all">Exportar PDF Completo</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
