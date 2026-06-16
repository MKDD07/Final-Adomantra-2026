const serviceData = {
  "services": [
    {
      "id": "01",
      "title": "Media Strategy & Programmatic Excellence",
      "link": "service-details.html",
      "image": "assets/images/service/service-3_01.png",
      "wow_delay": "0.5s",
      "features": ["Media Planning & Buying", "Programmatic Advertising", "CTV Advertising", "Video Advertising"]
    },
    {
      "id": "02",
      "title": "Performance & Search Marketing",
      "link": "service-details.html",
      "image": "assets/images/service/service-3_02.png",
      "wow_delay": "0.6s",
      "features": ["Search Engine Optimization", "Pay Per Click", "Geo Agency"]
    },
    {
      "id": "03",
      "title": "Creative Innovation & Web Development",
      "link": "service-details.html",
      "image": "assets/images/service/service-3_03.png",
      "wow_delay": "0.7s",
      "features": ["Website & App Development", "Rich Media Innovation", "Content Marketing"]
    },
    {
      "id": "04",
      "title": "Social Engagement & Brand Reputation",
      "link": "service-details.html",
      "image": "assets/images/service/service-3_04.png",
      "wow_delay": "0.9s",
      "features": ["Social Media Marketing", "Reputation Management", "WhatsApp Marketing"]
    }
  ]
};

function renderServices() {
  const container = document.querySelector('.service-section-3__wrapper');

  if (!container) return;

  const htmlContent = serviceData.services.map(service => {
    // Generate the list items dynamically
    const featuresList = service.features
      .map(feature => `<li><span></span>${feature}</li>`)
      .join('');

    return `
      <div class="service-section-3__item wow fadeInUp" data-wow-delay="${service.wow_delay}">
        <div class="service-section-3__number">
          <span>${service.id}.</span>
        </div>
        <div class="service-section-3__info">
          <h3 class="service-section-3__title">
            <a href="${service.link}">${service.title}</a>
          </h3>
          <div class="service-section-3__list">
            <ul>
              ${featuresList}
            </ul>
          </div>
        </div>
        <div class="service-section-3__thumb">
          <img src="${service.image}" alt="${service.title}">
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = htmlContent;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderServices);

document.addEventListener('DOMContentLoaded', function () {
  // 1. Define your Adomantra Milestone Data
  const adomantraMilestones = [
    {
      year: "2012",
      title: "The Inception",
      desc: "Adomantra was founded with a mission to turn bold digital ideas into powerful, measurable results.",
      img: "assets/imgs/home-2/milestone/milestone-1.png"
    },
    {
      year: "2015",
      title: "ISO 9001:2015 Certified",
      desc: "Achieved the gold standard in quality management, ensuring excellence in every campaign we deliver.",
      img: "assets/imgs/home-2/milestone/milestone-2.png"
    },
    {
      year: "2018",
      title: "Redefining Digital",
      desc: "Innovation became our heartbeat as we started scaling premium automation for global brands.",
      img: "assets/imgs/home-2/milestone/milestone-3.png"
    },
    {
      year: "2021",
      title: "Reaching the Unimaginable",
      desc: "Expanded our technological reach, integrating AI to drive impact-driven marketing worldwide.",
      img: "assets/imgs/home-2/milestone/milestone-4.png"
    },
    {
      year: "2024",
      title: "Bold Ideas, Powerful Results",
      desc: "Today, we stand as a leading certified media company, continuing to push the boundaries of what's possible.",
      img: "assets/imgs/home-2/milestone/milestone-1.png"
    }
  ];

  // 2. Inject the Data into the DOM
  const timelineContainer = document.getElementById('adomantra-timeline');
  if (timelineContainer) {
    timelineContainer.innerHTML = adomantraMilestones.map((item, index) => `
            <div class="swiper-slide">
                <div class="milestone-2__item wow fadeInUp" data-wow-delay="${0.2 + (index * 0.1)}s">
                    <div class="milestone-2__content">
                        <span>${item.year}</span>
                        <h6 class="title">${item.title}</h6>
                        <p>${item.desc}</p>
                    </div>
                    <div class="milestone-2__media">
                        <img src="${item.img}" alt="${item.title}">
                    </div>
                </div>
            </div>
        `).join('');
  }

  // 3. Initialize Swiper (Ensuring it runs AFTER injection)
  const swiper = new Swiper('.milestone-2__active', {
    slidesPerView: 1.25,
    spaceBetween: 20,
    speed: 1000,
    loop: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
  slidesOffsetBefore: 0,
  slidesOffsetAfter: 80
    },
    navigation: {
      nextEl: '.milestone-2-next',
      prevEl: '.milestone-2-prev',
    },
    
    breakpoints: {
      576: { slidesPerView: 2, spaceBetween: 30 },
      992: { slidesPerView: 3, spaceBetween: 30 },
      1400: { slidesPerView: 4, spaceBetween: 30 }
    }
  });

  // 4. Refresh WOW.js for the dynamic elements
  if (typeof WOW === 'function') {
    new WOW().init();
  }

  // Make category-swiper-1 overflow visible on the right
  const categoryStyle = document.createElement('style');
  document.head.appendChild(categoryStyle);
});
/**
 * Animation handler for Features section
 * Requires: GSAP and ScrollTrigger plugin
 */
const initFeaturesAnimations = () => {
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".effectFade").forEach((el) => {
      let fromVars = { autoAlpha: 0 };
      let toVars = { autoAlpha: 1, duration: 1, ease: "power3.out" };
      let delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
      toVars.delay = delay;

      // Fade Up Effect
      if (el.classList.contains("fadeUp")) {
        fromVars.y = 50;
        toVars.y = 0;
      }
      // 3D Rotate Effect
      else if (el.classList.contains("fadeRotateX")) {
        fromVars.rotationX = 45;
        fromVars.yPercent = 100;
        fromVars.transformOrigin = "top center -50";
        toVars.rotationX = 0;
        toVars.yPercent = 0;
        toVars.duration = 1;

        // Add perspective to parent if it exists
        if (el.parentNode) {
          el.parentNode.style.perspective = "400px";
        }
      }

      // Trigger Animation on Scroll
      gsap.set(el, fromVars);
      gsap.to(el, {
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
    });

    // Sticky stacking cards for mobile viewports (< 576px)
    let mm = gsap.matchMedia();
    mm.add("(max-width: 575.98px)", () => {
      const cards = gsap.utils.toArray(".features-wrap .features-col .features-card");
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
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", initFeaturesAnimations);

/* ==========================================================
 * Features Section – Dynamic Data & Renderer
 * Targets:
 *   #features-header   → section subtitle / title / intro text
 *   #features-col-left → left column items  (3 items)
 *   #features-col-right → right column items (3 items)
 * ========================================================== */

const featuresData = {
  header: {
    subtitle: "Our USP",
    title: "What Sets Us Apart in <r>Digital Growth<r>",
    description:
      "We don't just market brands — we engineer scalable growth through data-driven strategy, creative excellence, and performance-focused execution. From concept to conversion, every move is designed to deliver measurable impact and long-term success."
  }, leftItems: [
    {
      icon: "fa-solid fa-rocket",
      title: "Customized Brand Strategies",
      description:
        "Every campaign is uniquely crafted around your business goals, audience behavior, and market dynamics—no templates, only precision-driven execution."
    },
    {
      icon: "fa-solid fa-chart-line",
      title: "Data-Driven Performance",
      description:
        "Leverage real-time analytics, audience insights, and programmatic intelligence to maximize reach, engagement, and measurable ROI."
    },
    {
      icon: "fa-solid fa-layer-group",
      title: "Integrated Digital Solutions",
      description:
        "From SEO and social to programmatic and CTV, we create a unified ecosystem where every channel works together for growth."
    }
  ],

  rightItems: [
    {
      icon: "fa-solid fa-arrow-trend-up",
      title: "Scalable Growth Execution",
      description:
        "Campaigns are continuously optimized and scaled to deliver consistent performance, higher conversions, and long-term business impact.",
      delay: "0.1"
    },
    {
      icon: "fa-solid fa-lightbulb",
      title: "Innovation-Led Approach",
      description:
        "We combine creativity with advanced ad-tech formats like video, rich media, and programmatic to stay ahead of digital trends.",
      delay: "0.1"
    },
    {
      icon: "fa-solid fa-handshake",
      title: "Trusted by Leading Brands",
      description:
        "With years of expertise and a strong client portfolio, we deliver reliable, transparent, and result-oriented digital success.",
      delay: "0.1"
    }
  ]
};
/**
 * Builds a single features-item card HTML string.
 * @param {object} item  - one entry from leftItems / rightItems
 * @returns {string}
 */
function buildFeatureItem(item) {
  const delayAttr = item.delay ? ` data-delay="${item.delay}"` : "";
  return `
    <div class="features-card effectFade fadeUp"${delayAttr}>
      <i class="icon ${item.icon}"></i>
      <h6 class="title mb-3">${item.title}</h6>
      <p class="text-secondary">${item.description}</p>
    </div>`;
}

/**
 * Renders the complete features section into the three placeholder containers.
 * Runs GSAP + WOW re-init so animations work on injected elements.
 */
function renderFeatures() {
  const headerEl = document.getElementById("features-header");
  const leftEl = document.getElementById("features-col-left");
  const rightEl = document.getElementById("features-col-right");

  if (!headerEl || !leftEl || !rightEl) return;

  const { header, leftItems, rightItems } = featuresData;

  // -- Header --
  headerEl.innerHTML = `
    <span class="section__subtitle d-none d-md-flex effectFade fadeUp" data-delay="0.2">
      <span></span>${header.subtitle}
    </span>
    <h2 class="title heading-text mt-4 mb-4 " data-delay="0.3">
      ${header.title}
    </h2>
    <p class="w-50x rr_title_anim mb-4" data-delay="0.4">
      ${header.description}
    </p>`;

  // -- Left column --
  leftEl.innerHTML = leftItems.map(buildFeatureItem).join("");

  // -- Right column --
  rightEl.innerHTML = rightItems.map(buildFeatureItem).join("");

  // -- Re-run GSAP scroll-trigger animations for the new elements --
  initFeaturesAnimations();
}

// Run on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  renderFeatures();

  // Identity Section Dynamic Image Hover
  const identityItems = document.querySelectorAll('.identity-2__item');
  const mainImage = document.getElementById('identity-main-image');

  if (identityItems.length && mainImage) {
    identityItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const newImage = item.getAttribute('data-identity-image');
        if (newImage && mainImage.src.indexOf(newImage) === -1) {
          mainImage.classList.add('fade-out');
          setTimeout(() => {
            mainImage.src = newImage;
            mainImage.classList.remove('fade-out');
          }, 300);
        }
      });
    });
  }
});

