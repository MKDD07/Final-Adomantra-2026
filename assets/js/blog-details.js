/**
 * blog-details.js
 * Slug-driven blog renderer — 4 newspaper designs, NewsAPI via news_config.js, JSON fallback.
 * Images sourced from blog JSON data; static fallbacks if missing.
 */

(function () {
  'use strict';

  /* ─── Fallback image pool ────────────────────────────────────────────── */
  const FALLBACKS = [
    'assets/images/inner/blog-details/blog-details1_1.jpg',
    'assets/images/inner/blog-details/blog-details1_2.jpg',
    'assets/images/inner/blog-details/blog-details1_3.jpg',
    'assets/images/service/services-card/service_0001.jpg',
    'assets/images/service/services-card/service_0002.jpg',
  ];

  function fallback(index) {
    return FALLBACKS[index % FALLBACKS.length];
  }

  /* ─── Pull images from a blog object ────────────────────────────────── */
  function extractImages(blog) {
    const images = [];

    // hero
    const heroSrc = blog.images?.hero?.src || blog.images?.hero || null;
    if (heroSrc) images.push(heroSrc);

    // thumb
    const thumbSrc = blog.images?.thumb?.src || blog.images?.thumb || null;
    if (thumbSrc && !images.includes(thumbSrc)) images.push(thumbSrc);

    // gallery array
    const gallery = blog.images?.gallery || [];
    gallery.forEach(g => {
      const s = g?.src || g;
      if (s && !images.includes(s)) images.push(s);
    });

    // grid_sections images
    const grids = blog.content?.grid_sections || [];
    grids.forEach(row => {
      (row.items || []).forEach(item => {
        if (item.type === 'image' && item.src && !images.includes(item.src))
          images.push(item.src);
      });
    });

    // pad with fallbacks up to 5
    while (images.length < 5) images.push(fallback(images.length));

    return images; // [0]=hero, [1..4]=content images
  }

  /* ─── Design selector — deterministic from slug ─────────────────────── */
  const DESIGNS = ['design-classic', 'design-modern', 'design-magazine', 'design-courier'];

  function pickDesign(slug) {
    const hash = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return DESIGNS[hash % 4];
  }

  /* ─── Helpers ────────────────────────────────────────────────────────── */
  function imgTag(src, alt, cls) {
    return `<img src="${src}" alt="${alt || ''}" class="${cls || ''}" loading="lazy">`;
  }

  function capTag(label) {
    return label ? `<figcaption class="bd-caption">${label}</figcaption>` : '';
  }

  /* ─── 4 Layout renderers ─────────────────────────────────────────────── */

  // CLASSIC — image left / intro right, sections below, mid-break image
  function renderClassic(blog, imgs, intro, sections) {
    const hasIntro = intro && intro.trim();
    let html = `
      <div class="bd-classic">
        <p class="bd-intro bd-drop-cap" style="display: ${hasIntro ? 'block' : 'none'};">${intro || ''}</p>
        <div class="bd-sections">`;

    sections.forEach((sec, i) => {
      html += `
          <div class="bd-section">
            <p class="bd-section__body">${sec.text}</p>
          </div>`;
      if (i === 0 && imgs[2]) {
        html += `
          <figure class="bd-figure bd-figure--full">
            ${imgTag(imgs[2], sec.title)}
            ${capTag('Fig 2. Contextual overview.')}
          </figure>`;
      }
    });

    html += `</div></div>`;
    return html;
  }

  // MODERN — full intro, briefing card, first section splits with image
  function renderModern(blog, imgs, intro, sections) {
    const bullets = sections
      .map(s => `<li><strong>${s.title}:</strong> ${s.text.split('.')[0]}.</li>`)
      .join('');

    const hasIntro = intro && intro.trim();
    let html = `
      <div class="bd-modern">
        <p class="bd-intro bd-drop-cap" style="display: ${hasIntro ? 'block' : 'none'};">${intro || ''}</p>
        <div class="bd-briefing">
          <h5 class="bd-briefing__head">Key Takeaways</h5>
          <ul class="bd-briefing__list">${bullets}</ul>
        </div>
        <div class="bd-sections">`;

    sections.forEach((sec, i) => {
      if (i === 0) {
        html += `
          <div class="bd-section bd-section--split">
            <div class="bd-section__text">
              <p class="bd-section__body">${sec.text}</p>
            </div>
            <figure class="bd-figure">
              ${imgTag(imgs[1], sec.title)}
            </figure>
          </div>`;
      } else {
        html += `
          <div class="bd-section">
            <p class="bd-section__body">${sec.text}</p>
          </div>`;
        if (i === 1) {
          html += `<blockquote class="bd-pullquote">"${sec.title} drives strategic market differentiation."</blockquote>`;
        }
      }
    });

    html += `</div></div>`;
    return html;
  }

  // MAGAZINE — category badge, drop-cap intro, pull-quote center, dual image grid
  function renderMagazine(blog, imgs, intro, sections) {
    const hasIntro = intro && intro.trim();
    let html = `
      <div class="bd-magazine">
        <span class="bd-badge">${blog.category || 'Insights'}</span>
        <p class="bd-intro bd-drop-cap" style="display: ${hasIntro ? 'block' : 'none'};">${intro || ''}</p>
        <div class="bd-sections">`;

    sections.forEach((sec, i) => {
      html += `
          <div class="bd-section">
            <p class="bd-section__body">${sec.text}</p>
          </div>`;
      if (i === 0) {
        const q = sections[1]?.text?.split('.')[0] || sec.text.split('.')[0];
        html += `
          <div class="bd-pullquote-center">
            <p>"${q}."</p>
          </div>`;
      }
    });

    html += `</div>`;

    if (imgs[1] || imgs[2]) {
      html += `
        <div class="bd-dual-images">
          <figure class="bd-figure">${imgTag(imgs[1] || fallback(1), 'Visual 1')}</figure>
          <figure class="bd-figure">${imgTag(imgs[2] || fallback(2), 'Visual 2')}</figure>
        </div>`;
    }

    html += `</div>`;
    return html;
  }

  // COURIER — intro full-width, then alternating meta-col / content-col rows with inline images
  function renderCourier(blog, imgs, intro, sections) {
    const hasIntro = intro && intro.trim();
    let html = `
      <div class="bd-courier">
        <p class="bd-intro bd-drop-cap" style="display: ${hasIntro ? 'block' : 'none'};">${intro || ''}</p>`;

    sections.forEach((sec, i) => {
      html += `
        <div class="bd-courier__row grc">
          <div class="bd-courier__meta grc-6">
            <div class="bd-courier__card">
              ${imgTag(imgs[i + 1], sec.title, "bd-courier__card-img")}
              <div class="bd-courier__card-overlay"></div>
              <div class="bd-courier__card-content">
                <h4 class="bd-courier__meta-title">${sec.title}</h4>
              </div>
            </div>
          </div>
          <div class="bd-courier__content grc-6">
            <p>${sec.text}</p>
          </div>
        </div>`;
    });

    html += `</div>`;
    return html;
  }

  function getBlockStyles(sec, additionalStyles = '') {
    let styles = [];
    if (sec.textColor) {
      styles.push(`color: ${sec.textColor};`);
    }
    if (sec.bgColor) {
      styles.push(`background-color: ${sec.bgColor};`);
      styles.push(`padding: var(--sp-4);`);
      styles.push(`border-radius: var(--rounded-card);`);
    }
    if (additionalStyles) {
      styles.push(additionalStyles);
    }
    return styles.length > 0 ? `style="${styles.join(' ')}"` : '';
  }

  // DYNAMIC CARD LAYOUT — renders custom layout based on section configuration
  function renderCardLayout(blog, sections) {
    const cardIntro = blog.content?.introduction || '';
    const hasIntro = cardIntro && cardIntro.trim();
    let html = `
      <div class="bd-card-layout">
        <p class="bd-intro bd-drop-cap" style="display: ${hasIntro ? 'block' : 'none'};">${cardIntro}</p>
        <div class="bd-sections">`;

    sections.forEach((sec, i) => {
      let secHTML = '';

      if (sec.type === 'heading') {
        const tag = sec.level || 'h2';
        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            <${tag} class="bd-card-heading" style="font-size: var(--text-2xl); font-weight: var(--font-bold); margin-top: var(--sp-6); margin-bottom: var(--sp-3); color: inherit;">${escapeHtml(sec.title)}</${tag}>
          </div>`;
      } else if (sec.type === 'table') {
        const tableHTML = parseTableToHTML(sec.text);
        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            <div class="table-responsive" style="width:100%; overflow-x:auto; margin: var(--sp-6) 0; border: 1px solid var(--neutral-200); border-radius: var(--rounded-card);">
              ${tableHTML}
            </div>
          </div>`;
      } else if (sec.type === 'quote') {
        secHTML = `
          <div class="bd-card-row quote-mark" ${getBlockStyles(sec)}>
            <blockquote class="bd-pullquote pr" style="padding: var(--sp-3) var(--sp-4);
    margin: var(--sp-6) 0;
    border-left: none;
    font-style: italic;
    color: inherit;
    font-family: 'Cormorant Garamond';
    font-size: 36px;
    text-align: center;
    border-radius: var(--rounded-card);
}"><span class="add-svg"><svg 
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 379.51"
  shape-rendering="geometricPrecision"
  text-rendering="geometricPrecision"
  image-rendering="optimizeQuality"
  fill-rule="evenodd"
  clip-rule="evenodd"
  fill="currentColor"
  style="width:60px; height:auto; color:#d4a373;"
>
<path d="M212.27 33.98C131.02 56.52 78.14 103.65 64.99 185.67c-3.58 22.32 1.42 5.46 16.55-5.86 49.4-36.96 146.53-23.88 160.01 60.56 27.12 149.48-159.79 175.36-215.11 92.8-12.87-19.19-21.39-41.59-24.46-66.19C-11.35 159.99 43.48 64.7 139.8 19.94c17.82-8.28 36.6-14.76 56.81-19.51 10.12-2.05 17.47 3.46 20.86 12.77 2.87 7.95 3.85 16.72-5.2 20.78zm267.78 0c-81.25 22.54-134.14 69.67-147.28 151.69-3.58 22.32 1.42 5.46 16.55-5.86 49.4-36.96 146.53-23.88 160 60.56 27.13 149.48-159.78 175.36-215.1 92.8-12.87-19.19-21.39-41.59-24.46-66.19C256.43 159.99 311.25 64.7 407.58 19.94 425.4 11.66 444.17 5.18 464.39.43c10.12-2.05 17.47 3.46 20.86 12.77 2.87 7.95 3.85 16.72-5.2 20.78z"/></svg></span>${escapeHtml(sec.text)} <span class="add-svg"><svg 
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 379.51"
  shape-rendering="geometricPrecision"
  text-rendering="geometricPrecision"
  image-rendering="optimizeQuality"
  fill-rule="evenodd"
  clip-rule="evenodd"
  fill="currentColor"
  style="width:60px; height:auto; color:#d4a373;"
>
<path d="M212.27 33.98C131.02 56.52 78.14 103.65 64.99 185.67c-3.58 22.32 1.42 5.46 16.55-5.86 49.4-36.96 146.53-23.88 160.01 60.56 27.12 149.48-159.79 175.36-215.11 92.8-12.87-19.19-21.39-41.59-24.46-66.19C-11.35 159.99 43.48 64.7 139.8 19.94c17.82-8.28 36.6-14.76 56.81-19.51 10.12-2.05 17.47 3.46 20.86 12.77 2.87 7.95 3.85 16.72-5.2 20.78zm267.78 0c-81.25 22.54-134.14 69.67-147.28 151.69-3.58 22.32 1.42 5.46 16.55-5.86 49.4-36.96 146.53-23.88 160 60.56 27.13 149.48-159.78 175.36-215.1 92.8-12.87-19.19-21.39-41.59-24.46-66.19C256.43 159.99 311.25 64.7 407.58 19.94 425.4 11.66 444.17 5.18 464.39.43c10.12-2.05 17.47 3.46 20.86 12.77 2.87 7.95 3.85 16.72-5.2 20.78z"/></svg></span>
            
</blockquote>
          </div>`;
      } else if (sec.type === 'code') {
        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            <pre style="background: var(--neutral-950); color: var(--neutral-100); padding: var(--sp-4); border-radius: var(--rounded-card); font-family: monospace; font-size: 14px; overflow-x: auto; margin: var(--sp-4) 0;"><code>${escapeHtml(sec.text)}</code></pre>
          </div>`;
      } else if (sec.type === 'richtext') {
        const position = sec.layout?.position || sec.position || 'none';
        const imageSrc = sec.image || '';
        const w = sec.imageWidth || '50';
        const textW = 100 - parseInt(w);

        let richtextHTML = '';

        if (position === 'none' || !imageSrc) {
          richtextHTML = `
            <div class="bd-rich-text-content" style="font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit;">
              ${sec.text}
            </div>`;
        } else if (position === 'top') {
          richtextHTML = `
            <div class="bd-rich-text-content-wrapper" style="display: flex; flex-direction: column; gap: var(--sp-4);">
              <figure class="bd-figure" style="width: ${w}%; max-width: 100%; margin: 0 auto;">
                ${imgTag(imageSrc, 'Rich Text Image')}
              </figure>
              <div class="bd-rich-text-content" style="font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit;">
                ${sec.text}
              </div>
            </div>`;
        } else { // 'left' or 'right'
          richtextHTML = `
            <div class="bd-rich-text-content-wrapper grc" style="display: flex; gap: var(--sp-6); align-items: flex-start; flex-direction: ${position === 'left' ? 'row' : 'row-reverse'};">
              <div class="grc-6 bd-rich-side-media" style="width: ${w}%; flex: 0 0 ${w}%; max-width: ${w}%; margin: 0;">
                <figure class="bd-figure" style="width: 100%; margin: 0;">
                  ${imgTag(imageSrc, 'Rich Text Image')}
                </figure>
              </div>
              <div class="grc-6 bd-rich-side-text" style="width: ${textW}%; flex: 0 0 ${textW}%; max-width: ${textW}%; margin: 0; font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit;">
                <div class="bd-rich-text-content">
                  ${sec.text}
                </div>
              </div>
            </div>`;
        }

        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            ${richtextHTML}
          </div>`;
      } else if (sec.type === 'list') {
        const items = (sec.text || '').split('\n').map(item => item.trim()).filter(Boolean);
        let listHTML = `<ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: var(--sp-2); margin: var(--sp-4) 0;">`;
        items.forEach(item => {
          listHTML += `
            <li style="display: flex; align-items: flex-start; gap: 10px; font-size: var(--text-base); color: inherit;">
              <div class="icon" style="flex-shrink: 0; margin-top: 3px; display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                  <line x1="9.5" x2="9.5" y2="7" stroke="${sec.textColor || '#101010'}"></line>
                  <line x1="9.5" y1="12" x2="9.5" y2="19" stroke="${sec.textColor || '#101010'}"></line>
                  <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="${sec.textColor || '#101010'}"></line>
                  <line y1="9.5" x2="7" y2="9.5" stroke="${sec.textColor || '#101010'}"></line>
                </svg>
              </div>
              <span style="line-height: var(--font-body-high-line-height);">${escapeHtml(item)}</span>
            </li>`;
        });
        listHTML += `</ul>`;
        secHTML = `<div class="bd-card-row" ${getBlockStyles(sec)}>${listHTML}</div>`;
      } else if (!sec.image && sec.title && sec.text) {
        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            <h3 class="bd-card-title-split" style="color: inherit; font-size: var(--text-2xl); margin-top: var(--sp-6); margin-bottom: var(--sp-3);">${sec.title}</h3>
            <p style="font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit; text-align: justify; margin: 0;">${sec.text}</p>
          </div>`;
      } else if (!sec.image && sec.text) {
        secHTML = `
          <div class="bd-card-row" ${getBlockStyles(sec)}>
            <p style="font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit; text-align: justify; margin: 0;">${sec.text}</p>
          </div>`;
      } else if (sec.image) {
        const layout = sec.layout || { position: 'center', aspectRatio: '21/9' };
        const position = layout.position || 'center';
        const aspectRatio = layout.aspectRatio || '21/9';
        const imageSrc = sec.image;
        const widthStyle = sec.imageWidth ? `width: ${sec.imageWidth}%; max-width: 100%; margin: 0 auto;` : '';

        if (position === 'center') {
          secHTML = `
            <div class="bd-card-row bd-card-row--center" ${getBlockStyles(sec)}>
              <div class="bd-card-banner" style="aspect-ratio: ${aspectRatio.replace('/', ' / ')}; ${widthStyle}">
                ${imgTag(imageSrc, sec.title, 'bd-card-img')}
                <div class="bd-card-overlay"></div>
                <div class="bd-card-banner-content">
                  <h3 class="bd-card-title">${sec.title}</h3>
                </div>
              </div>
              <div class="bd-card-body-text" style="margin-top: var(--sp-3);">
                <p style="font-size: var(--text-base); line-height: var(--font-body-high-line-height); color: inherit; text-align: justify; margin: 0;">${sec.text}</p>
              </div>
            </div>`;
        } else if (position === 'left') {
          const textWidthVal = sec.imageWidth ? (100 - parseInt(sec.imageWidth)) : 50;
          secHTML = `
            <div class="bd-card-row grc bd-card-row--split bd-card-row--left" ${getBlockStyles(sec)}>
              <div class="bd-card-media grc-6" style="${widthStyle}">
                <div class="bd-card-square" style="aspect-ratio: ${aspectRatio.replace('/', ' / ')}; position: relative;">
                  ${imgTag(imageSrc, sec.title, 'bd-card-img')}
                  <div class="bd-card-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%); z-index: 2;"></div>
                  <div class="bd-card-banner-content" style="position: absolute; bottom: 15px; left: 15px; right: 15px; z-index: 3;">
                    <h4 class="bd-card-title" style="font-size: var(--text-lg); font-weight: var(--font-bold); color: #ffffff; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${sec.title}</h4>
                  </div>
                </div>
              </div>
              <div class="bd-card-text grc-6" style="${sec.imageWidth ? `width: ${textWidthVal}%; flex: 0 0 ${textWidthVal}%; max-width: ${textWidthVal}%;` : ''}">
                <p style="color: inherit; margin: 0;">${sec.text}</p>
              </div>
            </div>`;
        } else if (position === 'right') {
          const textWidthVal = sec.imageWidth ? (100 - parseInt(sec.imageWidth)) : 50;
          secHTML = `
            <div class="bd-card-row grc bd-card-row--split bd-card-row--right" ${getBlockStyles(sec)}>
              <div class="bd-card-text grc-6" style="${sec.imageWidth ? `width: ${textWidthVal}%; flex: 0 0 ${textWidthVal}%; max-width: ${textWidthVal}%;` : ''}">
                <p style="color: inherit; margin: 0;">${sec.text}</p>
              </div>
              <div class="bd-card-media grc-6" style="${widthStyle}">
                <div class="bd-card-square" style="aspect-ratio: ${aspectRatio.replace('/', ' / ')}; position: relative;">
                  ${imgTag(imageSrc, sec.title, 'bd-card-img')}
                  <div class="bd-card-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%); z-index: 2;"></div>
                  <div class="bd-card-banner-content" style="position: absolute; bottom: 15px; left: 15px; right: 15px; z-index: 3;">
                    <h4 class="bd-card-title" style="font-size: var(--text-lg); font-weight: var(--font-bold); color: #ffffff; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${sec.title}</h4>
                  </div>
                </div>
              </div>
            </div>`;
        }
      }

      html += secHTML;
    });

    html += `</div></div>`;
    return html;
  }

  function parseTableToHTML(pipeText) {
    if (!pipeText) return '';
    const rows = pipeText.split('\n').map(row => row.split('|').map(cell => cell.trim())).filter(row => row.length > 0 && row[0] !== '');
    if (!rows.length) return '';
    
    let html = '<table class="table" style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:0;">';
    // Header
    html += '<thead><tr style="background:var(--neutral-100); border-bottom:2px solid var(--neutral-200);">';
    rows[0].forEach(cell => {
      html += `<th style="padding:12px; text-align:left; font-weight:600; color:var(--neutral-900);">${escapeHtml(cell)}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Body
    for (let i = 1; i < rows.length; i++) {
      html += '<tr style="border-bottom:1px solid var(--neutral-200);">';
      rows[i].forEach(cell => {
        html += `<td style="padding:12px; text-align:left; color:var(--neutral-700);">${escapeHtml(cell || '')}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  /* ─── FAQ block ──────────────────────────────────────────────────────── */
  function renderFAQ(faqs) {
    if (!faqs || !faqs.length) return '';
    return `
      <div class="bd-faq features-card">
        <h3 class="bd-faq__title">Common Queries</h3>
        ${faqs.map((faq, i) => `
          <div class="bd-faq__item" id="faq-${i}">
            <button class="bd-faq__question" onclick="this.closest('.bd-faq__item').classList.toggle('is-open')" aria-expanded="false">
              <span>${faq.question}</span>
              <svg class="bd-faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <div class="bd-faq__answer"><p>${faq.answer}</p></div>
          </div>`).join('')}
      </div>`;
  }

  /* ─── Tags block ─────────────────────────────────────────────────────── */
  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    return `
      <div class="bd-tags">
        <span class="bd-tags__label">TAGS:</span>
        ${tags.map(t => `<span class="bd-tag">${t.toUpperCase()}</span>`).join('')}
      </div>`;
  }

  /* ─── Comment block ──────────────────────────────────────────────────── */
  function renderComments() {
    return `
      <div class="bd-comments features-card">
        <h3 class="bd-comments__title">Leave a Reply</h3>
        <div class="bd-comments__inner">
          <form class="bd-comment-form" onsubmit="event.preventDefault();alert('Comment submitted!');this.reset();">
            <input type="text"     name="name"    placeholder="Name *"    required>
            <input type="email"    name="email"   placeholder="Email *"   required>
            <textarea              name="message" placeholder="Message *" required></textarea>
            <button type="submit" class="bd-btn">Send Comment</button>
          </form>
          <div class="bd-comment-list">
            <h6 class="bd-comment-list__head">Discussion (3 Comments)</h6>
            ${[
              { img: 11, name: 'Rahul Sharma',  time: '2 mins ago',  text: 'Incredibly detailed coverage! The newspaper-style formatting feels very fresh.' },
              { img: 21, name: 'Anita Verma',   time: '10 mins ago', text: 'Excellent analysis on industry evolution. Very helpful.' },
              { img: 33, name: 'Amit Singh',    time: '30 mins ago', text: 'Will this model apply to niche B2B tech organizations as well?' },
            ].map(c => `
              <div class="bd-comment">
                <img src="https://i.pravatar.cc/40?img=${c.img}" alt="${c.name}" class="bd-comment__avatar">
                <div class="bd-comment__body">
                  <strong class="bd-comment__name">${c.name}</strong>
                  <p class="bd-comment__text">${c.text}</p>
                  <time class="bd-comment__time">${c.time}</time>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ─── Sidebar: recent posts ──────────────────────────────────────────── */
  function renderSidebar(currentSlug, allBlogs) {
    const containerPopular = document.querySelector('#sidebar-popular-content');
    const containerLocal = document.querySelector('#sidebar-local-content');
    const oldContainer = document.querySelector('.main-sidebar2-widget__post');

    const posts = allBlogs.filter(b => b.slug !== currentSlug).slice(0, 4);
    const popularHTML = posts.map((b, i) => `
      <a href="blog-details.html?slug=${b.slug}" class="bd-recent-post">
        <div class="bd-recent-post__thumb">
          <img src="${b.images?.thumb?.src || b.images?.thumb || fallback(i)}" alt="${b.title}" loading="lazy">
        </div>
        <div class="bd-recent-post__info">
          <span class="bd-recent-post__meta">${b.category || 'Insights'} // ${b.year || '2026'}</span>
          <span class="bd-recent-post__title">${b.title}</span>
        </div>
      </a>`).join('');

    if (containerPopular) {
      containerPopular.innerHTML = popularHTML;
    } else if (oldContainer) {
      oldContainer.innerHTML = popularHTML;
    }

    // Populate local/custom blogs
    if (containerLocal) {
      let localBlogs = [];
      try {
        localBlogs = JSON.parse(localStorage.getItem('adomantra_custom_blogs') || '[]');
      } catch(e) {
        console.error(e);
      }
      
      const filteredLocal = localBlogs.filter(b => b.slug !== currentSlug).slice(0, 4);
      if (filteredLocal.length > 0) {
        containerLocal.innerHTML = filteredLocal.map((b, i) => `
          <a href="blog-details.html?slug=${b.slug}" class="bd-recent-post">
            <div class="bd-recent-post__thumb">
              <img src="${b.heroImage || fallback(i)}" alt="${b.title}" loading="lazy">
            </div>
            <div class="bd-recent-post__info">
              <span class="bd-recent-post__meta">${b.category || 'Draft'} // ${b.year || '2026'}</span>
              <span class="bd-recent-post__title">${b.title}</span>
            </div>
          </a>`).join('');
      } else {
        containerLocal.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">No local drafts found. Create one in the studio dashboard!</div>`;
      }
    }

    // Add Tab event listeners
    const tabPopBtn = document.getElementById('tab-popular-btn');
    const tabLocBtn = document.getElementById('tab-local-btn');
    if (tabPopBtn && tabLocBtn && containerPopular && containerLocal) {
      tabPopBtn.onclick = () => {
        tabPopBtn.classList.add('active');
        
        tabLocBtn.classList.remove('active');
        
        containerPopular.style.display = 'block';
        containerLocal.style.display = 'none';
      };
      tabLocBtn.onclick = () => {
        tabLocBtn.classList.add('active');
        
        tabPopBtn.classList.remove('active');
        
        containerPopular.style.display = 'none';
        containerLocal.style.display = 'block';
      };
    }
  }

  /* ─── Table of Contents Auto-detector ───────────────────────────────── */
  function smoothScrollTo(targetElement, duration = 700) {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Account for scroll-margin-top (defined in newspaper.css as 180px)
    const style = window.getComputedStyle(targetElement);
    const scrollMarginTop = parseInt(style.scrollMarginTop) || 180;
    
    const elementRect = targetElement.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const endY = Math.max(0, absoluteElementTop - scrollMarginTop);
    
    const distance = endY - startY;
    if (distance === 0) return;
    
    const startTime = performance.now();
    
    // cubic-bezier(0.7, 0, 0.3, 1)
    const x1 = 0.7, y1 = 0, x2 = 0.3, y2 = 1;
    
    function getBezierT(x) {
      let start = 0;
      let end = 1;
      for (let i = 0; i < 14; i++) {
        const t = (start + end) / 2;
        const xt = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
        if (xt > x) {
          end = t;
        } else {
          start = t;
        }
      }
      return (start + end) / 2;
    }
    
    function ease(x) {
      if (x === 0) return 0;
      if (x === 1) return 1;
      const t = getBezierT(x);
      return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);
      
      window.scrollTo(0, startY + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
  }

  function generateTableOfContents() {
    const headingElements = document.querySelectorAll('.section-details h2, .section-details h3');
    const tocList = document.querySelector('.bd-toc-list');
    const tocWidget = document.getElementById('bd-toc-container');
    if (tocList && tocWidget) {
      tocList.innerHTML = '';
      if (headingElements.length > 0) {
        let h2Counter = 0;
        let h3Counter = 0;
        const links = [];
        
        headingElements.forEach((el, index) => {
          const id = el.id || `toc-heading-${index}`;
          el.id = id;
          
          let prefix = '';
          if (el.tagName.toUpperCase() === 'H2') {
            h2Counter++;
            h3Counter = 0;
            prefix = `${h2Counter}. `;
          } else if (el.tagName.toUpperCase() === 'H3') {
            h3Counter++;
            prefix = `${h2Counter || 1}.${h3Counter}. `;
          }
          
          const li = document.createElement('a');
          li.href = `#${id}`;
          li.textContent = prefix + el.textContent;
          li.className = `toc-link toc-link--${el.tagName.toLowerCase()}`;
          li.onclick = (e) => {
            e.preventDefault();
            smoothScrollTo(el, 700);
          };
          
          tocList.appendChild(li);
          links.push({ link: li, element: el });
        });
        tocWidget.style.display = 'block';

        // Scrollspy logic to update active class on scroll
        function updateActiveTOC() {
          const scrollPos = window.scrollY || window.pageYOffset;
          const offset = 200; // Trigger slightly before it hits scroll-margin-top
          
          let activeIndex = -1;
          for (let i = 0; i < links.length; i++) {
            const elTop = links[i].element.getBoundingClientRect().top + window.pageYOffset;
            if (scrollPos >= elTop - offset) {
              activeIndex = i;
            } else {
              break;
            }
          }
          
          links.forEach((item, index) => {
            if (index === activeIndex) {
              item.link.classList.add('active');
            } else {
              item.link.classList.remove('active');
            }
          });
        }

        window.removeEventListener('scroll', updateActiveTOC);
        window.addEventListener('scroll', updateActiveTOC);
        // Call it initially to highlight the current section
        updateActiveTOC();
      } else {
        tocWidget.style.display = 'none';
      }
    }
  }

  /* ─── Main render ────────────────────────────────────────────────────── */
  function renderBlog(blog, allBlogs) {

    /* SEO */
    if (blog.seo) {
      document.title = blog.seo.title + ' | Adomantra';
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', blog.seo.description);
    }

    /* Header meta */
    const titleEl = document.querySelector('.page-title');
    if (titleEl) {
      const words = blog.title.split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        const lastWord = words.pop();
        titleEl.innerHTML = `${words.join(' ')} <span>${lastWord}</span>`;
      } else if (words.length === 1) {
        titleEl.innerHTML = `<span>${words[0]}</span>`;
      } else {
        titleEl.innerHTML = '';
      }
    }

    const intro = blog.content?.introduction
      || blog.metaDescription
      || blog.seo?.description
      || 'In today\'s fast-paced ecosystem, organizations must adapt to emerging paradigms to maintain competitive advantages.';


    const metaSpans = document.querySelectorAll('.blog-details-area-inner .meta span');
    if (metaSpans[0]) metaSpans[0].innerHTML = `By <span>${blog.author}</span>`;
    if (metaSpans[1]) metaSpans[1].textContent = blog.category || '';
    if (metaSpans[2]) metaSpans[2].textContent = blog.year || '2026';

    /* Breadcrumb current page */
    const breadcrumbCurrent = document.getElementById('breadcrumb-current') || document.querySelector('.service-breadcrumb__current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = blog.title;
    }

    /* Hero image */
    const heroImg = document.getElementById('pexels-hero');
    const imgs    = extractImages(blog);
    if (heroImg) {
      heroImg.src = imgs[0];
      heroImg.alt = blog.title;
    }

    let sections = [];
    if (blog.content?.sections?.length) {
      sections = blog.content.sections;
    } else if (blog.content?.grid_sections?.length) {
      blog.content.grid_sections.forEach(row => {
        (row.items || []).forEach(item => {
          if (item.type === 'text') sections.push({ title: item.title || 'Key Insight', text: item.content });
        });
      });
    }

    // pad to 3 sections minimum
    const padPool = [
      { title: 'Strategic Paradigms & Industry Evolution',
        text:  'The integration of technology and organizational design has redefined how modern value chains operate. As systems grow more complex, the necessity for robust frameworks, cross-functional collaboration, and streamlined workflow optimization becomes critical for any organization aiming to compete.' },
      { title: 'Technological Implementation & Risk',
        text:  'Deploying high-impact strategies requires a delicate balance of tooling and talent. Without proper change management, new processes face internal resistance and structural bottlenecks. Companies must invest in comprehensive training programs and scalable cloud foundations.' },
      { title: 'Growth Metrics & Predictive Analysis',
        text:  'The effectiveness of any initiative is ultimately measured by its impact on user retention, revenue generation, and product relevance. By utilizing advanced analytics, managers can make predictive assertions about consumer behavior and compound micro-optimizations into macro gains.' },
    ];
    while (sections.length < 3) sections.push(padPool[sections.length]);

    /* Pick design */
    const hasCardLayout = blog.blocks || blog.content?.sections?.some(sec => sec.type || sec.layout || sec.image);
    const design = hasCardLayout ? 'design-card-layout' : pickDesign(blog.slug);

    let contentHTML = '';
    if (design === 'design-card-layout') {
      contentHTML = renderCardLayout(blog, sections);
    } else {
      switch (design) {
        case 'design-classic':  contentHTML = renderClassic (blog, imgs, intro, sections); break;
        case 'design-modern':   contentHTML = renderModern  (blog, imgs, intro, sections); break;
        case 'design-magazine': contentHTML = renderMagazine(blog, imgs, intro, sections); break;
        case 'design-courier':  contentHTML = renderCourier (blog, imgs, intro, sections); break;
      }
    }

    contentHTML += renderFAQ     (blog.content?.faqs);
    contentHTML += renderTags    (blog.seo?.tags);
    contentHTML += renderComments();

    const container = document.querySelector('.section-details');
    if (container) {
      container.className = `section-details ${design}`;
      container.innerHTML = contentHTML;
    }

    renderSidebar(blog.slug, allBlogs);
    generateTableOfContents();
    setTimeout(adjustLayoutHeights, 100);
    window.dispatchEvent(new Event('resize'));
  }

  function adjustLayoutHeights() {
    // 1. Modern Layout
    const modernSplits = document.querySelectorAll('.design-modern .bd-section--split');
    modernSplits.forEach(split => {
      const textEl = split.querySelector('.bd-section__text');
      const figEl = split.querySelector('.bd-figure');
      if (textEl && figEl) {
        // Reset styles first to measure native height
        figEl.style.height = '';
        figEl.style.aspectRatio = '';
        split.classList.remove('stacked-layout');

        const textHeight = textEl.offsetHeight;
        if (textHeight < 200) {
          split.classList.add('stacked-layout');
          figEl.style.height = '400px';
          figEl.style.aspectRatio = 'auto';
        } else {
          figEl.style.height = `${textHeight}px`;
          figEl.style.aspectRatio = 'auto';
        }
      }
    });

    // 2. Courier Layout
    const courierContainer = document.querySelector('.bd-courier');
    if (courierContainer) {
      const rows = courierContainer.querySelectorAll('.bd-courier__row');
      let shouldStack = false;
      
      // Check if any row's content height is < 200px
      rows.forEach(row => {
        const contentEl = row.querySelector('.bd-courier__content');
        if (contentEl && contentEl.offsetHeight < 200) {
          shouldStack = true;
        }
      });

      if (shouldStack) {
        courierContainer.classList.add('courier-stacked');
        rows.forEach((row, i) => {
          const cardEl = row.querySelector('.bd-courier__card');
          if (cardEl) {
            if (i === 0) {
              cardEl.style.height = '400px';
              cardEl.style.aspectRatio = 'auto';
            } else {
              cardEl.style.height = '';
              cardEl.style.aspectRatio = '';
            }
          }
        });
      } else {
        courierContainer.classList.remove('courier-stacked');
        rows.forEach(row => {
          const contentEl = row.querySelector('.bd-courier__content');
          const cardEl = row.querySelector('.bd-courier__card');
          if (contentEl && cardEl) {
            cardEl.style.height = `${contentEl.offsetHeight}px`;
            cardEl.style.aspectRatio = 'auto';
          }
        });
      }
    }

    // 3. Card Split Layout
    const cardSplits = document.querySelectorAll('.bd-card-row--split');
    cardSplits.forEach(split => {
      const textEl = split.querySelector('.bd-card-text');
      const mediaEl = split.querySelector('.bd-card-square');
      if (textEl && mediaEl) {
        // Reset styles first to measure native height
        mediaEl.style.height = '';
        mediaEl.style.aspectRatio = '';
        split.classList.remove('stacked-layout');

        const textHeight = textEl.offsetHeight;
        if (textHeight < 200) {
          split.classList.add('stacked-layout');
          mediaEl.style.height = '400px';
          mediaEl.style.aspectRatio = 'auto';
        } else {
          mediaEl.style.height = `${textHeight}px`;
          mediaEl.style.aspectRatio = 'auto';
        }
      }
    });
  }

  /* ─── Bootstrap ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('resize', adjustLayoutHeights);
    const slug = new URLSearchParams(window.location.search).get('slug');

    if (typeof fetchAdomantraNews === 'function') {
      fetchAdomantraNews()
        .then(data => {
          const blog = slug
            ? data.blogs.find(b => b.slug === slug)
            : data.blogs[0];

          if (blog) renderBlog(blog, data.blogs);
          else console.warn('[blog-details] Slug not found:', slug);
        })
        .catch(err => console.error('[blog-details] Fetch error:', err));
    } else {
      console.error('[blog-details] fetchAdomantraNews not found — include news_config.js first.');
    }
  });

  // Parallax effect for Google Ad Card
  window.addEventListener('scroll', () => {
    const adImg = document.querySelector('.ad-container img');
    if (!adImg) return;
    const container = adImg.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    
    if (rect.top < viewHeight && rect.bottom > 0) {
      const scrolledRatio = (rect.top + rect.height) / (viewHeight + rect.height);
      const translateY = (scrolledRatio - 0.5) * 30; // shift range
      adImg.style.transform = `scale(1.15) translateY(${translateY}%)`;
    }
  });

})();