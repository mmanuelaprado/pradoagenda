import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1.34.0';

// --- CONFIGURAÇÕES ---
const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTADO GLOBAL ---
let state = {
  view: 'landing',
  user: null,
  professional: null, // Para a view de agendamento público
  services: [],
  appointments: [],
  clients: [],
  config: { themeColor: '#FF1493', interval: 60, expediente: [] },
  isLoading: true
};

// --- UTILITÁRIOS ---
const generateSlug = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const Icons = {
  Home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  Calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  Users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  Scissors: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/><path d="M14.8 9.2 20 4"/><path d="M8.12 15.88 12 12"/></svg>',
  Settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  Logout: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  ArrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
};

// --- ROTEAMENTO ---
function navigate(view, slug = null) {
  state.view = view;
  const path = view === 'landing' ? '/' : (view === 'booking' ? `/${slug}` : `/${view}`);
  window.history.pushState({}, '', path);
  render();
}

// --- RENDERIZAÇÃO DE VIEWS ---

function LandingView() {
  return `
    <div class="flex flex-col min-h-screen bg-white">
      <nav class="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
          <span class="text-2xl font-black uppercase tracking-tighter">Prado Agenda</span>
        </div>
        <div class="flex gap-6 items-center">
          <button onclick="window.app.navigate('login')" class="font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Entrar</button>
          <button onclick="window.app.navigate('signup')" class="bg-black text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all">Começar Agora</button>
        </div>
      </nav>
      <main class="flex-grow flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">Organize seu espaço <br> <span class="text-[#FF1493]">com perfeição.</span></h1>
        <p class="text-xl text-gray-400 mb-12 font-medium">O sistema de agendamento online mais sofisticado para profissionais de beleza e estética.</p>
        <button onclick="window.app.navigate('signup')" class="bg-[#FF1493] text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-pink-700 transition-all active:scale-95">Gerar Meu Link Grátis</button>
      </main>
    </div>
  `;
}

function AuthView(type) {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-2xl text-center animate-fade">
        <h2 class="text-3xl font-black mb-2">${type === 'login' ? 'Bem-vinda de volta' : 'Crie sua agenda'}</h2>
        <p class="text-gray-400 mb-10 font-medium">${type === 'login' ? 'Acesse seu painel administrativo' : 'Comece a organizar seu salão agora'}</p>
        
        <form onsubmit="window.app.handleAuth(event, '${type}')" class="space-y-4 text-left">
          ${type === 'signup' ? `
            <div>
              <label class="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Seu Nome</label>
              <input name="name" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nome do Estabelecimento</label>
              <input name="business" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
            </div>
          ` : ''}
          <div>
            <label class="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">E-mail</label>
            <input name="email" type="email" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
          </div>
          <button class="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest mt-6 shadow-xl hover:bg-gray-800 transition-all">
            ${type === 'login' ? 'Entrar no Painel' : 'Criar Minha Conta'}
          </button>
        </form>
        
        <p class="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
          ${type === 'login' ? 'Não tem conta? <button onclick="window.app.navigate(\'signup\')" class="text-[#FF1493]">Cadastre-se</button>' : 'Já tem conta? <button onclick="window.app.navigate(\'login\')" class="text-[#FF1493]">Fazer Login</button>'}
        </p>
      </div>
    </div>
  `;
}

function DashboardView() {
  const user = state.user;
  const brandColor = state.config.themeColor;
  
  return `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <aside class="w-72 bg-black text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen">
        <div class="mb-16 font-black text-xl flex items-center gap-3">
          <div class="w-8 h-8 bg-[#FF1493] rounded-lg flex items-center justify-center">P</div>
          PRADO AGENDA
        </div>
        <nav class="flex-grow space-y-2">
          <button class="w-full text-left p-4 rounded-2xl bg-[#FF1493] flex items-center gap-3 font-bold">${Icons.Home} Dashboard</button>
          <button onclick="window.app.navigate('agenda')" class="w-full text-left p-4 rounded-2xl text-gray-500 hover:bg-white/5 flex items-center gap-3 font-bold transition-all">${Icons.Calendar} Agenda</button>
          <button onclick="window.app.navigate('services')" class="w-full text-left p-4 rounded-2xl text-gray-500 hover:bg-white/5 flex items-center gap-3 font-bold transition-all">${Icons.Scissors} Serviços</button>
          <button onclick="window.app.navigate('clients')" class="w-full text-left p-4 rounded-2xl text-gray-500 hover:bg-white/5 flex items-center gap-3 font-bold transition-all">${Icons.Users} Clientes</button>
        </nav>
        <button onclick="window.app.logout()" class="p-4 text-gray-500 hover:text-red-400 flex items-center gap-3 font-bold transition-all">${Icons.Logout} Sair</button>
      </aside>

      <!-- Main Content -->
      <main class="flex-grow p-6 md:p-12 bg-gray-50 overflow-y-auto">
        <header class="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl md:text-4xl font-black tracking-tighter">Olá, ${user.name.split(' ')[0]}!</h1>
            <p class="text-gray-400 font-medium">Bem-vinda ao seu centro de comando.</p>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-sm">
            <div class="flex-grow min-w-0">
              <p class="text-[8px] font-black uppercase text-gray-400 mb-1">Seu Link de Agendamento</p>
              <p class="text-xs font-bold truncate">pradoagenda.vercel.app/${user.slug}</p>
            </div>
            <button onclick="window.app.copyLink('${user.slug}')" class="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Agendamentos Hoje</p>
            <p class="text-4xl font-black">${state.appointments.filter(a => a.date.includes(new Date().toISOString().split('T')[0])).length}</p>
          </div>
          <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Clientes Ativos</p>
            <p class="text-4xl font-black">${state.clients.length}</p>
          </div>
          <div class="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div class="relative z-10">
              <p class="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Receita Estimada</p>
              <p class="text-4xl font-black">R$ 0,00</p>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-10 scale-150">${Icons.Home}</div>
          </div>
        </div>

        <div class="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 class="text-xl font-black uppercase tracking-tight">Próximos Horários</h3>
            <button onclick="window.app.navigate('agenda')" class="text-[#FF1493] text-[10px] font-black uppercase tracking-widest">Ver Agenda Completa</button>
          </div>
          <div class="divide-y divide-gray-50">
            ${state.appointments.length === 0 ? `
              <div class="p-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">Nenhum agendamento para hoje</div>
            ` : state.appointments.map(a => `
              <div class="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                <div class="flex items-center gap-6">
                  <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xl text-[#FF1493]">${a.client_name.charAt(0)}</div>
                  <div>
                    <h4 class="font-black text-black uppercase tracking-tight">${a.client_name}</h4>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}h</p>
                  </div>
                </div>
                <span class="px-4 py-2 bg-pink-50 text-[#FF1493] rounded-full text-[10px] font-black uppercase tracking-widest">${a.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    </div>
  `;
}

function LoadingView() {
  return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-white">
      <div class="w-12 h-12 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin mb-6"></div>
      <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Carregando Prado Agenda...</p>
    </div>
  `;
}

// --- CORE DA APLICAÇÃO ---

function render() {
  const root = document.getElementById('root');
  if (state.isLoading) {
    root.innerHTML = LoadingView();
    return;
  }

  let content = '';
  switch (state.view) {
    case 'landing': content = LandingView(); break;
    case 'login': content = AuthView('login'); break;
    case 'signup': content = AuthView('signup'); break;
    case 'dashboard': content = DashboardView(); break;
    default: content = LandingView();
  }
  
  root.innerHTML = `<div class="animate-fade">${content}</div>`;
}

window.app = {
  navigate,
  copyLink: (slug) => {
    const url = `pradoagenda.vercel.app/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado com sucesso!');
  },
  logout: () => {
    localStorage.removeItem('prado_auth');
    state.user = null;
    navigate('landing');
  },
  handleAuth: async (e, type) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    try {
      state.isLoading = true;
      render();
      
      if (type === 'login') {
        const { data, error } = await supabase.from('professionals').select('*').eq('email', email).maybeSingle();
        if (!data || error) throw new Error('Credenciais inválidas.');
        state.user = data;
      } else {
        const name = formData.get('name');
        const business = formData.get('business');
        const slug = generateSlug(business);
        const { data, error } = await supabase.from('professionals').insert([{ name, email, business_name: business, slug }]).select().single();
        if (error) throw error;
        state.user = data;
      }
      
      localStorage.setItem('prado_auth', JSON.stringify(state.user));
      
      // Carrega dados iniciais
      const [appts, svs, cls] = await Promise.all([
        supabase.from('appointments').select('*').eq('professional_id', state.user.id),
        supabase.from('services').select('*').eq('professional_id', state.user.id),
        supabase.from('clients').select('*').eq('professional_id', state.user.id)
      ]);
      
      state.appointments = appts.data || [];
      state.services = svs.data || [];
      state.clients = cls.data || [];
      
      state.isLoading = false;
      navigate('dashboard');
    } catch (err) {
      state.isLoading = false;
      render();
      alert(err.message);
    }
  }
};

// --- INICIALIZAÇÃO ---
async function init() {
  const saved = localStorage.getItem('prado_auth');
  const path = window.location.pathname.replace(/^\//, '');
  
  if (saved) {
    state.user = JSON.parse(saved);
    try {
      const [appts, svs, cls] = await Promise.all([
        supabase.from('appointments').select('*').eq('professional_id', state.user.id),
        supabase.from('services').select('*').eq('professional_id', state.user.id),
        supabase.from('clients').select('*').eq('professional_id', state.user.id)
      ]);
      state.appointments = appts.data || [];
      state.services = svs.data || [];
      state.clients = cls.data || [];
      state.view = 'dashboard';
    } catch (e) {
      console.error("Erro ao sincronizar:", e);
    }
  } else if (path && !['login', 'signup'].includes(path)) {
    // Lógica para carregar booking público via slug
    console.log("Acessando link público:", path);
  }

  state.isLoading = false;
  render();
}

init();