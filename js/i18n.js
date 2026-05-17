// ============================================
// SISTEMA DE TRADUCCIONES - ES/EN
// ============================================

const TRANSLATIONS = {
  es: {
    hero_sub_top: "Las recetas de la abuela",
    hero_title: "por Chef Alba",
    hero_subtitle: "383 recetas familiares con la valoración y los consejos de Chef Alba",
    search_placeholder: "Buscar por nombre o ingrediente...",
    filter_type: "Tipo de plato",
    filter_special: "Etiquetas",
    filter_taste: "Sabor mínimo",
    filter_health: "Saludable mínimo",
    reset: "Limpiar filtros",
    sort_fav: "Favoritas de Chef Alba",
    sort_taste: "Mejor sabor",
    sort_health: "Más saludables",
    sort_az: "A → Z",
    results_count: (n) => `${n} ${n === 1 ? 'receta' : 'recetas'}`,
    no_results: "No encontramos recetas con esos filtros",
    reset_filters: "Limpiar filtros",
    footer: "Un proyecto personal de Chef Alba · Las recetas de la abuela 🍽️",
    fav_badge: "Favorita",
    chef_thinks_taste: "Chef Alba opina (sabor)",
    chef_thinks_health: "Chef Alba opina (saludable)",
    by_chef: "— Chef Alba",
    visitors_say: "Lo que dicen los visitantes",
    based_on_votes: (n) => `Basado en ${n} ${n === 1 ? 'voto' : 'votos'}`,
    your_vote: "Tu valoración:",
    your_vote_thanks: "¡Gracias por valorar!",
    ingredients: "Ingredientes",
    preparation: "Modo de preparación",
    votes: (n) => `${n} ${n === 1 ? 'voto' : 'votos'}`,
    tags: {
      "Entrantes y aperitivos": "Entrantes y aperitivos",
      "Primer plato": "Primer plato",
      "Segundo plato": "Segundo plato",
      "Postres y dulces": "Postres y dulces",
      "Básicos y acompañamientos": "Básicos",
      "Tradicional": "Tradicional",
      "Celebraciones": "Celebraciones",
      "Rápida": "Rápida",
      "Para niños": "Para niños",
      "Verano": "Verano",
      "Invierno": "Invierno",
      "Económica": "Económica",
      "Contundente": "Contundente",
      "Con horno": "Con horno",
      "Para preparar antes": "Preparar antes"
    }
  },
  en: {
    hero_sub_top: "Grandma's recipes",
    hero_title: "by Chef Alba",
    hero_subtitle: "383 family recipes rated and reviewed by Chef Alba",
    search_placeholder: "Search by name or ingredient...",
    filter_type: "Dish type",
    filter_special: "Tags",
    filter_taste: "Minimum taste",
    filter_health: "Minimum health",
    reset: "Clear filters",
    sort_fav: "Chef Alba's favorites",
    sort_taste: "Best taste",
    sort_health: "Healthiest",
    sort_az: "A → Z",
    results_count: (n) => `${n} ${n === 1 ? 'recipe' : 'recipes'}`,
    no_results: "No recipes match those filters",
    reset_filters: "Clear filters",
    footer: "A personal project by Chef Alba · Grandma's recipes 🍽️",
    fav_badge: "Favorite",
    chef_thinks_taste: "Chef Alba on taste",
    chef_thinks_health: "Chef Alba on health",
    by_chef: "— Chef Alba",
    visitors_say: "What visitors say",
    based_on_votes: (n) => `Based on ${n} ${n === 1 ? 'vote' : 'votes'}`,
    your_vote: "Your rating:",
    your_vote_thanks: "Thanks for rating!",
    ingredients: "Ingredients",
    preparation: "Preparation",
    votes: (n) => `${n} ${n === 1 ? 'vote' : 'votes'}`,
    tags: {
      "Entrantes y aperitivos": "Starters",
      "Primer plato": "First course",
      "Segundo plato": "Main course",
      "Postres y dulces": "Desserts",
      "Básicos y acompañamientos": "Basics",
      "Tradicional": "Traditional",
      "Celebraciones": "Celebrations",
      "Rápida": "Quick",
      "Para niños": "Kid-friendly",
      "Verano": "Summer",
      "Invierno": "Winter",
      "Económica": "Budget",
      "Contundente": "Hearty",
      "Con horno": "Oven-baked",
      "Para preparar antes": "Prep ahead"
    }
  }
};

let currentLang = localStorage.getItem('alba_lang') || 'es';

function t(key, ...args) {
  const val = TRANSLATIONS[currentLang][key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

function translateTag(tag) {
  return TRANSLATIONS[currentLang].tags[tag] || tag;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('alba_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  if (window.applyFilters) {
    window.applyFilters();
  }
}
