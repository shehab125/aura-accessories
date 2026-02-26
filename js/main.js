/* ============================================
   AURA ACCESSORIES — Core JavaScript
   ============================================ */

// ==========================================
// Data Store (simulated product data)
// ==========================================
const PRODUCTS = [
  { id: 1, name: "Celestial Gold Necklace", nameAr: "قلادة سيليستيال الذهبية", category: "necklaces", gender: "women", price: 850, oldPrice: 1100, material: "gold", style: "classic", color: "gold", image: "images/product-1.jpg", rating: 4.8, reviews: 124, badge: "Best Seller", occasion: "evening", dimensions: "Chain: 45cm, Pendant: 2.5cm", weight: "12g", care: "Avoid contact with perfumes. Store in the provided Aura pouch. Clean with a soft dry cloth.", story: "Inspired by the celestial patterns seen in the Egyptian night sky, this pendant captures the golden warmth of starlight. Each link is hand-polished to achieve a mirror finish.", sizes: ["40cm", "45cm", "50cm"], colors: ["Gold", "Rose Gold"], materials: ["18K Gold", "14K Gold"] },
  { id: 2, name: "Midnight Leather Bracelet", nameAr: "سوار جلد ميدنايت", category: "bracelets", gender: "men", price: 450, oldPrice: null, material: "leather", style: "modern", color: "black", image: "images/product-2.jpg", rating: 4.6, reviews: 89, badge: null, occasion: "casual", dimensions: "Width: 1.2cm, Adjustable: 18-22cm", weight: "18g", care: "Keep away from water. Apply leather conditioner monthly. Store flat in a cool, dry place.", story: "Crafted from Italian full-grain leather with a titanium clasp, the Midnight bracelet embodies understated masculine elegance.", sizes: ["S (16-18cm)", "M (18-20cm)", "L (20-22cm)"], colors: ["Black", "Brown", "Navy"], materials: ["Italian Leather"] },
  { id: 3, name: "Rose Quartz Ring", nameAr: "خاتم الكوارتز الوردي", category: "rings", gender: "women", price: 650, oldPrice: 800, material: "silver", style: "bohemian", color: "pink", image: "images/product-3.jpg", rating: 4.9, reviews: 201, badge: "New", occasion: "daily", dimensions: "Band: 3mm, Stone: 8mm", weight: "5g", care: "Remove before washing hands. Avoid harsh chemicals. Polish with a silver cloth periodically.", story: "Featuring a natural rose quartz stone — the crystal of unconditional love — set in a delicate sterling silver band with bohemian-inspired filigree details.", sizes: ["5", "6", "7", "8", "9"], colors: ["Silver/Pink", "Gold/Pink"], materials: ["Sterling Silver", "14K Gold"] },
  { id: 4, name: "Titanium Chain Bracelet", nameAr: "سوار سلسلة تيتانيوم", category: "bracelets", gender: "men", price: 550, oldPrice: null, material: "titanium", style: "modern", color: "silver", image: "images/product-4.jpg", rating: 4.7, reviews: 67, badge: null, occasion: "daily", dimensions: "Width: 0.8cm, Length: 20cm", weight: "22g", care: "Titanium is hypoallergenic and water-resistant. Wipe with a damp cloth. Extremely durable.", story: "Forged from aerospace-grade titanium, this chain bracelet combines industrial strength with refined design. Virtually indestructible yet featherlight.", sizes: ["18cm", "20cm", "22cm"], colors: ["Silver", "Black", "Gunmetal"], materials: ["Grade 5 Titanium"] },
  { id: 5, name: "Pearl Drop Earrings", nameAr: "أقراط لؤلؤ متدلية", category: "earrings", gender: "women", price: 720, oldPrice: 950, material: "gold", style: "classic", color: "white", image: "images/product-5.jpg", rating: 4.8, reviews: 156, badge: "Best Seller", occasion: "evening", dimensions: "Drop: 3.5cm, Pearl: 10mm", weight: "6g (pair)", care: "Pearls are delicate — put on last, take off first. Store separately. Wipe with a soft damp cloth.", story: "Genuine freshwater pearls suspended from 18K gold hooks. The classic teardrop shape catches the light beautifully, making these perfect for special evenings.", sizes: ["One Size"], colors: ["White/Gold", "Cream/Gold", "White/Silver"], materials: ["18K Gold + Freshwater Pearl"] },
  { id: 6, name: "Onyx Signet Ring", nameAr: "خاتم أونيكس سيجنت", category: "rings", gender: "men", price: 780, oldPrice: null, material: "silver", style: "classic", color: "black", image: "images/product-6.jpg", rating: 4.5, reviews: 45, badge: "New", occasion: "formal", dimensions: "Face: 14mm x 12mm, Band: 4mm", weight: "15g", care: "Clean with warm soapy water. Avoid abrasive cleaners. The onyx stone should be stored away from direct sunlight.", story: "A modern take on the traditional signet ring. The deep black onyx centerpiece is hand-set in brushed sterling silver, creating a bold yet sophisticated statement.", sizes: ["8", "9", "10", "11", "12"], colors: ["Silver/Black", "Gold/Black"], materials: ["Sterling Silver", "18K Gold"] },
  { id: 7, name: "Diamond Aura Pendant", nameAr: "قلادة أورا الماسية", category: "necklaces", gender: "women", price: 1200, oldPrice: 1500, material: "gold", style: "luxury", color: "gold", image: "images/product-7.jpg", rating: 5.0, reviews: 312, badge: "Exclusive", occasion: "evening", dimensions: "Chain: 42cm, Pendant: 1.8cm", weight: "8g", care: "Clean with a professional jewelry cleaner. Store in the velvet box provided. Avoid impact.", story: "Our signature piece. A brilliant-cut diamond (0.25ct, VS clarity) is held in a custom Aura-designed setting that creates a halo of light around the stone.", sizes: ["40cm", "42cm", "45cm"], colors: ["Gold", "White Gold", "Rose Gold"], materials: ["18K Gold + Natural Diamond"] },
  { id: 8, name: "Woven Steel Cuff", nameAr: "سوار فولاذ منسوج", category: "bracelets", gender: "men", price: 380, oldPrice: 500, material: "steel", style: "modern", color: "silver", image: "images/product-8.jpg", rating: 4.4, reviews: 33, badge: null, occasion: "casual", dimensions: "Width: 1.5cm, Inner diameter: 6.5cm", weight: "35g", care: "Stainless steel is low-maintenance. Wipe with a dry cloth. Water-safe for everyday wear.", story: "Intricately woven stainless steel cables create a textured surface that catches light from every angle. The magnetic clasp ensures easy on/off.", sizes: ["S", "M", "L"], colors: ["Silver", "Black", "Gold"], materials: ["316L Stainless Steel"] },
  { id: 9, name: "Sapphire Halo Ring", nameAr: "خاتم هالو الياقوت", category: "rings", gender: "women", price: 1450, oldPrice: null, material: "gold", style: "luxury", color: "blue", image: "images/product-9.jpg", rating: 4.9, reviews: 178, badge: "Exclusive", occasion: "evening", dimensions: "Stone: 6mm, Band: 2mm, Halo: 10mm", weight: "4g", care: "Sapphires are durable. Clean with warm soapy water. Annual professional inspection recommended.", story: "A vivid blue Ceylon sapphire surrounded by a halo of micro-pavé diamonds, set in 18K gold. This ring is inspired by the deep blue of the Mediterranean.", sizes: ["5", "6", "7", "8"], colors: ["Gold/Blue", "White Gold/Blue"], materials: ["18K Gold + Ceylon Sapphire"] },
  { id: 10, name: "Carbon Fiber Necklace", nameAr: "قلادة كربون فايبر", category: "necklaces", gender: "men", price: 620, oldPrice: 750, material: "carbon", style: "modern", color: "black", image: "images/product-10.jpg", rating: 4.6, reviews: 55, badge: null, occasion: "casual", dimensions: "Chain: 55cm, Pendant: 3cm x 2cm", weight: "14g", care: "Carbon fiber is extremely durable. Clean with a microfiber cloth. Avoid bending the pendant.", story: "A fusion of motorsport engineering and jewelry design. The carbon fiber pendant features a real woven carbon pattern with a stainless steel frame.", sizes: ["50cm", "55cm", "60cm"], colors: ["Black/Silver", "Black/Gold"], materials: ["Carbon Fiber + Stainless Steel"] },
  { id: 11, name: "Crystal Aurora Earrings", nameAr: "أقراط كريستال أورورا", category: "earrings", gender: "women", price: 580, oldPrice: null, material: "crystal", style: "bohemian", color: "multicolor", image: "images/product-11.jpg", rating: 4.7, reviews: 92, badge: "New", occasion: "daily", dimensions: "Drop: 2.8cm, Crystal: 6mm", weight: "4g (pair)", care: "Crystals are fragile — handle with care. Store individually. Clean gently with a soft cloth.", story: "Swarovski crystals cut to catch and refract light like the Aurora Borealis. Each earring displays a mesmerizing rainbow effect as light hits the facets.", sizes: ["One Size"], colors: ["Aurora", "Clear", "Rose"], materials: ["Sterling Silver + Swarovski Crystal"] },
  { id: 12, name: "Leather Wrap Bracelet", nameAr: "سوار جلدي ملفوف", category: "bracelets", gender: "men", price: 320, oldPrice: 400, material: "leather", style: "bohemian", color: "brown", image: "images/product-12.jpg", rating: 4.3, reviews: 28, badge: null, occasion: "casual", dimensions: "Width: 2cm, Wraps: 3x around wrist", weight: "20g", care: "Natural leather ages beautifully. Keep dry. Condition every 2-3 months with leather balm.", story: "Triple-wrapped vegetable-tanned leather with hand-stamped brass studs. This bracelet develops a unique patina over time, becoming truly yours.", sizes: ["S", "M", "L"], colors: ["Brown", "Tan", "Black"], materials: ["Vegetable-Tanned Leather"] },
];

const BLOG_POSTS = [
  { id: 1, title: "Top 10 Accessory Trends for 2026", titleAr: "أبرز 10 صيحات إكسسوارات لعام 2026", category: "Trends", date: "Feb 10, 2026", image: "images/blog-1.jpg", excerpt: "Discover the hottest accessory trends that are defining this year's fashion landscape." },
  { id: 2, title: "How to Care for Your Gold Jewelry", titleAr: "كيف تعتني بمجوهراتك الذهبية", category: "Care Guide", date: "Feb 5, 2026", image: "images/blog-2.jpg", excerpt: "Expert tips to keep your gold pieces looking brand new for years to come." },
  { id: 3, title: "Men's Accessories: A Complete Guide", titleAr: "إكسسوارات الرجال: دليل شامل", category: "Men's Style", date: "Jan 28, 2026", image: "images/blog-3.jpg", excerpt: "Everything you need to know about choosing the right accessories for any occasion." },
  { id: 4, title: "The Art of Layering Necklaces", titleAr: "فن تنسيق القلادات", category: "Style Tips", date: "Jan 20, 2026", image: "images/blog-4.jpg", excerpt: "Master the art of layering necklaces like a fashion pro with our easy guide." },
];

// ==========================================
// Supabase initialization
// ==========================================
// Dynamically import the Supabase client module. This allows the rest of
// the script to access the database functions (fetchProducts, etc.)
// without requiring the HTML pages to set `type="module"` on the script
// tag. The imported functions are attached to the global `window` object
// once loaded, so other functions in this file can reference them.
(function initSupabaseClient() {
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
    }).catch((err) => {
      console.warn('Supabase client failed to load:', err);
    });
  }
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
  const price = product.price;
  const image = (product.images && product.images[0]) || product.image;

  const existing = cart.find(item => item.id === id || String(item.id) === String(id));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, image, qty });
  }
  saveCart();
  const msg = document.documentElement.lang === 'ar' ? 'تمت الإضافة للسلة!' : `${name} added to cart!`;
  showToast(msg, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart();
  renderCartPage && renderCartPage();
}

function updateCartQty(productId, qty) {
  const item = cart.find(i => String(i.id) === String(productId));
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
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.push(productId);
    showToast('Added to wishlist ❤', 'success');
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
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
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
        if (isUser) {
          wrapper.innerHTML = `<div style="background: var(--bg-secondary); border-radius: var(--radius-md); padding: var(--space-4); margin-left:auto; max-width:80%;"><p style="font-size: var(--text-sm); color: var(--text-primary);">${text}</p></div>`;
        } else {
          wrapper.innerHTML = `<div style="background: rgba(212,175,55,0.1); border-left:3px solid var(--gold); border-radius: var(--radius-md); padding: var(--space-4); max-width:80%;"><p style="font-size: var(--text-sm); color: var(--text-primary);">${text}</p></div>`;
        }
        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
        return wrapper;
      };

      async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        // append user message
        appendMessage(text, true);
        input.value = '';
        // append placeholder for bot reply
        const botWrapper = appendMessage('...');
        try {
          const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          });
          const data = await res.json();
          const reply = data.reply || data.response || '...';
          botWrapper.innerHTML = `<div style="background: rgba(212,175,55,0.1); border-left:3px solid var(--gold); border-radius: var(--radius-md); padding: var(--space-4); max-width:80%;"><p style="font-size: var(--text-sm); color: var(--text-primary);">${reply}</p></div>`;
        } catch (err) {
          botWrapper.innerHTML = `<div style="background: rgba(212,175,55,0.1); border-left:3px solid var(--gold); border-radius: var(--radius-md); padding: var(--space-4); max-width:80%;"><p style="font-size: var(--text-sm); color: var(--text-primary);">Sorry, something went wrong.</p></div>`;
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
  const name = lang === 'ar' ? product.nameAr : product.name;
  const addToCartText = translations[lang].addToCart;
  const viewText = translations[lang].view;

  // Determine which image to display: prefer the first in the images array, then fallback to the single image property
  const imgSrc = product.images && product.images.length ? product.images[0] : product.image;
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius: inherit;">`
    : `<div style="${imgStyle} width:100%; aspect-ratio:1;">✦</div>`;

  return `
    <div class="product-card reveal" data-product-id="${product.id}" data-gender="${product.gender}" data-category="${product.category}" data-material="${product.material}" data-style="${product.style}" data-price="${product.price}">
      <div class="product-card-image">
        ${imgHtml}
        ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
        <button class="product-wishlist ${isWished ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <div class="product-card-overlay">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart(${product.id})">${addToCartText}</button>
          <a href="product.html?id=${product.id}" class="btn btn-outline btn-sm">${viewText}</a>
        </div>
      </div>
      <div class="product-card-info">
        <span class="product-card-category">${getLabel(product.category)}</span>
        <h4 class="product-card-name">${name}</h4>
        <div class="product-card-price">
          EGP ${product.price.toLocaleString()}
          ${product.oldPrice ? `<span class="old-price">EGP ${product.oldPrice.toLocaleString()}</span>` : ''}
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

  const filterGender = document.querySelectorAll('[data-filter-gender]');
  const filterCategory = document.querySelectorAll('[data-filter-category]');
  const filterMaterial = document.querySelectorAll('[data-filter-material]');
  const sortSelect = document.getElementById('sort-select');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');

  function applyFilters() {
    let filtered = [...PRODUCTS];

    // Gender filter
    const activeGender = document.querySelector('[data-filter-gender].active');
    if (activeGender && activeGender.dataset.filterGender !== 'all') {
      filtered = filtered.filter(p => p.gender === activeGender.dataset.filterGender);
    }

    // Category filter
    const activeCategory = document.querySelector('[data-filter-category].active');
    if (activeCategory && activeCategory.dataset.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory.dataset.filterCategory);
    }

    // Material filter
    const checkedMaterials = [...document.querySelectorAll('[data-filter-material]:checked')].map(el => el.dataset.filterMaterial);
    if (checkedMaterials.length > 0) {
      filtered = filtered.filter(p => checkedMaterials.includes(p.material));
    }

    // Color filter
    const checkedColors = [...document.querySelectorAll('[data-filter-color]:checked')].map(el => el.dataset.filterColor);
    if (checkedColors.length > 0) {
      filtered = filtered.filter(p => checkedColors.includes(p.color));
    }

    // Style filter
    const checkedStyles = [...document.querySelectorAll('[data-filter-style]:checked')].map(el => el.dataset.filterStyle);
    if (checkedStyles.length > 0) {
      filtered = filtered.filter(p => checkedStyles.includes(p.style));
    }

    // Occasion filter
    const checkedOccasions = [...document.querySelectorAll('[data-filter-occasion]:checked')].map(el => el.dataset.filterOccasion);
    if (checkedOccasions.length > 0) {
      filtered = filtered.filter(p => checkedOccasions.includes(p.occasion));
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

    grid.innerHTML = filtered.length
      ? filtered.map(createProductCard).join('')
      : '<div class="text-center" style="grid-column:1/-1; padding: 4rem;"><h3 style="color:var(--gold);">No products found</h3><p style="color:var(--text-secondary); margin-top:1rem;">Try adjusting your filters</p></div>';

    initScrollReveal();
  }

  // Tab-style filters
  filterGender.forEach(btn => {
    btn.addEventListener('click', () => {
      filterGender.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  filterCategory.forEach(btn => {
    btn.addEventListener('click', () => {
      filterCategory.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Checkbox filters (material, color, style, occasion)
  document.querySelectorAll('[data-filter-material], [data-filter-color], [data-filter-style], [data-filter-occasion]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

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
  // Featured products
  const featuredGrid = document.getElementById('featured-products');
  if (featuredGrid) {
    const featured = PRODUCTS.filter(p => p.badge).slice(0, 4);
    featuredGrid.innerHTML = featured.map(createProductCard).join('');
  }

  // Collection women
  const womenGrid = document.getElementById('women-products');
  if (womenGrid) {
    const women = PRODUCTS.filter(p => p.gender === 'women').slice(0, 4);
    womenGrid.innerHTML = women.map(createProductCard).join('');
  }

  // Collection men
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

// Load homepage images from admin settings
async function initHomepageImages() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) return;
    const settings = await res.json();
    const imgs = settings.homepageImages;
    if (!imgs) return;
    const slots = ['women1', 'women2', 'men1', 'men2', 'story', 'insta1', 'insta2', 'insta3', 'insta4', 'insta5', 'insta6'];
    slots.forEach(key => {
      if (imgs[key]) {
        const el = document.getElementById('hp-' + key);
        if (el) {
          el.innerHTML = `<img src="${imgs[key]}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
        }
      }
    });
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

  const lang = document.documentElement.lang || 'en';
  const t = translations[lang];
  const name = lang === 'ar' ? (product.name_ar || product.nameAr || product.name) : (product.name || product.name_ar);

  document.title = `${name} — Aura Accessories`;

  const sizeOptions = (product.sizes || []).map((s, i) => `<button class="size-option ${i === 0 ? 'active' : ''}" onclick="document.querySelectorAll('.size-option').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${s}</button>`).join('');
  const colorOptions = (product.colors || []).map((c, i) => `<button class="color-option ${i === 0 ? 'active' : ''}" onclick="document.querySelectorAll('.color-option').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${c}</button>`).join('');
  const matOptions = (product.materials || []).map((m, i) => `<button class="material-option category-tab ${i === 0 ? 'active' : ''}" style="font-size:var(--text-xs);" onclick="document.querySelectorAll('.material-option').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${m}</button>`).join('');

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out ${name} from Aura Accessories!`);

  // Build image gallery HTML dynamically based on product images (from Supabase or API).
  const images = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
  const mainImageHtml = images.length
    ? `<img src="${images[0]}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`
    : `<span style="font-size:5rem; color: var(--gold);">✦</span>`;
  const badgeHtml = product.badge ? `<span class="product-card-badge" style="position:absolute;top:var(--space-4);left:var(--space-4);">${product.badge}</span>` : '';
  const thumbHtml = images.length
    ? images.map((src, i) => `<div style="flex:1; aspect-ratio:1; border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow:hidden; cursor:pointer; display:flex; align-items:center; justify-content:center;" class="hover-lift" onclick="changeMainImage(${i})"><img src="${src}" alt="thumb" style="width:100%; height:100%; object-fit:cover;"></div>`).join('')
    : [1, 2, 3, 4].map(() => `<div style="flex:1; aspect-ratio:1; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius: var(--radius-md); border: 1px solid var(--border-color); display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:var(--gold);">✦</span></div>`).join('');
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
          <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4);">Lifestyle Gallery</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
            <div style="aspect-ratio:16/10; background: linear-gradient(135deg, rgba(212,175,55,0.08), #1a1a1a); border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; position:relative;"><span style="color:var(--gold);font-size:2rem;">✦</span><span style="position:absolute;bottom:var(--space-2);left:var(--space-3);font-size:var(--text-xs);color:var(--text-secondary);">Styled Look</span></div>
            <div style="aspect-ratio:16/10; background: linear-gradient(135deg, rgba(183,110,121,0.08), #1a1a1a); border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; position:relative;"><span style="color:var(--rose-gold);font-size:2rem;">✦</span><span style="position:absolute;bottom:var(--space-2);left:var(--space-3);font-size:var(--text-xs);color:var(--text-secondary);">Detail Shot</span></div>
          </div>
        </div>
      </div>
      <div class="product-info" style="display:flex; flex-direction:column; gap: var(--space-5);">
        <div>
          <span class="product-card-category">${getLabel(product.category)} · ${product.gender === 'women' ? t.womenCollection : t.menCollection}</span>
          <h1 style="font-size: var(--text-4xl); margin-top: var(--space-2);">${name}</h1>
          <p style="font-family: var(--font-arabic); color: var(--text-secondary); font-size: var(--text-lg);">${product.nameAr}</p>
        </div>
        <div class="product-card-rating" style="font-size: var(--text-base);">
          ${renderStars(product.rating)}
          <span style="color: var(--text-secondary); margin-left: 8px;">${product.rating} (${product.reviews} reviews)</span>
        </div>
        <div style="display:flex; align-items:baseline; gap: var(--space-4);">
          <span style="font-size: var(--text-3xl); font-weight:700; color: var(--gold);">EGP ${product.price.toLocaleString()}</span>
          ${product.oldPrice ? `<span style="font-size: var(--text-xl); color: var(--text-secondary); text-decoration: line-through;">EGP ${product.oldPrice.toLocaleString()}</span>` : ''}
          ${product.oldPrice ? `<span class="tag tag-gold">${Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span>` : ''}
        </div>

        <!-- Product Story -->
        <div class="glass-card" style="padding: var(--space-5); border-left: 3px solid var(--gold);">
          <h4 style="font-size:var(--text-sm); color:var(--gold); margin-bottom:var(--space-2);">✦ The Story</h4>
          <p style="color: var(--text-secondary); line-height:1.8; font-size:var(--text-sm);">${product.story || ''}</p>
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

        <!-- Material Selector -->
        ${matOptions ? `<div>
          <label class="form-label">${t.material}</label>
          <div style="display:flex; gap: var(--space-2); flex-wrap:wrap;">${matOptions}</div>
        </div>` : ''}

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
          <button class="nav-icon-btn" title="Copy Link" style="color:var(--text-secondary);" onclick="navigator.clipboard.writeText(window.location.href);showToast('Link copied! 📋','success')">
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
            <div style="font-size:var(--text-sm);"><span style="color:var(--text-secondary);">${t.occasion}:</span><br><strong>${product.occasion ? product.occasion.charAt(0).toUpperCase() + product.occasion.slice(1) : 'Everyday'}</strong></div>
          </div>
        </div>

        <!-- Care Instructions -->
        <div style="padding:var(--space-4); background:rgba(212,175,55,0.05); border-radius:var(--radius-md); border:1px solid rgba(212,175,55,0.15);">
          <h4 style="font-size:var(--text-sm); color:var(--gold); margin-bottom:var(--space-2);">🛡 ${t.careInstructions}</h4>
          <p style="font-size:var(--text-sm); color:var(--text-secondary); line-height:1.7;">${product.care || 'Handle with care. Store in a cool, dry place.'}</p>
        </div>

        <div style="display:flex; gap: var(--space-6); padding: var(--space-4) 0; color: var(--text-secondary); font-size: var(--text-sm);">
          <span>🚚 Free shipping over EGP 500</span>
          <span>↩ 14-day returns</span>
          <span>✓ Authentic guarantee</span>
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
      imgContainer.innerHTML = `<img src="${src}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`;
      if (product.badge) {
        imgContainer.innerHTML += `<span class="product-card-badge" style="position:absolute;top:var(--space-4);left:var(--space-4);">${product.badge}</span>`;
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
        <p style="color: var(--gold); font-weight:600; margin-top: var(--space-1);">EGP ${item.price.toLocaleString()}</p>
      </div>
      <div class="qty-selector">
        <button onclick="updateCartQty('${item.id}', ${item.qty - 1})">−</button>
        <input type="number" value="${item.qty}" readonly>
        <button onclick="updateCartQty('${item.id}', ${item.qty + 1})">+</button>
      </div>
      <div style="min-width:100px; text-align:right;">
        <strong style="color: var(--gold);">EGP ${(item.price * item.qty).toLocaleString()}</strong>
      </div>
      <button class="nav-icon-btn" onclick="removeFromCart('${item.id}')" title="${t.remove}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  `;
  }).join('');

  const total = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = `EGP ${total.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `EGP ${(total + 50).toLocaleString()}`; // +50 shipping
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
      showToast('Welcome to the Aura family! ✦', 'success');
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
      searchResults.innerHTML = '<div style="padding:1rem; color:var(--text-secondary);">No results found</div>';
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

// ==========================================
// Init on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
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

  // Page-specific inits
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') initHomepage();
  if (page === 'shop.html') initShopFilters();
  if (page === 'product.html') initProductPage();
  if (page === 'cart.html') renderCartPage();
});

/* Translation System */
const translations = {
  en: {
    home: "Home", shop: "Shop", design: "Design Your Aura", journal: "Journal", about: "About", contact: "Contact", cart: "Cart", login: "Account", heroTitle: "Discover Your", heroHighlight: "Aura", heroSubtitle: "Handcrafted luxury accessories that define your unique style.", exploreShop: "Explore Shop", designYourOwn: "Design Your Own", featuredCollections: "Featured Collections", curatedForYou: "Curated For You", featuredSubtitle: "Our most coveted pieces, handpicked by our style experts — for both men and women.", necklaces: "Necklaces", necklacesCount: "128 Products", rings: "Rings", ringsCount: "96 Products", earrings: "Earrings", earringsCount: "152 Products", bracelets: "Bracelets", braceletsCount: "110 Products", womenCollection: "Women", menCollection: "Men", shopWomen: "Shop Women", shopMen: "Shop Men", viewAll: "All", viewAllCollections: "View All Collections →",
    // Shop page
    shopHeaderLabel: "Our Collection",
    shopTitle: "Shop Accessories",
    shopSubtitle: "Explore our curated collection of premium accessories for men and women.",
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
    productNotFound: "Product not found."
  },
  ar: {
    home: "الرئيسية", shop: "المحل", design: "صمّم اكسسوارك", journal: "المدونة", about: "عنّا", contact: "كلمنا", cart: "عربة التسوق", login: "حسابي", heroTitle: "إكتشف", heroHighlight: "هالتك", heroSubtitle: "اكسسوارات فاخرة ومصنوعة بإيدينا بتبرز ستايلك المميز.", exploreShop: "خد لك لفة فى المحل", designYourOwn: "صمّم على ذوقك", featuredCollections: "مجموعات مميزة", curatedForYou: "مخصوصة ليك", featuredSubtitle: "أحلى قطع عندنا، مختارة بعناية من خبراء الشياكة - للرجالة والستات.", necklaces: "سلاسل", necklacesCount: "١٢٨ قطعة", rings: "خواتم", ringsCount: "٩٦ قطعة", earrings: "حلقان", earringsCount: "١٥٢ قطعة", bracelets: "اساور", braceletsCount: "١١٠ قطعة", womenCollection: "حريمي", menCollection: "رجالي", shopWomen: "تسوق حريمي", shopMen: "تسوق رجالي", viewAll: "الكل", viewAllCollections: "شوف كل المجموعات →",
    // Shop page
    shopHeaderLabel: "تشكيلتنا",
    shopTitle: "تسوق اكسسوارات",
    shopSubtitle: "استكشف تشكيلتنا المختارة من اكسسوارات فاخرة للرجالة والستات.",
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
    footerText: "اكسسوارات فاخرة ومصنوعة بإيدينا للرجالة والستات.", company: "الشركة", legal: "القانون", privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", faq: "الأسئلة المتكررة", rightsReserved: "© ٢٠٢٦ أورا للإكسسوارات. كل الحقوق محفوظة.",
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
    productNotFound: "المنتج غير موجود."
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
  // If Supabase client is available, load products from the database.
  if (typeof window !== 'undefined' && window.fetchProductsFromDb) {
    try {
      const data = await window.fetchProductsFromDb();
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

  if (!prompt) return showToast('Please describe your design', 'error');
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
          <h4 style="font-size: var(--text-xl); margin-bottom: var(--space-2);">${name || 'Custom Design'}</h4>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">${desc || ''}</p>
          <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-4);">
            ${design.material ? `<span class="tag tag-gold">${design.material}</span>` : ''}
            ${design.stone && design.stone !== 'N/A' ? `<span class="tag tag-gold">${design.stone}</span>` : ''}
            ${design.style ? `<span class="tag tag-gold">${design.style}</span>` : ''}
          </div>
          ${design.estimatedPrice ? `<p style="font-size:var(--text-2xl);color:var(--gold);font-weight:700;">EGP ${Number(design.estimatedPrice).toLocaleString()}</p>` : ''}
          ${design.demo ? `<p style="color:var(--text-secondary);margin-top:var(--space-3);font-size:var(--text-sm);">${desc}</p>` : `<button class="btn btn-primary" style="margin-top:var(--space-4);" onclick="addToCart(0)">${t.orderThis}</button>`}
        </div>`;
    } else if (!res.ok) { showToast(design.error || 'AI generation failed', 'error'); if (resultDiv) resultDiv.innerHTML = ''; }
  } catch (e) { showToast('Failed to connect to AI service', 'error'); if (resultDiv) resultDiv.innerHTML = ''; }
  finally { if (btn) { btn.disabled = false; btn.textContent = t.generateDesign; } }
}

// ==========================================
// Initialize Language & Auth
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  const savedLang = localStorage.getItem('aura_lang') || 'en';
  setLanguage(savedLang);

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    const newBtn = langBtn.cloneNode(true);
    langBtn.parentNode.replaceChild(newBtn, langBtn);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage(document.documentElement.lang === 'en' ? 'ar' : 'en');
    });
  }

  // Load dynamic data from API
  await loadProducts();
  await loadBlogPosts();

  // Re-init page after data load
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'shop.html') initShopFilters();
  if (page === 'product.html') initProductPage();
  if (page === 'index.html' || page === '') initHomepage();
  if (page === 'account.html') initAuthPage();

  // Update auth UI
  updateAuthUI();
});

