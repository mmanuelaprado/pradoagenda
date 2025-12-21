
import React, { useState, useEffect, useCallback } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
import { supabase } from './services/supabaseClient.ts';
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('b');
      if (slug) {
        await handlePublicBooking(slug);
      } else {
        await checkAuthSession();
      }
    };
    init();
  }, []);

  const checkAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchInitialData(session.user.id);
    } else {
      setIsLoading(false);
    }
  };

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    try {
      const profRes = await supabase.from('professionals').eq('id', userId).maybeSingle();
      // Fixed: Removed redundant .then(r => r) calls which were causing TS errors
      const servicesRes = await supabase.from('services').eq('professional_id', userId);
      const apptsRes = await supabase.from('appointments').eq('professional_id', userId);
      const clientsRes = await supabase.from('clients').eq('professional_id', userId);
      const configRes = await supabase.from('business_config').eq('professional_id', userId).maybeSingle();
      const inactRes = await supabase.from('blocked_dates').eq('professional_id', userId);

      if (profRes.data) setUser(profRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (apptsRes.data) setAppointments(apptsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (configRes.data) setBusinessConfig(configRes.data);
      if (inactRes.data) setInactivations(inactRes.data);

      if (['landing', 'login', 'signup'].includes(currentView)) navigate('dashboard');
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  // --- HANDLERS DE PERSISTÊNCIA ---

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await supabase.from('appointments').eq('id', id).update({ status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleAddService = async (s: Omit<Service, 'id'>) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data } = await supabase.from('services').insert([{ ...s, professional_id: userId }]);
    if (data) setServices(prev => [...prev, data[0]]);
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from('services').eq('id', id).delete();
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleService = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    await supabase.from('services').eq('id', id).update({ active: !service.active });
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleUpdateProfile = async (u: Professional) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('professionals').eq('id', userId).update(u);
    setUser(u);
    return true;
  };

  const handleUpdateConfig = async (c: BusinessConfig) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('business_config').eq('professional_id', userId).update(c);
    setBusinessConfig(c);
  };

  // --- LÓGICA PÚBLICA (CLIENTE) ---

  const handlePublicBooking = async (slug: string) => {
    setIsLoading(true);
    const { data: prof } = await supabase.from('professionals').eq('slug', slug).maybeSingle();
    if (prof) {
      // Fixed: Removed redundant .then(r => r) calls which were causing TS errors
      const [svcs, cfg, appts, inacts] = await Promise.all([
        supabase.from('services').eq('professional_id', prof.id).eq('active', true),
        supabase.from('business_config').eq('professional_id', prof.id).maybeSingle(),
        supabase.from('appointments').eq('professional_id', prof.id).neq('status', 'cancelled'),
        supabase.from('blocked_dates').eq('professional_id', prof.id)
      ]);
      setPublicProfessional(prof);
      setPublicServices(svcs.data || []);
      setPublicConfig(cfg.data || { interval: 60, expediente: [] });
      setPublicAppointments(appts.data || []);
      setPublicInactivations(inacts.data || []);
      setIsPublicView(true);
      setCurrentView('booking');
    } else {
      setIsPublicView(false);
      await checkAuthSession();
    }
    setIsLoading(false);
  };

  const handlePublicComplete = async (appt: Omit<Appointment, 'id'>) => {
    const profId = publicProfessional?.id || (await supabase.from('professionals').eq('slug', publicProfessional?.slug).single()).data.id;
    
    // CRM: Criar ou atualizar cliente
    // Fixed: Removed redundant .then(r => r) call
    const { data: existingClients } = await supabase.from('clients').eq('phone', appt.clientPhone).eq('professional_id', profId);
    const client = existingClients?.[0];
    if (client) {
      await supabase.from('clients').eq('id', client.id).update({ 
        total_bookings: (client.total_bookings || 0) + 1, 
        last_visit: new Date().toISOString() 
      });
    } else {
      await supabase.from('clients').insert([{ 
        professional_id: profId, name: appt.clientName, phone: appt.clientPhone, total_bookings: 1, last_visit: new Date().toISOString() 
      }]);
    }

    // Salvar agendamento
    await supabase.from('appointments').insert([{ ...appt, professional_id: profId }]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          onComplete={handlePublicComplete} onHome={() => window.location.href = window.location.origin} 
        />
      );
    }

    const commonProps = { user, onLogout: handleLogout, navigate };

    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} onAddManualAppointment={handlePublicComplete} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={handleAddService} onDelete={handleDeleteService} onToggle={handleToggleService} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={handleUpdateProfile} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={async (d) => { await supabase.from('blocked_dates').insert([{...d, professional_id: (await supabase.auth.getUser()).data.user?.id}]); fetchInitialData(user?.id!) }} onDelete={async (id) => { await supabase.from('blocked_dates').eq('id', id).delete(); fetchInitialData(user?.id!) }} />;
      case 'login': return <AuthView type="login" onAuth={() => {}} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={() => {}} onToggle={() => navigate('login')} />;
      case 'landing': return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
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
