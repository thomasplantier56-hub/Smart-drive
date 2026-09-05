"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);

export default function SmartDriveApp() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu');
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    const { data, error } = await supabase.from('smart_config').select('*').single();
    if (data) setConfig(data);
    setLoading(false);
  }

  async function generateWithGemini() {
    setLoading(true);
    // Utilisation de Gemini 1.5 Pro pour une intelligence maximale
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Tu es un chef étoilé expert en nutrition. 
    Génère 9 recettes uniques et gourmandes pour Septembre (saison France).
    Envies du moment : ${config.cravings}. 
    Favoris à inclure : ${JSON.stringify(config.favorites)}.
    Structure : 36 repas total (4 portions par recette).
    Paniers : Panier 1 (Stock/Surgelés), Panier 2 (Frais semaine 3).
    Réponds UNIQUEMENT en JSON :
    { "repas": [{ "id", "nom", "type", "ingredients": [], "etapes": [], "conseil": "", "img": "emoji", "basket": 1/2 }],
      "panier_1": [{ "nom", "rayon", "recherche_drive" }],
      "panier_2": [{ "nom", "rayon", "recherche_drive" }] }`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "");
        const response = JSON.parse(text);

        await supabase.from('smart_config').update({
          menu_json: response.repas,
          panier_json: { p1: response.panier_1, p2: response.panier_2 }
        }).eq('id', config.id);
        
        fetchConfig();
    } catch (e) {
        alert("Erreur Gemini : " + e.message);
        setLoading(false);
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Chargement SmartDrive...</div>;
  if (!config) return <div className="p-10 text-center">Erreur : Ligne 'smart_config' introuvable dans Supabase.</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-24 shadow-2xl border-x">
      <header className="bg-[#0066cc] p-6 text-white sticky top-0 z-50 shadow-lg rounded-b-3xl">
        <div className="flex justify-between items-center">
          <h1 className="font-black italic text-xl tracking-tighter">SMART DRIVE PRO</h1>
          <button onClick={generateWithGemini} className="bg-white/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition">
            Générer
          </button>
        </div>
      </header>

      <main className="p-4">
        {view === 'menu' ? (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 italic text-slate-500 text-sm">
              "Chef, ce mois-ci on a envie de : {config.cravings || 'Rien de spécial...'}"
            </div>
            {config.menu_json?.map(repas => (
              <div key={repas.id} onClick={() => setSelectedRecipe(repas)} className="bg-white p-4 rounded-3xl shadow-md flex items-center gap-4 active:scale-95 transition cursor-pointer">
                <div className="text-3xl">{repas.img}</div>
                <div className="flex-1 font-bold text-slate-800 text-sm">{repas.nom}</div>
                <div className="text-blue-500 text-xs font-black">P{repas.basket}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
             <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveBasket(1)} className="flex-1 p-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Panier 1</button>
                <button onClick={() => setActiveBasket(2)} className="flex-1 p-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">Panier 2</button>
             </div>
             {config.panier_json?.p1.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50">
                   <span className="text-sm font-bold text-slate-700">{item.nom}</span>
                   <button onClick={() => navigator.clipboard.writeText(item.recherche_drive)} className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-2 rounded-xl">COPIER</button>
                </div>
             ))}
          </div>
        )}
      </main>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-white z-[100] p-8 overflow-y-auto">
            <button onClick={() => setSelectedRecipe(null)} className="mb-6 bg-slate-100 w-12 h-12 rounded-full"><i className="fas fa-times"></i></button>
            <div className="text-8xl mb-6 text-center">{selectedRecipe.img}</div>
            <h2 className="text-3xl font-black mb-6 leading-tight">{selectedRecipe.nom}</h2>
            <div className="bg-blue-50 p-6 rounded-3xl text-blue-800 mb-8 font-medium">"{selectedRecipe.conseil}"</div>
            <div className="space-y-8">
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Ingrédients</h3>
                    {selectedRecipe.ingredients.map(ing => <div key={ing} className="py-2 border-b border-slate-100 text-slate-700 font-medium">• {ing}</div>)}
                </div>
            </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t p-4 flex justify-around items-center">
        <button onClick={() => setView('menu')} className={`text-2xl ${view === 'menu' ? 'text-blue-600' : 'text-slate-300'}`}><i className="fas fa-utensils"></i></button>
        <button onClick={() => setView('shop')} className={`text-2xl ${view === 'shop' ? 'text-blue-600' : 'text-slate-300'}`}><i className="fas fa-shopping-basket"></i></button>
      </nav>
    </div>
  );
}