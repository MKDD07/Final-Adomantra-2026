/**
 * Fade Reveal Section - Scroll-based content stepper
 * Switches text steps and images based on scroll progress
 */
(function () {
  "use strict";

  const section = document.getElementById('fade-reveal-section');
  if (!section) return;

  const textSteps = document.querySelectorAll('.reveal-step');
  const imageItems = document.querySelectorAll('.reveal-image-item');

  if (textSteps.length === 0 || imageItems.length === 0) return;

  let currentIndex = 0;
  const totalSteps = 3;
  let ticking = false;

  function updateContent(newIndex) {
    if (newIndex === currentIndex) return;

    // Remove active
    textSteps[currentIndex].classList.remove('active');
    imageItems[currentIndex].classList.remove('active');

    // Add active
    textSteps[newIndex].classList.add('active');
    imageItems[newIndex].classList.add('active');

    currentIndex = newIndex;
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const viewportHeight = window.innerHeight;

    const progress = 0.8 - (sectionTop / viewportHeight);
    const clampedProgress = Math.max(0, Math.min(1, progress));

    const newIndex = Math.floor(clampedProgress * totalSteps);
    const finalIndex = Math.min(newIndex, totalSteps - 1);

    updateContent(finalIndex);
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
})();
