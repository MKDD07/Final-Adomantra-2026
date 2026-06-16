(function ($) {
  "use strict";

  $(document).ready(function () {
    const JSON_PATH = "assets/js/json/pricing.json";
    const $container = $("#pricing-container");
    const $switch = $("#pricingSwitch");
    let pricingData = [];

    // Helper function to format numbers with commas
    function formatNumber(num) {
      return Number(num).toLocaleString('en-US');
    }

    // Function to render pricing items
    function renderPricing(isAnnual) {
      if (!pricingData || pricingData.length === 0) return;

      let html = "";
      pricingData.forEach((plan) => {
        const price = isAnnual ? plan.priceYear : plan.priceMonth;
        const period = isAnnual ? "/ year" : "/ month";
        const bgStyle = plan.styleClass === "style-black";
        
        html += `
          <div class="grc-4">
            <div class="pricing-item h-100 pr style-black effectFade fadeRotateX" data-delay="${plan.delay || '0'}">
              <div class="top d-flex gap-12 align-items-center">
                <div class="d-flex gap-8 align-items-center">
                  <i class="${plan.icon || 'fa-solid fa-gem'} fs-24"></i>
                  <div class="head ms-2">${plan.name}</div>
                </div>
                <div class="${bgStyle ? 'text-neutral-400' : 'text-neutral-400'}">${plan.subtitle}</div>
              </div>
              <div class="heading">
                <div class="d-flex gap-14 align-items-end">
                  <div class="price-number" data-month="${plan.priceMonth}" data-year="${plan.priceYear}">
                    <span>₹</span>${formatNumber(price)}
                  </div>
                  <h6 class="price-per">${period}</h6>
                </div>
                <a href="javascript:void(0)" class="rr-btn contact-drawer-trigger">
                <span class="btn-wrap">
                    <span class="text-one">
                        <i class="fa-solid fa-arrow-right"></i>
                    </span>
                    <span class="text-two">
                        <i class="fa-solid fa-arrow-right"></i>
                    </span>
                </span>
                </a>
              </div>
              <div class="line-new-design"></div>
              <div class="content">
                <div>
                  <div class="title mb-4">What’s included</div>
                  <div class="text">
                    ${plan.description}
                  </div>
                </div>
                <ul class="list-text type-check gap-2 d-flex flex-column">
                  ${plan.features.map(feat => `
                    <li>
                      <i class="fa-solid fa-check icon"></i>
                      ${feat}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        `;
      });

      $container.html(html);

      // Re-trigger visual animations library if it uses WOW or custom loaders
      if (typeof WOW !== 'undefined') {
        new WOW().init();
      }

      initPricingScrollTrigger();
    }

    function initPricingScrollTrigger() {
      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        let mm = gsap.matchMedia();
        mm.add("(max-width: 575.98px)", () => {
          const cards = gsap.utils.toArray("#pricing-container .grc-4");
          if (cards.length === 0) return;
          const triggers = [];

          cards.forEach((card, index) => {
            // Use willChange inline for performance optimization
            card.style.willChange = "transform";
            card.style.transformOrigin = "center center";

            // Animate card to shrink (scale to 0) as it scrolls out of the viewport
            const t = gsap.fromTo(card,
              { scale: 1 },
              {
                scale: 0.8,
                ease: "power1.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 80px",
                  end: "bottom top",
                  scrub: true,
                  invalidateOnRefresh: true
                }
              }
            );
            triggers.push(t);
          });

          return () => {
            triggers.forEach(t => {
              if (t.scrollTrigger) t.scrollTrigger.kill();
              else if (typeof t.kill === "function") t.kill();
            });
            cards.forEach(card => {
              card.style.willChange = "";
              card.style.transformOrigin = "";
            });
          };
        });
      }
    }

    // Fetch pricing configuration
    fetch(JSON_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        pricingData = data;
        const isAnnual = $switch.is(":checked");
        renderPricing(isAnnual);
      })
      .catch((err) => {
        console.error("Error loading pricing data:", err);
        // Fallback display if fetch fails
        $container.html(`
          <div class="col-12 text-center py-5">
            <p class="text-danger">Failed to load pricing configurations. Please try reloading.</p>
          </div>
        `);
      });

    // Handle Monthly vs. Annual toggle with premium GSAP transition
    $switch.on("change", function () {
      const isAnnual = $(this).is(":checked");

      if (typeof gsap !== "undefined") {
        gsap.to("#year-block", {
          opacity: 0,
          y: -5,
          duration: 0.15,
          onComplete: () => {
            $("#year-block").text(isAnnual ? "annually." : "monthly.");
            gsap.to("#year-block", {
              opacity: 1,
              y: 0,
              duration: 0.2
            });
          }
        });

        // Animate the price number and billing period text
        gsap.to(".price-number, .price-per", {
          opacity: 0,
          y: -15,
          duration: 0.2,
          stagger: 0.05,
          ease: "power2.in",
          onComplete: () => {
            // Update values in-place
            $(".price-number").each(function () {
              const $el = $(this);
              const mPrice = $el.data("month");
              const yPrice = $el.data("year");
              $el.html("<span>₹.</span>" + formatNumber(isAnnual ? yPrice : mPrice));
            });

            $(".price-per").each(function () {
              $(this).text(isAnnual ? "/ year" : "/ month");
            });

            // Animate fade-in
            gsap.to(".price-number, .price-per", {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.05,
              ease: "power2.out"
            });
          }
        });
      } else {
        $("#year-block").text(isAnnual ? "annually." : "monthly.");
        // Fallback without GSAP
        renderPricing(isAnnual);
      }
    });

    // Delegated click event for contact drawer trigger
    $container.on("click", ".contact-drawer-trigger", function (e) {
      e.preventDefault();
      const $drawer = $(".contact-drawer");
      const $overlay = $(".contact-drawer-overlay");
      
      if ($drawer.length && $overlay.length) {
        $drawer.addClass("active");
        $overlay.addClass("active");
        $("body").addClass("no-scroll");
      }
    });

  });
})(jQuery);
