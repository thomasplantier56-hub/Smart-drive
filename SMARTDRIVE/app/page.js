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
  if (name.includes("saumon") || name.includes("cabillaud") || name.includes("poisson") || name.includes("poke") || name.includes("poké")) {
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("curry") || name.includes("poulet") || name.includes("wok") || name.includes("dinde") || name.includes("tajine")) {
    return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("pâtes") || name.includes("gnocchi") || name.includes("lasagne") || name.includes("tagliatelle")) {
    return "https://images.unsplash.com/photo-1621996346565-e3d5d6281220?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("boeuf") || name.includes("bœuf") || name.includes("steak") || name.includes("porc")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("salade") || name.includes("bowl") || name.includes("quinoa")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("dahl") || name.includes("lentille") || name.includes("soupe") || name.includes("velouté")) {
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
  if (p.includes("boeuf") || p.includes("steak") || p.includes("viande") || p.includes("boucherie") || p.includes("porc")) {
    return "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("poisson") || p.includes("saumon") || p.includes("cabillaud") || p.includes("crevette") || p.includes("poissonnerie") || p.includes("thon")) {
    return "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("fromage") || p.includes("reblochon") || p.includes("mozzarella") || p.includes("feta") || p.includes("crémerie") || p.includes("cremerie") || p.includes("lait") || p.includes("creme") || p.includes("parmesan")) {
    return "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("courgette") || p.includes("aubergine") || p.includes("poivron") || p.includes("brocoli") || p.includes("légume") || p.includes("fruit") || p.includes("tomate") || p.includes("carotte") || p.includes("oignon") || p.includes("figue") || p.includes("poireau") || p.includes("avocat") || p.includes("ail")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("pain") || p.includes("burger") || p.includes("pâte") || p.includes("boulangerie")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("curry") || p.includes("coriandre") || p.includes("épice") || p.includes("herbe") || p.includes("sel") || p.includes("poivre")) {
    return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("huile") || p.includes("vinaigre") || p.includes("sauce") || p.includes("moutarde")) {
    return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=160&q=80";
  }
  if (p.includes("riz") || p.includes("lentille") || p.includes("quinoa") || p.includes("pâtes") || p.includes("epicerie") || p.includes("conserve")) {
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

  // Gestion multi-foyer
  const [foyerCode, setFoyerCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isCreatingFoyer, setIsCreatingFoyer] = useState(false);
  const [newFoyerName, setNewFoyerName] = useState("");

  const [loading, setLoading] = useState(true);
  const [swappingId, setSwappingId] = useState(null);
  const [isInjectingCraving, setIsInjectingCraving] = useState(false);
  const [cravingInput, setCravingInput] = useState("");

  const [view, setView] = useState('menu'); // 'menu', 'shop', 'stocks'
  const [activeBasket, setActiveBasket] = useState(jourDuMois > 15 ? 2 : 1);
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // État des stocks réels (Congélateur & Placard)
  const [stockList, setStockList] = useState([]);
  const [stockTab, setStockTab] = useState('congelateur');

  // Formulaire d'ajout rapide de stock
  const [newItemName, setNewItemName] = useState("");
  const [newItemLocation, setNewItemLocation] = useState("congelateur");
  const [newItemQty, setNewItemQty] = useState(1);

  // Chargement initial du Foyer
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFoyer = urlParams.get('foyer');
    const savedCode = urlFoyer || localStorage.getItem('smartdrive_foyer_code');

    if (savedCode) {
      const cleanCode = savedCode.trim().toUpperCase();
      localStorage.setItem('smartdrive_foyer_code', cleanCode);
      setFoyerCode(cleanCode);
      setInputCode(cleanCode);
      loadFoyerData(cleanCode);
    } else {
      setLoading(false);
      setConfig(null);
    }
  }, []);

  async function loadFoyerData(code) {
    setLoading(true);
    try {
      const { data: foyer } = await supabase
        .from('foyers')
        .select('*')
        .eq('code_foyer', code.trim().toUpperCase())
        .single();

      if (foyer) {
        setConfig(foyer);
        setCravingInput(foyer.cravings || "");
        const { data: stocks } = await supabase
          .from('inventaire_congelateur')
          .select('*')
          .eq('foyer_id', foyer.id)
          .eq('est_consomme', false)
          .order('created_at', { ascending: false });

        setStockList(stocks || []);
      } else {
        setConfig(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleConnectFoyer(e) {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    localStorage.setItem('smartdrive_foyer_code', code);
    setFoyerCode(code);
    loadFoyerData(code);
  }

  async function handleCreateFoyer(e) {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code || !newFoyerName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('foyers').insert({
        code_foyer: code,
        nom_famille: newFoyerName,
        current_month: moisActuel
      }).select().single();

      if (error) {
        alert("Ce code foyer existe déjà, choisissez-en un autre !");
      } else {
        localStorage.setItem('smartdrive_foyer_code', code);
        setFoyerCode(code);
        setIsCreatingFoyer(false);
        loadFoyerData(code);
      }
    } catch (err) {
      alert("Erreur création foyer : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoutFoyer() {
    if (confirm("Voulez-vous changer de foyer ou vous déconnecter ?")) {
      localStorage.removeItem('smartdrive_foyer_code');
      setConfig(null);
      setFoyerCode("");
      setInputCode("");
    }
  }

  async function handleAddStockItem(e) {
    if (e) e.preventDefault();
    if (!config || !newItemName.trim()) return;

    try {
      const isFish = newItemName.toLowerCase().includes("poisson") || newItemName.toLowerCase().includes("saumon");
      const isVeg = newItemName.toLowerCase().includes("légume") || newItemName.toLowerCase().includes("haricot");

      const { data } = await supabase.from('inventaire_congelateur').insert({
        foyer_id: config.id,
        nom_produit: newItemName.trim(),
        emplacement: newItemLocation,
        quantite: Number(newItemQty) || 1,
        date_entree: `${jourDuMois} ${moisActuel}`,
        origine: 'Inventaire Maison',
        conservation_mois: newItemLocation === 'placard' ? 18 : isFish ? 4 : isVeg ? 12 : 6,
        est_consomme: false
      }).select().single();

      if (data) {
        setStockList(prev => [data, ...prev]);
        setNewItemName("");
        setNewItemQty(1);
        alert(`✅ "${data.nom_produit}" (x${data.quantite}) ajouté à vos réserves (${data.emplacement === 'placard' ? 'Placard' : 'Congélateur'}) !`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function adjustStockQty(item, delta) {
    const newQty = (item.quantite || 1) + delta;
    if (newQty <= 0) {
      await supabase.from('inventaire_congelateur').update({ est_consomme: true, quantite: 0 }).eq('id', item.id);
      setStockList(prev => prev.filter(i => i.id !== item.id));
    } else {
      await supabase.from('inventaire_congelateur').update({ quantite: newQty }).eq('id', item.id);
      setStockList(prev => prev.map(i => i.id === item.id ? { ...i, quantite: newQty } : i));
    }
  }

  async function rescueToFreezer(productName, originInfo = "Sauvetage Frigo") {
    if (!config) return;
    try {
      const { data } = await supabase.from('inventaire_congelateur').insert({
        foyer_id: config.id,
        nom_produit: productName,
        emplacement: 'congelateur',
        quantite: 1,
        date_entree: `${jourDuMois} ${moisActuel}`,
        origine: originInfo,
        conservation_mois: 6,
        est_consomme: false
      }).select().single();

      if (data) {
        setStockList(prev => [data, ...prev]);
        alert(`🧊 "${productName}" sauvegardé dans le grand congélateur !`);
      }
    } catch (e) {
      console.error(e);
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

    await supabase.from('foyers').update({ menu_json: updatedMenu }).eq('id', config.id);
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
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);
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
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);
  }

  // 📦 GESTION DU STATUT DU PANIER DRIVE (Marquer comme rangé au frigo)
  async function toggleBasketReceivedStatus(basketKey) {
    const currentStatus = config.panier_json?.[`statut_${basketKey}`] || { recu: false };
    const newStatus = {
      recu: !currentStatus.recu,
      date_reception: !currentStatus.recu ? `${jourDuMois} ${moisActuel}` : null
    };

    const updatedPanierJson = {
      ...config.panier_json,
      [`statut_${basketKey}`]: newStatus
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);

    if (newStatus.recu) {
      alert(`✅ Courses du Panier ${activeBasket} marquées comme rangées au frigo ! Le suivi de fraîcheur est maintenant actif.`);
    }
  }

  // ✨ VALIDATION ET INTÉGRATION IMMÉDIATE D'UNE ENVIE DANS LE MENU
  async function handleApplyCraving(e) {
    if (e) e.preventDefault();
    const envie = cravingInput.trim();
    if (!config || !envie) return;

    setIsInjectingCraving(true);
    const basketKey = activeBasket === 1 ? 'p1' : 'p2';
    const mealsCurrentQ = (config.menu_json || []).filter(r => (r.basket || 1) === activeBasket);
    const targetRecipe = mealsCurrentQ[mealsCurrentQ.length - 1] || { id: Date.now(), basket: activeBasket };

    const prompt = `Tu es un chef cuisinier étoilé et logisticien Drive.
Le couple a formulé une ENVIE TRÈS PRÉCISE : "${envie}".
Génère UNE RECETTE GOURMANDE ET ÉQUILIBRÉE correspondant exactement à cette envie pour ${moisActuel.toUpperCase()} en France (4 portions).
Contraintes :
- Quinzaine : ${activeBasket} (Panier ${activeBasket})
- Profil santé : 40 ans, sain, équilibré, IG bas, adapté à la saison.
- Budget : ~3€/portion, marques distributeurs (Leclerc Marque Repère, Carrefour Classic).
- OBLIGATION ABSOLUE : inclus TOUS les condiments nécessaires (oignons, ail, huile d'olive, épices, sauces).

Format JSON pur impératif :
{
  "nouvelle_recette": {
    "id": ${targetRecipe.id},
    "nom": "Titre appétissant correspondant à l'envie",
    "type": "Plaisir",
    "calories": "520 kcal",
    "temps": "25 min",
    "bienfait_sante": "✨ Recette plaisir & vitalité",
    "saison_atout": "Ingrédients de saison",
    "ingredients": ["Ingrédient 1 (quantité)", "Ingrédient 2 (quantité)"],
    "etapes": ["Étape 1", "Étape 2", "Étape 3"],
    "conseil": "Astuce gourmande du chef",
    "basket": ${activeBasket},
    "rating": 0
  },
  "nouveaux_ingredients_drive": [
    {
      "nom": "Nom produit",
      "rayon": "Rayon Drive",
      "a_alternative_congelo": true,
      "mode_choisi": "frais",
      "prix_frais": 5.50,
      "recherche_frais": "mot simple",
      "prix_congelo": 3.80,
      "recherche_congelo": "mot surgele",
      "gain_anti_radin": "-30%",
      "conseil_anti_gaspi": "astuce",
      "est_condiment": false,
      "recette_id": ${targetRecipe.id},
      "in_stock": false
    }
  ]
}`;

    try {
      let responseText;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.6-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        const fallback = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await fallback.generateContent(prompt);
        responseText = result.response.text();
      }

      const response = JSON.parse(responseText);

      let updatedMenu = (config.menu_json || []).map(r => 
        r.id === targetRecipe.id ? response.nouvelle_recette : r
      );
      if (!updatedMenu.some(r => r.id === response.nouvelle_recette.id)) {
        updatedMenu.push(response.nouvelle_recette);
      }

      const currentBasketList = config.panier_json?.[basketKey] || [];
      const updatedPanierJson = {
        ...config.panier_json,
        [basketKey]: [...currentBasketList, ...(response.nouveaux_ingredients_drive || [])]
      };

      await supabase.from('foyers').update({
        cravings: envie,
        menu_json: updatedMenu,
        panier_json: updatedPanierJson
      }).eq('id', config.id);

      setConfig(prev => ({
        ...prev,
        cravings: envie,
        menu_json: updatedMenu,
        panier_json: updatedPanierJson
      }));

      alert(`🎉 Votre envie "${envie}" a été cuisinée par le Chef et ajoutée à la Quinzaine ${activeBasket} ! Vos listes Drive sont à jour.`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'intégration de votre envie : " + err.message);
    } finally {
      setIsInjectingCraving(false);
    }
  }

  // 🔄 REMPLACER UNE RECETTE (AVEC GESTION COMPLÈTE DES INGRÉDIENTS & CONDIMENTS)
  async function swapRecipe(recipeToSwap) {
    if (!config || !recipeToSwap) return;
    setSwappingId(recipeToSwap.id);

    const targetBasket = recipeToSwap.basket || activeBasket;
    const basketKey = targetBasket === 1 ? 'p1' : 'p2';

    const prompt = `Tu es un chef cuisinier étoilé et logisticien Drive.
Le couple de 40 ans ne souhaite PAS cuisiner le plat suivant : "${recipeToSwap.nom}".
Génère UNE SEULE NOUVELLE RECETTE DE REMPLACEMENT de saison pour ${moisActuel.toUpperCase()} en France (4 portions).
Contraintes :
- Quinzaine : ${targetBasket} (Panier ${targetBasket}).
- Profil santé : 40 ans, sain, équilibré, IG bas.
- Budget : ~3€/portion, marques distributeurs (Leclerc Marque Repère, Carrefour Classic).
- OBLIGATION : inclus tous les condiments indispensables (oignons, ail, épices, huiles) dans "nouveaux_ingredients_drive".

Format JSON pur impératif :
{
  "nouvelle_recette": {
    "id": ${recipeToSwap.id},
    "nom": "Nom de la nouvelle recette",
    "type": "${recipeToSwap.type || 'Frais'}",
    "calories": "490 kcal",
    "temps": "25 min",
    "bienfait_sante": "🛡️ Bouclier immunitaire & Vitalité",
    "saison_atout": "Légumes de saison d'automne",
    "ingredients": ["Ingrédient 1 (quantité)", "Ingrédient 2 (quantité)"],
    "etapes": ["Étape 1", "Étape 2", "Étape 3"],
    "conseil": "Astuce gourmande du chef",
    "basket": ${targetBasket},
    "rating": 0
  },
  "anciens_mots_cles_a_retirer": [
    // Mots-clés des ingrédients de "${recipeToSwap.nom}" à retirer du panier Drive
  ],
  "nouveaux_ingredients_drive": [
    {
      "nom": "Nom produit",
      "rayon": "Rayon Drive",
      "a_alternative_congelo": true,
      "mode_choisi": "frais",
      "prix_frais": 5.50,
      "recherche_frais": "mot simple",
      "prix_congelo": 3.80,
      "recherche_congelo": "mot surgele",
      "gain_anti_radin": "-30%",
      "conseil_anti_gaspi": "astuce",
      "est_condiment": false,
      "recette_id": ${recipeToSwap.id},
      "in_stock": false
    }
  ]
}`;

    try {
      let responseText;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.6-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        const fallback = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await fallback.generateContent(prompt);
        responseText = result.response.text();
      }

      const response = JSON.parse(responseText);

      const updatedMenu = (config.menu_json || []).map(r => 
        r.id === recipeToSwap.id ? response.nouvelle_recette : r
      );

      const currentBasketList = config.panier_json?.[basketKey] || [];
      const keywordsToRemove = (response.anciens_mots_cles_a_retirer || []).map(k => k.toLowerCase());

      const cleanedBasket = currentBasketList.filter(item => {
        if (item.recette_id && item.recette_id === recipeToSwap.id) return false;
        const itemName = item.nom.toLowerCase();
        if (keywordsToRemove.some(k => itemName.includes(k))) return false;
        return true;
      });

      const updatedPanierJson = {
        ...config.panier_json,
        [basketKey]: [...cleanedBasket, ...(response.nouveaux_ingredients_drive || [])]
      };

      await supabase.from('foyers').update({
        menu_json: updatedMenu,
        panier_json: updatedPanierJson
      }).eq('id', config.id);

      setConfig(prev => ({
        ...prev,
        menu_json: updatedMenu,
        panier_json: updatedPanierJson
      }));

      if (selectedRecipe && selectedRecipe.id === recipeToSwap.id) {
        setSelectedRecipe(response.nouvelle_recette);
      }

      alert(`🎉 Plat remplacé par : "${response.nouvelle_recette.nom}" ! Vos listes Drive ont été mises à jour.`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'échange : " + e.message);
    } finally {
      setSwappingId(null);
    }
  }

  // GÉNÉRATION MENSUELLE 14 RECETTES (AVEC OIGNONS, CONDIMENTS ET ÉPICES OBLIGATOIRES)
  async function generateWithGemini() {
    if (!config) return;
    setLoading(true);

    const lovedRecipes = (config.menu_json || []).filter(r => r.rating >= 4).map(r => r.nom);
    const dislikedRecipes = (config.menu_json || [])
      .filter(r => r.rating && r.rating <= 2)
      .map(r => r.nom);

    const stocksActifs = stockList.filter(s => !s.est_consomme && s.quantite > 0);
    const stocksCongelo = stocksActifs
      .filter(s => s.emplacement === 'congelateur')
      .map(s => `${s.nom_produit} (qté: ${s.quantite})`);
    const stocksPlacard = stocksActifs
      .filter(s => s.emplacement === 'placard')
      .map(s => `${s.nom_produit} (qté: ${s.quantite})`);

    const prompt = `Tu es un chef cuisinier étoilé et logisticien financier expert en optimisation de Drive pour un couple de 40 ans.
CONSIGNE STRICTE FORMULE B : 100% DES 14 JOURS DE CHAQUE QUINZAINE DOIVENT ÊTRE COUVERTS.
Chaque recette est préparée pour 4 portions (couvre 1 dîner pour 2 + 1 déjeuner pour 2 le lendemain).
Pour couvrir 14 jours, il faut EXACTEMENT 7 RECETTES PAR QUINZAINE, SOIT 14 RECETTES UNIQUES AU TOTAL DANS "repas" :
- RECETTES 1 À 7 : "basket": 1 (Correspond au Panier 1 - Quinzaine 1).
- RECETTES 8 À 14 : "basket": 2 (Correspond au Panier 2 - Quinzaine 2).
TOTAL STRICT : 14 RECETTES DANS "repas".

RÈGLE DES CONDIMENTS, ÉPICES ET OIGNONS (TRÈS IMPORTANT) :
Tu ne dois JAMAIS omettre les oignons, l'ail, les huiles spécifiques (huile d'olive, sésame), les herbes (coriandre, persil, thym) ou les épices (curry, cumin, paprika) nécessaires aux recettes.
Tous les condiments et aromates nécessaires doivent figurer dans panier_1 ou panier_2 avec "est_condiment": true.
EXCEPTION : Si un ingrédient est DÉJÀ présent dans les "RÉSERVES ACTUELLES DANS LA MAISON (Placard)", ne l'inclus pas au panier.

RÉSERVES ACTUELLES DANS LA MAISON (À UTILISER EN PRIORITÉ ET NE PAS ACHETER) :
- Grand Congélateur (Garage) : ${stocksCongelo.length ? stocksCongelo.join(', ') : 'Aucun produit'}
- Placard & Épicerie : ${stocksPlacard.length ? stocksPlacard.join(', ') : 'Aucun produit'}

CONTRAINTE BUDGÉTAIRE : ~220€ à 240€ mensuel strict pour l'ensemble des 14 recettes. Privilégie les marques distributeurs (Marque Repère Leclerc, Carrefour Classic).

Génère 14 recettes de saison pour ${moisActuel.toUpperCase()} en France.
Profil santé : 40 ans, IG bas, vitalité, immunité de saison, 1 cheat meal par quinzaine.
Envies formulées par le couple : "${config.cravings || 'Cuisine savoureuse, saine et équilibrée'}".

Pour chaque ingrédient dans panier_1 et panier_2 :
- "nom": Nom produit
- "rayon": Rayon Drive
- "a_alternative_congelo": true si une version surgelée existe, false sinon
- "mode_choisi": "frais"
- "prix_frais": prix réaliste en euros
- "recherche_frais": 1 ou 2 mots simples (ex: "saumon", "poulet", "oignons", "curry")
- "prix_congelo": prix surgelé économique, ou null
- "recherche_congelo": mot simple (ex: "saumon surgele"), ou null
- "gain_anti_radin": économie, ou null
- "conseil_anti_gaspi": astuce courte
- "est_condiment": true pour huiles, épices, oignons, ail, herbes, sauces; false pour protéines et féculents
- "recette_id": numéro id de la recette liée (1 à 14)

Format JSON pur impératif :
{
  "repas": [
    {
      "id": 1,
      "nom": "Nom recette 1",
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
      "id": 8,
      "nom": "Nom recette 8",
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
      "conseil_anti_gaspi": "🧊 Format congélateur",
      "est_condiment": false,
      "recette_id": 1,
      "in_stock": false
    },
    {
      "nom": "Curry doux en poudre",
      "rayon": "Épicerie",
      "a_alternative_congelo": false,
      "mode_choisi": "frais",
      "prix_frais": 1.45,
      "recherche_frais": "curry poudre",
      "prix_congelo": null,
      "recherche_congelo": null,
      "gain_anti_radin": null,
      "conseil_anti_gaspi": "🧂 Épice de base",
      "est_condiment": true,
      "recette_id": 1,
      "in_stock": false
    }
  ],
  "panier_2": [
    {
      "nom": "Filet de Poulet",
      "rayon": "Boucherie",
      "a_alternative_congelo": true,
      "mode_choisi": "frais",
      "prix_frais": 8.50,
      "recherche_frais": "filet poulet",
      "prix_congelo": 6.20,
      "recherche_congelo": "poulet surgele",
      "gain_anti_radin": "-27%",
      "conseil_anti_gaspi": "🌿 Frais de quinzaine",
      "est_condiment": false,
      "recette_id": 8,
      "in_stock": false
    }
  ]
}`;

    try {
      let responseText;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.6-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        console.warn("Modèle 3.6 saturé, bascule sur Gemini 3.5 Flash...", err);
        const fallback = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await fallback.generateContent(prompt);
        responseText = result.response.text();
      }

      const response = JSON.parse(responseText);

      // Réinitialisation du statut de réception pour ce nouveau mois
      const initialPanierJson = {
        p1: response.panier_1,
        p2: response.panier_2,
        statut_p1: { recu: false, date_reception: null },
        statut_p2: { recu: false, date_reception: null }
      };

      await supabase.from('foyers').update({
        menu_json: response.repas,
        panier_json: initialPanierJson,
        current_month: moisActuel
      }).eq('id', config.id);

      loadFoyerData(foyerCode);
      alert(`Menu Formule B généré : 14 recettes complètes avec épices et condiments !`);
    } catch (e) {
      console.error(e);
      alert("Erreur de génération : " + e.message);
    } finally {
      setLoading(false);
    }
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

  // ÉCRAN DE CONNEXION / CRÉATION FOYER
  if (!loading && !config) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-white p-6 flex flex-col justify-center">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🛒</span>
          <h1 className="text-2xl font-black italic tracking-tight">SMART DRIVE MULTI-FOYER</h1>
          <p className="text-xs text-slate-400 mt-1">Espaces isolés et synchronisés en direct</p>
        </div>

        {!isCreatingFoyer ? (
          <form onSubmit={handleConnectFoyer} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Rejoindre votre Foyer</h2>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Code d'accès Foyer</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white uppercase font-black text-center tracking-widest text-lg focus:outline-none focus:border-blue-500"
                placeholder="EX: LUNEL-ALES"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl transition shadow-lg">
              Accéder à mes Repas
            </button>
            <div className="pt-2 text-center">
              <button type="button" onClick={() => setIsCreatingFoyer(true)} className="text-xs text-slate-400 hover:text-white underline">
                Créer un nouveau foyer (pour un ami)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateFoyer} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Créer un Nouveau Foyer</h2>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Nom du foyer / Famille</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white text-sm"
                placeholder="Ex: Famille Dupont"
                value={newFoyerName}
                onChange={(e) => setNewFoyerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Code Foyer Unique</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white uppercase font-black text-center tracking-widest"
                placeholder="EX: FOYER-DUPONT"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition shadow-lg">
              Créer et Démarrer
            </button>
            <div className="pt-2 text-center">
              <button type="button" onClick={() => setIsCreatingFoyer(false)} className="text-xs text-slate-400 hover:text-white underline">
                Retour à la connexion
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-700 text-sm">Chargement du foyer {foyerCode}...</p>
      </div>
    );
  }

  const currentBasketKey = activeBasket === 1 ? 'p1' : 'p2';
  const activePanierList = config?.panier_json?.[currentBasketKey] || [];
  const inStockCount = activePanierList.filter(i => i.in_stock).length;

  // Statut réel de réception du panier (Courses faites ou pas)
  const basketStatus = config?.panier_json?.[`statut_${currentBasketKey}`] || { recu: false };
  const isBasketReceived = basketStatus.recu;

  const totalPanierEstime = activePanierList
    .filter(i => !i.in_stock)
    .reduce((sum, i) => {
      const isCongelo = i.mode_choisi === 'congelo';
      const prix = isCongelo && i.prix_congelo ? Number(i.prix_congelo) : Number(i.prix_frais || 2.5);
      return sum + prix;
    }, 0);

  const estimationLeclercLunel = totalPanierEstime > 0 ? (totalPanierEstime * 0.97).toFixed(2) : "0.00";
  const estimationCarrefourAles = totalPanierEstime > 0 ? (totalPanierEstime * 1.03).toFixed(2) : "0.00";
  const ecartEconomieDrive = (Number(estimationCarrefourAles) - Number(estimationLeclercLunel)).toFixed(2);

  const totalEconomiesRealisees = activePanierList
    .filter(i => !i.in_stock && i.mode_choisi === 'congelo' && i.prix_congelo && i.prix_frais)
    .reduce((sum, i) => sum + (Number(i.prix_frais) - Number(i.prix_congelo)), 0);

  // Formule B : 7 recettes par quinzaine
  const mealsForActiveQuinzaine = (config?.menu_json || []).filter((repas, index) => {
    if (repas.basket === 1 || repas.basket === 2) {
      return repas.basket === activeBasket;
    }
    return activeBasket === 1 ? index < 7 : index >= 7;
  });

  const premierPlatFrais = mealsForActiveQuinzaine.find(r => r.type === 'Frais') || mealsForActiveQuinzaine[0];

  const filteredStockList = stockList.filter(item => {
    const emp = item.emplacement || 'congelateur';
    return emp === stockTab;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-100 pb-28 shadow-2xl">
      {/* Header Premium Multi-Foyer */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white sticky top-0 z-40 shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black italic text-2xl tracking-tight">SMART DRIVE</h1>
              <span className="text-[10px] bg-white/20 text-blue-200 font-extrabold px-2 py-0.5 rounded-full">
                {config.code_foyer}
              </span>
              <button 
                onClick={handleLogoutFoyer}
                className="text-[9px] bg-white/10 hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition"
                title="Changer de foyer"
              >
                Changer ✕
              </button>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mt-0.5">
              {moisActuel} • 14 Recettes • {config.nom_famille}
            </p>
          </div>
          <button
            onClick={generateWithGemini}
            className="bg-white text-blue-800 hover:bg-amber-400 hover:text-slate-950 px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition"
          >
            ⚡ Générer
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-blue-100 font-medium mt-2 pt-2 border-t border-white/10">
          <span>📅 {jourDuMois} {moisActuel}</span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Quinzaine {activeBasket} (Panier {activeBasket})
          </span>
        </div>
      </header>

      <main className="p-4">
        {/* Sélecteur de Quinzaine universel */}
        {view !== 'stocks' && (
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
        )}

        {/* 1. VUE PLANNING AVEC ALERTE FRAÎCHEUR LOGIQUE */}
        {view === 'menu' && (
          <div className="space-y-4">
            {/* L'ALERTE S'AFFICHE UNIQUEMENT SI LES COURSES ONT ÉTÉ RANGÉES AU FRIGO ! */}
            {isBasketReceived ? (
              premierPlatFrais && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-4 text-white shadow-lg animate-in fade-in">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      <span className="text-xs font-black uppercase tracking-wider">Alerte Fraîcheur Frigo (Courses rangées le {basketStatus.date_reception})</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-snug mb-3">
                    À cuisiner en priorité : <b>{premierPlatFrais.nom}</b> (produit ultra-frais). Pas le temps ce soir ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRecipe(premierPlatFrais)}
                      className="flex-1 bg-white text-slate-900 font-extrabold text-[11px] py-2 rounded-xl shadow active:scale-95 transition"
                    >
                      👨‍🍳 Cuisiner ce soir
                    </button>
                    <button
                      onClick={() => rescueToFreezer(premierPlatFrais.ingredients?.[0] || premierPlatFrais.nom, "Sauvetage Frigo")}
                      className="flex-1 bg-slate-900/40 hover:bg-slate-900 text-white font-extrabold text-[11px] py-2 rounded-xl border border-white/20 active:scale-95 transition"
                    >
                      🧊 Sauver au Congélo
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Message logique avant les courses : pas de fausse alerte ! */
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-3.5 flex items-center justify-between text-xs text-blue-900">
                <span className="flex items-center gap-2">
                  <span>🛒</span>
                  <span>Panier {activeBasket} à commander au Drive</span>
                </span>
                <button
                  onClick={() => setView('shop')}
                  className="bg-blue-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-blue-700 transition"
                >
                  Voir ma liste Drive
                </button>
              </div>
            )}

            {/* FORMULAIRE D'ENVIE GUSTATIVE AVEC BOUTON D'ACTION IMMÉDIAT */}
            <form onSubmit={handleApplyCraving} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>✨</span> Une envie précise ce mois-ci ?
                </span>
                {config?.cravings && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    Actuel : {config.cravings}
                  </span>
                )}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Lasagnes, Poké bowl, Curry..."
                  value={cravingInput}
                  onChange={(e) => setCravingInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />

                <button
                  type="submit"
                  disabled={isInjectingCraving || !cravingInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow transition flex items-center gap-1.5 active:scale-95 flex-shrink-0"
                >
                  <span>{isInjectingCraving ? '⏳' : '✨'}</span>
                  <span>{isInjectingCraving ? 'Cuisine...' : 'Intégrer'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Tapez votre plat et cliquez sur "Intégrer" (ou Entrée) pour l'ajouter immédiatement au planning et aux courses Drive !
              </p>
            </form>

            <div className="flex justify-between items-center pl-1 pr-1">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Repas de la Quinzaine {activeBasket} (Formule B)
              </h2>
              <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {mealsForActiveQuinzaine.length} Recettes • {mealsForActiveQuinzaine.length * 2} jours couverts à deux
              </span>
            </div>

            {mealsForActiveQuinzaine.length > 0 ? (
              <div className="space-y-4">
                {mealsForActiveQuinzaine.map((repas) => {
                  const photoUrl = getRecipePhoto(repas.nom, repas.type);
                  const isSwapping = swappingId === repas.id;

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
                          <StarRating 
                            rating={repas.rating || 0} 
                            onRate={(star, e) => updateRating(repas.id, star, e)} 
                          />

                          <button
                            type="button"
                            disabled={isSwapping}
                            onClick={(e) => {
                              e.stopPropagation();
                              swapRecipe(repas);
                            }}
                            className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1 active:scale-95 border border-blue-100"
                          >
                            <span>{isSwapping ? '⏳' : '🔄'}</span>
                            <span>{isSwapping ? 'Échange...' : 'Remplacer'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm mb-3">Aucune recette trouvée.</p>
                <button
                  onClick={generateWithGemini}
                  className="bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow"
                >
                  Cliquez sur "⚡ Générer" en haut
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. VUE COURSES AVEC BOUTON "RANGÉ AU FRIGO" ET CONDIMENTS COMPLETS */}
        {view === 'shop' && (
          <div className="space-y-4">
            {/* BOUTON D'ACTION DE RÉCEPTION DU PANIER DRIVE */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{isBasketReceived ? '✅' : '📦'}</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800">
                    {isBasketReceived ? `Courses rangées au frigo le ${basketStatus.date_reception}` : `Panier ${activeBasket} pas encore récupéré`}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {isBasketReceived ? 'Le suivi fraîcheur est actif dans votre Planning' : 'Cliquez une fois vos courses rangées à la maison'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleBasketReceivedStatus(currentBasketKey)}
                className={`text-[10px] font-black px-3 py-2 rounded-xl transition uppercase tracking-wider shadow-sm ${
                  isBasketReceived 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isBasketReceived ? 'Modifier' : 'J\'ai rangé mes courses'}
              </button>
            </div>

            {/* Arbitre Drive */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-4 text-white shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚖️</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">L'Arbitre Drive IA</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Panier {activeBasket}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/10 p-3 rounded-2xl border border-emerald-400/40 relative">
                  <span className="absolute -top-2 right-2 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                    Le moins cher
                  </span>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Leclerc Lunel</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{estimationLeclercLunel} €</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Marque Repère</p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Carrefour Alès</p>
                  <p className="text-xl font-black text-slate-200 mt-0.5">{estimationCarrefourAles} €</p>
                  <p className="text-[9px] text-amber-300 mt-0.5">+{ecartEconomieDrive} € d'écart</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 italic font-medium">
                💡 <b>Verdict de l'Arbitre :</b> Leclerc Lunel est ~{ecartEconomieDrive} € plus économique cette quinzaine sur votre panier complet.
              </p>
            </div>

            {/* Suivi Budgétaire */}
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
                Objectif quinzaine : {activeBasket === 1 ? '~125 € max' : '~95 € max'}
              </p>
            </div>

            {/* Compteur de Stock */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-700">
              <span>🏠 <b>{inStockCount}</b> ingrédient(s) déjà chez vous</span>
              <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full">
                {activePanierList.length - inStockCount} à commander
              </span>
            </div>

            {/* Liste des ingrédients Drive avec mention CONDIMENTS / ÉPICES */}
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {item.rayon}
                            </span>
                            {item.est_condiment && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                🧂 Épice / Condiment
                              </span>
                            )}
                          </div>
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

        {/* 3. VUE MES STOCKS (CONGÉLATEUR + PLACARD) */}
        {view === 'stocks' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-sky-200">Inventaire Réel Foyer</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-black">{stockList.length} articles</span>
              </div>
              <h2 className="text-xl font-black">Réserves de la Maison 🏠</h2>
              <p className="text-xs text-sky-100 font-medium mt-1">
                L'IA utilise ces ingrédients en priorité pour vous faire économiser au Drive !
              </p>
            </div>

            <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner">
              <button
                onClick={() => setStockTab('congelateur')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  stockTab === 'congelateur' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🧊</span> Grand Congélateur ({stockList.filter(i => (i.emplacement || 'congelateur') === 'congelateur').length})
              </button>
              <button
                onClick={() => setStockTab('placard')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  stockTab === 'placard' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🥫</span> Placard & Épicerie ({stockList.filter(i => i.emplacement === 'placard').length})
              </button>
            </div>

            <form onSubmit={handleAddStockItem} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  + Ajouter un produit existant
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setNewItemLocation('congelateur')}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      newItemLocation === 'congelateur' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    🧊 Au Congélo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemLocation('placard')}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      newItemLocation === 'placard' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    🥫 Au Placard
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={newItemLocation === 'congelateur' ? "Ex: 4 Steaks hachés, Pavés de saumon..." : "Ex: Pâtes Penne, Huile d'olive, Curry..."}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 px-1">
                  <button
                    type="button"
                    onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))}
                    className="w-7 h-7 font-black text-slate-500 hover:text-slate-800"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-800">{newItemQty}</span>
                  <button
                    type="button"
                    onClick={() => setNewItemQty(newItemQty + 1)}
                    className="w-7 h-7 font-black text-slate-500 hover:text-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] text-slate-500">
                {(newItemLocation === 'congelateur' 
                  ? ['Steaks hachés', 'Poulet 1kg', 'Saumon', 'Haricots verts', 'Frites']
                  : ['Huile d\'olive', 'Curry', 'Oignons', 'Ail', 'Coulis tomate', 'Pâtes', 'Riz']
                ).map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNewItemName(sug)}
                    className="bg-slate-50 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 whitespace-nowrap transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow"
              >
                Ajouter à mes réserves
              </button>
            </form>

            {filteredStockList.length > 0 ? (
              <div className="space-y-3">
                {filteredStockList.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black ${
                        item.emplacement === 'placard' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                      }`}>
                        {item.emplacement === 'placard' ? '🥫' : '🧊'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{item.nom_produit}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Ajouté le {item.date_entree} • <span className="text-blue-600 font-bold">{item.origine}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Conservation : ~{item.conservation_mois} mois
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => adjustStockQty(item, -1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm font-black text-xs text-slate-700 hover:bg-slate-50 transition"
                          title="Diminuer la quantité"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-900">
                          x{item.quantite || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustStockQty(item, 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm font-black text-xs text-slate-700 hover:bg-slate-50 transition"
                          title="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => adjustStockQty(item, -999)}
                        className="text-slate-300 hover:text-red-500 p-1 text-sm transition"
                        title="Supprimer définitivement"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-slate-300">
                <span className="text-3xl block mb-2">{stockTab === 'placard' ? '🥫' : '🧊'}</span>
                <p className="text-slate-600 font-bold text-sm">
                  Votre {stockTab === 'placard' ? 'placard à épicerie' : 'grand congélateur'} est vide.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Utilisez le formulaire ci-dessus pour renseigner vos premiers produits !
                </p>
              </div>
            )}
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

            <div className="mb-4">
              <button
                type="button"
                disabled={swappingId === selectedRecipe.id}
                onClick={() => swapRecipe(selectedRecipe)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{swappingId === selectedRecipe.id ? '⏳' : '🔄'}</span>
                <span>
                  {swappingId === selectedRecipe.id 
                    ? 'Recherche d\'une alternative en cours...' 
                    : 'Pas envie de ce plat ? Proposer une alternative gourmande'}
                </span>
              </button>
            </div>

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

      {/* Barre de navigation basse à 3 Onglets */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 flex justify-around items-center z-30 shadow-lg">
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

        <button
          onClick={() => setView('stocks')}
          className={`flex flex-col items-center gap-1 relative ${
            view === 'stocks' ? 'text-blue-700 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px] uppercase tracking-wider">Mes Stocks</span>
          {stockList.length > 0 && (
            <span className="absolute -top-1 right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {stockList.length}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
