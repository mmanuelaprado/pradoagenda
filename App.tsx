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
import MarketingPage from './views/MarketingPage.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View | 'marketing'>('landing');
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

  const navigate = useCallback((v: any) => {
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
    setCurrentView('landing');
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const pathSlug = pathSegments[0];
        const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'company', 'settings', 'inactivation', 'recurring', 'apps', 'finance', 'marketing'];
        
        if (pathSlug && !protectedRoutes.includes(pathSlug.toLowerCase()) && !pathSlug.includes('.')) {
          await handlePublicBooking(pathSlug);
        } else {
          await checkAuthSession();
        }
      } catch (err: any) {
        console.error("Erro crítico na inicialização:", err);
        if (isMounted) setDbError(err.message || "Erro de conexão com o servidor.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, []);

  const checkAuthSession = async () => {
    const session = db.auth.getSession();
    if (session && session.user) {
      await fetchInitialData(session.user.id);
    }
  };

  const fetchInitialData = async (userId: string) => {
    try {
      const prof = await db.table('professionals').find({ id: userId });
      if (prof) {
        const normalizedProf = {
          ...prof,
          businessName: prof.business_name || prof.businessName || 'Meu Espaço',
          id: prof.id
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

        setServices(svs || []);
        setAppointments(appts || []);
        setClients((cls || []).map((c: any) => ({
          ...c,
          totalBookings: c.total_bookings,
          lastVisit: c.last_visit
        })));
        setBusinessConfig(config ? {
          ...config,
          themeColor: config.theme_color
        } : null);
        setInactivations(blocks || []);
        setProfessionals(pros || []);
        
        setCurrentView('dashboard');
      } else {
        db.auth.logout();
      }
    } catch (e: any) {
      console.error("Erro ao sincronizar dados do usuário:", e);
      throw e;
    }
  };

  const handlePublicBooking = async (slug: string) => {
    const cleanSlug = generateSlug(slug);
    try {
      const prof = await db.table('professionals').find({ slug: cleanSlug });
      if (prof) {
        const normalizedProf = {
          ...prof,
          businessName: prof.business_name || prof.businessName || 'Espaço de Beleza',
          id: prof.id
        };
        setPublicProfessional(normalizedProf);

        const [svs, config, appts, blocks] = await Promise.all([
          db.table('services').where({ professional_id: prof.id, active: true }),
          db.table('business_config').find({ professional_id: prof.id }),
          db.table('appointments').where({ professional_id: prof.id }),
          db.table('blocked_dates').where({ professional_id: prof.id })
        ]);

        setPublicServices(svs || []);
        setPublicConfig(config ? { ...config, themeColor: config.theme_color } : { interval: 60, expediente: [] });
        setPublicAppointments(appts || []);
        setPublicInactivations(blocks || []);
        setIsPublicView(true);
        setCurrentView('booking');
      } else {
        await checkAuthSession();
      }
    } catch (err) {
      console.error("Erro na página pública:", err);
      await checkAuthSession();
    }
  };

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await db.table('appointments').update(id, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      alert("Erro ao atualizar status.");
    }
  };

  const handleSaveAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const profId = user?.id || publicProfessional?.id;
    if (!profId) return;
    
    try {
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
    } catch (e) {
      console.error("Erro ao salvar agendamento:", e);
      alert("Houve um erro ao salvar seu agendamento. Tente novamente.");
    }
  };

  if (dbError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md bg-white p-10 rounded-[3rem] shadow-xl border border-red-50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.Ban className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-black uppercase mb-4 tracking-tight">Erro de Sistema</h2>
        <p className="text-gray-500 text-sm mb-8">{dbError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full bg-[#FF1493] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-pink-700 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Carregando Prado Agenda...</p>
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
    
    const props = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...props} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} config={businessConfig} />;
      case 'agenda': return <AgendaPage {...props} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} onAddManualAppointment={handleSaveAppointment} inactivations={inactivations} config={businessConfig} />;
      case 'services': return <ServicesPage {...props} services={services} onAdd={async (s) => { await db.table('services').insert({ ...s, professional_id: user?.id }); fetchInitialData(user?.id!) }} onDelete={async (id) => { await db.table('services').delete(id); fetchInitialData(user?.id!) }} onToggle={async (id) => { const s = services.find(sv => sv.id === id); await db.table('services').update(id, { active: !s?.active }); fetchInitialData(user?.id!) }} />;
      case 'clients': return <ClientsPage {...props} clients={clients} appointments={appointments} />;
      case 'company': return <ProfilePage {...props} onUpdate={async (u) => { await db.table('professionals').update(user?.id!, { ...u, business_name: u.businessName }); fetchInitialData(user?.id!); return true; }} />;
      case 'settings': return <SettingsPage {...props} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={async (c) => { await db.table('business_config').updateWhere({ professional_id: user?.id }, { interval: c.interval, expediente: c.expediente, theme_color: c.themeColor }); setBusinessConfig(c); }} />;
      case 'finance': return <ReportsPage {...props} appointments={appointments} services={services} config={businessConfig} />;
      case 'marketing': return <MarketingPage {...props} services={services} />;
      case 'login': return <AuthView type="login" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('login')} />;
      case 'landing': default: return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
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
        {user && !isPublicView && <BottomNav activeView={currentView as View} navigate={navigate} />}
      </div>
    </div>
  );
};

export default App;