/**
 * news_config.js
 * Bridge between NewsAPI and Adomantra's Blog Engine.
 */

const NEWS_API_KEY = '3fab9a4b03304a9dac59945e86b88186';
const NEWS_CACHE_KEY = 'adomantra_news_cache';

// ─────────────────────────────────────────────
// PEXELS IMAGE FETCHER
// Fetches 3 relevant images per article from Pexels
// ─────────────────────────────────────────────

async function fetchPexelsImages(query, count = 3) {
    try {
        var key = typeof PEXELS_API_CONFIG !== 'undefined' ? PEXELS_API_CONFIG.apiKey : 'y6WP5reQNH7abdL2uzdLTyV8pq0kMmF3CHf7ZNkiHo98DXIvORUOBSfi';
        let safeQuery = encodeURIComponent(query.split(' ').slice(0, 3).join(' '));
        let res = await fetch(`https://api.pexels.com/v1/search?query=${safeQuery}&per_page=${count}&orientation=landscape`, {
            headers: { Authorization: key }
        });
        let data = await res.json();

        // If no results for specific title, try a generic brand-aligned search
        if (!data.photos || data.photos.length === 0) {
            safeQuery = encodeURIComponent("digital advertising");
            res = await fetch(`https://api.pexels.com/v1/search?query=${safeQuery}&per_page=${count}&orientation=landscape`, {
                headers: { Authorization: key }
            });
            data = await res.json();
        }

        if (data.photos && data.photos.length > 0) {
            return data.photos.map(p => ({
                src: p.src.large,
                alt: p.alt || query,
                photographer: p.photographer
            }));
        }
    } catch (e) {
        console.warn('[Pexels] Image fetch failed:', e);
    }
    // Fallback: return placeholder images
    return Array.from({ length: count }, (_, i) => ({
        src: `assets/imgs/inner/blog-details/blog-details1_1.jpg`,
        alt: query,
        photographer: ''
    }));
}

// ─────────────────────────────────────────────
// GALLERY LAYOUT GENERATOR
// Randomly picks one of 3 layouts for the 3 images
// Layout A: 2 side-by-side (col-6) + 1 full-width below
// Layout B: 3 equal columns (col-4)
// Layout C: 1 large left (col-8) + 1 stacked right (col-4)
// ─────────────────────────────────────────────
function buildGalleryHTML(images, layoutSeed) {
    const layout = layoutSeed % 3; // 0, 1, or 2

    const img = (image, extraClass = '') =>
        `<div class="image parallax-view ${extraClass}">
            <img src="${image.src}" alt="${image.alt}" data-speed="0.8">
        </div>`;

    if (layout === 0) {
        // Layout A: col-6 + col-6 | full-width
        return `
        <div class="gallery-wrapper">
            <div class="row g-3 mb-3">
                <div class="col-6">${img(images[0])}</div>
                <div class="col-6">${img(images[1])}</div>
            </div>
            <div class="row">
                <div class="col-12">${img(images[2])}</div>
            </div>
        </div>`;
    } else if (layout === 1) {
        // Layout B: 3 equal columns col-4 each
        return `
        <div class="gallery-wrapper">
            <div class="row g-3">
                <div class="col-4">${img(images[0])}</div>
                <div class="col-4">${img(images[1])}</div>
                <div class="col-4">${img(images[2])}</div>
            </div>
        </div>`;
    } else {
        // Layout C: col-8 large left + col-4 two stacked right
        return `
        <div class="gallery-wrapper">
            <div class="row g-3">
                <div class="col-8">${img(images[0])}</div>
                <div class="col-4 d-flex flex-column gap-3">
                    ${img(images[1])}
                    ${img(images[2])}
                </div>
            </div>
        </div>`;
    }
}

/**
 * Fetches dynamic news and transforms it into the premium blog structure.
 */
async function fetchAdomantraNews() {
    let customBlogs = [];
    // Load custom blogs from localStorage (always fresh!)
    try {
        const stored = localStorage.getItem('adomantra_custom_blogs');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                customBlogs = [...parsed];
            }
        }
    } catch (e) {
        console.warn('Failed to read adomantra_custom_blogs:', e);
    }

    let baseBlogs = [];
    // 1. Check Session Cache for standard/NewsAPI blogs
    const cached = sessionStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
        try {
            const parsedCache = JSON.parse(cached);
            baseBlogs = parsedCache.blogs || [];
        } catch (e) {
            baseBlogs = [];
        }
    }

    if (baseBlogs.length === 0) {
        // Fetch static final blogs & NewsAPI blogs
        // Load our premium blog-final.json first
        try {
            const localRes = await fetch('assets/js/json/blog-final.json');
            const localData = await localRes.json();
            if (localData && localData.blogs) {
                baseBlogs = [...baseBlogs, ...localData.blogs];
            }
        } catch (err) {
            console.warn('Failed to load blog-final.json:', err);
        }

        try {
            // We query for 'digital marketing' or 'adtech' to stay on brand
            const response = await fetch(`https://newsapi.org/v2/everything?q=digital%20marketing%20OR%20adtech%20OR%20programmatic%20advertising%20OR%20performance%20marketing%20OR%20SEO%20OR%20influencer%20marketing&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`);
            const data = await response.json();

            if (data.status === 'ok') {
                // Fetch all Pexels image sets in parallel (one per article)
                const imageRequests = data.articles.map(article => {
                    const imageQuery = article.title.split(' ').slice(0, 4).join(' ');
                    return fetchPexelsImages(imageQuery, 3);
                });
                const allImages = await Promise.all(imageRequests);

                // Transform NewsAPI articles to Adomantra's Blog Schema
                const apiBlogs = data.articles.map((article, index) => {
                    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                    let rawContent = (article.content || article.description || "Detailed insights arriving soon.")
                        .replace(/\s*\[\+\d+\s*chars?\]/gi, '')
                        .replace(/\s*\[…\]/gi, '')
                        .trim();

                    if (rawContent.length < 50) {
                        rawContent = article.description || rawContent;
                    }

                    if (rawContent && !/[.!?]$/.test(rawContent)) {
                        rawContent = rawContent + '.';
                    }

                    let editorialExpansion = "";
                    const lowerTitle = article.title.toLowerCase();
                    if (lowerTitle.includes('ai') || lowerTitle.includes('intelligence') || lowerTitle.includes('tech')) {
                        editorialExpansion = " The rapid integration of these advanced technologies marks a pivotal shift in operational efficiency. As organizations pivot toward algorithmic governance, the balance between human creativity and technical automation becomes the primary differentiator for market leaders.";
                    } else if (lowerTitle.includes('marketing') || lowerTitle.includes('brand') || lowerTitle.includes('social')) {
                        editorialExpansion = " In an era of fragmented attention scales, the ability to maintain cohesive brand narratives across multi-touchpoint ecosystems is critical. Success now hinges on emotional resonance and consistent community engagement rather than simple reach metrics.";
                    } else {
                        editorialExpansion = " These developments underscore a broader trend toward data transparency and strategic agility. Businesses that leverage these insights to refine their user experience profiles will likely see the highest retention and competitive advantage in the coming year.";
                    }

                    const completeText = rawContent + editorialExpansion;
                    const articleImages = allImages[index];
                    const galleryHTML = buildGalleryHTML(articleImages, index);

                    return {
                        id: index + 1,
                        slug: slug,
                        author: article.author || article.source.name || "Adomantra News",
                        category: article.source.name || "Industry Insights",
                        year: new Date(article.publishedAt).getFullYear() || "2026",
                        title: article.title,
                        images: {
                            hero: articleImages[0],
                            thumb: articleImages[1],
                            gallery: articleImages,
                            galleryHTML: galleryHTML
                        },
                        seo: {
                            title: article.title,
                            description: article.description || completeText.substring(0, 160) + "...",
                            tags: ["Live Feed", "Market Analysis", "2026 Strategy"]
                        },
                        content: {
                            introduction: (article.description || rawContent).substring(0, 300) + (article.description && article.description.length > 300 ? "..." : " This report delves into the underlying mechanics of this shift and its implications for the global marketing landscape."),
                            sections: [
                                {
                                    title: "Strategic Overview",
                                    text: completeText,
                                    thumb_wrapper: {
                                        text_one: "Analyzing market signals in real-time allows for unprecedented strategic pivots.",
                                        text_two: "The data suggests a transition from reactive measures to proactive, technology-first frameworks."
                                    }
                                },
                                {
                                    title: "Industry Trajectory",
                                    text: "The current trajectory indicates that these changes are not merely transactional but foundational. Market participants must align their infrastructure with these emerging standards to ensure long-term scalability and security.",
                                    feature_list: [
                                        "Alignment with emerging industry standards",
                                        "Optimization of digital touchpoints for high engagement",
                                        "Integration of ethical data governance frameworks",
                                        "Scalable delivery of personalized user experiences",
                                        "Mitigation of risk through predictive analysis"
                                    ]
                                },
                                {
                                    title: "Consultant Insight",
                                    text: "From a consulting perspective, the primary challenge remains the execution of these strategies at scale. However, the potential for ROI in the current climate makes this a high-priority initiative for any forward-looking brand.",
                                    closing_text: `Comprehensive details and real-time data sets are available through the primary publisher. <a href="${article.url}" target="_blank" style="color:var(--primary); text-decoration:underline;">View Complete Original Source</a>`
                                }
                            ],
                            faqs: [
                                {
                                    question: "What is the immediate takeaway for stakeholders?",
                                    answer: "The focus should be on agility and the audit of current technical workflows to accommodate these new developments effectively."
                                },
                                {
                                    question: "How frequently are these insights updated?",
                                    answer: "Our engine synchronizes with global news feeds hourly to provide the most current context possible."
                                }
                            ]
                        },
                        url: article.url
                    };
                });

                const existingSlugs = new Set(baseBlogs.map(b => b.slug));
                const filteredApiBlogs = apiBlogs.filter(b => !existingSlugs.has(b.slug));
                baseBlogs = [...baseBlogs, ...filteredApiBlogs];
            }
        } catch (err) {
            console.warn('NewsAPI fetch error, falling back to local adomantra_blogs.json:', err);
            try {
                const localRes = await fetch('assets/js/json/adomantra_blogs.json');
                const localData = await localRes.json();
                if (localData && localData.blogs) {
                    const existingSlugs = new Set(baseBlogs.map(b => b.slug));
                    const filteredLocal = localData.blogs.filter(b => !existingSlugs.has(b.slug));
                    baseBlogs = [...baseBlogs, ...filteredLocal];
                }
            } catch (localErr) {
                console.error('Failed to load local blogs fallback:', localErr);
            }
        }

        // Save standard base blogs cache
        sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ blogs: baseBlogs }));
    }

    // Merge custom blogs (always fresh from localStorage) with base blogs (cached)
    // Custom blogs override/prepend base blogs
    const customSlugs = new Set(customBlogs.map(b => b.slug));
    const filteredBase = baseBlogs.filter(b => !customSlugs.has(b.slug));
    let finalBlogs = [...customBlogs, ...filteredBase];

    // Set IDs sequentially
    finalBlogs.forEach((b, idx) => {
        b.id = idx + 1;
    });

    return { blogs: finalBlogs };
}