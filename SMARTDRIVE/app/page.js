"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Sécurité anti-crash au build Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqaqacazhdxnycxfpavy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY || 'dummy_key';
const genAI = new GoogleGenerativeAI(geminiKey);

export default function SmartDriveApp() {
  // 1. DÉTECTION TEMPORELLE AUTOMATIQUE (Mois et Jour réels)
  const moisFrancais = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const dateDuJour = new Date();
  const moisActuel = moisFrancais[dateDuJour.getMonth()];
  const jourDuMois = dateDuJour.getDate();

  // États de l'application
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu'); // 'menu' ou 'shop'
  // Si on a dépassé le 15 du mois, on ouvre automatiquement sur le Panier 2 !
  const [activeBasket, setActiveBasket] = useState(jourDuMois > 15 ? 2 : 1);
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => { 
    fetchConfig(); 
  }, []);

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('smart_config').select('*').single();
      if (data) setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // 2. GESTION DES NOTES (1 À 5 ÉTOILES)
  async function updateRating(recipeId, rating, e) {
    if (e) e.stopPropagation();
    const updatedMenu = (config.menu_json || []).map(r => {
      if (r.id === recipeId) {
        const newRating = r.rating === rating ? 0 : rating;
        return { ...r, rating: newRating };
      }
      return r;
    });

    setConfig(prev => ({ ...prev, menu_json: updatedMenu }));
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      setSelectedRecipe(prev => ({ ...prev, rating: prev.rating === rating ? 0 : rating }));
    }

    await supabase.from('smart_config').update({ menu_json: updatedMenu }).eq('id', config.id);
  }

  // 3. GESTION DU STOCK ("J'ai déjà à la maison")
  async function toggleItemStock(basketKey, index) {
    const list = config.panier_json?.[basketKey] || [];
    const updatedList = list.map((item, i) => {
      if (i === index) return { ...item, in_stock: !item.in_stock };
      return item;
    });

    const updatedPanierJson = {
      ...config.panier_json,
      [basketKey]: updatedList
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('smart_config').update({ panier_json: updatedPanierJson }).eq('id', config.id);
  }

  // 4. GÉNÉRATION IA AVEC SAISONNALITÉ DYNAMIQUE ET MÉMOIRE DES NOTES
  async function generateWithGemini() {
    if (!config) return;
    setLoading(true);

    // Analyse des étoiles données par le couple
    const lovedRecipes = (config.menu_json || [])
      .filter(r => r.rating >= 4)
      .map(r => r.nom);
    const dislikedRecipes = (config.menu_json || [])
      .filter(r => r.rating && r.rating <= 2)
      .map(r => r.nom);

    const prompt = `Tu es un chef cuisinier et expert logistique courses Drive (Carrefour/Leclerc).
Génère un menu de 9 recettes (4 portions chacune = 36 repas) pour un couple de 40 ans (sain, équilibré, index glycémique bas, légumes et fruits de saison de ${moisActuel.toUpperCase()} en France, 1 cheat meal par quinzaine).
Envies formulées par le couple : "${config.cravings || 'Cuisine variée, savoureuse et saine'}".

HISTORIQUE DES GOÛTS :
- Plats adorés précédemment (note 4 ou 5 étoiles, à réinviter ou s'en inspirer) : ${lovedRecipes.length ? lovedRecipes.join(', ') : 'Aucun pour le moment'}.
- Plats détestés (note 1 ou 2 étoiles, NE JAMAIS PROPOSER) : ${dislikedRecipes.length ? dislikedRecipes.join(', ') : 'Aucun'}.

Format impératif en JSON pur suivant cette structure exacte :
{
  "repas": [
    {
      "id": 1,
      "nom": "Nom de la recette",
      "type": "Frais",
      "ingredients": ["Ingrédient 1 (quantité)", "Ingrédient 2 (quantité)"],
      "etapes": ["Étape 1", "Étape 2", "Étape 3"],
      "conseil": "Astuce du chef pour sublimer le plat",
      "img": "🍋",
      "basket": 1,
      "rating": 0
    }
  ],
  "panier_1": [
    {"nom": "Nom produit", "rayon": "Poissonnerie", "recherche_drive": "terme exact drive", "in_stock": false}
  ],
  "panier_2": [
    {"nom": "Nom produit", "rayon": "Boucherie", "recherche_drive": "terme exact drive", "in_stock": false}
  ]
}

Logique logistique impérative :
- panier_1 : ingrédients stockables, épicerie, surgelés et produits frais pour les semaines 1 et 2.
- panier_2 : réassort ultra-frais pour les semaines 3 et 4.
Total exact : 9 recettes dans "repas".`;

    try {
      let responseText;
      try {
        // Modèle principal ultra-rapide
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        console.warn("Modèle 3.5 saturé, bascule automatique sur 2.5-flash...", err);
        // Modèle de secours haute capacité
        const fallback = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await fallback.generateContent(prompt);
        responseText = result.response.text();
      }

      const response = JSON.parse(responseText);

      await supabase.from('smart_config').update({
        menu_json: response.repas,
        panier_json: { p1: response.panier_1, p2: response.panier_2 },
        current_month: moisActuel
      }).eq('id', config.id);

      await fetchConfig();
      alert(`Nouveau menu de ${moisActuel} généré avec succès !`);
    } catch (e) {
      console.error(e);
      alert("Erreur de génération : " + e.message);
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

  // Composant interactif de notation 1 à 5 étoiles
  const StarRating = ({ rating = 0, onRate }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(e) => onRate(star, e)}
          className={`text-lg transition-transform active:scale-125 ${
            star <= rating ? 'text-amber-400' : 'text-slate-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

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
      <div className="p-8 text-center text-red-500 font-bold">
        Ligne 'smart_config' introuvable dans Supabase.
      </div>
    );
  }

  const currentBasketKey = activeBasket === 1 ? 'p1' : 'p2';
  const activePanierList = config.panier_json?.[currentBasketKey] || [];
  const inStockCount = activePanierList.filter(i => i.in_stock).length;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-28 shadow-xl">
      {/* Header avec Détection Dynamique de Date */}
      <header className="bg-[#0066cc] p-5 text-white sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="font-black italic text-xl tracking-tight">SMART DRIVE 🛒</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
              {moisActuel} • 36 Repas
            </p>
          </div>
          <button
            onClick={generateWithGemini}
            className="bg-white text-[#0066cc] hover:bg-blue-50 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow active:scale-95 transition"
          >
            ⚡ Générer
          </button>
        </div>
        <p className="text-[10px] text-blue-100 font-medium">
          Aujourd'hui : {jourDuMois} {moisActuel} • {jourDuMois <= 15 ? 'Quinzaine 1 (Panier 1)' : 'Quinzaine 2 (Panier 2)'}
        </p>
      </header>

      {/* Contenu principal */}
      <main className="p-4">
        {view === 'menu' ? (
          <div className="space-y-4">
            {/* Boîte des envies du mois */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-3xl text-white shadow-md">
              <label className="block text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
                Vos envies pour {moisActuel}
              </label>
              <input
                type="text"
                placeholder="Ex: Lasagnes maison, sushi, un plat mijoté..."
                value={config.cravings || ''}
                onChange={(e) => updateCravings(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-white placeholder-blue-200 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center pl-2 pr-1">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Les 9 Recettes de {moisActuel}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold">
                Notez avec les ★
              </span>
            </div>

            {config.menu_json && config.menu_json.length > 0 ? (
              <div className="space-y-3">
                {config.menu_json.map((repas) => (
                  <div
                    key={repas.id}
                    onClick={() => setSelectedRecipe(repas)}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 active:scale-98 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                        {repas.img || '🍽️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                            Panier {repas.basket}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {repas.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">
                          {repas.nom}
                        </h3>
                      </div>
                      <span className="text-slate-300 text-xs">›</span>
                    </div>

                    {/* Système de notation par étoiles sur chaque carte */}
                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">
                        {repas.rating ? `Votre note : ${repas.rating}/5` : "Pas encore noté"}
                      </span>
                      <StarRating 
                        rating={repas.rating || 0} 
                        onRate={(star, e) => updateRating(repas.id, star, e)} 
                      />
                    </div>
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
                  Cliquez sur "⚡ Générer" en haut
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélecteur de Panier (auto-sélectionné selon le jour du mois) */}
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

            {/* Compteur "J'ai déjà à la maison" */}
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
              <span>🏠 <b>{inStockCount}</b> produit(s) déjà à la maison</span>
              <span className="text-[10px] font-black uppercase text-emerald-600">
                {activePanierList.length - inStockCount} à commander
              </span>
            </div>

            {/* Liste des ingrédients du Drive */}
            <div className="space-y-2">
              {activePanierList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleItemStock(currentBasketKey, index)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer select-none ${
                    item.in_stock 
                      ? 'bg-slate-100 border-slate-200 opacity-50' 
                      : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Checkbox ronde */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      item.in_stock 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {item.in_stock && <span className="text-xs font-bold">✓</span>}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">
                        {item.rayon}
                      </span>
                      <span className={`text-sm font-bold block truncate ${
                        item.in_stock ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {item.nom}
                      </span>
                      {item.in_stock && (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">
                          Déjà dans vos placards
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton copier Drive */}
                  {!item.in_stock ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.recherche_drive || item.nom, e);
                      }}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition flex-shrink-0"
                    >
                      COPIER
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 pr-2">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Fiche Recette détaillée */}
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
          <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedRecipe.nom}</h2>

          {/* Notation par étoiles dans la fiche recette */}
          <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-600">Votre avis :</span>
            <StarRating 
              rating={selectedRecipe.rating || 0} 
              onRate={(star) => updateRating(selectedRecipe.id, star)} 
            />
          </div>
          
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

      {/* Barre de navigation basse (Planning vs Courses) */}
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
