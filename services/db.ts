
// Engine de Dados Local (Prado DB)
// Gerenciamento de persistência local para o sistema SaaS.

const STORAGE_KEY = 'prado_agenda_v2_db';

// Utilitário para gerar slug consistente
export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, "-")      // Substitui caracteres especiais por -
    .replace(/-+/g, "-")             // Remove traços duplos
    .replace(/^-|-$/g, "");          // Remove traços no início e fim
};

interface Database {
  professionals: any[];
  services: any[];
  appointments: any[];
  clients: any[];
  business_config: any[];
  blocked_dates: any[];
  session: { user: any } | null;
}

const getDB = (): Database => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      professionals: [],
      services: [],
      appointments: [],
      clients: [],
      business_config: [],
      blocked_dates: [],
      session: null
    };
  }
  return JSON.parse(data);
};

const saveDB = (db: Database) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const db = {
  auth: {
    getSession: () => getDB().session,
    login: (email: string) => {
      const store = getDB();
      const user = store.professionals.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (user) {
        store.session = { user: { id: user.id, email: user.email } };
        saveDB(store);
        return user;
      }
      return null;
    },
    signup: (data: { email: string, name: string, businessName: string }) => {
      const store = getDB();
      const id = Math.random().toString(36).substr(2, 9);
      const newUser = {
        id,
        email: data.email,
        name: data.name,
        businessName: data.businessName,
        slug: generateSlug(data.businessName),
        created_at: new Date().toISOString()
      };
      store.professionals.push(newUser);
      store.session = { user: { id, email: data.email } };
      
      store.business_config.push({
        professional_id: id,
        interval: 60,
        expediente: [
          { day: 'segunda-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
          { day: 'terça-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
          { day: 'quarta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
          { day: 'quinta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
          { day: 'sexta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
          { day: 'sábado', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: false}] },
          { day: 'domingo', active: false, shifts: [{start: '09:00', end: '12:00', active: false}, {start: '13:00', end: '18:00', active: false}] }
        ]
      });

      saveDB(store);
      return newUser;
    },
    logout: () => {
      const store = getDB();
      store.session = null;
      saveDB(store);
    }
  },

  table: (name: keyof Omit<Database, 'session'>) => ({
    all: () => getDB()[name],
    where: (filters: Record<string, any>) => {
      return getDB()[name].filter((item: any) => 
        Object.entries(filters).every(([key, val]) => item[key] === val)
      );
    },
    find: (filters: Record<string, any>) => {
      return getDB()[name].find((item: any) => 
        Object.entries(filters).every(([key, val]) => {
          if (typeof val === 'string' && typeof item[key] === 'string') {
             return item[key].toLowerCase() === val.toLowerCase();
          }
          return item[key] === val;
        })
      );
    },
    insert: (data: any) => {
      const store = getDB();
      const newItem = { ...data, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
      store[name].push(newItem);
      saveDB(store);
      return newItem;
    },
    update: (id: string, patch: any) => {
      const store = getDB();
      store[name] = store[name].map((item: any) => 
        item.id === id ? { ...item, ...patch } : item
      );
      saveDB(store);
    },
    updateWhere: (filters: Record<string, any>, patch: any) => {
      const store = getDB();
      store[name] = store[name].map((item: any) => {
        const match = Object.entries(filters).every(([key, val]) => item[key] === val);
        return match ? { ...item, ...patch } : item;
      });
      saveDB(store);
    },
    delete: (id: string) => {
      const store = getDB();
      store[name] = store[name].filter((item: any) => item.id !== id);
      saveDB(store);
    }
  })
};
