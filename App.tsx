
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
import ReportsPage from './views/ReportsPage.tsx';
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

  // States de dados
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    if ('vibrate' in navigator) navigator.vibrate(5);
  }, []);

  // Monitorar Autenticação
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchInitialData(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchInitialData(session.user.id);
      } else {
        setUser(null);
        setCurrentView('landing');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Perfil Profissional
      const { data: prof } = await supabase.from('professionals').select('*').eq('id', userId).maybeSingle();
      if (prof) {
        setUser({
          name: prof.name,
          businessName: prof.business_name,
          email: prof.email,
          slug: prof.slug,
          bio: prof.bio || '',
          instagram: prof.instagram || ''
        });
      }

      // 2. Serviços
      const { data: svcs } = await supabase.from('services').select('*').eq('professional_id', userId).order('created_at', { ascending: true });
      if (svcs) {
        setServices(svcs.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: Number(s.price),
          active: s.active
        })));
      }

      // 3. Agendamentos
      const { data: appts } = await supabase.from('appointments').select('*').eq('professional_id', userId).order('date', { ascending: true });
      if (appts) {
        setAppointments(appts.map(a => ({
          id: a.id,
          serviceId: a.service_id,
          clientName: a.client_name,
          clientPhone: a.client_phone,
          date: a.date,
          status: a.status
        })));
      }

      // 4. Clientes
      const { data: clts } = await supabase.from('clients').select('*').eq('professional_id', userId);
      if (clts) {
        setClients(clts.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          totalBookings: c.total_bookings,
          lastVisit: c.last_visit
        })));
      }

      // 5. Configuração
      const { data: cfg } = await supabase.from('business_config').select('*').eq('professional_id', userId).maybeSingle();
      if (cfg) {
        setBusinessConfig({
          interval: cfg.interval,
          expediente: cfg.expediente
        });
      }

      if (currentView === 'landing' || currentView === 'login' || currentView === 'signup') {
        navigate('dashboard');
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setServices([]);
    setAppointments([]);
    setClients([]);
    setBusinessConfig(null);
    navigate('landing');
  };

  // --- Handlers de Serviços ---
  const handleAddService = async (s: Omit<Service, 'id'>) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('services')
      .insert([{ 
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        active: s.active,
        professional_id: authUser.id 
      }])
      .select()
      .single();

    if (data) {
      setServices([...services, {
        id: data.id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: Number(data.price),
        active: data.active
      }]);
    }
  };

  const handleToggleService = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;

    const { error } = await supabase
      .from('services')
      .update({ active: !service.active })
      .eq('id', id);

    if (!error) {
      setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  // --- Handlers de Perfil ---
  const handleUpdateProfile = async (u: Professional) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('professionals')
      .update({
        name: u.name,
        business_name: u.businessName,
        slug: u.slug,
        bio: u.bio,
        instagram: u.instagram
      })
      .eq('id', authUser.id);

    if (!error) {
      setUser(u);
    }
  };

  // --- Handlers de Configuração ---
  const handleUpdateConfig = async (c: BusinessConfig) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('business_config')
      .upsert({
        professional_id: authUser.id,
        interval: c.interval,
        expediente: c.expediente
      });

    if (!error) {
      setBusinessConfig(c);
    }
  };

  // --- Handlers de Agendamentos ---
  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const handleAddManualAppointment = async (appt: Omit<Appointment, 'id'>) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('appointments')
      .insert([{ 
        service_id: appt.serviceId,
        client_name: appt.clientName,
        client_phone: appt.clientPhone,
        date: appt.date,
        status: appt.status,
        professional_id: authUser.id 
      }])
      .select()
      .single();

    if (data) {
      setAppointments([...appointments, {
        id: data.id,
        serviceId: data.service_id,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        date: data.date,
        status: data.status
      }]);
      
      // Atualizar lista de clientes localmente (opcional, já que fetch inicial cuida disso no próximo load)
      if (!clients.some(c => c.phone === appt.clientPhone)) {
         // Em um app real, aqui dispararíamos uma criação na tabela 'clients' via trigger no Supabase
         // ou manualmente aqui.
      }
    }
  };

  const renderCurrentView = () => {
    const commonProps = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={handleAddManualAppointment} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={handleAddService} onToggle={handleToggleService} onDelete={handleDeleteService} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={handleUpdateProfile} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={handleUpdateConfig} />;
      case 'apps': return <AppsPage {...commonProps} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      case 'inactivation': return <InactivationPage {...commonProps} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={[]} onAdd={() => {}} />;
      default: return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'landing') return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
  if (currentView === 'login') return <AuthView type="login" onAuth={() => {}} onToggle={() => navigate('signup')} />;
  if (currentView === 'signup') return <AuthView type="signup" onAuth={() => {}} onToggle={() => navigate('login')} />;
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeView={currentView} navigate={navigate} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col relative h-full">
        <MobileHeader user={user} navigate={navigate} onLogout={handleLogout} />
        <div className="flex-grow pb-20 md:pb-0 overflow-y-auto scroll-smooth custom-scrollbar">
          {renderCurrentView()}
        </div>
        <BottomNav activeView={currentView} navigate={navigate} />
      </div>
    </div>
  );
};

export default App;
