
import { createClient } from '@supabase/supabase-js';

// Conexão oficial com o projeto Supabase fornecido pelo usuário
const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Interface unificada para persistência na nuvem
export const db = {
  auth: {
    getSession: () => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    },
    login: async (email: string) => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
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
        businessName: userData.businessName,
        slug: generateSlug(userData.businessName),
      };

      const { data, error } = await supabase.from('professionals').insert([newUser]).select().single();
      
      if (data) {
        // Inicializa configuração padrão de negócio no Supabase
        await supabase.from('business_config').insert([{
          professional_id: data.id,
          interval: 60,
          themeColor: '#FF1493',
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
      const { data } = await supabase.from(tableName).select('*');
      return data || [];
    },
    where: async (filters: Record<string, any>) => {
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { data } = await query;
      return data || [];
    },
    find: async (filters: Record<string, any>) => {
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { data } = await query.single();
      return data;
    },
    insert: async (item: any) => {
      const { data } = await supabase.from(tableName).insert([item]).select().single();
      return data;
    },
    update: async (id: string, patch: any) => {
      await supabase.from(tableName).update(patch).eq('id', id);
    },
    updateWhere: async (filters: Record<string, any>, patch: any) => {
      let query = supabase.from(tableName).update(patch);
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      await query;
    },
    delete: async (id: string) => {
      await supabase.from(tableName).delete().eq('id', id);
    }
  })
};
