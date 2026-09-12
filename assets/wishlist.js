/**
 * Trendora Wishlist System (LocalStorage Engine)
 */

document.addEventListener('DOMContentLoaded', function () {
  trendoraInitWishlistButtons();
  trendoraUpdateWishlistCount();
});

function trendoraGetWishlist() {
  try {
    return JSON.parse(localStorage.getItem('trendora_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function trendoraSaveWishlist(list) {
  localStorage.setItem('trendora_wishlist', JSON.stringify(list));
  trendoraUpdateWishlistCount();
}

function trendoraToggleWishlist(handle, btn) {
  let list = trendoraGetWishlist();
  const index = list.indexOf(handle);

  if (index > -1) {
    list.splice(index, 1);
    if (btn) btn.classList.remove('active');
  } else {
    list.push(handle);
    if (btn) btn.classList.add('active');
  }

  trendoraSaveWishlist(list);

  // Sync all buttons on page for this handle
  const matchingButtons = document.querySelectorAll(`[data-wishlist-handle="${handle}"]`);
  matchingButtons.forEach(b => {
    if (index > -1) {
      b.classList.remove('active');
      b.setAttribute('aria-label', 'Add to wishlist');
    } else {
      b.classList.add('active');
      b.setAttribute('aria-label', 'Remove from wishlist');
    }
  });
}

function trendoraInitWishlistButtons() {
  const list = trendoraGetWishlist();
  const buttons = document.querySelectorAll('[data-wishlist-handle]');

  buttons.forEach(btn => {
    const handle = btn.getAttribute('data-wishlist-handle');
    if (list.includes(handle)) {
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remove from wishlist');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Add to wishlist');
    }
  });
}

function trendoraUpdateWishlistCount() {
  const list = trendoraGetWishlist();
  const countEls = document.querySelectorAll('#trendoraWishlistCount');

  countEls.forEach(el => {
    el.textContent = list.length;
    if (list.length > 0) {
      el.classList.remove('trendora-wishlist-count--hidden');
    } else {
      el.classList.add('trendora-wishlist-count--hidden');
    }
  });
}
