"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqaqacazhdxnycxfpavy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY || 'dummy_key';
const genAI = new GoogleGenerativeAI(geminiKey);

export default function SmartDriveApp() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu'); // 'menu' ou 'shop'
  const [activeBasket, setActiveBasket] = useState(1);
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => { 
    fetchConfig(); 
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase.from('smart_config').select('*').single();
      if (data) setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // APPEL À GEMINI 3.5 FLASH
  async function generateWithGemini() {
    if (!config) return;
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Tu es un chef cuisinier et expert logistique courses Drive (Carrefour/Leclerc).
Génère un menu mensuel complet de 9 recettes (4 portions chacune = 36 repas) adaptées à un couple de 40 ans (sain, IG bas, légumes de saison de SEPTEMBRE en France, 1 cheat meal par quinzaine).
Envies formulées par le couple : "${config.cravings || 'Cuisine saine, variée et savoureuse'}".

Format impératif en JSON pur suivant ce schéma exact :
{
  "repas": [
    {
      "id": 1,
      "nom": "Nom de la recette",
      "type": "Frais",
      "ingredients": ["Ingrédient 1 (quantité)", "Ingrédient 2 (quantité)"],
      "etapes": ["Étape 1", "Étape 2", "Étape 3"],
      "conseil": "Astuce du chef pour sublimer le plat",
      "img": "🐟",
      "basket": 1
    }
  ],
  "panier_1": [
    {"nom": "Nom produit", "rayon": "Poissonnerie", "recherche_drive": "dos cabillaud frais"}
  ],
  "panier_2": [
    {"nom": "Nom produit", "rayon": "Boucherie", "recherche_drive": "pave boeuf rumsteck"}
  ]
}

Logique logistique :
- panier_1 : ingrédients stockables, surgelés, épicerie et frais pour les semaines 1 et 2.
- panier_2 : réassort ultra-frais pour les semaines 3 et 4.
Total exact : 9 recettes dans "repas".`;

      const result = await model.generateContent(prompt);
      const response = JSON.parse(result.response.text());

      await supabase.from('smart_config').update({
        menu_json: response.repas,
        panier_json: { p1: response.panier_1, p2: response.panier_2 },
        current_month: 'Septembre'
      }).eq('id', config.id);

      await fetchConfig();
      alert("Nouveau menu de Septembre généré avec succès !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateCravings(text) {
    setConfig(prev => ({ ...prev, cravings: text }));
    await supabase.from('smart_config').update({ cravings: text }).eq('id', config.id);
  }

  const copyToClipboard = (text, e) => {
    navigator.clipboard.writeText(text);
    const btn = e.currentTarget;
    btn.innerText = "COPIÉ !";
    btn.classList.add("bg-green-600", "text-white");
    setTimeout(() => {
      btn.innerText = "COPIER";
      btn.classList.remove("bg-green-600", "text-white");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-700 text-sm">Chargement de SmartDrive...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-bold">Ligne 'smart_config' introuvable dans Supabase.</p>
        <p className="text-xs text-slate-500 mt-2">Vérifiez l'étape SQL sur Supabase.</p>
      </div>
    );
  }

  const activePanierList = activeBasket === 1 
    ? (config.panier_json?.p1 || []) 
    : (config.panier_json?.p2 || []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-28 shadow-xl">
      {/* Header */}
      <header className="bg-[#0066cc] p-5 text-white sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="font-black italic text-xl tracking-tight">SMART DRIVE 🛒</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
              Septembre • 36 Repas
            </p>
          </div>
          <button
            onClick={generateWithGemini}
            className="bg-white text-[#0066cc] hover:bg-blue-50 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow active:scale-95 transition"
          >
            ⚡ Générer
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="p-4">
        {view === 'menu' ? (
          <div className="space-y-4">
            {/* Boîte des envies */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-3xl text-white shadow-md">
              <label className="block text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
                Vos envies du mois
              </label>
              <input
                type="text"
                placeholder="Ex: Lasagnes maison, sushi, un plat épicé..."
                value={config.cravings || ''}
                onChange={(e) => updateCravings(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-white placeholder-blue-200 text-sm focus:outline-none"
              />
            </div>

            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
              Les 9 Recettes du Mois
            </h2>

            {config.menu_json && config.menu_json.length > 0 ? (
              <div className="space-y-3">
                {config.menu_json.map((repas) => (
                  <div
                    key={repas.id}
                    onClick={() => setSelectedRecipe(repas)}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-98 transition cursor-pointer"
                  >
                    <div className="text-3xl w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                      {repas.img || '🍽️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                          Panier {repas.basket}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          {repas.type}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {repas.nom}
                      </h3>
                    </div>
                    <span className="text-slate-300 text-xs">›</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl text-center border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-3">Aucun menu généré pour l'instant.</p>
                <button
                  onClick={generateWithGemini}
                  className="bg-[#0066cc] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cliquez sur "Générer" en haut
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélecteur de Panier */}
            <div className="flex bg-slate-200 p-1 rounded-2xl">
              <button
                onClick={() => setActiveBasket(1)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeBasket === 1 ? 'bg-white text-[#0066cc] shadow' : 'text-slate-500'
                }`}
              >
                Panier 1 (Début)
              </button>
              <button
                onClick={() => setActiveBasket(2)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeBasket === 2 ? 'bg-white text-[#0066cc] shadow' : 'text-slate-500'
                }`}
              >
                Panier 2 (Mi-mois)
              </button>
            </div>

            <div className="space-y-2">
              {activePanierList.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-3.5 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">
                      {item.rayon}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{item.nom}</span>
                  </div>
                  <button
                    onClick={(e) => copyToClipboard(item.recherche_drive || item.nom, e)}
                    className="bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition"
                  >
                    COPIER
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Fiche Recette */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-4xl">{selectedRecipe.img}</span>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">{selectedRecipe.nom}</h2>
          
          {selectedRecipe.conseil && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-sm italic mb-6">
              💡 {selectedRecipe.conseil}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Ingrédients (4 portions)
              </h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients?.map((ing, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Préparation
              </h3>
              <div className="space-y-3">
                {selectedRecipe.etapes?.map((etape, i) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="font-black text-blue-600">{i + 1}.</span>
                    <p>{etape}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation basse */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 py-3 flex justify-around items-center z-30">
        <button
          onClick={() => setView('menu')}
          className={`flex flex-col items-center gap-1 ${
            view === 'menu' ? 'text-[#0066cc] font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🍽️</span>
          <span className="text-[10px] uppercase tracking-wider">Planning</span>
        </button>
        <button
          onClick={() => setView('shop')}
          className={`flex flex-col items-center gap-1 ${
            view === 'shop' ? 'text-[#0066cc] font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px] uppercase tracking-wider">Courses Drive</span>
        </button>
      </nav>
    </div>
  );
}
