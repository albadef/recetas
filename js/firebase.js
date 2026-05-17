// ============================================
// FIREBASE - REACCIONES COMPARTIDAS
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://las-recetas-de-alba-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const reactionsCache = {};
const pendingReactions = {};
let allVotesLoaded = false;

function subscribeToAllReactions() {
  const reactionsRef = ref(db, 'reacciones');
  onValue(reactionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    Object.keys(reactionsCache).forEach(k => delete reactionsCache[k]);
    for (const recipeSlug in data) {
      const reactions = Object.values(data[recipeSlug] || {});
      reactionsCache[recipeSlug] = reactions
        .map(r => typeof r === 'string' ? r : r.type)
        .filter(type => type === 'like' || type === 'dislike');
    }
    for (const recipeSlug in pendingReactions) {
      if (!reactionsCache[recipeSlug]) reactionsCache[recipeSlug] = [];
      reactionsCache[recipeSlug].push(...pendingReactions[recipeSlug]);
    }
    allVotesLoaded = true;
    window.dispatchEvent(new CustomEvent('votes-loaded'));
  }, (error) => {
    console.warn('Firebase reactions load error:', error);
    allVotesLoaded = true;
    window.dispatchEvent(new CustomEvent('votes-loaded'));
  });
}

async function addReaction(recipeSlug, type) {
  try {
    if (type !== 'like' && type !== 'dislike') return false;
    if (!reactionsCache[recipeSlug]) reactionsCache[recipeSlug] = [];
    if (!pendingReactions[recipeSlug]) pendingReactions[recipeSlug] = [];
    pendingReactions[recipeSlug].push(type);
    reactionsCache[recipeSlug].push(type);
    window.dispatchEvent(new CustomEvent('votes-loaded'));

    const reactionRef = ref(db, `reacciones/${recipeSlug}`);
    await push(reactionRef, { type, timestamp: Date.now() });
    return true;
  } catch (e) {
    console.warn('Reaction save error:', e);
    window.dispatchEvent(new CustomEvent('votes-loaded'));
    return false;
  }
}

function getReactionsForRecipe(slug) {
  return reactionsCache[slug] || [];
}

// Stable initial baseline: 150-1250 votes, 80-100% likes.
function generateInitialReactions(slug) {
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);

  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const total = 150 + Math.floor(seededRandom() * 1101);
  const likeRatio = 0.8 + seededRandom() * 0.2;
  const likes = Math.round(total * likeRatio);
  return { likes, dislikes: total - likes };
}

function getCombinedReactions(slug) {
  const initial = generateInitialReactions(slug);
  const real = getReactionsForRecipe(slug);
  const realLikes = real.filter(type => type === 'like').length;
  const realDislikes = real.filter(type => type === 'dislike').length;
  const likes = initial.likes + realLikes;
  const dislikes = initial.dislikes + realDislikes;
  const total = likes + dislikes;
  const percentLikes = total > 0 ? Math.round((likes / total) * 100) : 0;
  return { likes, dislikes, total, percentLikes };
}

function hasUserReacted(slug) {
  const reacted = JSON.parse(localStorage.getItem('alba_reactions') || '{}');
  return reacted[slug] || null;
}

function setUserReaction(slug, type) {
  const reacted = JSON.parse(localStorage.getItem('alba_reactions') || '{}');
  reacted[slug] = type;
  localStorage.setItem('alba_reactions', JSON.stringify(reacted));
}

window.firebaseAPI = {
  addReaction,
  getReactionsForRecipe,
  getCombinedReactions,
  hasUserReacted,
  setUserReaction,
  allVotesLoaded: () => allVotesLoaded
};

subscribeToAllReactions();
