
import React, { useState, useEffect, useCallback } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
import { db, generateSlug } from './services/db.ts';
import { Icons } from './constants.tsx';
import Sidebar from './Sidebar.tsx';
import MobileHeader from './components/MobileHeader.tsx';
import BottomNav from './components/BottomNav.tsx';
import LandingPage from './views/LandingPage.tsx';
import AuthView from './views/AuthView.tsx';
import Dashboard from './views/Dashboard.tsx';
import ServicesPage from './views/ServicesPage.tsx';
import ProfilePage from './views/ProfilePage.tsx';
import BookingPage from './views/BookingPage.tsx';
import ClientsPage from './views/ClientsPage.tsx';
import SettingsPage from './views/SettingsPage.tsx';
import AgendaPage from './views/AgendaPage.tsx';
import ProfessionalsPage from './views/ProfessionalsPage.tsx';
import InactivationPage from './views/InactivationPage.tsx';
import RecurringPage from './views/RecurringPage.tsx';
import AppsPage from './views/AppsPage.tsx';
import ReportsPage from './views/ReportsPage.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [inactivations, setInactivations] = useState<any[]>([]);

  const [isPublicView, setIsPublicView] = useState(false);
  const [publicProfessional, setPublicProfessional] = useState<Professional | null>(null);
  const [publicServices, setPublicServices] = useState<Service[]>([]);
  const [publicConfig, setPublicConfig] = useState<BusinessConfig>({ interval: 60, expediente: [] });
  const [publicAppointments, setPublicAppointments] = useState<Appointment[]>([]);
  const [publicInactivations, setPublicInactivations] = useState<any[]>([]);

  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    if (v !== 'booking' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = useCallback(() => {
    db.auth.logout();
    setUser(null);
    setIsPublicView(false);
    setDbError(null);
    navigate('landing');
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      const pathSlug = window.location.pathname.split('/').filter(Boolean)[0];
      const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'company', 'settings', 'inactivation', 'recurring', 'apps', 'finance'];
      
      try {
        if (pathSlug && !protectedRoutes.includes(pathSlug) && !pathSlug.includes('.')) {
          await handlePublicBooking(pathSlug);
        } else {
          await checkAuthSession();
        }
      } catch (err: any) {
        console.error("Erro de inicialização:", err);
        const errMsg = err.message || JSON.stringify(err);
        if (errMsg.includes("relation") || errMsg.includes("cache") || errMsg.includes("found")) {
          setDbError("As tabelas do banco de dados ainda não foram criadas ou estão incompletas. Execute o script SQL no painel do Supabase.");
        } else {
          setDbError(errMsg);
        }
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const checkAuthSession = async () => {
    const session = db.auth.getSession();
    if (session && session.user) {
      await fetchInitialData(session.user.id);
    } else {
      setIsLoading(false);
    }
  };

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    setDbError(null);
    try {
      const prof = await db.table('professionals').find({ id: userId });
      if (prof) {
        const normalizedProf = {
          ...prof,
          businessName: prof.business_name || prof.businessName
        };
        setUser(normalizedProf);

        const [svs, appts, cls, config, blocks, pros] = await Promise.all([
          db.table('services').where({ professional_id: userId }),
          db.table('appointments').where({ professional_id: userId }),
          db.table('clients').where({ professional_id: userId }),
          db.table('business_config').find({ professional_id: userId }),
          db.table('blocked_dates').where({ professional_id: userId }),
          db.table('professionals').where({ business_name: normalizedProf.businessName })
        ]);

        setServices(svs);
        setAppointments(appts);
        setClients(cls.map((c: any) => ({
          ...c,
          totalBookings: c.total_bookings,
          lastVisit: c.last_visit
        })));
        setBusinessConfig(config ? {
          ...config,
          themeColor: config.theme_color
        } : null);
        setInactivations(blocks);
        setProfessionals(pros);
        if (['landing', 'login', 'signup'].includes(currentView)) navigate('dashboard');
      } else {
        // Se a sessão existe no localstorage mas o usuário não está no DB (limpeza de DB), desloga.
        handleLogout();
      }
    } catch (e: any) {
      console.error("Erro ao sincronizar:", e);
      const errMsg = e.message || JSON.stringify(e);
      if (errMsg.includes("relation")) {
        setDbError("Tabelas não encontradas no Supabase. Execute o script de criação no SQL Editor.");
      } else {
        setDbError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const profId = user?.id || publicProfessional?.id;
    if (!profId) return;
    
    const client = await db.table('clients').find({ phone: appt.clientPhone, professional_id: profId });
    if (client) {
      await db.table('clients').update(client.id, { 
        total_bookings: (client.total_bookings || 0) + 1, 
        last_visit: new Date().toISOString() 
      });
    } else {
      await db.table('clients').insert({ 
        professional_id: profId, 
        name: appt.clientName, 
        phone: appt.clientPhone, 
        total_bookings: 1, 
        last_visit: new Date().toISOString() 
      });
    }
    
    await db.table('appointments').insert({ 
      professional_id: profId,
      service_id: appt.serviceId,
      client_name: appt.clientName,
      client_phone: appt.clientPhone,
      date: appt.date,
      status: appt.status
    });
    if (user?.id) fetchInitialData(user.id);
  };

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await db.table('appointments').update(id, { status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleUpdateConfig = async (c: BusinessConfig) => {
    if (!user?.id) return;
    const dbPayload = {
      interval: c.interval,
      expediente: c.expediente,
      theme_color: c.themeColor
    };
    await db.table('business_config').updateWhere({ professional_id: user.id }, dbPayload);
    setBusinessConfig(c);
  };

  const handlePublicBooking = async (slug: string) => {
    setIsLoading(true);
    const cleanSlug = generateSlug(slug);
    const prof = await db.table('professionals').find({ slug: cleanSlug });
    if (prof) {
      setPublicProfessional(prof);
      const [svs, config, appts, blocks] = await Promise.all([
        db.table('services').where({ professional_id: prof.id, active: true }),
        db.table('business_config').find({ professional_id: prof.id }),
        db.table('appointments').where({ professional_id: prof.id }),
        db.table('blocked_dates').where({ professional_id: prof.id })
      ]);
      setPublicServices(svs);
      setPublicConfig(config ? { ...config, themeColor: config.theme_color } : { interval: 60, expediente: [] });
      setPublicAppointments(appts);
      setPublicInactivations(blocks);
      setIsPublicView(true);
      setCurrentView('booking');
    } else {
      await checkAuthSession();
    }
    setIsLoading(false);
  };

  if (dbError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md bg-white p-10 rounded-[3rem] shadow-xl border border-red-50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.Ban className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-black uppercase mb-4 tracking-tight">Erro de Banco de Dados</h2>
        <div className="bg-gray-50 p-4 rounded-xl mb-8 overflow-hidden">
          <p className="text-gray-500 text-xs font-mono break-all">{dbError}</p>
        </div>
        <button 
          onClick={() => { setDbError(null); setIsLoading(true); window.location.reload(); }} 
          className="w-full bg-[#FF1493] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-pink-700 transition-all mb-4"
        >
          Tentar Novamente
        </button>
        <button 
          onClick={handleLogout}
          className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
        >
          Limpar Sessão (Sair)
        </button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sincronizando com Supabase...</p>
      </div>
    </div>
  );

  const renderViewContent = () => {
    if (isPublicView && publicProfessional) {
      return (
        <BookingPage 
          professional={publicProfessional} services={publicServices} config={publicConfig} 
          appointments={publicAppointments} inactivations={publicInactivations} 
          onComplete={handleSaveAppointment} onHome={() => window.location.href = window.location.origin} 
        />
      );
    }
    
    const commonProps = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} config={businessConfig} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} onAddManualAppointment={handleSaveAppointment} inactivations={inactivations} config={businessConfig} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={async (s) => { await db.table('services').insert({ ...s, professional_id: user?.id }); await fetchInitialData(user?.id!) }} onDelete={async (id) => { await db.table('services').delete(id); await fetchInitialData(user?.id!) }} onToggle={async (id) => { const s = services.find(sv => sv.id === id); await db.table('services').update(id, { active: !s?.active }); await fetchInitialData(user?.id!) }} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={async (u) => { await db.table('professionals').update(user?.id!, { ...u, business_name: u.businessName }); await fetchInitialData(user?.id!); return true; }} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'finance': return <ReportsPage {...commonProps} appointments={appointments} services={services} config={businessConfig} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={professionals} onAdd={async (p) => { await db.table('professionals').insert(p); await fetchInitialData(user?.id!) }} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={async (d) => { await db.table('blocked_dates').insert({...d, professional_id: user?.id}); await fetchInitialData(user?.id!) }} onDelete={async (id) => { await db.table('blocked_dates').delete(id); await fetchInitialData(user?.id!) }} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      case 'apps': return <AppsPage {...commonProps} />;
      case 'login': return <AuthView type="login" onAuth={async () => await fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={async () => await fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('login')} />;
      case 'landing': return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
      default: return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden relative">
      {user && !isPublicView && <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />}
      <div className="flex-grow flex flex-col relative h-full">
        {user && !isPublicView && <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />}
        <div className="flex-grow pb-20 md:pb-12 overflow-y-auto custom-scrollbar">
          {renderViewContent()}
        </div>
        {user && !isPublicView && <BottomNav activeView={currentView} navigate={navigate} />}
      </div>
    </div>
  );
};

export default App;
