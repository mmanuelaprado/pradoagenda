import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1.34.0';

const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  view: 'landing',
  user: JSON.parse(localStorage.getItem('prado_user') || 'null'),
  isLoading: false,
  appointments: [],
  services: [],
  config: { themeColor: '#FF1493' }
};

const Icons = {
  Home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  Scissors: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/><path d="M14.8 9.2 20 4"/><path d="M8.12 15.88 12 12"/></svg>`,
  Users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  Logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`
};

function navigate(view) {
  state.view = view;
  const path = view === 'landing' ? '/' : `/${view}`;
  window.history.pushState({}, '', path);
  render();
}

function render() {
  const root = document.getElementById('root');
  if (state.isLoading) {
    root.innerHTML = `<div class="min-h-screen flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-4 border-[#FF1493] border-t-transparent"></div></div>`;
    return;
  }

  if (!state.user && !['landing', 'login', 'signup'].includes(state.view)) {
    state.view = 'landing';
  }

  let html = '';
  if (state.view === 'landing') {
    html = `
      <div class="flex flex-col min-h-screen bg-white">
        <nav class="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-[#FF1493] rounded-xl flex items-center justify-center text-white font-black">P</div>
            <span class="text-2xl font-black uppercase tracking-tighter">Prado Agenda</span>
          </div>
          <div class="flex gap-4">
            <button onclick="window.app.navigate('login')" class="font-bold text-xs uppercase tracking-widest text-gray-400">Entrar</button>
            <button onclick="window.app.navigate('signup')" class="bg-black text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest">Cadastrar</button>
          </div>
        </nav>
        <main class="flex-grow flex flex-col items-center justify-center text-center px-6">
          <h1 class="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tighter">Sua agenda <br> <span class="text-[#FF1493]">perfeita.</span></h1>
          <p class="text-xl text-gray-400 mb-12">O sistema mais elegante para profissionais da beleza.</p>
          <button onclick="window.app.navigate('signup')" class="bg-[#FF1493] text-white px-12 py-6 rounded-full font-black uppercase tracking-widest shadow-2xl">Começar Agora</button>
        </main>
      </div>
    `;
  } else if (state.view === 'login' || state.view === 'signup') {
    html = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-2xl text-center">
          <h2 class="text-3xl font-black mb-2">${state.view === 'login' ? 'Bem-vinda' : 'Crie sua conta'}</h2>
          <form onsubmit="window.app.handleAuth(event, '${state.view}')" class="space-y-4 text-left mt-8">
            ${state.view === 'signup' ? `
              <input name="name" placeholder="Seu Nome" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold">
              <input name="business" placeholder="Nome do Salão" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold">
            ` : ''}
            <input name="email" type="email" placeholder="E-mail" required class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold">
            <button class="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest mt-4">Continuar</button>
          </form>
          <button onclick="window.app.navigate('${state.view === 'login' ? 'signup' : 'login'}')" class="mt-8 text-xs font-bold text-gray-400">
            ${state.view === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    `;
  } else if (state.view === 'dashboard') {
    html = `
      <div class="flex min-h-screen">
        <aside class="w-64 bg-black text-white p-8 flex flex-col">
          <div class="mb-12 font-black">PRADO AGENDA</div>
          <nav class="flex-grow space-y-4">
            <button class="w-full text-left flex items-center gap-3 text-[#FF1493]">${Icons.Home} Início</button>
            <button class="w-full text-left flex items-center gap-3 text-gray-500">${Icons.Scissors} Serviços</button>
            <button class="w-full text-left flex items-center gap-3 text-gray-500">${Icons.Users} Clientes</button>
          </nav>
          <button onclick="window.app.logout()" class="flex items-center gap-3 text-gray-500">${Icons.Logout} Sair</button>
        </aside>
        <main class="flex-grow p-12 bg-gray-50">
          <h1 class="text-4xl font-black mb-8">Olá, ${state.user.name.split(' ')[0]}!</h1>
          <div class="grid grid-cols-3 gap-6">
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Seu Link</p>
              <p class="text-sm font-bold truncate">pradoagenda.vercel.app/${state.user.slug}</p>
            </div>
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Agendamentos</p>
              <p class="text-3xl font-black">0</p>
            </div>
            <div class="bg-[#FF1493] text-white p-8 rounded-3xl shadow-xl">
              <p class="text-[10px] font-black uppercase text-white/50 mb-2">Status</p>
              <p class="text-xl font-black italic">CONECTADO</p>
            </div>
          </div>
        </main>
      </div>
    `;
  }
  
  root.innerHTML = `<div class="animate-fade">${html}</div>`;
}

window.app = {
  navigate,
  logout: () => {
    localStorage.removeItem('prado_user');
    state.user = null;
    navigate('landing');
  },
  handleAuth: async (e, type) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email');
    state.isLoading = true; render();
    
    try {
      let user;
      if (type === 'login') {
        const { data } = await supabase.from('professionals').select('*').eq('email', email).maybeSingle();
        if (!data) throw new Error('Usuário não encontrado.');
        user = data;
      } else {
        const name = fd.get('name'), business = fd.get('business');
        const slug = business.toLowerCase().replace(/ /g, '-');
        const { data } = await supabase.from('professionals').insert([{ name, email, business_name: business, slug }]).select().single();
        user = data;
      }
      state.user = user;
      localStorage.setItem('prado_user', JSON.stringify(user));
      navigate('dashboard');
    } catch (err) { alert(err.message); }
    state.isLoading = false; render();
  }
};

window.onpopstate = () => {
  const path = window.location.pathname.replace('/', '');
  state.view = path || 'landing';
  render();
};

render();