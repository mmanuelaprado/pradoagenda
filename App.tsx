
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchInitialData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchInitialData(session.user.id);
      } else {
        setUser(null);
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Perfil Profissional
      const { data: prof } = await supabase.from('professionals').select('*').eq('id', userId).single();
      if (prof) setUser(prof);

      // 2. Serviços
      const { data: svcs } = await supabase.from('services').select('*').eq('professional_id', userId);
      if (svcs) setServices(svcs);

      // 3. Agendamentos
      const { data: appts } = await supabase.from('appointments').select('*').eq('professional_id', userId);
      if (appts) setAppointments(appts);

      // 4. Clientes
      const { data: clts } = await supabase.from('clients').select('*').eq('professional_id', userId);
      if (clts) setClients(clts);

      // 5. Configuração
      const { data: cfg } = await supabase.from('business_config').select('*').eq('professional_id', userId).single();
      if (cfg) setBusinessConfig(cfg);

      navigate('dashboard');
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

  const handleAddService = async (s: Omit<Service, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('services')
      .insert([{ ...s, professional_id: user.id }])
      .select()
      .single();

    if (data) setServices([...services, data]);
  };

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('appointments')
      .insert([{ ...appt, professional_id: user.id }])
      .select()
      .single();

    if (data) setAppointments([...appointments, data]);
  };

  const renderCurrentView = () => {
    const commonProps = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={handleAddManualAppointment} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={handleAddService} onToggle={() => {}} onDelete={() => {}} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={() => {}} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 30, expediente: [] }} onUpdateConfig={() => {}} />;
      case 'apps': return <AppsPage {...commonProps} />;
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
