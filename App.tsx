
import React, { useState, useEffect, useCallback } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
import { db, generateSlug } from './services/db.ts';
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
  
  // Estados Admin
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [inactivations, setInactivations] = useState<any[]>([]);

  // Estados Visão Pública
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

  useEffect(() => {
    const init = () => {
      const pathSlug = window.location.pathname.split('/').filter(Boolean)[0];
      const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'company', 'settings', 'inactivation', 'recurring', 'apps', 'finance'];
      
      if (pathSlug && !protectedRoutes.includes(pathSlug) && !pathSlug.includes('.')) {
        handlePublicBooking(pathSlug);
      } else {
        checkAuthSession();
      }
    };
    init();
  }, []);

  const checkAuthSession = () => {
    const session = db.auth.getSession();
    if (session) {
      fetchInitialData(session.user.id);
    } else {
      setIsLoading(false);
    }
  };

  const fetchInitialData = (userId: string) => {
    setIsLoading(true);
    try {
      const prof = db.table('professionals').find({ id: userId });
      if (prof) {
        setUser(prof);
        setServices(db.table('services').where({ professional_id: userId }));
        setAppointments(db.table('appointments').where({ professional_id: userId }));
        setClients(db.table('clients').where({ professional_id: userId }));
        setBusinessConfig(db.table('business_config').find({ professional_id: userId }));
        setInactivations(db.table('blocked_dates').where({ professional_id: userId }));
        // Em um cenário SaaS real, buscaríamos profissionais do mesmo businessName
        setProfessionals(db.table('professionals').where({ businessName: prof.businessName }));
      }

      if (['landing', 'login', 'signup'].includes(currentView)) navigate('dashboard');
    } catch (e) { 
      console.error("Erro ao carregar dados:", e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleSaveAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const profId = user?.id || publicProfessional?.id;
    if (!profId) return;
    
    // Atualiza ou cria cliente
    const client = db.table('clients').find({ phone: appt.clientPhone, professional_id: profId });
    if (client) {
      db.table('clients').update(client.id, { 
        totalBookings: (client.totalBookings || 0) + 1, 
        lastVisit: new Date().toISOString() 
      });
    } else {
      db.table('clients').insert({ 
        professional_id: profId, 
        name: appt.clientName, 
        phone: appt.clientPhone, 
        totalBookings: 1, 
        lastVisit: new Date().toISOString() 
      });
    }
    
    db.table('appointments').insert({ ...appt, professional_id: profId });
    if (user?.id) fetchInitialData(user.id);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    db.table('appointments').update(id, { status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleUpdateConfig = (c: BusinessConfig) => {
    if (!user?.id) return;
    db.table('business_config').updateWhere({ professional_id: user.id }, c);
    setBusinessConfig(c);
  };

  const handlePublicBooking = (slug: string) => {
    setIsLoading(true);
    const cleanSlug = generateSlug(slug);
    const prof = db.table('professionals').find({ slug: cleanSlug });
    if (prof) {
      setPublicProfessional(prof);
      setPublicServices(db.table('services').where({ professional_id: prof.id, active: true }));
      setPublicConfig(db.table('business_config').find({ professional_id: prof.id }) || { interval: 60, expediente: [] });
      setPublicAppointments(db.table('appointments').where({ professional_id: prof.id }));
      setPublicInactivations(db.table('blocked_dates').where({ professional_id: prof.id }));
      setIsPublicView(true);
      setCurrentView('booking');
    } else {
      checkAuthSession();
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    db.auth.logout();
    setUser(null);
    setIsPublicView(false);
    navigate('landing');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin"></div></div>;

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
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} onAddManualAppointment={handleSaveAppointment} inactivations={inactivations} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={(s) => { db.table('services').insert({ ...s, professional_id: user?.id }); fetchInitialData(user?.id!) }} onDelete={(id) => { db.table('services').delete(id); fetchInitialData(user?.id!) }} onToggle={(id) => { const s = services.find(sv => sv.id === id); db.table('services').update(id, { active: !s?.active }); fetchInitialData(user?.id!) }} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={async (u) => { db.table('professionals').update(user?.id!, u); setUser(u); return true; }} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'finance': return <ReportsPage {...commonProps} appointments={appointments} services={services} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={professionals} onAdd={(p) => { db.table('professionals').insert(p); fetchInitialData(user?.id!) }} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={async (d) => { db.table('blocked_dates').insert({...d, professional_id: user?.id}); fetchInitialData(user?.id!) }} onDelete={async (id) => { db.table('blocked_dates').delete(id); fetchInitialData(user?.id!) }} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      case 'apps': return <AppsPage {...commonProps} />;
      case 'login': return <AuthView type="login" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('login')} />;
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
