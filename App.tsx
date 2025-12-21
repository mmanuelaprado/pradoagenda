
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publicError, setPublicError] = useState(false);

  // Estados Admin
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
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
    // Se não for uma slug de empresa, limpa a URL visualmente para o admin
    if (v !== 'booking' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const init = () => {
      // Captura o slug da URL (ex: pradoagenda.com/salao-ana -> salao-ana)
      const pathSlug = window.location.pathname.split('/').filter(Boolean)[0];
      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get('b'); // Mantém suporte legado por garantia
      
      const slug = pathSlug || querySlug;

      // Lista de rotas protegidas que não devem ser tratadas como slug de empresa
      const protectedRoutes = ['dashboard', 'login', 'signup', 'agenda', 'services', 'clients', 'company', 'settings', 'inactivation', 'recurring', 'apps'];

      if (slug && !protectedRoutes.includes(slug)) {
        handlePublicBooking(slug);
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
      const professional = db.table('professionals').find({ id: userId });
      const userServices = db.table('services').where({ professional_id: userId });
      const userAppts = db.table('appointments').where({ professional_id: userId });
      const userClients = db.table('clients').where({ professional_id: userId });
      const userConfig = db.table('business_config').find({ professional_id: userId });
      const userInacts = db.table('blocked_dates').where({ professional_id: userId });

      if (professional) setUser(professional);
      setServices(userServices);
      setAppointments(userAppts);
      setClients(userClients);
      if (userConfig) setBusinessConfig(userConfig);
      setInactivations(userInacts);

      if (['landing', 'login', 'signup'].includes(currentView)) navigate('dashboard');
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSaveAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const profId = user?.id || publicProfessional?.id;
    if (!profId) return;

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
    
    if (user?.id === profId) {
      fetchInitialData(profId);
    }
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    db.table('appointments').update(id, { status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleAddService = (s: Omit<Service, 'id'>) => {
    const session = db.auth.getSession();
    if (!session) return;
    const newItem = db.table('services').insert({ ...s, professional_id: session.user.id });
    setServices(prev => [...prev, newItem]);
  };

  const handleDeleteService = (id: string) => {
    db.table('services').delete(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleService = (id: string) => {
    const s = services.find(sv => sv.id === id);
    if (!s) return;
    db.table('services').update(id, { active: !s.active });
    setServices(prev => prev.map(sv => sv.id === id ? { ...sv, active: !sv.active } : sv));
  };

  const handleUpdateProfile = (u: Professional) => {
    const session = db.auth.getSession();
    if (!session) return false;
    db.table('professionals').update(session.user.id, u);
    setUser(u);
    return true;
  };

  const handleUpdateConfig = (c: BusinessConfig) => {
    const session = db.auth.getSession();
    if (!session) return;
    db.table('business_config').updateWhere({ professional_id: session.user.id }, c);
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
      setPublicError(false);
    } else {
      setIsPublicView(false);
      setPublicError(true);
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
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={handleAddService} onDelete={handleDeleteService} onToggle={handleToggleService} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={async (u) => handleUpdateProfile(u)} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={async (d) => { db.table('blocked_dates').insert({...d, professional_id: user?.id}); fetchInitialData(user?.id!) }} onDelete={async (id) => { db.table('blocked_dates').delete(id); fetchInitialData(user?.id!) }} />;
      case 'login': return <AuthView type="login" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={() => fetchInitialData(db.auth.getSession()?.user.id)} onToggle={() => navigate('login')} />;
      case 'landing': return (
        <div className="flex flex-col">
          {publicError && (
            <div className="bg-red-500 text-white p-4 text-center font-black text-[10px] uppercase tracking-widest animate-fade-in">
              Agenda não encontrada. Verifique se você está no mesmo navegador onde criou sua conta.
            </div>
          )}
          <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />
        </div>
      );
      default: return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
    }
  };

  if (isPublicView || (!user && ['landing', 'login', 'signup'].includes(currentView))) {
    return <div className="min-h-screen bg-white w-full">{renderViewContent()}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col relative h-full">
        <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />
        <div className="flex-grow pb-20 md:pb-12 overflow-y-auto custom-scrollbar">
          {renderViewContent()}
        </div>
        <BottomNav activeView={currentView} navigate={navigate} />
      </div>
    </div>
  );
};

export default App;
