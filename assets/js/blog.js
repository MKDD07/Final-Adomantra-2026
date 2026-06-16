/**
 * blog.js — Dynamically renders blog cards from adomantra_blogs.json
 * Optimised for the refined JSON structure and premium aesthetics.
 * Used by: blog.html
 */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('.blog-section-5__wrap');
  if (!grid) return;

  if (typeof fetchAdomantraNews === 'function') {
    fetchAdomantraNews()
      .then(data => {
        renderBlogGrid(data.blogs);
        renderFeaturedProjects(data.blogs);
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
   * Renders the main blog grid
   */
  async function renderBlogGrid(blogs) {
    const htmlChunks = await Promise.all(blogs.map(async (blog, index) => {
      const readTime = calculateReadTime(blog);
      const category = blog.category || 'Strategic';
      const displayTitle = blog.title;
      const url = `blog-details.html?slug=${blog.slug}`;
      const displayDate = blog.year || '2026';

      // Pexels integration: Prioritize dynamic images
      let image = blog.images?.hero?.src || 'assets/imgs/inner/blog-details/blog-details1_1.jpg';

      // If it's a local placeholder or missing, try to fetch a specific Pexels image
      if (image.startsWith('assets/') && typeof fetchPexelsImage === 'function') {
        const query = displayTitle.split(' ').slice(0, 3).join(' '); // Simpler query for better results
        image = await fetchPexelsImage(query + " digital marketing");
      }

      return `
                <div class="col-12 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay="${0.1 * (index % 3)}s">
                    <div class="features-card blog-section-5__item h-100 fl f-col p-3">
                        <span class="position-relative px-2 py-3 w-auto" style="font-family: Poppins; font-size: 14px; color: var(--primary); font-weight: 500;">
                            ${displayDate} // ${readTime}
                        </span>
                        <h3 class="blog-section-5__title original-black" style="font-size: 24px;     font-weight: 300; line-height: 1.1; margin-bottom: 20px;">
                            <a href="${url}">${displayTitle}</a>
                        </h3>
                        <div class="blog-thumb-wrap" style="flex-grow: 1; overflow: hidden; border-radius: 24px;">
                            <a href="${url}">
                                <img src="${image}" alt="${displayTitle}" loading="lazy" 
                                     style="width: 100%; aspect-ratio: 1/1; object-fit: cover; transition: transform 0.8s ease; height: 100%;"
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

      // Priority to dynamic images
      let image = blog.images?.hero?.src || 'assets/imgs/inner/blog-details/blog-details1_1.jpg';

      if (image.startsWith('assets/') && typeof fetchPexelsImage === 'function') {
        const query = title.split(' ').slice(0, 3).join(' ');
        image = await fetchPexelsImage(query + " technology");
      }

      return `
                <div class="features-card p-0 project-area7__card grc-6 section-item overflow-hidden wow fadeInUp" data-wow-delay="${0.2 * index}s" style="border-top-left-radius: 24px; background: white;">
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
