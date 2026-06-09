(function ($) {
  "use strict";

  let teamScrollTriggers = [];

  window.initTeamMobileStacking = function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Clear any previously created team triggers to prevent duplicates
    teamScrollTriggers.forEach(t => {
      if (t.scrollTrigger) t.scrollTrigger.kill();
      else if (typeof t.kill === "function") t.kill();
    });
    teamScrollTriggers = [];

    let mm = gsap.matchMedia();
    mm.add("(max-width: 575.98px)", () => {
      const cards = gsap.utils.toArray("#ado-team-grid .grc-3");
      if (cards.length === 0) return;

      cards.forEach((card, index) => {
        const flipCard = card.querySelector(".ado-flip-card");
        if (!flipCard) return;
        // Apply hardware acceleration and alignment to the flip card
        flipCard.style.willChange = "transform";
        flipCard.style.transformOrigin = "center top";

        // Animate the flip card to scale down to 0.8 as next cards stack on top of it
        const t = gsap.fromTo(flipCard,
          { scale: 1 },
          {
            scale: 0.8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 80px",
              end: () => `+=${card.offsetHeight}`,
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
        teamScrollTriggers.push(t);
      });

      // Teardown function to revert all inline styles when media query doesn't match
      return () => {
        teamScrollTriggers.forEach(t => {
          if (t.scrollTrigger) t.scrollTrigger.kill();
          else if (typeof t.kill === "function") t.kill();
        });
        teamScrollTriggers = [];

        cards.forEach(card => {
          card.style.position = "";
          card.style.top = "";
          card.style.zIndex = "";
          
          const flipCard = card.querySelector(".ado-flip-card");
          if (flipCard) {
            flipCard.style.willChange = "";
            flipCard.style.transformOrigin = "";
          }
        });
      };
    });
  };

  // Re-run animation register if rendering already completed
  $(document).ready(function () {
    if ($("#ado-team-grid .grc-3").length > 0) {
      window.initTeamMobileStacking();
    }
  });

})(jQuery);
