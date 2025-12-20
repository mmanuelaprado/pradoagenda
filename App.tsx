
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

  // States para visão pública (cliente agendando)
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicProfessional, setPublicProfessional] = useState<Professional | null>(null);
  const [publicServices, setPublicServices] = useState<Service[]>([]);
  const [publicConfig, setPublicConfig] = useState<BusinessConfig>({ interval: 60, expediente: [] });

  // States de dados administrativos
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const whatsappLink = "https://wa.me/5571996463245";

  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    if ('vibrate' in navigator) navigator.vibrate(5);
  }, []);

  // Lógica principal de roteamento (Link Público vs Admin)
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

  const handlePublicBooking = async (slug: string) => {
    setIsLoading(true);
    try {
      const { data: prof, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (prof) {
        setPublicProfessional({
          name: prof.name,
          businessName: prof.business_name,
          email: prof.email,
          slug: prof.slug,
          bio: prof.bio,
          instagram: prof.instagram
        });

        const { data: svcs } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', prof.id)
          .eq('active', true);
        
        if (svcs) setPublicServices(svcs);

        const { data: cfg } = await supabase
          .from('business_config')
          .select('*')
          .eq('professional_id', prof.id)
          .maybeSingle();
        
        if (cfg) setPublicConfig({ interval: cfg.interval, expediente: cfg.expediente });

        setIsPublicView(true);
        setCurrentView('booking');
      } else {
        await checkAuthSession();
      }
    } catch (err) {
      console.error("Erro no carregamento público:", err);
      await checkAuthSession();
    } finally {
      setIsLoading(false);
    }
  };

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

      const { data: svcs } = await supabase.from('services').select('*').eq('professional_id', userId).order('created_at', { ascending: true });
      if (svcs) setServices(svcs.map(s => ({ ...s, price: Number(s.price) })));

      const { data: appts } = await supabase.from('appointments').select('*').eq('professional_id', userId).order('date', { ascending: true });
      if (appts) setAppointments(appts.map(a => ({ ...a, serviceId: a.service_id, clientName: a.client_name, clientPhone: a.client_phone })));

      const { data: clts } = await supabase.from('clients').select('*').eq('professional_id', userId);
      if (clts) setClients(clts.map(c => ({ ...c, totalBookings: c.total_bookings, lastVisit: c.last_visit })));

      const { data: cfg } = await supabase.from('business_config').select('*').eq('professional_id', userId).maybeSingle();
      if (cfg) setBusinessConfig({ interval: cfg.interval, expediente: cfg.expediente });

      if (currentView === 'landing' || currentView === 'login' || currentView === 'signup') {
        navigate('dashboard');
      }
    } catch (error) {
      console.error("Erro ao carregar dados admin:", error);
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

  const handleUpdateProfile = async (updatedData: Professional) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('professionals')
        .update({
          name: updatedData.name,
          business_name: updatedData.businessName,
          slug: updatedData.slug,
          bio: updatedData.bio,
          instagram: updatedData.instagram,
          email: updatedData.email
        })
        .eq('id', authUser.id);

      if (error) throw error;

      setUser(updatedData);
      return true;
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao salvar alterações. Verifique se este link já está em uso.");
      return false;
    }
  };

  const handlePublicComplete = async (appt: Omit<Appointment, 'id'>) => {
    try {
      // 1. Obter o ID do profissional
      const { data: prof } = await supabase
        .from('professionals')
        .select('id')
        .eq('slug', publicProfessional?.slug)
        .single();

      if (!prof) return;

      // 2. Criar ou Atualizar Cliente no Banco de Dados
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id, total_bookings')
        .eq('phone', appt.clientPhone)
        .eq('professional_id', prof.id)
        .maybeSingle();

      if (existingClient) {
        await supabase
          .from('clients')
          .update({ 
            total_bookings: (existingClient.total_bookings || 0) + 1,
            last_visit: new Date().toISOString()
          })
          .eq('id', existingClient.id);
      } else {
        await supabase
          .from('clients')
          .insert([{
            professional_id: prof.id,
            name: appt.clientName,
            phone: appt.clientPhone,
            total_bookings: 1,
            last_visit: new Date().toISOString()
          }]);
      }

      // 3. Salvar o Agendamento
      await supabase
        .from('appointments')
        .insert([{
          professional_id: prof.id,
          service_id: appt.serviceId,
          client_name: appt.clientName,
          client_phone: appt.clientPhone,
          date: appt.date,
          status: 'pending'
        }]);

    } catch (err) {
      console.error("Erro ao completar agendamento público:", err);
    }
  };

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const renderCurrentView = () => {
    if (isPublicView && publicProfessional) {
      return (
        <BookingPage 
          professional={publicProfessional} 
          services={publicServices} 
          config={publicConfig} 
          onComplete={handlePublicComplete}
          onHome={() => window.location.href = '/'}
        />
      );
    }

    const commonProps = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={handleUpdateStatus} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={() => {}} onUpdateStatus={handleUpdateStatus} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={() => {}} onToggle={() => {}} onDelete={() => {}} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={handleUpdateProfile} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig || { interval: 60, expediente: [] }} onUpdateConfig={() => {}} />;
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

  if (isPublicView) return renderCurrentView();
  if (currentView === 'landing') return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
  if (currentView === 'login') return <AuthView type="login" onAuth={() => {}} onToggle={() => navigate('signup')} />;
  if (currentView === 'signup') return <AuthView type="signup" onAuth={() => {}} onToggle={() => navigate('login')} />;
  
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
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-[100] group animate-bounce-slow">
        <Icons.WhatsApp className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Suporte Manuela Prado</span>
      </a>
    </div>
  );
};

export default App;
