
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string; // ISO string
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
  lastVisit: string;
}

export interface Professional {
  name: string;
  businessName: string;
  email: string;
  slug: string; // for the public link
  bio?: string;
  instagram?: string;
}

export interface Shift {
  start: string;
  end: string;
  active: boolean;
}

export interface DayExpediente {
  day: string;
  active: boolean;
  shifts: [Shift, Shift];
}

export interface BusinessConfig {
  interval: 15 | 30 | 45 | 60;
  expediente: DayExpediente[];
}

export type View = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'agenda'
  | 'clients' 
  | 'services' 
  | 'professionals'
  | 'finance'
  | 'recurring'
  | 'inactivation'
  | 'company'
  | 'settings'
  | 'apps'
  | 'booking'
  | 'marketing';
