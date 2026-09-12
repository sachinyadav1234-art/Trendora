/**
 * Trendora Core JavaScript - Complete Suite Engine
 */

document.addEventListener('DOMContentLoaded', function () {
  trendoraInitTheme();
  trendoraInitCartDrawer();
  trendoraInitPredictiveSearch();
  trendoraInitBackToTop();
  trendoraInitStickyCart();
});

/* ==========================================
 * 1. Dark Mode Theme Engine
 * ========================================== */
function trendoraInitTheme() {
  const savedTheme = localStorage.getItem('trendora_theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark-theme');
  }
}

function trendoraToggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark-theme');
  localStorage.setItem('trendora_theme', isDark ? 'dark' : 'light');
}

/* ==========================================
 * 2. Ajax Cart Drawer Engine
 * ========================================== */
function trendoraInitCartDrawer() {
  // Intercept standard Add-to-Cart forms across the site
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form && form.action && form.action.includes('/cart/add')) {
      e.preventDefault();
      const formData = new FormData(form);

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          alert('Could not add item to cart: ' + (data.description || 'Error'));
        } else {
          trendoraRefreshCartDrawer(true);
        }
      })
      .catch(err => console.error('Error adding to cart:', err));
    }
  });
}

function trendoraOpenCartDrawer() {
  const drawer = document.getElementById('trendoraCartDrawer');
  const overlay = document.getElementById('trendoraDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
  }
}

function trendoraCloseCartDrawer() {
  const drawer = document.getElementById('trendoraCartDrawer');
  const overlay = document.getElementById('trendoraDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
  }
}

function trendoraAddToCart(variantId, quantity = 1) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: quantity })
  })
  .then(res => res.json())
  .then(data => {
    trendoraRefreshCartDrawer(true);
  })
  .catch(err => console.error('Add to cart failed:', err));
}

function trendoraUpdateCartItem(key, quantity) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: quantity })
  })
  .then(res => res.json())
  .then(cart => {
    trendoraRefreshCartDrawer(false);
  })
  .catch(err => console.error('Update item failed:', err));
}

function trendoraSaveCartNote(note) {
  fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: note })
  });
}

function trendoraFormatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function trendoraRefreshCartDrawer(openAfterRefresh = false) {
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      // Update badge counts
      const counts = document.querySelectorAll('#trendoraCartCount, #trendoraDrawerCount');
      counts.forEach(el => {
        el.textContent = cart.item_count;
        if (el.id === 'trendoraCartCount') {
          if (cart.item_count > 0) {
            el.classList.remove('trendora-cart-count--hidden');
          } else {
            el.classList.add('trendora-cart-count--hidden');
          }
        }
      });

      // Update Body & Items
      const body = document.getElementById('trendoraDrawerBody');
      const footer = document.getElementById('trendoraDrawerFooter');
      const subtotal = document.getElementById('trendoraDrawerSubtotalPrice');

      if (subtotal) {
        subtotal.innerHTML = '<strong>' + trendoraFormatMoney(cart.total_price) + '</strong>';
      }

      if (cart.item_count === 0) {
        if (body) {
          body.innerHTML = `
            <div class="trendora-cart-drawer__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p>Your shopping cart is empty.</p>
              <a href="/collections/all" class="trendora-btn trendora-btn--primary">Start Shopping</a>
            </div>`;
        }
        if (footer) footer.style.display = 'none';
      } else {
        if (footer) footer.style.display = 'block';

        let itemsHtml = '<div class="trendora-drawer-items">';
        cart.items.forEach(item => {
          itemsHtml += `
            <div class="trendora-drawer-item" data-key="${item.key}">
              <a href="${item.url}" class="trendora-drawer-item__image">
                ${item.image ? `<img src="${item.image}" alt="${item.title}">` : `<div class="trendora-drawer-item__placeholder"></div>`}
              </a>
              <div class="trendora-drawer-item__details">
                <a href="${item.url}" class="trendora-drawer-item__title">${item.product_title}</a>
                ${item.variant_title ? `<p class="trendora-drawer-item__variant">${item.variant_title}</p>` : ''}
                <div class="trendora-drawer-item__price">${trendoraFormatMoney(item.final_line_price)}</div>
                <div class="trendora-drawer-item__actions">
                  <div class="trendora-qty-selector">
                    <button type="button" class="trendora-qty-btn" onclick="trendoraUpdateCartItem('${item.key}', ${item.quantity - 1})">-</button>
                    <span class="trendora-qty-val">${item.quantity}</span>
                    <button type="button" class="trendora-qty-btn" onclick="trendoraUpdateCartItem('${item.key}', ${item.quantity + 1})">+</button>
                  </div>
                  <button type="button" class="trendora-drawer-item__remove" onclick="trendoraUpdateCartItem('${item.key}', 0)">Remove</button>
                </div>
              </div>
            </div>`;
        });
        itemsHtml += '</div>';

        if (body) body.innerHTML = itemsHtml;
      }

      // Update Shipping Bar
      const shippingContainer = document.getElementById('trendoraShippingBarContainer');
      if (shippingContainer) {
        const threshold = 10000; // $100 in cents
        if (cart.total_price >= threshold) {
          shippingContainer.innerHTML = `
            <p class="trendora-shipping-bar__message trendora-shipping-bar__message--unlocked">
              🎉 Congratulations! You unlocked <strong>Free Shipping</strong>!
            </p>
            <div class="trendora-shipping-bar__track">
              <div class="trendora-shipping-bar__progress" style="width: 100%;"></div>
            </div>`;
        } else {
          const remaining = threshold - cart.total_price;
          const percentage = (cart.total_price / threshold) * 100;
          shippingContainer.innerHTML = `
            <p class="trendora-shipping-bar__message">
              Add <strong>${trendoraFormatMoney(remaining)}</strong> more to enjoy <strong>Free Shipping</strong>!
            </p>
            <div class="trendora-shipping-bar__track">
              <div class="trendora-shipping-bar__progress" style="width: ${percentage}%;"></div>
            </div>`;
        }
      }

      if (openAfterRefresh) {
        trendoraOpenCartDrawer();
      }
    });
}

/* ==========================================
 * 3. Predictive Search Engine
 * ========================================== */
let trendoraSearchDebounceTimer;

function trendoraInitPredictiveSearch() {
  const searchInput = document.getElementById('trendoraSearchInput');
  const resultsContainer = document.getElementById('trendoraPredictiveResults');

  if (!searchInput || !resultsContainer) return;

  searchInput.addEventListener('input', function () {
    const query = this.value.trim();
    clearTimeout(trendoraSearchDebounceTimer);

    if (query.length < 2) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
      return;
    }

    trendoraSearchDebounceTimer = setTimeout(() => {
      fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
        .then(res => res.json())
        .then(data => {
          const products = data.resources.results.products;
          if (products && products.length > 0) {
            let html = '<div class="trendora-predictive-list">';
            products.forEach(prod => {
              html += `
                <a href="${prod.url}" class="trendora-predictive-item">
                  <img src="${prod.image}" alt="${prod.title}">
                  <div class="trendora-predictive-item__info">
                    <div class="trendora-predictive-item__title">${prod.title}</div>
                    <div class="trendora-predictive-item__price">${trendoraFormatMoney(prod.price * 100)}</div>
                  </div>
                </a>`;
            });
            html += '</div>';
            resultsContainer.innerHTML = html;
            resultsContainer.style.display = 'block';
          } else {
            resultsContainer.innerHTML = '<div class="trendora-predictive-empty">No products found</div>';
            resultsContainer.style.display = 'block';
          }
        })
        .catch(() => {
          resultsContainer.style.display = 'none';
        });
    }, 300);
  });

  document.addEventListener('click', function (e) {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = 'none';
    }
  });
}

/* ==========================================
 * 4. Back to Top Floating Button
 * ========================================== */
function trendoraInitBackToTop() {
  const btn = document.getElementById('trendoraBackToTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

function trendoraScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================
 * 5. Sticky Add to Cart Observer
 * ========================================== */
function trendoraInitStickyCart() {
  const stickyCart = document.getElementById('trendoraStickyCart');
  const mainBuyBtn = document.getElementById('trendoraAddToCartBtn');

  if (!stickyCart || !mainBuyBtn) return;

  window.addEventListener('scroll', function () {
    const btnRect = mainBuyBtn.getBoundingClientRect();
    if (btnRect.bottom < 0) {
      stickyCart.classList.add('visible');
    } else {
      stickyCart.classList.remove('visible');
    }
  });
}
