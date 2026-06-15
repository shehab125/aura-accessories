/* ============================================
   AURA ACCESSORIES — Core JavaScript
   ============================================ */

// ==========================================
// Data Store (will be populated from database)
// ==========================================
const PRODUCTS = [];
const BLOG_POSTS = [];

window.optimizeCloudinaryUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url || '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    if (url.match(/\/upload\/[a-z]_/)) return url; // Already has transformation
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};

// ==========================================
// Supabase initialization
// ==========================================
// Dynamically import the Supabase client module. This allows the rest of
// the script to access the database functions (fetchProducts, etc.)
// without requiring the HTML pages to set `type="module"` on the script
// tag. The imported functions are attached to the global `window` object
// once loaded, so other functions in this file can reference them.
(function initSupabaseClient() {
  window.__supabasePromise = new Promise((resolve) => {
    if (typeof window !== 'undefined' && !window.supabase) {
      import('./supabaseClient.js').then((module) => {
        // Expose Supabase client and helpers to the global scope
        window.supabase = module.supabase;
        window.fetchProductsFromDb = module.fetchProducts;
        window.createProductInDb = module.createProduct;
        window.updateProductInDb = module.updateProduct;
        window.deleteProductInDb = module.deleteProduct;
        window.fetchBlogPostsFromDb = module.fetchBlogPosts;
        window.createBlogPostInDb = module.createBlogPost;
        window.submitOrderToDb = module.submitOrder;
        resolve();
      }).catch((err) => {
        console.warn('Supabase client failed to load:', err);
        resolve();
      });
    } else {
      resolve();
    }
  });
})();

// ==========================================
// Label mapping for category, gender, material, style, etc.
// These provide human-friendly translations for canonical keys.
// When displaying product details to users, use getLabel(key)
// to ensure the value appears in the current language.
const LABELS = {
  en: {
    women: 'Women', men: 'Men', unisex: 'Unisex',
    necklaces: 'Necklaces', rings: 'Rings', earrings: 'Earrings', bracelets: 'Bracelets',
    classic: 'Classic', modern: 'Modern', bohemian: 'Bohemian', luxury: 'Luxury',
    gold: 'Gold', silver: 'Silver', leather: 'Leather', titanium: 'Titanium', crystal: 'Crystal', steel: 'Steel', carbon: 'Carbon',
    casual: 'Casual', formal: 'Formal', evening: 'Evening', daily: 'Daily',
  },
  ar: {
    women: 'حريمي', men: 'رجالي', unisex: 'يونيسكس',
    necklaces: 'قلادات', rings: 'خواتم', earrings: 'حلقان', bracelets: 'أساور',
    classic: 'كلاسيك', modern: 'عصري', bohemian: 'بوهو', luxury: 'فاخر',
    gold: 'ذهب', silver: 'فضة', leather: 'جلد', titanium: 'تيتانيوم', crystal: 'كريستال', steel: 'فولاذ', carbon: 'كربون',
    casual: 'كاجوال', formal: 'رسمي', evening: 'سهرة', daily: 'يومي',
  }
};

/**
 * Get the label for a canonical key (category/gender/material/style).
 * If no translation is defined, returns the key itself.
 *
 * @param {string} key The canonical value
 * @returns {string} The translated label
 */
function getLabel(key) {
  const lang = document.documentElement.lang || 'en';
  return (LABELS[lang] && LABELS[lang][key]) || key;
}

// ==========================================
// Cart State
// ==========================================
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
let appliedCoupon = null;
let couponDiscountAmount = 0;

// Initialize coupon from localStorage
const savedCoupon = localStorage.getItem('aura_applied_coupon');
if (savedCoupon) {
  try {
    const data = JSON.parse(savedCoupon);
    appliedCoupon = data.coupon;
    couponDiscountAmount = data.discountAmount;
  } catch (e) {
    localStorage.removeItem('aura_applied_coupon');
  }
}

function saveCart() {
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  updateCartBadge();
}

function saveWishlist() {
  localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function addToCart(productId, qty = 1, productData = null) {
  const product = productData || PRODUCTS.find(p => p.id === productId || String(p.id) === String(productId));
  if (!product) return;

  const id = product.id;
  const name = product.name || product.name_ar || product.nameAr;
  
  // Requirement: Use price based on selected material variant
  const matEl = document.querySelector('.material-option.active');
  const materialKey = matEl?.dataset.material || 'silver';
  const price = materialKey === 'gold' ? (product.price_gold || product.price) : (product.price_silver || product.price);
  const materialName = matEl?.textContent || product.material || 'Silver';
  
  const image = (product.images && product.images[0]) || product.image;

  // Customization data
  let customizationValue = null;
  let customAnswers = []; // Initializing as array for better order handling

  if (product.has_customization) {
    const valInput = document.getElementById('customization-value');
    if (valInput) {
      customizationValue = valInput.value.trim();
      if (!customizationValue) {
        showToast(translations[document.documentElement.lang]?.requiredField || 'Customization value is required', 'error');
        valInput.focus();
        return;
      }
    }

    const questionInputs = document.querySelectorAll('.custom-question-input');
    if (questionInputs.length > 0) {
      customAnswers = [];
      for (const input of questionInputs) {
        const question = input.dataset.question;
        const answer = input.value.trim();
        if (!answer) {
          showToast(translations[document.documentElement.lang]?.requiredField || 'All questions are required', 'error');
          input.focus();
          return;
        }
        customAnswers.push({ question, answer });
      }
    }
  }

  // Create unique key for cart items with different material and customization
  const cartId = `${id}_${materialKey}_${customizationValue || ''}_${JSON.stringify(customAnswers)}`;

  const existing = cart.find(item => item.cartId === cartId);
  if (existing) {
    existing.qty += Number(qty);
  } else {
    cart.push({ 
      cartId, 
      id, 
      name, 
      price, 
      image, 
      qty: Number(qty), 
      material: materialName,
      customizationValue, 
      customAnswers 
    });
  }
  saveCart();
  
  // Track AddToCart event
  try {
    trackPixelEvent('AddToCart', {
      id: product.id,
      name: name,
      price: price,
      qty: Number(qty),
      currency: 'EGP'
    });
  } catch (e) {
    console.error('Pixel tracking error (AddToCart):', e);
  }

  showToast('تمت الإضافة للسلة!', 'success');
}

function removeFromCart(cartId) {
  cart = cart.filter(item => item.cartId !== cartId && String(item.id) !== String(cartId));
  saveCart();
  renderCartPage && renderCartPage();
}

function updateCartQty(cartId, qty) {
  const item = cart.find(i => i.cartId === cartId || (String(i.id) === String(cartId) && !i.cartId));
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart();
    renderCartPage && renderCartPage();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function toggleWishlist(productId) {
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('تمت الإزالة من المفضلة', 'info');
  } else {
    wishlist.push(productId);
    showToast('تمت الإضافة للمفضلة ❤', 'success');
  }
  saveWishlist();
  // Update all wishlist buttons
  document.querySelectorAll(`.product-wishlist[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', wishlist.includes(productId));
  });
}

function updateWishlistBadge() {
  const badges = document.querySelectorAll('.wishlist-badge');
  badges.forEach(badge => {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: '✦'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span style="font-size:18px">${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    // Trigger on load
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    const closeBtn = document.getElementById('mobile-menu-close');
    
    const toggleMenu = (forceClose = false) => {
      const isActive = forceClose ? false : !mobileMenu.classList.contains('active');
      hamburger.classList.toggle('active', isActive);
      mobileMenu.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(true);
      });
    }

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(true);
      });
    });

    // Close on click outside links but inside menu (optional, but good for UX)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        toggleMenu(true);
      }
    });
  }

    if (mobileMenu) {
      const linksContainer = mobileMenu.querySelector('.mobile-menu-links');
      if (linksContainer && !linksContainer.querySelector('a[href="account.html"]')) {
        const lang = document.documentElement.lang || 'ar';
        const accountStr = lang === 'ar' ? 'حسابي' : 'Account';
        const wishlistStr = lang === 'ar' ? 'المفضلة' : 'Wishlist';
        linksContainer.insertAdjacentHTML('beforeend', `
            <a href="account.html" class="mobile-menu-item stagger-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                <span data-i18n="account">${accountStr}</span>
            </a>
            <a href="account.html" class="mobile-menu-item stagger-item" onclick="setTimeout(()=>window.dispatchEvent(new Event('hashchange')),100)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span data-i18n="wishlist">${wishlistStr}</span>
            </a>
        `);
      }
    }

    // Active link highlight
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// ==========================================
// Theme Toggle
// ==========================================
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  const saved = localStorage.getItem('aura_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('aura_theme', next);
    });
  }
}

// ==========================================
// Scroll Reveal (Intersection Observer)
// ==========================================
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ==========================================
// Cursor Glow Effect
// ==========================================
function initCursorGlow() {
  if (window.innerWidth < 1024) return;
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ==========================================
// Back to Top
// ==========================================
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================
// Page Loader
// ==========================================
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
}

// ==========================================
// Accordion
// ==========================================
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // Close all in same group
      const group = item.closest('.accordion-group');
      if (group) {
        group.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('active');
          i.querySelector('.accordion-body').style.maxHeight = null;
        });
      }

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

// ==========================================
// Chat Widget
// ==========================================
function initChatWidget() {
  const chatBtn = document.querySelector('.chat-btn');
  const chatWindow = document.querySelector('.chat-window');
  const chatClose = document.querySelector('.chat-close');
  const chatHistory = [];

  if (chatBtn && chatWindow) {
    chatBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
    });
  }
  if (chatClose && chatWindow) {
    chatClose.addEventListener('click', () => {
      chatWindow.classList.remove('active');
    });
  }

  // Implement sending messages via AI chat API
  if (chatWindow) {
    const input = chatWindow.querySelector('input.form-input');
    const sendBtn = chatWindow.querySelector('.chat-input-area button');
    const messages = chatWindow.querySelector('.chat-messages');
    const lang = document.documentElement.lang || 'en';
    if (input && sendBtn && messages) {
      const appendMessage = (text, isUser = false) => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = 'var(--space-4)';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = isUser ? 'row-reverse' : 'row';
        
        const bubble = document.createElement('div');
        bubble.style.padding = 'var(--space-3) var(--space-4)';
        bubble.style.borderRadius = 'var(--radius-md)';
        bubble.style.maxWidth = '85%';
        bubble.style.fontSize = 'var(--text-sm)';
        bubble.style.lineHeight = '1.6';

        if (isUser) {
          bubble.style.background = 'var(--gold)';
          bubble.style.color = 'var(--black)';
          bubble.style.fontWeight = '500';
          bubble.style.borderBottomRightRadius = '2px';
          bubble.textContent = text;
        } else {
          bubble.style.background = 'rgba(255,255,255,0.05)';
          bubble.style.border = '1px solid var(--border-color)';
          bubble.style.color = 'var(--text-primary)';
          bubble.style.borderBottomLeftRadius = '2px';
          // Simple formatter
          bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        
        wrapper.appendChild(bubble);
        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
      };

      async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        
        appendMessage(text, true);
        input.value = '';
        
        const botBubble = appendMessage('...', false);
        botBubble.classList.add('typing-animation');

        try {
          const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: chatHistory })
          });
          const data = await res.json();
          const reply = data.reply || data.response || '...';
          
          botBubble.classList.remove('typing-animation');
          botBubble.innerHTML = reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          chatHistory.push({ role: 'user', parts: [{ text: text }] });
          chatHistory.push({ role: 'model', parts: [{ text: reply }] });
          if (chatHistory.length > 10) chatHistory.splice(0, 2);
        } catch (err) {
          botBubble.classList.remove('typing-animation');
          botBubble.textContent = lang === 'ar' ? 'عذراً، حصل خطأ.' : 'Sorry, something went wrong.';
        }
      }
      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
    }
  }
}


// ==========================================
// Product Card Rendering
// ==========================================
function createProductCard(product) {
  const isWished = wishlist.includes(product.id);
  const stars = renderStars(product.rating);
  // Use a placeholder gradient if image doesn't exist
  const imgStyle = `background: linear-gradient(135deg, #1a1a1a, #2a2a2a); display:flex; align-items:center; justify-content:center; color: var(--gold); font-size: 3rem;`;

  const lang = document.documentElement.lang || 'en';
  // Fallback chain: nameAr → name_ar → name (handles both local data and Supabase format)
  const name = lang === 'ar'
    ? (product.nameAr || product.name_ar || product.name || '')
    : (product.name || product.name_ar || product.nameAr || '');
  const addToCartText = translations[lang].addToCart;
  const viewText = translations[lang].view;

  // Determine which image to display: prefer the first in the images array, then fallback to the single image property
  const imgSrc = product.images && product.images.length ? window.optimizeCloudinaryUrl(product.images[0], 600) : window.optimizeCloudinaryUrl(product.image, 600);
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius: inherit;">`
    : `<div style="${imgStyle} width:100%; aspect-ratio:1;">✦</div>`;

  // Normalize badge: handle both 'badge' and 'label' field names (local vs Supabase)
  const productBadge = product.badge || product.label || null;

  return `
    <div class="product-card reveal" data-product-id="${product.id}" data-gender="${product.gender || ''}" data-category="${product.category || ''}" data-material="${product.material || ''}" data-style="${product.style || ''}" data-price="${product.price || 0}">
      <div class="product-card-image">
        ${imgHtml}
        ${productBadge ? `<span class="product-card-badge">${productBadge}</span>` : ''}
        <button class="product-wishlist ${isWished ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <div class="product-card-overlay">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${product.id}')">${addToCartText}</button>
          <a href="product.html?id=${product.id}" class="btn btn-outline btn-sm">${viewText}</a>
        </div>
      </div>
      <div class="product-card-info">
        <span class="product-card-category">${getLabel(product.category)}</span>
        <h4 class="product-card-name">${name}</h4>
        <div class="product-card-price">
          EGP ${(product.price_silver || product.price || 0).toLocaleString()}
          ${(product.old_price_silver || product.oldPrice) ? `<span class="old-price">EGP ${(product.old_price_silver || product.oldPrice).toLocaleString()}</span>` : ''}
          ${(product.old_price_silver || product.oldPrice) && (product.old_price_silver || product.oldPrice) > (product.price_silver || product.price) 
            ? `<span class="discount-badge">-${Math.round((1 - (product.price_silver || product.price) / (product.old_price_silver || product.oldPrice)) * 100)}%</span>` 
            : ''}
        </div>
        <div class="product-card-rating">
          ${stars}
          <span style="color: var(--text-secondary); margin-left: 4px;">(${product.reviews})</span>
        </div>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<svg class="${i <= Math.round(rating) ? '' : 'empty'}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }
  html += '</div>';
  return html;
}

// ==========================================
// Filter & Sort (Shop Page)
// ==========================================
function initShopFilters() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filterCategory = document.querySelectorAll('[data-filter-category]');
  const filterMaterial = document.querySelectorAll('[data-filter-material]');
  const sortSelect = document.getElementById('sort-select');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');

  function applyFilters() {
    let filtered = [...PRODUCTS];

    // Category filter
    const activeCategory = document.querySelector('[data-filter-category].active');
    if (activeCategory && activeCategory.dataset.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory.dataset.filterCategory);
    }

    // Material filter (gold / silver)
    const checkedMaterials = [...document.querySelectorAll('[data-filter-material]:checked')].map(el => el.dataset.filterMaterial);
    if (checkedMaterials.length > 0) {
      filtered = filtered.filter(p => checkedMaterials.includes(p.material));
    }

    // Price range
    if (priceMin && priceMin.value) {
      filtered = filtered.filter(p => p.price >= parseInt(priceMin.value));
    }
    if (priceMax && priceMax.value) {
      filtered = filtered.filter(p => p.price <= parseInt(priceMax.value));
    }

    // Sorting
    if (sortSelect) {
      const sortVal = sortSelect.value;
      if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
      else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
      else if (sortVal === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      else if (sortVal === 'newest') filtered.sort((a, b) => b.id - a.id);
      else if (sortVal === 'bestselling') filtered.sort((a, b) => b.reviews - a.reviews);
    }

    // Update result count (localized)
    const countEl = document.getElementById('results-count');
    if (countEl) {
      const lang = document.documentElement.lang || 'en';
      if (lang === 'ar') {
        countEl.textContent = `${filtered.length} منتج`;
      } else {
        countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
      }
    }

    const lang = document.documentElement.lang || 'en';
    const t = translations[lang];
    grid.innerHTML = filtered.length
      ? filtered.map(createProductCard).join('')
      : `<div class="text-center" style="grid-column:1/-1; padding: 4rem;"><h3 style="color:var(--gold);">${t.noProductsFound || 'No products found'}</h3><p style="color:var(--text-secondary); margin-top:1rem;">${t.tryAdjusting || 'Try adjusting your filters'}</p></div>`;

    initScrollReveal();
  }

  // Expose globally for reset button
  window.__shopApplyFilters = applyFilters;

  // Category tabs
  filterCategory.forEach(btn => {
    btn.addEventListener('click', () => {
      filterCategory.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Material checkboxes
  filterMaterial.forEach(cb => cb.addEventListener('change', applyFilters));

  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (priceMin) priceMin.addEventListener('input', debounce(applyFilters, 300));
  if (priceMax) priceMax.addEventListener('input', debounce(applyFilters, 300));

  // Initial render
  applyFilters();
}

// ==========================================
// Utility
// ==========================================
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}

function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ==========================================
// Homepage specific
// ==========================================
function initHomepage() {
  // Featured products grid on homepage
  const featuredGrid = document.getElementById('featured-products');
  if (featuredGrid) {
    const renderFeatured = (gender = 'all') => {
      // Sort by created_at or fallback to name to handle UUIDs gracefully
      const sorted = [...PRODUCTS].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        if (dateB - dateA !== 0) return dateB - dateA;
        return (a.name || '').localeCompare(b.name || '');
      });

      let filtered = sorted;
      
      if (gender !== 'all') {
        const target = gender.toLowerCase();
        filtered = sorted.filter(p => {
          const g = (p.gender || '').toLowerCase();
          return g === target || (target === 'unisex' && g === 'unisex');
        });
      }
      
      // Prioritize items with badges, then fill the remaining spots (total 4)
      const badged = filtered.filter(p => p.badge || p.label);
      const remaining = filtered.filter(p => !p.badge && !p.label);
      const results = [...badged, ...remaining].slice(0, 4);
      
      const lang = document.documentElement.lang || 'en';
      const noProdText = (translations[lang] && translations[lang].noProductsFound) || 'No products found';
      
      featuredGrid.innerHTML = results.length 
        ? results.map(p => {
            try { return createProductCard(p); } catch(e) { console.error('Card failed', e); return ''; }
          }).join('') 
        : `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-secondary);">${noProdText}</div>`;
      
      // Ensure visibility even if ScrollReveal is slow/fails
      const cards = featuredGrid.querySelectorAll('.product-card');
      cards.forEach(c => c.style.opacity = '1');

      // Trigger reveal animation
      if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal('.product-card', { 
            distance: '30px', 
            origin: 'bottom', 
            opacity: 0, 
            duration: 800, 
            interval: 100, 
            cleanup: true 
        });
      }
    };

    // Initial render
    renderFeatured('all');

    // Homepage tabs listener (All, Women, Men, Unisex)
    const tabs = document.querySelectorAll('.category-tabs .category-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const gender = tab.getAttribute('data-filter-gender') || 'all';
        renderFeatured(gender);
      });
    });
  }

  // Home Page: Collection women
  const womenGrid = document.getElementById('women-products');
  if (womenGrid) {
    const women = PRODUCTS.filter(p => p.gender === 'women').slice(0, 4);
    womenGrid.innerHTML = women.map(createProductCard).join('');
  }

  // Home Page: Collection men
  const menGrid = document.getElementById('men-products');
  if (menGrid) {
    const men = PRODUCTS.filter(p => p.gender === 'men').slice(0, 4);
    menGrid.innerHTML = men.map(createProductCard).join('');
  }

  // Testimonial slider
  initTestimonialSlider();

  // Load homepage images from settings
  initHomepageImages();
}

// Load homepage images, social links, and team members from admin settings
async function initHomepageImages() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) return;
    const settings = await res.json();
    
    // 1. Homepage Images
    const imgs = settings.homepageImages;
    if (imgs) {
      const slots = ['women1', 'women2', 'men1', 'men2', 'story', 'insta1', 'insta2', 'insta3', 'insta4', 'insta5', 'insta6'];
      slots.forEach(key => {
        if (imgs[key]) {
          const el = document.getElementById('hp-' + key);
          if (el) {
            el.innerHTML = `<img src="${imgs[key]}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
          }
        }
      });
    }

    // 2. Social Links (Footers & Contact)
    const social = settings.socialLinks;
    if (social) {
      const renderSocial = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        if (social.instagram) {
          html += `<a href="${social.instagram}" target="_blank" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><path d="M17.5 6.5h.01" /></svg></a>`;
        }
        if (social.facebook) {
          html += `<a href="${social.facebook}" target="_blank" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>`;
        }
        if (social.tiktok) {
          html += `<a href="${social.tiktok}" target="_blank" aria-label="TikTok"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg></a>`;
        }
        if (social.whatsapp) {
          const waUrl = social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\D/g, '')}`;
          html += `<a href="${waUrl}" target="_blank" aria-label="WhatsApp"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
        }
        if (social.twitter) {
          html += `<a href="${social.twitter}" target="_blank" aria-label="Twitter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>`;
        }
        container.innerHTML = html;
      };
      renderSocial('footer-social-links');
      renderSocial('contact-social-links');
    }

    // 3. Aura Family (About Page)
    const family = settings.auraFamily;
    const familyGrid = document.getElementById('aura-family-grid');
    if (family && familyGrid) {
      familyGrid.innerHTML = family.map((member, i) => `
        <div class="reveal" style="text-align:center;">
          <div style="width:140px; height:140px; border-radius:50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); margin: 0 auto var(--space-4); display:flex; align-items:center; justify-content:center; overflow:hidden; border: 2px solid var(--gold);">
            ${member.image ? `<img src="${member.image}" alt="${member.name}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:3rem; color: var(--black); font-weight:700;">${(member.name || 'A')[0]}</span>`}
          </div>
          <h4 style="font-size: var(--text-xl);">${member.name || ''}</h4>
        </div>
      `).join('');
      initScrollReveal(); // Re-init for new elements
    }
  } catch (_) { /* settings not available */ }
}

function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  const testimonials = [
    { text: "Aura Accessories completely transformed my style. The quality is unmatched and every piece feels luxurious.", name: "Sara M.", role: "Fashion Blogger", rating: 5 },
    { text: "The best accessories store in Egypt! I love the attention to detail and the unique designs. My go-to for gifts.", name: "Ahmed K.", role: "Loyal Customer", rating: 5 },
    { text: "I designed a custom bracelet using the AI tool — the result was beyond my expectations. Truly innovative!", name: "Nour H.", role: "Designer", rating: 5 },
    { text: "Premium quality at fair prices. The leather bracelets are exceptional. Highly recommend for men's accessories.", name: "Omar T.", role: "Business Professional", rating: 4 },
  ];

  let current = 0;
  function render() {
    const t = testimonials[current];
    slider.innerHTML = `
      <div class="testimonial-card" style="animation: fadeIn 0.5s ease">
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;color:var(--black);font-weight:700;font-size:1.2rem;">${t.name[0]}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-role">${t.role}</div>
            <div class="product-card-rating" style="margin-top:4px">${renderStars(t.rating)}</div>
          </div>
        </div>
      </div>
    `;
  }
  render();
  setInterval(() => { current = (current + 1) % testimonials.length; render(); }, 5000);

  // Dots
  const dots = document.querySelector('.testimonial-dots');
  if (dots) {
    dots.innerHTML = testimonials.map((_, i) => `<button class="testimonial-dot ${i === 0 ? 'active' : ''}" onclick="document.querySelectorAll('.testimonial-dot').forEach(d=>d.classList.remove('active')); this.classList.add('active');"></button>`).join('');
  }
}

// ==========================================
// Product Detail Page
// ==========================================
async function initProductPage() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const idParam = getUrlParam('id');
  const id = idParam && /^[0-9]+$/.test(idParam) ? parseInt(idParam, 10) : idParam;
  let product = PRODUCTS.find(p => p.id === id || String(p.id) === String(idParam));
  if (!product && idParam) {
    try {
      const res = await fetch(`${API_BASE}/api/products/${idParam}`);
      if (res.ok) product = await res.json();
    } catch (_) { }
  }
  if (!product) product = PRODUCTS[0] || null;
  if (!product) { container.innerHTML = '<p class="text-center" style="padding:4rem;">Product not found.</p>'; return; }
  window.__currentProduct = product;

  // Track ViewContent event
  try {
    trackPixelEvent('ViewContent', {
      id: product.id,
      name: product.nameAr || product.name_ar || product.name || '',
      price: product.price_silver || product.price || 0,
      currency: 'EGP'
    });
  } catch (e) {
    console.error('Pixel tracking error (ViewContent):', e);
  }

  const lang = document.documentElement.lang || 'en';
  const t = translations[lang];
  const name = lang === 'ar' ? (product.name_ar || product.nameAr || product.name) : (product.name || product.name_ar);

  if (typeof updateSEO === 'function') updateSEO(product, lang);
  document.title = `${name} — Aura Accessories`;

  const sizeOptions = (product.sizes || []).map((s, i) => `<button class="size-option ${i === 0 ? 'active' : ''}" onclick="document.querySelectorAll('.size-option').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${s}</button>`).join('');
  const colorOptions = (product.colors || []).map((c, i) => `<button class="color-option ${i === 0 ? 'active' : ''}" onclick="document.querySelectorAll('.color-option').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${c}</button>`).join('');
  let materials = (product.materials || []).filter(m => m);
  if (materials.length === 0) {
    if (product.priceGold > 0) materials.push(lang === 'ar' ? 'ذهب' : 'Gold');
    if (product.priceSilver > 0) materials.push(lang === 'ar' ? 'فضة' : 'Silver');
  }

  const matOptions = materials.map((m, i) => {
    const isGold = m.toLowerCase().includes('gold') || m.toLowerCase().includes('ذهب');
    const materialKey = isGold ? 'gold' : 'silver';
    // Requirement: Default to Silver if it exists, else Gold
    const hasSilver = materials.some(val => val.toLowerCase().includes('silver') || val.toLowerCase().includes('فضة'));
    const isActive = hasSilver ? materialKey === 'silver' : materialKey === 'gold'; 
    return `<button class="material-option category-tab ${isActive ? 'active' : ''}" data-material="${materialKey}" style="font-size:var(--text-xs);" onclick="updateProductVariant('${materialKey}', this)">${m}</button>`;
  }).join('');

  // Define global update function for variants
  window.updateProductVariant = function(materialKey, btn) {
    const p = window.__currentProduct;
    if (!p) return;
    
    document.querySelectorAll('.material-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const priceEl = document.getElementById('variant-price-display');
    if (priceEl) {
      const sale = materialKey === 'gold' ? (p.price_gold || p.price) : (p.price_silver || p.price);
      const original = materialKey === 'gold' ? (p.old_price_gold || p.oldPrice) : (p.old_price_silver || p.oldPrice);
      
      let html = `<span style="font-size: var(--text-3xl); font-weight:700; color: var(--gold);">EGP ${sale.toLocaleString()}</span>`;
      if (original && original > sale) {
        html += `<span class="old-price" style="font-size: var(--text-xl); margin-left: var(--space-2); text-decoration: line-through; color: var(--text-secondary);">EGP ${original.toLocaleString()}</span>`;
        html += `<span class="discount-badge">-${Math.round((1 - sale / original) * 100)}% OFF</span>`;
      }
      priceEl.innerHTML = html;
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out ${name} from Aura Accessories!`);

  // Build image gallery HTML dynamically based on product images (from Supabase or API).
  const images = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
  const mainImageHtml = images.length
    ? `<img src="${window.optimizeCloudinaryUrl(images[0], 1200)}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`
    : `<span style="font-size:5rem; color: var(--gold);">✦</span>`;
  const badgeHtml = product.badge ? `<span class="product-card-badge">${product.badge}</span>` : '';
  const thumbHtml = images.length
    ? images.map((src, i) => `<div style="flex:1; aspect-ratio:1; border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow:hidden; cursor:pointer; display:flex; align-items:center; justify-content:center;" class="hover-lift" onclick="changeMainImage(${i})"><img src="${window.optimizeCloudinaryUrl(src, 300)}" alt="thumb" style="width:100%; height:100%; object-fit:cover;"></div>`).join('')
    : [1, 2, 3, 4].map(() => `<div style="flex:1; aspect-ratio:1; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius: var(--radius-md); border: 1px solid var(--border-color); display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:var(--gold);">✦</span></div>`).join('');
  
  // Initial price calculation (default Silver)
  const initialSale = product.price_silver || product.price || 0;
  const initialOriginal = product.old_price_silver || product.oldPrice || null;
  const initialPriceHtml = `
    <span style="font-size: var(--text-3xl); font-weight:700; color: var(--gold);">EGP ${initialSale.toLocaleString()}</span>
    ${initialOriginal && initialOriginal > initialSale ? `<span class="old-price" style="font-size: var(--text-xl); margin-left: var(--space-2); text-decoration: line-through; color: var(--text-secondary);">EGP ${initialOriginal.toLocaleString()}</span>` : ''}
    ${initialOriginal && initialOriginal > initialSale ? `<span class="discount-badge">-${Math.round((1 - initialSale / initialOriginal) * 100)}% OFF</span>` : ''}
  `;

  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-gallery">
        <div class="product-main-image" id="product-main-image" style="background: linear-gradient(135deg, #1a1a1a, #2a2a2a); aspect-ratio:1; border-radius: var(--radius-lg); display:flex; align-items:center; justify-content:center; border: 1px solid var(--border-color); position:relative; overflow:hidden;">
          ${mainImageHtml}
          ${badgeHtml}
        </div>
        <div class="product-thumbs" style="display:flex; gap: var(--space-3); margin-top: var(--space-4);">
          ${thumbHtml}
        </div>
        <!-- Lifestyle Section -->
        <div style="margin-top: var(--space-8);">
          <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4);">${t.lifestyleGallery}</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
            <div style="aspect-ratio:16/10; background: linear-gradient(135deg, rgba(212,175,55,0.08), #1a1a1a); border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; position:relative;"><span style="color:var(--gold);font-size:2rem;">✦</span><span style="position:absolute;bottom:var(--space-2);left:var(--space-3);font-size:var(--text-xs);color:var(--text-secondary);">${t.styledLook}</span></div>
            <div style="aspect-ratio:16/10; background: linear-gradient(135deg, rgba(183,110,121,0.08), #1a1a1a); border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; position:relative;"><span style="color:var(--rose-gold);font-size:2rem;">✦</span><span style="position:absolute;bottom:var(--space-2);left:var(--space-3);font-size:var(--text-xs);color:var(--text-secondary);">${t.detailShot}</span></div>
          </div>
        </div>
      </div>
      <div class="product-info" style="display:flex; flex-direction:column; gap: var(--space-5);">
        <div>
          <span class="product-card-category">${getLabel(product.category)} · ${product.gender === 'women' ? t.womenCollection : t.menCollection}</span>
          <h1 style="font-size: var(--text-4xl); margin-top: var(--space-2);">${name}</h1>
          <p style="font-family: var(--font-arabic); color: var(--text-secondary); font-size: var(--text-lg);">${product.nameAr || ''}</p>
        </div>
        <div class="product-card-rating" style="font-size: var(--text-base);">
          ${renderStars(product.rating)}
          <span style="color: var(--text-secondary); margin-left: 8px;">${product.rating} (${product.reviews} reviews)</span>
        </div>

        <!-- Dynamic Price Display -->
        <div id="variant-price-display" style="display:flex; align-items:baseline; gap: var(--space-4);">
          ${initialPriceHtml}
        </div>

        <!-- Material Selector -->
        ${matOptions ? `<div>
          <div style="display:flex; gap: var(--space-2); flex-wrap:wrap;">${matOptions}</div>
        </div>` : ''}

        <!-- Product Story -->
        <div class="glass-card" style="padding: var(--space-5); border-left: 3px solid var(--gold);">
          <h4 style="font-size:var(--text-sm); color:var(--gold); margin-bottom:var(--space-2);">${t.theStory}</h4>
          <p style="color: var(--text-secondary); line-height:1.8; font-size:var(--text-sm); white-space:pre-wrap;" class="pre-wrap">${lang === 'ar' ? (product.story_ar || product.storyAr || product.story || '') : (product.story || '')}</p>
        </div>

        <!-- Size Selector -->
        ${sizeOptions ? `<div>
          <label class="form-label">${t.size}</label>
          <div style="display:flex; gap: var(--space-2); flex-wrap:wrap;">${sizeOptions}</div>
        </div>` : ''}

        <!-- Color Selector -->
        ${colorOptions ? `<div>
          <label class="form-label">${t.color}</label>
          <div style="display:flex; gap: var(--space-2); flex-wrap:wrap;">${colorOptions}</div>
        </div>` : ''}

        <!-- Customization -->
        ${product.has_customization ? `
        <div class="glass-card" style="padding: var(--space-5); border: 1px solid var(--gold); background: rgba(212,175,55,0.05);">
          <h4 style="font-size:var(--text-base); color:var(--gold); margin-bottom:var(--space-4);">✨ ${t.customization}</h4>
          
          <div class="form-group">
            <label class="form-label">${t.customText} (${product.customization_type === 'letters' ? t.letters : t.names})</label>
            <input type="text" id="customization-value" class="form-input" 
                   maxlength="${product.customization_limit || (product.customization_type === 'letters' ? 1 : 10)}"
                   placeholder="${t.enterValue}" required>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">
              ${t.charLimit}: ${product.customization_limit || (product.customization_type === 'letters' ? 1 : 10)}
            </div>
          </div>

          ${(product.custom_questions || []).map(q => `
            <div class="form-group" style="margin-top: var(--space-4);">
              <label class="form-label">${q}</label>
              <input type="text" class="custom-question-input form-input" data-question="${q}" placeholder="${t.enterValue}" required>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div>
          <label class="form-label">${t.quantity}</label>
          <div class="qty-selector">
            <button onclick="updateQtyDisplay(-1)">−</button>
            <input type="number" id="product-qty" value="1" min="1" max="10" readonly>
            <button onclick="updateQtyDisplay(1)">+</button>
          </div>
        </div>
        <div style="display:flex; gap: var(--space-3); flex-wrap:wrap;">
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="addToCart('${product.id}', parseInt(document.getElementById('product-qty').value, 10), window.__currentProduct || null)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            ${t.addToCart}
          </button>
          <button class="btn btn-outline btn-lg btn-icon" style="width:56px;height:56px;" onclick="toggleWishlist(${product.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>

        <!-- Share Buttons -->
        <div style="display:flex; align-items:center; gap:var(--space-4); padding:var(--space-3) 0; border-top:1px solid var(--border-color);">
          <span style="font-size:var(--text-sm); color:var(--text-secondary);">${t.share}:</span>
          <a href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" class="nav-icon-btn" title="WhatsApp" style="color:var(--text-secondary);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <button class="nav-icon-btn" title="نسخ الرابط" style="color:var(--text-secondary);" onclick="navigator.clipboard.writeText(window.location.href);showToast('تم نسخ الرابط! 📋','success')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        </div>

        <!-- Product Specs -->
        <div class="glass-card" style="padding: var(--space-5);">
          <h4 style="font-size:var(--text-base); margin-bottom:var(--space-4);">${t.home} &rarr; ${t.shop}</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
            <div style="font-size:var(--text-sm);"><span style="color:var(--text-secondary);">${t.dimensions}:</span><br><strong>${product.dimensions || 'N/A'}</strong></div>
            <div style="font-size:var(--text-sm);"><span style="color:var(--text-secondary);">${t.weight}:</span><br><strong>${product.weight || 'N/A'}</strong></div>
            <div style="font-size:var(--text-sm);"><span style="color:var(--text-secondary);">${t.material}:</span><br><strong>${getLabel(product.material)}</strong></div>
            <div style="font-size:var(--text-sm);"><span style="color:var(--text-secondary);">${t.occasion}:</span><br><strong>${product.occasion ? getLabel(product.occasion) : (lang === 'ar' ? 'يومي' : 'Everyday')}</strong></div>
          </div>
        </div>

        <!-- Care Instructions -->
        <div style="padding:var(--space-4); background:rgba(212,175,55,0.05); border-radius:var(--radius-md); border:1px solid rgba(212,175,55,0.15);">
          <h4 style="font-size:var(--text-sm); color:var(--gold); margin-bottom:var(--space-2);">🛡 ${t.careInstructions}</h4>
          <p style="font-size:var(--text-sm); color:var(--text-secondary); line-height:1.7;">${product.care || (lang === 'ar' ? 'تعامل مع القطعة بعناية. تحفظ في مكان بارد وجاف.' : 'Handle with care. Store in a cool, dry place.')}</p>
        </div>

        <div style="display:flex; gap: var(--space-6); padding: var(--space-4) 0; color: var(--text-secondary); font-size: var(--text-sm);">
          <span>🚚 ${t.freeShippingNote}</span>
          <span>↩ ${t.returnsNote}</span>
          <span>✓ ${t.authenticNote}</span>
        </div>
      </div>
    </div>
  `;

  // Store images globally for gallery switching
  window.currentProductImages = images;
  window.changeMainImage = function (idx) {
    const imgContainer = document.getElementById('product-main-image');
    if (!imgContainer || !window.currentProductImages) return;
    const src = window.currentProductImages[idx];
    if (src) {
      imgContainer.innerHTML = `<img src="${window.optimizeCloudinaryUrl(src, 1200)}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`;
      if (product.badge) {
        imgContainer.innerHTML += `<span class="product-card-badge">${product.badge}</span>`;
      }
    }
  };

  // Related products (gender-aware)
  const relatedGrid = document.getElementById('related-products');
  if (relatedGrid) {
    const related = PRODUCTS.filter(p => p.id !== product.id && p.gender === product.gender).slice(0, 4);
    relatedGrid.innerHTML = related.map(createProductCard).join('');
  }

  // Complete the look
  const completeGrid = document.getElementById('complete-look');
  if (completeGrid) {
    const complementary = PRODUCTS.filter(p => String(p.id) !== String(product.id) && p.gender === product.gender && p.category !== product.category).slice(0, 3);
    completeGrid.innerHTML = complementary.map(createProductCard).join('');
  }

  // Load ratings and bind review form
  loadProductRatings(product.id);
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.onsubmit = null;
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const stars = parseInt(document.getElementById('review-stars-value')?.value, 10) || 0;
      const comment = (reviewForm.querySelector('textarea') || {}).value || '';
      if (stars < 1 || stars > 5) {
        showToast(translations[document.documentElement.lang]?.ratingError || 'Please select a rating', 'error');
        return;
      }
      const token = getToken();
      if (!token) {
        showToast(translations[document.documentElement.lang]?.loginRequired || 'Please log in to rate', 'error');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/ratings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ product_id: product.id, stars, comment })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed');
        showToast(translations[document.documentElement.lang]?.ratingSuccess || 'Thank you for your review!', 'success');
        reviewForm.reset();
        loadProductRatings(product.id);
      } catch (err) {
        showToast(translations[document.documentElement.lang]?.ratingError || err.message, 'error');
      }
    });
  }
}

async function loadProductRatings(productId) {
  const summaryEl = document.getElementById('product-ratings-summary');
  const listEl = document.getElementById('product-ratings-list');
  if (!summaryEl || !listEl) return;
  const lang = document.documentElement.lang || 'en';
  const t = translations[lang];
  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}/ratings`);
    const ratings = res.ok ? await res.json() : [];
    const count = ratings.length;
    const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : '0';
    summaryEl.innerHTML = `<div style="font-size: var(--text-6xl); font-weight:700; color: var(--gold);">${avg}</div><p style="color: var(--text-secondary); font-size: var(--text-sm);">${t.basedOnReviews || 'Based on'} ${count} ${lang === 'ar' ? 'تقييم' : 'reviews'}</p>`;
    listEl.innerHTML = ratings.length ? ratings.map(r => {
      const d = r.created_at ? new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en') : '';
      return `<div class="review-card" style="margin-bottom: var(--space-4);"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-3);"><div style="display:flex; align-items:center; gap: var(--space-3);"><div style="width:40px;height:40px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;color:var(--black);font-weight:700;">U</div><div><div style="font-weight:600; font-size: var(--text-sm);">${lang === 'ar' ? 'عميل' : 'Customer'}</div><div style="font-size: var(--text-xs); color: var(--text-secondary);">${d}</div></div></div><div class="stars">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:${i <= r.stars ? 'var(--gold)' : 'var(--gray-600)'}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`).join('')}</div></div><p style="color: var(--text-secondary); line-height:1.8; font-size: var(--text-sm);">${(r.comment || '').replace(/</g, '&lt;')}</p></div>`;
    }).join('') : (lang === 'ar' ? '<p style="color: var(--text-secondary);">مافيش تقييمات لسه. كن أول واحد يقيّم!</p>' : '<p style="color: var(--text-secondary);">No reviews yet. Be the first to rate!</p>');
  } catch (_) {
    summaryEl.innerHTML = `<div style="font-size: var(--text-6xl); font-weight:700; color: var(--gold);">0</div><p style="color: var(--text-secondary); font-size: var(--text-sm);">${t.basedOnReviews || 'Based on'} 0 ${lang === 'ar' ? 'تقييم' : 'reviews'}</p>`;
    listEl.innerHTML = '<p style="color: var(--text-secondary);">—</p>';
  }
}

function updateQtyDisplay(delta) {
  const input = document.getElementById('product-qty');
  if (!input) return;
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
}

// ==========================================
// Cart Page
// ==========================================
function renderCartPage() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const subtotalEl = document.getElementById('cart-subtotal');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');

  if (!container) return;

  const lang = document.documentElement.lang || 'en';
  const t = translations[lang];

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      const heading = emptyEl.querySelector('h2') || emptyEl.querySelector('h3');
      if (heading) heading.textContent = t.cartEmpty;
    }
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) {
    summaryEl.style.display = 'block';
    summaryEl.querySelector('h3').textContent = t.orderSummary;
    const labels = summaryEl.querySelectorAll('.summary-row span:first-child');
    if (labels.length >= 2) {
      labels[0].textContent = t.cartSubtotal;
      labels[1].textContent = t.shipping;
    }
    const btns = summaryEl.querySelectorAll('.btn-primary');
    if (btns.length > 0) btns[0].textContent = t.checkout;
  }

  container.innerHTML = cart.map(item => {
    const prod = PRODUCTS.find(p => String(p.id) === String(item.id));
    const displayName = lang === 'ar' ? (prod?.name_ar || prod?.nameAr || item.name) : item.name;
    const imgHtml = item.image ? `<img src="${item.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` : '<span style="color:var(--gold); font-size:1.5rem;">✦</span>';
    return `
    <div class="cart-item glass-card" style="display:flex; gap: var(--space-6); align-items:center; margin-bottom: var(--space-4); padding: var(--space-5);">
      <div style="width:80px; height:80px; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius: var(--radius-md); display:flex; align-items:center; justify-content:center; overflow:hidden;">${imgHtml}</div>
      <div style="flex:1;">
        <h4 style="font-family: var(--font-heading); font-size: var(--text-base);">${displayName}</h4>
        ${item.customizationValue ? `<p style="font-size: var(--text-xs); color: var(--gold); margin-top: 4px;"><strong>${t.customization}:</strong> ${item.customizationValue}</p>` : ''}
        ${item.customAnswers && Array.isArray(item.customAnswers) ? item.customAnswers.map(ans => `<p style="font-size: var(--text-xs); color: var(--text-secondary);"><strong>${ans.question}:</strong> ${ans.answer}</p>`).join('') : ''}
        <p style="color: var(--gold); font-weight:600; margin-top: var(--space-1);">EGP ${item.price.toLocaleString()}</p>
      </div>
      <div class="qty-selector">
        <button onclick="updateCartQty('${item.cartId || item.id}', ${item.qty - 1})">−</button>
        <input type="number" value="${item.qty}" readonly>
        <button onclick="updateCartQty('${item.cartId || item.id}', ${item.qty + 1})">+</button>
      </div>
      <div style="min-width:100px; text-align:right;">
        <strong style="color: var(--gold);">EGP ${(item.price * item.qty).toLocaleString()}</strong>
      </div>
      <button class="nav-icon-btn" onclick="removeFromCart('${item.cartId || item.id}')" title="${t.remove}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  `;
  }).join('');

  const total = getCartTotal();
  const shipping = 55;
  const discountRow = document.getElementById('coupon-discount-row');
  const discountEl = document.getElementById('cart-discount');

  if (subtotalEl) subtotalEl.textContent = `EGP ${total.toLocaleString()}`;

  if (couponDiscountAmount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountEl) discountEl.textContent = `-EGP ${couponDiscountAmount.toLocaleString()}`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  if (totalEl) totalEl.textContent = `EGP ${(total + shipping - couponDiscountAmount).toLocaleString()}`;
}

async function applyCouponInCart() {
  const codeInput = document.getElementById('coupon-input');
  const msgEl = document.getElementById('coupon-message');
  const btn = document.getElementById('apply-coupon-btn');
  if (!codeInput || !btn || !msgEl) return;
  
  const code = codeInput.value.trim().toUpperCase();
  if (!code) return;

  // If same coupon is already applied, remove it
  if (appliedCoupon && appliedCoupon.code === code) {
    appliedCoupon = null;
    couponDiscountAmount = 0;
    localStorage.removeItem('aura_applied_coupon');
    codeInput.value = '';
    msgEl.style.display = 'none';
    btn.textContent = (document.documentElement.lang === 'ar' ? 'تطبيق' : 'Apply');
    renderCartPage();
    return;
  }

  btn.disabled = true;
  btn.textContent = '...';
  
  const subtotal = getCartTotal();
  try {
    const apiBase = window.location.origin;
    const res = await fetch(`${apiBase}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal: subtotal })
    });
    
    const data = await res.json();
    if (res.ok && data.valid) {
      appliedCoupon = data.coupon;
      couponDiscountAmount = data.discountAmount;
      localStorage.setItem('aura_applied_coupon', JSON.stringify({ code, coupon: data.coupon, discountAmount: data.discountAmount }));
      msgEl.style.cssText = 'display:block; color:var(--success);';
      msgEl.textContent = (document.documentElement.lang === 'ar' ? '✓ ' : '✓ ') + data.message;
      btn.textContent = (document.documentElement.lang === 'ar' ? 'إزالة' : 'Remove');
      renderCartPage();
    } else {
      appliedCoupon = null;
      couponDiscountAmount = 0;
      msgEl.style.cssText = 'display:block; color:var(--error);';
      msgEl.textContent = '✕ ' + (data.error || (document.documentElement.lang === 'ar' ? 'كود غير صالح' : 'Invalid code'));
      btn.textContent = (document.documentElement.lang === 'ar' ? 'تطبيق' : 'Apply');
      renderCartPage();
    }
  } catch (err) {
    appliedCoupon = null;
    couponDiscountAmount = 0;
    localStorage.removeItem('aura_applied_coupon');
    console.error('Coupon error:', err);
    msgEl.style.cssText = 'display:block; color:var(--error);';
    msgEl.textContent = (document.documentElement.lang === 'ar' ? '✕ خطأ في الاتصال' : '✕ Connection error');
  } finally {
    btn.disabled = false;
  }
}

// ==========================================
// Newsletter
// ==========================================
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]');
    if (email && email.value) {
      showToast('أهلاً بيك في عيلة أورا! ✦', 'success');
      email.value = '';
    }
  });
}

// ==========================================
// Search
// ==========================================
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', debounce(() => {
    const q = searchInput.value.toLowerCase().trim();
    if (q.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.nameAr.includes(q) ||
      p.category.includes(q) ||
      p.material.includes(q)
    );

    if (results.length === 0) {
      searchResults.innerHTML = `<div style="padding:1rem; color:var(--text-secondary);">${translations[document.documentElement.lang]?.noResultsFound || 'No results found'}</div>`;
    } else {
      searchResults.innerHTML = results.slice(0, 5).map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item" style="display:flex; gap:var(--space-3); padding:var(--space-3) var(--space-4); align-items:center; transition: background var(--transition-fast);">
          <div style="width:40px;height:40px;background:var(--bg-tertiary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--gold);">✦</div>
          <div>
            <div style="font-weight:500; font-size: var(--text-sm);">${p.name}</div>
            <div style="color:var(--gold); font-size: var(--text-xs);">EGP ${p.price.toLocaleString()}</div>
          </div>
        </a>
      `).join('');
    }
    searchResults.style.display = 'block';
  }, 200));

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

// ==========================================
// Counter Animation
// ==========================================
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current.toLocaleString() + (el.dataset.suffix || '');
        }, 20);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* Consolidated at the bottom */

/* Translation System */
const translations = {
  en: {
    home: "Home", shop: "Shop", design: "Design Your Aura", journal: "Journal", about: "About", contact: "Contact", cart: "Cart", login: "Account", heroTitle: "Discover Your", heroHighlight: "Aura", heroSubtitle: "Handcrafted luxury accessories that define your unique style.", exploreShop: "Explore Shop", designYourOwn: "Design Your Own", featuredCollections: "Featured Collections", curatedForYou: "Curated For You", featuredSubtitle: "Our most coveted pieces, handpicked by our style experts — for everyone.", necklaces: "Necklaces", necklacesCount: "128 Products", rings: "Rings", ringsCount: "96 Products", earrings: "Earrings", earringsCount: "152 Products", bracelets: "Bracelets", braceletsCount: "110 Products", womenCollection: "Women", menCollection: "Men", unisexCollection: "Unisex", shopWomen: "Shop Women", shopMen: "Shop Men", viewAll: "All", viewAllCollections: "View All Collections →",
    // Shop page
    shopHeaderLabel: "Our Collection",
    shopTitle: "Shop Accessories",
    shopSubtitle: "Explore our curated collection of premium accessories for everyone.",
    filters: "Filters",
    genderLabel: "Gender",
    categoryLabel: "Category",
    materialLabel: "Material",
    priceRangeLabel: "Price Range (EGP)",
    colorLabel: "Color",
    styleLabel: "Style",
    occasionLabel: "Occasion",
    // Women/Men sections
    womensCollection: "Women's Collection", elegance: "Elegance", redefined: "Redefined", womensDesc: "Discover a world of refined beauty. Our women's collection features delicate necklaces, statement rings, ethereal earrings, and elegant bracelets — each piece designed to celebrate your unique radiance.", exploreWomens: "Explore Women's →", mensCollection: "Men's Collection", bold: "Bold &", refined: "Refined", mensDesc: "Accessories that speak volumes without saying a word. Our men's collection features leather bracelets, signet rings, titanium chains, and carbon fiber pieces — crafted for the modern gentleman.", exploreMens: "Explore Men's →",
    // Design CTA
    aiPowered: "AI-Powered Innovation", designYourAura: "Design Your Aura", designCtaDesc: "Use our AI-powered design studio to create your perfect accessory. Describe your dream piece, choose your materials, and let our artificial intelligence bring your vision to life.", describe: "Describe", tellUsVision: "Tell us your vision", aiCreates: "AI Creates", watchMagic: "Watch the magic happen", weCraft: "We Craft", handmadeForYou: "Handmade just for you", startDesigning: "✦ Start Designing",
    // Our Story
    ourStory: "Our Story", theAura: "The", philosophy: "Philosophy", storyP1: "Born in the heart of Egypt, Aura Accessories was founded with a singular vision: to create accessories that don't just complement your style — they amplify your unique energy.", storyP2: "Every piece in our collection is a testament to meticulous craftsmanship, premium materials, and a deep understanding that true luxury lies in the details.", happyCustomers: "Happy Customers", uniqueDesigns: "Unique Designs", awardsWon: "Awards Won", readOurStory: "Read Our Story →", eleganceQuote: "\"Elegance is not about being noticed, it's about being remembered.\"",
    // Testimonials
    whatTheySay: "What They Say", customerStories: "Customer Stories", testimonialsSubtitle: "Real experiences from our valued Aura community.",
    // Instagram & Newsletter
    followUs: "Follow Us", stayConnected: "Stay Connected", joinFamily: "Join the Aura Family", newsletterDesc: "Be the first to know about new collections, exclusive offers, and style tips.", subscribe: "Subscribe", emailPlaceholder: "Enter your email address",
    // Footer
    footerText: "Premium handcrafted accessories for men and women.", company: "Company", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Use", faq: "FAQ", rightsReserved: "© 2026 Aura Accessories. All rights reserved.",
    // Product
    addToCart: "Add to Cart", view: "View", price: "Price", size: "Size", color: "Color", material: "Material", quantity: "Quantity", dimensions: "Dimensions", weight: "Weight", occasion: "Occasion", careInstructions: "Care Instructions", share: "Share", relatedProducts: "You May Also Like", completeLook: "Complete The Look", theStory: "✦ The Story", reviews: "Reviews", customerReviews: "Customer Reviews", writeReview: "Write a Review", basedOnReviews: "Based on", lifestyleGallery: "Lifestyle Gallery", styledLook: "Styled Look", detailShot: "Detail Shot", freeShippingNote: "🚚 Free shipping over EGP 500", returnsNote: "↩ 14-day returns", authenticNote: "✓ Authentic guarantee",
    // Cart & Checkout
    cartTitle: "Shopping Cart", cartEmpty: "Your cart is empty", cartSubtotal: "Subtotal", cartTotal: "Total", checkout: "Proceed to Checkout", remove: "Remove", orderSummary: "Order Summary", shipping: "Shipping", returns: "Returns", payment: "Payment", shippingAddress: "Shipping Address", fullName: "Full Name", address: "Address", city: "City", postalCode: "Postal Code", phoneNumber: "Phone Number", country: "Country", orderNotes: "Order Notes", continuePayment: "Continue to Payment", placeOrder: "Place Order",
    // Search & Filters
    search: "Search", searchPlaceholder: "Search for accessories...", noProductsFound: "No products found", tryAdjusting: "Try adjusting your filters", noResultsFound: "No results found", sortBy: "Sort by", featured: "Featured", priceLowHigh: "Price: Low to High", priceHighLow: "Price: High to Low", topRated: "Top Rated", newest: "Newest", bestSelling: "Best Selling", priceRange: "Price Range", filterBy: "Filter by",
    // Contact
    name: "Name", email: "Email", subject: "Subject", message: "Message", sendMessage: "Send Message", sending: "Sending...", contactTitle: "Contact Us", contactSubtitle: "We're here to help. Reach out with any questions.", getInTouch: "Get in Touch", contactInfo: "Contact Info",
    // Chat
    chatSupport: "✦ Aura Support", chatWelcome: "👋 Welcome to Aura Accessories! How can we help you today?", chatSupportNow: "Aura Support • just now", chatPlaceholder: "Type your message...", send: "Send",
    // Design Studio
    accessoryBuilder: "✦ Accessory Builder", aiAssistant: "✨ AI Assistant", virtualTryOn: "📸 Virtual Try-On", accessoryType: "1. Accessory Type", materialStep: "2. Material", styleStep: "3. Style", gemstone: "4. Gemstone (Optional)", engraving: "5. Engraving (Optional)", engravingPlaceholder: "Enter text to engrave...", engravingNote: "Max 20 characters. Available on select pieces.", submitDesign: "✦ Submit Design", save: "Save", yourDesign: "Your Design", estimatedPrice: "Estimated Price", productionTime: "Production Time", productionDays: "5-7 business days", free: "Free", necklace: "Necklace", bracelet: "Bracelet", ring: "Ring", anklet: "Anklet", giftSet: "Gift Set", gold: "Gold", silver: "Silver", roseGold: "Rose Gold", leather: "Leather", titanium: "Titanium", crystal: "Crystal", classic: "Classic", modern: "Modern", bohemian: "Bohemian", luxury: "Luxury", none: "None", diamond: "Diamond", sapphire: "Sapphire", ruby: "Ruby", emerald: "Emerald", pearl: "Pearl", onyx: "Onyx", turquoise: "Turquoise",
    // AI Assistant
    aiDesignAssistant: "AI Design Assistant", aiDesc: "Describe the accessory of your dreams, and our AI will bring it to life.", aiPlaceholder: "Describe your dream accessory...", tryPrompts: "Try:", minimalistRing: "Minimalist Ring", mensBracelet: "Men's Bracelet", floralEarrings: "Floral Earrings", layeredSet: "Layered Set", forWomen: "For Women", forMen: "For Men", unisex: "Unisex", anyBudget: "Any Budget", generateDesign: "✨ Generate Design", generating: "Generating...", aiGenerated: "✦ AI-Generated Design", orderThis: "Order This",
    // Virtual Try-On
    virtualTryOnTitle: "Virtual Try-On", tryOnDesc: "See how our accessories look on you using augmented reality.", tapToOpen: "Tap to open camera or upload a photo", uploadPhoto: "Upload Photo", tryOnPopular: "Or try on these popular pieces:", photoPrivacy: "🔒 Your photos are never stored or shared",
    // Style Suggestions
    styleSuggestions: "Style Suggestions For You", styleSuggestionsDesc: "Based on current trends and popular choices in Egypt.", eveningElegance: "Evening Elegance", eveningEleganceDesc: "Gold necklaces with sapphire accents — perfect for special nights out.", modernMasculine: "Modern Masculine", modernMasculineDesc: "Titanium and leather combinations — bold statements for the modern man.", bohemianSpirit: "Bohemian Spirit", bohemianSpiritDesc: "Mixed gemstones and layered pieces — free-spirited luxury.", trending: "Trending", popular: "Popular", new: "New",
    // Account
    myAccount: "My Account", welcomeBack: "Welcome back,", accountOverview: "Here's an overview of your Aura account.", dashboard: "📊 Dashboard", myOrders: "📦 My Orders", wishlist: "❤️ Wishlist", myDesigns: "🎨 My Designs", auraPoints: "✦ Aura Points", addresses: "📍 Addresses", settings: "⚙️ Settings", logout: "🚪 Logout", totalOrders: "Total Orders", wishlistItems: "Wishlist Items", savedDesigns: "Saved Designs", recentOrders: "Recent Orders", yourWishlist: "Your Wishlist", savedDesignsTitle: "Saved Designs", recentlyViewed: "Recently Viewed", goldMember: "✦ Gold Member", auraPointsProgram: "✦ Aura Points Program", pointsInfo: "points — only 50 more to unlock a EGP 100 discount!", toNextReward: "to next reward", delivered: "Delivered ✓", inTransit: "In Transit 🚚", orderTracking: "Your order is on its way!",
    // Auth
    loginTitle: "Login", registerTitle: "Create Account", password: "Password", confirmPassword: "Confirm Password", loginBtn: "Login", registerBtn: "Create Account", noAccount: "Don't have an account?", hasAccount: "Already have an account?", signUp: "Sign Up", signIn: "Sign In",
    // Marquee
    marquee1: "✦ Free Shipping Over EGP 500", marquee2: "✦ Premium Handcrafted Quality", marquee3: "✦ 14-Day Easy Returns", marquee4: "✦ AI-Powered Custom Designs", marquee5: "✦ Authentic Guarantee",
    // Scroll
    scroll: "Scroll",
    // Hero label
    heroLabel: "AURA ACCESSORIES — EGYPT'S FINEST",
    // Split the "Design Your Aura" heading into separate parts for translation so we can style the word "Aura"
    designYour: "Design Your",
    auraWord: "Aura",
    // Brand name (used in headings like "The Aura Philosophy")
    brandName: "Aura",
    // About page
    aboutTitle: "About Aura", aboutSubtitle: "The story behind the brand.", ourMission: "Our Mission", ourVision: "Our Vision", ourValues: "Our Values",
    // New About Page Keys
    aboutLabel: "Our Story",
    aboutSubtitle: "We started with a simple idea — and built it with true passion ❤️",
    storyLabel: "The Beginning",
    storyTitle: "It Started with a Question",
    storyText1: "Why can't you have an accessory with your name or the name of someone you love?",
    storyText2: "From here, we began crafting custom pieces with real quality and chic designs — making you always stand out.",
    storyText3: "Our goal isn't just to sell … our goal is for every piece to have a meaning ❤️",
    materialsLabel: "Ethically Sourced",
    materialsTitle: "Materials of Integrity",
    materialsText: "We believe that true luxury begins with responsibility. That's why every gemstone, metal, and material we use is ethically sourced and certified.",
    goldSilver: "Recycled Gold & Silver:",
    goldSilverText: "Reducing environmental impact without compromising quality.",
    conflictFree: "Conflict-Free Gemstones:",
    conflictFreeText: "Sourced directly from certified mines.",
    veganLeather: "Premium Vegan Leather:",
    veganLeatherText: "Cruelty-free alternatives that look and feel luxurious.",
    valuesLabel: "What We Believe",
    valuesTitle: "Our Values",
    qualityFirst: "Quality First",
    qualityText: "Every piece undergoes rigorous quality checks. We use only premium materials sourced responsibly.",
    innovation: "Innovation",
    innovationText: "Our AI design studio pushes the boundaries of what's possible in custom accessories.",
    sustainability: "Sustainability",
    sustainabilityText: "Eco-friendly packaging and ethically sourced materials are at our core.",
    community: "Community",
    communityText: "We nurture our community through content, events, and genuine connections.",
    teamLabel: "The People",
    teamTitle: "Our Team",
    teamName1: "Myrna", teamRole1: "Founder & Creative Director", teamBio1: "Visionary behind the Aura concept, bringing luxury and innovation together.",
    teamName2: "Sara", teamRole2: "Head of Design", teamBio2: "Master artisan with 10+ years of jewelry design experience.",
    teamName3: "Ahmed", teamRole3: "Technology Lead", teamBio3: "The mind behind our AI design studio and technology platform.",
    happyCustomers: "Happy Customers", uniqueDesigns: "Unique Designs", citiesServed: "Cities Served", satisfactionRate: "Satisfaction Rate",
    // Home Page Additions
    heroTitle1: "Turn Your Name", heroTitle2: "Into a Masterpiece 💎", heroSubtitle2: "Necklaces, bracelets, and rings with your name or your loved one's name", heroBenefit: "Premium Materials • Rust-Free • 6-Month Guarantee",
    orderNow: "Order Now", rustFree: "Rust-free for one year", material925: "925 Silver or 21K Gold", guarantee6m: "6-Month Guarantee", freeGift: "🎁 Free Premium Gift Box",
    mCustomName: "✦ Custom Name Accessories 💎", mRustFree: "✦ Rust-Free & Color Fast ✔", mGuarantee: "✦ 6-Month Guarantee 🛡", mFreeShipping: "✦ Free Shipping Over EGP 500 🚚", mFreeGift: "✦ Free Premium Gift Box 🎁", mNameLang: "✦ Name in Arabic or English ✍️", mPerfectGift: "✦ Perfect Gift for Every Occasion ❤️",
    specialService: "Special Service",
    aiTag: "Custom Request", ctaDesignTitlePart1: "Bring Any Design", ctaDesignTitlePart2: "To Life", ctaDesignSubtitle: "Saw an accessory you liked? Send us the photo and we will craft it for you with Aura's quality and guarantee 💎",
    step1Title: "Upload Photo", step1Desc: "Of any accessory you saw anywhere", step2Title: "Get a Quote", step2Desc: "We'll review your request and reply with price and details", step3Title: "Receive Your Piece 🎁", step3Desc: "With a free premium gift box with every order", startDesignNow: "✦ Start Your Design Now",
    whyAuraTag: "Why Choose Aura?", whyAuraTitle1: "Not Just", whyAuraTitle2: "Looking Good", whyAuraTitle3: "Real Quality",
    realMaterials: "Real Materials", realMaterialsDesc: "925 Italian Silver or High Quality 21K Gold Plating — not just ordinary plating",
    guarantee6mTitle: "6-Month Guarantee", guarantee6mDesc: "Any manufacturing defect? We replace it immediately without argument — that's our promise",
    nameAnyLang: "Name in Any Language", nameAnyLangDesc: "Arabic, English, two names together — each piece is made specifically for you",
    perfectGiftTitle: "Perfect Gift", perfectGiftDesc: "Birthday, engagement, or marriage — free premium gift box with every order",
    neverChanges: "Gold/Silver Plating", neverChangesDesc: "High quality gold or silver plating — wear it every day as much as you like all year",
    fastDeliveryTitle: "Delivery 4-7 Days", fastDeliveryDesc: "Delivery to all Egypt governorates — 55 EGP shipping",
    storyTag: "Our Story", storyTitleH1: "Simple", storyTitleH2: "Idea", storyTitleH3: "Real Beginning",
    indexStoryP1: "Aura started from a simple question: Why can't you have an accessory with your name or the name of someone you love?",
    indexStoryP2: "From here we began crafting custom pieces with real quality and chic designs. Our goal isn't just to sell — our goal is for every piece to have a meaning ❤️",
    happyUsers: "Happy Customers", diffDesigns: "Different Designs", productGuarantee: "Product Guarantee", readMoreAbout: "Learn More About Us →",
    // Blog
    readMore: "Read More →", blogTitle: "The Aura Journal", blogSubtitle: "Style tips, trends, and behind the scenes.",
    // Messages (success/error)
    orderSuccess: "Order placed successfully!",
    orderError: "Failed to place order.",
    ratingSuccess: "Thank you for your review!",
    ratingError: "Failed to submit rating.",
    loginRequired: "Please log in to continue.",
    loginSuccess: "Welcome back!",
    registerSuccess: "Account created! Welcome to Aura.",
    invalidCredentials: "Invalid email or password.",
    emailExists: "This email is already registered.",
    fillRequired: "Please fill all required fields.",
    passwordsDontMatch: "Passwords do not match.",
    saveSuccess: "Saved successfully.",
    saveError: "Something went wrong.",
    productNotFound: "Product not found.",
    customization: "Customization",
    customText: "Name or Letter",
    charLimit: "Character Limit",
    customQuestions: "Additional Information",
    enterValue: "Enter value...",
    requiredField: "This field is required",
    letters: "Letters",
    names: "Names"
  },
  ar: {
    home: "الرئيسية", shop: "المحل", design: "صمّم اكسسوارك", journal: "المدونة", about: "عنّا", contact: "كلمنا", cart: "عربة التسوق", login: "حسابي", heroTitle: "إكتشف", heroHighlight: "هالتك", heroSubtitle: "اكسسوارات فاخرة ومصنوعة بإيدينا بتبرز ستايلك المميز.", exploreShop: "خد لك لفة فى المحل", designYourOwn: "صمّم على ذوقك", featuredCollections: "مجموعات مميزة", curatedForYou: "مخصوصة ليك", featuredSubtitle: "أحلى قطع عندنا، مختارة بعناية من خبراء الشياكة - تناسب الجميع.", necklaces: "سلاسل", necklacesCount: "١٢٨ قطعة", rings: "خواتم", ringsCount: "٩٦ قطعة", earrings: "حلقان", earringsCount: "١٥٢ قطعة", bracelets: "اساور", braceletsCount: "١١٠ قطعة", womenCollection: "حريمي", menCollection: "رجالي", unisexCollection: "للجنسين", shopWomen: "تسوق حريمي", shopMen: "تسوق رجالي", viewAll: "الكل", viewAllCollections: "شوف كل المجموعات →",
    // Shop page
    shopHeaderLabel: "تشكيلتنا",
    shopTitle: "تسوق اكسسوارات",
    shopSubtitle: "استكشف تشكيلتنا المختارة من اكسسوارات فاخرة تناسب الجميع.",
    filters: "الفلاتر",
    genderLabel: "النوع",
    categoryLabel: "القسم",
    materialLabel: "الخامة",
    priceRangeLabel: "حدود السعر (جنيه)",
    colorLabel: "اللون",
    styleLabel: "الستايل",
    occasionLabel: "المناسبة",
    womensCollection: "مجموعة الستات", elegance: "الأناقة", redefined: "بشكل جديد", womensDesc: "اكتشفي عالم الجمال والرقى. مجموعتنا الحريمي فيها سلاسل رقيقة، خواتم ملفتة، حلقان خفيفة، واساور شيك — كل قطعة معمولة مخصوص علشان تبرز جمالك.", exploreWomens: "اتفرجي على مجموعة الحريمي →", mensCollection: "مجموعة الرجالة", bold: "جريء و", refined: "راقي", mensDesc: "اكسسوارات بتتكلم عنك من غير كلام. مجموعتنا الرجالي فيها اساور جلد، خواتم سيجنت، سلاسل تيتانيوم، وقطع كربون فايبر — معمولة للرجل العصري.", exploreMens: "اتفرج على مجموعة الرجالة →",
    aiPowered: "ابتكار بالذكاء الاصطناعي", designYourAura: "صمّم هالتك", designCtaDesc: "استعمل ستوديو التصميم بالذكاء الاصطناعي لعمل اكسسوار حلمك. احكي لنا فكرة القطعة، اختار الخامات، وسيب الذكاء الاصطناعي يحققها.", describe: "وصف", tellUsVision: "احكي لنا فكرتك", aiCreates: "الذكاء يصمم", watchMagic: "شوف السحر بيحصل", weCraft: "إحنا بنصنع", handmadeForYou: "مصنوع بإيدينا ليك", startDesigning: "✦ ابدأ التصميم",
    ourStory: "قصتنا", theAura: "فلسفة", philosophy: "", storyP1: "أورا اتولدت في قلب مصر برؤية واحدة: نخلق اكسسوارات مش بس تكمل ستايلك — لكن تعلي طاقتك الخاصة.", storyP2: "كل قطعة عندنا بتشهد على شغل بإتقان، خامات فخمة، وفهم ان الفخامة الحقيقية في التفاصيل.", happyCustomers: "عملاء مبسوطين", uniqueDesigns: "تصميمات مميزة", awardsWon: "جوائز", readOurStory: "اعرف قصتنا →", eleganceQuote: "\"الأناقة مش بس تخلي الناس تشوفك، الأناقة تخلي الناس يفتكروك\"",
    whatTheySay: "الناس بتقول ايه", customerStories: "تجارب العملاء", testimonialsSubtitle: "آراء حقيقية من عيلة أورا.",
    followUs: "تابعنا", stayConnected: "خليك على تواصل", joinFamily: "انضم لعيلة أورا", newsletterDesc: "خليك أول واحد يعرف عن مجموعاتنا الجديدة، العروض الحصرية، ونصايح الشياكة.", subscribe: "اشترك", emailPlaceholder: "اكتب إيميلك",
    footerText: "إكسسورات يدوية فاخرة بجودة حقيقية.", company: "الشركة", legal: "القانون", privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", faq: "الأسئلة المتكررة", rightsReserved: "© ٢٠٢٦ أورا للإكسسوارات. كل الحقوق محفوظة.",
    addToCart: "أضف للسلة", view: "شوف", price: "السعر", size: "المقاس", color: "اللون", material: "الخامة", quantity: "الكمية", dimensions: "الأبعاد", weight: "الوزن", occasion: "المناسبة", careInstructions: "طريقة العناية", share: "شارك", relatedProducts: "ممكن يعجبك كمان", completeLook: "كمّل طلتك", theStory: "✦ القصة", reviews: "التقييمات", customerReviews: "آراء العملاء", writeReview: "اكتب تقييم", basedOnReviews: "بناءً على", lifestyleGallery: "معرض الصور", styledLook: "طلة مميزة", detailShot: "صور التفاصيل", freeShippingNote: "🚚 شحن مجاني لأكثر من ٥٠٠ جنيه", returnsNote: "↩ تقدر ترجع خلال ١٤ يوم", authenticNote: "✓ ضمان أصلي",
    cartTitle: "عربة التسوق", cartEmpty: "سلتك فاضية", cartSubtotal: "المجموع الجزئي", cartTotal: "الإجمالي", checkout: "أكمل الطلب", remove: "حذف", orderSummary: "ملخص طلبك", shipping: "الشحن", returns: "الإرجاع", payment: "الدفع", shippingAddress: "عنوان التوصيل", fullName: "الاسم بالكامل", address: "العنوان", city: "المدينة", postalCode: "الرمز البريدي", phoneNumber: "رقم التليفون", country: "البلد", orderNotes: "ملاحظات إضافية", continuePayment: "استمر للدفع", placeOrder: "نفذ الطلب",
    search: "بحث", searchPlaceholder: "دور على اكسسوارات...", noProductsFound: "مافيش منتجات", tryAdjusting: "جرب تغير الفلاتر", noResultsFound: "مافيش نتائج", sortBy: "رتب حسب", featured: "الأبرز", priceLowHigh: "السعر: من الأقل للأعلى", priceHighLow: "السعر: من الأعلى للأقل", topRated: "أعلى تقييم", newest: "الأجدد", bestSelling: "الأكتر مبيعاً", priceRange: "حدود السعر", filterBy: "فلتر حسب",
    name: "الاسم", email: "الإيميل", subject: "الموضوع", message: "الرسالة", sendMessage: "ابعت الرسالة", sending: "جاري الارسال...", contactTitle: "كلمنا", contactSubtitle: "احنا هنا للمساعدة، كلمنا لو عندك أي استفسار", getInTouch: "ابق على اتصال", contactInfo: "بيانات الاتصال",
    chatSupport: "✦ دعم أورا", chatWelcome: "👋 أهلاً بيك في أورا للإكسسوارات! نقدر نساعدك في إيه؟", chatSupportNow: "دعم أورا • الآن", chatPlaceholder: "اكتب رسالتك...", send: "ابعت",
    accessoryBuilder: "✦ مصمم الإكسسوارات", aiAssistant: "✨ المساعد بالذكاء الاصطناعي", virtualTryOn: "📸 تجربة شكل الإكسسوار", accessoryType: "١. نوع الاكسسوار", materialStep: "٢. الخامة", styleStep: "٣. الستايل", gemstone: "٤. الحجر الكريم (اختياري)", engraving: "٥. الحفر (اختياري)", engravingPlaceholder: "اكتب النص للحفر...", engravingNote: "حد أقصى ٢٠ حرف. متاح لبعض القطع.", submitDesign: "✦ ابعت التصميم", save: "احفظ", yourDesign: "تصميمك", estimatedPrice: "السعر التقريبي", productionTime: "وقت التصنيع", productionDays: "٥-٧ أيام عمل", free: "مجاناً", necklace: "سلسلة", bracelet: "سوار", ring: "خاتم", anklet: "خلخال", giftSet: "طقم هدية", gold: "ذهب", silver: "فضة", roseGold: "ذهب وردي", leather: "جلد", titanium: "تيتانيوم", crystal: "كريستال", classic: "كلاسيك", modern: "مودرن", bohemian: "بوهيمي", luxury: "فاخر", none: "بدون", diamond: "ألماس", sapphire: "ياقوت أزرق", ruby: "ياقوت أحمر", emerald: "زمرد", pearl: "لؤلؤ", onyx: "أونيكس", turquoise: "فيروز",
    aiDesignAssistant: "مساعد التصميم بالذكاء الاصطناعي", aiDesc: "احكي عن الاكسسوار اللي بتحلم بيه، والذكاء الاصطناعي هيحققه.", aiPlaceholder: "اكتب وصف اكسسوارك الحلم...", tryPrompts: "جرّب:", minimalistRing: "خاتم بسيط", mensBracelet: "سوار رجالي", floralEarrings: "حلقان وردية", layeredSet: "طقم متداخل", forWomen: "للستات", forMen: "للرجالة", unisex: "للجميع", anyBudget: "أي ميزانية", generateDesign: "✨ اعمل التصميم", generating: "جاري التحضير...", aiGenerated: "✦ تصميم مولد بالذكاء الاصطناعي", orderThis: "اطلب ده",
    virtualTryOnTitle: "جرب الإكسسوار افتراضياً", tryOnDesc: "شوف شكل الاكسسوارات عليك باستخدام الواقع المعزز", tapToOpen: "اضغط لفتح الكاميرا أو حمّل صورة", uploadPhoto: "ارفع صورة", tryOnPopular: "أو جرب القطع المشهورة دي:", photoPrivacy: "🔒 صورك مش هتتخزن ولا هتتشارك",
    styleSuggestions: "اقتراحات للستايل ليك", styleSuggestionsDesc: "بناء على الترندات الحالية والاختيارات المنتشرة في مصر.", eveningElegance: "أناقة المساء", eveningEleganceDesc: "سلاسل ذهبية بلمسات ياقوت — مثالية للسهرات الخاصة.", modernMasculine: "رجولة عصرية", modernMasculineDesc: "مزيج التيتانيوم والجلد — قطع جريئة للرجل العصري.", bohemianSpirit: "روح البوهيمي", bohemianSpiritDesc: "أحجار كريمة متنوعة وطبقات — فخامة حرة.", trending: "ترند", popular: "شائع", new: "جديد",
    myAccount: "حسابي", welcomeBack: "أهلاً برجوعك،", accountOverview: "نظرة عامة على حسابك مع أورا.", dashboard: "📊 لوحة التحكم", myOrders: "📦 طلباتي", wishlist: "❤️ المفضلة", myDesigns: "🎨 تصاميمي", auraPoints: "✦ نقاط أورا", addresses: "📍 العناوين", settings: "⚙️ الإعدادات", logout: "🚪 خروج", totalOrders: "إجمالي الطلبات", wishlistItems: "قطع المفضلة", savedDesigns: "تصاميم محفوظة", recentOrders: "آخر الطلبات", yourWishlist: "مفضلتك", savedDesignsTitle: "تصاميمك المحفوظة", recentlyViewed: "شوفتها من قريب", goldMember: "✦ عضو ذهبي", auraPointsProgram: "✦ برنامج نقاط أورا", pointsInfo: "نقطة — باقي ٥٠ نقطة وتاخد خصم ١٠٠ جنيه!", toNextReward: "للمكافأة الجاية", delivered: "تم التوصيل ✓", inTransit: "قيد التوصيل 🚚", orderTracking: "طلبك في الطريق!",
    specialService: "خدمة خاصة",
    aiTag: "طلب مخصص", ctaDesignTitlePart1: "نفّذ أي تصميم", ctaDesignTitlePart2: "في خيالك", ctaDesignSubtitle: "شفت صورة إكسسوار وعجبتك؟ ابعتلنا الصورة وإحنا هننفذهالك بأعلى جودة وضمان أورا 💎",
    step1Title: "ارفع الصورة", step1Desc: "لأي إكسسوار عجبك في أي مكان", step2Title: "طلب تسعير", step2Desc: "هنراجع طلبك ونرد عليك بالسعر والتفاصيل", step3Title: "استلم قطعتك 🎁", step3Desc: "مع علبة هدية فاخرة مجاناً مع كل طلب", startDesignNow: "✦ ابدأ تصميمك دلوقتي",
    loginTitle: "دخول", registerTitle: "تسجيل جديد", password: "كلمة السر", confirmPassword: "تأكيد كلمة السر", loginBtn: "دخول", registerBtn: "أنشئ حساب", noAccount: "معندكش حساب؟", hasAccount: "عندك حساب بالفعل؟", signUp: "سجّل", signIn: "ادخل",
    marquee1: "✦ شحن مجاني لما تشتري فوق ٥٠٠ جنيه", marquee2: "✦ جودة فاخرة مصنوعة بإيدينا", marquee3: "✦ تقدر ترجع خلال ١٤ يوم", marquee4: "✦ تصاميم مخصصة بالذكاء الاصطناعي", marquee5: "✦ ضمان الأصالة",
    scroll: "انزل",
    heroLabel: "أورا للإكسسوارات — أحسن اختيار فى مصر",
    // Split the "Design Your Aura" heading into separate parts for translation so we can style the word "Aura"
    designYour: "صمّم",
    auraWord: "هالتك",
    // Brand name (used in headings like "فلسفة أورا")
    brandName: "أورا",
    aboutTitle: "عن أورا", aboutSubtitle: "حكاية البراند بتاعنا.", ourMission: "مهمتنا", ourVision: "رؤيتنا", ourValues: "قيمنا",
    // New About Page Keys
    aboutLabel: "قصتنا",
    aboutSubtitle: "بدأنا من فكرة بسيطة — وشلنا عليها بجدوه حقيقية ❤️",
    storyLabel: "البداية",
    storyTitle: "بدأت من سؤال",
    storyText1: "ليه ميبقاش عندك إكسسوار باسمك أو اسم أغلى حد عندك؟",
    storyText2: "من هنا بدأنا نعمل قطع مخصصة بجودة حقيقية وشكل شيك — تخليك دايماً مميز.",
    storyText3: "هدفنا مش نبيع بس … هدفنا كل قطعة تبقى ليها معنى ❤️",
    materialsLabel: "مصادر أخلاقية",
    materialsTitle: "خامات بكل نزاهة",
    materialsText: "نؤمن أن الفخامة الحقيقية تبدأ بالمسؤولية. لذلك كل حجر كريم ومعدن نستخدمه مصدره أخلاقي ومعتمد.",
    goldSilver: "ذهب وفضة معاد تدويرها:",
    goldSilverText: "تقليل التأثير البيئي بدون التنازل عن الجودة.",
    conflictFree: "أحجار كريمة خالية من النزاعات:",
    conflictFreeText: "يتم الحصول عليها مباشرة من مناجم معتمدة.",
    veganLeather: "جلد نباتي فاخر:",
    veganLeatherText: "بدائل خالية من القسوة تبدو وتشعر بالفخامة.",
    valuesLabel: "ما نؤمن به",
    valuesTitle: "قيمنا",
    qualityFirst: "الجودة أولاً",
    qualityText: "تخضع كل قطعة لفحوصات جودة صارمة. نستخدم فقط الخامات الممتازة المصدرة بمسؤولية.",
    innovation: "الابتكار",
    innovationText: "يدفع استوديو التصميم بالذكاء الاصطناعي حدود الممكن في الإكسسوارات المخصصة.",
    sustainability: "الاستدامة",
    sustainabilityText: "التغليف الصديق للبيئة والخامات المستدامة في صميم عملنا.",
    community: "المجتمع",
    communityText: "نحن نرعى مجتمعنا من خلال المحتوى والفعاليات والروابط الحقيقية.",
    teamLabel: "فريق العمل",
    teamTitle: "عائلة أورا",
    teamName1: "ميرنا", teamRole1: "المؤسس والمدير الإبداعي", teamBio1: "الرؤية وراء مفهوم أورا، تجمع بين الفخامة والابتكار.",
    teamName2: "سارة", teamRole2: "رئيسة التصميم", teamBio2: "حرفية ماهرة مع أكثر من ١٠ سنوات من الخبرة في تصميم المجوهرات.",
    teamName3: "أحمد", teamRole3: "المسؤول التقني", teamBio3: "العقل وراء استوديو التصميم بالذكاء الاصطناعي والمنصة التقنية.",
    happyCustomers: "عملاء مبسوطين", uniqueDesigns: "تصميمات مميزة", citiesServed: "مدن نخدمها", satisfactionRate: "نسبة الرضا",
    // Home Page Additions
    heroTitle1: "حوّل اسمك", heroTitle2: "لقطعة مميزة 💎", heroSubtitle2: "سلاسل، إساور، وخواتم باسمك أو اسم أغلى حد عندك", heroBenefit: "خامات فاخرة • ضد الصدأ • ضمان 6 شهور",
    orderNow: "اطلب دلوقتي", rustFree: "ضد الصدأ لمدة سنة", material925: "فضة 925 أو دهب 21", guarantee6m: "ضمان 6 شهور", freeGift: "🎁 هدية علبة فاخرة مجاناً",
    mCustomName: "✦ إكسسوارات مخصصة بالاسم 💎", mRustFree: "✦ ضد الصدأ وتغير اللون ✔", mGuarantee: "✦ ضمان 6 شهور 🛡", mFreeShipping: "✦ شحن مجاني فوق ٥٠٠ جنيه 🚚", mFreeGift: "✦ هدية علبة فاخرة مجاناً 🎁", mNameLang: "✦ الاسم بالعربي أو الإنجليزي ✍️", mPerfectGift: "✦ هدية مثالية لكل مناسبة ❤️",
    aiTag: "بالذكاء الاصطناعي", ctaDesignTitlePart1: "صمّم إكسسوارك", ctaDesignTitlePart2: "بنفسك", ctaDesignSubtitle: "بسيط جداً — في ٣ خطوات وإحنا ننفذه ليك بجودة عالية 💎",
    step1Title: "اكتب الاسم", step1Desc: "بالعربي أو الإنجليزي أو اسمين", step2Title: "اختار الشكل", step2Desc: "سلسلة، إسوارة، أو خاتم", step3Title: "شوف التصميم فوراً", step3Desc: "وإحنا ننفذه ليك 💎", startDesignNow: "✦ ابدأ تصميمك دلوقتي",
    whyAuraTag: "ليه تختار أورا؟", whyAuraTitle1: "مش بس", whyAuraTitle2: "شكله حلو", whyAuraTitle3: "جودة حقيقية",
    realMaterials: "خامات حقيقية", realMaterialsDesc: "فضة إيطالي 925 أو طلاء دهب 21 عالي الجودة — مش مجرد طلاء عادي",
    guarantee6mTitle: "ضمان 6 شهور", guarantee6mDesc: "أي عيب صناعة؟ بنبدل فورًا بدون نقاش — ده وعدنا ليك",
    nameAnyLang: "اسمك بأي لغة", nameAnyLangDesc: "عربي، إنجليزي، اسمين مع بعض — كل قطعة بتتعمل خصيصاً ليك",
    perfectGiftTitle: "هدية مثالية", perfectGiftDesc: "عيد ميلاد، خطوبة، أو جواز — علبة هدية فاخرة مجاناً مع كل طلب",
    fastDeliveryTitle: "توصيل خلال 4-7 أيام", fastDeliveryDesc: "توصيل لكل محافظات مصر — مصاريف الشحن 55 جنيه",
    neverChanges: "طلاء ذهب/فضة", neverChangesDesc: "طلاء عالي الجودة — تلبسه كل يوم براحتك طول السنة",
    storyTag: "قصتنا", storyTitleH1: "فكرة", storyTitleH2: "بسيطة", storyTitleH3: "وبداية حقيقية",
    indexStoryP1: "أورا بدأت من سؤال بسيط: ليه ميبقاش عندك إكسسوار باسمك أو اسم أغلى حد عندك؟",
    indexStoryP2: "من هنا بدأنا نعمل قطع مخصصة بجودة حقيقية وشكل شيك. هدفنا مش نبيع بس — هدفنا كل قطعة تبقى ليها معنى ❤️",
    happyUsers: "عميل سعيد", diffDesigns: "تصميم مختلف", productGuarantee: "ضمان المنتج", readMoreAbout: "اعرف أكتر عنّا →",
    readMore: "اقرأ أكتر →", blogTitle: "مدونة أورا", blogSubtitle: "نصايح شياكة، صيحات، وكواليس.",
    orderSuccess: "تم تأكيد الطلب بنجاح!",
    orderError: "فشل إنشاء الطلب.",
    ratingSuccess: "شكراً على تقييمك!",
    ratingError: "فشل إرسال التقييم.",
    loginRequired: "سجّل دخولك أولاً.",
    loginSuccess: "أهلاً بيك!",
    registerSuccess: "تم إنشاء الحساب! أهلاً بيك في أورا.",
    invalidCredentials: "البريد أو كلمة السر غير صحيحة.",
    emailExists: "الإيميل مسجّل من قبل.",
    fillRequired: "املأ كل الحقول المطلوبة.",
    passwordsDontMatch: "كلمة السر والتأكيد مش متطابقين.",
    saveSuccess: "تم الحفظ بنجاح.",
    saveError: "حصل خطأ.",
    productNotFound: "المنتج غير موجود.",
    customization: "تخصيص",
    customText: "الاسم أو الحرف",
    charLimit: "أقصى عدد حروف",
    customQuestions: "معلومات إضافية",
    enterValue: "ادخل البيانات...",
    requiredField: "هذا الحقل مطلوب",
    letters: "حروف",
    names: "أسماء"
  }
};

function setLanguage(lang) {
  localStorage.setItem('aura_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t && t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t && t[key]) el.placeholder = t[key];
  });

  document.body.style.fontFamily = lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = lang === 'en' ? 'AR' : 'EN';

  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'shop.html') initShopFilters();
  if (page === 'product.html') initProductPage();
  if (page === 'cart.html') renderCartPage();
  if (page === 'index.html' || page === '') initHomepage();
}

// ==========================================
// Authentication
// ==========================================
const API_BASE = window.location.origin;

function getToken() { return localStorage.getItem('aura_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('aura_user')); } catch (e) { return null; } }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('aura_token', data.token);
  localStorage.setItem('aura_user', JSON.stringify(data.user));
  updateAuthUI();
  return data;
}

async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  localStorage.setItem('aura_token', data.token);
  localStorage.setItem('aura_user', JSON.stringify(data.user));
  updateAuthUI();
  return data;
}

function logoutUser() {
  localStorage.removeItem('aura_token');
  localStorage.removeItem('aura_user');
  updateAuthUI();
  window.location.href = 'account.html';
}

function updateAuthUI() {
  const user = getUser();
  document.querySelectorAll('.auth-logged-in').forEach(el => el.style.display = user ? '' : 'none');
  document.querySelectorAll('.auth-logged-out').forEach(el => el.style.display = user ? 'none' : '');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin() ? '' : 'none');
  document.querySelectorAll('.user-name-display').forEach(el => { if (user) el.textContent = user.name; });
}

function initAuthPage() {
  const authSection = document.getElementById('auth-section');
  const dashSection = document.getElementById('dashboard-section');
  if (!authSection || !dashSection) return;

  if (isLoggedIn()) {
    authSection.style.display = 'none';
    dashSection.style.display = 'block';
    const user = getUser();
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user?.name || '');
  } else {
    authSection.style.display = 'block';
    dashSection.style.display = 'none';
  }

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');

  if (showRegister) showRegister.addEventListener('click', e => { e.preventDefault(); loginForm.style.display = 'none'; registerForm.style.display = 'block'; if (loginTab) loginTab.classList.remove('active'); if (registerTab) registerTab.classList.add('active'); });
  if (showLogin) showLogin.addEventListener('click', e => { e.preventDefault(); registerForm.style.display = 'none'; loginForm.style.display = 'block'; if (registerTab) registerTab.classList.remove('active'); if (loginTab) loginTab.classList.add('active'); });
  if (loginTab) loginTab.addEventListener('click', () => { loginForm.style.display = 'block'; registerForm.style.display = 'none'; loginTab.classList.add('active'); registerTab.classList.remove('active'); });
  if (registerTab) registerTab.addEventListener('click', () => { registerForm.style.display = 'block'; loginForm.style.display = 'none'; registerTab.classList.add('active'); loginTab.classList.remove('active'); });

  if (loginForm) loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    try {
      btn.disabled = true; btn.textContent = '...';
      await loginUser(loginForm.querySelector('[name="email"]').value, loginForm.querySelector('[name="password"]').value);
      showToast(translations[document.documentElement.lang]?.loginSuccess || 'Welcome back! ✦', 'success');
      authSection.style.display = 'none'; dashSection.style.display = 'block';
      const user = getUser();
      document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user?.name || '');
    } catch (err) {
      const t = translations[document.documentElement.lang];
      const msg = (err.message && t?.invalidCredentials && err.message.toLowerCase().includes('invalid')) ? t.invalidCredentials : err.message;
      showToast(msg, 'error');
    } finally { btn.disabled = false; btn.textContent = translations[document.documentElement.lang]?.loginBtn || 'Login'; }
  });

  if (registerForm) registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type="submit"]');
    const pw = registerForm.querySelector('[name="password"]').value;
    const cpw = registerForm.querySelector('[name="confirmPassword"]').value;
    const t = translations[document.documentElement.lang];
    if (pw !== cpw) return showToast(t?.passwordsDontMatch || 'Passwords do not match', 'error');
    try {
      btn.disabled = true; btn.textContent = '...';
      await registerUser(registerForm.querySelector('[name="name"]').value, registerForm.querySelector('[name="email"]').value, pw);
      showToast(t?.registerSuccess || 'Account created! Welcome to Aura ✦', 'success');
      authSection.style.display = 'none'; dashSection.style.display = 'block';
      const user = getUser();
      document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user?.name || '');
    } catch (err) {
      const msg = (err.message && t?.emailExists && err.message.toLowerCase().includes('already')) ? t.emailExists : err.message;
      showToast(msg, 'error');
    } finally { btn.disabled = false; btn.textContent = translations[document.documentElement.lang]?.registerBtn || 'Create Account'; }
  });

  document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); logoutUser(); }));
}

// ==========================================
// API Data Loading
// ==========================================
async function loadProducts() {
  // Wait for Supabase to be ready
  if (window.__supabasePromise) await window.__supabasePromise;

  // If Supabase client is available, load products from the database.
  if (typeof window !== 'undefined' && window.fetchProductsFromDb) {
    try {
      const data = await window.fetchProductsFromDb();
      console.log('PRODUCTS LOADED:', data?.length); 
      if (Array.isArray(data)) {
        PRODUCTS.length = 0;
        data.forEach(p => PRODUCTS.push(p));
      }
      return;
    } catch (err) {
      console.error('Error loading products from Supabase', err);
    }
  }
  // Fallback to API route if defined on the server (for local development)
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (res.ok) {
      PRODUCTS.length = 0;
      const data = await res.json();
      data.forEach(p => PRODUCTS.push(p));
    }
  } catch (e) {
    console.log('Using local products data');
  }
}

async function loadBlogPosts() {
  // Try to fetch blog posts from Supabase first
  if (typeof window !== 'undefined' && window.fetchBlogPostsFromDb) {
    try {
      const data = await window.fetchBlogPostsFromDb();
      if (Array.isArray(data)) {
        BLOG_POSTS.length = 0;
        data.forEach(p => BLOG_POSTS.push(p));
      }
      return;
    } catch (err) {
      console.error('Error loading blog posts from Supabase', err);
    }
  }
  // Fallback to API route
  try {
    const res = await fetch(`${API_BASE}/api/blog`);
    if (res.ok) {
      BLOG_POSTS.length = 0;
      const data = await res.json();
      data.forEach(p => BLOG_POSTS.push(p));
    }
  } catch (e) {
    console.log('Using local blog data');
  }
}

// ==========================================
// AI Design Generation
// ==========================================
async function generateAIDesign(prompt, gender, budget) {
  const resultDiv = document.getElementById('ai-result');
  const btn = document.getElementById('ai-generate-btn');
  const lang = document.documentElement.lang || 'en';
  const t = translations[lang];

  if (!prompt) return showToast(lang === 'ar' ? 'من فضلك اوصف تصميمك' : 'Please describe your design', 'error');
  if (btn) { btn.disabled = true; btn.textContent = t.generating; }
  if (resultDiv) resultDiv.innerHTML = '<div style="text-align:center;padding:2rem;"><div class="spinner"></div></div>';

  try {
    const res = await fetch(`${API_BASE}/api/ai/design`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, gender, budget })
    });
    const design = await res.json();
    if (res.ok && resultDiv) {
      const name = lang === 'ar' ? (design.nameAr || design.name) : design.name;
      const desc = lang === 'ar' ? (design.descriptionAr || design.description) : design.description;
      const style = (design.style || design.material || '').toLowerCase();
      const match = PRODUCTS.find(p => (p.style && p.style.toLowerCase() === style) || (p.material && p.material.toLowerCase() === (design.material || '').toLowerCase()));
      const imgUrl = (design.image_url || (match && (match.images && match.images[0]) || match.image) || (PRODUCTS[0] && (PRODUCTS[0].images && PRODUCTS[0].images[0]) || PRODUCTS[0].image)) || '';
      const imgHtml = imgUrl
        ? `<div style="margin-bottom:var(--space-4); border-radius: var(--radius-lg); overflow: hidden; aspect-ratio:1; max-width:280px;"><img src="${imgUrl}" alt="${name}" style="width:100%; height:100%; object-fit:cover;"></div>`
        : `<div style="margin-bottom:var(--space-4); aspect-ratio:1; max-width:280px; background: linear-gradient(135deg, rgba(212,175,55,0.15), var(--bg-tertiary)); border-radius: var(--radius-lg); display:flex; align-items:center; justify-content:center;"><span style="font-size:4rem; color: var(--gold);">✦</span></div>`;
      resultDiv.innerHTML = `
        <div style="padding: var(--space-6); border: 1px solid var(--gold); border-radius: var(--radius-lg); background: rgba(212,175,55,0.05);">
          <h3 style="color: var(--gold); margin-bottom: var(--space-3);">${t.aiGenerated}</h3>
          ${imgHtml}
          <h4 style="font-size: var(--text-xl); margin-bottom: var(--space-2);">${name || (lang === 'ar' ? 'تصميم مخصص' : 'Custom Design')}</h4>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">${desc || ''}</p>
          <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-4);">
            ${design.material ? `<span class="tag tag-gold">${design.material}</span>` : ''}
            ${design.stone && design.stone !== 'N/A' ? `<span class="tag tag-gold">${design.stone}</span>` : ''}
            ${design.style ? `<span class="tag tag-gold">${design.style}</span>` : ''}
          </div>
          ${design.estimatedPrice ? `<p style="font-size:var(--text-2xl);color:var(--gold);font-weight:700;">EGP ${Number(design.estimatedPrice).toLocaleString()}</p>` : ''}
          ${design.demo ? `<p style="color:var(--text-secondary);margin-top:var(--space-3);font-size:var(--text-sm);">${desc}</p>` : `<button class="btn btn-primary" style="margin-top:var(--space-4);" onclick="addToCart(0)">${t.orderThis}</button>`}
        </div>`;
    } else if (!res.ok) { showToast(design.error || (lang === 'ar' ? 'فشل إنشاء التصميم' : 'AI generation failed'), 'error'); if (resultDiv) resultDiv.innerHTML = ''; }
  } catch (e) { showToast(lang === 'ar' ? 'فشل الاتصال بخدمة الذكاء الاصطناعي' : 'Failed to connect to AI service', 'error'); if (resultDiv) resultDiv.innerHTML = ''; }
  finally { if (btn) { btn.disabled = false; btn.textContent = t.generateDesign; } }
}

// ==========================================
// Initialize Language & Auth
// ==========================================

async function renderAuraFamily() {
  const container = document.getElementById('aura-family-grid');
  if (!container) return;

  try {
    const res = await fetch(`${window.location.origin}/api/settings`);
    const settings = await res.json();
    const team = settings.auraFamily || [
      { name: 'شهاب حسني', nameEn: 'Shehab Hosny', role: 'Founder & CEO', roleAr: 'المؤسس والمدير التنفيذي', initial: 'S' },
      { name: 'محمود مصطفى', nameEn: 'Mahmoud Mostafa', role: 'Head of Quality', roleAr: 'مدير الجودة', initial: 'M' }
    ];

    const lang = document.documentElement.lang || 'ar';

    container.innerHTML = team.map((m, idx) => {
      const initial = m.initial || (m.name ? m.name.charAt(0).toUpperCase() : (idx === 0 ? 'S' : 'M'));
      const displayName = lang === 'ar' ? (m.name || m.nameAr) : (m.nameEn || m.name);
      const displayRole = lang === 'ar' ? (m.roleAr || m.role) : (m.role || m.roleAr);

      return `
        <div class="glass-card reveal" style="text-align:center; padding: var(--space-8);">
          <div style="width:120px; height:120px; border-radius:50%; margin: 0 auto var(--space-4); position: relative; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border: 2px solid var(--gold);">
            ${m.image ? 
              `<img src="${m.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.outerHTML='<div style=\\'width:100%; height:100%;\\'>${initial}</div>'">` : 
              `<div style="width:100%; height:100%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color: var(--black); font-weight:700;">${initial}</div>`
            }
          </div>
          <h4 style="margin-bottom: var(--space-1); color: var(--gold);">${displayName || 'عضو فريق'}</h4>
          <p style="color: var(--text-secondary); font-size: var(--text-xs); letter-spacing:1px; text-transform:uppercase;">${displayRole || (idx === 0 ? 'المؤسس' : 'عضو الفريق')}</p>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load team:', e);
  }
}

function injectProfileIcon() {
  const navIcons = document.querySelector('.nav-icons');
  if (navIcons && !navIcons.querySelector('a[href="account.html"]')) {
     const profileBtn = document.createElement('a');
     profileBtn.href = 'account.html';
     profileBtn.className = 'nav-icon-btn';
     profileBtn.title = 'حسابي';
     profileBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`;
     navIcons.insertBefore(profileBtn, navIcons.firstChild);
  }
}

// ==========================================
// Pixel Integration (Meta & TikTok)
// ==========================================
window.AURA_SETTINGS = null;
window.AURA_PIXEL_QUEUE = window.AURA_PIXEL_QUEUE || [];

function initPixels(settings) {
  // 1. Meta Pixel
  if (settings.facebookPixelId && !window.fbq) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', settings.facebookPixelId);
    fbq('track', 'PageView');
    console.log('✦ Meta Pixel Initialized:', settings.facebookPixelId);
  }

  // 2. TikTok Pixel
  if (settings.tiktokPixelId && !window.ttq) {
    !function (w, d, t) {
      w.TiktokSdkObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "cleanCookie"];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
        }
      };
      for (var e = 0; e < ttq.methods.length; e++) ttq.setAndDefer(ttq, ttq.methods[e]);
      ttq.instance = function (t) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e
      };
      ttq._i = {};
      ttq._f = function (t) {
        return function () {
          var e = Array.prototype.slice.call(arguments, 0);
          e.push(t);
          w[t].push(e)
        }
      };
      ttq.load = function (e, n) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
        w[t]._i = w[t]._i || {};
        w[t]._i[e] = [];
        w[t]._i[e]._u = r;
        w[t]._t = w[t]._t || {};
        w[t]._t[e] = +new Date;
        w[t]._o = w[t]._o || {};
        w[t]._o[e] = n || {};
        var o = d.createElement("script");
        o.type = "text/javascript";
        o.async = !0;
        o.src = r;
        var a = d.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(o, a)
      };
    }(window, document, 'ttq');

    ttq.load(settings.tiktokPixelId);
    ttq.page();
    console.log('✦ TikTok Pixel Initialized:', settings.tiktokPixelId);
  }
}

function trackPixelEvent(name, data = {}) {
  // If settings not loaded yet, queue the event
  if (!window.AURA_SETTINGS) {
    window.AURA_PIXEL_QUEUE = window.AURA_PIXEL_QUEUE || [];
    window.AURA_PIXEL_QUEUE.push({ name, data });
    return;
  }

  // 1. Meta Pixel Event
  if (window.fbq && window.AURA_SETTINGS.facebookPixelId) {
    if (name === 'ViewContent') {
      fbq('track', 'ViewContent', {
        content_name: data.name,
        content_ids: [String(data.id)],
        content_type: 'product',
        value: Number(data.price),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'AddToCart') {
      fbq('track', 'AddToCart', {
        content_name: data.name,
        content_ids: [String(data.id)],
        content_type: 'product',
        value: Number(data.price) * (Number(data.qty) || 1),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'InitiateCheckout') {
      fbq('track', 'InitiateCheckout', {
        value: Number(data.value),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'Purchase') {
      fbq('track', 'Purchase', {
        value: Number(data.value),
        currency: data.currency || 'EGP',
        content_type: 'product',
        content_ids: data.items ? data.items.map(item => String(item.product_id || item.id)) : []
      });
    }
  }

  // 2. TikTok Pixel Event
  if (window.ttq && window.AURA_SETTINGS.tiktokPixelId) {
    if (name === 'ViewContent') {
      ttq.track('Browse', {
        contents: [{
          content_id: String(data.id),
          content_name: data.name,
          price: Number(data.price)
        }],
        value: Number(data.price),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'AddToCart') {
      ttq.track('AddToCart', {
        contents: [{
          content_id: String(data.id),
          content_name: data.name,
          price: Number(data.price),
          quantity: Number(data.qty) || 1
        }],
        value: Number(data.price) * (Number(data.qty) || 1),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'InitiateCheckout') {
      ttq.track('InitiateCheckout', {
        value: Number(data.value),
        currency: data.currency || 'EGP'
      });
    } else if (name === 'Purchase') {
      ttq.track('CompletePayment', {
        value: Number(data.value),
        currency: data.currency || 'EGP',
        contents: data.items ? data.items.map(item => ({
          content_id: String(item.product_id || item.id),
          content_name: item.name,
          price: Number(item.price),
          quantity: Number(item.qty)
        })) : []
      });
    }
  }
}

window.trackPixelEvent = trackPixelEvent;

async function applyHomepageSettings() {
  try {
    const res = await fetch(`${window.location.origin}/api/settings`);
    if (!res.ok) return;
    const s = await res.json();
    
    // Store settings globally and initialize Pixels
    window.AURA_SETTINGS = s;
    if (s.facebookPixelId || s.tiktokPixelId) {
      initPixels(s);
    }
    
    // Flush queued pixel events if any
    if (window.AURA_PIXEL_QUEUE && window.AURA_PIXEL_QUEUE.length > 0) {
      window.AURA_PIXEL_QUEUE.forEach(event => {
        trackPixelEvent(event.name, event.data);
      });
      window.AURA_PIXEL_QUEUE = [];
    }

    const lang = document.documentElement.lang || 'ar';
    
    // 1. Hero Text
    if (s.heroTitleAr || s.heroTitle) {
      const titleEl = document.querySelector('.hero-content h1');
      if (titleEl) {
        const t1 = lang === 'ar' ? (s.heroTitleAr || 'حوّل اسمك') : (s.heroTitle || 'Transform Your Name');
        const h = lang === 'ar' ? (s.heroHighlightAr || 'لقطعة مميزة') : (s.heroHighlight || 'Into A Statement');
        titleEl.innerHTML = `${t1}<br><span class="text-gold" style="position:relative;">${h} 💎</span>`;
      }
    }
    
    // 2. Homepage Images
    const imgData = s.homepageImages || {};
    const imgConfigs = [
      { id: 'hp-women1', key: 'women1' }, { id: 'hp-women2', key: 'women2' },
      { id: 'hp-men1', key: 'men1' }, { id: 'hp-men2', key: 'men2' },
      { id: 'hp-story', key: 'story' },
      { id: 'hp-insta1', key: 'insta1' }, { id: 'hp-insta2', key: 'insta2' },
      { id: 'hp-insta3', key: 'insta3' }, { id: 'hp-insta4', key: 'insta4' },
      { id: 'hp-insta5', key: 'insta5' }, { id: 'hp-insta6', key: 'insta6' }
    ];

    imgConfigs.forEach(cfg => {
      const container = document.getElementById(cfg.id);
      if (container && imgData[cfg.key]) {
        container.innerHTML = `<img src="${window.optimizeCloudinaryUrl(imgData[cfg.key], 800)}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" onerror="this.style.display='none'">`;
        container.style.background = 'none';
      }
    });
  } catch (e) { console.error('Settings error:', e); }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Core Inits
  localStorage.setItem('aura_lang', 'ar');
  setLanguage('ar');
  initPageLoader();
  initNavigation();
  initThemeToggle();
  initScrollReveal();
  initCursorGlow();
  initBackToTop();
  initAccordion();
  initChatWidget();
  initNewsletter();
  initSearch();
  initCounters();
  updateCartBadge();
  updateWishlistBadge();
  updateAuthUI();

  // Load dynamic data
  await loadProducts().catch(e => console.error(e));
  await loadBlogPosts().catch(e => console.error(e));
  renderAuraFamily();
  await applyHomepageSettings();

  // Route specific
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  if (page === 'shop.html' || page === 'shop') initShopFilters();
  if (page === 'product.html' || page === 'product') initProductPage();
  if (page === 'account.html' || page === 'account') initAuthPage();
  if (page === 'cart.html' || page === 'cart') renderCartPage();
  if (page === 'index.html' || page === 'index' || page === '' || path === '/') initHomepage();

  // Safe Loader Removal
  setTimeout(() => {
    document.querySelector('.page-loader')?.classList.add('hidden');
  }, 500);
});
