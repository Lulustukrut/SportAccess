/* ========================================
   SPORTACCESS — Application Logic
   ======================================== */

// --- State ---
const state = {
  currentScreen: 'splash',
  previousScreen: null,
  history: [],
  onboardingSlide: 0,
  filtersOpen: false,
};

// --- Navigation ---
function navigateTo(screenId) {
  if (screenId === state.currentScreen) return;

  const currentEl = document.getElementById(`screen-${state.currentScreen}`);
  const nextEl = document.getElementById(`screen-${screenId}`);
  if (!nextEl) return;

  // Push to history
  state.history.push(state.currentScreen);
  state.previousScreen = state.currentScreen;

  // Transition out
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.classList.add('exiting');
    setTimeout(() => {
      currentEl.classList.remove('exiting');
    }, 350);
  }

  // Transition in
  nextEl.classList.add('active');
  state.currentScreen = screenId;

  if (screenId === 'map') {
    setTimeout(() => {
      if (typeof initRealMap === 'function') initRealMap();
      if (window.myMap) window.myMap.invalidateSize();
    }, 50);
  }

  // Reset scroll
  const scrollContainer = nextEl.querySelector('.screen-scroll');
  if (scrollContainer) scrollContainer.scrollTop = 0;

  // Update tab bar
  updateTabBar(screenId);

  // Show/hide tab bar
  const tabBar = document.getElementById('tab-bar');
  const screensWithTabs = ['home', 'search', 'bookings', 'social', 'profile'];
  if (tabBar) {
    tabBar.style.display = screensWithTabs.includes(screenId) ? 'flex' : 'flex';
  }

  // Haptic feedback simulation
  if (navigator.vibrate) navigator.vibrate(10);
}

function goBack() {
  if (state.history.length > 0) {
    const prev = state.history.pop();
    const currentEl = document.getElementById(`screen-${state.currentScreen}`);
    const prevEl = document.getElementById(`screen-${prev}`);

    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('exiting');
      setTimeout(() => currentEl.classList.remove('exiting'), 350);
    }

    if (prevEl) {
      prevEl.classList.add('active');
    }

    state.currentScreen = prev;
    updateTabBar(prev);
  } else {
    navigateTo('home');
  }
}

function updateTabBar(screenId) {
  const tabs = document.querySelectorAll('.tab-bar .tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.screen === screenId);
  });
}

function toggleMascot(element) {
  element.classList.toggle('hidden-mascot');
}

// --- Splash Screen ---
function initSplash() {
  setTimeout(() => {
    const splash = document.getElementById('screen-splash');
    splash.classList.remove('active');
    splash.classList.add('exiting');
    setTimeout(() => {
      splash.classList.remove('exiting');
      splash.style.display = 'none';
    }, 400);

    const signup = document.getElementById('screen-signup');
    signup.classList.add('active');
    state.currentScreen = 'signup';
  }, 2500);
}

// --- Onboarding ---
function initOnboarding() {
  const btnNext = document.getElementById('btn-onboarding-next');
  const btnSkip = document.getElementById('btn-onboarding-skip');

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (state.onboardingSlide < 2) {
        changeOnboardingSlide(state.onboardingSlide + 1);
      } else {
        finishOnboarding();
      }
    });
  }

  if (btnSkip) {
    btnSkip.addEventListener('click', finishOnboarding);
  }
}

function changeOnboardingSlide(index) {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dots .dot');
  const btnNext = document.getElementById('btn-onboarding-next');

  // Exit current slide
  slides[state.onboardingSlide].classList.remove('active');
  slides[state.onboardingSlide].classList.add('exiting');
  setTimeout(() => slides[state.onboardingSlide].classList.remove('exiting'), 500);

  // Enter new slide
  slides[index].classList.add('active');

  // Update dots
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

  // Update button text
  if (btnNext) {
    btnNext.textContent = index === 2 ? 'Commencer' : 'Continuer';
  }

  state.onboardingSlide = index;
}

function finishOnboarding() {
  const onboarding = document.getElementById('screen-onboarding');
  onboarding.classList.remove('active');
  onboarding.classList.add('exiting');
  setTimeout(() => {
    onboarding.classList.remove('exiting');
  }, 350);

  const home = document.getElementById('screen-home');
  home.classList.add('active');
  state.currentScreen = 'home';
  state.history = [];
  updateTabBar('home');
}

// --- Filters ---
function toggleFilters() {
  const panel = document.getElementById('filters-panel');
  if (panel) {
    state.filtersOpen = !state.filtersOpen;
    panel.classList.toggle('open', state.filtersOpen);
  }
}

// --- Filter Chips ---
function initFilterChips() {
  // Category chips on home
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Filter chips in search
  document.querySelectorAll('.filter-chips').forEach(group => {
    group.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Within each filter group, toggle active
        const isMulti = group.closest('.filter-group')?.querySelector('h3')?.textContent === 'Sport';
        if (!isMulti) {
          group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        }
        chip.classList.toggle('active');
      });
    });
  });

  // Coaches filters
  document.querySelectorAll('.coaches-filters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.coaches-filters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Handi filters
  document.querySelectorAll('.handi-filter').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.handi-filter').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

// --- Price Range ---
function initPriceRange() {
  const slider = document.getElementById('price-range');
  const display = document.getElementById('price-value');
  if (slider && display) {
    slider.addEventListener('input', () => {
      display.textContent = `${slider.value}€`;
    });
  }
}

// --- Detail Tabs ---
function initDetailTabs() {
  document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      // Update tab buttons
      document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Update tab content
      document.querySelectorAll('.detail-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// --- Schedule Days ---
function initScheduleDays() {
  document.querySelectorAll('.schedule-day').forEach(day => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.schedule-day').forEach(d => d.classList.remove('active'));
      day.classList.add('active');
    });
  });
}

// --- Booking Tabs ---
function initBookingTabs() {
  document.querySelectorAll('.bookings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bookings-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

// --- Social Tabs ---
function initSocialTabs() {
  document.querySelectorAll('.social-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.social-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

// --- Map Cards ---
window.mapClubsData = [
  {
    name: 'Zen Studio Paris',
    ratingInfo: '4.9',
    price: '12€',
    badge: 'Handisport Eq.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400',
    time: '6 min',
    transportIconClass: 'directions_walk',
    iconName: 'self_improvement'
  },
  {
    name: 'Tennis Club République',
    ratingInfo: '4.6',
    price: '18€',
    badge: '',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400',
    time: '15 min',
    transportIconClass: 'directions_walk',
    iconName: 'sports_tennis'
  },
  {
    name: 'AquaFit Center',
    ratingInfo: '4.7',
    price: '14€',
    badge: 'Lève-personne',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=400',
    time: '8 min',
    transportIconClass: 'directions_subway',
    iconName: 'pool'
  },
  {
    name: 'Body & Mind Studio',
    ratingInfo: '4.8',
    price: '15€',
    badge: 'PMR',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400',
    time: '10 min',
    transportIconClass: 'directions_walk',
    iconName: 'accessibility_new'
  },
  {
    name: 'Golf Urbain Paris',
    ratingInfo: '4.5',
    price: '22€',
    badge: '',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
    time: '12 min',
    transportIconClass: 'directions_bus',
    iconName: 'golf_course'
  }
];

window.toggleFavoriteMap = function(btn) {
  const isFav = btn.querySelector('.material-symbols-outlined').style.fontVariationSettings === '"FILL" 1';
  btn.querySelector('.material-symbols-outlined').style.fontVariationSettings = isFav ? '"FILL" 0' : '"FILL" 1';
  btn.querySelector('.material-symbols-outlined').style.color = isFav ? '' : '#ff5545';
};

window.myMap = null;
window.leafletMarkers = [];

function initRealMap() {
  if (window.myMap) return;
  const mapContainer = document.getElementById('real-map');
  if (!mapContainer) return;

  window.myMap = L.map('real-map', { zoomControl: false }).setView([48.8566, 2.3522], 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(window.myMap);

  const userIcon = L.divIcon({
    html: `<div class="w-4 h-4 rounded-full border-2 border-white animate-pulse" style="background:#ff5545; box-shadow: 0 0 0 4px rgba(255,85,69,0.25);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  L.marker([48.8566, 2.3522], {icon: userIcon}).addTo(window.myMap);

  const coords = [
    [48.8600, 2.3400],
    [48.8700, 2.3600],
    [48.8500, 2.3300],
    [48.8800, 2.3500],
    [48.8400, 2.3700]
  ];

  window.mapClubsData.forEach((club, i) => {
    let pinHtml = '';
    if (i === 2) {
      pinHtml = `<div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform map-pin-content">
          <div class="bg-secondary text-on-secondary shadow-md rounded-full px-3 py-1 flex items-center gap-1 border border-secondary">
            <span class="material-symbols-outlined text-sm">${club.iconName}</span>
            <span class="font-label-sm text-xs font-bold">${club.price}</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-secondary mt-[-1px]"></div>
        </div>`;
    } else if (i === 4) {
      pinHtml = `<div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform map-pin-content">
          <div class="bg-primary text-on-primary shadow-lg rounded-full px-4 py-2 flex items-center gap-1 ring-4 ring-surface/50 border-2 border-primary">
            <span class="material-symbols-outlined text-base">${club.iconName}</span>
            <span class="font-label-lg text-sm font-bold whitespace-nowrap">${club.name.split(' ')[0]} ${club.name.split(' ')[1]}</span>
          </div>
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-primary mt-[-2px]"></div>
        </div>`;
    } else {
      pinHtml = `<div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform map-pin-content">
          <div class="bg-surface text-on-surface shadow-md rounded-full px-2 py-1 flex items-center gap-1 border border-outline-variant inner-badge">
            <span class="material-symbols-outlined text-sm text-primary">${club.iconName}</span>
            <span class="font-label-sm text-xs font-bold">${club.ratingInfo.split(' ')[0]}</span>
            <span class="material-symbols-outlined text-[12px] text-secondary" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-surface mt-[-1px]"></div>
        </div>`;
    }

    const icon = L.divIcon({
      html: pinHtml,
      className: `custom-marker-div marker-${i}`,
      iconSize: null,
      iconAnchor: [30, 40]
    });

    const marker = L.marker(coords[i], {icon: icon}).addTo(window.myMap);
    marker.on('click', () => {
      showMapCard(i);
      window.myMap.panTo(coords[i]);
    });
    window.leafletMarkers.push(marker);
  });
}

function showMapCard(index) {
  const club = window.mapClubsData[index];
  const container = document.getElementById('map-cards');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-surface rounded-xl shadow-lg border border-outline-variant overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-[1.02]" onclick="navigateTo('club-detail')">
      <div class="h-28 relative bg-surface-container-high">
        <div class="w-full h-full bg-cover bg-center" style="background-image: url('${club.image}')"></div>
        <button class="absolute top-2 right-2 w-8 h-8 bg-surface rounded-full flex items-center justify-center shadow-sm text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors" onclick="event.stopPropagation(); window.toggleFavoriteMap(this)">
          <span class="material-symbols-outlined text-[18px]">favorite</span>
        </button>
        ${club.badge ? `
        <div class="absolute bottom-2 left-2 flex gap-1">
          <span class="bg-surface/90 text-on-surface text-[10px] px-2 py-1 rounded-sm font-label-sm font-bold flex items-center gap-1 shadow-sm border border-outline-variant/30">
            <span class="material-symbols-outlined text-[14px] text-primary">accessible</span> ${club.badge}
          </span>
        </div>` : ''}
      </div>
      <div class="p-4 flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="font-headline-md text-lg text-on-surface font-bold">${club.name}</h2>
            <p class="font-body-md text-on-surface-variant text-sm flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined text-[16px] text-secondary" style="font-variation-settings: 'FILL' 1;">star</span> ${club.ratingInfo} <span class="text-xs ml-1 font-bold text-primary">${club.price}</span>
            </p>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/40">
          <div class="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
            <span class="material-symbols-outlined text-[16px] text-primary">${club.transportIconClass}</span>
            <span class="font-label-sm text-xs font-bold">${club.time}</span>
          </div>
          <div class="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
            <span class="material-symbols-outlined text-[16px] text-primary">directions_bus</span>
            <span class="font-label-sm text-xs font-bold">5 min</span>
          </div>
          <div class="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
            <span class="material-symbols-outlined text-[16px] text-primary">local_parking</span>
            <span class="font-label-sm text-xs font-bold">Oui</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.map-pin-content').forEach((pin, i) => {
    pin.style.transform = i === index ? 'scale(1.15)' : 'scale(1)';
    const innerBadge = pin.querySelector('.inner-badge');
    if (innerBadge) {
       innerBadge.style.borderColor = i === index ? 'var(--primary)' : '';
    }
  });
}

// --- Transport Chips ---
function initTransportChips() {
  document.querySelectorAll('.transport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.transport-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

// --- Booking Confirmation ---
function showBookingConfirmation() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('open');
}

// --- Favorites ---
function initFavorites() {
  document.querySelectorAll('.club-card-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isFav = btn.textContent.trim() === '♥';
      btn.textContent = isFav ? '♡' : '♥';
      btn.style.color = isFav ? 'white' : '#ffb874';

      // Animate
      btn.style.transform = 'scale(1.3)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  });
}

// --- Search Input ---
function initSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  if (input && clearBtn) {
    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      input.focus();
    });
  }
}

// --- Radio Options ---
function initRadioOptions() {
  document.querySelectorAll('.radio-option').forEach(option => {
    option.addEventListener('click', () => {
      const group = option.closest('.recurrence-options');
      if (group) {
        group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      }
    });
  });
}

// --- Payment Methods ---
function initPaymentMethods() {
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
      method.classList.add('active');
      const radio = method.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// --- Copy Buttons ---
function initCopyButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.referral-code, .promo-code-card');
      if (parent) {
        const code = parent.querySelector('span:not(.pcc-discount)')?.textContent ||
                     parent.querySelector('h4')?.textContent || '';
        
        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = '✓ Copié !';
        btn.style.background = 'linear-gradient(135deg, #4b8eff, #adc6ff)';

        // Try to actually copy
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code.trim()).catch(() => {});
        }

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      }
    });
  });
}

// --- View Buttons (List/Map) ---
function initViewButtons() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// --- Touch Interactions ---
function initTouchFeedback() {
  const interactiveElements = document.querySelectorAll(
    '.club-card, .coach-card, .result-card, .schedule-slot, .notif-item, .msg-item, .coach-list-card, .handi-club-card, .social-post'
  );

  interactiveElements.forEach(el => {
    el.addEventListener('touchstart', () => {
      el.style.opacity = '0.85';
    }, { passive: true });

    el.addEventListener('touchend', () => {
      el.style.opacity = '';
    }, { passive: true });

    el.addEventListener('touchcancel', () => {
      el.style.opacity = '';
    }, { passive: true });
  });
}

// --- Smooth Scroll for Horizontal Lists ---
function initHorizontalScroll() {
  const scrollContainers = document.querySelectorAll('.categories-scroll, .clubs-scroll, .coaches-scroll');

  scrollContainers.forEach(container => {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = '';
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = '';
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });
  });
}

// --- Post Action Buttons ---
function initPostActions() {
  document.querySelectorAll('.post-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Simple like/clap animation
      const text = btn.textContent;
      if (text.includes('👏') || text.includes('💬')) {
        const match = text.match(/(\d+)/);
        if (match) {
          const count = parseInt(match[1]) + 1;
          btn.textContent = text.replace(/\d+/, count);
        }
        btn.style.background = 'rgba(255, 85, 69, 0.2)';
        btn.style.borderColor = 'rgba(255, 85, 69, 0.4)';
        setTimeout(() => {
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 300);
      }
    });
  });
}

// --- Join / Like Buttons ---
function initSocialButtons() {
  document.querySelectorAll('.btn-join').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = '✓ Rejoint';
      btn.style.background = 'linear-gradient(135deg, #4b8eff, #adc6ff)';
      btn.style.pointerEvents = 'none';
    });
  });

  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = '👏';
      btn.style.background = 'rgba(255, 85, 69, 0.2)';
      btn.style.borderColor = 'rgba(255, 85, 69, 0.4)';
    });
  });
}

// --- Notification read ---
function initNotifications() {
  document.querySelectorAll('.notif-item.unread').forEach(notif => {
    notif.addEventListener('click', () => {
      notif.classList.remove('unread');
    });
  });

  // "Tout lire" button
  const readAllBtn = document.querySelector('#screen-notifications .btn-text');
  if (readAllBtn) {
    readAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
      // Update badge
      const badge = document.querySelector('.badge');
      if (badge) badge.style.display = 'none';
    });
  }
}

// --- Book Slot Buttons ---
function initBookSlots() {
  document.querySelectorAll('.btn-book-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('booking');
    });
  });

  document.querySelectorAll('.btn-book-small').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('booking');
    });
  });
}

// --- Dark Mode Toggle ---
function initDarkModeToggle() {
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.checked = !document.body.classList.contains('light-mode');
    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
      }
    });
  }
}

// --- Map Pin Animation on Load ---
function initMapPins() {
  const pins = document.querySelectorAll('.map-pin:not(.user-pin)');
  pins.forEach((pin, i) => {
    pin.style.animationDelay = `${i * 0.1}s`;
  });
}

// --- Scroll-based Animations ---
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.club-card, .coach-card, .result-card, .social-post').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// --- Prevent Overscroll ---
function initOverscrollPrevention() {
  document.body.addEventListener('touchmove', (e) => {
    const target = e.target.closest('.screen-scroll, .categories-scroll, .clubs-scroll, .coaches-scroll, .map-container, .filters-panel');
    if (!target) {
      e.preventDefault();
    }
  }, { passive: false });
}

// --- Goal Ring Animation ---
function animateGoalRing() {
  const ring = document.querySelector('.goal-progress-ring circle:last-of-type');
  if (ring) {
    // 2/3 = 66.7% => dashoffset = 264 * (1 - 0.667) = 88
    ring.style.transition = 'stroke-dashoffset 1.5s ease';
  }
}

// --- Initialize App ---
function initApp() {
  initSplash();
  initOnboarding();
  initFilterChips();
  initPriceRange();
  initDetailTabs();
  initScheduleDays();
  initBookingTabs();
  initSocialTabs();
  initTransportChips();
  initFavorites();
  initSearch();
  initRadioOptions();
  initPaymentMethods();
  initCopyButtons();
  initViewButtons();
  initTouchFeedback();
  initHorizontalScroll();
  initPostActions();
  initSocialButtons();
  initNotifications();
  initBookSlots();
  initDarkModeToggle();
  initMapPins();
  initOverscrollPrevention();
  animateGoalRing();

  // Delayed scroll animations (after initial render)
  setTimeout(initScrollAnimations, 100);
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);


function completeSignup() {
  const firstname = document.getElementById('signup-firstname').value.trim() || 'Champion';
  const lastname = document.getElementById('signup-lastname').value.trim() || '';
  const age = document.getElementById('signup-age').value.trim() || '';
  
  // Get selected avatar
  const avatarRadio = document.querySelector('input[name="avatar"]:checked');
  let avatarSrc = 'mascotte/tigresse detouré.png';
  let homeMascotClass = 'tigresse';
  if (avatarRadio && avatarRadio.value === 'tigrou') {
    avatarSrc = 'mascotte/tigrou3).png';
    homeMascotClass = 'tigrou';
  }
  
  // Save to state
  state.user = {
    firstname: firstname,
    lastname: lastname,
    age: age,
    avatar: avatarSrc
  };
  
  // Update UI
  const homeName = document.getElementById('home-greeting-name');
  if (homeName) homeName.textContent = firstname;
  
  const profileName = document.getElementById('profile-name');
  if (profileName) profileName.textContent = firstname + ' ' + lastname;
  
  const profileAge = document.getElementById('profile-age-display');
  if (profileAge) profileAge.textContent = age;
  
  const homeAvatar = document.getElementById('home-avatar-img');
  if (homeAvatar) {
    homeAvatar.style.backgroundImage = 'url("' + avatarSrc + '")';
    homeAvatar.style.backgroundColor = 'var(--bg-surface)';
    homeAvatar.innerHTML = '';
  }
  
  const profileAvatar = document.getElementById('profile-avatar-img');
  if (profileAvatar) {
    profileAvatar.style.backgroundImage = 'url("' + avatarSrc + '")';
    profileAvatar.style.backgroundColor = 'var(--bg-surface)';
    profileAvatar.innerHTML = '';
  }

  const tigrouMascot = document.getElementById('home-mascot-tigrou');
  const tigresseMascot = document.getElementById('home-mascot-tigresse');
  
  if (tigrouMascot && tigresseMascot) {
    if (homeMascotClass === 'tigrou') {
      tigrouMascot.style.display = 'block';
      tigresseMascot.style.display = 'none';
    } else {
      tigrouMascot.style.display = 'none';
      tigresseMascot.style.display = 'block';
    }
  }
  
  const signup = document.getElementById('screen-signup');
  signup.classList.add('exiting');
  setTimeout(() => {
    signup.classList.remove('active');
    signup.classList.remove('exiting');
  }, 350);

  const onboarding = document.getElementById('screen-onboarding');
  onboarding.classList.add('active');
  state.currentScreen = 'onboarding';
}
