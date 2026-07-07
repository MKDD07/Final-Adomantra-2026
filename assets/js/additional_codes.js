(function () {
  'use strict';

  function initSwipers() {
    /* INNER SWIPERS (4) */
    var innerSwipers = [];
    for (var i = 0; i < 4; i++) {
      innerSwipers.push(new Swiper('#innerSwiper' + i, {
        slidesPerView: 2,
        spaceBetween: 0,
        direction: 'horizontal',
        speed: 600,
        grabCursor: true,
        nested: true,
        watchSlidesProgress: true,
        pagination: { el: '#pagination' + i, clickable: true },
        navigation: { prevEl: '#prev' + i, nextEl: '#next' + i },
        breakpoints: {
          0: { slidesPerView: 1.15, spaceBetween: 12 },
          640: { slidesPerView: 1.5, spaceBetween: 14 },
          900: { slidesPerView: 2, spaceBetween: 16 },
          1400: { slidesPerView: 2.5, spaceBetween: 20 },
        },
      }));
    }

    /* PARENT SWIPER */
    var tabs = document.querySelectorAll('#services-col-left .features-item');

    function setActiveTab(idx) {
      tabs.forEach(function (t, i) { t.classList.toggle('active', i === idx); });
      setTimeout(syncCardHeight, 650);
    }

    var parentSwiper = new Swiper('#parentSwiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 700,
      allowTouchMove: false,
      on: {
        slideChange: function () {
          setActiveTab(this.activeIndex);
          innerSwipers.forEach(function (sw, i) {
            if (i !== parentSwiper.activeIndex) sw.slideTo(0, 0);
          });
        }
      }
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = parseInt(tab.dataset.index, 10);
        parentSwiper.slideTo(idx);
        setActiveTab(idx);
      });
    });

    syncCardHeight();

    if (window.ResizeObserver) {
      new ResizeObserver(syncCardHeight)
        .observe(document.getElementById('services-col-left'));
    }
    function syncCardHeight() {
      var cards = document.querySelectorAll('.ado-sideinfo.height-max');
      if (!cards.length) return;
      var max = 0;
      cards.forEach(function (c) {
        c.style.height = 'auto';
        if (c.offsetHeight > max) max = c.offsetHeight;
      });
      cards.forEach(function (c) { c.style.height = max + 'px'; });
    }

    window.addEventListener('resize', syncCardHeight);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initSwipers)
    : initSwipers();

})();
function startMorphAnimation() {
  gsap.registerPlugin(MorphSVGPlugin);

  const tl = gsap.timeline({
    defaults: { duration: 2, ease: "expo.inOut" },
    repeat: -1
  });

  tl.to("#morph", { morphSVG: "#speech" })
    .to("#morph", { morphSVG: "#rocket" })
    .to("#morph", { morphSVG: "#lightning" })
    .to("#morph", { morphSVG: "#thumb" })
    .to("#morph", { morphSVG: "#square" })
    .to("#morph", { morphSVG: "#grid" })
    .to("#morph", { morphSVG: "#bulb" })
    .to("#morph", { morphSVG: "#morph" });

  return tl; // optional (if you want to control it later)
}

// call it
startMorphAnimation();
const achievementData = {
  items: [
    { count: 2012, title: "Year of establishment", subtitle: "More than 13 years in the field", format: "d" },
    { count: 299, title: "Projects are launched", subtitle: "A lot of projects are done" },
    { count: 169, title: "Clients are satisfied", subtitle: "These people love us" },
    { count: 13, title: "Projects in work", subtitle: "What we do right now" }
  ]
};

const wrapper = document.querySelector(".achievement-area6-wrapper");
const mobileWrapper = document.querySelector(".achievement-swiper-wrapper-mobile");
const card = document.querySelector(".achievement-dynamic");

if (wrapper) {
  wrapper.innerHTML = achievementData.items.map(item => `
    <div class="achievement-area6__items">
      <div class="achievement-area6__items-year">
        <span class="odometer"
              data-count="${item.count}"
              ${item.format ? `data-format="${item.format}"` : ""}>
          0
        </span>
      </div>
      <div class="achievement-area6__items-title original-white h5">
        ${item.title}
      </div>
      <p class="achievement-area6__items-subtitle">
        ${item.subtitle}
      </p>
      <div class="achievement-area6__items-thumb"></div>
    </div>
  `).join("");
}

if (mobileWrapper) {
  mobileWrapper.innerHTML = achievementData.items.map(item => `
    <div class="swiper-slide text-center" style="padding: 20px 0;">
      <div class="achievement-area6__items mx-auto">
        <div class="achievement-area6__items-year">
          <span class="odometer"
                data-count="${item.count}"
                ${item.format ? `data-format="${item.format}"` : ""}>
            0
          </span>
        </div>
        <div class="achievement-area6__items-title original-white h5">
          ${item.title}
        </div>
        <p class="achievement-area6__items-subtitle" style="margin-bottom: 0;">
          ${item.subtitle}
        </p>
        <div class="achievement-area6__items-thumb"></div>
      </div>
    </div>
  `).join("");

  if (typeof Swiper !== "undefined") {
    new Swiper('.achievement-swiper-mobile', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.achievement-mobile-pagination',
        clickable: true,
      },
    });
  }
}

// Initialize and trigger odometer after dynamic content is injected
if (typeof jQuery !== "undefined" && typeof Odometer !== "undefined") {
  $('.odometer').each(function () {
    const el = this;
    new Odometer({
      el: el,
      value: 0,
      format: $(el).attr('data-format') || 'd'
    });
  });

  if (jQuery.fn.waypoint) {
    $('.odometer').waypoint(function (direction) {
      if (direction === 'down') {
        let countNumber = $(this.element).attr("data-count");
        $(this.element).html(countNumber);
      }
    }, { offset: '85%' });

    if (window.Waypoint) {
      Waypoint.refreshAll();
    }
  }
}


// Service content image scroll animation (move up & zoom)
function initServiceImageAnimation() {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const serviceImages = document.querySelectorAll('#service-zoom-up-img, img[src*="content_card_02.jpg"]');
    serviceImages.forEach(img => {
      // Set will-change inline for performance optimization
      img.style.willChange = "transform";
      
      gsap.to(img, {
        y: -50,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: img,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }
}

initServiceImageAnimation();

// Search Popup Event Listeners
jQuery(document).ready(function ($) {
  $(document).on("click", ".search-toggle", function (e) {
    e.preventDefault();
    $(".search-popup").addClass("active");
    $(".search-popup input").focus();
  });
  $(document).on("click", "#closeSearch, .search-popup__close button", function () {
    $(".search-popup").removeClass("active");
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".search-popup").removeClass("active");
    }
  });
});

// GSAP Window Showcase Effect
function initWindowEffect() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section = document.querySelector("#ado-window-showcase");
  if (!section) return;

  const layers = gsap.utils.toArray(".ado-window-layer");
  if (layers.length === 0) return;

  // ── 1. Mutation Observer to sync background images for split and zoom layers ──
  layers.forEach(layer => {
    if (layer.classList.contains("layer-split")) {
      const observer = new MutationObserver(() => {
        const bg = layer.style.backgroundImage;
        if (bg && bg !== "none") {
          layer.querySelectorAll(".split-bg").forEach(child => {
            child.style.backgroundImage = bg;
          });
          layer.style.backgroundImage = "none";
        }
      });
      observer.observe(layer, { attributes: true, attributeFilter: ["style"] });
    } else if (layer.classList.contains("layer-zoom")) {
      const observer = new MutationObserver(() => {
        const bg = layer.style.backgroundImage;
        if (bg && bg !== "none") {
          const child = layer.querySelector(".zoom-bg");
          if (child) {
            child.style.backgroundImage = bg;
          }
          layer.style.backgroundImage = "none";
        }
      });
      observer.observe(layer, { attributes: true, attributeFilter: ["style"] });
    }
  });

  // ── 2. Create GSAP ScrollTrigger timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=500%", // Scroll depth extended for 5 layers
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // Set initial z-indexes for pure stacking (no fades)
  gsap.set(".layer-1", { zIndex: 10 });
  gsap.set(".layer-2", { zIndex: 9 });
  gsap.set(".layer-3", { zIndex: 8 });
  gsap.set(".layer-4", { zIndex: 7 });
  gsap.set(".layer-5", { zIndex: 6 });

  // Set initial zoom states (center small size)
  gsap.set(".layer-2 .zoom-bg-wrap", { width: "0", height: "0" });
  gsap.set(".layer-4 .zoom-bg-wrap", { width: "0", height: "0" });

  // ── 3. Centered Large Parallax Text & Description Paragraphs ──
  tl.to(".ado-parallax-text", {
    scale: 1.15,
    letterSpacing: "0.04em",
    ease: "none"
  }, 0);
  tl.to(".ado-parallax-p.p-left", {
    y: -80,
    scale: 1.05,
    ease: "none"
  }, 0);
  tl.to(".ado-parallax-p.p-right", {
    y: -260,
    scale: 0.95,
    ease: "none"
  }, 0); // Runs smoothly across the entire scroll duration

  // Dynamic Text Content Tweens (with micro-scale transitions)
  tl.set(".ado-parallax-text", { textContent: "Digital Marketing" }, 0);

  tl.to(".ado-parallax-text", { scale: 0.8, opacity: 0, duration: 0.15, ease: "power1.in" }, 1.25);
  tl.set(".ado-parallax-text", { textContent: "Creative Strategy" }, 1.4);
  tl.to(".ado-parallax-text", { scale: 1.15, opacity: 1, duration: 0.25, ease: "power1.out" }, 1.4);

  tl.to(".ado-parallax-text", { scale: 0.8, opacity: 0, duration: 0.15, ease: "power1.in" }, 2.75);
  tl.set(".ado-parallax-text", { textContent: "Brand Evolution" }, 2.9);
  tl.to(".ado-parallax-text", { scale: 1.15, opacity: 1, duration: 0.25, ease: "power1.out" }, 2.9);

  tl.to(".ado-parallax-text", { scale: 0.8, opacity: 0, duration: 0.15, ease: "power1.in" }, 4.25);
  tl.set(".ado-parallax-text", { textContent: "Impactful Results" }, 4.4);
  tl.to(".ado-parallax-text", { scale: 1.15, opacity: 1, duration: 0.25, ease: "power1.out" }, 4.4);

  tl.to(".ado-parallax-text", { scale: 0.8, opacity: 0, duration: 0.15, ease: "power1.in" }, 5.75);
  tl.set(".ado-parallax-text", { textContent: "Absolute Growth" }, 5.9);
  tl.to(".ado-parallax-text", { scale: 1.15, opacity: 1, duration: 0.25, ease: "power1.out" }, 5.9);

  // --- Step 1: Split Layer 1 (0 to 1.5) ---
  tl.to(".layer-1 .half-left", {
    xPercent: -100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 0);
  tl.to(".layer-1 .half-right", {
    xPercent: 100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 0);

  // --- Step 2: Zoom Layer 2 (1.5 to 3.0) ---
  tl.to(".layer-2 .zoom-bg-wrap", {
    width: "100vw",
    height: "100vh",
    borderRadius: "0px",
    duration: 1.5,
    ease: "power2.inOut"
  }, 1.5);

  // At 3.0, stack Layer 3, 4, 5
  tl.set(".layer-3", { zIndex: 12 }, 3.0);
  tl.set(".layer-4", { zIndex: 11 }, 3.0);
  tl.set(".layer-5", { zIndex: 10 }, 3.0);

  // --- Step 3: Split Layer 3 (3.0 to 4.5) ---
  tl.to(".layer-3 .half-left", {
    xPercent: -100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 3.0);
  tl.to(".layer-3 .half-right", {
    xPercent: 100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 3.0);

  // --- Step 4: Zoom Layer 4 (4.5 to 6.0) ---
  tl.to(".layer-4 .zoom-bg-wrap", {
    width: "100vw",
    height: "100vh",
    borderRadius: "0px",
    duration: 1.5,
    ease: "power2.inOut"
  }, 4.5);

  // At 6.0, stack Layer 5
  tl.set(".layer-5", { zIndex: 14 }, 6.0);

  // --- Step 5: Split Layer 5 (6.0 to 7.5) ---
  tl.to(".layer-5 .half-left", {
    xPercent: -100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 6.0);
  tl.to(".layer-5 .half-right", {
    xPercent: 100,
    duration: 1.5,
    ease: "power2.inOut"
  }, 6.0);
}

// Call on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWindowEffect);
} else {
  initWindowEffect();
}

// Mobile drawer views controller
jQuery(document).ready(function ($) {
  const sideInfo = document.querySelector('.ado-sideinfo');
  const overlay = document.querySelector('.offcanvas-overlay');

  function setView(view) {
    if (!sideInfo) return;
    
    // Remove existing views
    sideInfo.removeAttribute('data-view');
    
    // Hide all views first
    const menuView = sideInfo.querySelector('.ado-sideinfo__content-menu');
    const contactView = sideInfo.querySelector('.ado-sideinfo__content-contact');
    const chatView = sideInfo.querySelector('.ado-sideinfo__content-chat');
    
    if (menuView) menuView.style.display = 'none';
    if (contactView) contactView.style.display = 'none';
    if (chatView) chatView.style.display = 'none';
    
    // Set new view
    sideInfo.setAttribute('data-view', view);
    
    if (view === 'menu' && menuView) {
      menuView.style.display = 'block';
    } else if (view === 'contact' && contactView) {
      contactView.style.display = 'block';
    } else if (view === 'chat' && chatView) {
      chatView.style.display = 'flex';
      
      // Move chatbot window to this container
      const chatWindow = document.getElementById('ado-chat-window');
      if (chatWindow && chatView) {
        chatView.appendChild(chatWindow);
        chatWindow.classList.add('visible');
        
        // Focus chatbot input
        setTimeout(() => {
          const inputEl = document.getElementById('ado-chat-input');
          if (inputEl) inputEl.focus();
        }, 100);
      }
    }
  }

  function closeSideInfo() {
    if (sideInfo) sideInfo.classList.remove('info-open');
    if (overlay) overlay.classList.remove('overlay-open');
    
    // Restore chatbot back to original location
    const chatWindow = document.getElementById('ado-chat-window');
    if (chatWindow) {
      const chatRoot = document.getElementById('ado-chatbot-root') || document.body;
      if (chatWindow.parentElement !== chatRoot) {
        chatRoot.appendChild(chatWindow);
        chatWindow.classList.remove('visible');
      }
    }
  }

  // 1. Menu Trigger (Mobile bottom nav + desktop toggle)
  $(document).on('click', '.ado-side-toggle, .header__button .mob-nav__item.ado-side-toggle', function (e) {
    e.preventDefault();
    setView('menu');
    if (sideInfo) sideInfo.classList.add('info-open');
    if (overlay) overlay.classList.add('overlay-open');
  });

  // 2. Contact Trigger (Mobile bottom nav redirects to inline contact tab)
  $(document).on('click', '.mob-nav__contact-trigger', function (e) {
    e.preventDefault();
    setView('contact');
    if (sideInfo) sideInfo.classList.add('info-open');
    if (overlay) overlay.classList.add('overlay-open');
  });

  // Support desktop trigger drawers for "Let's Talk" buttons when screen is mobile
  $(document).on('click', '.contact-drawer-trigger', function (e) {
    if (window.innerWidth < 576) {
      e.preventDefault();
      setView('contact');
      if (sideInfo) sideInfo.classList.add('info-open');
      if (overlay) overlay.classList.add('overlay-open');
    }
  });

  // 3. Ado-chat Trigger
  $(document).on('click', '.mob-nav__chat-trigger', function (e) {
    e.preventDefault();
    setView('chat');
    if (sideInfo) sideInfo.classList.add('info-open');
    if (overlay) overlay.classList.add('overlay-open');
  });

  // Close handlers
  $(document).on('click', '#side-info-close, .offcanvas-overlay', function (e) {
    e.preventDefault();
    closeSideInfo();
  });
});

