/**
 * case-studies-list.js — Dynamically renders case study cards from case-studies-contents.json
 * Utilises the same premium grid layout as blog.html.
 * Features category filtering (max 8) and client-side pagination.
 * Used by: case-studies.html
 */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('.blog-section-5__wrap');
  if (!grid) return;

  const ITEMS_PER_PAGE = 6;
  let allCaseStudies = [];
  let filteredCaseStudies = [];
  let currentCategory = 'All';
  let currentPage = 1;

  fetchCaseStudies();

  async function fetchCaseStudies() {
    try {
      const response = await fetch('assets/js/json/case-studies-contents.json');
      const data = await response.json();
      allCaseStudies = data || [];
      filteredCaseStudies = [...allCaseStudies];
      renderFilters();
      renderCaseStudiesGrid();
    } catch (err) {
      console.error('Case studies listing load error:', err);
    }
  }

  /**
   * Universal Pexels Image Loader helper
   */
  async function getUniversalImage(item, queryFallback) {
    let image = '';
    if (item.images && item.images.hero && item.images.hero.src) {
      image = item.images.hero.src;
    } else if (item.brandImages && item.brandImages[0] && item.brandImages[0].images && item.brandImages[0].images[0]) {
      image = item.brandImages[0].images[0];
    } else if (item.image) {
      image = item.image;
    }

    const isPlaceholder = !image || image.startsWith('assets/') || image.includes('placeholder') || image.includes('blog-details1_1.jpg');
    if (isPlaceholder && typeof PexelsLoader !== 'undefined' && typeof PexelsLoader.fetch === 'function') {
      try {
        const pexelsUrl = await PexelsLoader.fetch(queryFallback, true, 'large');
        if (pexelsUrl) return pexelsUrl;
      } catch (err) {
        console.warn('Universal Pexels fetch failed:', err);
      }
    }
    return image || 'assets/images/inner/blog-details/blog-details1_1.jpg';
  }

  /**
   * Extract categories (using 'hero' field or badge) and render filter buttons (max 8 total, including 'All')
   */
  function renderFilters() {
    const filterContainer = document.getElementById('category-filter-buttons');
    if (!filterContainer) return;

    // Count categories
    const counts = {};
    allCaseStudies.forEach(cs => {
      const cat = cs.hero || 'Growth';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Sort categories by frequency
    const sortedCats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    // Select top 7 categories to keep total buttons <= 8 (including 'All')
    const topCats = sortedCats.slice(0, 7);
    const finalCategories = ['All', ...topCats];

    filterContainer.innerHTML = finalCategories.map(cat => {
      const isActive = cat === currentCategory;
      const countLabel = cat === 'All' ? allCaseStudies.length : (counts[cat] || 0);
      return `
        <button class="filter-btn rr-btn-filter ${isActive ? 'active' : ''}" 
                style="background: ${isActive ? 'var(--primary-color)' : '#f4f4f4'}; 
                       color: ${isActive ? '#fff' : '#101010'}; 
                       border: none; 
                       padding: 8px 18px; 
                       border-radius: 30px; 
                       font-family: Poppins; 
                       font-size: 14px; 
                       cursor: pointer; 
                       transition: all 0.3s;
                       margin: 0 4px;"
                data-category="${cat}">
          ${cat} (${countLabel})
        </button>
      `;
    }).join('');

    // Attach click events
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        currentCategory = this.getAttribute('data-category');
        currentPage = 1;

        if (currentCategory === 'All') {
          filteredCaseStudies = [...allCaseStudies];
        } else {
          filteredCaseStudies = allCaseStudies.filter(cs => (cs.hero || 'Growth') === currentCategory);
        }

        renderFilters();
        renderCaseStudiesGrid();
      });
    });
  }

  /**
   * Renders pagination buttons at the bottom
   */
  function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredCaseStudies.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let buttonsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      buttonsHTML += `
        <button class="page-btn ${isActive ? 'active' : ''}"
                style="background: ${isActive ? 'var(--primary-color)' : '#f4f4f4'}; 
                       color: ${isActive ? '#fff' : '#101010'}; 
                       border: none; 
                       width: 40px; 
                       height: 40px; 
                       border-radius: 50%; 
                       font-family: Poppins; 
                       font-size: 14px; 
                       cursor: pointer; 
                       transition: all 0.3s;
                       margin: 0 4px;"
                data-page="${i}">
          ${i}
        </button>
      `;
    }

    paginationContainer.innerHTML = buttonsHTML;

    // Attach pagination events
    paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        currentPage = parseInt(this.getAttribute('data-page'));
        renderCaseStudiesGrid();
        
        // Smooth scroll to top of grid
        const gridTop = document.querySelector('.blog-section-5__area');
        if (gridTop) {
          gridTop.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Renders the main case studies grid (paginated slice)
   */
  async function renderCaseStudiesGrid() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedStudies = filteredCaseStudies.slice(startIndex, endIndex);

    if (paginatedStudies.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5">No case studies found in this category.</div>';
      renderPagination();
      return;
    }

    const htmlChunks = await Promise.all(paginatedStudies.map(async (cs, index) => {
      const category = cs.hero || 'Growth';
      const displayTitle = cs.title;
      const url = `case-studies-details.html?slug=${cs.slug}`;
      const duration = cs.duration || 'Campaign';

      // Pexels integration: Prioritize dynamic images using brand query
      const queryFallback = (cs.brandImages && cs.brandImages[0] && cs.brandImages[0].images && cs.brandImages[0].images[0]) 
                            ? cs.brandImages[0].images[0] + " business corporate"
                            : cs.title.split(' ').slice(0, 3).join(' ') + " business corporate";
      const image = await getUniversalImage(cs, queryFallback);

      return `
        <div class="col-12 col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="${0.1 * (index % 3)}s">
            <div class="features-card blog-section-5__item h-100 fl f-col p-3">
                <span class="position-relative px-2 py-3 w-auto" style="font-family: Poppins; font-size: 14px; color: var(--primary); font-weight: 500;">
                    ${duration}
                </span>
                <h3 class="blog-section-5__title original-black" style="font-size: 24px; font-weight: 300; line-height: 1.1; margin-bottom: 20px; flex-grow: 0;">
                    <a href="${url}">${displayTitle}</a>
                </h3>
                <div class="blog-thumb-wrap" style="flex-grow: 1; overflow: hidden; border-radius: 24px; aspect-ratio: 1/1;">
                    <a href="${url}" style="display: block; width: 100%; height: 100%;">
                        <img src="${image}" alt="${displayTitle}" loading="lazy" 
                             style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease;"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'">
                    </a>
                </div>
                <div class="d-flex align-items-center justify-content-between mt-4">
                    <div class="blog-section-5__meta">
                        <span class="tag" style="background: #f4f4f4; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: Poppins;">${category}</span>
                    </div>
                    <div class="blog-section-5__icon">
                        <a href="${url}" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; border-radius: 50%;">
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      `;
    }));

    grid.innerHTML = htmlChunks.join('');
    renderPagination();

    // Re-init animations
    if (typeof WOW === 'function') {
      new WOW().init();
    }
  }
});
