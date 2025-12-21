
// Engine de Dados Local (Simulando Supabase)
// Esta implementação remove a necessidade de chaves externas e mantém a funcionalidade SaaS.

const STORAGE_KEY = 'prado_agenda_db';

const getDB = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {
    professionals: [],
    services: [],
    appointments: [],
    clients: [],
    business_config: [],
    blocked_dates: [],
    sessions: null
  };
};

const saveDB = (db: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const supabase = {
  auth: {
    getSession: async () => {
      const db = getDB();
      return { data: { session: db.sessions } };
    },
    getUser: async () => {
      const db = getDB();
      return { data: { user: db.sessions?.user || null } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const db = getDB();
      const user = db.professionals.find((p: any) => p.email === email);
      if (user) {
        db.sessions = { user: { id: user.id, email: user.email } };
        saveDB(db);
        return { data: db.sessions, error: null };
      }
      return { data: null, error: { message: 'Credenciais inválidas' } };
    },
    signUp: async ({ email, password, options }: any) => {
      const db = getDB();
      const id = Math.random().toString(36).substr(2, 9);
      const newUser = {
        id,
        email,
        name: options.data.full_name,
        business_name: options.data.business_name,
        slug: options.data.business_name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString()
      };
      db.professionals.push(newUser);
      db.sessions = { user: { id, email } };
      
      // Criar config padrão para o novo usuário
      db.business_config.push({
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

      saveDB(db);
      return { data: db.sessions, error: null };
    },
    signOut: async () => {
      const db = getDB();
      db.sessions = null;
      saveDB(db);
      return { error: null };
    }
  },
  from: (table: string) => {
    const db = getDB();
    let queryData = db[table] || [];
    const filters: any = {};

    const builder = {
      select(cols: string = '*') { return this; },
      eq(col: string, val: any) {
        filters[col] = val;
        queryData = queryData.filter((item: any) => item[col] === val);
        return this;
      },
      neq(col: string, val: any) {
        queryData = queryData.filter((item: any) => item[col] !== val);
        return this;
      },
      filter(col: string, op: string, val: any) { return this; },
      order(col: string, { ascending }: any = {}) {
        queryData.sort((a: any, b: any) => ascending ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1));
        return this;
      },
      async maybeSingle() { return { data: queryData[0] || null, error: null }; },
      async single() { return { data: queryData[0] || null, error: queryData[0] ? null : { message: 'Not found' } }; },
      async insert(records: any[]) {
        const dbNow = getDB();
        const newRecords = records.map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }));
        dbNow[table] = [...(dbNow[table] || []), ...newRecords];
        saveDB(dbNow);
        return { data: newRecords, error: null };
      },
      async update(patch: any) {
        const dbNow = getDB();
        dbNow[table] = dbNow[table].map((item: any) => {
          const match = Object.keys(filters).every(key => item[key] === filters[key]);
          return match ? { ...item, ...patch } : item;
        });
        saveDB(dbNow);
        return { error: null };
      },
      async delete() {
         const dbNow = getDB();
         dbNow[table] = dbNow[table].filter((item: any) => {
            return !Object.keys(filters).every(key => item[key] === filters[key]);
         });
         saveDB(dbNow);
         return { error: null };
      },
      // Essential for making the builder awaitable and supporting .then() calls in TypeScript
      then(onFulfilled: any) {
        return Promise.resolve({ data: queryData, error: null }).then(onFulfilled);
      },
      get data() { return queryData; }
    };

    return builder;
  }
};

export const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};
