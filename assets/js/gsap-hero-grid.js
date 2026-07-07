/**
 * GSAP Hero Grid Animation
 * - Dynamic SVG path morph on scroll
 * - Hero grid entrance animations (text, images)
 * - Floating image hover effect
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // 1. Dynamic SVG Path on scroll
  const dynamicPath = document.getElementById("dynamic-path");
  if (dynamicPath) {
    gsap.to("#dynamic-path", {
      attr: { d: "M0,0 Q50,500 100,0" },
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        ease: "power1.inOut"
      }
    });
  }

  // 2. Hero Grid entrance animation
  const heroGrid = document.querySelector(".hero-grid");
  if (heroGrid) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-grid",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    // Animate Text Elements
    tl.from(".display-title", { y: 50, opacity: 0, duration: 1, ease: "power4.out" })
      .from(".lead-text", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

    // Animate Main Image (Scale & Clip Path)
    tl.from(".main-image-wrapper", {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1.5,
      ease: "power4.inOut"
    }, "-=1");

    // Animate Floating Image with a "Pop"
    tl.from(".floating-image-wrapper", {
      scale: 0,
      rotation: -15,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=0.5");
  }

  // 3. Continuous Floating Hover Effect
  const floatingWrapper = document.querySelector(".floating-image-wrapper");
  if (floatingWrapper) {
    gsap.to(".floating-image-wrapper", {
      y: 20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  // 4. Immersive Achievements Banner Animation
  function initJourneyAnimation() {
    const journeyContainer = document.getElementById('immersive-journey-container');
    if (!journeyContainer) return;

    // Select the slides/elements
    const slideAchievement = document.getElementById('journey-achievement');
    if (!slideAchievement) return;

    // Element references for Immersive Achievements
    const achievementWrapper = slideAchievement.querySelector(".achievement-split-wrapper");
    const halfLeft = slideAchievement.querySelector(".half-left");
    const halfRight = slideAchievement.querySelector(".half-right");
    const stats = slideAchievement.querySelectorAll(".stat-item");
    const slogan = slideAchievement.querySelector(".achievement-slogan-overlay");
    const revealedBg = slideAchievement.querySelector(".achievement-revealed-bg");
    const revealedContent = slideAchievement.querySelector(".revealed-content");

    // Initialize odometer instances for each stat element
    const odometerInstances = [];
    if (typeof Odometer !== 'undefined') {
      stats.forEach(stat => {
        const odometerEl = stat.querySelector(".odometer");
        if (odometerEl) {
          // Create the odometer instance with initial value 0
          const od = new Odometer({
            el: odometerEl,
            value: 0,
            format: odometerEl.getAttribute('data-format') || 'd'
          });
          odometerInstances.push({
            el: odometerEl,
            odometer: od,
            count: parseInt(odometerEl.getAttribute('data-count'), 10) || 0
          });
        }
      });
    }



    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 992px)",
      isMobile: "(max-width: 991px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      if (isDesktop) {
        // --- DESKTOP ANIMATION: PINNED SCROLLTRIGGER TIMELINE ---

        // Initial State Setup
        gsap.set(achievementWrapper, { scale: 0.75, borderRadius: "24px", pointerEvents: "auto" });
        gsap.set(slogan, { opacity: 1, y: 0 });
        gsap.set(stats, { opacity: 0, y: 30 });
        gsap.set(revealedBg, { opacity: 0, pointerEvents: "none" });
        gsap.set(revealedContent, { opacity: 0, scale: 0.95 });
        gsap.set(halfLeft, { xPercent: 0 });
        gsap.set(halfRight, { xPercent: 0 });
        
        // Reset odometer values back to 0 on desktop initialization
        odometerInstances.forEach(item => {
          item.odometer.update(0);
        });

        // Build Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: journeyContainer,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // Scale up achievement card and remove border-radius
        tl.to(achievementWrapper, {
          scale: 1,
          borderRadius: "0px",
          duration: 0.65,
          ease: "power2.inOut"
        }, 0.05);

        // Fade out initial slogan overlay
        tl.to(slogan, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: "power2.out"
        }, 0.15);

        // Fade in stats and trigger odometers
        stats.forEach((stat, idx) => {
          tl.to(stat, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "back.out(1.4)",
            onStart: () => {
              const odometerEl = stat.querySelector(".odometer");
              if (odometerEl) {
                const instance = odometerInstances.find(item => item.el === odometerEl);
                if (instance) {
                  instance.odometer.update(instance.count);
                }
              }
            }
          }, 0.45 + idx * 0.18);
        });

        // Split the image halves horizontally
        tl.to(halfLeft, {
          xPercent: -100,
          duration: 0.85,
          ease: "power2.inOut"
        }, 1.85);

        tl.to(halfRight, {
          xPercent: 100,
          duration: 0.85,
          ease: "power2.inOut"
        }, 1.85);

        tl.to(achievementWrapper, {
          pointerEvents: "none",
          duration: 0.1
        }, 1.85);

        // Fade out stats during the split
        tl.to(stats, {
          opacity: 0,
          scale: 0.85,
          duration: 0.55,
          ease: "power2.inOut"
        }, 1.85);

        // Reveal the content underneath
        tl.to(revealedBg, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.65,
          ease: "power2.inOut"
        }, 1.95);

        tl.to(revealedContent, {
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: "power2.out"
        }, 2.15);

      } else {
        // --- MOBILE ANIMATION (No Pinning, simpler entrance triggers) ---
        gsap.set(achievementWrapper, { scale: 1, borderRadius: "12px" });
        gsap.set(slogan, { opacity: 1 });
        gsap.set(stats, { opacity: 0, y: 30 });
        gsap.set(halfLeft, { xPercent: 0 });
        gsap.set(halfRight, { xPercent: 0 });

        // Reset odometer values back to 0 on mobile initialization
        odometerInstances.forEach(item => {
          item.odometer.update(0);
        });

        // Trigger stats fade-in & odometers as they scroll into view
        ScrollTrigger.batch(stats, {
          onEnter: batch => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.6,
              ease: "power2.out",
              onStart: function() {
                batch.forEach(el => {
                  const odometerEl = el.querySelector(".odometer");
                  if (odometerEl) {
                    const instance = odometerInstances.find(item => item.el === odometerEl);
                    if (instance) {
                      instance.odometer.update(instance.count);
                    }
                  }
                });
              }
            });
          },
          start: "top 85%"
        });
      }
    });
  }

  // Run the initialization
  initJourneyAnimation();
})();
