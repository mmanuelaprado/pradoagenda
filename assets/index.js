import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1.34.0';

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://acpyjpbkigjnizvsbdoi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5IUT2-3ML9WkM5BFcV_8Sg_x-N0BmHp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTADO ---
let state = {
  view: 'landing',
  user: JSON.parse(localStorage.getItem('prado_user') || 'null'),
  isLoading: true,
  appointments: [],
  services: [],
  config: { themeColor: '#FF1493' }
};

// --- ICONES ---
const Icons = {
  Home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  Calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  Scissors: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/><path d="M14.8 9.2 20 4"/><path d="M8.12 15.88 12 12"/></svg>',
  Brain: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/></svg>',
  Logout: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>'
};

// --- ROTEADOR ---
function navigate(view) {
  state.view = view;
  const url = view === 'landing' ? '/' : `/${view}`;
  window.history.pushState({}, '', url);
  render();
}

async function loadData() {
  if (!state.user) return;
  try {
    const [appts, svcs] = await Promise.all([
      supabase.from('appointments').select('*').eq('professional_id', state.user.id),
      supabase.from('services').select('*').eq('professional_id', state.user.id)
    ]);
    state.appointments = appts.data || [];
    state.services = svcs.data || [];
  } catch (e) { console.error(e); }
}

// --- COMPONENTES ---
function Layout(content) {
  const brand = state.config.themeColor;
  return `
    <div class="flex min-h-screen">
      <aside class="w-72 bg-black text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div class="mb-16 font-black text-xl flex items-center gap-3">
          <div class="w-10 h-10 bg-[${brand}] rounded-xl flex items-center justify-center shadow-lg">P</div>
          PRADO AGENDA
        </div>
        <nav class="flex-grow space-y-3">
          ${[
            { id: 'dashboard', label: 'Início', icon: Icons.Home },
            { id: 'agenda', label: 'Agenda', icon: Icons.Calendar },
            { id: 'services', label: 'Serviços', icon: Icons.Scissors },
            { id: 'marketing', label: 'Marketing IA', icon: Icons.Brain }
          ].map(item => `
            <button onclick="window.app.navigate('${item.id}')" class="w-full text-left p-4 rounded-2xl flex items-center gap-4 font-bold transition-all ${state.view === item.id ? 'bg-white/10 text-[#FF1493]' : 'text-gray-500 hover:bg-white/5'}">
              ${item.icon} ${item.label}
            </button>
          `).join('')}
        </nav>
        <button onclick="window.app.logout()" class="p-4 text-gray-500 hover:text-red-400 flex items-center gap-4 font-bold transition-all">${Icons.Logout} Sair</button>
      </aside>
      <main class="flex-grow p-8 md:p-12 bg-gray-50 animate-fade overflow-y-auto">
        ${content}
      </main>
    </div>
  `;
}

function render() {
  const root = document.getElementById('root');
  if (state.isLoading) {
    root.innerHTML = `<div class="min-h-screen flex flex-col items-center justify-center bg-white"><div class="w-10 h-10 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin"></div></div>`;
    return;
  }

  let html = '';
  if (state.view === 'landing') {
    html = `
      <div class="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
        <h1 class="text-7xl font-black mb-6 tracking-tighter leading-none">Sua agenda <br><span class="text-[#FF1493]">perfeita.</span></h1>
        <p class="text-xl text-gray-400 mb-12 max-w-md">O sistema de agendamento online mais sofisticado para profissionais de elite.</p>
        <div class="flex gap-4">
          <button onclick="window.app.navigate('signup')" class="bg-[#FF1493] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Começar Agora</button>
          <button onclick="window.app.navigate('login')" class="bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">Entrar</button>
        </div>
      </div>
    `;
  } else if (state.view === 'login' || state.view === 'signup') {
    html = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl text-center">
          <h2 class="text-3xl font-black mb-8">${state.view === 'login' ? 'Bem-vinda' : 'Crie sua conta'}</h2>
          <form onsubmit="window.app.handleAuth(event, '${state.view}')" class="space-y-4">
            ${state.view === 'signup' ? `
              <input name="name" placeholder="Seu Nome" required class="w-full p-4 rounded-xl bg-gray-50 border-none font-bold outline-none ring-2 ring-transparent focus:ring-[#FF1493]">
              <input name="business" placeholder="Nome do Salão" required class="w-full p-4 rounded-xl bg-gray-50 border-none font-bold outline-none ring-2 ring-transparent focus:ring-[#FF1493]">
            ` : ''}
            <input name="email" type="email" placeholder="E-mail" required class="w-full p-4 rounded-xl bg-gray-50 border-none font-bold outline-none ring-2 ring-transparent focus:ring-[#FF1493]">
            <button class="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest mt-4 shadow-xl">Continuar</button>
          </form>
          <button onclick="window.app.navigate('${state.view === 'login' ? 'signup' : 'login'}')" class="mt-8 text-xs font-black text-gray-400 uppercase tracking-widest">
            ${state.view === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    `;
  } else {
    // Conteúdo do Dashboard e outras views protegidas
    let viewContent = '';
    if (state.view === 'dashboard') {
      viewContent = `
        <h1 class="text-4xl font-black mb-8">Painel de Controle</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-[2.5rem] shadow-sm">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Agendamentos</p>
            <p class="text-4xl font-black">${state.appointments.length}</p>
          </div>
          <div class="bg-white p-8 rounded-[2.5rem] shadow-sm">
            <p class="text-[10px] font-black uppercase text-gray-400 mb-2">Serviços</p>
            <p class="text-4xl font-black">${state.services.length}</p>
          </div>
          <div class="bg-black text-white p-8 rounded-[2.5rem] shadow-xl">
            <p class="text-[10px] font-black uppercase text-white/40 mb-2">Link Público</p>
            <p class="text-sm font-bold truncate">pradoagenda.vercel.app/${state.user.slug}</p>
          </div>
        </div>
      `;
    } else if (state.view === 'marketing') {
      viewContent = `
        <h1 class="text-4xl font-black mb-8">Marketing IA</h1>
        <div class="bg-white p-12 rounded-[3.5rem] shadow-sm text-center">
          <div class="w-20 h-20 bg-pink-50 text-[#FF1493] rounded-3xl flex items-center justify-center mx-auto mb-6">${Icons.Brain}</div>
          <h2 class="text-2xl font-black mb-4 uppercase">Crie legendas perfeitas</h2>
          <button onclick="window.app.generateMarketing()" class="bg-[#FF1493] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-xl">Gerar com IA</button>
          <div id="marketing-result" class="mt-8 text-left text-sm text-gray-500 whitespace-pre-wrap"></div>
        </div>
      `;
    }
    html = Layout(viewContent);
  }
  
  root.innerHTML = html;
}

// --- APP GLOBAL ---
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
        if (!data) throw new Error('E-mail não encontrado.');
        user = data;
      } else {
        const name = fd.get('name'), business = fd.get('business');
        const slug = business.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const { data } = await supabase.from('professionals').insert([{ name, email, business_name: business, slug }]).select().single();
        user = data;
      }
      state.user = user;
      localStorage.setItem('prado_user', JSON.stringify(user));
      await loadData();
      navigate('dashboard');
    } catch (err) { alert(err.message); }
    state.isLoading = false; render();
  },
  generateMarketing: async () => {
    const btn = event.target;
    btn.disabled = true; btn.innerText = 'Gerando...';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Crie uma legenda luxuosa para Instagram de um salão de beleza chamado ${state.user.business_name}.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      document.getElementById('marketing-result').innerText = response.text;
    } catch (e) { alert('Erro na IA'); }
    btn.disabled = false; btn.innerText = 'Gerar com IA';
  }
};

// --- INIT ---
(async () => {
  if (state.user) await loadData();
  const path = window.location.pathname.replace('/', '');
  state.view = path || (state.user ? 'dashboard' : 'landing');
  state.isLoading = false;
  render();
})();