
import React, { useState, useEffect } from 'react';
import { View, Professional, Service, Appointment, Client, BusinessConfig } from './types.ts';
import Sidebar from './Sidebar.tsx';
import MobileHeader from './components/MobileHeader.tsx';
import LandingPage from './views/LandingPage.tsx';
import AuthView from './views/AuthView.tsx';
import Dashboard from './views/Dashboard.tsx';
import ServicesPage from './views/ServicesPage.tsx';
import ProfilePage from './views/ProfilePage.tsx';
import BookingPage from './views/BookingPage.tsx';
import ClientsPage from './views/ClientsPage.tsx';
import ReportsPage from './views/ReportsPage.tsx';
import SettingsPage from './views/SettingsPage.tsx';
import MarketingPage from './views/MarketingPage.tsx';
import AgendaPage from './views/AgendaPage.tsx';
import ProfessionalsPage from './views/ProfessionalsPage.tsx';
import InactivationPage from './views/InactivationPage.tsx';
import RecurringPage from './views/RecurringPage.tsx';
import AppsPage from './views/AppsPage.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<Professional | null>(null);
  
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

  useEffect(() => {
    const savedUser = localStorage.getItem('prado_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (currentView === 'landing' || currentView === 'login' || currentView === 'signup') {
        setCurrentView('dashboard');
      }
    }
  }, []);

  const handleLogin = (u: Professional) => {
    setUser(u);
    localStorage.setItem('prado_user', JSON.stringify(u));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prado_user');
    setCurrentView('landing');
  };

  const handleAddManualAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt = { ...appt, id: Math.random().toString() };
    setAppointments([...appointments, newAppt]);
    
    // Auto-update clients list if new
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
    const commonProps = { user, onLogout: handleLogout, navigate: (v: View) => setCurrentView(v) };
    
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
      case 'marketing': return <MarketingPage {...commonProps} services={services} />;
      default: return <Dashboard {...commonProps} appointments={appointments} services={services} onUpdateStatus={() => {}} />;
    }
  };

  if (currentView === 'landing') return <LandingPage onStart={() => setCurrentView('signup')} onLogin={() => setCurrentView('login')} />;
  if (currentView === 'login') return <AuthView type="login" onAuth={handleLogin} onToggle={() => setCurrentView('signup')} />;
  if (currentView === 'signup') return <AuthView type="signup" onAuth={handleLogin} onToggle={() => setCurrentView('login')} />;
  if (currentView === 'booking') return <BookingPage professional={user || {name:'', businessName:'Sua Empresa', email:'', slug:'demo'}} config={businessConfig} services={services.filter(s => s.active)} onComplete={(a) => handleAddManualAppointment(a)} onHome={() => user ? setCurrentView('dashboard') : setCurrentView('landing')} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView={currentView} navigate={(v: View) => setCurrentView(v)} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col">
        <MobileHeader user={user} navigate={(v: View) => setCurrentView(v)} />
        <div className="flex-grow">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default App;
