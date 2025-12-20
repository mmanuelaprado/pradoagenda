
import React, { useState, useEffect, useCallback } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
import { supabase } from './services/supabaseClient.ts';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States de dados administrativos
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<Professional[]>([]);
  const [inactivations, setInactivations] = useState<any[]>([]);

  // States para visão pública
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicProfessional, setPublicProfessional] = useState<Professional | null>(null);
  const [publicServices, setPublicServices] = useState<Service[]>([]);
  const [publicConfig, setPublicConfig] = useState<BusinessConfig>({ interval: 60, expediente: [] });

  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    if ('vibrate' in navigator) navigator.vibrate(5);
  }, []);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('b');
      if (slug) await handlePublicBooking(slug);
      else await checkAuthSession();
    };
    init();
  }, []);

  const checkAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchInitialData(session.user.id);
    else setIsLoading(false);
  };

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: prof } = await supabase.from('professionals').select('*').eq('id', userId).maybeSingle();
      if (prof) {
        setUser({
          name: prof.name,
          businessName: prof.business_name,
          email: prof.email,
          slug: prof.slug || '',
          bio: prof.bio || '',
          instagram: prof.instagram || ''
        });
      }

      const { data: svcs } = await supabase.from('services').select('*').eq('professional_id', userId).order('created_at', { ascending: true });
      if (svcs) setServices(svcs.map(s => ({ ...s, price: Number(s.price) })));

      const { data: appts } = await supabase.from('appointments').select('*').eq('professional_id', userId).order('date', { ascending: true });
      if (appts) setAppointments(appts.map(a => ({ ...a, serviceId: a.service_id, clientName: a.client_name, clientPhone: a.client_phone })));

      const { data: clts } = await supabase.from('clients').select('*').eq('professional_id', userId);
      if (clts) setClients(clts.map(c => ({ ...c, totalBookings: c.total_bookings, lastVisit: c.last_visit })));

      const { data: cfg } = await supabase.from('business_config').select('*').eq('professional_id', userId).maybeSingle();
      if (cfg) setBusinessConfig({ interval: cfg.interval, expediente: cfg.expediente });

      const { data: team } = await supabase.from('team_members').select('*').eq('owner_id', userId);
      if (team) setTeamMembers(team.map(t => ({ name: t.name, email: t.email, businessName: prof?.business_name || '', slug: t.slug })));

      const { data: inact } = await supabase.from('blocked_dates').select('*').eq('professional_id', userId);
      if (inact) setInactivations(inact);

      if (currentView === 'landing' || currentView === 'login' || currentView === 'signup') {
        navigate('dashboard');
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS DE PERSISTÊNCIA
  const handleUpdateProfile = async (updatedData: Professional) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return false;
    const finalSlug = updatedData.slug.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('professionals').update({
      name: updatedData.name, business_name: updatedData.businessName, slug: finalSlug, bio: updatedData.bio, instagram: updatedData.instagram, email: updatedData.email
    }).eq('id', authUser.id);
    if (!error) { setUser({ ...updatedData, slug: finalSlug }); return true; }
    return false;
  };

  const handleAddService = async (service: Omit<Service, 'id'>) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from('services').insert([{
      professional_id: authUser.id, name: service.name, description: service.description, duration: service.duration, price: service.price, active: true
    }]).select().single();
    if (!error && data) setServices([...services, { ...data, price: Number(data.price) }]);
  };

  const handleToggleService = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    const { error } = await supabase.from('services').update({ active: !service.active }).eq('id', id);
    if (!error) setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) setServices(services.filter(s => s.id !== id));
  };

  const handleUpdateConfig = async (newConfig: BusinessConfig) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { error } = await supabase.from('business_config').upsert({
      professional_id: authUser.id, interval: newConfig.interval, expediente: newConfig.expediente
    }, { onConflict: 'professional_id' });
    if (!error) setBusinessConfig(newConfig);
  };

  const handleAddInactivation = async (inact: { date: string, description: string }) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from('blocked_dates').insert([{
      professional_id: authUser.id, date: inact.date, description: inact.description, type: 'full'
    }]).select().single();
    if (!error && data) setInactivations([...inactivations, data]);
  };

  const handleDeleteInactivation = async (id: string) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (!error) setInactivations(inactivations.filter(i => i.id !== id));
  };

  const handleAddTeamMember = async (member: Professional) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { error } = await supabase.from('team_members').insert([{
      owner_id: authUser.id, name: member.name, email: member.email, slug: member.slug
    }]);
    if (!error) setTeamMembers([...teamMembers, member]);
  };

  const handleAddManualAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    
    // Salvar ou atualizar cliente
    const { data: clientData } = await supabase.from('clients').select('id, total_bookings').eq('phone', appt.clientPhone).eq('professional_id', authUser.id).maybeSingle();
    if (clientData) {
      await supabase.from('clients').update({ total_bookings: (clientData.total_bookings || 0) + 1, last_visit: new Date().toISOString() }).eq('id', clientData.id);
    } else {
      await supabase.from('clients').insert([{ professional_id: authUser.id, name: appt.clientName, phone: appt.clientPhone, total_bookings: 1, last_visit: new Date().toISOString() }]);
    }

    const { data, error } = await supabase.from('appointments').insert([{
      professional_id: authUser.id, service_id: appt.serviceId, client_name: appt.clientName, client_phone: appt.clientPhone, date: appt.date, status: 'confirmed'
    }]).select().single();

    if (!error && data) {
      setAppointments([...appointments, { ...data, serviceId: data.service_id, clientName: data.client_name, clientPhone: data.client_phone }]);
      await fetchInitialData(authUser.id); // Recarregar para atualizar lista de clientes
    }
  };

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const handlePublicBooking = async (slug: string) => {
    setIsLoading(true);
    try {
      const { data: prof } = await supabase.from('professionals').select('*').eq('slug', slug).maybeSingle();
      if (prof) {
        setPublicProfessional({ name: prof.name, businessName: prof.business_name, email: prof.email, slug: prof.slug, bio: prof.bio, instagram: prof.instagram });
        const { data: svcs } = await supabase.from('services').select('*').eq('professional_id', prof.id).eq('active', true);
        if (svcs) setPublicServices(svcs);
        const { data: cfg } = await supabase.from('business_config').select('*').eq('professional_id', prof.id).maybeSingle();
        if (cfg) setPublicConfig({ interval: cfg.interval, expediente: cfg.expediente });
        setIsPublicView(true);
        setCurrentView('booking');
      } else {
        await checkAuthSession();
      }
    } catch (err) {
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
        await supabase.from('clients').update({ total_bookings: (clientData.total_bookings || 0) + 1, last_visit: new Date().toISOString() }).eq('id', clientData.id);
      } else {
        await supabase.from('clients').insert([{ professional_id: prof.id, name: appt.clientName, phone: appt.clientPhone, total_bookings: 1, last_visit: new Date().toISOString() }]);
      }
      await supabase.from('appointments').insert([{ professional_id: prof.id, service_id: appt.serviceId, client_name: appt.clientName, client_phone: appt.clientPhone, date: appt.date, status: 'pending' }]);
    } catch (err) {
      console.error("Erro no salvamento público:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setServices([]);
    setAppointments([]);
    setClients([]);
    setBusinessConfig(null);
    setTeamMembers([]);
    setInactivations([]);
    navigate('landing');
  };

  const renderCurrentView = () => {
    if (isPublicView && publicProfessional) {
      return <BookingPage professional={publicProfessional} services={publicServices} config={publicConfig} onComplete={handlePublicComplete} onHome={() => window.location.href = '/'} />;
    }
    const commonProps = { user, onLogout: handleLogout, navigate };
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={handleAddManualAppointment} onUpdateStatus={handleUpdateStatus} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={handleAddService} onToggle={handleToggleService} onDelete={handleDeleteService} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={handleUpdateProfile} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'inactivation': return <InactivationPage {...commonProps} inactivations={inactivations} onAdd={handleAddInactivation} onDelete={handleDeleteInactivation} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={teamMembers} onAdd={handleAddTeamMember} />;
      case 'apps': return <AppsPage {...commonProps} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      default: return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col relative h-full">
        <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />
        <div className="flex-grow pb-20 md:pb-12 overflow-y-auto scroll-smooth custom-scrollbar relative">
          {renderCurrentView()}
        </div>
        <BottomNav activeView={currentView} navigate={navigate} />
      </div>
    </div>
  );
};

export default App;
