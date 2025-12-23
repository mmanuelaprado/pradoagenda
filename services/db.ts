import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';

// Inicialização segura do cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const generateSlug = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const handleDbError = (error: any) => {
  if (!error) return null;
  const message = error.message || error.details || (typeof error === 'string' ? error : JSON.stringify(error));
  console.error("Database Error:", message);
  throw new Error(message);
};

export const db = {
  auth: {
    getSession: () => {
      try {
        const session = localStorage.getItem('supabase.auth.token');
        if (!session) return null;
        const parsed = JSON.parse(session);
        if (parsed?.user?.id) return parsed;
        return null;
      } catch (e) {
        localStorage.removeItem('supabase.auth.token');
        return null;
      }
    },
    login: async (email: string) => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (data) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({ user: data }));
      }
      return { data, error };
    },
    signup: async (userData: { email: string, name: string, businessName: string }) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newUser = {
        id,
        email: userData.email.toLowerCase(),
        name: userData.name,
        business_name: userData.businessName,
        slug: generateSlug(userData.businessName),
      };

      const { data, error } = await supabase.from('professionals').insert([newUser]).select().single();
      
      if (data) {
        // Tenta criar configuração padrão mas não trava se falhar
        try {
          await supabase.from('business_config').insert([{
            professional_id: data.id,
            interval: 60,
            theme_color: '#FF1493',
            expediente: [
              { day: 'segunda-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
              { day: 'terça-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
              { day: 'quarta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
              { day: 'quinta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
              { day: 'sexta-feira', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: true}] },
              { day: 'sábado', active: true, shifts: [{start: '09:00', end: '12:00', active: true}, {start: '13:00', end: '18:00', active: false}] },
              { day: 'domingo', active: false, shifts: [{start: '09:00', end: '12:00', active: false}, {start: '13:00', end: '18:00', active: false}] }
            ]
          }]);
        } catch (e) { console.warn("Erro ao criar config padrão."); }
        
        localStorage.setItem('supabase.auth.token', JSON.stringify({ user: data }));
      }
      return { data, error };
    },
    logout: () => {
      localStorage.removeItem('supabase.auth.token');
    }
  },

  table: (tableName: string) => ({
    all: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) handleDbError(error);
      return data || [];
    },
    where: async (filters: Record<string, any>) => {
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { data, error } = await query;
      if (error) handleDbError(error);
      return data || [];
    },
    find: async (filters: Record<string, any>) => {
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { data, error } = await query.maybeSingle();
      if (error && error.code !== 'PGRST116') handleDbError(error);
      return data;
    },
    insert: async (item: any) => {
      const { data, error } = await supabase.from(tableName).insert([item]).select().single();
      if (error) handleDbError(error);
      return data;
    },
    update: async (id: string, patch: any) => {
      const { error } = await supabase.from(tableName).update(patch).eq('id', id);
      if (error) handleDbError(error);
    },
    updateWhere: async (filters: Record<string, any>, patch: any) => {
      let query = supabase.from(tableName).update(patch);
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { error } = await query;
      if (error) handleDbError(error);
    },
    delete: async (id: string) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) handleDbError(error);
    }
  })
};