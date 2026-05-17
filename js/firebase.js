// ============================================
// FIREBASE - VOTOS COMPARTIDOS
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://las-recetas-de-alba-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cache de votos
const votesCache = {};
let allVotesLoaded = false;

// Suscribirse a todos los votos al cargar
function subscribeToAllVotes() {
  const votesRef = ref(db, 'votos');
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val() || {};
    // Reset and rebuild cache
    Object.keys(votesCache).forEach(k => delete votesCache[k]);
    for (const recipeSlug in data) {
      const votes = Object.values(data[recipeSlug] || {});
      votesCache[recipeSlug] = votes.map(v => v.rating || v);
    }
    allVotesLoaded = true;
    window.dispatchEvent(new CustomEvent('votes-loaded'));
  }, (error) => {
    console.warn('Firebase votes load error:', error);
    allVotesLoaded = true;
    window.dispatchEvent(new CustomEvent('votes-loaded'));
  });
}

// Añadir un voto
async function addVote(recipeSlug, rating) {
  try {
    const voteRef = ref(db, `votos/${recipeSlug}`);
    await push(voteRef, { rating: rating, timestamp: Date.now() });
    return true;
  } catch (e) {
    console.warn('Vote save error:', e);
    return false;
  }
}

// Obtener votos de una receta (del cache)
function getVotesForRecipe(slug) {
  return votesCache[slug] || [];
}

// Calcular media de votos
function getAverageVotes(slug) {
  const votes = getVotesForRecipe(slug);
  if (votes.length === 0) return null;
  const sum = votes.reduce((a, b) => a + b, 0);
  return sum / votes.length;
}

// Generar votos iniciales fake para que no salga vacío (6-8 por receta, basados en valoración Alba)
function generateInitialVotes(albaRating, slug) {
  // Use slug as seed for consistent random values
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);

  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const numVotes = 6 + Math.floor(seededRandom() * 3); // 6-8
  const votes = [];

  // Votos clustering alrededor de la valoración de Alba
  for (let i = 0; i < numVotes; i++) {
    let vote = albaRating + (Math.round(seededRandom() * 2) - 1); // -1, 0, +1
    if (seededRandom() < 0.15) vote = albaRating - 2; // Some outliers
    vote = Math.max(1, Math.min(5, vote));
    votes.push(vote);
  }

  return votes;
}

// Obtener votos combinados (iniciales + reales)
function getCombinedVotes(slug, albaRating) {
  const realVotes = getVotesForRecipe(slug);
  const initialVotes = generateInitialVotes(albaRating, slug);
  return [...initialVotes, ...realVotes];
}

function getCombinedAverage(slug, albaRating) {
  const all = getCombinedVotes(slug, albaRating);
  if (all.length === 0) return albaRating;
  return all.reduce((a, b) => a + b, 0) / all.length;
}

function getCombinedCount(slug, albaRating) {
  return getCombinedVotes(slug, albaRating).length;
}

// Comprobar si el usuario ya votó (localStorage)
function hasUserVoted(slug) {
  const voted = JSON.parse(localStorage.getItem('alba_voted') || '{}');
  return voted[slug] || null;
}

function setUserVote(slug, rating) {
  const voted = JSON.parse(localStorage.getItem('alba_voted') || '{}');
  voted[slug] = rating;
  localStorage.setItem('alba_voted', JSON.stringify(voted));
}

// Expose to window for use in app.js
window.firebaseAPI = {
  addVote,
  getVotesForRecipe,
  getAverageVotes,
  getCombinedVotes,
  getCombinedAverage,
  getCombinedCount,
  hasUserVoted,
  setUserVote,
  allVotesLoaded: () => allVotesLoaded
};

// Start subscription
subscribeToAllVotes();
