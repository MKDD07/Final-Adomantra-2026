/**
 * GSAP Heading Text Slider
 * Cycles through heading text variants on the hero section using GSAP TextPlugin
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined") return;

  const headingEl = document.getElementById("heading-slider");
  if (!headingEl) return;

  gsap.registerPlugin(TextPlugin);

  const texts = [
    'Redefining <span class="highlight">Media</span> with<br> <span class="highlight">Digital</span> Innovation',
    'Transforming <span class="highlight">Media</span> with<br> <span class="highlight">Digital</span> Innovation',
    'Reimagining <span class="highlight">Media</span> with<br> <span class="highlight">Digital</span> Innovation',
    'Redefining <span class="highlight">Media</span> through<br> <span class="highlight">Digital</span> Innovation'
  ];

  let i = 0;

  function changeText() {
    i = (i + 1) % texts.length;

    gsap.to("#heading-slider", {
      duration: 0.5,
      innerHTML: texts[i],
      ease: "none"
    });
  }

  setInterval(changeText, 10000);
})();
