
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
  const [teamMembers, setTeamMembers] = useState<Professional[]>([]);
  const [inactivations, setInactivations] = useState<any[]>([]);

  // Estados Visão Pública (Link do Cliente)
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicProfessional, setPublicProfessional] = useState<Professional | null>(null);
  const [publicServices, setPublicServices] = useState<Service[]>([]);
  const [publicConfig, setPublicConfig] = useState<BusinessConfig>({ interval: 60, expediente: [] });
  const [publicAppointments, setPublicAppointments] = useState<Appointment[]>([]);
  const [publicInactivations, setPublicInactivations] = useState<any[]>([]);

  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    if ('vibrate' in navigator) navigator.vibrate(5);
  }, []);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('b');
      
      if (slug) {
        // PRIORIDADE MÁXIMA: Se for link de agendamento, bloqueia a visão pública e não tenta carregar Admin
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
      const [profRes, servicesRes, apptsRes, clientsRes, configRes, teamRes, inactRes] = await Promise.all([
        supabase.from('professionals').select('*').eq('id', userId).maybeSingle(),
        supabase.from('services').select('*').eq('professional_id', userId).order('created_at', { ascending: true }),
        supabase.from('appointments').select('*').eq('professional_id', userId).order('date', { ascending: true }),
        supabase.from('clients').select('*').eq('professional_id', userId),
        supabase.from('business_config').select('*').eq('professional_id', userId).maybeSingle(),
        supabase.from('team_members').select('*').eq('owner_id', userId),
        supabase.from('blocked_dates').select('*').eq('professional_id', userId)
      ]);

      if (profRes.data) {
        setUser({
          name: profRes.data.name,
          businessName: profRes.data.business_name,
          email: profRes.data.email,
          slug: profRes.data.slug || '',
          bio: profRes.data.bio || '',
          instagram: profRes.data.instagram || ''
        });
      }

      if (servicesRes.data) setServices(servicesRes.data.map(s => ({ ...s, price: Number(s.price) })));
      if (apptsRes.data) setAppointments(apptsRes.data.map(a => ({ ...a, serviceId: a.service_id, clientName: a.client_name, clientPhone: a.client_phone })));
      if (clientsRes.data) setClients(clientsRes.data.map(c => ({ ...c, totalBookings: c.total_bookings, lastVisit: c.last_visit })));
      if (configRes.data) setBusinessConfig({ interval: configRes.data.interval, expediente: configRes.data.expediente });
      if (teamRes.data) setTeamMembers(teamRes.data.map(t => ({ name: t.name, email: t.email, businessName: profRes.data?.business_name || '', slug: t.slug })));
      if (inactRes.data) setInactivations(inactRes.data);

      if (['landing', 'login', 'signup'].includes(currentView)) {
        navigate('dashboard');
      }
    } catch (error) {
      console.error("Erro ao carregar dados admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicBooking = async (slug: string) => {
    setIsLoading(true);
    try {
      // Busca dados mínimos do profissional para agendamento
      const { data: prof } = await supabase.from('professionals').select('id, name, business_name, slug, bio, instagram').eq('slug', slug).maybeSingle();
      
      if (prof) {
        setPublicProfessional({ 
          name: prof.name, 
          businessName: prof.business_name, 
          email: '', // Não expõe e-mail do admin para o público
          slug: prof.slug, 
          bio: prof.bio, 
          instagram: prof.instagram 
        });

        const [svcs, cfg, appts, inacts] = await Promise.all([
          supabase.from('services').select('id, name, description, duration, price, active').eq('professional_id', prof.id).eq('active', true),
          supabase.from('business_config').select('interval, expediente').eq('professional_id', prof.id).maybeSingle(),
          supabase.from('appointments').select('date, service_id').eq('professional_id', prof.id).filter('status', 'neq', 'cancelled'),
          supabase.from('blocked_dates').select('date').eq('professional_id', prof.id)
        ]);

        if (svcs.data) setPublicServices(svcs.data.map(s => ({ ...s, price: Number(s.price) })));
        if (cfg.data) setPublicConfig({ interval: cfg.data.interval, expediente: cfg.data.expediente });
        if (appts.data) setPublicAppointments(appts.data.map(a => ({ ...a, serviceId: a.service_id } as Appointment)));
        if (inacts.data) setPublicInactivations(inacts.data);

        setIsPublicView(true);
        setCurrentView('booking');
      } else {
        setIsPublicView(false);
        await checkAuthSession();
      }
    } catch (err) {
      console.error("Erro na busca pública:", err);
      setIsPublicView(false);
      await checkAuthSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicComplete = async (appt: Omit<Appointment, 'id'>) => {
    try {
      const { data: prof } = await supabase.from('professionals').select('id').eq('slug', publicProfessional?.slug).single();
      if (!prof) return;

      const { data: clientData } = await supabase.from('clients').select('id, total_bookings').eq('phone', appt.clientPhone).eq('professional_id', prof.id).maybeSingle();
      
      if (clientData) {
        await supabase.from('clients').update({ 
          total_bookings: (clientData.total_bookings || 0) + 1, 
          last_visit: new Date().toISOString() 
        }).eq('id', clientData.id);
      } else {
        await supabase.from('clients').insert([{ 
          professional_id: prof.id, 
          name: appt.clientName, 
          phone: appt.clientPhone, 
          total_bookings: 1, 
          last_visit: new Date().toISOString() 
        }]);
      }

      await supabase.from('appointments').insert([{ 
        professional_id: prof.id, 
        service_id: appt.serviceId, 
        client_name: appt.clientName, 
        client_phone: appt.clientPhone, 
        date: appt.date, 
        status: 'pending' 
      }]);

    } catch (err) {
      console.error("Erro ao salvar agendamento público:", err);
    }
  };

  const handleUpdateProfile = async (u: Professional) => {
     const { data: { user: authUser } } = await supabase.auth.getUser();
     if (!authUser) return false;
     const { error } = await supabase.from('professionals').update({
       name: u.name, business_name: u.businessName, slug: u.slug, bio: u.bio, instagram: u.instagram
     }).eq('id', authUser.id);
     if (!error) { setUser(u); return true; }
     return false;
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
          professional={publicProfessional} 
          services={publicServices} 
          config={publicConfig} 
          appointments={publicAppointments}
          inactivations={publicInactivations}
          onComplete={handlePublicComplete} 
          onHome={() => { window.location.href = window.location.origin; }} 
        />
      );
    }

    const commonProps = { user, onLogout: handleLogout, navigate };

    switch (currentView) {
      case 'landing': return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
      case 'login': return <AuthView type="login" onAuth={() => {}} onToggle={() => navigate('signup')} />;
      case 'signup': return <AuthView type="signup" onAuth={() => {}} onToggle={() => navigate('login')} />;
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={() => {}} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={() => {}} onUpdateStatus={() => {}} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={() => {}} onToggle={() => {}} onDelete={() => {}} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={handleUpdateProfile} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={() => {}} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={async () => {}} onDelete={async () => {}} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={teamMembers} onAdd={() => {}} />;
      case 'apps': return <AppsPage {...commonProps} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      default: return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
    }
  };

  // --- RENDERIZAÇÃO CRÍTICA PARA ISOLAMENTO ---

  // 1. Se for visão de link de agendamento (CLIENTE), não renderiza shell administrativo
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        {renderViewContent()}
      </div>
    );
  }

  // 2. Se for Landing ou Auth (PÚBLICO), também não renderiza shell administrativo
  if (!user && ['landing', 'login', 'signup'].includes(currentView)) {
    return (
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        {renderViewContent()}
      </div>
    );
  }

  // 3. Visão do Profissional (ADMIN) com Sidebar e Navegação
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col relative h-full">
        <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />
        <div className="flex-grow pb-20 md:pb-12 overflow-y-auto scroll-smooth custom-scrollbar relative">
          {renderViewContent()}
        </div>
        <BottomNav activeView={currentView} navigate={navigate} />
      </div>
    </div>
  );
};

export default App;
