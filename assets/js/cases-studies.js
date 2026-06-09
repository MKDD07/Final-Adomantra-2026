/**
 * Case Studies Details Loader
 * Each section renderer now targets a dedicated #id in the HTML instead of appending into a single container.
 */
/* cs-hero: badge, duration, summary, project objective, KPI cards */
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

  const JSON_PATH = "assets/js/json/case-studies-details.json";

  async function init() {
    try {
      const response = await fetch(JSON_PATH);
      const data = await response.json();
      const caseStudy = data.caseStudy;

      if ($("#case-study-detail-section-dynamic").length > 0) {
        renderCaseStudy(caseStudy);
        initCirclesGSAP();
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
    if ($("#service-thumb-1").length && cs.comprehensiveSummary) {
      $("#service-thumb-1")
        .attr("data-target", cs.comprehensiveSummary.imageQuery)
        .attr("data-pexels-mode", "bg");
    }

    // Render each section into its own #id slot
    renderHero(cs);
    renderDetailedSummary(cs);
    renderApproachCircles(cs);
    renderOverview(cs);
    renderAudit(cs);
    renderChallenges(cs);
    renderStrategy(cs);
    renderWeeklyPlan(cs);
    renderResults(cs);
    renderTakeaways(cs);

    // Trigger Pexels scan on injected elements
    if (window.PexelsLoader) window.PexelsLoader.scan();
  }

  /* ── SECTION RENDERERS — each targets a dedicated #id in the HTML ──────── */

  function renderHero(cs) {
    const $el = $("#cs-hero");
    if (!$el.length) return;

    let kpiHtml = "";
    cs.kpis.forEach((kpi, idx) => {
      const highlightClass = idx === 0 ? "highlight" : "";
      kpiHtml += `
        <div class="kpi-card pricing-item style-black ${highlightClass}">
          <span class="kpi-metric">${kpi.metric}</span>
          <label class="kpi-label">${kpi.label}</label>
          <span class="kpi-subtext">${kpi.subtext}</span>
        </div>`;
    });

    $el.html(`
      <header class="cs-hero-section container rr-container-1800">
        <div class="fl f-jcsb f-aie my-2">
          <div class="cs-meta-upper w-100">
            <span class="cs-badge badge-primary">${cs.badge}</span>
            <span class="cs-duration-tag"><time datetime="P6M">${cs.duration}</time></span>
          </div>
        </div>
        <div class="grc">
          <div class="grc-6">
            <h2><r>SUMMARY</r></h2>
            <p class="cs-lead-paragraph">${cs.summary}</p>
          </div>
          <div class="grc-6 features-card">
            <p class="cs-lead-paragraph">${cs.projectobjective}</p>
          </div>
        </div>
        <div class="cs-kpi-dashboard" role="region" aria-label="Key Performance Indicators">
          ${kpiHtml}
        </div>
      </header>`);
  }

  function renderDetailedSummary(cs) {
    const $el = $("#cs-detailed-summary");
    if (!$el.length || !cs.comprehensiveSummary) return;

    $el.html(`
      <section class="cs-comp-summary">
        <div class="grc grc-12">
          <div class="grc-6 order-2 order-md-1 d-flex align-items-center">
            <img data-target="${cs.comprehensiveSummary.imageQuery}"
                 class="img-fluid border-radius-24 shadow-sm w-100"
                 style="height: 380px; object-fit: cover;"
                 alt="${cs.comprehensiveSummary.heading}">
          </div>
          <div class="grc-6 order-1 order-md-2 d-flex flex-column justify-content-center">
            <h2 class="mb-3">${cs.comprehensiveSummary.heading}</h2>
            <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--cs-text-main);">
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
            <svg class="progress-ring" width="120" height="120">
              <circle class="progress-ring__circle bg"
                      stroke="#e2e8f0" stroke-width="4" fill="transparent" r="50" cx="60" cy="60"/>
              <circle class="progress-ring__circle bar"
                      stroke="${block.color}" stroke-width="4" fill="transparent" r="50" cx="60" cy="60"
                      data-target="${block.value}"/>
            </svg>
            <div class="circle-text" style="color:${block.color};">${block.title}</div>
          </div>
          <p class="approach-desc">${block.desc}</p>
        </div>`;
    });

    $el.html(`
      <section class="approach-circles-section">
        <h2>${cs.ourApproachCircles.title}</h2>
        <p class="text-muted">${cs.ourApproachCircles.subtitle}</p>
        <div class="circles-grid">${blocksHtml}</div>
      </section>`);
  }

  function renderOverview(cs) {
    const $el = $("#cs-overview");
    if (!$el.length) return;

    let itemsHtml = cs.clientOverview.dataBox1.items
      .map(item => `<li>${item}</li>`).join("");

    let benchmarkHtml = cs.clientOverview.dataBox2.items
      .map(item => `<dt>${item.label}</dt><dd>${item.value}</dd>`).join("");

    $el.html(`
      <section class="cs-profile-section">
        <h2>${cs.clientOverview.title}</h2>
        <p>${cs.clientOverview.description}</p>
        <div class="cs-grid-two-col">
          <div class="cs-data-box">
            <h3>${cs.clientOverview.dataBox1.title}</h3>
            <ul>${itemsHtml}</ul>
          </div>
          <div class="cs-data-box baseline-metrics">
            <h3>${cs.clientOverview.dataBox2.title}</h3>
            <dl class="cs-definition-list">${benchmarkHtml}</dl>
          </div>
        </div>
      </section>`);
  }

  function renderAudit(cs) {
    const $el = $("#cs-audit");
    if (!$el.length || !cs.campaignAudit) return;

    let categoriesHtml = cs.campaignAudit.categories.map(cat => `
      <div class="audit-category">
        <h4 class="audit-category-title">${cat.name}</h4>
        <div class="audit-item">
          <span class="audit-icon success">✔</span>
          <p class="mb-0 text-secondary">${cat.checked}</p>
        </div>
        <div class="audit-item">
          <span class="audit-icon fail">✖</span>
          <p class="mb-0 text-secondary">${cat.crossed}</p>
        </div>
      </div>`).join("");

    $el.html(`
      <div class="audit-card">
        <h2 class="mb-2">${cs.campaignAudit.title}</h2>
        <p class="text-muted mb-4">${cs.campaignAudit.subtitle}</p>
        <div class="audit-categories">${categoriesHtml}</div>
      </div>`);
  }

  function renderChallenges(cs) {
    const $el = $("#cs-challenges");
    if (!$el.length) return;

    let cardsHtml = cs.challenges.cards.map(card => `
      <article class="challenge-card">
        <div class="challenge-num">${card.num}</div>
        <div class="challenge-body">
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </div>
      </article>`).join("");

    $el.html(`
      <section class="cs-challenge-section">
        <h2>${cs.challenges.title}</h2>
        <p>${cs.challenges.description}</p>
        <div class="cs-card-stack">${cardsHtml}</div>
      </section>`);
  }

  function renderStrategy(cs) {
    const $el = $("#cs-strategy");
    if (!$el.length) return;

    let timelineHtml = cs.strategy.timeline.map(block => {
      let tagsHtml = block.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join("");
      return `
        <div class="timeline-block">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>${block.title}</h3>
            <p>${block.p}</p>
            <div class="tech-tag-container">${tagsHtml}</div>
          </div>
        </div>`;
    }).join("");

    $el.html(`
      <section class="cs-strategy-section">
        <h2>${cs.strategy.title}</h2>
        <p>${cs.strategy.description}</p>
        <div class="cs-timeline">${timelineHtml}</div>
      </section>`);
  }

  function renderWeeklyPlan(cs) {
    const $el = $("#cs-weekly-plan");
    if (!$el.length || !cs.weeklyPlan) return;

    let weeksHtml = cs.weeklyPlan.weeks.map(wk => {
      let tasksHtml = wk.tasks.map(task => {
        const icons    = { completed: "✔", "in-progress": "⚡" };
        const icon     = icons[task.status] || "○";
        const statCls  = task.status || "pending";
        return `
          <li class="task-item ${statCls}">
            <span class="task-status-icon">${icon}</span>
            <span>${task.task}</span>
          </li>`;
      }).join("");

      return `
        <div class="week-card">
          <div class="week-header">
            <div class="week-num">${wk.week}</div>
            <div class="week-theme">${wk.theme}</div>
          </div>
          <ul class="task-list">${tasksHtml}</ul>
        </div>`;
    }).join("");

    $el.html(`
      <section class="weekly-checklist-container">
        <h2>${cs.weeklyPlan.title}</h2>
        <p class="text-muted">${cs.weeklyPlan.subtitle}</p>
        <div class="weeks-grid">${weeksHtml}</div>
      </section>`);
  }

  function renderResults(cs) {
    const $el = $("#cs-results");
    if (!$el.length) return;

    let headersHtml = cs.results.table.headers
      .map(h => `<th>${h}</th>`).join("");

    let rowsHtml = cs.results.table.rows.map(row => {
      const trendClass = row[4].includes("+") ? "trend-positive" : "trend-negative";
      return `
        <tr>
          <td><strong>${row[0]}</strong></td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td><span class="${trendClass}">${row[4]}</span></td>
        </tr>`;
    }).join("");

    $el.html(`
      <section class="cs-results-section">
        <h2>${cs.results.title}</h2>
        <p>${cs.results.description}</p>
        <div class="cs-table-wrapper">
          <table class="cs-data-table">
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <blockquote class="cs-executive-quote">
          <p class="quote-body">${cs.results.quote.body}</p>
          <footer class="quote-footer">
            <cite class="author-name">${cs.results.quote.author}</cite>
            <span class="author-title">${cs.results.quote.authorTitle}</span>
          </footer>
        </blockquote>
      </section>`);
  }

  function renderTakeaways(cs) {
    const $el = $("#cs-takeaways");
    if (!$el.length) return;

    let itemsHtml = cs.summaryFooter.items
      .map(item => `<li>${item}</li>`).join("");

    $el.html(`
      <footer class="cs-summary-footer">
        <h3>${cs.summaryFooter.title}</h3>
        <ul class="takeaways-list">${itemsHtml}</ul>
      </footer>`);
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

  $(document).ready(() => init());

})(jQuery);