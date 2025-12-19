
import React, { useState } from 'react';
import { Professional, Service, View } from '../types.ts';
import { Icons } from '../constants.tsx';
import Sidebar from '../Sidebar.tsx';
import { GoogleGenAI } from '@google/genai';

interface MarketingPageProps {
  user: Professional | null;
  services: Service[];
  onLogout: () => void;
  navigate: (v: View) => void;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ user, services, onLogout, navigate }) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tone, setTone] = useState('elegant');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [isImgGenerating, setIsImgGenerating] = useState(false);
  const [imgResult, setImgResult] = useState<string | null>(null);

  const generatePost = async () => {
    if (!selectedServiceId) return;
    setIsGenerating(true);
    try {
      // Corrected: Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const service = services.find(s => s.id === selectedServiceId);
      const prompt = `Crie uma legenda de alta conversão para o Instagram para uma profissional da beleza. Serviço: ${service?.name}. Descrição: ${service?.description}. Tom: ${tone === 'elegant' ? 'Elegante' : 'Amigável'}.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      // Accessing text directly via .text property
      setResult(response.text || "Erro ao gerar legenda.");
    } catch (e) {
      console.error(e);
      setResult("Erro ao gerar conteúdo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!selectedServiceId) return;
    setIsImgGenerating(true);
    try {
      // Corrected: Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const service = services.find(s => s.id === selectedServiceId);
      const prompt = `A high quality, professional and aesthetically pleasing photo of a ${service?.name} service being performed in a modern beauty salon. Bright, minimalist background, pink and white color scheme. Close-up, artistic style.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      // Safely extract image data from response parts
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setImgResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar imagem.");
    } finally {
      setIsImgGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeView="marketing" navigate={navigate} onLogout={onLogout} />

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        <button 
          onClick={() => navigate('dashboard')}
          className="flex items-center text-gray-400 hover:text-[#FF1493] mb-6 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">
            <Icons.ArrowLeft />
          </span>
          Voltar ao Painel
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Marketing Premium AI</h1>
          <p className="text-gray-500 font-medium tracking-tight">Crie campanhas completas para suas redes sociais em segundos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight">Configuração do Post</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Serviço de Foco</label>
                <select className="w-full px-5 py-4 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#FF1493] bg-gray-50 font-bold text-sm" value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Personalidade</label>
                <div className="flex gap-2">
                  <button onClick={() => setTone('elegant')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${tone === 'elegant' ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>Sofisticada</button>
                  <button onClick={() => setTone('friendly')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${tone === 'friendly' ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>Casual</button>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <button onClick={generatePost} disabled={isGenerating || !selectedServiceId} className="w-full bg-[#FF1493] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-700 transition-all shadow-2xl shadow-pink-100 disabled:opacity-50 flex items-center justify-center space-x-3 active:scale-95">
                  {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> : <Icons.Brain />}
                  <span>Gerar Legenda</span>
                </button>
                <button onClick={generateImage} disabled={isImgGenerating || !selectedServiceId} className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-3 active:scale-95">
                  {isImgGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> : <Icons.Camera />}
                  <span>Criar Arte IA</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 min-h-[350px] relative overflow-hidden">
              <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight flex items-center gap-2">
                <Icons.Sparkles />
                Sua Legenda Copiada
              </h2>
              {result ? (
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 animate-fade-in">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm font-medium leading-loose">{result}</pre>
                  <button onClick={() => navigator.clipboard.writeText(result)} className="mt-6 flex items-center space-x-2 text-[#FF1493] font-black text-[10px] uppercase tracking-widest hover:underline">
                    <Icons.Copy />
                    <span>Copiar Legenda</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Aguardando geração de conteúdo...</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-black mb-8 uppercase tracking-tight flex items-center gap-2">
                <Icons.Camera />
                Artes Sugeridas
              </h2>
              {imgResult ? (
                <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in">
                  <img src={imgResult} className="w-full aspect-square object-cover" alt="IA Generated Marketing" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                    <button onClick={() => { const link = document.createElement('a'); link.href = imgResult; link.download = 'marketing-prado.png'; link.click(); }} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Baixar Arquivo Profissional</button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300 border-4 border-dashed border-gray-100 transition-colors">
                  <div className="scale-150 mb-6 opacity-20"><Icons.Camera /></div>
                  <p className="font-black text-[10px] uppercase tracking-[0.2em]">Crie uma imagem exclusiva com IA</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketingPage;
