/**
 * Mobile-Specific Scroll Animations (<576px)
 * Adomantra 2026
 *
 * Exposes window.initMobileAnimations() so dynamically-rendered pages
 * (e.g. case-studies.js) can trigger animations after DOM injection.
 * Also exposes window.teardownMobileAnimations() to revert everything
 * cleanly if the viewport grows past the mobile breakpoint.
 *
 * ──────────────────────────────────────────────────────────────────
 * ANIMATION REFERENCE GUIDE (class → what it does)
 * ──────────────────────────────────────────────────────────────────
 * .m-anim-fade-up        Fades + slides up and out
 * .m-anim-slide-left     Slides out to the left
 * .m-anim-slide-right    Slides out to the right
 * .m-anim-alternate      Child cards alternate left/right exit
 * .m-anim-sticky-stack   Pins, then gets covered by the next card (deck stack)
 * .m-anim-scale-shrink   Shrinks + moves up, no opacity change
 * .m-anim-flip-back      3D-rotates backward and falls away while fading
 * .m-anim-squeeze        Horizontally squeezes shut, then exits up
 * .m-anim-helix-out      Spins slightly while drifting up and to the left
 * .m-anim-blur-fade      Blurs + fades out smoothly                [NEW]
 * .m-anim-curtain-close  Wipes shut top-to-bottom like a curtain   [NEW]
 * .m-anim-bounce-down    Squashes and sinks down with a soft bounce[NEW]
 * .m-anim-zoom-snap      Very fast shrink-to-nothing "snap" exit   [NEW]
 * .m-anim-fold-away      Folds upward from the bottom, like a book closing [NEW]
 * ──────────────────────────────────────────────────────────────────
 *
 * FIXES APPLIED IN THIS REWORK
 * 1. GSAP/ScrollTrigger load check now polls (up to ~5s) instead of
 *    giving up after a single 500ms retry.
 * 2. MutationObserver no longer silently fails to attach when the
 *    dynamic container doesn't exist yet at DOMContentLoaded — it now
 *    observes document.body so dynamically-injected sections are
 *    always caught.
 * 3. .m-anim-alternate now tracks individual items instead of the
 *    whole container, so items added later to an already-seen
 *    container still get animated.
 * 4. .m-anim-sticky-stack cards now get an incrementing z-index
 *    (via gsap.set, so it's also cleanly reverted) for correct
 *    visual stacking order.
 * 5. Added a resize/orientation listener: if the viewport crosses the
 *    576px breakpoint, all mobile ScrollTriggers are killed and every
 *    inline style they set is cleared (no leftover transforms/opacity
 *    if a user rotates a tablet or resizes a browser window). If the
 *    viewport returns to mobile, animations re-initialize cleanly.
 * 6. Every tween is now tracked centrally so teardown is reliable.
 */
(function () {
  "use strict";

  const MOBILE_BREAKPOINT = 576;

  // Track which elements have already been animated to avoid duplicates
  let _animated = new WeakSet();

  // Track every tween/ScrollTrigger we create so we can cleanly revert them
  let _triggers = [];

  let _isMobileActive = false;
  let _gsapPollAttempts = 0;
  const _GSAP_MAX_ATTEMPTS = 20; // ~5s total at 250ms intervals

  function _track(tween) {
    if (tween) _triggers.push(tween);
  }

  function _debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function initMobileAnimations() {
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;
    _isMobileActive = true;
    _gsapPollAttempts = 0;
    _waitForGsap();
  }

  function _waitForGsap() {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      _run();
      return;
    }
    if (_gsapPollAttempts >= _GSAP_MAX_ATTEMPTS) {
      console.warn("[mobile-animations] GSAP/ScrollTrigger never loaded; animations disabled.");
      return;
    }
    _gsapPollAttempts++;
    setTimeout(_waitForGsap, 250);
  }

  function _teardown() {
    _triggers.forEach((tw) => {
      try {
        if (tw.scrollTrigger) tw.scrollTrigger.kill();
        gsap.set(tw.targets(), { clearProps: "all" });
        tw.kill();
      } catch (e) {
        /* tween already gone, ignore */
      }
    });
    _triggers = [];
    _animated = new WeakSet();
    _isMobileActive = false;
  }

  function _checkViewport() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile && !_isMobileActive) {
      initMobileAnimations();
    } else if (!isMobile && _isMobileActive) {
      _teardown();
    }
  }

  function _run() {
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // Universal Card Scroll Animations (EXIT at top)
    // Cards are visible by default; they animate OUT
    // when scrolled up past the top of the viewport.
    // ==========================================

    function animateExit(selector, toVars) {
      gsap.utils.toArray(selector).forEach((el) => {
        if (_animated.has(el)) return;
        _animated.add(el);
        const tw = gsap.to(el, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start: "top 20%",
            end: "top -5%",
            scrub: 0.4,
            toggleActions: "play none none reverse"
          }
        });
        _track(tw);
      });
    }

    // Option 1: Fade & slide up out of view
    animateExit(".m-anim-fade-up", { opacity: 0, y: -45, duration: 0.8, ease: "power2.in" });

    // Option 2: Slide out to left / right
    animateExit(".m-anim-slide-left", { opacity: 0, x: -80, duration: 0.8, ease: "power2.in" });
    animateExit(".m-anim-slide-right", { opacity: 0, x: 80, duration: 0.8, ease: "power2.in" });

    // Option 3: Alternating exit (m-anim-alternate)
    // The class goes directly on each element to animate.
    // Odd/even index among siblings determines exit direction.
    gsap.utils.toArray(".m-anim-alternate").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      // Determine sibling index for alternation
      const siblings = el.parentElement
        ? Array.from(el.parentElement.querySelectorAll(".m-anim-alternate"))
        : [el];
      const idx = siblings.indexOf(el);
      const exitLeft = idx % 2 === 0;

      const tw = gsap.to(el, {
        opacity: 0,
        x: exitLeft ? -90 : 90,
        y: -20,
        duration: 0.85,
        ease: "power2.in",
        scrollTrigger: {
          trigger: el,
          start: "top 20%",
          end: "top -5%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });
      _track(tw);
    });

    // ==========================================
    // Card Exit Animations
    // ==========================================

    /**
     * Sticky Stack Effect — .m-anim-sticky-stack
     * Card pins at the top viewport edge while the next card scrolls
     * over it, creating a stacked deck aesthetic. Scales slightly down
     * and dims to add perspective depth.
     * FIX: each card gets an incrementing z-index (set via gsap.set so
     * teardown's clearProps:"all" reverts it cleanly too) — otherwise
     * stacking order between pinned cards was undefined.
     */
    let _stackZIndex = 10;
    gsap.utils.toArray(".m-anim-sticky-stack").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      gsap.set(el, { zIndex: _stackZIndex++ });

      const tw = gsap.to(el, {
        scale: 0.9,
        opacity: 0.5,
        scrollTrigger: {
          trigger: el,
          start: "top 10%",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      _track(tw);
    });

    /**
     * Scale Down Exit (No Opacity Change) — .m-anim-scale-shrink
     */
    animateExit(".m-anim-scale-shrink", {
      scale: 0.65,
      y: -65,
      transformOrigin: "center center",
      duration: 0.8,
      ease: "power1.inOut"
    });

    /**
     * 3D Flip Away — .m-anim-flip-back
     * Rotates backward on its X-axis (falling away from camera) while
     * fading out upwards.
     */
    gsap.utils.toArray(".m-anim-flip-back").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      if (el.parentElement) {
        gsap.set(el.parentElement, { perspective: 800 });
      }

      const tw = gsap.to(el, {
        opacity: 0,
        rotationX: -50,
        z: -120,
        y: -60,
        transformOrigin: "top center",
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: "top 20%",
          end: "top -5%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });
      _track(tw);
    });

    /**
     * Horizontal Squeeze Collapse — .m-anim-squeeze
     */
    animateExit(".m-anim-squeeze", {
      opacity: 0,
      scaleX: 0.35,
      y: -75,
      transformOrigin: "center center",
      duration: 0.75,
      ease: "power2.in"
    });

    /**
     * Helix Spin Drift — .m-anim-helix-out
     */
    animateExit(".m-anim-helix-out", {
      rotation: -15,
      x: -50,
      y: -80,
      transformOrigin: "center center",
      duration: 0.85,
      ease: "sine.in"
    });

    // ==========================================
    // NEW: 5 additional exit animations
    // ==========================================

    /**
     * Blur Fade — .m-anim-blur-fade
     * Fades and softly blurs out while easing upward and shrinking
     * a touch, like the card is going out of focus.
     * Note: filter is explicitly set to blur(0px) first so GSAP has a
     * valid numeric starting point to tween from.
     */
    gsap.utils.toArray(".m-anim-blur-fade").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      gsap.set(el, { filter: "blur(0px)" });

      const tw = gsap.to(el, {
        opacity: 0,
        filter: "blur(12px)",
        y: -20,
        scale: 0.97,
        duration: 0.8,
        ease: "power2.in",
        scrollTrigger: {
          trigger: el,
          start: "top 20%",
          end: "top -5%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });
      _track(tw);
    });

    /**
     * Curtain Close — .m-anim-curtain-close
     * Wipes the card shut from the bottom up using clip-path, like
     * closing a curtain or shutter.
     */
    gsap.utils.toArray(".m-anim-curtain-close").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });

      const tw = gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top 20%",
          end: "top -5%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });
      _track(tw);
    });

    /**
     * Bounce Down — .m-anim-bounce-down
     * Squashes vertically and sinks downward out of view with a soft
     * springy ease, like the card is settling and sliding under the
     * next section.
     */
    animateExit(".m-anim-bounce-down", {
      opacity: 0,
      y: 60,
      scaleY: 0.6,
      transformOrigin: "bottom center",
      duration: 0.6,
      ease: "back.in(1.7)"
    });

    /**
     * Zoom Snap — .m-anim-zoom-snap
     * Smooth shrink to 0.8 → freeze briefly → snap up and away.
     */
    gsap.utils.toArray(".m-anim-zoom-snap").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 10%",
          end: "top -30%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });

      // Step 1: smooth shrink to 0.8
      tl.to(el, { scale: 0.8, duration: 0.35, ease: "power2.out" });

      // Step 2: freeze at 0.8 for a beat
      tl.to(el, { scale: 0.8, duration: 0.2 });

      // Step 3: snap up and away
      tl.to(el, { opacity: 0, scale: 0.2, y: -60, duration: 0.35, ease: "power4.in" });

      _track(tl);
    });

    /**
     * Fold Away — .m-anim-fold-away
     * Folds upward from the bottom edge, like a page or a book cover
     * closing, then fades out.
     */
    gsap.utils.toArray(".m-anim-fold-away").forEach((el) => {
      if (_animated.has(el)) return;
      _animated.add(el);

      if (el.parentElement) {
        gsap.set(el.parentElement, { perspective: 800 });
      }

      const tw = gsap.to(el, {
        opacity: 0,
        rotationX: 80,
        y: -10,
        transformOrigin: "bottom center",
        duration: 0.75,
        ease: "power2.in",
        scrollTrigger: {
          trigger: el,
          start: "top 20%",
          end: "top -5%",
          scrub: 0.4,
          toggleActions: "play none none reverse"
        }
      });
      _track(tw);
    });
  }

  // ==========================================
  // Expose globally so other scripts can call after DOM injection
  // ==========================================
  window.initMobileAnimations = initMobileAnimations;
  window.teardownMobileAnimations = _teardown;

  // Initial check once DOM is ready
  document.addEventListener("DOMContentLoaded", _checkViewport);

  // FIX: re-check on resize/orientation change so we don't leave stale
  // ScrollTriggers or inline transforms behind when crossing 576px,
  // and so we re-initialize cleanly if the user resizes back to mobile.
  window.addEventListener("resize", _debounce(_checkViewport, 200));
  window.addEventListener("orientationchange", _debounce(_checkViewport, 200));

  // FIX: MutationObserver now watches document.body directly instead of
  // the specific #case-study-detail-section-dynamic element. The old
  // code returned early (and never attached an observer at all) if that
  // element didn't exist yet at DOMContentLoaded — which is exactly the
  // case for dynamically-rendered content injected after page load.
  document.addEventListener("DOMContentLoaded", () => {
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.innerWidth >= MOBILE_BREAKPOINT) return;
        initMobileAnimations();
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();