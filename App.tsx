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
    // Safety check for history manipulation in sandboxed environments
    if (v !== 'booking' && window.location.pathname !== '/') {
      try {
        window.history.pushState({}, '', '/');
      } catch (e) {
        console.debug("Navigation state update skipped due to environment restrictions.");
      }
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
      const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'company', 'settings', 'inactivation', 'recurring', 'apps', 'finance', 'marketing'];
      
      try {
        if (pathSlug && !protectedRoutes.includes(pathSlug) && !pathSlug.includes('.')) {
          await handlePublicBooking(pathSlug);
        } else {
          await checkAuthSession();
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setDbError(err.message || "Failed to initialize application.");
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
        setAppointments(appts.map((a: any) => ({
          ...a,
          clientName: a.client_name || a.clientName,
          clientPhone: a.client_phone || a.clientPhone,
          serviceId: a.service_id || a.serviceId
        })));
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
        handleLogout();
      }
    } catch (e: any) {
      console.error("Sync error:", e);
      setDbError("Erro ao sincronizar dados. Tentando novamente...");
      setTimeout(() => window.location.reload(), 3000);
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

    if (user?.id) {
      await fetchInitialData(user.id);
    }
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
      setPublicAppointments(appts.map((a: any) => ({
        ...a,
        clientName: a.client_name || a.clientName,
        clientPhone: a.client_phone || a.clientPhone,
        serviceId: a.service_id || a.serviceId
      })));
      setPublicInactivations(blocks);
      setIsPublicView(true);
      setCurrentView('booking');
    } else {
      await checkAuthSession();
    }
    setIsLoading(false);
  };

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
      case 'landing':
        return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
      case 'login':
        return <AuthView type="login" onAuth={() => checkAuthSession()} onToggle={() => navigate('signup')} navigate={navigate} />;
      case 'signup':
        return <AuthView type="signup" onAuth={() => checkAuthSession()} onToggle={() => navigate('login')} navigate={navigate} />;
      case 'dashboard':
        return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} config={businessConfig} />;
      case 'agenda':
        return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={handleSaveAppointment} onUpdateStatus={handleUpdateStatus} inactivations={inactivations} config={businessConfig} />;
      case 'services':
        return (
          <ServicesPage 
            {...commonProps} services={services} 
            onAdd={async (s) => { await db.table('services').insert({ ...s, professional_id: user?.id }); fetchInitialData(user!.id); }} 
            onToggle={async (id) => { const s = services.find(x => x.id === id); await db.table('services').update(id, { active: !s?.active }); fetchInitialData(user!.id); }}
            onDelete={async (id) => { await db.table('services').delete(id); fetchInitialData(user!.id); }}
          />
        );
      case 'clients':
        return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'marketing':
        return <MarketingPage {...commonProps} services={services} />;
      case 'company':
        return (
          <ProfilePage 
            {...commonProps} 
            onUpdate={async (u) => { 
              const { businessName, ...rest } = u;
              await db.table('professionals').update(user!.id!, { ...rest, business_name: businessName }); 
              fetchInitialData(user!.id!); 
              return true; 
            }} 
          />
        );
      case 'settings':
        return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'professionals':
        return <ProfessionalsPage {...commonProps} professionals={professionals} onAdd={async (p) => { await db.table('professionals').insert(p); fetchInitialData(user!.id!); }} />;
      case 'finance':
        return <ReportsPage {...commonProps} appointments={appointments} services={services} config={businessConfig} />;
      case 'inactivation':
        return (
          <InactivationPage 
            {...commonProps} inactivations={inactivations} 
            onAdd={async (i) => { await db.table('blocked_dates').insert({ ...i, professional_id: user?.id }); fetchInitialData(user!.id!); }} 
            onDelete={async (id) => { await db.table('blocked_dates').delete(id); fetchInitialData(user!.id!); }}
          />
        );
      case 'recurring':
        return <RecurringPage {...commonProps} />;
      case 'apps':
        return <AppsPage {...commonProps} />;
      case 'booking':
        return (
          <BookingPage 
            professional={user!} services={services} config={businessConfig || { interval: 60, expediente: [] }} 
            appointments={appointments} inactivations={inactivations} 
            onComplete={handleSaveAppointment} onHome={() => navigate('dashboard')} 
          />
        );
      default:
        return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} config={businessConfig} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Icons.Ban />
        </div>
        <h2 className="text-xl font-black uppercase mb-2">Ops! Algo deu errado</h2>
        <p className="text-gray-500 text-sm mb-8">{dbError}</p>
        <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFDFD]">
      {user && !isPublicView && <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />}
      <div className="flex-grow flex flex-col">
        {user && !isPublicView && <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />}
        <div className="flex-grow overflow-y-auto pb-safe">
          {renderViewContent()}
        </div>
        {user && !isPublicView && <BottomNav activeView={currentView} navigate={navigate} />}
      </div>
    </div>
  );
};

export default App;