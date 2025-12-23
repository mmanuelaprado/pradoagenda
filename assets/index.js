import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1.34.0';

// CONFIGURAÇÕES E ESTADO
const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  view: 'landing',
  user: null,
  professional: null,
  services: [],
  appointments: [],
  config: { themeColor: '#FF1493', interval: 60, expediente: [] },
  isLoading: true
};

// UTILITÁRIOS
const generateSlug = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// NAVEGAÇÃO
async function navigate(view, params = {}) {
  state.view = view;
  if (view === 'landing') window.history.pushState({}, '', '/');
  else if (view === 'booking') window.history.pushState({}, '', `/${params.slug || ''}`);
  render();
}

// COMPONENTES DE UI
const Icons = {
  Home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  Calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  Users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  Scissors: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/><path d="M14.8 9.2 20 4"/><path d="M8.12 15.88 12 12"/></svg>',
  Logout: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>'
};

function LandingPage() {
  return `
    <div class="flex flex-col min-h-screen bg-white">
      <nav class="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-bold">P</div>
          <span class="text-2xl font-black uppercase tracking-tighter">Prado Agenda</span>
        </div>
        <div class="space-x-4">
          <button onclick="window.app.navigate('login')" class="font-bold text-xs uppercase tracking-widest text-gray-500 hover:text-black">Entrar</button>
          <button onclick="window.app.navigate('signup')" class="bg-black text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">Criar Conta</button>
        </div>
      </nav>
      <main class="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <h1 class="text-5xl md:text-8xl font-black mb-8 leading-tight">Sua agenda <br> <span class="text-[#FF1493]">no próximo nível.</span></h1>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl">O sistema de agendamento online mais elegante para profissionais da beleza.</p>
        <button onclick="window.app.navigate('signup')" class="bg-[#FF1493] text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-pink-700 transition-all">Começar Agora</button>
      </main>
    </div>
  `;
}

function Dashboard() {
  const user = state.user;
  return `
    <div class="flex min-h-screen">
      <aside class="w-72 bg-black text-white p-8 hidden md:flex flex-col">
        <div class="mb-12 font-black text-xl flex items-center gap-2"><div class="w-8 h-8 bg-[#FF1493] rounded flex items-center justify-center">P</div> PradoAgenda</div>
        <nav class="flex-grow space-y-2">
          <button class="w-full text-left p-4 rounded-xl bg-[#FF1493] flex items-center gap-3">${Icons.Home} Dashboard</button>
          <button class="w-full text-left p-4 rounded-xl text-gray-400 hover:bg-white/5 flex items-center gap-3">${Icons.Calendar} Agenda</button>
          <button class="w-full text-left p-4 rounded-xl text-gray-400 hover:bg-white/5 flex items-center gap-3">${Icons.Scissors} Serviços</button>
          <button class="w-full text-left p-4 rounded-xl text-gray-400 hover:bg-white/5 flex items-center gap-3">${Icons.Users} Clientes</button>
        </nav>
        <button onclick="window.app.logout()" class="p-4 text-gray-400 hover:text-red-400 flex items-center gap-3">${Icons.Logout} Sair</button>
      </aside>
      <main class="flex-grow p-10 bg-gray-50">
        <header class="mb-12">
          <h1 class="text-3xl font-black">Olá, ${user.name.split(' ')[0]}!</h1>
          <p class="text-gray-400">Aqui está o resumo do seu dia.</p>
        </header>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Agendamentos Hoje</p>
            <p class="text-3xl font-black">0</p>
          </div>
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Faturamento Previsto</p>
            <p class="text-3xl font-black">R$ 0,00</p>
          </div>
          <div class="bg-pink-600 text-white p-8 rounded-[2rem] shadow-xl">
            <p class="text-[10px] font-black uppercase text-white/60 mb-2">Link de Agendamento</p>
            <p class="text-sm font-bold truncate">pradoagenda.vercel.app/${user.slug}</p>
          </div>
        </div>
      </main>
    </div>
  `;
}

function AuthPage(type) {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-xl text-center">
        <h2 class="text-3xl font-black mb-2">${type === 'login' ? 'Bem-vinda de volta' : 'Crie sua agenda'}</h2>
        <p class="text-gray-400 mb-8">${type === 'login' ? 'Entre com seu e-mail cadastrado' : 'Comece a organizar seu espaço agora'}</p>
        <form onsubmit="window.app.handleAuth(event, '${type}')" class="space-y-4 text-left">
          ${type === 'signup' ? `
            <div>
              <label class="block text-[10px] font-black uppercase text-gray-400 mb-2">Nome Completo</label>
              <input name="name" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase text-gray-400 mb-2">Nome do Salão</label>
              <input name="business" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
            </div>
          ` : ''}
          <div>
            <label class="block text-[10px] font-black uppercase text-gray-400 mb-2">E-mail</label>
            <input name="email" type="email" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF1493] font-bold">
          </div>
          <button class="w-full bg-[#FF1493] text-white py-5 rounded-xl font-black uppercase tracking-widest mt-4">${type === 'login' ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        <p class="mt-8 text-xs font-bold text-gray-400">
          ${type === 'login' ? 'Ainda não tem conta? <button onclick="window.app.navigate(\'signup\')" class="text-[#FF1493]">Cadastre-se</button>' : 'Já tem conta? <button onclick="window.app.navigate(\'login\')" class="text-[#FF1493]">Faça Login</button>'}
        </p>
      </div>
    </div>
  `;
}

// RENDERIZAÇÃO
function render() {
  const root = document.getElementById('root');
  if (state.isLoading) {
    root.innerHTML = '<div class="min-h-screen flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-4 border-[#FF1493] border-t-transparent"></div></div>';
    return;
  }

  let content = '';
  switch (state.view) {
    case 'landing': content = LandingPage(); break;
    case 'login': content = AuthPage('login'); break;
    case 'signup': content = AuthPage('signup'); break;
    case 'dashboard': content = Dashboard(); break;
    default: content = LandingPage();
  }
  
  root.innerHTML = `<div class="animate-fade">${content}</div>`;
}

// LÓGICA DE NEGÓCIO
window.app = {
  navigate,
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
      if (type === 'login') {
        const { data } = await supabase.from('professionals').select('*').eq('email', email).maybeSingle();
        if (!data) return alert('E-mail não encontrado.');
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
      navigate('dashboard');
    } catch (err) {
      alert(err.message);
    }
  }
};

// INICIALIZAÇÃO
async function init() {
  const saved = localStorage.getItem('prado_auth');
  if (saved) {
    state.user = JSON.parse(saved);
    state.view = 'dashboard';
  }

  // Verifica sub-rotas para agendamento público
  const slug = window.location.pathname.split('/')[1];
  if (slug && !['login', 'signup', 'dashboard'].includes(slug)) {
    // Aqui viria a lógica de carregar o profissional pelo slug
    console.log('Modo agendamento para:', slug);
  }

  state.isLoading = false;
  render();
}

init();