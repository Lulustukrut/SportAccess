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
  
  const tabBar = document.getElementById('tab-bar');
  const screensWithTabs = ['home', 'search', 'bookings', 'social', 'profile'];
  if (tabBar) {
    tabBar.style.display = screensWithTabs.includes(screenId) ? 'flex' : 'none';
  }
}

function toggleMascot(element) {
  element.classList.toggle('hidden-mascot');
}

// --- Splash Screen ---
function initSplash() {
  const splash = document.getElementById('screen-splash');
  const video = splash.querySelector('video');

  function exitSplash() {
    splash.classList.remove('active');
    splash.classList.add('exiting');
    setTimeout(() => {
      splash.classList.remove('exiting');
      splash.style.display = 'none';
    }, 400);

    const signup = document.getElementById('screen-signup');
    signup.classList.add('active');
    state.currentScreen = 'signup';
  }

  if (video) {
    const checkTime = () => {
      if (video.duration > 0 && video.currentTime >= video.duration * 0.75) {
        video.removeEventListener('timeupdate', checkTime);
        exitSplash();
      }
    };
    video.addEventListener('timeupdate', checkTime);

    // Fallback if video is stuck or doesn't play
    setTimeout(() => {
      if (splash.classList.contains('active')) {
        video.removeEventListener('timeupdate', checkTime);
        exitSplash();
      }
    }, 5000);
  } else {
    setTimeout(exitSplash, 2500);
  }
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
  // Attach drag events to all bottom sheets
  document.querySelectorAll('.bottom-sheet').forEach(sheet => {
    initBottomSheetDrag(sheet.id);
  });

  window.pmrActive = true;
  window.togglePMR = function() {
    window.pmrActive = !window.pmrActive;
    const knob = document.getElementById('pmr-knob');
    const track = document.getElementById('pmr-track');
    const btn = document.getElementById('pmr-btn');
    
    if (window.pmrActive) {
      knob.style.transform = 'translateX(18px)';
      track.style.background = 'var(--accent-yellow)';
      track.style.borderColor = 'var(--accent-yellow)';
      btn.style.borderColor = 'var(--accent-yellow)';
    } else {
      knob.style.transform = 'translateX(0px)';
      track.style.background = 'var(--surface)';
      track.style.borderColor = 'var(--outline-variant)';
      btn.style.borderColor = 'var(--border)';
    }

    // Filter map pins
    const markers = document.querySelectorAll('.leaflet-marker-icon.leaflet-div-icon');
    markers.forEach(marker => {
      // If it's the user marker (has animate-pulse), ignore
      if (marker.innerHTML.includes('animate-pulse')) return;
      
      // Example logic: hide markers 2 and 4 when PMR is off (just simulating filtering)
      if (!window.pmrActive && (marker.innerHTML.includes('sports_tennis') || marker.innerHTML.includes('golf_course'))) {
        marker.style.opacity = '0';
        marker.style.pointerEvents = 'none';
      } else {
        marker.style.opacity = '1';
        marker.style.pointerEvents = 'auto';
      }
    });
  };

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
          <div class="shadow-md rounded-full px-3 py-1 flex items-center gap-1 border" style="background: var(--accent-yellow); color: #131313; border-color: var(--accent-yellow);">
            <span class="material-symbols-outlined text-sm" style="color: #131313;">${club.iconName}</span>
            <span class="font-label-sm text-xs font-bold" style="color: #131313;">${club.price}</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mt-[-1px]" style="border-top-color: var(--accent-yellow);"></div>
        </div>`;
    } else if (i === 4) {
      pinHtml = `<div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform map-pin-content">
          <div class="shadow-lg rounded-full px-4 py-2 flex items-center gap-1 ring-4 ring-surface/50 border-2" style="background: var(--accent-yellow); color: #131313; border-color: var(--accent-yellow);">
            <span class="material-symbols-outlined text-base" style="color: #131313;">${club.iconName}</span>
            <span class="font-label-lg text-sm font-bold whitespace-nowrap" style="color: #131313;">${club.name.split(' ')[0]} ${club.name.split(' ')[1]}</span>
          </div>
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] mt-[-2px]" style="border-top-color: var(--accent-yellow);"></div>
        </div>`;
    } else {
      pinHtml = `<div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform map-pin-content">
          <div class="shadow-md rounded-full px-2 py-1 flex items-center gap-1 border inner-badge" style="background: var(--accent-yellow); color: #131313; border-color: var(--accent-yellow);">
            <span class="material-symbols-outlined text-sm" style="color: #131313;">${club.iconName}</span>
            <span class="font-label-sm text-xs font-bold" style="color: #131313;">${club.ratingInfo.split(' ')[0]}</span>
            <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1; color: #131313;">star</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mt-[-1px]" style="border-top-color: var(--accent-yellow);"></div>
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
    <div class="rounded-xl shadow-lg border overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-[1.02]" onclick="navigateTo('club-detail')" style="background: #131313; border: 1.5px solid var(--accent-yellow); color: white;">
      <div class="h-28 relative bg-surface-container-high">
        <div class="w-full h-full bg-cover bg-center" style="background-image: url('${club.image}')"></div>
        <button class="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors" onclick="event.stopPropagation(); window.toggleFavoriteMap(this)" style="background: #1a1a1a;">
          <span class="material-symbols-outlined text-[18px]" style="color: var(--accent-yellow);">favorite</span>
        </button>
        ${club.badge ? `
        <div class="absolute bottom-2 left-2 flex gap-1">
          <span class="text-[10px] px-2 py-1 rounded-sm font-label-sm font-bold flex items-center gap-1 shadow-sm border" style="background: var(--accent-yellow); color: #131313; border: 1.5px solid var(--accent-yellow);">
            <span class="material-symbols-outlined text-[14px]" style="color: #131313;">accessible</span> ${club.badge}
          </span>
        </div>` : ''}
      </div>
      <div class="p-4 flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="font-headline-md text-lg font-bold" style="color: white;">${club.name}</h2>
            <p class="font-body-md text-sm flex items-center gap-1 mt-1" style="color: white;">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1; color: var(--accent-yellow);">star</span> <span style="color: var(--accent-yellow); font-weight: bold;">${club.ratingInfo.split(' ')[0]}</span> <span class="text-xs ml-1 font-bold" style="color: white;">${club.price}</span>
            </p>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/40">
          <div class="flex items-center gap-1 px-2 py-1 rounded-md" style="background: transparent;">
            <span class="material-symbols-outlined text-[16px]" style="color: white;">${club.transportIconClass}</span>
            <span class="font-label-sm text-xs font-bold" style="color: white;">${club.time}</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-1 rounded-md" style="background: transparent;">
            <span class="material-symbols-outlined text-[16px]" style="color: white;">directions_bus</span>
            <span class="font-label-sm text-xs font-bold" style="color: white;">5 min</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-1 rounded-md" style="background: transparent;">
            <span class="material-symbols-outlined text-[16px]" style="color: white;">local_parking</span>
            <span class="font-label-sm text-xs font-bold" style="color: white;">Oui</span>
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

// --- Sticky Search Header ---
function initStickySearch() {
  const homeScroll = document.getElementById('home-scroll-container');
  const stickyHeader = document.getElementById('sticky-search-header');
  if (homeScroll && stickyHeader) {
    homeScroll.addEventListener('scroll', () => {
      if (homeScroll.scrollTop > 120) {
        stickyHeader.classList.add('visible');
      } else {
        stickyHeader.classList.remove('visible');
      }
    });
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
  initStickySearch();
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
  let avatarSrc = 'mascotte/tigresse_detouré.png';
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

// --- Packs Logic ---
const packsData = {
  pilates: {
    title: "Pack Découverte Pilates",
    category: "Sport / Bien-être",
    badge: "POPULAIRE",
    image: "images/club_pilates.png",
    oldPrice: "45€",
    newPrice: "29€",
    savings: "-35%",
    description: "Une initiation parfaite pour découvrir les bienfaits du Pilates et retrouver votre équilibre.",
    benefits: [
      { text: "3 séances incluses", icon: "ph-person-simple-lotus" },
      { text: "Tapis & serviette", icon: "ph-bag" },
      { text: "Vestiaires premium", icon: "ph-shower" },
      { text: "Accès tous niveaux", icon: "ph-star" }
    ],
    validity: "1 mois",
    conditions: "Réservation obligatoire 24h à l'avance. Annulation gratuite jusqu'à 12h avant.",
    gallery: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop"
    ],
    partnerClubs: [
      { name: "Zen Studio Paris", address: "11ème arrondissement", rating: "4.9", image: "images/club_yoga.png" },
      { name: "Body & Mind Studio", address: "Place de la Nation", rating: "4.7", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop" }
    ]
  },
  multisports: {
    title: "Pack Multi-Sports",
    category: "Sport / Mixte",
    badge: "NOUVEAU",
    image: "images/club_tennis.png",
    oldPrice: "80€",
    newPrice: "49€",
    savings: "-38%",
    description: "Idéal pour les indécis ! Variez les plaisirs avec 5 accès à différents sports de raquette et d'eau.",
    benefits: [
      { text: "5 accès inclus", icon: "ph-ticket" },
      { text: "Prêt de matériel", icon: "ph-tennis-ball" },
      { text: "Résa prioritaire", icon: "ph-clock" },
      { text: "Valable partout", icon: "ph-map-pin" }
    ],
    validity: "2 mois",
    conditions: "Valable uniquement dans les clubs partenaires affichés.",
    gallery: [
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1574629810360-7efbb4ea2db7?w=400&h=300&fit=crop"
    ],
    partnerClubs: [
      { name: "Tennis Club République", address: "Bd Voltaire", rating: "4.6", image: "images/club_tennis.png" },
      { name: "AquaFit Center", address: "Rue de Charonne", rating: "4.7", image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=300&fit=crop" }
    ]
  },
  yoga: {
    title: "Pack Yoga Illimité",
    category: "Sport / Zen",
    badge: "PROMO",
    image: "images/club_yoga.png",
    oldPrice: "50€",
    newPrice: "25€",
    savings: "-50%",
    description: "Un mois complet pour trouver votre équilibre intérieur. Accès illimité à tous nos studios de Yoga partenaires.",
    benefits: [
      { text: "Accès illimité", icon: "ph-infinity" },
      { text: "Multi-studios", icon: "ph-buildings" },
      { text: "Tous styles", icon: "ph-yin-yang" },
      { text: "Tisane détox", icon: "ph-coffee" }
    ],
    validity: "1 mois",
    conditions: "Limité à un achat par personne. Non remboursable une fois activé.",
    gallery: [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400&h=300&fit=crop"
    ],
    partnerClubs: [
      { name: "Zen Studio Paris", address: "11ème arrondissement", rating: "4.9", image: "images/club_yoga.png" }
    ]
  }
};

function openPackDetail(packId) {
  const pack = packsData[packId];
  if (!pack) return;

  // Update Hero
  document.getElementById('pack-detail-hero').style.backgroundImage = `url('${pack.image}')`;
  
  // Gallery
  const galleryContainer = document.getElementById('pack-detail-gallery');
  if (pack.gallery && pack.gallery.length > 0) {
    let galleryHtml = '';
    pack.gallery.slice(0, 2).forEach(img => {
      galleryHtml += `<div class="gallery-item" style="background-image: url('${img}'); background-size: cover; background-position: center;"></div>`;
    });
    if (pack.gallery.length > 2) {
      galleryHtml += `<div class="gallery-item gallery-more">+${pack.gallery.length - 2}</div>`;
    }
    galleryContainer.innerHTML = galleryHtml;
    galleryContainer.style.display = 'flex';
  } else {
    galleryContainer.style.display = 'none';
  }

  // Header
  document.getElementById('pack-detail-category').textContent = pack.category;
  // document.getElementById('pack-detail-badge').textContent = pack.badge;
  document.getElementById('pack-detail-title').textContent = pack.title;
  
  // Quick Info
  document.getElementById('pack-qi-new-price').textContent = pack.newPrice;
  document.getElementById('pack-qi-old-price').textContent = pack.oldPrice;
  document.getElementById('pack-qi-savings').textContent = pack.savings;
  document.getElementById('pack-qi-validity').textContent = pack.validity;
  
  // Description
  document.getElementById('pack-detail-description').textContent = pack.description;

  // Benefits (Amenities Grid)
  const benefitsList = document.getElementById('pack-detail-benefits');
  benefitsList.innerHTML = pack.benefits.map(b => `
    <div class="amenity"><i class="ph ${b.icon}"></i> ${b.text}</div>
  `).join('');

  // Conditions
  document.getElementById('pack-detail-validity').textContent = pack.validity;
  document.getElementById('pack-detail-conditions').textContent = pack.conditions;

  // Partner Clubs
  const clubsContainer = document.getElementById('pack-detail-clubs');
  if (pack.partnerClubs && pack.partnerClubs.length > 0) {
    clubsContainer.innerHTML = pack.partnerClubs.map(club => `
      <div class="club-card" onclick="navigateTo('club-detail')">
        <div class="club-card-img" style="background-image: url('${club.image}'); background-size: cover; background-position: center;">
        </div>
        <div class="club-card-info">
          <h3>${club.name}</h3>
          <p>${club.address}</p>
          <div class="club-card-rating">
            <i class="ph-fill ph-star"></i> ${club.rating}
          </div>
        </div>
      </div>
    `).join('');
  } else {
    clubsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 0 20px;">Aucun club partenaire spécifié.</p>';
  }

  // Sticky Action Bar
  document.getElementById('pack-action-price').textContent = pack.newPrice;

  // Setup Mascot Interaction
  setupPackMascot();

  // Navigate to screen
  navigateTo('pack-detail');
}

let packMascotObserver = null;
let packMascotTimeout = null;

function setupPackMascot() {
  const mascot = document.getElementById('pack-mascot');
  const conditionsSection = document.getElementById('pack-conditions-section');
  
  if (!mascot || !conditionsSection) return;
  
  // Make sure it's hidden initially
  mascot.classList.add('hidden-mascot');
  
  // Set the right class based on chosen avatar
  const avatarRadio = document.querySelector('input[name="avatar"]:checked');
  const isTigrou = avatarRadio && avatarRadio.value === 'tigrou';
  mascot.className = 'pack-mascot hidden-mascot ' + (isTigrou ? 'tigrou' : 'tigresse');
  
  // Update bubble class based on side
  const bubble = mascot.querySelector('.mascot-bubble');
  if (bubble) {
    bubble.className = 'mascot-bubble bubble-right';
  }
  
  // Clear any existing observer/timeout
  if (packMascotObserver) packMascotObserver.disconnect();
  if (packMascotTimeout) clearTimeout(packMascotTimeout);
  
  // Trigger on scroll (Intersection Observer)
  packMascotObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      mascot.classList.remove('hidden-mascot');
      packMascotObserver.disconnect();
      if (packMascotTimeout) clearTimeout(packMascotTimeout);
    }
  }, { threshold: 0.5 });
  
  packMascotObserver.observe(conditionsSection);
  
  // Trigger on hesitation (e.g. 5 seconds)
  packMascotTimeout = setTimeout(() => {
    mascot.classList.remove('hidden-mascot');
    if (packMascotObserver) packMascotObserver.disconnect();
  }, 5000);
}

function buyPack() {
  const packModal = document.getElementById('pack-modal');
  if (packModal) packModal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('open');
  const packModal = document.getElementById('pack-modal');
  if (packModal) packModal.classList.remove('open');
}
