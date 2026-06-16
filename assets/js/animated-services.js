(function () {
  'use strict';

  function initScrollAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initScrollAnimation, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const triggerSection = document.getElementById('animated-images-services');
    if (!triggerSection) return;

    gsap.set(triggerSection, { perspective: 800 });

    const svgWrap = document.createElement('div');
    svgWrap.id = 'morph-svg-wrap';
    svgWrap.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 4;
      pointer-events: none;
    `;

    svgWrap.innerHTML = `
<svg id="morph-svg" width="195" height="106" viewBox="0 0 195 106" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M118.039 30.0387C118.026 54.1517 118.007 78.2582 117.994 102.371C117.994 104.303 117.004 105.269 115.024 105.269C107.043 105.269 99.0614 105.289 91.0799 105.256C88.0131 105.243 88.0131 105.107 88.1622 102.092C88.2724 99.8361 88.1103 97.5668 88.1103 95.3039C88.1103 74.6986 88.0779 54.0868 88.1557 33.4815C88.1622 31.6012 87.6306 31.2771 85.8864 31.29C74.8771 31.3678 63.8677 31.2382 52.8648 31.3549C45.5446 31.4327 39.2619 34.2725 34.6131 39.8939C28.9139 46.7797 28.9333 54.6444 31.9936 62.6C34.7622 69.8099 40.5068 73.4862 47.9047 74.6532C55.6657 75.8787 63.5046 76.151 71.3499 75.8916C73.1978 75.8333 73.8526 76.2223 73.8267 78.2193C73.7229 86.6676 73.7553 95.1159 73.8526 103.564C73.8785 105.529 73.3599 105.846 71.3758 105.743C63.55 105.341 55.6917 104.822 47.8723 105.12C30.1911 105.795 18.2027 96.8017 9.19682 82.8941C-0.891874 67.3266 -2.46743 50.4106 3.42629 33.0536C7.52401 20.9939 14.9219 11.1127 26.3982 4.81695C32.4929 1.47782 39.1582 0.0838201 46.0115 0.0514014C68.9185 -0.0523383 91.832 0.0319502 114.739 0.0384339C115.841 0.0384339 116.944 0.0643689 117.974 0.537681C118.791 1.27683 118.681 2.27532 118.681 3.22195C118.701 10.4708 118.72 17.7261 118.668 24.9749C118.655 26.6801 118.487 28.3788 118.033 30.0387H118.039Z" fill="white"/>
<path d="M118.039 30.0387C117.384 28.4307 117.955 26.7903 117.948 25.1694C117.916 16.961 117.955 8.74609 117.968 0.537681C130.605 0.472844 143.339 -0.778517 155.826 1.71772C171.329 4.81695 182.325 14.0498 189.283 28.1584C193.711 37.1384 193.996 46.8121 194.016 56.5182C194.055 72.0403 194.009 87.5624 194.061 103.084C194.061 104.576 193.769 105.081 192.161 105.062C184.18 104.971 176.205 104.978 168.223 105.062C166.68 105.075 166.213 104.705 166.311 103.123C166.739 96.1338 167.192 89.1379 167.368 82.1419C167.666 70.3221 167.627 58.5152 163.458 47.1752C162.044 43.3303 160.015 39.881 157.214 36.8596C152.805 32.1005 147.197 30.4147 140.933 30.0776C133.296 29.6626 125.671 29.909 118.033 30.0387H118.039Z" fill="white"/>
</svg>


    `;

    const title = triggerSection.querySelector('.animated-main-title');
    triggerSection.insertBefore(svgWrap, title);

    const firstThreeSpans = gsap.utils.toArray('.char-wrapper:not(.extra-char) .char-span');
    const extraWrappers   = gsap.utils.toArray('.extra-char');
    const extraSpans      = gsap.utils.toArray('.extra-char .char-span');
    const cards           = gsap.utils.toArray('.bg-img-card');
    const paragraphs      = gsap.utils.toArray('.bg-para');

    gsap.set('.animated-main-title', { opacity: 0, scale: 0.85 });
    gsap.set(firstThreeSpans, { opacity: 0 });
    gsap.set(extraWrappers,   { width: 0, opacity: 0 });
    gsap.set(extraSpans,      { opacity: 0, scale: 0 });
    gsap.set(cards,           { scale: 0, opacity: 0, x: 0, y: 0, z: 0 });
    gsap.set(paragraphs,      { y: 60, opacity: 0.5 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerSection,
        start: 'top 95%',
        end:   'bottom 30%',
        scrub: 1.8,
      }
    });

    // SVG scales up slightly, then shrinks flat and fades out
    tl.to('#morph-svg-wrap', {
      scale: 1.15,
      y: -25,
      ease: 'power1.inOut',
      duration: 0.3
    }, 0);

    tl.to('#morph-svg-wrap', {
      scaleY: 0,
      scaleX: 3,
      y: -50,
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.45
    }, 0.3);

    // Cards burst out as SVG collapses
    cards.forEach((card, i) => {
      const angle = (i / cards.length) * Math.PI * 2;
      const destX = Math.cos(angle) * (160 + i * 18);
      const destY = Math.sin(angle) * (110 + i * 14);
      const spin  = i % 2 === 0 ? -10 : 10;

      tl.fromTo(card,
        { scale: 0, opacity: 0, x: 0, y: 0, z: -500, rotation: spin * 2 },
        { scale: 1, opacity: 1, x: destX, y: destY, z: 0, rotation: spin,
          ease: 'power2.out', duration: 0.4 },
        0.3 + i * 0.025
      );

      tl.to(card,
        { scale: 4.2, opacity: 0, z: 700,
          x: destX * 3, y: destY * 3,
          rotation: spin * 3,
          ease: 'power2.in', duration: 0.38 },
        0.52 + i * 0.025
      );
    });

    // Title appears as SVG vanishes
    tl.to('.animated-main-title', {
      opacity: 1, scale: 1,
      ease: 'power2.out', duration: 0.3
    }, 0.55);

    const firstThreeOffsets = [
      { x: -160, y: 0 }, // a (from left)
      { x: 0, y: 160 },  // d (from bottom)
      { x: 160, y: 0 }   // o (from right)
    ];

    tl.fromTo(firstThreeSpans, {
      scale: 2.5,
      opacity: 0,
      x: (i) => firstThreeOffsets[i % firstThreeOffsets.length].x,
      y: (i) => firstThreeOffsets[i % firstThreeOffsets.length].y
    }, {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
      ease: 'power2.out',
      duration: 0.6
    }, 0.55);

    tl.to(extraWrappers, {
      width: () => {
        if (window.innerWidth < 576)  return '24px';
        if (window.innerWidth < 768)  return '36px';
        if (window.innerWidth < 992)  return '54px';
        if (window.innerWidth < 1200) return '7vw';
        return '8.2vw';
      },
      opacity: 1,
      ease: 'power2.inOut',
      duration: 0.65
    }, 0.62);

    const extraOffsets = [
      { x: -160, y: 0 }, // m (from left)
      { x: 0, y: 160 },  // a (from bottom)
      { x: 160, y: 0 },  // n (from right)
      { x: -160, y: 0 }, // t (from left)
      { x: 0, y: 160 },  // r (from bottom)
      { x: 160, y: 0 }   // a (from right)
    ];

    tl.fromTo(extraSpans, {
      scale: 0,
      opacity: 0,
      x: (i) => extraOffsets[i % extraOffsets.length].x,
      y: (i) => extraOffsets[i % extraOffsets.length].y
    }, {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
      ease: 'back.out(1.2)',
      duration: 0.65,
      stagger: 0.02
    }, 0.64);

    paragraphs.forEach((para, i) => {
      tl.to(para, {
        y: 0, opacity: 0,
        ease: 'power2.out', duration: 0.35
      }, 0.88 + i * 0.04);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimation);
  } else {
    initScrollAnimation();
  }
})();