/**
 * blog.js — Dynamically renders blog cards from adomantra_blogs.json
 * Optimised for the refined JSON structure and premium aesthetics.
 * Features category filtering (max 8) and client-side pagination.
 * Used by: blog.html
 */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('.blog-section-5__wrap');
  if (!grid) return;

  const ITEMS_PER_PAGE = 6;
  let allBlogs = [];
  let filteredBlogs = [];
  let currentCategory = 'All';
  let currentPage = 1;

  if (typeof fetchAdomantraNews === 'function') {
    fetchAdomantraNews()
      .then(data => {
        allBlogs = data.blogs || [];
        filteredBlogs = [...allBlogs];
        renderFilters();
        renderBlogGrid();
        renderFeaturedProjects(allBlogs);
      })
      .catch(err => console.error('Blog listing load error:', err));
  }

  /**
   * Calculates a rough read time based on intro and section text
   */
  function calculateReadTime(blog) {
    let text = blog.content.introduction || '';
    if (blog.content.sections) {
      blog.content.sections.forEach(s => {
        text += ' ' + (s.text || '') + ' ' + (s.closing_text || '');
        if (s.thumb_wrapper) text += ' ' + s.thumb_wrapper.text_one + ' ' + s.thumb_wrapper.text_two;
      });
    }
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180)) + ' min read';
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
   * Extract categories and render filter buttons (max 8 total, including 'All')
   */
  function renderFilters() {
    const filterContainer = document.getElementById('category-filter-buttons');
    if (!filterContainer) return;

    // Count categories
    const counts = {};
    allBlogs.forEach(b => {
      const cat = b.category || 'Strategic';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Sort categories by frequency
    const sortedCats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    // Select top 7 categories to keep total buttons <= 8 (including 'All')
    const topCats = sortedCats.slice(0, 7);
    const finalCategories = ['All', ...topCats];

    filterContainer.innerHTML = finalCategories.map(cat => {
      const isActive = cat === currentCategory;
      const countLabel = cat === 'All' ? allBlogs.length : (counts[cat] || 0);
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
                       transition: all 0.3s;"
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
          filteredBlogs = [...allBlogs];
        } else {
          filteredBlogs = allBlogs.filter(b => (b.category || 'Strategic') === currentCategory);
        }

        renderFilters();
        renderBlogGrid();
      });
    });
  }

  /**
   * Renders pagination buttons at the bottom
   */
  function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
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
        renderBlogGrid();
        
        // Smooth scroll to top of grid
        const gridTop = document.querySelector('.blog-section-5__area');
        if (gridTop) {
          gridTop.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Renders the main blog grid (paginated slice)
   */
  async function renderBlogGrid() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    if (paginatedBlogs.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5">No articles found in this category.</div>';
      renderPagination();
      return;
    }

    const htmlChunks = await Promise.all(paginatedBlogs.map(async (blog, index) => {
      const readTime = calculateReadTime(blog);
      const category = blog.category || 'Strategic';
      const displayTitle = blog.title;
      const url = `blog-details.html?slug=${blog.slug}`;
      const displayDate = blog.year || '2026';

      // Pexels integration: Prioritize dynamic images
      const query = displayTitle.split(' ').slice(0, 3).join(' ') + " digital marketing";
      const image = await getUniversalImage(blog, query);

      return `
        <div class="col-12 col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="${0.1 * (index % 3)}s">
            <div class="features-card blog-section-5__item h-100 fl f-col p-3">
                <span class="position-relative px-2 py-3 w-auto" style="font-family: Poppins; font-size: 14px; color: var(--primary); font-weight: 500;">
                    ${displayDate} // ${readTime}
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

  /**
   * Renders the featured section at the bottom
   */
  async function renderFeaturedProjects(blogs) {
    const featuredContainer = document.getElementById('featured-blog-projects');
    if (!featuredContainer) return;

    const featuredBlogs = blogs.slice(0, 3);

    const htmlChunks = await Promise.all(featuredBlogs.map(async (blog, index) => {
      const title = blog.title;
      const desc = blog.seo.description || "Leading insights in digital strategy and corporate innovation.";
      const url = `blog-details.html?slug=${blog.slug}`;
      const year = blog.year || '2026';

      const query = title.split(' ').slice(0, 3).join(' ') + " technology";
      const image = await getUniversalImage(blog, query);

      return `
        <div class="features-card p-0 project-area7__card grc-6 section-item overflow-hidden " data-wow-delay="${0.2 * index}s" style="border-top-left-radius: 24px; background: white;">
            <div class="project-area7__card-content" style="padding: 30px;">
                <div class="project-area7__card-year" style="color: var(--primary); font-weight: 600;">${year}</div>
                <a href="${url}" class="project-area7__card-title original-black" style="font-size: 24px; letter-spacing: -0.05em; display: block; margin: 10px 0; font-weight: 300">${title}</a>
                <p class="project-area7__card-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 16px; opacity: 0.8;">${desc}</p>
            </div>
            <div class="project-area7__card-thumb" style="overflow: hidden; border-radius: 0 0 24px 24px;">
                <img src="${image}" alt="${title}" style="aspect-ratio: 4/3; object-fit: cover; width: 100%; transition: transform 0.8s ease;">
                <a href="${url}" class="project-area7__card-btn p-3 text-center">Read More..</a>
            </div>
        </div>
      `;
    }));

    featuredContainer.innerHTML = htmlChunks.join('');
  }
});
