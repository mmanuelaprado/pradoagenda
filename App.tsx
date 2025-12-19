
import React, { useState, useEffect, useCallback } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
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
  const [history, setHistory] = useState<View[]>(['landing']);
  const [user, setUser] = useState<Professional | null>(null);
  const [bookingProfessional, setBookingProfessional] = useState<Professional | null>(null);

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    interval: 60,
    expediente: [
      { day: 'Segunda', active: true, shifts: [{ start: '08:00', end: '12:00', active: true }, { start: '13:00', end: '17:00', active: true }] },
      { day: 'Terça', active: true, shifts: [{ start: '08:00', end: '12:00', active: true }, { start: '13:00', end: '17:00', active: true }] },
      { day: 'Quarta', active: true, shifts: [{ start: '08:00', end: '12:00', active: true }, { start: '13:00', end: '17:00', active: true }] },
      { day: 'Quinta', active: true, shifts: [{ start: '08:00', end: '12:00', active: true }, { start: '13:00', end: '17:00', active: true }] },
      { day: 'Sexta', active: true, shifts: [{ start: '08:00', end: '12:00', active: true }, { start: '13:00', end: '17:00', active: true }] },
      { day: 'Sábado', active: false, shifts: [{ start: '08:00', end: '12:00', active: false }, { start: '13:00', end: '17:00', active: false }] },
      { day: 'Domingo', active: false, shifts: [{ start: '08:00', end: '12:00', active: false }, { start: '13:00', end: '17:00', active: false }] },
    ]
  });

  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Manicure Gel', description: 'Aplicação de unhas em gel.', duration: 60, price: 80, active: true },
    { id: '2', name: 'Pedicure Relax', description: 'Cuidado completo para os pés.', duration: 45, price: 50, active: true },
    { id: '3', name: 'Design Sobrancelha', description: 'Design personalizado.', duration: 30, price: 35, active: true },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Navegação customizada que mantém histórico (essencial para App Nativo)
  const navigate = useCallback((v: View) => {
    setCurrentView(v);
    setHistory(prev => [...prev, v]);
    
    // Feedback tátil simples (Pode ser expandido com Capacitor Haptics)
    if ('vibrate' in navigator) navigator.vibrate(5);
  }, []);

  // Lógica para botão voltar (Android Back Button)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop();
        const prevView = newHistory[newHistory.length - 1];
        setHistory(newHistory);
        setCurrentView(prevView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingSlug = urlParams.get('b');
    
    if (bookingSlug) {
      const savedUser = localStorage.getItem('prado_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.slug === bookingSlug) {
          setBookingProfessional(u);
        } else {
          setBookingProfessional({ name: 'Especialista', businessName: 'Espaço Beleza', email: '', slug: bookingSlug });
        }
      } else {
        setBookingProfessional({ name: 'Especialista', businessName: 'Espaço Beleza', email: '', slug: bookingSlug });
      }
      navigate('booking');
      return;
    }

    const savedUser = localStorage.getItem('prado_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigate('dashboard');
    }
  }, [navigate]);

  const handleLogin = (u: Professional) => {
    setUser(u);
    localStorage.setItem('prado_user', JSON.stringify(u));
    navigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prado_user');
    navigate('landing');
  };

  const handleAddManualAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt = { ...appt, id: Math.random().toString() };
    setAppointments(prev => [...prev, newAppt]);
    
    setClients(prev => {
      const existing = prev.find(c => c.phone === appt.clientPhone);
      if (existing) {
        return prev.map(c => c.phone === appt.clientPhone ? { ...c, totalBookings: c.totalBookings + 1, lastVisit: new Date().toISOString() } : c);
      }
      return [...prev, {
        id: Math.random().toString(),
        name: appt.clientName,
        phone: appt.clientPhone,
        totalBookings: 1,
        lastVisit: new Date().toISOString()
      }];
    });
  };

  const renderCurrentView = () => {
    const commonProps = { user, onLogout: handleLogout, navigate };
    
    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={(id, s) => setAppointments(appointments.map(a => a.id === id ? {...a, status: s} : a))} />;
      case 'agenda': return <AgendaPage {...commonProps} appointments={appointments} services={services} onAddManualAppointment={handleAddManualAppointment} />;
      case 'clients': return <ClientsPage {...commonProps} clients={clients} appointments={appointments} />;
      case 'services': return <ServicesPage {...commonProps} services={services} onAdd={(s) => setServices([...services, {...s, id: Math.random().toString()}])} onToggle={(id) => setServices(services.map(s => s.id === id ? {...s, active: !s.active} : s))} onDelete={(id) => setServices(services.filter(s => s.id !== id))} />;
      case 'professionals': return <ProfessionalsPage {...commonProps} professionals={professionals} onAdd={(p) => setProfessionals([...professionals, p])} />;
      case 'finance': return <ReportsPage {...commonProps} appointments={appointments} services={services} />;
      case 'recurring': return <RecurringPage {...commonProps} />;
      case 'inactivation': return <InactivationPage {...commonProps} />;
      case 'company': return <ProfilePage {...commonProps} onUpdate={(u) => {setUser(u); localStorage.setItem('prado_user', JSON.stringify(u))}} />;
      case 'settings': return <SettingsPage {...commonProps} config={businessConfig} onUpdateConfig={setBusinessConfig} />;
      case 'apps': return <AppsPage {...commonProps} />;
      default: return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={() => {}} />;
    }
  };

  if (currentView === 'landing') return <LandingPage onStart={() => navigate('signup')} onLogin={() => navigate('login')} />;
  if (currentView === 'login') return <AuthView type="login" onAuth={handleLogin} onToggle={() => navigate('signup')} />;
  if (currentView === 'signup') return <AuthView type="signup" onAuth={handleLogin} onToggle={() => navigate('login')} />;
  
  if (currentView === 'booking') {
    return (
      <BookingPage 
        professional={bookingProfessional || user || {name:'', businessName:'Sua Empresa', email:'', slug:'demo'}} 
        config={businessConfig} 
        services={services.filter(s => s.active)} 
        onComplete={(a) => handleAddManualAppointment(a)} 
        onHome={() => {
          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
          user ? navigate('dashboard') : navigate('landing');
        }} 
      />
    );
  }

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
