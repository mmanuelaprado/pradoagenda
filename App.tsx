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
    if (!['booking', 'landing', 'login', 'signup'].includes(v)) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  }, []);

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
      }
    } catch (e: any) {
      console.error("Erro ao sincronizar:", e);
      setDbError(e.message || "Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const path = window.location.pathname.split('/').filter(Boolean);
      const slug = path[0];
      const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'settings', 'finance', 'company', 'apps', 'marketing'];
      
      if (slug && !protectedRoutes.includes(slug)) {
        // Fluxo de Página Pública de Agendamento
        try {
          const prof = await db.table('professionals').find({ slug: generateSlug(slug) });
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
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Erro ao carregar link público", e);
        }
      }

      // Fluxo Administrativo
      const session = db.auth.getSession();
      if (session?.user) {
        await fetchInitialData(session.user.id);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    db.auth.logout();
    setUser(null);
    setIsPublicView(false);
    navigate('landing');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[6px] border-[#FF1493] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Prado Agenda SaaS</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isPublicView && publicProfessional) {
      return (
        <BookingPage 
          professional={publicProfessional} services={publicServices} config={publicConfig} 
          appointments={publicAppointments} inactivations={publicInactivations} 
          onComplete={async (appt) => {
            await db.table('appointments').insert({ ...appt, professional_id: publicProfessional.id });
          }} 
          onHome={() => window.location.href = '/'} 
        />
      );
    }

    const props = { user, navigate, onLogout: handleLogout };
    switch (currentView) {
      case 'dashboard': return <Dashboard {...props} appointments={appointments} services={services} config={businessConfig} onUpdateStatus={async (id, s) => { await db.table('appointments').update(id, { status: s }); fetchInitialData(user!.id); }} />;
      case 'agenda': return <AgendaPage {...props} appointments={appointments} services={services} config={businessConfig} inactivations={inactivations} onUpdateStatus={async (id, s) => { await db.table('appointments').update(id, { status: s }); fetchInitialData(user!.id); }} onAddManualAppointment={async (a) => { await db.table('appointments').insert({...a, professional_id: user?.id}); fetchInitialData(user!.id); }} />;
      case 'services': return <ServicesPage {...props} services={services} onAdd={async (s) => { await db.table('services').insert({...s, professional_id: user?.id}); fetchInitialData(user!.id); }} onToggle={async (id) => { const s = services.find(x => x.id === id); await db.table('services').update(id, { active: !s?.active }); fetchInitialData(user!.id); }} onDelete={async (id) => { await db.table('services').delete(id); fetchInitialData(user!.id); }} />;
      case 'clients': return <ClientsPage {...props} clients={clients} appointments={appointments} />;
      case 'marketing': return <MarketingPage {...props} services={services} />;
      case 'finance': return <ReportsPage {...props} appointments={appointments} services={services} config={businessConfig} />;
      case 'company': return <ProfilePage {...props} onUpdate={async (u) => { await db.table('professionals').update(user!.id, { ...u, business_name: u.businessName }); fetchInitialData(user!.id); return true; }} />;
      case 'settings': return <SettingsPage {...props} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={async (c) => { await db.table('business_config').updateWhere({ professional_id: user?.id }, { interval: c.interval, theme_color: c.themeColor, expediente: c.expediente }); fetchInitialData(user!.id); }} />;
      case 'apps': return <AppsPage {...props} />;
      case 'login': return <AuthView type="login" onAuth={(u) => fetchInitialData(u.id)} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={(u) => fetchInitialData(u.id)} onToggle={() => navigate('login')} />;
      default: return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden relative">
      {user && !isPublicView && <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />}
      <div className="flex-grow flex flex-col relative h-full">
        {user && !isPublicView && <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />}
        <div className="flex-grow pb-20 md:pb-0 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
        {user && !isPublicView && <BottomNav activeView={currentView} navigate={navigate} />}
      </div>
    </div>
  );
};

export default App;