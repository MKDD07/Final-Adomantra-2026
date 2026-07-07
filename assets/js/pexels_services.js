/**
 * Pexels API Integration for Services
 * jQuery-based version — hero section removed.
 */

const PEXELS_API_CONFIG = {
    apiKey: 'y6WP5reQNH7abdL2uzdLTyV8pq0kMmF3CHf7ZNkiHo98DXIvORUOBSfi',
    fallbackImage: 'assets/images/service/services-card/service_0001.jpg'
};

/**
 * Fetches a high-quality image from Pexels based on a search query with Offline Caching.
 * @param {string} query     - The search term (e.g., "CTV Advertising")
 * @param {boolean} randomize - Pick a random result from the first 15 photos
 * @returns {Promise<string>}  - Resolved image URL (Blob URL if cached, or Pexels URL)
 */
async function fetchPexelsImage(query, randomize = false, options = {}) {
    // Standardize query
    let searchQ = query || '';
    
    // Rewrite queries containing 'adomantra' to high-quality brand-aligned terms
    const lowQ = searchQ.toLowerCase();
    if (lowQ.includes('adomantra')) {
        if (lowQ.includes('workspace') || lowQ.includes('office') || lowQ.includes('certified')) {
            searchQ = 'modern creative agency office';
        } else if (lowQ.includes('faq') || lowQ.includes('support')) {
            searchQ = 'customer service support';
        } else if (lowQ.includes('awards') || lowQ.includes('achievement')) {
            searchQ = 'business award trophy';
        } else if (lowQ.includes('strategy')) {
            searchQ = 'business strategy planning';
        } else {
            searchQ = 'digital marketing agency office';
        }
        console.log(`🔍 Mapping Adomantra query "${query}" to Pexels search query: "${searchQ}"`);
    }

    // Build cache key based on query and options
    const cacheParts = [searchQ.toLowerCase().replace(/\s+/g, '_')];
    if (randomize) cacheParts.push('rand');
    if (options.page) cacheParts.push(`p${options.page}`);
    if (options.orientation) cacheParts.push(options.orientation);
    const cacheKey = `img_${cacheParts.join('_')}`;

    // 1. Check local cache first
    try {
        const cachedBlob = await AdomantraCache.get(cacheKey);
        if (cachedBlob) {
            console.log('🖼️ Loading from cache:', searchQ);
            return AdomantraCache.createBlobUrl(cachedBlob);
        }
    } catch (e) {
        console.warn('Cache access error:', e);
    }

    // 2. Fetch from Pexels if not in cache
    if (!PEXELS_API_CONFIG.apiKey || PEXELS_API_CONFIG.apiKey === 'PASTE_YOUR_PEXELS_API_KEY_HERE') {
        return options.fallback || PEXELS_API_CONFIG.fallbackImage;
    }

    const perPage = options.perPage || (randomize ? 15 : 1);
    let url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQ)}&per_page=${perPage}`;
    if (options.page) {
        url += `&page=${options.page}`;
    }
    if (options.orientation) {
        url += `&orientation=${options.orientation}`;
    }

    try {
        const response = await fetch(url, {
            headers: { Authorization: PEXELS_API_CONFIG.apiKey }
        });
        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            const photo = randomize
                ? data.photos[Math.floor(Math.random() * data.photos.length)]
                : data.photos[0];

            const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;

            // 3. Store in cache for next time
            console.log('💾 Caching new image:', searchQ);
            const blob = await AdomantraCache.downloadAndCache(cacheKey, imageUrl);
            return AdomantraCache.createBlobUrl(blob) || imageUrl;
        }
    } catch (err) {
        console.error('Error fetching Pexels image:', err);
    }

    return options.fallback || PEXELS_API_CONFIG.fallbackImage;
}

/* ------------------------------------------------------------------ */
/* 1. Dynamic Services Grid (service.html)                             */
/* ------------------------------------------------------------------ */
function initPexelsServices() {
    var $grid = $('#dynamic-project-grid');
    if ($grid.length === 0) return;

    var categoryData = {
        'Media & Advertising': 'Reach your audience through high-impact digital channels, streaming TV, and automated programmatic ad buying.',
        'Growth & Strategy': 'Scale your business with sustainable organic growth, expert SEO, and comprehensive content marketing strategies.',
        'Tech & Development': 'Leverage cutting-edge technology, interactive rich media, and innovative development to build next-gen digital experiences.',
        'General Services': 'Comprehensive digital solutions tailored specifically to help your business thrive in the modern landscape.'
    };

    $.getJSON('assets/js/json/data.json', function (data) {
        var services = data.services;
        var grouped = {};

        // Group services by category
        $.each(services, function (_, service) {
            var cat = service.category || 'General Services';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(service);
        });

        var categories = Object.keys(grouped);
        var categoryPromises = [];

        // Build a promise chain per category
        $.each(categories, function (catIndex, category) {
            var categoryHtml = category; // Fallback to plain text
            var description = categoryData['General Services'] || '';

            // Search for the category in categoryData keys (allowing for HTML tags like <r>)
            $.each(categoryData, function (key, val) {
                var plainKey = key.replace(/<[^>]*>/g, ''); // Strip HTML to match
                if (plainKey === category) {
                    categoryHtml = key; // Use the HTML version for title
                    description = val;  // Use the description
                    return false; // Break $.each
                }
            });

            var slidePromises = [];

            $.each(grouped[category], function (_, service) {
                var slideDeferred = $.Deferred();

                fetchPexelsImage(service.title + ' digital marketing professional').then(function (pexelsUrl) {
                    var tags = (service.metaKeywords || 'Innovation, Security, Cloud').split(',').slice(0, 3);
                    var tagsHtml = $.map(tags, function (tag) {
                        return (
                            '<span class="project-area7__card-tag d-flex gap-2">' +
                            '<div class="icon">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">' +
                            '<line x1="9.5" x2="9.5" y2="7" stroke="currentColor"></line>' +
                            '<line x1="9.5" y1="12" x2="9.5" y2="19" stroke="currentColor"></line>' +
                            '<line x1="12" y1="9.5" x2="19" y2="9.5" stroke="currentColor"></line>' +
                            '<line y1="9.5" x2="7" y2="9.5" stroke="currentColor"></line>' +
                            '</svg></div>' +
                            tag.trim() +
                            '</span>'
                        );
                    }).join('');

                    var slideHtml =
                        '<div class="swiper-slide h-auto">' +
                        '<div class="project-area7__card section-item overflow-hidden features-card h-100" style="padding:0!important;margin:0;">' +
                        '<div class="project-area7__card-content">' +
                        '<div class="project-area7__card-year"><i class="' + service.icon + '"></i></div>' +
                        '<a href="service-details.html?id=' + service.id + '" class="project-area7__card-title">' + service.title + '</a>' +
                        '<p class="project-area7__card-desc" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;height:4.5em;">' + service.metaDescription + '</p>' +
                        '<div class="project-area7__card-tags flex-column">' + tagsHtml + '</div>' +
                        '</div>' +
                        '<div class="project-area7__card-thumb">' +
                        '<img src="' + pexelsUrl + '" alt="' + service.title + '" style="object-fit:cover;width:100%;height:100%;">' +
                        '<a href="service-details.html?id=' + service.id + '" class="project-area7__card-btn">See Details</a>' +
                        '</div></div></div>';

                    slideDeferred.resolve(slideHtml);
                });

                slidePromises.push(slideDeferred.promise());
            });

            var catDeferred = $.Deferred();

            $.when.apply($, slidePromises).then(function () {
                var slidesHtml = Array.prototype.slice.call(arguments).join('');
                var delay = (0.2 * catIndex).toFixed(1);

                var catHtml =
                    '<div class="category-section mb-5 " data-wow-delay="' + delay + 's">' +
                    '<div class="row align-items-end mb-4">' +
                    '<div class="col-lg-8">' +
                    '<h3 class="category-title mb-2" style="border-left:5px solid var(--primary-color);padding-left:15px">' + categoryHtml + '</h3>' +
                    '<p class="category-desc text-muted mb-0" style="max-width:600px;padding-left:15px;">' + (description || '') + '</p>' +
                    '</div>' +
                    '<div class="col-lg-4 d-flex justify-content-end gap-3 pb-2">' +
                    '<div class="inner-nav-btn prev-' + catIndex + '"><i class="fa-solid fa-chevron-left"></i></div>' +
                    '<div class="inner-nav-btn next-' + catIndex + '"><i class="fa-solid fa-chevron-right"></i></div>' +
                    '</div></div>' +
                    '<div class="swiper category-swiper-' + catIndex + ' overflow-hidden" style="padding:20px 0;">' +
                    '<div class="swiper-wrapper">' + slidesHtml + '</div>' +
                    '<div class="swiper-pagination pagination-' + catIndex + ' mt-4"></div>' +
                    '</div>' +
                    '</div>';

                catDeferred.resolve({ catIndex: catIndex, html: catHtml, slideCount: grouped[category].length });
            });

            categoryPromises.push(catDeferred.promise());
        });

        // Inject HTML in original category order, then init Swipers
        $.when.apply($, categoryPromises).then(function () {
            var results = $.map(Array.prototype.slice.call(arguments), function (r) { return r; });

            // Sort by catIndex to preserve order
            results.sort(function (a, b) { return a.catIndex - b.catIndex; });

            var fullHtml = $.map(results, function (r) { return r.html; }).join('');
            $grid.html(fullHtml);

            $.each(results, function (_, r) {
                new Swiper('.category-swiper-' + r.catIndex, {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    grabCursor: true,
                    loop: r.slideCount > 2,
                    speed: 800,
                    autoplay: {
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    },
                    navigation: {
                        nextEl: '.next-' + r.catIndex,
                        prevEl: '.prev-' + r.catIndex
                    },
                    breakpoints: {
                        768: { slidesPerView: 1 },
                        1200: { slidesPerView: 2 }
                    },
                    observer: true,
                    observeParents: true
                });
            });
        });

    }).fail(function () {
        console.error('Failed to load data.json for Pexels services.');
    });
}

/* ------------------------------------------------------------------ */
/* 2. Manual "Advanced Capabilities" section images                    */
/* ------------------------------------------------------------------ */
function initManualPexelsImages() {
    // Support both .service-area and .service-area-5
    var $boxes = $('.service-area .service-box, .service-area-5 .service-box');
    if ($boxes.length === 0) return;

    $boxes.each(function () {
        var $box = $(this);
        // Look for title in .title a or just .title
        var $title = $box.find('.title a');
        if ($title.length === 0) $title = $box.find('.title');

        var titleText = $title.text().trim();
        // Look for img inside .thumb, with or without .grow
        // Exclude images that have .pexels-api-load to avoid double-fetching
        var $img = $box.find('.thumb img:not(.pexels-api-load)');
        if ($img.length === 0) $img = $box.find('img.grow:not(.pexels-api-load)');

        if (titleText && $img.length) {
            fetchPexelsImage(titleText + ' technology professional').then(function (url) {
                $img.attr('src', url);
            });
        }
    });
}

/* ------------------------------------------------------------------ */
/* 3. Service Details page — hero + content backgrounds                */
/* ------------------------------------------------------------------ */
function initServiceDetailsPexels() {
    var $thumb1 = $('#service-thumb-1');
    var $thumb2 = $('#service-thumb-2');
    if ($thumb1.length === 0 && $thumb2.length === 0) return;

    var urlParams = new URLSearchParams(window.location.search);
    var serviceSlug = urlParams.get('service') || '';

    $.getJSON('assets/js/json/data.json', function (data) {
        var services = $.isArray(data) ? data : data.services;
        var service = null;

        $.each(services, function (_, s) {
            if (s.slug === serviceSlug || s.id === serviceSlug) {
                service = s;
                return false; // break
            }
        });

        if (!service) service = services[0];

        var title = service ? service.title : serviceSlug.replace(/-/g, ' ');
        var id = service ? service.id : serviceSlug;

        if ($thumb1.length) {
            fetchPexelsImage(id.replace(/-/g, ' ') + ' digital advertising campaign').then(function (url) {
                $thumb1.css('background-image', 'url(' + url + ')').removeAttr('data-bg-src');
            });
        }

        if ($thumb2.length) {
            fetchPexelsImage(title + ' marketing strategy').then(function (url) {
                $thumb2.css('background-image', 'url(' + url + ')').removeAttr('data-bg-src');
            });
        }

    }).fail(function (err) {
        console.error('initServiceDetailsPexels error:', err);
    });
}

/* ------------------------------------------------------------------ */
/* 4. Testimonial Faces                                                */
/* ------------------------------------------------------------------ */
/**
 * 4. Testimonial Faces — with caching support
 */
async function initTestimonialFaces() {
    const $faces = $('.testimonial-face-pexels:not([data-pexels-loaded])');
    if ($faces.length === 0) return;

    try {
        const response = await fetch('https://api.pexels.com/v1/search?query=human face portrait business person&per_page=20', {
            headers: { Authorization: PEXELS_API_CONFIG.apiKey }
        });
        const data = await response.json();
        const photos = data.photos || [];

        $faces.each(async function (index) {
            if (photos[index]) {
                const $el = $(this);
                const cacheKey = `face_${index}`;
                const imageUrl = photos[index].src.medium;

                // Use cache if available
                const cachedBlob = await AdomantraCache.get(cacheKey);
                if (cachedBlob) {
                    $el.attr('src', AdomantraCache.createBlobUrl(cachedBlob)).attr('data-pexels-loaded', 'true');
                } else {
                    $el.attr('src', imageUrl).attr('data-pexels-loaded', 'true');
                    // Cache it in background
                    AdomantraCache.downloadAndCache(cacheKey, imageUrl);
                }
            }
        });
    } catch (err) {
        console.error('Error fetching Pexels faces:', err);
    }
}

/* ------------------------------------------------------------------ */
/* 5. Achievement Section Background                                   */
/* ------------------------------------------------------------------ */
function initAchievementBackground() {
    var $target = $('#achievement-bg-pexels');
    if ($target.length === 0) return;

    var query = 'dark abstract gradient background blue grey';

    $.ajax({
        url: 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=15',
        type: 'GET',
        headers: { Authorization: PEXELS_API_CONFIG.apiKey }
    }).then(function (data) {
        var photos = data.photos || [];
        if (photos.length > 0) {
            var randomPhoto = photos[Math.floor(Math.random() * photos.length)];
            $target
                .css({
                    'background-image': 'url(' + randomPhoto.src.original + ')',
                    'background-size': 'cover',
                    'background-position': 'center'
                })
                .removeAttr('data-bg-src');
        }
    }).fail(function (err) {
        console.error('Error fetching achievement background:', err);
    });
}

/* ------------------------------------------------------------------ */
/* 6. Generic Pexels Loader (.pexels-api-load)                         */
/* ------------------------------------------------------------------ */
function initGenericPexelsImages() {
    var $targets = $('.pexels-api-load:not([data-pexels-loaded])');
    var $fallbacks = $('img[src*="service_0001.jpg"]:not([data-pexels-loaded])');
    $targets = $targets.add($fallbacks);

    if ($targets.length === 0) return;

    $targets.each(function () {
        var $el = $(this);
        var query = $el.data('pexels-query') || $el.attr('alt') || 'digital advertising technology';
        if (query === 'image') query = 'digital advertising technology';
        var randomize = $el.data('pexels-random') === true || $el.data('pexels-random') === 'true';
        var width = $el.data('pexels-width');
        var height = $el.data('pexels-height');

        fetchPexelsImage(query, randomize).then(function (url) {
            // Apply custom dimensions if provided and it's a pexels URL
            if (url.indexOf('pexels.com') !== -1 && (width || height)) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                if (width) url += separator + 'w=' + width;
                if (height) {
                    separator = url.indexOf('?') !== -1 ? '&' : '?';
                    url += separator + 'h=' + height + '&fit=crop';
                }
            }

            if ($el.is('img')) {
                $el.attr('src', url);
            } else {
                $el.css('background-image', 'url(' + url + ')');
            }
            $el.attr('data-pexels-loaded', 'true');
        });
    });
}

/* ------------------------------------------------------------------ */
/* Bootstrap on DOM ready                                               */
/* ------------------------------------------------------------------ */
$(function () {

    // 1. Dynamic Services Grid (service.html)
    if ($('#dynamic-project-grid').length) {
        initPexelsServices();
    }

    // 2. Manual "Advanced Capabilities" images
    initManualPexelsImages();

    // 3. Service Details hero + content backgrounds
    if ($('#service-thumb-1, #service-thumb-2').length) {
        initServiceDetailsPexels();
    }

    // 4. Testimonial Faces (+ MutationObserver for dynamic content)
    if ($('#testimonial-wrapper').length) {
        initTestimonialFaces();

        var observer = new MutationObserver(function (mutations) {
            $.each(mutations, function (_, mutation) {
                if (mutation.addedNodes.length) {
                    initTestimonialFaces();
                }
            });
        });

        observer.observe(document.getElementById('testimonial-wrapper'), {
            childList: true,
            subtree: true
        });
    }

    // 5. Achievement background
    initAchievementBackground();

    // 6. Generic Pexels loader
    initGenericPexelsImages();

});

// Listen for dynamically loaded components
document.addEventListener('componentsLoaded', function () {
    console.log('🔄 Components loaded, re-initializing Pexels images...');
    initGenericPexelsImages();
    initManualPexelsImages(); // Also check for manual boxes in loaded components
});