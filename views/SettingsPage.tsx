
import React, { useState } from 'react';
import { Professional, BusinessConfig, View, DayExpediente } from '../types.ts';
import { Icons } from '../constants.tsx';

interface SettingsPageProps {
  user: Professional | null;
  config: BusinessConfig;
  onUpdateConfig: (c: BusinessConfig) => void;
  onLogout: () => void;
  navigate: (v: View) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, config, onUpdateConfig, onLogout, navigate }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleUpdateConfig = (newConfig: BusinessConfig) => {
    onUpdateConfig(newConfig);
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const updateDay = (dayIndex: number, data: Partial<DayExpediente>) => {
    const newExpediente = [...config.expediente];
    newExpediente[dayIndex] = { ...newExpediente[dayIndex], ...data };
    handleUpdateConfig({ ...config, expediente: newExpediente });
  };

  const updateShift = (dayIndex: number, shiftIndex: number, data: any) => {
    const newExpediente = [...config.expediente];
    const newShifts = [...newExpediente[dayIndex].shifts];
    newShifts[shiftIndex] = { ...newShifts[shiftIndex], ...data };
    newExpediente[dayIndex] = { ...newExpediente[dayIndex], shifts: newShifts as [any, any] };
    handleUpdateConfig({ ...config, expediente: newExpediente });
  };

  return (
    <main className="p-4 md:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-black tracking-tight mb-2 uppercase">Configurações</h1>
        <p className="text-[10px] md:text-sm text-gray-500 font-medium tracking-tight">Personalize o funcionamento da sua agenda.</p>
      </header>

      {/* Menu Mobile Rápido para páginas secundárias */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
        <button onClick={() => navigate('company')} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
          <Icons.Building className="text-[#FF1493] mb-2" />
          <span className="text-[9px] font-black uppercase">Minha Empresa</span>
        </button>
        <button onClick={() => navigate('inactivation')} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
          <Icons.Ban className="text-[#FF1493] mb-2" />
          <span className="text-[9px] font-black uppercase">Feriados</span>
        </button>
        <button onClick={() => navigate('recurring')} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
          <Icons.Repeat className="text-[#FF1493] mb-2" />
          <span className="text-[9px] font-black uppercase">Recorrência</span>
        </button>
        <button onClick={onLogout} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center">
          <Icons.Logout className="text-red-500 mb-2" />
          <span className="text-[9px] font-black uppercase text-red-500">Sair</span>
        </button>
      </div>

      <section className="mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Expediente Semanal</h3>
        <div className="space-y-3">
          {config.expediente.map((day, dIdx) => (
            <div key={day.day} className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-black text-sm uppercase tracking-tighter ${day.active ? 'text-black' : 'text-gray-200'}`}>{day.day}</span>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input 
                    type="checkbox" 
                    checked={day.active} 
                    onChange={(e) => updateDay(dIdx, { active: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF1493]"></div>
                </label>
              </div>

              {day.active && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {day.shifts.map((shift, sIdx) => (
                    <div key={sIdx} className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${shift.active ? 'bg-gray-50 border-gray-100' : 'bg-white opacity-40 border-dashed border-gray-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={shift.active} 
                        onChange={(e) => updateShift(dIdx, sIdx, { active: e.target.checked })}
                        className="accent-[#FF1493]"
                      />
                      <div className="flex items-center space-x-2">
                        <input type="time" value={shift.start} onChange={(e) => updateShift(dIdx, sIdx, { start: e.target.value })} className="bg-white border border-gray-100 px-2 py-1 rounded-lg text-xs font-bold w-20" />
                        <span className="text-gray-300">~</span>
                        <input type="time" value={shift.end} onChange={(e) => updateShift(dIdx, sIdx, { end: e.target.value })} className="bg-white border border-gray-100 px-2 py-1 rounded-lg text-xs font-bold w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Intervalo entre Agendamentos</h3>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {[15, 30, 45, 60].map(val => (
              <button 
                key={val}
                onClick={() => handleUpdateConfig({ ...config, interval: val as any })}
                className={`px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-center min-w-[100px] ${
                  config.interval === val ? 'border-[#FF1493] bg-pink-50' : 'border-gray-50'
                }`}
              >
                <span className="text-xl font-black">{val}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Min</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center gap-4 py-8">
        {saveStatus === 'saved' && (
          <div className="text-green-600 flex items-center gap-2 animate-bounce">
            <Icons.Check className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Sincronizado!</span>
          </div>
        )}
        <button 
          onClick={() => handleUpdateConfig(config)}
          className="w-full bg-black text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Sincronizar Manualmente
        </button>
      </div>
    </main>
  );
};

export default SettingsPage;
