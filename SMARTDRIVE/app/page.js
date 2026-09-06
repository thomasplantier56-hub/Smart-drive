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

// Nettoyage automatique des mots-clés superflus pour le Drive
function cleanDriveTerm(text) {
  if (!text) return "";
  return text
    .replace(/\b(aop|igp|bio|frais|sauvage|fruitier|fermier|extra|entier|nature)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Photos culinaires HD pour les recettes (Planning)
function getRecipePhoto(dishName = "", type = "") {
  const name = dishName.toLowerCase();
  if (name.includes("saumon") || name.includes("cabillaud") || name.includes("poisson")) {
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("curry") || name.includes("poulet") || name.includes("wok")) {
    return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("pâtes") || name.includes("gnocchi") || name.includes("lasagne")) {
    return "https://images.unsplash.com/photo-1621996346565-e3d5d6281220?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("boeuf") || name.includes("bœuf") || name.includes("steak")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("salade") || name.includes("bowl") || name.includes("quinoa")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("dahl") || name.includes("lentille") || name.includes("soupe")) {
    return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80";
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80";
}

// Miniatures photos pour les ingrédients de la liste de courses (Drive)
function getProductThumbnail(productName = "", rayon = "") {
  const p = (productName + " " + rayon).toLowerCase();
  if (p.includes("poulet") || p.includes("dinde") || p.includes("volaille")) {
    return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("boeuf") || p.includes("steak") || p.includes("viande") || p.includes("boucherie")) {
    return "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("poisson") || p.includes("saumon") || p.includes("cabillaud") || p.includes("crevette") || p.includes("poissonnerie")) {
    return "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("fromage") || p.includes("reblochon") || p.includes("mozzarella") || p.includes("feta") || p.includes("crémerie") || p.includes("cremerie") || p.includes("lait") || p.includes("creme")) {
    return "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("courgette") || p.includes("aubergine") || p.includes("poivron") || p.includes("brocoli") || p.includes("légume") || p.includes("fruit") || p.includes("tomate") || p.includes("carotte") || p.includes("oignon") || p.includes("figue") || p.includes("poireau")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("pain") || p.includes("burger") || p.includes("pâte") || p.includes("boulangerie")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("riz") || p.includes("lentille") || p.includes("quinoa") || p.includes("pâtes") || p.includes("epicerie") || p.includes("huile") || p.includes("sauce")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=80";
  }
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80";
}

export default function SmartDriveApp() {
  const moisFrancais = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const dateDuJour = new Date();
  const moisActuel = moisFrancais[dateDuJour.getMonth()];
  const jourDuMois = dateDuJour.getDate();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu');
  // L'état activeBasket pilote à la fois le Planning et les Courses
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

  async function toggleItemMode(basketKey, index, e) {
    e.stopPropagation();
    const list = config.panier_json?.[basketKey] || [];
    const updatedList = list.map((item, i) => {
      if (i === index) {
        const currentMode = item.mode_choisi || 'frais';
        const newMode = currentMode === 'congelo' ? 'frais' : 'congelo';
        return { ...item, mode_choisi: newMode, a_alternative_congelo: true };
      }
      return item;
    });

    const updatedPanierJson = {
      ...config.panier_json,
      [basketKey]: updatedList
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('smart_config').update({ panier_json: updatedPanierJson }).eq('id', config.id);
  }

  async function generateWithGemini() {
    if (!config) return;
    setLoading(true);

    const lovedRecipes = (config.menu_json || [])
      .filter(r => r.rating >= 4)
      .map(r => r.nom);
    const dislikedRecipes = (config.menu_json || [])
      .filter(r => r.rating && r.rating <= 2)
      .map(r => r.nom);

    const prompt = `Tu es un chef cuisinier étoilé et logisticien financier expert en optimisation de Drive pour un couple de 40 ans.
RÉPARTITION STRICTE DU MOIS EN 2 QUINZAINES :
- Les recettes 1, 2, 3, 4, 5 DOIVENT AVOIR "basket": 1 (Quinzaine 1 - Panier 1). Produits ultra-frais pour démarrer la 1ère quinzaine + stock.
- Les recettes 6, 7, 8, 9 DOIVENT AVOIR "basket": 2 (Quinzaine 2 - Panier 2). Réassort ULTRA-FRAIS pour démarrer la 2ème quinzaine (poisson/viande fraîche, légumes fragiles) + réassort stock.
Total exact : 9 recettes (5 pour la quinzaine 1, 4 pour la quinzaine 2).

LE GRAND CONGÉLATEUR COMME ALTERNATIVE ANTI-GASPI / ANTI-RADIN :
Pour chaque produit qui s'y prête (viande, poisson, légumes bruts), propose l'option FRAIS (boucherie/poissonnerie) ET l'option CONGÉLO (surgelé brut économique -30% pour remplir le grand congélateur du garage).

CONTRAINTE BUDGÉTAIRE : ~220€ à 240€ mensuel strict pour l'alimentation des 36 repas (sans alcool ni ménager).
Marques distributeurs prioritaires (Marque Repère Leclerc, Carrefour Classic).

Génère 9 recettes de saison pour ${moisActuel.toUpperCase()} en France (4 portions par recette = 36 repas).
Profil santé : 40 ans, IG bas, vitalité, immunité de saison, 1 cheat meal par quinzaine.
Envies du couple : "${config.cravings || 'Cuisine savoureuse, saine et équilibrée'}".

HISTORIQUE DES GOÛTS :
- Plats adorés (4 ou 5 étoiles) : ${lovedRecipes.length ? lovedRecipes.join(', ') : 'Aucun'}.
- Plats détestés (1 ou 2 étoiles, BANNIS) : ${dislikedRecipes.length ? dislikedRecipes.join(', ') : 'Aucun'}.

Pour chaque ingrédient dans panier_1 et panier_2 :
- "nom": Nom produit
- "rayon": Rayon Drive
- "a_alternative_congelo": true si une version surgelée existe, false sinon
- "mode_choisi": "frais"
- "prix_frais": prix en euros
- "recherche_frais": 1 ou 2 mots simples (ex: "saumon", "poulet", "brocolis")
- "prix_congelo": prix surgelé économique, ou null
- "recherche_congelo": mot simple (ex: "saumon surgele"), ou null
- "gain_anti_radin": économie (ex: "-30%"), ou null
- "conseil_anti_gaspi": astuce courte

Format impératif en JSON pur :
{
  "repas": [
    {
      "id": 1,
      "nom": "Nom recette Q1",
      "type": "Frais",
      "calories": "510 kcal",
      "temps": "25 min",
      "bienfait_sante": "🛡️ Bouclier immunitaire",
      "saison_atout": "Légumes d'automne",
      "ingredients": ["Ingrédient 1", "Ingrédient 2"],
      "etapes": ["Étape 1", "Étape 2"],
      "conseil": "Astuce chef",
      "basket": 1,
      "rating": 0
    },
    {
      "id": 6,
      "nom": "Nom recette Q2",
      "type": "Frais",
      "calories": "480 kcal",
      "temps": "20 min",
      "bienfait_sante": "🧠 Riche en Oméga-3",
      "saison_atout": "Produit de saison",
      "ingredients": ["Ingrédient 1", "Ingrédient 2"],
      "etapes": ["Étape 1", "Étape 2"],
      "conseil": "Astuce chef",
      "basket": 2,
      "rating": 0
    }
  ],
  "panier_1": [
    {
      "nom": "Pavés de Saumon",
      "rayon": "Poissonnerie",
      "a_alternative_congelo": true,
      "mode_choisi": "frais",
      "prix_frais": 10.50,
      "recherche_frais": "saumon",
      "prix_congelo": 6.90,
      "recherche_congelo": "saumon surgele",
      "gain_anti_radin": "-34%",
      "conseil_anti_gaspi": "🧊 Idéal en surgelé pour votre grand congélateur",
      "in_stock": false
    }
  ],
  "panier_2": [
    {
      "nom": "Pavé de Bœuf Rumsteck",
      "rayon": "Boucherie",
      "a_alternative_congelo": true,
      "mode_choisi": "frais",
      "prix_frais": 11.20,
      "recherche_frais": "pave boeuf",
      "prix_congelo": 8.10,
      "recherche_congelo": "steak hache surgele",
      "gain_anti_radin": "-28%",
      "conseil_anti_gaspi": "🌿 Ultra-frais pour démarrer la 2ème quinzaine",
      "in_stock": false
    }
  ]
}`;

    try {
      let responseText;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        console.warn("Bascule sur 2.5-flash...", err);
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
      alert(`Menu complet de ${moisActuel} généré sur les 2 quinzaines !`);
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
    const initialText = btn.innerText;
    btn.innerText = "COPIÉ !";
    btn.classList.add("bg-green-600", "text-white");
    setTimeout(() => {
      btn.innerText = initialText;
      btn.classList.remove("bg-green-600", "text-white");
    }, 1500);
  };

  const StarRating = ({ rating = 0, onRate }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(e) => onRate(star, e)}
          className={`text-base transition-transform active:scale-125 ${
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

  // Calcul dynamique selon les modes choisis (Frais vs Congelo) en excluant le stock
  const totalPanierEstime = activePanierList
    .filter(i => !i.in_stock)
    .reduce((sum, i) => {
      const isCongelo = i.mode_choisi === 'congelo';
      const prix = isCongelo && i.prix_congelo ? Number(i.prix_congelo) : Number(i.prix_frais || 2.5);
      return sum + prix;
    }, 0);

  // Total économisé grâce aux choix Anti-Radin
  const totalEconomiesRealisees = activePanierList
    .filter(i => !i.in_stock && i.mode_choisi === 'congelo' && i.prix_congelo && i.prix_frais)
    .reduce((sum, i) => sum + (Number(i.prix_frais) - Number(i.prix_congelo)), 0);

  // Filtrage intelligent des repas du planning selon la Quinzaine active (avec sécurité par index)
  const mealsForActiveQuinzaine = (config.menu_json || []).filter((repas, index) => {
    // Si Gemini a bien mis basket 1 ou 2
    if (repas.basket === 1 || repas.basket === 2) {
      return repas.basket === activeBasket;
    }
    // Sécurité de secours : les 5 premières recettes vont en Q1, les 4 suivantes en Q2
    return activeBasket === 1 ? index < 5 : index >= 5;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-100 pb-28 shadow-2xl">
      {/* Header Premium - Dynamique selon la quinzaine consultée ! */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white sticky top-0 z-40 shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="font-black italic text-2xl tracking-tight flex items-center gap-2">
              SMART DRIVE <span className="text-xs bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full not-italic">CHEF</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mt-0.5">
              {moisActuel} • 36 Repas • Choix Frais & Congélo
            </p>
          </div>
          <button
            onClick={generateWithGemini}
            className="bg-white text-blue-800 hover:bg-amber-400 hover:text-slate-950 px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition"
          >
            ⚡ Générer
          </button>
        </div>

        {/* Le badge ici s'adapte en direct à ce que vous regardez ! */}
        <div className="flex items-center justify-between text-[11px] text-blue-100 font-medium mt-2 pt-2 border-t border-white/10">
          <span>📅 {jourDuMois} {moisActuel}</span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Consultation : Quinzaine {activeBasket} (Panier {activeBasket})
          </span>
        </div>
      </header>

      <main className="p-4">
        {/* Sélecteur Universel de Quinzaine (présent dans Planning ET dans Courses !) */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-4 shadow-inner">
          <button
            onClick={() => setActiveBasket(1)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeBasket === 1 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quinzaine 1 (Sem. 1 & 2)
          </button>
          <button
            onClick={() => setActiveBasket(2)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeBasket === 2 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quinzaine 2 (Sem. 3 & 4)
          </button>
        </div>

        {view === 'menu' ? (
          <div className="space-y-4">
            {/* Boîte des envies */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
              <label className="block text-[11px] font-black uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
                <span>✨</span> Vos envies gustatives pour {moisActuel}
              </label>
              <input
                type="text"
                placeholder="Ex: Lasagnes légères, poisson au four, curry doux..."
                value={config.cravings || ''}
                onChange={(e) => updateCravings(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div className="flex justify-between items-center pl-1 pr-1">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Repas de la Quinzaine {activeBasket}
              </h2>
              <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {mealsForActiveQuinzaine.length} Recettes ({mealsForActiveQuinzaine.length * 4} Portions)
              </span>
            </div>

            {/* Cartes Recettes de la Quinzaine sélectionnée */}
            {mealsForActiveQuinzaine.length > 0 ? (
              <div className="space-y-4">
                {mealsForActiveQuinzaine.map((repas) => {
                  const photoUrl = getRecipePhoto(repas.nom, repas.type);

                  return (
                    <div
                      key={repas.id}
                      onClick={() => setSelectedRecipe(repas)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="relative h-44 w-full bg-slate-200 overflow-hidden">
                        <img 
                          src={photoUrl} 
                          alt={repas.nom} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                        
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="bg-white/90 backdrop-blur text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                            Panier {activeBasket}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${
                            repas.type === 'Cheat' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                          }`}>
                            {repas.type === 'Cheat' ? 'Plaisir' : (repas.type || 'Frais')}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                          <div className="flex items-center gap-2 text-xs font-bold drop-shadow">
                            <span>⏱️ {repas.temps || '20 min'}</span>
                            <span>•</span>
                            <span className="text-amber-300">🔥 {repas.calories || '480 kcal'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <span className="inline-block bg-blue-50 text-blue-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-blue-100">
                            {repas.bienfait_sante || "🛡️ Équilibre & Vitalité métabolique"}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                          {repas.nom}
                        </h3>

                        {repas.saison_atout && (
                          <p className="text-xs text-slate-500 font-medium mb-3">
                            🌱 {repas.saison_atout}
                          </p>
                        )}

                        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-500">
                            {repas.rating ? `Votre note : ${repas.rating}/5` : "Avis après dégustation :"}
                          </span>
                          <StarRating 
                            rating={repas.rating || 0} 
                            onRate={(star, e) => updateRating(repas.id, star, e)} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm mb-3">Aucune recette trouvée pour cette quinzaine.</p>
                <button
                  onClick={generateWithGemini}
                  className="bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow"
                >
                  Cliquez sur "⚡ Générer" en haut
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Suivi Budgétaire Dynamique */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Total Panier {activeBasket}
                </span>
                <span className="text-2xl font-black">
                  {totalPanierEstime.toFixed(2)} €
                </span>
              </div>
              
              {totalEconomiesRealisees > 0 && (
                <div className="mt-1 bg-white/20 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 text-emerald-100">
                  <span>🧊</span>
                  <span>Vous économisez <b>{totalEconomiesRealisees.toFixed(2)} €</b> grâce à vos choix Congélateur !</span>
                </div>
              )}

              <p className="text-[10px] text-emerald-100 font-medium mt-1">
                Objectif quinzaine : {activeBasket === 1 ? '~125 € max' : '~95 € max'} (Tarifs Leclerc Lunel / Carrefour Alès)
              </p>
            </div>

            {/* Compteur de Stock */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-700">
              <span>🏠 <b>{inStockCount}</b> ingrédient(s) déjà chez vous</span>
              <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full">
                {activePanierList.length - inStockCount} à commander
              </span>
            </div>

            {/* Liste des ingrédients du Drive */}
            <div className="space-y-3">
              {activePanierList.map((item, index) => {
                const nomLower = item.nom.toLowerCase();
                const canFreeze = item.a_alternative_congelo || 
                  ['saumon', 'cabillaud', 'poisson', 'poulet', 'boeuf', 'bœuf', 'steak', 'porc', 'brocoli', 'haricot', 'legume', 'frite', 'figue']
                  .some(kw => nomLower.includes(kw));

                const isCongelo = item.mode_choisi === 'congelo' && canFreeze;
                const prixFrais = Number(item.prix_frais || 4.5);
                const prixCongelo = Number(item.prix_congelo || (prixFrais * 0.7).toFixed(2));
                const activePrice = isCongelo ? prixCongelo : prixFrais;

                const searchFrais = item.recherche_frais || item.nom;
                const searchCongelo = item.recherche_congelo || `${cleanDriveTerm(searchFrais)} surgele`;
                const cleanTerm = cleanDriveTerm(isCongelo ? searchCongelo : searchFrais);

                // Liens Drives : Lunel (Leclerc) et Alès (Carrefour)
                const leclercUrl = `https://fd14-courses.leclercdrive.fr/magasin-053401-053401-lunel/recherche.aspx?TexteRecherche=${encodeURIComponent(cleanTerm)}`;
                const carrefourUrl = `https://www.carrefour.fr/s?q=${encodeURIComponent(cleanTerm)}`;
                const thumbnail = getProductThumbnail(item.nom, item.rayon);

                return (
                  <div
                    key={index}
                    onClick={() => toggleItemStock(currentBasketKey, index)}
                    className={`p-3.5 rounded-3xl border transition-all cursor-pointer select-none ${
                      item.in_stock 
                        ? 'bg-slate-100 border-slate-200 opacity-50' 
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        item.in_stock 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {item.in_stock && <span className="text-xs font-bold">✓</span>}
                      </div>

                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <img 
                          src={thumbnail} 
                          alt={item.nom} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {item.rayon}
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            ~{activePrice.toFixed(2)} €
                          </span>
                        </div>

                        <span className={`text-sm font-extrabold block truncate ${
                          item.in_stock ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}>
                          {item.nom}
                        </span>

                        {item.in_stock && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">
                            Déjà en stock chez vous
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interrupteur Frais vs Congélo */}
                    {!item.in_stock && canFreeze && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-slate-500">Votre choix :</div>
                          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={(e) => toggleItemMode(currentBasketKey, index, e)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                                !isCongelo 
                                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <span>🌿</span> Frais ({prixFrais.toFixed(2)}€)
                            </button>

                            <button
                              type="button"
                              onClick={(e) => toggleItemMode(currentBasketKey, index, e)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                                isCongelo 
                                  ? 'bg-sky-600 text-white shadow-sm' 
                                  : 'text-sky-700 hover:text-sky-900'
                              }`}
                            >
                              <span>🧊</span> Congélo {item.gain_anti_radin && `(${item.gain_anti_radin})`}
                            </button>
                          </div>
                        </div>

                        {item.conseil_anti_gaspi && (
                          <p className="text-[10px] text-slate-500 font-medium mt-1.5 italic">
                            💡 {item.conseil_anti_gaspi}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions Drive */}
                    {!item.in_stock && (
                      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                        <a
                          href={leclercUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-blue-100 transition"
                        >
                          <span>🛒</span> Leclerc {isCongelo && '(Surgelé)'}
                        </a>

                        <a
                          href={carrefourUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-sky-100 transition"
                        >
                          <span>🛒</span> Carrefour {isCongelo && '(Surgelé)'}
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cleanTerm, e);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl ml-auto transition"
                        >
                          COPIER
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Fiche Recette Détaillée */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-12">
          <div className="relative h-60 w-full bg-slate-900">
            <img 
              src={getRecipePhoto(selectedRecipe.nom, selectedRecipe.type)} 
              alt={selectedRecipe.nom} 
              className="w-full h-full object-cover opacity-90"
            />
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-900/70 text-white font-bold flex items-center justify-center backdrop-blur shadow-lg"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                Panier {selectedRecipe.basket || activeBasket} • {selectedRecipe.type || 'Frais'}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {selectedRecipe.nom}
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3.5 rounded-2xl text-blue-900 font-extrabold text-xs mb-4 flex items-center gap-2">
              <span>{selectedRecipe.bienfait_sante || "🛡️ Idéal pour booster l'énergie & la digestion"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl mb-6 text-center border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Calories</span>
                <span className="text-sm font-black text-slate-800">{selectedRecipe.calories || '490 kcal'}</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Temps</span>
                <span className="text-sm font-black text-slate-800">{selectedRecipe.temps || '20 min'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Portions</span>
                <span className="text-sm font-black text-slate-800">4 pers.</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl flex justify-between items-center mb-6 border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Votre évaluation :</span>
              <StarRating 
                rating={selectedRecipe.rating || 0} 
                onRate={(star) => updateRating(selectedRecipe.id, star)} 
              />
            </div>
            
            {selectedRecipe.conseil && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-sm mb-6">
                <span className="font-extrabold block text-xs uppercase text-amber-700 mb-1">💡 Le Secret du Chef :</span>
                {selectedRecipe.conseil}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Ingrédients nécessaires (4 portions)
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <li key={i} className="text-sm text-slate-800 flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                      <span className="font-medium">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Préparation pas à pas
                </h3>
                <div className="space-y-3">
                  {selectedRecipe.etapes?.map((etape, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-800 bg-slate-50 p-3 rounded-2xl">
                      <span className="font-black text-blue-700 text-base">{i + 1}.</span>
                      <p className="font-medium leading-relaxed">{etape}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation basse */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 flex justify-around items-center z-30 shadow-lg">
        <button
          onClick={() => setView('menu')}
          className={`flex flex-col items-center gap-1 ${
            view === 'menu' ? 'text-blue-700 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🍽️</span>
          <span className="text-[10px] uppercase tracking-wider">Planning</span>
        </button>
        <button
          onClick={() => setView('shop')}
          className={`flex flex-col items-center gap-1 ${
            view === 'shop' ? 'text-blue-700 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px] uppercase tracking-wider">Courses Drive</span>
        </button>
      </nav>
    </div>
  );
}
