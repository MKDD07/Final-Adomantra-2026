/**
 * Adomantra Blog Details Renderer
 * Fetches blog content from adomantra_blogs.json and populates the details page.
 */

async function initBlogDetails() {
    const contentArea = document.getElementById('dynamic-blog-content');
    const headerArea = document.getElementById('dynamic-blog-header');
    if (!contentArea || !headerArea) return;

    try {
        // 1. Get Blog Reference from URL
        const urlParams = new URLSearchParams(window.location.search);
        const blogSlug = urlParams.get('slug') || urlParams.get('id');

        if (!blogSlug) {
            headerArea.innerHTML = "<h2>Blog Post Not Found</h2>";
            return;
        }

        // 2. Fetch Blog Data
        const response = await fetch('assets/js/json/adomantra_blogs.json');
        const data = await response.json();
        const blog = data.blogs.find(b => b.slug === blogSlug || String(b.id) === blogSlug);

        if (!blog) {
            headerArea.innerHTML = "<h2>Blog Post Not Found</h2>";
            return;
        }

        // 3. Update SEO Meta Tags (Title & Description)
        document.title = blog.seo.title + " | Adomantra";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', blog.seo.meta_description);

        // 4. Render Header Section
        const dateStr = blog.id % 2 === 0 ? "MAY 15, 2025" : "JULY 12, 2025"; // Mock dates if not in JSON
        headerArea.innerHTML = `
            <div class="section-title-wrapper">
                <div class="title-wrapper">
                    <h2 class="section-title font-sequelsans-romanbody">${blog.seo.title}</h2>
                </div>
            </div>
            <div class="meta">
                <span class="name">By <span>Adomantra Editorial</span></span>
                <span class="tag has-left-line">Digital Marketing</span>
                <span class="date has-left-line">${dateStr}</span>
            </div>
        `;

        // 5. Fetch exactly 4 images for the layout
        const searchTerms = [
            blog.seo.title + " hero",
            (blog.content.sections[0]?.heading || "concept") + " work",
            "creative design perspective",
            "modern workplace tech"
        ];
        const pexelsImages = await Promise.all(searchTerms.map(term => fetchPexelsImage(term)));

        // 6. Render Cover Image (1st Image)
        const coverImgContainer = document.getElementById('dynamic-blog-cover');
        if (coverImgContainer) {
            coverImgContainer.innerHTML = `<img class="w-100" src="${pexelsImages[0]}" alt="${blog.seo.title}" data-speed="0.8">`;
        }

        // 7. Build Content HTML
        let contentHtml = `<div class="text-wrapper"><p class="text">${blog.content.introduction}</p></div>`;

        if (blog.content.sections) {
            blog.content.sections.forEach((section, sIdx) => {
                contentHtml += `
                    <div class="details-info">
                        <h3 class="title">${section.heading}</h3>
                        <div class="text-wrapper">
                            <p class="text">${section.content || ''}</p>
                        </div>
                        
                        ${sIdx === 0 && section.subsections ? `
                            <div class="thumb-text-wrapper">
                                <div class="thumb parallax-view">
                                    <img src="${pexelsImages[1]}" alt="Section Image" data-speed="0.8">
                                </div>
                                <div class="text-wrapper">
                                    ${section.subsections.map(sub => `
                                        <h5 class="mb-2" style="font-weight: 600;">${sub.heading}</h5>
                                        <p class="text">${sub.content || ''}</p>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${sIdx > 0 && section.subsections ? section.subsections.map(sub => `
                            <div class="text-wrapper mt-3">
                                <h5 class="mb-2" style="font-weight: 600;">${sub.heading}</h5>
                                <p class="text">${sub.content || ''}</p>
                                ${sub.tips ? `
                                    <div class="feature-list"><ul>${sub.tips.map(t => `<li>${t}</li>`).join('')}</ul></div>
                                ` : ''}
                            </div>
                        `).join('') : ''}

                        ${sIdx === blog.content.sections.length - 1 ? `
                            <div class="gallery-wrapper mt-4">
                                <div class="image parallax-view">
                                    <img src="${pexelsImages[2]}" alt="Gallery 1" data-speed="0.8">
                                </div>
                                <div class="image parallax-view">
                                    <img src="${pexelsImages[3]}" alt="Gallery 2" data-speed="0.8">
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }

        contentArea.innerHTML = contentHtml;

        // 7. Render Sidebar (Recent Posts, Categories, Tags)
        renderSidebar(data.blogs, blog);

        // Initialize any parallax or GSAP effects
        if (typeof gsap !== 'undefined') {
            ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Failed to load blog details:', error);
        headerArea.innerHTML = "<h2>Error loading content.</h2>";
    }
}

/**
 * Renders the sidebar components
 */
async function renderSidebar(allBlogs, currentBlog) {
    // A. Recent Posts
    const recentPostsContainer = document.querySelector('.main-sidebar2-widget__post');
    if (recentPostsContainer) {
        const recentBlogs = allBlogs.filter(b => b.id !== currentBlog.id).slice(0, 3);
        let recentHtml = '';
        for (const rb of recentBlogs) {
            const rbImage = rb.cover_image?.src || await fetchPexelsImage(rb.seo.title + " tech");
            recentHtml += `
                <div class="main-sidebar2-widget__post-items ">
                    <div class="main-sidebar2-widget__post-items-thumb">
                        <img src="${rbImage}" alt="${rb.seo.title}" style="width:70px; height:70px; object-fit:cover;">
                    </div>
                    <div class="main-sidebar2-widget__post-items-content">
                        <ul class="main-sidebar2-widget__post-items-content-post">
                            <li class="main-sidebar2-widget__post-items-content-post-date">MAY 15, 2025</li>
                        </ul>
                        <div class="main-sidebar2-widget__post-items-content-title">
                            <a href="blog-details.html?slug=${rb.slug}">${rb.seo.title}</a>
                        </div>
                    </div>
                </div>
            `;
        }
        recentPostsContainer.innerHTML = recentHtml;
    }

    // B. Categories (Mocked or derived)
    const categoriesContainer = document.querySelector('.main-sidebar2-widget__categories ul');
    if (categoriesContainer) {
        const categories = ["AI Integration", "Digital Marketing", "SEO Strategy", "Programmatic", "Machine Learning"];
        categoriesContainer.innerHTML = categories.map(cat => `
            <li><a href="blog.html"><span class="text"><i class="fa-regular fa-chevrons-right"></i>${cat}</span> <span>(0${Math.floor(Math.random() * 5) + 1})</span></a></li>
        `).join('');
    }

    // C. Tags
    const tagsContainer = document.querySelector('.main-sidebar2-widget__tags-tagcloud');
    if (tagsContainer) {
        const allTags = new Set();
        allBlogs.forEach(b => {
            if (b.content.sections) {
                b.content.sections.forEach(s => {
                    if (s.keywords) s.keywords.forEach(k => allTags.add(k));
                });
            }
        });
        const tagList = Array.from(allTags).slice(0, 10);
        tagsContainer.innerHTML = tagList.map(tag => `<a href="blog.html">${tag}</a>`).join('');
    }
}

document.addEventListener('DOMContentLoaded', initBlogDetails);
