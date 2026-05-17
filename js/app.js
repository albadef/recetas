// ============================================
// LAS RECETAS DE LA ABUELA - APP.JS
// ============================================

let RECIPES = [];
let filteredRecipes = [];
const PAGE_SIZE = 20;

// Filter state
const state = {
  search: '',
  tipo: new Set(),
  especial: new Set(),
  minSabor: 0,
  minSaludable: 0,
  sort: 'favoritas',
  visibleCount: PAGE_SIZE
};

const ALL_RECIPES_TAG = "Todas las recetas";

const TIPO_TAGS = [
  "Entrantes y aperitivos",
  "Primer plato",
  "Segundo plato",
  "Postres y dulces",
  "Básicos y acompañamientos"
];

const ESPECIAL_TAGS = [
  "Tradicional",
  "Celebraciones",
  "Rápida",
  "Para niños",
  "Verano",
  "Invierno",
  "Económica",
  "Contundente",
  "Con horno",
  "Para preparar antes"
];

// Map tag to mini-tag CSS class
function getTagClass(tag) {
  const map = {
    "Primer plato": "tipo-primer",
    "Segundo plato": "tipo-segundo",
    "Entrantes y aperitivos": "tipo-entrante",
    "Postres y dulces": "tipo-postre",
    "Básicos y acompañamientos": "tipo-basico"
  };
  return map[tag] || '';
}

// Build image URL - local first, then Unsplash fallback
function getImageUrl(recipe) {
  if (recipe.imagen) {
    return recipe.imagen;
  }
  // Unsplash Source API - searches by query
  const query = encodeURIComponent(recipe.titulo + ' food');
  return `https://source.unsplash.com/400x300/?${query},food`;
}

function getModalImageUrl(recipe) {
  if (recipe.imagen) {
    return recipe.imagen;
  }
  const query = encodeURIComponent(recipe.titulo + ' food');
  return `https://source.unsplash.com/800x500/?${query},food`;
}

function getImageAlt(recipe) {
  return recipe.imagen_alt || recipe.titulo;
}

// Render stars - filled and empty
function renderStars(count, max = 5, cssClass = 'taste') {
  let html = `<span class="review-stars ${cssClass}">`;
  for (let i = 1; i <= max; i++) {
    if (i <= count) html += '★';
    else html += '<span class="empty">★</span>';
  }
  html += '</span>';
  return html;
}

function renderHealthLeaves(count, max = 5) {
  let html = `<span class="review-stars health">`;
  for (let i = 1; i <= max; i++) {
    if (i <= count) html += '🌿';
    else html += '<span class="empty">·</span>';
  }
  html += '</span>';
  return html;
}

function getReactionSummary(slug) {
  if (window.firebaseAPI) return window.firebaseAPI.getCombinedReactions(slug);
  return { likes: 0, dislikes: 0, total: 0, percentLikes: 0 };
}

// ============================================
// LOAD RECIPES
// ============================================

async function loadRecipes() {
  try {
    const res = await fetch('data/recetas.json');
    RECIPES = await res.json();
    renderFilters();
    applyFilters();
  } catch (e) {
    console.error('Error loading recipes:', e);
    document.getElementById('recipes-grid').innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Error cargando recetas</p>';
  }
}

// ============================================
// FILTERS UI
// ============================================

function renderFilters() {
  // Tipo
  const tipoContainer = document.getElementById('filters-tipo');
  tipoContainer.innerHTML = [ALL_RECIPES_TAG, ...TIPO_TAGS].map(tag =>
    `<button class="tag" data-tag="${tag}" data-group="tipo" onclick="toggleTag('tipo', '${tag}')">${translateTag(tag)}</button>`
  ).join('');
  syncTipoButtons();

  // Especial
  const especialContainer = document.getElementById('filters-especial');
  especialContainer.innerHTML = ESPECIAL_TAGS.map(tag =>
    `<button class="tag" data-tag="${tag}" data-group="especial" onclick="toggleTag('especial', '${tag}')">${translateTag(tag)}</button>`
  ).join('');
  state.especial.forEach(tag => {
    document.querySelectorAll(`[data-group="especial"][data-tag="${tag}"]`).forEach(btn => btn.classList.add('active'));
  });

  // Stars filter (sabor)
  const saborContainer = document.getElementById('filter-sabor');
  saborContainer.innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button class="star-btn" data-value="${n}" onclick="setMinSabor(${n})">★</button>`
  ).join('');

  // Health filter
  const saludContainer = document.getElementById('filter-saludable');
  saludContainer.innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button class="health-btn" data-value="${n}" onclick="setMinSaludable(${n})">🌿</button>`
  ).join('');
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) <= state.minSabor);
  });
  document.querySelectorAll('.health-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) <= state.minSaludable);
  });
}

function syncTipoButtons() {
  document.querySelectorAll('[data-group="tipo"]').forEach(btn => {
    const tag = btn.dataset.tag;
    btn.classList.toggle('active', tag === ALL_RECIPES_TAG ? state.tipo.size === 0 : state.tipo.has(tag));
  });
}

function refreshActiveCounts() {
  if (typeof window.updateActiveCounts === 'function') {
    window.updateActiveCounts();
  }
}

function toggleTag(group, tag) {
  const set = group === 'tipo' ? state.tipo : state.especial;

  if (group === 'tipo') {
    if (tag === ALL_RECIPES_TAG || set.has(tag)) {
      set.clear();
    } else {
      set.clear();
      set.add(tag);
    }
    syncTipoButtons();
    applyFilters();
    refreshActiveCounts();
    return;
  }

  if (set.has(tag)) set.delete(tag);
  else set.add(tag);

  // Update UI
  document.querySelectorAll(`[data-group="${group}"][data-tag="${tag}"]`).forEach(btn => {
    btn.classList.toggle('active', set.has(tag));
  });

  applyFilters();
  refreshActiveCounts();
}

function setMinSabor(value) {
  state.minSabor = (state.minSabor === value) ? 0 : value;
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) <= state.minSabor);
  });
  applyFilters();
  refreshActiveCounts();
}

function setMinSaludable(value) {
  state.minSaludable = (state.minSaludable === value) ? 0 : value;
  document.querySelectorAll('.health-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) <= state.minSaludable);
  });
  applyFilters();
  refreshActiveCounts();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  state.search = '';
  document.getElementById('clear-search').classList.add('hidden');
  applyFilters();
}

function resetFilters() {
  state.search = '';
  state.tipo.clear();
  state.especial.clear();
  state.minSabor = 0;
  state.minSaludable = 0;
  state.sort = 'favoritas';

  document.getElementById('search-input').value = '';
  document.getElementById('clear-search').classList.add('hidden');
  document.getElementById('sort-select').value = 'favoritas';
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.star-btn, .health-btn').forEach(b => b.classList.remove('active'));
  syncTipoButtons();

  applyFilters();
  refreshActiveCounts();
}

function resetView(event) {
  event.preventDefault();
  resetFilters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// FILTER & SORT
// ============================================

function applyFilters() {
  state.sort = document.getElementById('sort-select').value;
  state.visibleCount = PAGE_SIZE;
  const searchLower = state.search.trim().toLowerCase();

  filteredRecipes = RECIPES.filter(r => {
    // Search
    if (searchLower) {
      const inTitle = r.titulo.toLowerCase().includes(searchLower);
      const inIngredients = r.ingredientes.some(ing => ing.toLowerCase().includes(searchLower));
      if (!inTitle && !inIngredients) return false;
    }

    // Tipo
    if (state.tipo.size > 0) {
      const hasMatch = [...state.tipo].some(t => r.etiquetas.includes(t));
      if (!hasMatch) return false;
    }

    // Especial
    if (state.especial.size > 0) {
      const hasMatch = [...state.especial].some(t => r.etiquetas.includes(t));
      if (!hasMatch) return false;
    }

    // Min ratings
    if (r.valoracion_gastronomica_chef_alba < state.minSabor) return false;
    if (r.nivel_saludable_chef_alba < state.minSaludable) return false;

    return true;
  });

  // Sort
  switch (state.sort) {
    case 'favoritas':
      filteredRecipes.sort((a, b) => b.valoracion_gastronomica_chef_alba - a.valoracion_gastronomica_chef_alba || a.titulo.localeCompare(b.titulo));
      break;
    case 'sabor':
      filteredRecipes.sort((a, b) => b.valoracion_gastronomica_chef_alba - a.valoracion_gastronomica_chef_alba);
      break;
    case 'saludable':
      filteredRecipes.sort((a, b) => b.nivel_saludable_chef_alba - a.nivel_saludable_chef_alba);
      break;
    case 'az':
      filteredRecipes.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
  }

  renderRecipes();
}

window.applyFilters = applyFilters;
window.renderFilters = renderFilters;
window.loadMoreRecipes = loadMoreRecipes;

// ============================================
// RENDER RECIPES
// ============================================

function renderRecipes() {
  const grid = document.getElementById('recipes-grid');
  const emptyState = document.getElementById('empty-state');
  const count = document.getElementById('results-count');
  const loadMoreBtn = document.getElementById('load-more-recipes');

  count.textContent = t('results_count', filteredRecipes.length);

  if (filteredRecipes.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  if (loadMoreBtn) {
    const hasMore = state.visibleCount < filteredRecipes.length;
    loadMoreBtn.classList.toggle('hidden', !hasMore);
    loadMoreBtn.textContent = t('show_more');
  }

  // Find the main type tag for card styling
  function findTipoTag(recipe) {
    for (const tag of recipe.etiquetas) {
      if (TIPO_TAGS.includes(tag)) return tag;
    }
    return null;
  }

  const recipesToRender = filteredRecipes.slice(0, state.visibleCount);

  grid.innerHTML = recipesToRender.map(r => {
    const tipo = findTipoTag(r);
    const imgUrl = getImageUrl(r);
    const isFav = r.valoracion_gastronomica_chef_alba === 5;
    const reactions = getReactionSummary(r.slug);

    return `
      <article class="recipe-card" onclick="openModal(${r.id})">
        <div class="recipe-img-wrap">
          <img class="recipe-img" src="${imgUrl}" alt="${escapeHtml(getImageAlt(r))}" loading="lazy" onerror="this.replaceWith(makePlaceholder())">
          ${isFav ? `<div class="fav-badge">⭐ ${t('fav_badge')}</div>` : ''}
        </div>
        <div class="recipe-body">
          <h3 class="recipe-title">${escapeHtml(r.titulo)}</h3>
          <div class="recipe-tags-mini">
            ${tipo ? `<span class="tag-mini ${getTagClass(tipo)}">${translateTag(tipo)}</span>` : ''}
          </div>
          <div class="recipe-meta">
            <div class="rating-pair">
              <span class="rating-mini stars" title="Sabor">★ ${r.valoracion_gastronomica_chef_alba}</span>
              <span class="rating-mini health" title="Saludable">🌿 ${r.nivel_saludable_chef_alba}</span>
            </div>
            <span class="card-reactions" title="${t('based_on_reactions', reactions.total)}">👍 ${reactions.likes} · 👎 ${reactions.dislikes}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function loadMoreRecipes() {
  state.visibleCount += PAGE_SIZE;
  renderRecipes();
}

function makePlaceholder() {
  const div = document.createElement('div');
  div.className = 'recipe-img-placeholder';
  div.textContent = '🍽️';
  return div;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// MODAL
// ============================================

function openModal(id) {
  const recipe = RECIPES.find(r => r.id === id);
  if (!recipe) return;

  const isFav = recipe.valoracion_gastronomica_chef_alba === 5;
  const imgUrl = getModalImageUrl(recipe);

  const userReaction = window.firebaseAPI ? window.firebaseAPI.hasUserReacted(recipe.slug) : null;
  const reactions = getReactionSummary(recipe.slug);

  const tipoTag = recipe.etiquetas.find(t => TIPO_TAGS.includes(t));
  const especialTags = recipe.etiquetas.filter(t => ESPECIAL_TAGS.includes(t));

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-hero">
      <img src="${imgUrl}" alt="${escapeHtml(getImageAlt(recipe))}" onerror="this.outerHTML='<div class=&quot;modal-hero-placeholder&quot;>🍽️</div>'">
    </div>
    <div class="modal-content">
      <div class="modal-tags">
        ${tipoTag ? `<span class="tag-mini ${getTagClass(tipoTag)}">${translateTag(tipoTag)}</span>` : ''}
        ${especialTags.map(t => `<span class="tag-mini">${translateTag(t)}</span>`).join('')}
      </div>
      <h2 class="modal-title">${escapeHtml(recipe.titulo)}</h2>

      <!-- Chef Alba TASTE review -->
      <div class="review-block">
        <div class="review-header">
          <span class="review-title">${t('chef_thinks_taste')}</span>
          ${renderStars(recipe.valoracion_gastronomica_chef_alba)}
        </div>
        <p class="review-comment">"${escapeHtml(recipe.comentario_gastronomico_chef_alba)}"</p>
        <span class="review-author">${t('by_chef')}</span>
      </div>

      <!-- Chef Alba HEALTH review -->
      <div class="review-block">
        <div class="review-header">
          <span class="review-title">${t('chef_thinks_health')}</span>
          ${renderHealthLeaves(recipe.nivel_saludable_chef_alba)}
        </div>
        <p class="review-comment">"${escapeHtml(recipe.comentario_saludable_chef_alba)}"</p>
        <span class="review-author">${t('by_chef')}</span>
      </div>

      <!-- Visitors votes -->
      <div class="visitors-votes">
        <div class="visitors-votes-header">
          <span class="review-title">${t('visitors_say')}</span>
          <div class="visitors-reaction-score">
            <span class="visitors-average-num">${reactions.percentLikes}%</span>
            <span class="visitors-score-label">${t('likes_label')}</span>
          </div>
        </div>
        <div class="reaction-totals" aria-label="${t('based_on_reactions', reactions.total)}">
          <span>👍 ${reactions.likes}</span>
          <span>👎 ${reactions.dislikes}</span>
          <span>${t('based_on_reactions', reactions.total)}</span>
        </div>

        <div class="visitors-vote-prompt">
          <span>${userReaction ? t('reaction_thanks') : t('reaction_prompt')}</span>
          <div class="user-reactions" id="user-reactions">
            <button class="reaction-btn like ${userReaction === 'like' ? 'voted' : ''}"
                    onclick="submitReaction('${recipe.slug}', 'like')"
                    ${userReaction ? 'disabled' : ''}>👍</button>
            <button class="reaction-btn dislike ${userReaction === 'dislike' ? 'voted' : ''}"
                    onclick="submitReaction('${recipe.slug}', 'dislike')"
                    ${userReaction ? 'disabled' : ''}>👎</button>
          </div>
        </div>
      </div>

      <h3 class="section-title">${t('ingredients')}</h3>
      <ul class="ingredients-list">
        ${recipe.ingredientes.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>

      <h3 class="section-title">${t('preparation')}</h3>
      <div class="preparation">${escapeHtml(recipe.modo_preparacion)}</div>
    </div>
  `;

  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeModalFromBackdrop(event) {
  if (event.target.id === 'modal-backdrop') closeModal();
}

async function submitReaction(slug, type) {
  if (!window.firebaseAPI) return;
  if (window.firebaseAPI.hasUserReacted(slug)) return;

  window.firebaseAPI.setUserReaction(slug, type);

  document.querySelectorAll('#user-reactions .reaction-btn').forEach(btn => {
    btn.classList.toggle('voted', btn.classList.contains(type));
    btn.disabled = true;
  });

  await window.firebaseAPI.addReaction(slug, type);

  const prompt = document.querySelector('.visitors-vote-prompt span');
  if (prompt) prompt.textContent = t('reaction_thanks');

  setTimeout(() => renderRecipes(), 300);
}

// Make functions globally accessible
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalFromBackdrop = closeModalFromBackdrop;
window.toggleTag = toggleTag;
window.setMinSabor = setMinSabor;
window.setMinSaludable = setMinSaludable;
window.clearSearch = clearSearch;
window.resetFilters = resetFilters;
window.resetView = resetView;
window.submitReaction = submitReaction;
window.makePlaceholder = makePlaceholder;

// ============================================
// SEARCH HANDLER
// ============================================

let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    document.getElementById('clear-search').classList.toggle('hidden', !e.target.value);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => applyFilters(), 200);
  });

  // ESC closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Initial language setup
  setLanguage(currentLang);

  // Load recipes
  loadRecipes();

  // Re-render when Firebase votes load
  window.addEventListener('votes-loaded', () => {
    if (RECIPES.length > 0) renderRecipes();
  });
});
