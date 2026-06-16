/**
 * Dynamic Services Loader - Optimized for Swiper & Layout
 */

(function ($) {
  "use strict";

  const JSON_PATH = "assets/js/json/data.json";

  async function init() {
    try {
      const response = await fetch(JSON_PATH);
      const data = await response.json();
      const services = Array.isArray(data) ? data : data.services;
      const testimonials = data.testimonials || [];

      if ($("#service-list-container").length > 0) {
        renderServiceList(services);
      }

      if ($("#service-title").length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceSlug = urlParams.get("service") || "ctv-advertising";
        const service = services.find((s) => s.slug === serviceSlug) || services[0];
        renderServiceDetails(service);
      }

      if ($("#testimonial-wrapper").length > 0) {
        renderTestimonials(testimonials);
      }

      if ($("#all-services-grid").length > 0) {
        renderAllServices(services);
      }

      if ($("#sidebar-categories-list").length > 0 || $("#sidebar-categories-dropdown-list").length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("service") || "ctv-advertising";
        renderSidebar(services, activeSlug);
      }
    } catch (error) {
      console.error("Error loading services data:", error);
    }
  }

  function renderServiceDetails(service) {
    if (!service) return;

    const { sections } = service;

    // 1. Hero Section
    if (sections.hero) {
      $("#service-title").html(sections.hero.title || service.title);
      $("#breadcrumb-current").text(service.title);
      $("#service-subtitle").text(sections.hero.subtitle || "");
      $("#service-description").text(sections.hero.description || service.metaDescription);
      $("#service-thumb-1").attr("data-bg-src", service.serviceIcon || "assets/imgs/inner/service-details/service-details-thumb1_1.jpg");
    }

    // 2. Overview Section
    if (sections.overview) {
      $("#how-it-works-title").text(sections.overview.title || "How it works?");
      $("#how-it-works-description").text(sections.overview.content || "");
      $("#service-thumb-2").attr("data-bg-src", sections.overview.image || "assets/imgs/inner/service-details/service-details-thumb1_2.jpg");
      $("#benefit-description").text(sections.overview.content || "");

      // Populate steps/bullets
      const $solutionsList = $("#solutions-list");
      $solutionsList.empty();
      const steps = sections.overview.steps || [];
      steps.forEach((step) => {
        $solutionsList.append(`
          <li>
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
              </svg>
            </div>
            ${step}
          </li>`);
      });
    }

    // 3. Why Choose Section (Previously Benefits Swiper)
    if (sections.solutions) {
      const $solutionsTitle = $("#solutions-title");
      $solutionsTitle.html(sections.solutions.title || `Why Choose Adomantra for ${service.title}?`);


      const $solutionsSwiperGrid = $("#service-benefits-grid");
      if (sections.solutions.solutions) {
        $solutionsSwiperGrid.empty();
        sections.solutions.solutions.forEach((sol) => {
          $solutionsSwiperGrid.append(`
            <div class="swiper-slide">
              <div class="features-card effectFade fadeUp h-100">
                <div class="service-details__card-number"><i class="fa-solid fa-${sol.icon || 'check-circle'} fs-2"></i></div>
                <h5 class="service-details__card-title mb-3">${sol.title}</h5>
                <p class="service-details__card-subtitle">${sol.description}</p>
              </div>
            </div>`);
        });

        // Initialize Swiper
        new Swiper("#benefits-swiper", {
          slidesPerView: 1,
          spaceBetween: 30,
          loop: true,
          autoplay: { delay: 4000, disableOnInteraction: false },
          pagination: { el: "#pagination0", type: "progressbar" },
          navigation: { nextEl: "#next0", prevEl: "#prev0" },
          breakpoints: {
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 }
          }
        });
      }

    }

    // 4. Closing Note Section
    if (sections.benefits && sections.benefits.closingStatement) {
      const $closingNote = $("#closingNote");
      $closingNote.html(sections.benefits.closingStatement || "Our services are designed to boost your online presence, attract the right audience, and drive consistent business growth.");
    }
    // 1. Update Section Heading (Inner Text)
    if (sections.benefits?.title) {
      $("#benifits-title").text(sections.benefits.title);
    }

    // 2. Map and Inject Slides
    const $wrapper = $("#benefits-wrapper");
    $wrapper.empty(); // Clear static placeholders

    sections.benefits?.benefits?.forEach((item, index) => {
      const count = String(index + 1).padStart(2, '0');
      const total = String(sections.benefits.benefits.length).padStart(2, '0');

      // Create Slide Template
      const $slide = $(`
    <div class="swiper-slide">
      <div class="process-card">
        <div class="icon"><i></i></div>
        <div class="content">
          <h4 class="title fw-semibold mb-3"></h4>
          <p class="text text-secondary"></p>
        </div>
        <div class="bot">
          <div class="number">
            <span class="text-neutral-400">${count}</span>
            <span class="text-neutral-200">/${total}</span>
          </div>
        </div>
      </div>
    </div>
  `);

      // Use .text() for the dynamic content (Safe injection)
      $slide.find('h4').text(item.title || "");
      $slide.find('p').text(item.description || "");
      $slide.find('.time').text(item.time || ""); // Assuming you have a 'time' field

      // Update Icon
      if (item.icon) {
        $slide.find('i').attr("class", item.icon);
      }

      $wrapper.append($slide);
    });

    // 3. IMPORTANT: Re-initialize or update Swiper after adding dynamic slides
    if (typeof Swiper !== 'undefined') {
      const swiperElement = document.querySelector('.tf-swiper');
      if (swiperElement && swiperElement.swiper) {
        swiperElement.swiper.update();
      }
    }
    // 5. Industries Section
    if (sections.industries) {
      const $industriesWrap = $(".list-tags");
      if ($industriesWrap.length) {
        $industriesWrap.empty();
        const industries = sections.industries.industries || [];
        industries.forEach(industry => {
          $industriesWrap.append(`<a href="#" class="tags-item fw-semibold">${industry}</a>`);
        });
      }
    }

    // 6. FAQ Section
    if (sections.faq) {
      $("#faq-section").show();
      const $faqAccordion = $("#service-faq-accordion");
      const $faqTitle = $("#faq-title");
      $faqTitle.html(sections.faq.title || "Frequently Asked Questions");

      $faqAccordion.empty();
      sections.faq.faqs.forEach((faq, index) => {
        const id = `faq-${index}`;
        $faqAccordion.append(`
          <div class="accordion-items mb-3">
            <h2 class="accordion-header">
              <button class="ado-faq-trigger w-100 d-flex justify-content-between align-items-center ${index !== 0 ? "collapsed" : ""}"
                type="button" data-bs-toggle="collapse" data-bs-target="#${id}"
                aria-expanded="${index === 0 ? "true" : "false"}" aria-controls="${id}">
                <span>${faq.question}</span>
                <span class="faq-icon"><i class="fa-solid fa-chevron-down"></i></span>
              </button>
            </h2>
            <div id="${id}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}" data-bs-parent="#service-faq-accordion">
              <div class="accordion-body">${faq.answer}</div>
            </div>
          </div>`);
      });
    }

    // 7. CTA Section
    if (sections.cta && sections.cta.enabled) {
      $("#cta-section").show();
      $("#cta-title").text(sections.cta.title);
      $("#cta-subtitle").text(sections.cta.subtitle);
      $("#cta-btn-text").text(sections.cta.buttonText);
      $("#cta-btn").attr("href", sections.cta.buttonUrl);
    }

    // Re-run background and animations
    refreshAssets();
  }
  function refreshAssets() {
    $("[data-bg-src]").each(function () {
      $(this).css("background-image", "url(" + $(this).attr("data-bg-src") + ")");
    });
    if (typeof WOW !== "undefined") { new WOW().init(); }
  }

  function renderAllServices(services) {
    const $grid = $("#all-services-grid");
    $grid.empty();

    const svgIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.1"><line x1="9.5" x2="9.5" y2="7" stroke="#101010"/><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010"/><line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010"/><line y1="9.5" x2="7" y2="9.5" stroke="#101010"/></g></svg>`;

    const gradients = [
      { bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", theme: "dark" },
      { bg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", theme: "dark" },
      { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", theme: "dark" },
      { bg: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)", theme: "dark" },
      { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", theme: "dark" },
      { bg: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)", theme: "dark" },
      { bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", theme: "dark" }
    ];

    services.forEach((service, index) => {
      const num = String(index + 1).padStart(2, "0");
      const style = gradients[index % gradients.length];
      const textColorClass = style.theme === "dark" ? "text-white" : "text-dark";
      const titleColorClass = style.theme === "dark" ? "original-white" : "original-black";
      const iconStroke = style.theme === "dark" ? "#ffffff" : "#101010";

      const dynamicSvgIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.4"><line x1="9.5" x2="9.5" y2="7" stroke="${iconStroke}"/><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="${iconStroke}"/><line x1="12" y1="9.5" x2="19" y2="9.5" stroke="${iconStroke}"/><line y1="9.5" x2="7" y2="9.5" stroke="${iconStroke}"/></g></svg>`;

      const solutions = (service.sections.solutions && service.sections.solutions.solutions) || [];
      const bullets = solutions.slice(0, 3).map(sol =>
        `<li><span>${dynamicSvgIcon}</span>${sol.title}</li>`
      ).join("");

      const html = `
        <div class="swiper-slide">
          <div class="features-item wow fadeInUp h-410 mb-3 p-5 d-flex flex-column justify-content-between" 
               data-wow-delay=".${2 + index}s" 
               style="background: ${style.bg}; border: none; position: relative; overflow: hidden; border-radius: 24px;">
            <div style="position: relative; z-index: 2;">
              <h3 class="service-details__content-title white mb-4 fs-4 ${titleColorClass}">${service.title}</h3>
              <p class="${textColorClass} opacity-75 mb-4" style="font-size: 15px; line-height: 1.6;">${service.metaDescription ? service.metaDescription.slice(0, 120) + "..." : ""}</p>
              <ul class="service-2__list ${textColorClass} opacity-75 d-flex flex-column gap-2" style="list-style: none; padding: 0;">${bullets}</ul>
            </div>
            <div class="mt-4" style="position: relative; z-index: 2;">
              <a class="rr-btn-button2 btn-purple bg-white text-dark small py-2 px-4 rounded-pill" 
                 href="service-details.html?service=${service.slug}"
                 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                 Explore Details
              </a>
            </div>
            <i style="font-size: 96px; opacity: 0.15; color: #fff;" 
               class="position-absolute bottom-0 end-0 mb-4 me-3 ${service.icon || 'fa-solid fa-gear'}"></i>
          </div>
        </div>`;

      $grid.append(html);
    });

    new Swiper("#all-services-swiper", {
      grabCursor: true,
      effect: "cards",
      cardsEffect: {
        slideShadows: false,
        rotate: true,
        perSlideRotate: 2,
        perSlideOffset: 4
      },
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: "#all-services-pagination",
        clickable: true
      },
      navigation: {
        nextEl: "#all-services-next",
        prevEl: "#all-services-prev"
      },
      breakpoints: {
        576: { slidesPerView: 1 },
        768: { slidesPerView: 1 },
        1200: { slidesPerView: 1 }
      }
    });
  }

  function renderTestimonials(testimonials) {
    const $wrapper = $("#testimonial-wrapper");
    $wrapper.empty();

    testimonials.forEach((tm, index) => {
      const html = `
           <div class="swiper-slide">
          <div class="features-card mb-4 wow fadeInUp">
            <div class="testimonial-area4__card-items">
            <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="testimonial-area4__card-items-mentor-items d-flex">
                <div class="testimonial-area4__card-items-mentor-items-info">
                  <div class="testimonial-area4__card-items-mentor-items-info-thumb">
                    <img src="assets/images/service/services-card/service_0001.jpg" alt="${tm.name}"
                      class="testimonial-face-pexels">
                  </div>
                  <div class="testimonial-review-logo">
                    <img src="assets/images/logo/google.svg" alt="Google review" aria-label="Google review">
                  </div>
                  <div class="testimonial-area4__card-items-mentor-items-info-content">
                    <h3 class="testimonial-area4__card-items-mentor-items-info-content-title">${tm.name}</h3>
                    <p class="testimonial-area4__card-items-mentor-items-info-content-subtitle">${tm.position}</p>
                  </div>
                </div>           
              </div>
              <div class="testimonial-area4__card-items-icon d-flex gap-1 mb-2 mt-4">
                <!-- Dynamic Stars (Random 4 or 5) -->
                ${Array.from({ length: 5 }).map((_, i) => {
        const rating = tm.rating || (index % 3 === 0 ? 4 : 5); // Use JSON rating or a deterministic variation
        return `<i class="fa-solid fa-star ${i < rating ? 'text-warning' : 'text-muted opacity-25'}"></i>`;
      }).join('')}
              </div>
              </div>
              <div class="testimonial-area4__card-items-content">
                <p class="testimonial-area4__card-items-content-subtitle">${tm.feedback}</p>
              </div>
            </div>
          </div>
        </div>`;
      $wrapper.append(html);
    });

  }

  function renderSidebar(services, activeSlug) {
    const $list = $("#sidebar-categories-list");
    const $dropdownList = $("#sidebar-categories-dropdown-list");
    const $dropdownToggle = $("#sidebar-categories-toggle");
    const $selectedLabel = $dropdownToggle.find(".selected-label");

    $list.empty();
    if ($dropdownList.length) $dropdownList.empty();

    services.forEach((service) => {
      const isActive = service.slug === activeSlug;
      const icon = service.icon || "fa-solid fa-circle-dot";

      if (isActive) {
        $selectedLabel.text(service.title);
      }

      // Populate Desktop List
      const li = $(`
        <li class="${isActive ? "active" : ""}">
          <a href="service-details.html?service=${service.slug}" title="${service.title}">
            <span class="sidebar-cat-icon"><i class="${icon}"></i></span>
            <span class="sidebar-cat-label">${service.title}</span>
          </a>
        </li>`);
      $list.append(li);

      // Populate Mobile Custom Dropdown
      if ($dropdownList.length) {
        const dropdownItem = $(`
          <li class="${isActive ? "active" : ""}">
            <a href="service-details.html?service=${service.slug}">
              <span class="sidebar-cat-icon"><i class="${icon}"></i></span>
              ${service.title}
            </a>
          </li>`);
        $dropdownList.append(dropdownItem);
      }
    });

    // Handle Mobile Dropdown Toggle
    if ($dropdownToggle.length) {
      $dropdownToggle.on("click", function (e) {
        e.stopPropagation();
        $("#sidebar-categories-dropdown").toggleClass("active");
      });

      // Close dropdown when clicking outside
      $(document).on("click", function () {
        $("#sidebar-categories-dropdown").removeClass("active");
      });
    }

    // --- Contact widget: set link to active service enquiry ---
    const $contactBtn = $(".sidebar-contact__btn");
    if ($contactBtn.length) {
      $contactBtn.attr(
        "href",
        `https://www.adomantra.com/contact?service=${activeSlug}`
      );
    }
  }

  $("#why-choose-title").addClass("animate");
  $(document).ready(() => init());

})(jQuery);
