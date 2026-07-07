/**
 * Case Studies Details Loader
 * Each section renderer now targets a dedicated #id in the HTML instead of appending into a single container.
 */
/* cs-hero: badge, duration, summary, project objective, KPI cards */
/* cs-brand-gallery: 3 images for each brand (10on10 Foods, Kaya, Patanjali) */
/* cs-detailed-summary: pexels image, heading, paragraph */
/* cs-approach-circles: SVG progress rings with title, color, value, desc */
/* cs-overview: client profile list, baseline benchmark definition list */
/* cs-audit: checked / crossed items per audit category */
/* cs-challenges: numbered cards with title and body */
/* cs-strategy: timeline blocks with title, paragraph, tech tags */
/* cs-weekly-plan: week cards with task list and status icons */
/* cs-results: data table with trend indicators, executive quote */
/* cs-takeaways: key learnings list */

/* service-title: case study title */
/* breadcrumb-current: badge name for breadcrumb */
/* service-thumb-1: pexels bg image query target */

(function ($) {
  "use strict";

  const JSON_PATH = "assets/js/json/case-studies-contents.json";
  const LOCAL_STORAGE_KEY = "adomantra_case_studies";

  async function init() {
    try {
      let data = null;
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          data = JSON.parse(cached);
        } catch (e) {
          console.error("Error parsing cached case studies:", e);
        }
      }

      if (!data) {
        const response = await fetch(JSON_PATH);
        data = await response.json();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }

      // Determine which case study to render (using url query param or fallback to first)
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get("case") || urlParams.get("slug");
      
      let caseStudy = null;
      if (slug) {
        caseStudy = data.find(cs => cs.slug === slug || cs.id === slug);
      }
      if (!caseStudy && data && data.length > 0) {
        caseStudy = data[0];
      }

      if ($("#case-study-detail-section-dynamic").length > 0 && caseStudy) {
        renderCaseStudy(caseStudy);
        renderRelatedSlider(data, caseStudy.slug);
        initCirclesGSAP();
        initGSAPAnimations();

        // Trigger mobile animations after all dynamic content is rendered
        if (window.initMobileAnimations) {
          window.initMobileAnimations();
        }
      }
    } catch (error) {
      console.error("Error loading case study details:", error);
    }
  }

  function renderCaseStudy(cs) {
    if (!cs) return;

    // Update global layouts (outside dynamic area)
    if ($("#service-title").length)      $("#service-title").html(cs.title);
    if ($("#breadcrumb-current").length) $("#breadcrumb-current").text(cs.badge);
    if ($("#service-thumb-1").length && cs.hero) {
      $("#service-thumb-1")
        .css("background-image", "url('assets/images/service/services-card/service_0001.jpg')")
        .attr("data-target", cs.hero)
        .attr("data-pexels-mode", "bg")
        .removeAttr("data-pexels-done");
      
      if (window.PexelsLoader) {
        window.PexelsLoader.scan();
      }
    }

    // Render each section into its own #id slot
    renderHero(cs);
    renderBrandGallery(cs);
    renderDetailedSummary(cs);
    renderApproachCircles(cs);
    renderOverview(cs);
    renderAudit(cs);
    renderChallenges(cs);
    renderDetailedParagraph(cs);
    renderOurOptimization(cs);
    renderStrategy(cs);
    renderWeeklyPlan(cs);
    renderResults(cs);
    renderTakeaways(cs);
    renderFinalTakeawayParagraph(cs);

    // Build sidebar Table of Contents index
    buildTOC(cs);

    // Trigger Pexels scan on injected elements
    if (window.PexelsLoader) window.PexelsLoader.scan();
  }

  function buildTOC(cs) {
    const $list = $("#cs-toc-list");
    if (!$list.length) return;
    $list.empty();

    const sections = [];

    if ($("#cs-hero").length && cs.summary) {
      sections.push({ id: "cs-hero", label: "Overview" });
    }
    if ($("#cs-brand-gallery").length && cs.brandImages) {
      sections.push({ id: "cs-brand-gallery", label: "Brand Showcase" });
    }
    if ($("#cs-detailed-summary").length && cs.comprehensiveSummary) {
      sections.push({ id: "cs-detailed-summary", label: "Detailed Summary" });
    }
    if ($("#cs-detailed-paragraph").length && (cs["detaiedParagraph-1"] || cs["detailedParagraph-1"])) {
      sections.push({ id: "cs-detailed-paragraph", label: "Detailed Insights" });
    }
    if ($("#cs-our-optimization").length && (cs["detaiedParagraph-2"] || cs["detailedParagraph-2"] || cs.ourOptimization)) {
      sections.push({ id: "cs-our-optimization", label: "Our Optimization" });
    }
    if ($("#cs-approach-circles").length && cs.ourApproachCircles) {
      sections.push({ id: "cs-approach-circles", label: "Our Approach" });
    }
    if ($("#cs-overview").length && cs.clientOverview) {
      sections.push({ id: "cs-overview", label: "Baseline & Profile" });
    }
    if ($("#cs-audit").length && cs.campaignAudit) {
      sections.push({ id: "cs-audit", label: "Campaign Audit" });
    }
    if ($("#cs-challenges").length && cs.challenges) {
      sections.push({ id: "cs-challenges", label: "Key Challenges" });
    }
    if ($("#cs-strategy").length && cs.strategy) {
      sections.push({ id: "cs-strategy", label: "Growth Journey" });
    }
    if ($("#cs-weekly-plan").length && cs.weeklyPlan) {
      sections.push({ id: "cs-weekly-plan", label: "Execution Plan" });
    }
    if ($("#cs-results").length && cs.results) {
      sections.push({ id: "cs-results", label: "Campaign Results" });
    }
    if ($("#cs-takeaways").length && cs.summaryFooter) {
      sections.push({ id: "cs-takeaways", label: "Key Takeaways" });
    }
    if ($("#cs-final-takeaway").length && (cs["detaiedParagraph-3"] || cs["detailedParagraph-3"] || cs.finalTakeaway || cs.finalTakeawayParagraph)) {
      sections.push({ id: "cs-final-takeaway", label: "Final Takeaway" });
    }

    sections.forEach(sec => {
      $list.append(`<li><a href="#${sec.id}" class="toc-link">${sec.label}</a></li>`);
    });

    // Smooth scroll handler
    $(".toc-link").off("click").on("click", function (e) {
      e.preventDefault();
      const target = $(this).attr("href");
      if ($(target).length) {
        $("html, body").animate({
          scrollTop: $(target).offset().top - 100
        }, 600);
      }
    });

    // ScrollSpy to highlight active section
    $(window).off("scroll.toc").on("scroll.toc", function () {
      const scrollPos = $(document).scrollTop();
      sections.forEach(sec => {
        const $el = $(`#${sec.id}`);
        if ($el.length) {
          const top = $el.offset().top - 150;
          const bottom = top + $el.outerHeight();
          if (scrollPos >= top && scrollPos <= bottom) {
            $(".toc-link").removeClass("active");
            $(`.toc-link[href="#${sec.id}"]`).addClass("active");
          }
        }
      });
    });
  }

  /* ── SECTION RENDERERS — each targets a dedicated #id in the HTML ──────── */

  function renderHero(cs) {
    const $el = $("#cs-hero");
    if (!$el.length) return;

    let kpiHtml = "";
    cs.kpis.forEach((kpi, idx) => {
      const highlightClass = idx === 0 ? "highlight" : "";
      kpiHtml += `
        <div class="m-anim-alternate pricing-item grc-4 p-30 w-100 fl f-jcsb f-aic ${highlightClass}">
        <div>
                    <label class="kpi-label">${kpi.label}</label>

          <span class="kpi-subtext">${kpi.subtext}</span>
          </div>
                      <span class="kpi-metric">${kpi.metric}</span>

        </div>`;
    });

    $el.html(`
      <header class="cs-hero-section">
        <div class="fl f-jcsb f-aie my-2">
          <div class="cs-meta-upper w-100">
            <span class="cs-badge badge-primary">${cs.badge}</span>
            <span class="cs-duration-tag"><time datetime="P6M">${cs.duration}</time></span>
          </div>
        </div>
        <div class="grc">
          <div class="grc-6 p-30 mobile block cs-header-card">
            <h2 class="title-cs" style="--color-white: var(--neutral-100) !important;">Summary</h2>
            <p class="cs-lead-paragraph">${cs.summary}</p>
          </div>
          <div class="grc-6 p-30 cs-info">
            <p class="cs-lead-paragraph">${cs.projectobjective}</p>
          </div>
        <div class="cs-kpi-dashboard grc-12 grc" role="region" aria-label="Key Performance Indicators">
          ${kpiHtml}
        </div>        </div>
      </header>`);
  }

  function renderBrandGallery(cs) {
    const $el = $("#cs-brand-gallery");
    if (!$el.length || !cs.brandImages) return;

    let brandsHtml = "";
    cs.brandImages.forEach(brandObj => {
      let imgsHtml = "";
      brandObj.images.forEach(imgQuery => {
        imgsHtml += `
          <div class="col-4 px-1">
            <div class="brand-image-wrapper">
              <img data-target="${imgQuery}" class="w-100 h-100" alt="${brandObj.brand} image">
            </div>
          </div>`;
      });

      brandsHtml += `
        <div class="col-lg-4 mb-4">
          <div class="brand-gallery-card">
            <h4>${brandObj.brand}</h4>
            <div class="row g-0">
              ${imgsHtml}
            </div>
          </div>
        </div>`;
    });

    $el.html(`
      <section class="brand-showcase-section my-5 container rr-container-1800">
        <h2 class="text-center mb-4">Partner Brand Showcases</h2>
        <div class="row">
          ${brandsHtml}
        </div>
      </section>`);
  }

  function renderDetailedSummary(cs) {
    const $el = $("#cs-detailed-summary");
    if (!$el.length || !cs.comprehensiveSummary) return;

    $el.html(`
      <section class="cs-comp-summary container rr-container-1800">
        <div class="grc grc-12">
          <div class="grc-6 order-2 order-md-1 d-flex align-items-center">
            <img data-target="${cs.comprehensiveSummary.imageQuery}"
                 class="img-fluid"
                 alt="${cs.comprehensiveSummary.heading}">
          </div>
          <div class="grc-6 order-1 order-md-2 d-flex flex-column justify-content-center">
            <h2 class="mb-3">${cs.comprehensiveSummary.heading}</h2>
            <p class="lead-text">
              ${cs.comprehensiveSummary.paragraph}
            </p>
          </div>
        </div>
      </section>`);
  }

  function renderApproachCircles(cs) {
    const $el = $("#cs-approach-circles");
    if (!$el.length || !cs.ourApproachCircles) return;

    let blocksHtml = "";
    cs.ourApproachCircles.blocks.forEach(block => {
      blocksHtml += `
        <div class="approach-circle-block">
          <div class="circle-container">
            <svg class="progress-ring" width="200" height="200" viewBox="0 0 79 79">
              <path d="M78.0578 39.0289C78.0578 60.584 60.584 78.0578 39.0289 78.0578C17.4738 78.0578 0 60.584 0 39.0289C0 17.4738 17.4738 0 39.0289 0C60.584 0 78.0578 17.4738 78.0578 39.0289ZM8.60286 39.0289C8.60286 55.8327 22.2251 69.4549 39.0289 69.4549C55.8327 69.4549 69.4549 55.8327 69.4549 39.0289C69.4549 22.2251 55.8327 8.60286 39.0289 8.60286C22.2251 8.60286 8.60286 22.2251 8.60286 39.0289Z" fill="#E4ECF7" style="fill:#E4ECF7;fill:color(display-p3 0.8941 0.9255 0.9686);fill-opacity:1;"/>
              <circle class="progress-ring__circle bar"
                      stroke="${block.color}" stroke-width="8.6" fill="transparent" r="34.7" cx="39.5" cy="39.5"
                      data-target="${block.value}"/>
            </svg>
            <div class="circle-text" style="color:${block.color};">${block.title}</div>
          </div>
          <p class="approach-desc">${block.desc}</p>
        </div>`;
    });

    $el.html(`
      <section class="approach-circles-section container rr-container-1800">
        <div class="section-header mb-40">
          <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.ourApproachCircles.title}</h2>
          <p class="text-muted mb-0">${cs.ourApproachCircles.subtitle}</p>
        </div>
        <div class="circles-grid">${blocksHtml}</div>
      </section>`);
  }

  function renderOverview(cs) {
    const $el = $("#cs-overview");
    if (!$el.length) return;
    if (!cs.clientOverview || !cs.clientOverview.dataBox1 || !cs.clientOverview.dataBox2) {
      $el.hide();
      return;
    }
    $el.show();

    // Map component items into 3 separate visual vertical cards
    let componentsHtml = cs.clientOverview.dataBox1.items.map((item, idx) => {
      let parts = item.split("</strong>");
      let title = parts[0] ? parts[0] + "</strong>" : `Component ${idx + 1}`;
      let desc = parts[1] || "";
      if (desc.startsWith(":")) {
        desc = desc.substring(1).trim();
      }

      // Match text inside parentheses, e.g. "10on10 Foods"
      let brandMatch = title.match(/\(([^)]+)\)/);
      let brandName = brandMatch ? brandMatch[1] : "";
      
      // Remove parentheses, brand name and trailing colons from title
      let cleanTitle = title.replace(/\s*\([^)]+\)/g, "").replace(/:\s*<\/strong>$/, "</strong>");

      return `
        <div class="pr blue-card border-radius-12 cursor-pointer m-anim-fade-up" onclick="document.getElementById('comp-detail-${idx + 1}').scrollIntoView({ behavior: 'smooth' })">
          <div class="d-flex align-items-center w-100 gap-3">
            <div class="flex-grow-1">
              <h5>${cleanTitle}</h5>
              <p>${desc}</p>
            </div>
            <i class="fa-regular fa-circle-arrow-right ms-3"></i>
          </div>
        </div>`;
    }).join("");

    // Map baseline benchmark items into horizontal bar graphs
    let benchmarkHtml = cs.clientOverview.dataBox2.items.map(item => {
      const progress = typeof item.progress !== "undefined" ? item.progress : 80;
      const hexColors = ["#e63946", "#e76f51", "#f4a261", "#e9c46a", "#a7c957", "#52b788", "#38b000"];
      const colorIndex = Math.min(Math.floor((progress / 100) * hexColors.length), hexColors.length - 1);
      const color = hexColors[colorIndex >= 0 ? colorIndex : 0];
      return `
        <div class="m-anim-fold-away  mb-3 pr">
          <div class="d-flex justify-content-between text-muted small mb-1">
            <span>${item.label}</span>
            <span class="vertical-text mr-4">${item.value}</span>
          </div>
          <div class="delay-progress mb-12">
            <div class="progress-line" style="width: ${progress}%; background: ${color}; height: 100%; transition: width 1.2s ease-out;"></div>
          </div>
        </div>`;
    }).join("");

    $el.html(`
      <section class="cs-profile-section">
        <div class="section-header mb-40">
          <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.clientOverview.title}</h2>
          <p class="mb-0">${cs.clientOverview.description}</p>
        </div>

        <div class="grc mt-5">
          <div class="grc-6">
            <h3 class="mb-3">${cs.clientOverview.dataBox1.title}</h3>
            <div class="components-wrapper">
              ${componentsHtml}
            </div>
          </div>
          <div class="grc-6">
            <h3 class="mb-3">${cs.clientOverview.dataBox2.title}</h3>
            <div class="baseline-bars-wrapper pr mt-3">
              ${benchmarkHtml}
            </div>
          </div>
        </div>
      </section>`);
  }

  function renderAudit(cs) {
    const $el = $("#cs-audit");
    if (!$el.length || !cs.campaignAudit) return;

    const categoryConfig = {
      "Listing Visibility (Dark Store Discovery)": { icon: "fa-chart-line", sub: "Discovery Audit" },
      "Listing Optimization Strategy": { icon: "fa-rectangle-list", sub: "Conversion Audit" },
      "Performance Marketing Coordination": { icon: "fa-bullhorn", sub: "Ad Budget Audit" }
    };

    let categoriesHtml = cs.campaignAudit.categories.map((cat, idx) => {
      const config = categoryConfig[cat.name] || { icon: "fa-circle-info", sub: "Audit Card" };
      // Extract short name without parentheses
      const displayName = cat.name.split(" (")[0];

      return `
        <div class="grc-4 audit-pricing-card m-anim-helix-out state-solution" data-delay="${0.1 * (idx + 1)}">
          <div class="top d-flex gap-12 align-items-center">
            <div class="d-flex gap-8 align-items-center">
              <i class="fa-solid ${config.icon} fs-24"></i>
              <div class="head ms-2">${displayName}</div>
            </div>
            <div class="subtext">${config.sub}</div>
          </div>
          <div class="line-new-design"></div>
          <div class="content">
            <div class="audit-toggle-pane" data-pane="failure">
              <div class="title mb-3"><i class="fa-solid fa-triangle-exclamation icon"></i> Critical Failure</div>
              <div class="text">${cat.crossed}</div>
            </div>
            <div class="audit-toggle-pane" data-pane="solution">
              <div class="title mb-3"><i class="fa-solid fa-circle-check icon"></i> Adomantra Solution</div>
              <div class="text">${cat.checked}</div>
            </div>
          </div>
        </div>`;
    }).join("");

    $el.html(`
      <section class="audit-section-container">
        <div class="audit-wind-doodles d-none d-md-block">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" class="wind-svg">
            <path class="wind-path wind-path-1" d="M -50,180 C 200,60 500,340 800,180 C 1100,20 1300,150 1400,180" fill="none" stroke="rgba(18, 87, 162, 0.15)" stroke-width="2" stroke-dasharray="150, 300" />
            <path class="wind-path wind-path-2" d="M -50,100 C 300,280 650,40 950,220 C 1150,110 1300,140 1400,100" fill="none" stroke="rgba(228, 236, 247, 0.22)" stroke-width="1.5" stroke-dasharray="100, 200" />
            <path class="wind-path wind-path-3" d="M -50,280 C 250,120 550,380 850,200 C 1100,40 1250,290 1400,280" fill="none" stroke="rgba(18, 87, 162, 0.1)" stroke-width="3" stroke-dasharray="200, 400" />
          </svg>
        </div>
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-4 mb-40">
          <div class="section-header mb-0">
            <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.campaignAudit.title}</h2>
            <p class="text-muted mb-0">${cs.campaignAudit.subtitle}</p>
          </div>
          <div class="d-flex align-items-center gap-3 flex-wrap p-3 border-radius-12">
            <span class="text-danger">Failure Audit</span>
            <input type="checkbox" id="auditSwitch" class="tf-switch-check" checked> 
            <span class="text-success">Result Audit</span>
          </div>
        </div>
        <div class="grc">${categoriesHtml}</div>
      </section>`);

    const handleToggle = () => {
      const isChecked = $("#auditSwitch").is(":checked");
      const cards = $(".audit-pricing-card");

      if (isChecked) {
        cards.removeClass("state-failure").addClass("state-solution");
        $(".audit-toggle-pane[data-pane='solution']").fadeIn(250);
        $(".audit-toggle-pane[data-pane='failure']").hide();
        
        cards.each(function(idx) {
          gsap.to(this, {
            transform: `translate(0px, ${idx * 20}px) scale(0.9983, 0.9983)`,
            duration: 0.4,
            ease: "power2.out"
          });
        });
      } else {
        cards.removeClass("state-solution").addClass("state-failure");
        $(".audit-toggle-pane[data-pane='failure']").fadeIn(250);
        $(".audit-toggle-pane[data-pane='solution']").hide();

        cards.each(function(idx) {
          const reverseIdx = 2 - idx;
          gsap.to(this, {
            transform: `translate(0px, ${reverseIdx * 20}px) scale(0.9983, 0.9983)`,
            duration: 0.4,
            ease: "power2.out"
          });
        });
      }
    };

    $(document).off("change", "#auditSwitch").on("change", "#auditSwitch", handleToggle);
    handleToggle();
  }

  function renderChallenges(cs) {
    const $el = $("#cs-challenges");
    if (!$el.length) return;
    if (!cs.challenges || !cs.challenges.cards) {
      $el.hide();
      return;
    }
    $el.show();

    let cardsHtml = cs.challenges.cards.map((card, idx) => {
      const accentColors = ["var(--primary-color)", "var(--sunset)", "var(--ocean)"];
      const bgGradients = [
        "linear-gradient(180deg, rgba(18, 87, 162, 0.03) 0%, rgba(18, 87, 162, 0) 100%)",
        "linear-gradient(180deg, rgba(234, 88, 12, 0.03) 0%, rgba(234, 88, 12, 0) 100%)",
        "linear-gradient(180deg, rgba(22, 163, 74, 0.03) 0%, rgba(22, 163, 74, 0) 100%)"
      ];
      const accentColor = accentColors[idx % accentColors.length];
      const bgGradient = bgGradients[idx % bgGradients.length];

      return `
        <div class="grc-4 m-anim-scale-shrink">
          <article class="challenge-card features-card h-100" style="--accent-color: ${accentColor}; background: ${bgGradient};">
            <span class="challenge-bg-number">${card.num}</span>
            <div class="challenge-header mb-3">
              <span class="challenge-badge">Challenge ${card.num}</span>
            </div>
            <div class="challenge-body">
              <h3 class="challenge-title">${card.title}</h3>
              <p class="challenge-desc">${card.body}</p>
            </div>
          </article>
        </div>`;
    }).join("");

    $el.html(`
      <section class="cs-challenge-section">
        <div class="section-header text-center mb-40">
          <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.challenges.title}</h2>
          <p class="text-muted mx-auto mb-0" style="max-width: 720px; font-size: var(--text-base);">${cs.challenges.description}</p>
        </div>
        <div class="grc">
          ${cardsHtml}
        </div>
      </section>`);
  }

function renderDetailedParagraph(cs) {
  const pText = cs["detaiedParagraph-1"] || cs["detailedParagraph-1"];
  const $el = $("#cs-detailed-paragraph");
  if (!pText || !$el.length) return $el.hide();

  $el.empty().show();
  $el.append('<div class="grc-3"></div>');

  const $content = $('<div class="detailed-paragraph-content grc-6"></div>');
  if (pText.startsWith("<p") || pText.startsWith("<div") || pText.startsWith("<h")) {
    $content.append(pText);
  } else {
    $content.append(`<p>${pText}</p>`);
  }

  $el.append($content);
  $el.append('<div class="grc-1"></div>');
  $el.append(`
    <div class="cs-absolute-sidebar grc-2">
      <nav class="cs-index-nav d-none d-lg-block">
        <h5 class="mb-3">Index</h5>
        <ul class="list-unstyled" id="cs-toc-list"></ul>
      </nav>
    </div>
  `);
}

function renderOurOptimization(cs) {
  const pText = cs["detaiedParagraph-2"] || cs["detailedParagraph-2"] || cs.ourOptimization;
  const $el = $("#cs-our-optimization");
  if (!pText || !$el.length) return $el.hide();

  $el.empty().show();
  $el.append('<div class="grc-3"></div>');

  const $content = $('<div class="our-optimization-content grc-6"></div>');
  if (pText.startsWith("<p") || pText.startsWith("<div") || pText.startsWith("<h")) {
    $content.append(pText);
  } else {
    $content.append(`<p>${pText}</p>`);
  }

  $el.append($content);
  $el.append('<div class="grc-3"></div>');
}

function renderFinalTakeawayParagraph(cs) {
  const pText = cs["detaiedParagraph-3"] || cs["detailedParagraph-3"] || cs.finalTakeaway || cs.finalTakeawayParagraph;
  const $el = $("#cs-final-takeaway");
  if (!pText || !$el.length) return $el.hide();

  $el.empty().show();
  $el.append('<div class="grc-3"></div>');

  const $content = $('<div class="final-takeaway-content grc-6"></div>');
  if (pText.startsWith("<p") || pText.startsWith("<div") || pText.startsWith("<h")) {
    $content.append(pText);
  } else {
    $content.append(`<p>${pText}</p>`);
  }

  $el.append($content);
  $el.append('<div class="grc-3"></div>');

  // Render quote here (below final takeaway paragraph)
  if (cs.results && cs.results.quote && cs.results.quote.body) {
    const quoteHtml = `
    <div class="grc-8 d-none d-lg-block"><img src="assets/images/case-studies/image-card.png" width="300"></div>
      <div class="grc-4 mt-5 pt-4">
        <blockquote class="features-card m-anim-squeeze ">
          <div class="quote-icon-bg" style="position: absolute; right: 20px; top: 10px; font-size: 100px; opacity: 0.04; color: var(--primary-color); pointer-events: none; font-family: serif; font-weight: bold; line-height: 1;">&rdquo;</div>
          <p class="quote-body" style="font-size: var(--text-xl); font-style: italic; color: var(--neutral-850); line-height: 1.8; margin-bottom: 24px; position: relative; z-index: 2;">${cs.results.quote.body}</p>
          <footer class="quote-footer d-flex align-items-center gap-3" style="position: relative; z-index: 2;">
            <div class="quote-avatar" data-target="business professional portrait face headshot" data-pexels-mode="bg" style="width: 48px; height: 48px; border-radius: 50%; background-position: center; background-size: cover; flex-shrink: 0; background-color: var(--neutral-200);"></div>
            <div>
              <cite class="author-name font-bold text-dark d-block" style="font-style: normal;">${cs.results.quote.author}</cite>
              <span class="author-title text-muted" style="font-size: var(--text-sm);">${cs.results.quote.authorTitle}</span>
            </div>
          </footer>
        </blockquote>
      </div>`;
    $el.append(quoteHtml);
  }
}
  function renderStrategy(cs) {
    const $el = $("#cs-strategy");
    if (!$el.length) return;
    if (!cs.strategy || !cs.strategy.timeline) {
      $el.hide();
      return;
    }
    $el.show();

    const progressStepsHtml = cs.strategy.timeline.map((block, idx) => {
      const shortName = block.title.split(" Case")[0].split(" Optimization")[0].split(" Performance")[0].split(" Omnichannel")[0];
      return `
        <li class="progress-step-item" data-index="${idx}">
          <span class="step-dot"></span>
          <span class="step-label">${shortName}</span>
        </li>`;
    }).join("");

    const cardsHtml = cs.strategy.timeline.map((block, idx) => {
      const tagsHtml = block.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join("");
      return `
        <div class="strategy-card grc" id="strategy-phase-${idx}" data-index="${idx}">
          <div class="strategy-card-glow"></div>
          <div class="strategy-card-header grc-8">
            <h3>${block.title}</h3>
            <p>${block.p}</p>
          </div>
          <div class="tech-tag-container grc-4">${tagsHtml}</div>
        </div>`;
    }).join("");

    $el.html(`
      <section class="cs-strategy-section">
        <div class="strategy-layout">
          <!-- Left Column: Sticky Title & Progress Tracker -->
          <div class="strategy-left-col">
            <div class="sticky-strategy-content">
              <span class="section__subtitle  mb-4 effectFade fadeUp"><span></span>Campaign Phases</span>
              <div class="section-header mb-40">
                <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.strategy.title}</h2>
                <p class="strategy-desc-text mb-0">${cs.strategy.description}</p>
              </div>
              
              <div class="strategy-progress-tracker">
                <div class="progress-track-line">
                  <div class="progress-track-fill"></div>
                </div>
                <ul class="progress-steps">
                  ${progressStepsHtml}
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Timeline Cards -->
          <div class="strategy-right-col">
            <div class="strategy-cards-container">
              ${cardsHtml}
            </div>
          </div>
        </div>
      </section>`);
  }

  function renderWeeklyPlan(cs) {
    const $el = $("#cs-weekly-plan");
    if (!$el.length || !cs.weeklyPlan) return;

    let weeksHtml = cs.weeklyPlan.weeks.map((wk, idx) => {
      let tasksHtml = wk.tasks.map(task => {
        const icons    = { 
          completed: `<i class="fa-solid fa-circle-check"></i>`, 
          "in-progress": `<i class="fa-solid fa-circle-notch fa-spin"></i>` 
        };
        const icon     = icons[task.status] || `<i class="fa-regular fa-circle"></i>`;
        const statCls  = task.status || "pending";
        return `
          <li class="task-item ${statCls}">
            <span class="task-status-icon">${icon}</span>
            <span class="task-text">${task.task}</span>
          </li>`;
      }).join("");

      return `
        <div class="week-card-stacked m-anim-zoom-snap" id="week-card-${idx}">
          <span class="overlay"></span>
          <div class="week-card-glow"></div>
          <div class="week-card-header-right">
            <h4 class="week-num-text">${wk.week}</h4>
            <p class="week-theme-text">${wk.theme}</p>
          </div>
          <div class="week-card-content">
            <h3 class="challenge-title mb-3">Phase 0${idx + 1}</h3>
            <ul class="task-list">${tasksHtml}</ul>
          </div>
        </div>`;
    }).join("");

    $el.html(`
      <section class="weekly-checklist-container">
        <div class="weekly-plan-layout">
          <!-- Left Column: Sticky Title -->
          <div class="weekly-plan-left-col">
            <div class="sticky-weekly-content">
              <div class="section-header mb-40">
                <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.weeklyPlan.title}</h2>
                <p class="text-muted mb-0">${cs.weeklyPlan.subtitle}</p>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Timeline Checklist Cards -->
          <div class="weekly-plan-right-col">
            <div class="weeks-stack-container">
              ${weeksHtml}
            </div>
          </div>
        </div>
      </section>`);
  }

  function renderResults(cs) {
    const $el = $("#cs-results");
    if (!$el.length) return;
    if (!cs.results || !cs.results.table || !cs.results.table.rows || !cs.results.quote) {
      $el.hide();
      return;
    }
    $el.show();

    const COLOR_GREEN = "var(--primary-color)";
    const COLOR_RED   = "var(--color-red)";

    // Mapping for rendering beautiful comparative bar charts
    const chartMapping = {
      "Avg Quick Commerce Revenue/Brand": { baseLabel: "₹38 Lakhs", postLabel: "₹4.98 Crores", baseWidth: 10, postWidth: 100, color: COLOR_GREEN },
      "Avg Monthly ROAS": { baseLabel: "2.1x", postLabel: "6.4x", baseWidth: 32, postWidth: 100, color: COLOR_GREEN },
      "Repeat Purchase Rate": { baseLabel: "11%", postLabel: "31%", baseWidth: 35, postWidth: 100, color: COLOR_GREEN },
      "Inventory Out-of-Stock Days/Month": { baseLabel: "10 Days", postLabel: "1.5 Days", baseWidth: 100, postWidth: 15, color: COLOR_GREEN, baseColor: COLOR_RED },
      "Average Order Value": { baseLabel: "₹220", postLabel: "₹345", baseWidth: 63, postWidth: 100, color: COLOR_GREEN },
      "CAC (Customer Acquisition Cost)": { baseLabel: "₹380", postLabel: "₹185", baseWidth: 100, postWidth: 48, color: COLOR_GREEN, baseColor: COLOR_RED },
      "LTV: CAC Ratio": { baseLabel: "3.2:1", postLabel: "8.9:1", baseWidth: 36, postWidth: 100, color: COLOR_GREEN }
    };

    let chartCardsHtml = "";
    cs.results.table.rows.forEach(row => {
      const metricName = row[0];
      const baseline = row[1];
      const postCampaign = row[2];
      const improvement = row[3];

      const mapping = chartMapping[metricName];

      if (mapping) {
        chartCardsHtml += `
          <div class="grc-4 m-anim-blur-fade">
            <div class="chart-card features-card">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="text-dark mb-0">${metricName}</h5>
                <span class="${improvement.includes("-") ? "badge-custom-red" : "badge-custom-green"}">
                  ${improvement}
                </span>
              </div>
              <div class="bar-chart-container">
                <!-- Baseline -->
                <div class="mb-2">
                  <div class="d-flex justify-content-between text-muted small mb-1">
                    <span>Baseline (Pre-Adomantra)</span>
                    <span class="font-semibold">${baseline}</span>
                  </div>
                  <div class="progress-track-base">
                    <div class="progress-bar-base" style="width: ${mapping.baseWidth}%;${mapping.baseColor ? ` background: ${mapping.baseColor};` : ''}"></div>
                  </div>
                </div>
                <!-- Post Adomantra -->
                <div>
                  <div class="d-flex justify-content-between text-dark small mb-1 font-semibold">
                    <span>Post-Adomantra (12-Months)</span>
                    <span style="color: ${mapping.color};">${postCampaign}</span>
                  </div>
                  <div class="progress-track-post">
                    <div class="progress-bar-post" style="background: ${mapping.color}; width: ${mapping.postWidth}%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      } else {
        // Render text indicators for qualitative/rank metrics
        chartCardsHtml += `
          <div class="grc-4 m-anim-blur-fade">
            <div class="chart-card features-card centered">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="text-dark mb-0">${metricName}</h5>
                <span class="badge ${improvement.includes("-") ? "bg-danger" : "bg-success"} text-white">${improvement}</span>
              </div>
              <div class="row text-center mt-2">
                <div class="col-6 border-end">
                  <span class="text-muted small d-block">Baseline</span>
                  <span class="text-secondary value-large">${baseline}</span>
                </div>
                <div class="col-6">
                  <span class="text-dark small d-block font-semibold">Post-Adomantra</span>
                  <span class="text-success value-large">${postCampaign}</span>
                </div>
              </div>
            </div>
          </div>`;
      }
    });

    $el.html(`
      <section class="cs-results-section container rr-container-1800">
        <div class="section-header mb-40">
          <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.results.title}</h2>
          <p class="mb-0">${cs.results.description}</p>
        </div>
        
        <div class="grc">
          ${chartCardsHtml}
        </div>
      </section>`);
  }

  function renderTakeaways(cs) {
    const $el = $("#cs-takeaways");
    if (!$el.length) return;
    if (!cs.summaryFooter || !cs.summaryFooter.items) {
      $el.hide();
      return;
    }
    $el.show();

    const cardsHtml = cs.summaryFooter.items.slice(0, 3).map((item, idx) => {
      const parts = item.split("</strong>");
      const title = parts[0] ? parts[0].replace("<strong>", "") : `Takeaway ${idx + 1}`;
      let bodyText = parts[1] || "";
      if (bodyText.startsWith(":")) {
        bodyText = bodyText.substring(1).trim();
      }
      
      const translateYVal = window.innerWidth < 576
        ? "15px"
        : idx === 1 ? "50px" : "15px";
      return `
        <div class="grc-4 takeaway-card-col-${idx}" style="transform: translateY(${translateYVal});">
          <div class="features-card h-100 p-4 m-anim-fold-away">
            <div class="d-flex align-items-center gap-3 mb-3">
              <h5>${title}</h5>
            </div>
            <p class="text-muted mb-0" style="font-size: var(--text-sm); line-height: 1.6;">${bodyText}</p>
          </div>
        </div>`;
    }).join("");

    $el.html(`
      <footer class="cs-summary-footer container rr-container-1800 mb-5" style="background: transparent; padding: 0; position: relative;">
        <div class="section-header text-center mb-0 mb-md-5">
          <h2 class="title" style="--color-white: var(--neutral-100) !important;">${cs.summaryFooter.title}</h2>
        </div>

        <!-- Flowchart Hub -->
        <div class="d-flex justify-content-center mb-5" style="position: relative; z-index: 10;">
          <div class="takeaway-hub-node features-center features-card fl-shrink">
            <img src="assets/images/logo/logo-white.svg" alt="" style="width: 140px;">
          </div>
        </div>

        <!-- SVG Connecting Lines -->
        <div class="takeaway-flow-svg-wrap d-none d-md-block" style="position: absolute; top: 260px; left: 0; width: 100%; height: 180px; z-index: 1; pointer-events: none;">
          <svg viewBox="0 0 1200 180" preserveAspectRatio="none" style="width: 100%; height: 100%;">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-color)" />
              </marker>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="var(--ocean)" stop-opacity="0.8" />
                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.8" />
              </linearGradient>
            </defs>
            <!-- Paths from center to three columns -->
            <path class="flow-line flow-line-1" d="M 600,0 C 600,60 200,40 200,140" fill="none" stroke="url(#lineGrad)" stroke-width="2" marker-end="url(#arrow)" />
            <path class="flow-line flow-line-2" d="M 600,0 C 600,60 600,60 600.1,165" fill="none" stroke="url(#lineGrad)" stroke-width="2" marker-end="url(#arrow)" />
            <path class="flow-line flow-line-3" d="M 600,0 C 600,60 1000,40 1000,140" fill="none" stroke="url(#lineGrad)" stroke-width="2" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="grc pr z-5 takeaway-card" style="margin-top: 130px">
          ${cardsHtml}
        </div>
      </footer>`);
  }

  function renderRelatedSlider(allCases, currentSlug) {
    const $el = $("#cs-related-slider");
    if (!$el.length || !allCases || allCases.length === 0) return;

    let slidesHtml = "";
    allCases.forEach(cs => {
      const activeClass = cs.slug === currentSlug ? "border border-primary" : "";
      const imgTarget = cs.hero || cs.brand || "business campaign";

      slidesHtml += `
        <div class="swiper-slide h-auto">
          <div class="features-card blog-section-5__item h-100 fl f-col p-3 ${activeClass}">
            <span class="position-relative px-2 py-3 w-auto" style="font-family: Poppins; font-size: 14px; color: var(--primary); font-weight: 500;">
              2026 // ${cs.duration}
            </span>
            <h3 class="blog-section-5__title original-black" style="font-size: 22px; font-weight: 300; line-height: 1.1; margin-bottom: 20px; min-height: 88px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              <a href="case-studies.html?slug=${cs.slug}">${cs.title}</a>
            </h3>
            <div class="blog-thumb-wrap" style="flex-grow: 1; overflow: hidden; border-radius: 24px; min-height: 240px; position: relative;">
              <a href="case-studies.html?slug=${cs.slug}" class="w-100 h-100 d-block">
                <img data-target="${imgTarget}" data-pexels-mode="src" class="w-100 h-100" alt="${cs.brand}" loading="lazy" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; transition: transform 0.8s ease; height: 100%;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              </a>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-4">
              <div class="blog-section-5__meta">
                <span class="tag" style="background: #f4f4f4; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: Poppins;">${cs.badge}</span>
              </div>
              <div class="blog-section-5__icon">
                <a href="case-studies.html?slug=${cs.slug}" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; border-radius: 50%;">
                  <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>`;
    });

    $el.html(`
      <section class="related-cases-slider-section py-5 my-5">
        <div class="row gy-5 fl justify-content-center " style="translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px, 0px);">
          <div class="text-center text-lg-start fl align-items-start f-col mb-40 w-100">
            <span class="section__subtitle d-none d-md-flex " data-wow-delay=".2s"><span></span>Success Stories</span>
            <div class="fl justify-content-between w-100">
              <h2 class="title text-right wow mt-4 mb-4" data-wow-delay="0.3s">Explore Other <r>Case Studies</r></h2>
              <div class="testimonial-area4__controls d-none d-md-flex">
                <div class="inner-nav-btn left" id="testimonial-prev" tabindex="0" role="button" aria-label="Previous slide">
                  <i class="fa-solid fa-angle-left"></i>
                </div>
                <div class="inner-nav-btn right" id="testimonial-next" tabindex="0" role="button" aria-label="Next slide">
                  <i class="fa-solid fa-angle-right"></i>
                </div>
              </div>
            </div>
            <p class="d-none d-md-block " data-wow-delay="0.4s">See how we help businesses succeed through real experiences and results.</p>
          </div>
        </div>
        <div class="swiper related-cases-swiper" style="overflow: hidden; padding-bottom: 20px;">
          <div class="swiper-wrapper">
            ${slidesHtml}
          </div>
        </div>
      </section>`);

    // Initialize Swiper
    new Swiper(".related-cases-swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: false,
      navigation: {
        nextEl: "#testimonial-next",
        prevEl: "#testimonial-prev",
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        }
      }
    });

    if (window.PexelsLoader) {
      window.PexelsLoader.scan();
    }
  }

  function initCirclesGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setTimeout(initCirclesGSAP, 300);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    $(".progress-ring__circle.bar").each(function () {
      const circle       = this;
      const targetVal    = parseFloat($(circle).attr("data-target")) || 0;
      const r            = parseFloat($(circle).attr("r"));
      const circumference = 2 * Math.PI * r;

      circle.style.strokeDasharray  = circumference;
      circle.style.strokeDashoffset = circumference;

      gsap.to(circle, {
        strokeDashoffset: circumference - (targetVal / 100) * circumference,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: circle,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  function initGSAPAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setTimeout(initGSAPAnimations, 300);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Animate the component cards on scroll
    gsap.from(".component-card", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".cs-profile-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    // Pin the left sticky content column using ScrollTrigger (desktop only)
    if (window.innerWidth >= 576 && $(".sticky-weekly-content").length && $(".weekly-plan-layout").length) {
      ScrollTrigger.create({
        trigger: ".weekly-plan-layout",
        start: "top 120px",
        end: "bottom bottom-=450px",
        pin: ".sticky-weekly-content",
        pinSpacing: false
      });
    }

    // Stacking timeline for weekly checklist cards (desktop only – mobile uses m-anim-alternate)
    if ($(".week-card-stacked").length && window.innerWidth >= 576) {
      const stackCards = gsap.utils.toArray(".week-card-stacked");
      stackCards.forEach((card, index) => {
        // Pin this card when it hits top 160px
        ScrollTrigger.create({
          trigger: card,
          start: "top 160px",
          pin: true,
          pinSpacing: false, // Allows the next card to scroll over and stack
          endTrigger: ".weeks-stack-container",
          end: "bottom 580px"
        });

        if (index < stackCards.length - 1) {
          gsap.to(card, {
            scale: 0.94 - (stackCards.length - 1 - index) * 0.015,
            opacity: 0.5,
            scrollTrigger: {
              trigger: stackCards[index + 1],
              start: "top 220px",
              end: "top 160px",
              scrub: true
            }
          });
        }

        // Card focus reveal on scroll (Week 1 starts focused; others scale/fade in as they reach sticky top)
        if (index > 0) {
          gsap.fromTo(card,
            { opacity: 0.8, scale: 0.95 },
            {
              opacity: 1,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 350px",
                end: "top 160px",
                scrub: true
              }
            }
          );
        } else {
          gsap.set(card, { opacity: 1, scale: 1 });
        }

        // Animate card header right metadata when card docks
        const cardHeader = $(card).find(".week-card-header-right");
        if (cardHeader.length) {
          gsap.fromTo(cardHeader,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 165px",
                toggleActions: "play none none none"
              }
            }
          );
        }

        // Checklist task entrance stagger and tick animation
        const tasks = $(card).find(".task-item");

        if (tasks.length) {
          // 1. Initially fade in tasks when card scrolls into view
          gsap.fromTo(tasks,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );

          // Pre-set icon and strike states
          tasks.each(function() {
            const $task = $(this);
            const $icon = $task.find(".task-status-icon i");
            gsap.set($icon, { scale: 0, rotation: -45 });
            gsap.set($task[0], { "--strike-width": "0%" });
          });

          // 2. Animate tick icons popping and draw line-throughs ONLY when card reaches top
          const checklistTl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 165px", // Plays exactly when the card reaches sticky top limit
              toggleActions: "play none none none"
            }
          });

          tasks.each(function(i, taskEl) {
            const $task = $(taskEl);
            const $icon = $task.find(".task-status-icon i");

            checklistTl.to($icon, {
              scale: 1,
              rotation: 0,
              duration: 0.3,
              ease: "back.out(2)"
            }, i === 0 ? 0.1 : "-=0.15");

            if ($task.hasClass("completed")) {
              checklistTl.to($task[0], {
                "--strike-width": "100%",
                duration: 0.4,
                ease: "power1.inOut"
              }, "-=0.1");
            }
          });
        }
      });
    }

    // Animate audit row cards on scroll
    gsap.from(".audit-pricing-card", {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.2)",
      scrollTrigger: {
        trigger: "#cs-audit",
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

    // Animate the approach circle cards on scroll (desktop only, mobile is pinned/scrubbed)
    if (window.innerWidth >= 576) {
      gsap.from(".approach-circle-block", {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".circles-grid",
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    }

    // Strategy timeline ScrollTrigger animations
    if ($(".strategy-card").length && $(".strategy-progress-tracker").length) {
      const cards = gsap.utils.toArray(".strategy-card");
      const stepItems = gsap.utils.toArray(".progress-step-item");
      const totalCards = cards.length;

      cards.forEach((card, idx) => {
        const tags = $(card).find(".tech-tag");
        
        gsap.fromTo(card, 
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "bottom 60%",
              toggleActions: "play none none reverse",
              onToggle: (self) => {
                if (self.isActive) {
                  stepItems.forEach(item => $(item).removeClass("active"));
                  $(stepItems[idx]).addClass("active");
                  
                  const progressPct = ((idx + 1) / totalCards) * 100;
                  gsap.to(".progress-track-fill", { height: `${progressPct}%`, duration: 0.3, ease: "power1.out" });
                }
              }
            }
          }
        );

        if (tags.length) {
          gsap.fromTo(tags,
            { opacity: 0, scale: 0.8, y: 10 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "back.out(1.5)",
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            }
          );
        }
      });

      $(".progress-step-item").off("click").on("click", function() {
        const idx = $(this).data("index");
        const targetCard = $(`#strategy-phase-${idx}`);
        if (targetCard.length) {
          $("html, body").animate({
            scrollTop: targetCard.offset().top - 150
          }, 600);
        }
      });
    }

    // Wind doodle animations triggered by viewport of #cs-audit
    if ($("#cs-audit").length) {
      gsap.to(".audit-wind-doodles .wind-path-1", {
        strokeDashoffset: -1000,
        duration: 20,
        repeat: -1,
        ease: "none",
        scrollTrigger: {
          trigger: "#cs-audit",
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause"
        }
      });
      gsap.to(".audit-wind-doodles .wind-path-2", {
        strokeDashoffset: -800,
        duration: 15,
        repeat: -1,
        ease: "none",
        scrollTrigger: {
          trigger: "#cs-audit",
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause"
        }
      });
      gsap.to(".audit-wind-doodles .wind-path-3", {
        strokeDashoffset: -1200,
        duration: 25,
        repeat: -1,
        ease: "none",
        scrollTrigger: {
          trigger: "#cs-audit",
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause"
        }
      });
    }

    // Executive Quote scroll trigger animation
    if ($(".cs-executive-quote").length) {
      gsap.fromTo(".cs-executive-quote",
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".cs-executive-quote",
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Takeaways cards staggered scroll trigger animation
    if ($(".flow-line").length) {
      // Dynamically calculate and set stroke dash properties for path drawing
      $(".flow-line").each(function() {
        const length = this.getTotalLength ? this.getTotalLength() : 800;
        gsap.set(this, { strokeDasharray: length, strokeDashoffset: length });
      });

      const flowTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#cs-takeaways",
          start: "top 75%",
          toggleActions: "play none none reverse"
        }
      });

      flowTl.from(".takeaway-hub-node", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      });

      flowTl.to(".flow-line", {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut"
      }, "-=0.2");

      flowTl.from([".takeaway-card-col-0", ".takeaway-card-col-1", ".takeaway-card-col-2"], {
        opacity: 0,
        y: 80,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.2)"
      }, "-=0.8");
    }
  }

  $(document).ready(() => init());

})(jQuery);