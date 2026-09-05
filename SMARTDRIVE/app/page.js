import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialisation des clients
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);

export default function SmartDriveApp() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu'); // 'menu' ou 'shop'
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    const { data } = await supabase.from('smart_config').select('*').single();
    setConfig(data);
    setLoading(false);
  }

  // LE CŒUR : Appel à Gemini pour générer les 36 repas
  async function generateWithGemini() {
    setLoading(true);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Génère 9 recettes saines et de saison (Septembre France) pour 36 repas total.
    Envies : ${config.cravings}. Favoris à inclure si possible : ${JSON.stringify(config.favorites)}.
    Structure : 2 Paniers (Panier 1: Stock/Congelé/Frais Semaine 1, Panier 2: Frais Semaine 3).
    Réponds EXCLUSIVEMENT en JSON avec cette structure :
    { "repas": [{ "id", "nom", "type", "ingredients": [], "etapes": [], "conseil": "", "img": "emoji", "basket": 1/2 }],
      "panier_1": [{ "nom", "rayon", "recherche_drive" }],
      "panier_2": [{ "nom", "rayon", "recherche_drive" }] }`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    await supabase.from('smart_config').update({
      menu_json: response.repas,
      panier_json: { p1: response.panier_1, p2: response.panier_2 },
      current_month: 'Septembre'
    }).eq('id', config.id);
    
    fetchConfig();
  }

  async function toggleFavorite(id) {
    const newFavs = config.favorites.includes(id) 
      ? config.favorites.filter(f => f !== id) 
      : [...config.favorites, id];
    await supabase.from('smart_config').update({ favorites: newFavs }).eq('id', config.id);
    fetchConfig();
  }

  if (loading) return <div className="p-10 text-center font-bold">Synchronisation Gemini...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-24 font-sans">
      {/* HEADER TYPE DRIVE */}
      <header className="bg-[#0066cc] p-5 text-white sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="font-black italic text-xl uppercase tracking-tighter text-white">Smart Drive 🛒</h1>
          <button onClick={generateWithGemini} className="bg-white/20 p-2 rounded-xl text-[10px] font-bold">
            GÉNÉRER {config.current_month}
          </button>
        </div>
      </header>

      {/* VUE MENU (PLANNING) */}
      {view === 'menu' && (
        <main className="p-4 space-y-4">
          <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl">
            <p className="text-[10px] font-bold opacity-70 uppercase mb-2">Vos Envies</p>
            <input 
              className="bg-transparent border-b border-white/30 w-full outline-none text-sm"
              value={config.cravings}
              onChange={(e) => setConfig({...config, cravings: e.target.value})}
              onBlur={async () => await supabase.from('smart_config').update({ cravings: config.cravings }).eq('id', config.id)}
            />
          </div>

          {config.menu_json?.map(repas => (
            <div key={repas.id} onClick={() => setSelectedRecipe(repas)} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="text-3xl bg-slate-50 w-14 h-14 flex items-center justify-center rounded-2xl">{repas.img}</div>
              <div className="flex-1">
                <span className="text-[8px] font-black text-blue-500 uppercase">Panier {repas.basket}</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">{repas.nom}</h3>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(repas.id); }}>
                <i className={`fas fa-star ${config.favorites.includes(repas.id) ? 'text-yellow-400' : 'text-slate-200'}`}></i>
              </button>
            </div>
          ))}
        </main>
      )}

      {/* VUE SHOP (COURSES) */}
      {view === 'shop' && (
        <main className="p-4 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Listes Drive Carrefour/Leclerc</h2>
            {/* Affichage des listes panier_json.p1 et p2 avec bouton COPIER */}
            {config.panier_json?.p1.map((item, i) => (
               <div key={i} className="bg-white p-3 rounded-2xl flex justify-between items-center shadow-sm">
                  <span className="text-xs font-bold text-slate-700">{item.nom}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(item.recherche_drive)}
                    className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-2 rounded-xl"
                  >AJOUTER</button>
               </div>
            ))}
        </main>
      )}

      {/* MODAL RECETTE */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-white z-[100] p-6 overflow-y-auto animate-in slide-in-from-bottom">
            <button onClick={() => setSelectedRecipe(null)} className="mb-6 bg-slate-100 p-3 rounded-full"><i className="fas fa-times"></i></button>
            <div className="text-7xl mb-4">{selectedRecipe.img}</div>
            <h2 className="text-2xl font-black mb-6">{selectedRecipe.nom}</h2>
            <div className="space-y-6 text-sm">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-800 italic">"{selectedRecipe.conseil}"</div>
                <div>
                    <p className="font-black text-xs uppercase text-slate-400 mb-2">Ingrédients :</p>
                    {selectedRecipe.ingredients.map(ing => <div key={ing}>• {ing}</div>)}
                </div>
                <div>
                    <p className="font-black text-xs uppercase text-slate-400 mb-2">Étapes :</p>
                    {selectedRecipe.etapes.map((step, i) => <div key={i} className="mb-2"><b>{i+1}.</b> {step}</div>)}
                </div>
            </div>
        </div>
      )}

      {/* TAB BAR NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center shadow-2xl">
        <button onClick={() => setView('menu')} className={view === 'menu' ? 'text-blue-600' : 'text-slate-400'}>
          <i className="fas fa-utensils text-xl"></i>
        </button>
        <button onClick={() => setView('shop')} className={view === 'shop' ? 'text-blue-600' : 'text-slate-400'}>
          <i className="fas fa-shopping-basket text-xl"></i>
        </button>
      </nav>
    </div>
  );
}