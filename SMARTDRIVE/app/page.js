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

// Nettoyage sécurisé des termes de recherche
function cleanDriveTerm(text) {
  if (!text || typeof text !== 'string') return "";
  return text
    .replace(/\b(aop|igp|bio|frais|sauvage|fruitier|fermier|extra|entier|nature)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 📸 BIBLIOTHÈQUE CULINAIRE ENRICHIE AVEC ROTATION
const PHOTO_LIBRARY = {
  poisson_blanc: [
    "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80"
  ],
  saumon: [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80"
  ],
  poulet: [
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=700&q=80"
  ],
  boeuf: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=80"
  ],
  porc: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=700&q=80"
  ],
  pates_lasagnes: [
    "https://images.unsplash.com/photo-1621996346565-e3d5d6281220?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=700&q=80"
  ],
  salade_bowl: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80"
  ],
  dahl_soupe: [
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1584278860047-22db9ff82bed?auto=format&fit=crop&w=700&q=80"
  ],
  burger: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80"
  ],
  pizza_tarte: [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80"
  ]
};

function getRecipePhoto(dishName = "", recipeId = 1) {
  const name = String(dishName || "").toLowerCase();
  const pick = (list) => (Array.isArray(list) && list.length > 0) ? list[Math.abs(Number(recipeId) || 0) % list.length] : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80";

  if (name.includes("saumon")) return pick(PHOTO_LIBRARY.saumon);
  if (name.includes("cabillaud") || name.includes("poisson") || name.includes("colin")) return pick(PHOTO_LIBRARY.poisson_blanc);
  if (name.includes("burger")) return pick(PHOTO_LIBRARY.burger);
  if (name.includes("curry") || name.includes("poulet") || name.includes("wok") || name.includes("dinde") || name.includes("tajine")) return pick(PHOTO_LIBRARY.poulet);
  if (name.includes("pâtes") || name.includes("gnocchi") || name.includes("lasagne") || name.includes("tagliatelle") || name.includes("risotto")) return pick(PHOTO_LIBRARY.pates_lasagnes);
  if (name.includes("boeuf") || name.includes("bœuf") || name.includes("steak") || name.includes("haché")) return pick(PHOTO_LIBRARY.boeuf);
  if (name.includes("porc") || name.includes("mignon")) return pick(PHOTO_LIBRARY.porc);
  if (name.includes("salade") || name.includes("bowl") || name.includes("quinoa") || name.includes("avocat") || name.includes("poke")) return pick(PHOTO_LIBRARY.salade_bowl);
  if (name.includes("pizza") || name.includes("tarte") || name.includes("quiche")) return pick(PHOTO_LIBRARY.pizza_tarte);
  if (name.includes("dahl") || name.includes("lentille") || name.includes("soupe") || name.includes("velouté") || name.includes("pois")) return pick(PHOTO_LIBRARY.dahl_soupe);

  return pick(PHOTO_LIBRARY.salade_bowl);
}

function getProductThumbnail(productName = "", rayon = "") {
  const p = (String(productName || "") + " " + String(rayon || "")).toLowerCase();
  if (p.includes("poulet") || p.includes("dinde") || p.includes("volaille")) return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=160&q=80";
  if (p.includes("boeuf") || p.includes("steak") || p.includes("viande") || p.includes("boucherie") || p.includes("porc")) return "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=160&q=80";
  if (p.includes("poisson") || p.includes("saumon") || p.includes("cabillaud") || p.includes("crevette") || p.includes("thon")) return "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=160&q=80";
  if (p.includes("fromage") || p.includes("reblochon") || p.includes("mozzarella") || p.includes("feta") || p.includes("crémerie") || p.includes("lait") || p.includes("creme") || p.includes("parmesan")) return "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=160&q=80";
  if (p.includes("courgette") || p.includes("aubergine") || p.includes("poivron") || p.includes("brocoli") || p.includes("légume") || p.includes("fruit") || p.includes("tomate") || p.includes("carotte") || p.includes("oignon") || p.includes("figue") || p.includes("poireau") || p.includes("avocat") || p.includes("ail")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=80";
  if (p.includes("pain") || p.includes("burger") || p.includes("pâte") || p.includes("boulangerie")) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=80";
  if (p.includes("curry") || p.includes("coriandre") || p.includes("épice") || p.includes("herbe") || p.includes("sel") || p.includes("poivre")) return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=80";
  if (p.includes("huile") || p.includes("vinaigre") || p.includes("sauce") || p.includes("moutarde")) return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=160&q=80";
  if (p.includes("riz") || p.includes("lentille") || p.includes("quinoa") || p.includes("pâtes") || p.includes("epicerie") || p.includes("conserve")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=80";
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80";
}

export default function App() {
  const moisFrancais = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const dateDuJour = new Date();
  const moisActuel = moisFrancais[dateDuJour.getMonth()];
  const jourDuMois = dateDuJour.getDate();

  // Multi-foyer
  const [foyerCode, setFoyerCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isCreatingFoyer, setIsCreatingFoyer] = useState(false);
  const [newFoyerName, setNewFoyerName] = useState("");

  const [loading, setLoading] = useState(true);
  const [swappingId, setSwappingId] = useState(null);
  const [isInjectingCraving, setIsInjectingCraving] = useState(false);
  const [cravingInput, setCravingInput] = useState("");

  // Navigation (4 univers)
  const [view, setView] = useState('menu');
  const [activeBasket, setActiveBasket] = useState(jourDuMois > 15 ? 2 : 1);
  const [config, setConfig] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Profil Foyer
  const [selectedRegime, setSelectedRegime] = useState("Omnivore (Manger de tout)");
  const [exclusionsInput, setExclusionsInput] = useState("");
  const [customBannedWord, setCustomBannedWord] = useState("");
  const [budgetInput, setBudgetInput] = useState(230);
  const [dureePlanning, setDureePlanning] = useState("1 Mois (2 Paniers)");
  const [nbRecettes, setNbRecettes] = useState(14);
  const [typeRepasPlanifies, setTypeRepasPlanifies] = useState("Dîner + Lunchbox midi");

  // 👪 Composition familiale
  const [nbAdultes, setNbAdultes] = useState(2);
  const [nbEnfants, setNbEnfants] = useState(1);
  const [optionEnfants, setOptionEnfants] = useState(true);

  // URLs Drive
  const [driveUrl1, setDriveUrl1] = useState("https://fd14-courses.leclercdrive.fr/magasin-053401-053401-lunel/recherche.aspx?TexteRecherche=");
  const [driveUrl2, setDriveUrl2] = useState("https://www.carrefour.fr/s?q=");
  const [driveNom1, setDriveNom1] = useState("Leclerc Lunel");
  const [driveNom2, setDriveNom2] = useState("Carrefour Alès");

  // Stocks
  const [stockList, setStockList] = useState([]);
  const [stockTab, setStockTab] = useState('congelateur');

  // Formulaire ajout stock
  const [newItemName, setNewItemName] = useState("");
  const [newItemLocation, setNewItemLocation] = useState("congelateur");
  const [newItemQty, setNewItemQty] = useState(1);

  // Calcul du nombre de portions cuisinées
  const totalPersonnesFoyer = Number(nbAdultes || 2) + Number(nbEnfants || 0);
  const isLunchboxMode = Boolean(typeRepasPlanifies && String(typeRepasPlanifies).includes("Lunchbox"));
  const targetPortions = isLunchboxMode ? totalPersonnesFoyer * 2 : totalPersonnesFoyer;

  // Chargement Foyer avec repli automatique sur FOYER-PA
  useEffect(() => {
    let savedCode = "";
    try {
      const urlParams = new URLSearchParams(window.location.search);
      savedCode = urlParams.get('foyer') || localStorage.getItem('smartdrive_foyer_code') || 'FOYER-PA';
    } catch (e) {
      savedCode = 'FOYER-PA';
    }

    if (savedCode) {
      const cleanCode = savedCode.trim().toUpperCase();
      try { localStorage.setItem('smartdrive_foyer_code', cleanCode); } catch (e) {}
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
      const { data: foyer, error } = await supabase
        .from('foyers')
        .select('*')
        .eq('code_foyer', code.trim().toUpperCase())
        .single();

      if (foyer) {
        setConfig(foyer);
        setCravingInput(foyer.cravings || "");
        setSelectedRegime(foyer.regime_alimentaire || "Omnivore (Manger de tout)");
        setExclusionsInput(foyer.exclusions || "");
        setBudgetInput(foyer.budget_mensuel || 230);
        setDureePlanning(foyer.duree_planning || "1 Mois (2 Paniers)");
        setNbRecettes(foyer.nb_recettes || 14);
        setTypeRepasPlanifies(foyer.type_repas_planifies || "Dîner + Lunchbox midi");

        setNbAdultes(foyer.nb_adultes !== undefined && foyer.nb_adultes !== null ? foyer.nb_adultes : 2);
        setNbEnfants(foyer.nb_enfants !== undefined && foyer.nb_enfants !== null ? foyer.nb_enfants : 1);
        setOptionEnfants(foyer.option_enfants !== undefined && foyer.option_enfants !== null ? foyer.option_enfants : true);

        if (foyer.drive_leclerc_url) setDriveUrl1(foyer.drive_leclerc_url);
        if (foyer.drive_carrefour_url) setDriveUrl2(foyer.drive_carrefour_url);

        const { data: stocks } = await supabase
          .from('inventaire_congelateur')
          .select('*')
          .eq('foyer_id', foyer.id)
          .eq('est_consomme', false)
          .order('created_at', { ascending: false });

        setStockList(Array.isArray(stocks) ? stocks : []);
      } else {
        setConfig(null);
      }
    } catch (e) {
      console.error("Erreur chargement foyer :", e);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }

  function handleConnectFoyer(e) {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    try { localStorage.setItem('smartdrive_foyer_code', code); } catch (err) {}
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
        current_month: moisActuel,
        regime_alimentaire: selectedRegime,
        exclusions: exclusionsInput,
        budget_mensuel: budgetInput,
        duree_planning: dureePlanning,
        nb_recettes: nbRecettes,
        nb_adultes: nbAdultes,
        nb_enfants: nbEnfants,
        option_enfants: optionEnfants,
        type_repas_planifies: typeRepasPlanifies,
        drive_leclerc_url: driveUrl1,
        drive_carrefour_url: driveUrl2,
        historique_notes: []
      }).select().single();

      if (error) {
        alert("Ce code foyer existe déjà, choisissez-en un autre !");
      } else {
        try { localStorage.setItem('smartdrive_foyer_code', code); } catch (err) {}
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
      try { localStorage.removeItem('smartdrive_foyer_code'); } catch (err) {}
      setConfig(null);
      setFoyerCode("");
      setInputCode("");
    }
  }

  async function saveFamilyImmediate(adults, kids, optKids) {
    setNbAdultes(adults);
    setNbEnfants(kids);
    setOptionEnfants(optKids);

    if (!config) return;
    try {
      await supabase.from('foyers').update({
        nb_adultes: adults,
        nb_enfants: kids,
        option_enfants: optKids
      }).eq('id', config.id);

      setConfig(prev => ({
        ...prev,
        nb_adultes: adults,
        nb_enfants: kids,
        option_enfants: optKids
      }));
    } catch (e) {
      console.error("Erreur sauvegarde famille :", e);
    }
  }

  async function autoSaveRegime(newRegime) {
    setSelectedRegime(newRegime);
    if (!config) return;
    setConfig(prev => ({ ...prev, regime_alimentaire: newRegime }));
    try {
      await supabase.from('foyers').update({ regime_alimentaire: newRegime }).eq('id', config.id);
    } catch (e) {
      console.error(e);
    }
  }

  async function autoSaveMealType(newMealType) {
    setTypeRepasPlanifies(newMealType);
    if (!config) return;
    setConfig(prev => ({ ...prev, type_repas_planifies: newMealType }));
    try {
      await supabase.from('foyers').update({ type_repas_planifies: newMealType }).eq('id', config.id);
    } catch (e) {
      console.error(e);
    }
  }

  async function autoSaveExclusions(newExclusions) {
    setExclusionsInput(newExclusions);
    if (!config) return;
    setConfig(prev => ({ ...prev, exclusions: newExclusions }));
    try {
      await supabase.from('foyers').update({ exclusions: newExclusions }).eq('id', config.id);
    } catch (e) {
      console.error(e);
    }
  }

  const activeExclusionsList = (typeof exclusionsInput === 'string' ? exclusionsInput : '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  async function handleAddCustomBanned(e) {
    if (e) e.preventDefault();
    const word = customBannedWord.trim();
    if (!word) return;
    if (activeExclusionsList.some(item => item.toLowerCase() === word.toLowerCase())) {
      setCustomBannedWord("");
      return;
    }
    const updated = [...activeExclusionsList, word].join(', ');
    setCustomBannedWord("");
    await autoSaveExclusions(updated);
  }

  async function handleRemoveBanned(term) {
    const updated = activeExclusionsList.filter(item => item.toLowerCase() !== term.toLowerCase()).join(', ');
    await autoSaveExclusions(updated);
  }

  async function autoSaveDuree(newDuree) {
    setDureePlanning(newDuree);
    if (!config) return;
    setConfig(prev => ({ ...prev, duree_planning: newDuree }));
    try {
      await supabase.from('foyers').update({ duree_planning: newDuree }).eq('id', config.id);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    if (!config) return;
    try {
      await supabase.from('foyers').update({
        regime_alimentaire: selectedRegime,
        exclusions: exclusionsInput,
        budget_mensuel: Number(budgetInput) || 230,
        duree_planning: dureePlanning,
        nb_recettes: Number(nbRecettes) || 14,
        type_repas_planifies: typeRepasPlanifies,
        nb_adultes: Number(nbAdultes) || 2,
        nb_enfants: Number(nbEnfants) || 0,
        option_enfants: Boolean(optionEnfants),
        drive_leclerc_url: driveUrl1,
        drive_carrefour_url: driveUrl2
      }).eq('id', config.id);

      setConfig(prev => ({
        ...prev,
        regime_alimentaire: selectedRegime,
        exclusions: exclusionsInput,
        budget_mensuel: Number(budgetInput) || 230,
        duree_planning: dureePlanning,
        nb_recettes: Number(nbRecettes) || 14,
        type_repas_planifies: typeRepasPlanifies,
        nb_adultes: Number(nbAdultes) || 2,
        nb_enfants: Number(nbEnfants) || 0,
        option_enfants: Boolean(optionEnfants),
        drive_leclerc_url: driveUrl1,
        drive_carrefour_url: driveUrl2
      }));

      alert("✅ Configuration du foyer enregistrée !");
    } catch (err) {
      console.error(err);
      alert("Erreur sauvegarde : " + err.message);
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
        alert(`✅ "${data.nom_produit}" ajouté à vos réserves !`);
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
      await supabase.from('inventaire_congelateur').update({ quantite: newQty, est_consomme: false }).eq('id', item.id);
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

  // 👨‍🍳 VALIDATION & ANNULATION DU PLAT CUISINÉ (AVEC RESTITUTION)
  async function toggleRecipeCooked(recipeId, moment = null, e) {
    if (e) e.stopPropagation();
    if (!config) return;

    let targetRecipe = null;
    let newCookedStatus = false;
    let deductedItems = [];

    const menuArr = Array.isArray(config.menu_json) ? config.menu_json : [];
    const updatedMenu = menuArr.map(r => {
      if (r.id === recipeId) {
        newCookedStatus = !r.est_cuisine;
        targetRecipe = r;
        return {
          ...r,
          est_cuisine: newCookedStatus,
          moment_cuisine: newCookedStatus ? (moment || r.moment || 'Soir') : null,
          date_cuisine: newCookedStatus ? `${jourDuMois} ${moisActuel}` : null
        };
      }
      return r;
    });

    if (newCookedStatus && targetRecipe && Array.isArray(targetRecipe.ingredients)) {
      const ingredientsText = targetRecipe.ingredients.join(" ").toLowerCase();

      for (const stockItem of stockList) {
        if (!stockItem.est_consomme && stockItem.quantite > 0) {
          const stockNameLower = String(stockItem.nom_produit || "").toLowerCase();
          if (stockNameLower && (ingredientsText.includes(stockNameLower) || stockNameLower.includes(cleanDriveTerm(stockNameLower)))) {
            await adjustStockQty(stockItem, -1);
            deductedItems.push({ id: stockItem.id, nom: stockItem.nom_produit, emplacement: stockItem.emplacement });
          }
        }
      }

      targetRecipe.stocks_deduits = deductedItems;
      const finalMenu = updatedMenu.map(r => r.id === recipeId ? { ...r, stocks_deduits: deductedItems } : r);

      setConfig(prev => ({ ...prev, menu_json: finalMenu }));
      await supabase.from('foyers').update({ menu_json: finalMenu }).eq('id', config.id);

      if (deductedItems.length > 0) {
        alert(`👨‍🍳 Bon appétit ! "${targetRecipe.nom}" validé. ${deductedItems.length} ingrédient(s) décomptés de vos réserves.`);
      }
    } 
    else if (!newCookedStatus && targetRecipe) {
      const previouslyDeducted = Array.isArray(targetRecipe.stocks_deduits) ? targetRecipe.stocks_deduits : [];
      for (const d of previouslyDeducted) {
        const itemInList = stockList.find(s => s.id === d.id);
        if (itemInList) {
          await adjustStockQty(itemInList, +1);
        } else {
          const { data } = await supabase.from('inventaire_congelateur').insert({
            foyer_id: config.id,
            nom_produit: d.nom,
            emplacement: d.emplacement || 'congelateur',
            quantite: 1,
            date_entree: `${jourDuMois} ${moisActuel}`,
            origine: 'Restitution Annulation',
            conservation_mois: 6,
            est_consomme: false
          }).select().single();
          if (data) setStockList(prev => [data, ...prev]);
        }
      }

      targetRecipe.stocks_deduits = [];
      const finalMenu = updatedMenu.map(r => r.id === recipeId ? { ...r, stocks_deduits: [] } : r);

      setConfig(prev => ({ ...prev, menu_json: finalMenu }));
      await supabase.from('foyers').update({ menu_json: finalMenu }).eq('id', config.id);

      alert(`↩️ Annulation : "${targetRecipe.nom}" repasse en attente et vos réserves ont été réintégrées !`);
    }
  }

  async function updateRating(recipeId, rating, e) {
    if (e) e.stopPropagation();
    if (!config) return;

    let ratedRecipeName = "";
    const menuArr = Array.isArray(config.menu_json) ? config.menu_json : [];
    const updatedMenu = menuArr.map(r => {
      if (r.id === recipeId) {
        const newRating = r.rating === rating ? 0 : rating;
        ratedRecipeName = r.nom;
        return { ...r, rating: newRating };
      }
      return r;
    });

    const currentHistory = Array.isArray(config.historique_notes) ? config.historique_notes : [];
    const cleanHistory = currentHistory.filter(h => h.nom !== ratedRecipeName);
    if (rating > 0) {
      cleanHistory.push({ nom: ratedRecipeName, rating: rating, date: `${jourDuMois} ${moisActuel}` });
    }

    setConfig(prev => ({ ...prev, menu_json: updatedMenu, historique_notes: cleanHistory }));
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      setSelectedRecipe(prev => ({ ...prev, rating: prev.rating === rating ? 0 : rating }));
    }

    await supabase.from('foyers').update({
      menu_json: updatedMenu,
      historique_notes: cleanHistory
    }).eq('id', config.id);
  }

  async function toggleItemStock(basketKey, index) {
    const list = Array.isArray(config?.panier_json?.[basketKey]) ? config.panier_json[basketKey] : [];
    const updatedList = list.map((item, i) => {
      if (i === index) return { ...item, in_stock: !item.in_stock };
      return item;
    });

    const updatedPanierJson = {
      ...(config.panier_json || {}),
      [basketKey]: updatedList
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);
  }

  async function toggleItemMode(basketKey, index, e) {
    e.stopPropagation();
    const list = Array.isArray(config?.panier_json?.[basketKey]) ? config.panier_json[basketKey] : [];
    const updatedList = list.map((item, i) => {
      if (i === index) {
        const currentMode = item.mode_choisi || 'frais';
        const newMode = currentMode === 'congelo' ? 'frais' : 'congelo';
        return { ...item, mode_choisi: newMode, a_alternative_congelo: true };
      }
      return item;
    });

    const updatedPanierJson = {
      ...(config.panier_json || {}),
      [basketKey]: updatedList
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);
  }

  async function toggleBasketReceivedStatus(basketKey) {
    const currentStatus = config?.panier_json?.[`statut_${basketKey}`] || { recu: false };
    const newStatus = {
      recu: !currentStatus.recu,
      date_reception: !currentStatus.recu ? `${jourDuMois} ${moisActuel}` : null
    };

    const updatedPanierJson = {
      ...(config.panier_json || {}),
      [`statut_${basketKey}`]: newStatus
    };

    setConfig(prev => ({ ...prev, panier_json: updatedPanierJson }));
    await supabase.from('foyers').update({ panier_json: updatedPanierJson }).eq('id', config.id);

    if (newStatus.recu) {
      alert(`✅ Courses du Panier ${activeBasket} rangées au frigo !`);
    }
  }

  async function handleApplyCraving(e) {
    if (e) e.preventDefault();
    const envie = cravingInput.trim();
    if (!config || !envie) return;

    setIsInjectingCraving(true);
    const basketKey = activeBasket === 1 ? 'p1' : 'p2';
    const menuArr = Array.isArray(config.menu_json) ? config.menu_json : [];
    const mealsCurrentQ = menuArr.filter(r => (r.basket || 1) === activeBasket);
    const targetRecipe = mealsCurrentQ[mealsCurrentQ.length - 1] || { id: Date.now(), basket: activeBasket };
    const portions = targetPortions;
    const regimeActuel = selectedRegime || config.regime_alimentaire || "Omnivore (Manger de tout)";

    const prompt = `Tu es un chef cuisinier étoilé pour l'application "À Table !".
ENVIE DU FOYER : "${envie}".
COMPOSITION FAMILIALE :
- Adultes : ${nbAdultes}
- Enfants (<12 ans) : ${nbEnfants}
- Kid-Friendly : ${optionEnfants ? "OUI" : "NON"}
- Portions : ${portions} personnes.
- Régime : ${regimeActuel}.
- Aliments bannis : ${exclusionsInput || config.exclusions || 'Aucun'}.

Format JSON pur :
{
  "nouvelle_recette": {
    "id": ${targetRecipe.id},
    "nom": "Titre appétissant",
    "type": "Plaisir",
    "moment": "Soir",
    "calories": "520 kcal",
    "temps": "25 min",
    "bienfait_sante": "✨ Recette adaptée au foyer",
    "saison_atout": "Ingrédients de saison",
    "kid_friendly": ${optionEnfants},
    "ingredients": ["Ingrédient 1", "Ingrédient 2"],
    "etapes": ["Étape 1", "Étape 2"],
    "conseil": "Astuce chef",
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

      let updatedMenu = menuArr.map(r => 
        r.id === targetRecipe.id ? response.nouvelle_recette : r
      );
      if (!updatedMenu.some(r => r.id === response.nouvelle_recette.id)) {
        updatedMenu.push(response.nouvelle_recette);
      }

      const currentBasketList = Array.isArray(config.panier_json?.[basketKey]) ? config.panier_json[basketKey] : [];
      const updatedPanierJson = {
        ...(config.panier_json || {}),
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

      alert(`🎉 Votre envie "${envie}" (${portions} pers.) a été intégrée avec succès !`);
    } catch (err) {
      console.error(err);
      alert("Erreur intégration : " + err.message);
    } finally {
      setIsInjectingCraving(false);
    }
  }

  async function swapRecipe(recipeToSwap) {
    if (!config || !recipeToSwap) return;
    setSwappingId(recipeToSwap.id);

    const targetBasket = recipeToSwap.basket || activeBasket;
    const basketKey = targetBasket === 1 ? 'p1' : 'p2';
    const portions = targetPortions;
    const regimeActuel = selectedRegime || config.regime_alimentaire || "Omnivore (Manger de tout)";

    const prompt = `Tu es un chef cuisinier pour "À Table !".
Le foyer ne souhaite PAS cuisiner : "${recipeToSwap.nom}".
COMPOSITION : ${nbAdultes} adultes, ${nbEnfants} enfants. Total ${portions} portions.
Option Enfants : ${optionEnfants ? 'OUI' : 'NON'}.
Régime : ${regimeActuel}. Bannis : ${exclusionsInput || config.exclusions || 'Aucun'}.
Génère UNE NOUVELLE RECETTE DE REMPLACEMENT (${portions} portions) de saison pour ${moisActuel.toUpperCase()} en France.

Format JSON pur :
{
  "nouvelle_recette": {
    "id": ${recipeToSwap.id},
    "nom": "Nom recette",
    "type": "${recipeToSwap.type || 'Frais'}",
    "moment": "${recipeToSwap.moment || 'Soir'}",
    "calories": "490 kcal",
    "temps": "25 min",
    "bienfait_sante": "🛡️ Bienfait santé",
    "saison_atout": "Légumes de saison",
    "kid_friendly": ${optionEnfants},
    "ingredients": ["Ingrédient 1", "Ingrédient 2"],
    "etapes": ["Étape 1", "Étape 2"],
    "conseil": "Astuce chef",
    "basket": ${targetBasket},
    "rating": 0
  },
  "anciens_mots_cles_a_retirer": [],
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

      const menuArr = Array.isArray(config.menu_json) ? config.menu_json : [];
      const updatedMenu = menuArr.map(r => 
        r.id === recipeToSwap.id ? response.nouvelle_recette : r
      );

      const currentBasketList = Array.isArray(config.panier_json?.[basketKey]) ? config.panier_json[basketKey] : [];
      const keywordsToRemove = (response.anciens_mots_cles_a_retirer || []).map(k => String(k).toLowerCase());

      const cleanedBasket = currentBasketList.filter(item => {
        if (item.recette_id && item.recette_id === recipeToSwap.id) return false;
        const itemName = String(item.nom || "").toLowerCase();
        if (keywordsToRemove.some(k => itemName.includes(k))) return false;
        return true;
      });

      const updatedPanierJson = {
        ...(config.panier_json || {}),
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

      alert(`🎉 Plat remplacé par : "${response.nouvelle_recette.nom}" !`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'échange : " + e.message);
    } finally {
      setSwappingId(null);
    }
  }

  // 🎯 GÉNÉRATION MENSUELLE SÉCURISÉE
  async function generateWithGemini() {
    if (!config) return;
    setLoading(true);

    const permanentHistory = Array.isArray(config.historique_notes) ? config.historique_notes : [];
    const lovedRecipes = permanentHistory.filter(h => h.rating >= 4).map(h => h.nom);
    const dislikedRecipes = permanentHistory.filter(h => h.rating <= 2).map(h => h.nom);

    const stocksActifs = (Array.isArray(stockList) ? stockList : []).filter(s => !s.est_consomme && s.quantite > 0);
    const stocksCongelo = stocksActifs.filter(s => s.emplacement === 'congelateur').map(s => `${s.nom_produit} (qté: ${s.quantite})`);
    const stocksPlacard = stocksActifs.filter(s => s.emplacement === 'placard').map(s => `${s.nom_produit} (qté: ${s.quantite})`);

    const regimeActuel = selectedRegime || config.regime_alimentaire || "Omnivore (Manger de tout)";
    const exclusionsActuelles = exclusionsInput || config.exclusions || 'Aucune';
    const budgetActuel = Number(budgetInput || config.budget_mensuel || 230);
    const duree = String(dureePlanning || config.duree_planning || "1 Mois (2 Paniers)");
    const totalRecettes = Number(nbRecettes || config.nb_recettes || 14);
    const modeRepas = String(typeRepasPlanifies || config.type_repas_planifies || "Dîner + Lunchbox midi");

    const adults = Number(nbAdultes !== undefined ? nbAdultes : (config.nb_adultes ?? 2));
    const kids = Number(nbEnfants !== undefined ? nbEnfants : (config.nb_enfants ?? 1));
    const isKidFriendly = optionEnfants !== undefined ? optionEnfants : Boolean(config.option_enfants);
    const totalPersons = adults + kids;
    const portions = isLunchboxMode ? totalPersons * 2 : totalPersons;

    const isMonth = duree.includes('Mois');
    const q1Count = isMonth ? Math.ceil(totalRecettes / 2) : totalRecettes;

    const prompt = `Tu es un chef cuisinier étoilé et logisticien financier pour "À Table !".
COMPOSITION FAMILIALE OBLIGATOIRE :
- Adultes : ${adults}
- Enfants (<12 ans) : ${kids}
- Option Kid-Friendly : ${isKidFriendly ? "OUI STRICTEMENT (Recettes qui plaisent aux enfants : légumes habilement intégrés en gratins/purées douces, zéro piment fort, saveurs réconfortantes)" : "NON"}
- Portions par plat : ${portions} portions (pour nourrir ${totalPersons} personnes).

PROFIL ALIMENTAIRE :
- Régime : ${regimeActuel}
- ALIMENTS INTERDITS : ${exclusionsActuelles} (Interdiction formelle d'en mettre !)

CADENCE :
- Période : ${duree}
- EXACTEMENT ${totalRecettes} RECETTES DANS "repas".
${isMonth ? `- Répartition : Recettes 1 à ${q1Count} en Panier 1, Recettes ${q1Count + 1} à ${totalRecettes} en Panier 2.` : `- Toutes les recettes ont "basket": 1.`}

RÉSERVES DU FOYER :
- Congélateur : ${stocksCongelo.length ? stocksCongelo.join(', ') : 'Aucun'}
- Placard : ${stocksPlacard.length ? stocksPlacard.join(', ') : 'Aucun'}
Utilise ces réserves en priorité et NE LES COMMANDE PAS au Drive !

Génère ${totalRecettes} recettes de saison pour ${moisActuel.toUpperCase()} en France (${portions} portions).
Format JSON pur :
{
  "repas": [
    {
      "id": 1,
      "nom": "Nom recette 1",
      "type": "Frais",
      "moment": "Soir",
      "calories": "510 kcal",
      "temps": "25 min",
      "bienfait_sante": "🛡️ Bienfait santé",
      "saison_atout": "Légumes d'automne",
      "kid_friendly": ${isKidFriendly},
      "ingredients": ["Ingrédient 1", "Ingrédient 2"],
      "etapes": ["Étape 1", "Étape 2"],
      "conseil": "Astuce chef",
      "basket": 1,
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
      "conseil_anti_gaspi": "🌿 Frais",
      "est_condiment": false,
      "recette_id": ${q1Count + 1},
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
        console.warn("Modèle 3.6 saturé, bascule sur 3.5...", err);
        const fallback = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await fallback.generateContent(prompt);
        responseText = result.response.text();
      }

      const response = JSON.parse(responseText);

      const initialPanierJson = {
        p1: Array.isArray(response.panier_1) ? response.panier_1 : [],
        p2: Array.isArray(response.panier_2) ? response.panier_2 : [],
        statut_p1: { recu: false, date_reception: null },
        statut_p2: { recu: false, date_reception: null }
      };

      await supabase.from('foyers').update({
        menu_json: Array.isArray(response.repas) ? response.repas : [],
        panier_json: initialPanierJson,
        regime_alimentaire: regimeActuel,
        exclusions: exclusionsActuelles,
        budget_mensuel: budgetActuel,
        duree_planning: duree,
        nb_recettes: totalRecettes,
        type_repas_planifies: modeRepas,
        nb_adultes: adults,
        nb_enfants: kids,
        option_enfants: isKidFriendly,
        current_month: moisActuel
      }).eq('id', config.id);

      loadFoyerData(foyerCode);
      alert(`Menu généré pour ${adults} adulte(s) et ${kids} enfant(s) (${isKidFriendly ? '🧸 Kid-Friendly' : ''}) !`);
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
            star <= rating ? 'text-amber-400' : 'text-stone-300'
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
      <div className="w-full min-h-screen bg-[#1C1917] text-white p-6 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-3">🍽️</span>
            <h1 className="text-3xl font-black italic tracking-tight font-serif">À Table !</h1>
            <p className="text-xs text-stone-400 mt-1">Vos repas cuisinés et vos courses Drive, zéro stress</p>
          </div>

          {!isCreatingFoyer ? (
            <form onSubmit={handleConnectFoyer} className="bg-[#292524] p-6 rounded-3xl border border-stone-700 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">Rejoindre votre Foyer</h2>
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Code d'accès Foyer</label>
                <input 
                  type="text" 
                  className="w-full bg-[#1C1917] border border-stone-600 rounded-xl p-3 text-white uppercase font-black text-center tracking-widest text-lg focus:outline-none focus:border-amber-400"
                  placeholder="EX: FOYER-PA"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-[#C25E3E] hover:bg-[#A84E33] text-white font-extrabold py-3 rounded-xl transition shadow-lg">
                Accéder à mes Repas
              </button>
              <div className="pt-2 text-center">
                <button type="button" onClick={() => setIsCreatingFoyer(true)} className="text-xs text-stone-400 hover:text-white underline">
                  Créer un nouveau foyer (pour un ami)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateFoyer} className="bg-[#292524] p-6 rounded-3xl border border-stone-700 shadow-xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Créer un Nouveau Foyer</h2>
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Nom du foyer / Famille</label>
                <input 
                  type="text" 
                  className="w-full bg-[#1C1917] border border-stone-600 rounded-xl p-3 text-white text-sm"
                  placeholder="Ex: Famille Dupont"
                  value={newFoyerName}
                  onChange={(e) => setNewFoyerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Code Foyer Unique</label>
                <input 
                  type="text" 
                  className="w-full bg-[#1C1917] border border-stone-600 rounded-xl p-3 text-white uppercase font-black text-center tracking-widest"
                  placeholder="EX: FOYER-DUPONT"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition shadow-lg">
                Créer et Démarrer
              </button>
              <div className="pt-2 text-center">
                <button type="button" onClick={() => setIsCreatingFoyer(false)} className="text-xs text-stone-400 hover:text-white underline">
                  Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAF8F5] gap-3">
        <div className="w-10 h-10 border-4 border-[#C25E3E] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-stone-700 text-sm">Chargement de votre table...</p>
      </div>
    );
  }

  const currentBasketKey = activeBasket === 1 ? 'p1' : 'p2';
  const activePanierList = Array.isArray(config?.panier_json?.[currentBasketKey]) ? config.panier_json[currentBasketKey] : [];
  const inStockCount = activePanierList.filter(i => i && i.in_stock).length;

  const basketStatus = config?.panier_json?.[`statut_${currentBasketKey}`] || { recu: false };
  const isBasketReceived = basketStatus.recu;

  const totalPanierEstime = activePanierList
    .filter(i => i && !i.in_stock)
    .reduce((sum, i) => {
      const isCongelo = i.mode_choisi === 'congelo';
      const prix = isCongelo && i.prix_congelo ? Number(i.prix_congelo) : Number(i.prix_frais || 2.5);
      return sum + prix;
    }, 0);

  const estimationDrive1 = totalPanierEstime > 0 ? (totalPanierEstime * 0.97).toFixed(2) : "0.00";
  const estimationDrive2 = totalPanierEstime > 0 ? (totalPanierEstime * 1.03).toFixed(2) : "0.00";
  const ecartEconomieDrive = (Number(estimationDrive2) - Number(estimationDrive1)).toFixed(2);

  const totalEconomiesRealisees = activePanierList
    .filter(i => i && !i.in_stock && i.mode_choisi === 'congelo' && i.prix_congelo && i.prix_frais)
    .reduce((sum, i) => sum + (Number(i.prix_frais) - Number(i.prix_congelo)), 0);

  const currentDuree = String(dureePlanning || config?.duree_planning || "1 Mois (2 Paniers)");
  const isPlanningMonth = currentDuree.includes('Mois');
  const targetNbRecettes = Number(nbRecettes || config?.nb_recettes || 14);
  const q1Threshold = isPlanningMonth ? Math.ceil(targetNbRecettes / 2) : targetNbRecettes;

  const menuList = Array.isArray(config?.menu_json) ? config.menu_json : [];
  const mealsForActiveQuinzaine = menuList.filter((repas, index) => {
    if (!isPlanningMonth) return true;
    if (repas.basket === 1 || repas.basket === 2) {
      return repas.basket === activeBasket;
    }
    return activeBasket === 1 ? index < q1Threshold : index >= q1Threshold;
  });

  const premierPlatFrais = mealsForActiveQuinzaine.find(r => r && r.type === 'Frais' && !r.est_cuisine) || mealsForActiveQuinzaine.find(r => r && !r.est_cuisine);

  const cookedCount = mealsForActiveQuinzaine.filter(r => r && r.est_cuisine).length;
  const totalCount = mealsForActiveQuinzaine.length;
  const progressPercent = totalCount > 0 ? (cookedCount / totalCount) * 100 : 0;

  const safeStockList = Array.isArray(stockList) ? stockList : [];
  const filteredStockList = safeStockList.filter(item => {
    const emp = item?.emplacement || 'congelateur';
    return emp === stockTab;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-28 font-sans text-stone-900 transition-all flex flex-col justify-between">
      
      {/* HEADER BISTROT GOURMAND "À TABLE !" */}
      <header className="bg-gradient-to-r from-[#C25E3E] to-[#A84E33] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto w-full p-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-xl border border-white/20 shadow-inner">
                🍽️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black italic text-2xl md:text-3xl tracking-tight font-serif">À Table !</h1>
                  <span className="text-[10px] bg-white/20 text-amber-100 font-extrabold px-2.5 py-0.5 rounded-full">
                    {config?.code_foyer || foyerCode}
                  </span>
                  <button 
                    onClick={handleLogoutFoyer}
                    className="text-[9px] bg-white/10 hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition"
                    title="Changer de foyer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-amber-100 mt-0.5">
                  {moisActuel} • {nbAdultes} Adulte(s) {nbEnfants > 0 && `• ${nbEnfants} Enfant(s)`} {optionEnfants && '🧸'}
                </p>
              </div>
            </div>

            {/* Navigation ordinateur */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {[
                { id: 'menu', label: '🍽️ Planning' },
                { id: 'shop', label: '🛒 Courses Drive' },
                { id: 'stocks', label: '🏠 Réserves' },
                { id: 'profile', label: '⚙️ Profil' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    view === tab.id 
                      ? 'bg-white text-[#C25E3E] shadow-sm' 
                      : 'text-amber-100 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right text-xs text-amber-100 font-medium">
              <p>📅 {jourDuMois} {moisActuel}</p>
              <p className="text-[10px] opacity-90">{isPlanningMonth ? `Quinzaine ${activeBasket}` : currentDuree}</p>
            </div>
            <button
              onClick={generateWithGemini}
              className="bg-white text-[#C25E3E] hover:bg-amber-100 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>Générer</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEUR PRINCIPAL */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-1">
        {/* Sélecteur Quinzaine */}
        {view !== 'stocks' && view !== 'profile' && isPlanningMonth && (
          <div className="flex bg-stone-200/70 p-1.5 rounded-2xl mb-6 shadow-inner max-w-md mx-auto">
            <button
              onClick={() => setActiveBasket(1)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeBasket === 1 ? 'bg-white text-[#C25E3E] shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Quinzaine 1 (Sem. 1 & 2)
            </button>
            <button
              onClick={() => setActiveBasket(2)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeBasket === 2 ? 'bg-white text-[#C25E3E] shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Quinzaine 2 (Sem. 3 & 4)
            </button>
          </div>
        )}

        {/* 1. VUE PLANNING */}
        {view === 'menu' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>🍽️</span>
                    <span>Avancement Quinzaine {activeBasket}</span>
                  </span>
                  <span className="text-[#C25E3E] font-black">{cookedCount} / {totalCount} cuisinés</span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-3xl px-5 py-4 flex items-center justify-between text-xs text-stone-700 shadow-sm">
                <div>
                  <span className="font-extrabold text-sm block text-stone-800">
                    🎯 {targetNbRecettes} repas • {nbAdultes} Adulte(s) {nbEnfants > 0 && `• ${nbEnfants} Enfant(s)`}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {targetPortions} pers. par plat {optionEnfants && '• Mode Kid-Friendly 🧸'}
                  </p>
                </div>
                <button
                  onClick={() => setView('profile')}
                  className="bg-white text-[#C25E3E] border border-amber-200 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:bg-amber-100 transition"
                >
                  Ajuster ⚙️
                </button>
              </div>
            </div>

            {isBasketReceived ? (
              premierPlatFrais && (
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-5 text-white shadow-lg animate-in fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🚨</span>
                      <span className="text-xs md:text-sm font-black uppercase tracking-wider">Fraîcheur Frigo (Courses du {basketStatus.date_reception})</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium leading-snug">
                      À cuisiner en priorité : <b>{premierPlatFrais.nom}</b>. Pas le temps ?
                    </p>
                  </div>
                  <div className="flex gap-2.5 flex-shrink-0">
                    <button
                      onClick={() => setSelectedRecipe(premierPlatFrais)}
                      className="flex-1 bg-white text-stone-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow active:scale-95 transition"
                    >
                      👨‍🍳 Cuisiner
                    </button>
                    <button
                      onClick={() => rescueToFreezer(premierPlatFrais.ingredients?.[0] || premierPlatFrais.nom, "Sauvetage Frigo")}
                      className="flex-1 bg-stone-900/40 hover:bg-stone-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-white/20 active:scale-95 transition"
                    >
                      🧊 Sauver au Congélo
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-stone-100 border border-stone-200 rounded-3xl p-4 flex items-center justify-between text-xs text-stone-700">
                <span className="flex items-center gap-2 font-medium">
                  <span>🛒</span>
                  <span>Panier {activeBasket} à commander au Drive</span>
                </span>
                <button
                  onClick={() => setView('shop')}
                  className="bg-[#C25E3E] text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-[#A84E33] transition"
                >
                  Voir ma liste
                </button>
              </div>
            )}

            {/* Boîte d'envie */}
            <form onSubmit={handleApplyCraving} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#C25E3E] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>✨</span> Une envie gourmande précise ?
                </span>
                {config?.cravings && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                    Actuel : {config.cravings}
                  </span>
                )}
              </label>

              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Ex: Lasagnes maison, nuggets sains, gratin doux..."
                  value={cravingInput}
                  onChange={(e) => setCravingInput(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C25E3E] transition"
                />

                <button
                  type="submit"
                  disabled={isInjectingCraving || !cravingInput.trim()}
                  className="bg-[#C25E3E] hover:bg-[#A84E33] disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow transition flex items-center gap-1.5 active:scale-95 flex-shrink-0"
                >
                  <span>{isInjectingCraving ? '⏳' : '✨'}</span>
                  <span>{isInjectingCraving ? 'Cuisine...' : 'Intégrer'}</span>
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center pl-1 pr-1 pt-2">
              <h2 className="text-xs md:text-sm font-black text-stone-600 uppercase tracking-widest">
                {isPlanningMonth ? `Repas de la Quinzaine ${activeBasket}` : `Repas du cycle (${currentDuree})`}
              </h2>
              <span className="text-xs text-emerald-700 font-black bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {mealsForActiveQuinzaine.length} Recettes • {targetPortions} pers. {optionEnfants && '🧸'}
              </span>
            </div>

            {/* GRILLE DES RECETTES */}
            {mealsForActiveQuinzaine.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mealsForActiveQuinzaine.map((repas) => {
                  const photoUrl = getRecipePhoto(repas?.nom, repas?.id);
                  const isSwapping = swappingId === repas?.id;
                  const hasRating = repas?.rating && repas.rating > 0;
                  const canShowStars = repas?.est_cuisine || hasRating;
                  const isMidi = repas?.moment === 'Midi';

                  return (
                    <div
                      key={repas.id}
                      onClick={() => setSelectedRecipe(repas)}
                      className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border transition-all cursor-pointer flex flex-col justify-between ${
                        repas.est_cuisine ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="relative h-48 w-full bg-stone-200 overflow-hidden">
                          <img 
                            src={photoUrl} 
                            alt={repas.nom} 
                            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${repas.est_cuisine ? 'opacity-75 grayscale-[15%]' : ''}`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>
                          
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${
                              isMidi ? 'bg-amber-400 text-stone-950' : 'bg-indigo-900 text-white'
                            }`}>
                              {isMidi ? '☀️ Midi' : '🌙 Soir'}
                            </span>

                            {repas.kid_friendly && (
                              <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                <span>🧸</span> Kid-Friendly
                              </span>
                            )}

                            {repas.est_cuisine && (
                              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                                ✓ Cuisiné
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                            <div className="flex items-center gap-2 text-xs font-bold drop-shadow">
                              <span>⏱️ {repas.temps || '20 min'}</span>
                              <span>•</span>
                              <span className="text-amber-300">🔥 {repas.calories || '480 kcal'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="mb-2">
                            <span className="inline-block bg-amber-50 text-[#C25E3E] text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-200/50">
                              {repas.bienfait_sante || "🛡️ Équilibre & Vitalité"}
                            </span>
                          </div>

                          <h3 className={`text-base font-extrabold leading-snug mb-1 ${repas.est_cuisine ? 'text-emerald-950' : 'text-stone-900'}`}>
                            {repas.nom}
                          </h3>

                          {repas.saison_atout && (
                            <p className="text-xs text-stone-500 font-medium mb-3">
                              🌱 {repas.saison_atout}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-2.5 border-t border-stone-100 flex justify-between items-center gap-2 mt-auto">
                        {canShowStars ? (
                          <div className="flex items-center gap-1">
                            <StarRating 
                              rating={repas.rating || 0} 
                              onRate={(star, e) => updateRating(repas.id, star, e)} 
                            />
                            {hasRating && (
                              <span className="text-[10px] font-bold text-amber-600">({repas.rating}/5)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">
                            🍽️ À noter après dégustation
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleRecipeCooked(repas.id, repas.moment || 'Repas', e)}
                            className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 active:scale-95 border ${
                              repas.est_cuisine
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                            }`}
                            title={repas.est_cuisine ? "Cliquer pour annuler" : "Marquer cuisiné"}
                          >
                            <span>{repas.est_cuisine ? '✅' : isMidi ? '☀️' : '🌙'}</span>
                            <span>{repas.est_cuisine ? `${repas.date_cuisine || 'Fait'}` : 'Cuisiné'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSwapping}
                            onClick={(e) => {
                              e.stopPropagation();
                              swapRecipe(repas);
                            }}
                            className="text-[11px] font-extrabold text-[#C25E3E] hover:text-[#A84E33] bg-amber-50 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 active:scale-95 border border-amber-200/60"
                            title="Remplacer cette recette"
                          >
                            <span>{isSwapping ? '⏳' : '🔄'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-stone-300">
                <p className="text-stone-500 text-sm mb-3">Aucune recette trouvée.</p>
                <button
                  onClick={generateWithGemini}
                  className="bg-[#C25E3E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow"
                >
                  Cliquez sur "⚡ Générer" en haut
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. VUE COURSES & ARBITRE DRIVE */}
        {view === 'shop' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isBasketReceived ? '✅' : '📦'}</span>
                <div>
                  <h4 className="text-sm font-black text-stone-800">
                    {isBasketReceived ? `Courses rangées au frigo le ${basketStatus.date_reception}` : `Panier ${activeBasket} en attente`}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {isBasketReceived ? 'Suivi fraîcheur actif dans votre Planning' : 'Cliquez une fois vos sacs rangés'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleBasketReceivedStatus(currentBasketKey)}
                className={`text-xs font-black px-4 py-2.5 rounded-xl transition uppercase tracking-wider ${
                  isBasketReceived ? 'bg-stone-100 text-stone-600' : 'bg-emerald-600 text-white'
                }`}
              >
                {isBasketReceived ? 'Modifier' : 'J\'ai rangé mes courses'}
              </button>
            </div>

            <div className="bg-[#1C1917] rounded-3xl p-5 md:p-6 text-white shadow-xl border border-stone-800">
              <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚖️</span>
                  <span className="text-sm font-black uppercase tracking-wider text-amber-400">L'Arbitre Drive IA</span>
                </div>
                <span className="text-xs font-bold text-stone-400">Panier {activeBasket}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white/10 p-4 rounded-2xl border border-emerald-500/40 relative">
                  <span className="absolute -top-2 right-2 bg-emerald-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                    Le moins cher
                  </span>
                  <p className="text-xs font-bold text-stone-300 uppercase truncate">{driveNom1}</p>
                  <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-0.5">{estimationDrive1} €</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-stone-400 uppercase truncate">{driveNom2}</p>
                  <p className="text-2xl md:text-3xl font-black text-stone-200 mt-0.5">{estimationDrive2} €</p>
                  <p className="text-[10px] text-amber-300 mt-0.5">+{ecartEconomieDrive} € d'écart</p>
                </div>
              </div>

              <p className="text-xs text-stone-300 italic font-medium">
                💡 <b>Verdict de l'Arbitre :</b> {driveNom1} est ~{ecartEconomieDrive} € plus économique sur ce panier complet.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 rounded-3xl shadow-md flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 block">
                  Total Panier {activeBasket} ({targetPortions} pers.)
                </span>
                <span className="text-2xl md:text-3xl font-black">
                  {totalPanierEstime.toFixed(2)} €
                </span>
              </div>
              
              {totalEconomiesRealisees > 0 && (
                <div className="bg-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-emerald-100">
                  <span>🧊</span>
                  <span>Économie : <b>{totalEconomiesRealisees.toFixed(2)} €</b> grâce au congélateur !</span>
                </div>
              )}
            </div>

            <div className="bg-stone-100 border border-stone-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-stone-700">
              <span>🏠 <b>{inStockCount}</b> ingrédient(s) déjà chez vous</span>
              <span className="text-[10px] font-black uppercase bg-stone-200 text-stone-800 px-2.5 py-1 rounded-full">
                {activePanierList.length - inStockCount} à commander
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePanierList.map((item, index) => {
                const nomLower = String(item?.nom || "").toLowerCase();
                const canFreeze = item?.a_alternative_congelo || 
                  ['saumon', 'cabillaud', 'poisson', 'poulet', 'boeuf', 'bœuf', 'steak', 'porc', 'brocoli', 'haricot', 'legume', 'frite', 'figue']
                  .some(kw => nomLower.includes(kw));

                const isCongelo = item?.mode_choisi === 'congelo' && canFreeze;
                const prixFrais = Number(item?.prix_frais || 4.5);
                const prixCongelo = Number(item?.prix_congelo || (prixFrais * 0.7).toFixed(2));
                const activePrice = isCongelo ? prixCongelo : prixFrais;

                const searchFrais = item?.recherche_frais || item?.nom || "";
                const searchCongelo = item?.recherche_congelo || `${cleanDriveTerm(searchFrais)} surgele`;
                const cleanTerm = cleanDriveTerm(isCongelo ? searchCongelo : searchFrais);

                const linkDrive1 = `${driveUrl1}${encodeURIComponent(cleanTerm)}`;
                const linkDrive2 = `${driveUrl2}${encodeURIComponent(cleanTerm)}`;
                const thumbnail = getProductThumbnail(item?.nom, item?.rayon);

                return (
                  <div
                    key={index}
                    onClick={() => toggleItemStock(currentBasketKey, index)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      item?.in_stock 
                        ? 'bg-stone-100 border-stone-200 opacity-50' 
                        : 'bg-white border-stone-200 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          item?.in_stock 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-stone-300 bg-white'
                        }`}>
                          {item?.in_stock && <span className="text-xs font-bold">✓</span>}
                        </div>

                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                          <img 
                            src={thumbnail} 
                            alt={item?.nom || "Produit"} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">
                                {item?.rayon || "Épicerie"}
                              </span>
                              {item?.est_condiment && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                  🧂 Épice
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-stone-800">
                              ~{activePrice.toFixed(2)} €
                            </span>
                          </div>

                          <span className={`text-sm font-extrabold block truncate ${
                            item?.in_stock ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}>
                            {item?.nom}
                          </span>

                          {item?.in_stock && (
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">
                              Déjà en stock chez vous
                            </span>
                          )}
                        </div>
                      </div>

                      {!item?.in_stock && canFreeze && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] font-bold text-stone-500">Option d'achat :</div>
                            <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                              <button
                                type="button"
                                onClick={(e) => toggleItemMode(currentBasketKey, index, e)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                                  !isCongelo 
                                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200' 
                                    : 'text-stone-400 hover:text-stone-600'
                                }`}
                              >
                                <span>🌿</span> Frais ({prixFrais.toFixed(2)}€)
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleItemMode(currentBasketKey, index, e)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                                  isCongelo 
                                    ? 'bg-sky-700 text-white shadow-sm' 
                                    : 'text-sky-700 hover:text-sky-900'
                                }`}
                              >
                                <span>🧊</span> Congélo {item?.gain_anti_radin && `(${item.gain_anti_radin})`}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!item?.in_stock && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <a
                          href={linkDrive1}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-blue-100 transition"
                        >
                          <span>🛒</span> {driveNom1} {isCongelo && '(Surgelé)'}
                        </a>

                        <a
                          href={linkDrive2}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-sky-100 transition"
                        >
                          <span>🛒</span> {driveNom2} {isCongelo && '(Surgelé)'}
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cleanTerm, e);
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl ml-auto transition"
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

        {/* 3. VUE MES STOCKS */}
        {view === 'stocks' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-5 md:p-6 text-white shadow-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">Inventaire Réel Foyer</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-black">{safeStockList.length} articles</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black">Réserves de la Maison 🏠</h2>
              <p className="text-xs md:text-sm text-stone-300 font-medium mt-1">
                L'IA utilise ces ingrédients en priorité pour vous faire économiser au Drive !
              </p>
            </div>

            <div className="flex bg-stone-200/70 p-1 rounded-2xl shadow-inner max-w-md mx-auto">
              <button
                onClick={() => setStockTab('congelateur')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  stockTab === 'congelateur' ? 'bg-white text-sky-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span>🧊</span> Grand Congélateur ({safeStockList.filter(i => (i.emplacement || 'congelateur') === 'congelateur').length})
              </button>
              <button
                onClick={() => setStockTab('placard')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  stockTab === 'placard' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span>🥫</span> Placard & Épicerie ({safeStockList.filter(i => i.emplacement === 'placard').length})
              </button>
            </div>

            <form onSubmit={handleAddStockItem} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 max-w-xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                  + Ajouter un produit existant
                </span>
                <div className="flex gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setNewItemLocation('congelateur')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      newItemLocation === 'congelateur' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    🧊 Congélo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemLocation('placard')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      newItemLocation === 'placard' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    🥫 Placard
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder={newItemLocation === 'congelateur' ? "Ex: Steaks hachés, Saumon..." : "Ex: Huile d'olive, Curry, Pâtes..."}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C25E3E]"
                />

                <div className="flex items-center bg-stone-100 rounded-xl border border-stone-200 px-1">
                  <button
                    type="button"
                    onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))}
                    className="w-7 h-7 font-black text-stone-500 hover:text-stone-800"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-black text-stone-800">{newItemQty}</span>
                  <button
                    type="button"
                    onClick={() => setNewItemQty(newItemQty + 1)}
                    className="w-7 h-7 font-black text-stone-500 hover:text-stone-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow"
              >
                Ajouter à mes réserves
              </button>
            </form>

            {filteredStockList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStockList.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black ${
                        item.emplacement === 'placard' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                      }`}>
                        {item.emplacement === 'placard' ? '🥫' : '🧊'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-stone-900">{item.nom_produit}</h4>
                        <p className="text-[11px] text-stone-500 font-medium">
                          Ajouté le {item.date_entree} • <span className="text-emerald-700 font-bold">{item.origine}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-stone-100 rounded-xl border border-stone-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => adjustStockQty(item, -1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm font-black text-xs text-stone-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black text-stone-900">
                          x{item.quantite || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustStockQty(item, 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm font-black text-xs text-stone-700"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => adjustStockQty(item, -999)}
                        className="text-stone-300 hover:text-red-500 p-1 text-sm transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-stone-300">
                <span className="text-3xl block mb-2">{stockTab === 'placard' ? '🥫' : '🧊'}</span>
                <p className="text-stone-600 font-bold text-sm">
                  Votre {stockTab === 'placard' ? 'placard à épicerie' : 'grand congélateur'} est vide.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. VUE PROFIL (CONFIGURATION COMPLÈTE DU FOYER) */}
        {view === 'profile' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">Configuration du Foyer</span>
                <h2 className="text-2xl font-black mt-0.5 font-serif">Profil & Préférences ⚙️</h2>
                <p className="text-xs md:text-sm text-stone-300 font-medium mt-1">
                  Enregistré en direct à chaque clic !
                </p>
              </div>
              <span className="bg-white/20 px-3.5 py-1 rounded-full text-xs font-bold text-amber-100">{config?.code_foyer || foyerCode}</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLONNE GAUCHE : COMPOSITION, CADENCE, BUDGET */}
                <div className="space-y-6">
                  
                  {/* COMPOSITION FAMILIALE */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center justify-between">
                      <span>1. Composition du Foyer</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        Total : {totalPersonnesFoyer} pers.
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-center">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Adultes</label>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => saveFamilyImmediate(Math.max(1, nbAdultes - 1), nbEnfants, optionEnfants)}
                            className="w-8 h-8 bg-white rounded-xl border border-stone-200 font-black text-sm shadow-sm active:scale-95 transition"
                          >-</button>
                          <span className="text-lg font-black text-stone-800">{nbAdultes}</span>
                          <button
                            type="button"
                            onClick={() => saveFamilyImmediate(nbAdultes + 1, nbEnfants, optionEnfants)}
                            className="w-8 h-8 bg-white rounded-xl border border-stone-200 font-black text-sm shadow-sm active:scale-95 transition"
                          >+</button>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-center">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Enfants (&lt;12 ans)</label>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => saveFamilyImmediate(nbAdultes, Math.max(0, nbEnfants - 1), nbEnfants - 1 > 0 ? optionEnfants : false)}
                            className="w-8 h-8 bg-white rounded-xl border border-stone-200 font-black text-sm shadow-sm active:scale-95 transition"
                          >-</button>
                          <span className="text-lg font-black text-stone-800">{nbEnfants}</span>
                          <button
                            type="button"
                            onClick={() => saveFamilyImmediate(nbAdultes, nbEnfants + 1, true)}
                            className="w-8 h-8 bg-white rounded-xl border border-stone-200 font-black text-sm shadow-sm active:scale-95 transition"
                          >+</button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div 
                        onClick={() => saveFamilyImmediate(nbAdultes, nbEnfants, !optionEnfants)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                          optionEnfants ? 'bg-amber-50/80 border-amber-300 shadow-sm' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
                          optionEnfants ? 'bg-[#C25E3E] text-white border-[#C25E3E]' : 'border-stone-300 bg-white'
                        }`}>
                          {optionEnfants && '✓'}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                            <span>🧸</span> Option Recettes Kid-Friendly
                          </p>
                          <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                            Textures douces, légumes habiles, zéro piment pour les enfants de moins de 12 ans.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHOIX DES REPAS */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                      2. Quels repas planifier ?
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'Dîner + Lunchbox midi', icon: '🥡', desc: 'Dîner le soir + Lunchbox le lendemain (La formule éco)' },
                        { id: 'Midi & Soir (Deux repas par jour)', icon: '☀️🌙', desc: 'Des recettes différentes pour le midi et pour le soir' },
                        { id: 'Dîner uniquement (Soir)', icon: '🌙', desc: 'Uniquement les repas du soir' }
                      ].map(m => (
                        <div
                          key={m.id}
                          onClick={() => autoSaveMealType(m.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            typeRepasPlanifies === m.id
                              ? 'border-[#C25E3E] bg-amber-50 text-[#C25E3E] font-black shadow-sm'
                              : 'border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{m.icon}</span>
                            <span className="text-xs font-bold">{m.id}</span>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cadence */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                      3. Rythme & Nombre de Recettes
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '1 Mois (2 Paniers)', icon: '📅', label: '1 Mois' },
                        { id: '1 Quinzaine (1 Panier)', icon: '🗓️', label: '1 Quinzaine' },
                        { id: '1 Semaine Express', icon: '⚡', label: '1 Semaine' }
                      ].map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => autoSaveDuree(d.id)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            dureePlanning === d.id 
                              ? 'border-[#C25E3E] bg-amber-50 text-[#C25E3E] font-black shadow-sm' 
                              : 'border-stone-200 text-stone-600 hover:border-stone-300 font-medium'
                          }`}
                        >
                          <span className="text-base block mb-0.5">{d.icon}</span>
                          <span className="text-[10px] leading-tight block">{d.label}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-600">Nombre de Recettes</label>
                        <span className="text-sm font-black text-[#C25E3E]">{nbRecettes} recettes</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="14"
                        step="1"
                        value={nbRecettes}
                        onChange={(e) => setNbRecettes(Number(e.target.value))}
                        className="w-full accent-[#C25E3E]"
                      />
                    </div>
                  </div>
                </div>

                {/* COLONNE DROITE : STYLE, BANNIS, BUDGET & DRIVES */}
                <div className="space-y-6">
                  
                  {/* Style Alimentaire */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                      4. Style Alimentaire
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: 'Omnivore (Manger de tout)', desc: '🍽️ Aucune contrainte, cuisine familiale, variée et gourmande' },
                        { id: 'Crétois / Méditerranéen', desc: '🌿 Huile d\'olive, poissons, légumes du soleil, légumineuses' },
                        { id: 'Index Glycémique Bas', desc: '🥑 Zéro sucre rapide, céréales complètes, énergie stable' },
                        { id: 'Végétarien Gourmand', desc: '🥕 Zéro viande ni poisson, œufs, fromages, légumineuses' }
                      ].map(r => (
                        <div
                          key={r.id}
                          onClick={() => autoSaveRegime(r.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
                            selectedRegime === r.id 
                              ? 'border-[#C25E3E] bg-amber-50/70 shadow-sm' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-extrabold ${selectedRegime === r.id ? 'text-[#C25E3E]' : 'text-stone-800'}`}>
                              {r.id}
                            </p>
                            {selectedRegime === r.id && (
                              <span className="text-[10px] bg-[#C25E3E] text-white px-2.5 py-0.5 rounded-full font-bold">Actif ✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aliments Bannis */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                      5. Aliments Bannis du Foyer
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tapez un aliment (ex: poivrons, céleri...)"
                        value={customBannedWord}
                        onChange={(e) => setCustomBannedWord(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddCustomBanned(); }}}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C25E3E]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomBanned}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex-shrink-0"
                      >
                        + Bannir
                      </button>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeExclusionsList.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200 px-3 py-1 rounded-xl text-xs font-bold animate-in fade-in"
                          >
                            <span>🚫 {item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBanned(item)}
                              className="text-red-500 hover:text-red-700 font-black text-sm ml-0.5"
                            >✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                        6. Budget Cible Alimentation
                      </label>
                      <span className="text-sm font-black text-[#C25E3E]">{budgetInput} €</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="400"
                      step="10"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(Number(e.target.value))}
                      className="w-full accent-[#C25E3E]"
                    />
                  </div>

                  {/* Drives */}
                  <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                      7. Vos Magasins Drive
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <label className="text-[10px] font-black uppercase text-blue-700 block mb-1">Drive n°1 (ex: Leclerc)</label>
                        <input
                          type="text"
                          value={driveUrl1}
                          onChange={(e) => setDriveUrl1(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C25E3E]"
                        />
                      </div>

                      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <label className="text-[10px] font-black uppercase text-sky-700 block mb-1">Drive n°2 (ex: Carrefour)</label>
                        <input
                          type="text"
                          value={driveUrl2}
                          onChange={(e) => setDriveUrl2(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C25E3E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-12 bg-[#C25E3E] hover:bg-[#A84E33] text-white font-black text-xs md:text-sm py-3.5 rounded-2xl transition shadow-md uppercase tracking-wider active:scale-98"
                >
                  Valider tous les Réglages du Foyer
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL RECETTE DÉTAILLÉE */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-none md:rounded-[32px] overflow-hidden shadow-2xl relative min-h-screen md:min-h-0 md:max-h-[90vh] overflow-y-auto pb-8">
            <div className="relative h-64 w-full bg-stone-900">
              <img 
                src={getRecipePhoto(selectedRecipe.nom, selectedRecipe.id)} 
                alt={selectedRecipe.nom} 
                className="w-full h-full object-cover opacity-90"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-900/70 text-white font-bold flex items-center justify-center backdrop-blur shadow-lg"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#C25E3E] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedRecipe.moment || 'Soir'} • Panier {selectedRecipe.basket || activeBasket}
                  </span>
                  {selectedRecipe.kid_friendly && (
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      🧸 Kid-Friendly
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight mb-2 font-serif">
                {selectedRecipe.nom}
              </h2>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={(e) => toggleRecipeCooked(selectedRecipe.id, selectedRecipe.moment || 'Repas', e)}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 ${
                    selectedRecipe.est_cuisine
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>{selectedRecipe.est_cuisine ? '✅' : '👨‍🍳'}</span>
                  <span>{selectedRecipe.est_cuisine ? 'Cuisiné ✓' : 'Marquer Cuisiné'}</span>
                </button>

                <button
                  type="button"
                  disabled={swappingId === selectedRecipe.id}
                  onClick={() => swapRecipe(selectedRecipe)}
                  className="bg-amber-50 hover:bg-amber-100 text-[#C25E3E] font-extrabold text-xs py-3 rounded-2xl border border-amber-200 transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>{swappingId === selectedRecipe.id ? '⏳' : '🔄'}</span>
                  <span>{swappingId === selectedRecipe.id ? 'Échange...' : 'Remplacer'}</span>
                </button>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/50 p-3.5 rounded-2xl text-[#C25E3E] font-extrabold text-xs mb-5 flex items-center gap-2">
                <span>{selectedRecipe.bienfait_sante || "🛡️ Idéal pour votre santé"}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl mb-6 text-center border border-stone-200">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Calories</span>
                  <span className="text-sm font-black text-stone-800">{selectedRecipe.calories || '490 kcal'}</span>
                </div>
                <div className="border-x border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Temps</span>
                  <span className="text-sm font-black text-stone-800">{selectedRecipe.temps || '20 min'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Portions</span>
                  <span className="text-sm font-black text-stone-800">{targetPortions} pers.</span>
                </div>
              </div>

              {/* NOTATION DANS LA FICHE */}
              <div className="bg-stone-50 p-3.5 rounded-2xl flex justify-between items-center mb-6 border border-stone-200">
                <span className="text-xs font-bold text-stone-700">Votre évaluation :</span>
                {selectedRecipe.est_cuisine || (selectedRecipe.rating && selectedRecipe.rating > 0) ? (
                  <div className="flex items-center gap-1.5">
                    <StarRating 
                      rating={selectedRecipe.rating || 0} 
                      onRate={(star) => updateRating(selectedRecipe.id, star)} 
                    />
                    {selectedRecipe.rating > 0 && (
                      <span className="text-xs font-black text-amber-600">({selectedRecipe.rating}/5)</span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-stone-400 italic">
                    Cuisinez ce plat pour débloquer la note
                  </span>
                )}
              </div>
              
              {selectedRecipe.conseil && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-sm mb-6">
                  <span className="font-extrabold block text-xs uppercase text-amber-700 mb-1">💡 Le Secret du Chef :</span>
                  {selectedRecipe.conseil}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">
                    Ingrédients nécessaires ({targetPortions} portions)
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-stone-800 flex items-center gap-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="w-2 h-2 rounded-full bg-[#C25E3E] flex-shrink-0"></span>
                        <span className="font-medium">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">
                    Préparation pas à pas
                  </h3>
                  <div className="space-y-3">
                    {Array.isArray(selectedRecipe.etapes) && selectedRecipe.etapes.map((etape, i) => (
                      <div key={i} className="flex gap-3 text-sm text-stone-800 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                        <span className="font-black text-[#C25E3E] text-base">{i + 1}.</span>
                        <p className="font-medium leading-relaxed">{etape}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE NAVIGATION BASSE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2.5 z-30 shadow-lg flex justify-center">
        <div className="w-full max-w-md md:max-w-xl flex justify-around items-center px-4">
          <button
            onClick={() => setView('menu')}
            className={`flex flex-col items-center gap-1 ${
              view === 'menu' ? 'text-[#C25E3E] font-black' : 'text-stone-400'
            }`}
          >
            <span className="text-lg">🍽️</span>
            <span className="text-[10px] uppercase tracking-wider">Planning</span>
          </button>

          <button
            onClick={() => setView('shop')}
            className={`flex flex-col items-center gap-1 ${
              view === 'shop' ? 'text-[#C25E3E] font-black' : 'text-stone-400'
            }`}
          >
            <span className="text-lg">🛒</span>
            <span className="text-[10px] uppercase tracking-wider">Courses</span>
          </button>

          <button
            onClick={() => setView('stocks')}
            className={`flex flex-col items-center gap-1 relative ${
              view === 'stocks' ? 'text-[#C25E3E] font-black' : 'text-stone-400'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px] uppercase tracking-wider">Réserves</span>
            {safeStockList.length > 0 && (
              <span className="absolute -top-1 right-2 bg-[#C25E3E] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {safeStockList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setView('profile')}
            className={`flex flex-col items-center gap-1 ${
              view === 'profile' ? 'text-[#C25E3E] font-black' : 'text-stone-400'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] uppercase tracking-wider">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}