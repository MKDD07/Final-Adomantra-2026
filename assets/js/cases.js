document.addEventListener("DOMContentLoaded", async function () {

    // ── Pexels API ───────────────────────────────────────────────────────────
    const PEXELS_API_KEY = 'y6WP5reQNH7abdL2uzdLTyV8pq0kMmF3CHf7ZNkiHo98DXIvORUOBSfi';

    /**
     * Fetch a single image from Pexels that matches `query`.
     * Returns the "large" size URL, or `fallback` on any error.
     */
    async function fetchPexelsImage(query, fallback) {
        try {
            const res = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                { headers: { Authorization: PEXELS_API_KEY } }
            );
            if (!res.ok) throw new Error('Pexels API error: ' + res.status);
            const data = await res.json();
            return data.photos && data.photos.length > 0
                ? data.photos[0].src.large
                : fallback;
        } catch (err) {
            console.warn('Pexels fetch failed for "' + query + '":', err.message);
            return fallback;
        }
    }

    function loadSection(id, content) {
        document.getElementById(id).innerHTML = content;
    }

    // ── Fetch all 6 card images + 2 blog images in parallel ─────────────────
    const [
        imgRealEstate,   // Card 1 – Real Estate
        imgOlaApp,       // Card 2 – Ola App & Play
        imgJewellery,    // Card 3 – Malabar Jewellery
        imgFoodDelivery, // Card 4 – Food Delivery
        imgClinic,       // Card 5 – Kaya Clinic
        imgEdTech,       // Card 6 – BST Classes
        imgBlog1,
        imgBlog2
    ] = await Promise.all([
        fetchPexelsImage('real estate property modern building aerial', 'assets/imgs/project/project-img-1.jpg'),
        fetchPexelsImage('mobile app technology smartphone ride sharing urban', 'assets/imgs/project/project-img-1.jpg'),
        fetchPexelsImage('luxury jewellery gold diamond ring premium store', 'assets/imgs/project/project-img-2.jpg'),
        fetchPexelsImage('food delivery restaurant meal packaging courier', 'assets/imgs/project/project-img-2.jpg'),
        fetchPexelsImage('beauty skin clinic healthcare consultation doctor woman', 'assets/imgs/project/project-img-3.jpg'),
        fetchPexelsImage('online education student learning classroom technology', 'assets/imgs/project/project-img-3.jpg'),
        fetchPexelsImage('generative AI creative design digital art media', 'assets/imgs/blog/blog.jpg'),
        fetchPexelsImage('artificial intelligence business technology future', 'assets/imgs/blog/blog-2.jpg'),
    ]);

    // ── Case Studies Section ─────────────────────────────────────────────────
    loadSection("case-studies", `     <div class="about-area-details">
  <div class="container large">
    <div class="about-area-details-inner">
      <div class="section-header fade-anim">
        <div class="section-title-wrapper">
          <div class="subtitle-wrapper">
            <span class="section-subtitle">Digital Excellence in Action</span>
          </div>
          <div class="title-wrapper">
            <h2 class="section-title font-sequelsans-romanbody">
              Award-Winning Campaigns Driving Real ROI
            </h2>
          </div>
        </div>
      </div>
<div class="section-content-wrapper fade-anim">
  <div class="info-list">
    <ul>
      <li class="case-study-btn active" data-text="Our Real Estate initiatives focus on high-intent lead generation through hyper-local targeting. By deploying geo-fenced display ads and intent-driven search campaigns, we optimized the conversion funnel to reduce CPL (Cost Per Lead) by 40%. We ensure that every lead is backed by demographic data, resulting in higher site-visit ratios for premium developers.">Real Estate</li>
      
      <li class="case-study-btn" data-text="For Ola App & Play, we executed a massive user acquisition strategy centered on programmatic mobile advertising. By utilizing data-backed audience segmentation and real-time bidding, we boosted app installs and active user engagement across Tier 1 and Tier 2 cities. Our approach focused on LTV (Life Time Value) to ensure sustainable growth rather than just vanity metrics.">Ola App & Play</li>
      
      <li class="case-study-btn" data-text="In our partnership with Malabar Jewellery, we managed Pan-India eCommerce campaigns specifically targeting potential brides in the 24–32 age bracket. Leveraging shopping ads and regional lifestyle websites, we delivered over 47Mn+ impressions with a 0.6% CTR. The campaign bridged the gap between digital discovery and offline retail trust.">Malabar Jewellery</li>
      
      <li class="case-study-btn" data-text="Our Food Delivery performance campaigns combined creative storytelling with aggressive performance marketing. We utilized dynamic creative optimization (DCO) to serve personalized ads based on meal times and local weather conditions, successfully driving platform orders and maintaining high brand recall in a hyper-competitive market.">Food Delivery</li>
      
      <li class="case-study-btn" data-text="For Kaya Clinic, we engineered a digital visibility framework to scale patient acquisition. By building specialized healthcare funnels and using targeted search advertising, we ensured a consistent growth in appointments. Our strategy focused on building 'Brand Trust' through educational content and high-precision targeting of wellness seekers.">Kaya Clinic</li>
      
      <li class="case-study-btn" data-text="BST Competitive Classes required a localized scaling model. We implemented a full-funnel digital strategy, ranging from awareness via social media to conversion via search engine marketing. This hyper-local approach led to a significant increase in student enrollments and established them as a digital leader in the competitive education sector.">BST Competitive Classes</li>
    </ul>
  </div>

  <div class="section-content">
    <div class="text-wrapper" data-direction="right" id="content-target">
      <p class="text">
        Our Real Estate initiatives focus on high-intent lead generation through hyper-local targeting. By deploying geo-fenced display ads and intent-driven search campaigns, we optimized the conversion funnel to reduce CPL (Cost Per Lead) by 40%. We ensure that every lead is backed by demographic data, resulting in higher site-visit ratios for premium developers.
      </p>
    </div>
    <div class="btn-wrapper" data-direction="right">
      <a href="https://www.adomantra.com/case-study" class="rr-btn">
        <span class="btn-wrap">
          <span class="text-one">View Case Studies</span>
        </span>
      </a>
    </div>
  </div>
</div>
    </div>
  </div>
  <div class="moving-gallery fade-anim">
    <ul class="wrapper-gallery">
      <li>
        <img src="${imgRealEstate}" alt="Real Estate - Lead Generation & Geo-Targeted Campaigns">
      </li>
      <li>
        <img src="${imgOlaApp}" alt="Ola App & Play - Programmatic Mobile & User Acquisition">
      </li>
      <li>
        <img src="${imgJewellery}" alt="Malabar Jewellery - Pan India eCommerce & Branding Campaign">
      </li>
      <li>
        <img src="${imgFoodDelivery}" alt="Food Delivery - Performance Marketing & Order Growth">
      </li>
      <li>
        <img src="${imgClinic}" alt="Kaya Clinic - Healthcare Patient Acquisition & Digital Visibility">
      </li>
    </ul>
  </div>
</div>
  `); loadSection("case-infomation", `
    <section class="approach-area-about-page">
        <div class="container large">
            <div class="approach-area-about-page-inner section-spacing">
                
                <div class="section-header fade-anim">
                    <div class="section-title-wrapper">
                        <div class="subtitle-wrapper">
                            <span class="section-subtitle">Our Method</span>
                        </div>
                        <div class="title-wrapper">
                            <h2 class="section-title font-sequelsans-romanbody split-text-anim">
                                Precision-driven process for <br> exponential brand growth
                            </h2>
                        </div>
                    </div>
                </div>

                <div class="approach-wrapper-box">
                    <div class="approach-wrapper">
                        
                        <div class="approach-box gsap-reveal-column">
                            <h2 class="title">Consumer <br> Intelligence 
                                <img src="assets/imgs/shape/shape-13.webp" alt="icon">
                            </h2>
                            <div class="approach-list">
                                <ul>
                                    <li>AI Intent Discovery</li>
                                    <li>Zero-Click Impact Analysis</li>
                                    <li>Competitive Benchmarking</li>
                                    <li>Audience Persona Mapping</li>
                                    <li>Data-Driven Insights</li>
                                    <li>Behavioral Research</li>
                                </ul>
                            </div>
                        </div>

                        <div class="approach-box gsap-reveal-column">
                            <h2 class="title">Strategic <br> Innovation 
                                <img src="assets/imgs/shape/shape-13.webp" alt="icon">
                            </h2>
                            <div class="approach-list">
                                <ul>
                                    <li>GEO & LLM Optimization</li>
                                    <li>Structured Data Architecture</li>
                                    <li>Content Snippet Engineering</li>
                                    <li>Brand Narrative Design</li>
                                    <li>Multi-Channel Ecosystem</li>
                                    <li>ISO Quality Framework</li>
                                </ul>
                            </div>
                        </div>

                        <div class="approach-box gsap-reveal-column">
                            <h2 class="title">Performance <br> Delivery</h2>
                            <div class="approach-list">
                                <ul>
                                    <li>Agile Campaign Scaling</li>
                                    <li>Real-time ROI Tracking</li>
                                    <li>Advanced Media Buying</li>
                                    <li>Conversion Rate Mastery</li>
                                    <li>Transparent Reporting</li>
                                    <li>End-to-End Execution</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </section>
`);
    // ── Case Studies Results / Blog Section ──────────────────────────────────
    loadSection("case-studies-results", `
 <div class="blog__inner">
        <div class="container rr-container-1800">
        <div class="service-section__info mb-5">
            <h4 class="fs-1 original-black split-text-reveal" data-wow-delay="0.3s">Latest Insights: How AI is
                powering the next <br>
                    generation of business innovation and digital <br>
                        transformation</h4>
                    <a href="#" class="rr-btn-border fadeInUp" data-wow-delay="0.3s">
                        <span class="text">VIEW ALL SERVICES</span>
                        <span class="icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_46_7)">
                                <path d="M22.0007 10.9995C16.6014 10.9995 12.2229 6.0753 12.2229 -0.000488281"
                                    stroke="#101010" stroke-width="2" stroke-miterlimit="10" />
                                <path d="M12.2229 21.9995C12.2229 15.9253 16.5999 10.9995 22.0007 10.9995"
                                    stroke="#101010" stroke-width="2" stroke-miterlimit="10" />
                                <path d="M22.0005 10.9995H0.000488281" stroke="#101010" stroke-width="2"
                                    stroke-miterlimit="10" />
                            </g>

                        </svg>
                        </span>
                    </a>
                </div>
                <div class="line-new-design"></div>
                <div class="blog__wrapper">
                    <div class="swiper blog-active">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="blog__item">
                                    <div class="blog__media overflow-hidden">
                                        <a href="#"><img data-speed="0.9" src="${imgBlog1}" alt="Generative AI in Design" style="object-fit:cover;width:100%;height:100%;"></a>
                                    </div>
                                    <div class="blog__content">
                                        <div class="blog__top">
                                            <span>July 25, 2025</span>
                                            <h2 class="title fadeInUp" data-wow-delay="0.3s"><a href="#">Global Creativity
                                                Unlocked: The
                                                <br>
                                                    Role of Generative AI in Design, <br>
                                                        Content, and Media</a></h2>
                                                <p class="decs">Duis aute irure dolor in reprehenderit in voluptate velit esse
                                                    cillum dolorefugiat
                                                    nulla pariatur. excepteur sinte, occaecat cupidatat non proident,</p>
                                            </div>
                                            <div class="blog__bottom">
                                                <a href="#">Read the Full Article</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <div class="swiper-slide">
                                <div class="blog__item">
                                    <div class="blog__media overflow-hidden">
                                        <a href="#"><img data-speed="0.9" src="${imgBlog2}" alt="AI Business Innovation" style="object-fit:cover;width:100%;height:100%;"></a>
                                    </div>
                                    <div class="blog__content">
                                        <div class="blog__top">
                                            <span>July 25, 2025</span>
                                            <h2 class="title"><a href="#">Global Creativity Unlocked: The <br>
                                                Role of Generative AI in Design, <br>
                                                    Content, and Media</a></h2>
                                            <p class="decs">Duis aute irure dolor in reprehenderit in voluptate velit esse
                                                cillum dolorefugiat
                                                nulla pariatur. excepteur sinte, occaecat cupidatat non proident,</p>
                                        </div>
                                        <div class="blog__bottom">
                                            <a href="#">Read the Full Article</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>
        </div>
    </div>
  `);

    // ── Initialize blog Swiper AFTER innerHTML is injected ───────────────────
    if (typeof Swiper !== "undefined" && document.querySelector(".blog-active")) {
        new Swiper(".blog-active", {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 25,
            speed: 2000,
            observer: true,
            observeParents: true,
            pagination: {
                el: ".blog-active .swiper-pagination",
                type: "progressbar",
            },
            breakpoints: {
                1200: {
                    slidesPerView: 2,
                    spaceBetween: 25,
                },
            },
        });
    }

    // ── case-study-btn click handler ──────────────────────────────────────────
    // Must be attached AFTER loadSection() injects the .case-study-btn elements.
    document.querySelectorAll('.case-study-btn').forEach(button => {
        button.addEventListener('click', function () {
            // Update Active UI
            document.querySelectorAll('.case-study-btn').forEach(el => el.classList.remove('active'));
            this.classList.add('active');

            // Select the target container
            const targetDiv = document.getElementById('content-target');
            const newParaText = this.getAttribute('data-text');

            // Smooth swap animation
            targetDiv.style.opacity = '0';
            targetDiv.style.transform = 'translateY(10px)';

            setTimeout(() => {
                targetDiv.innerHTML = `<p class="text">${newParaText}</p>`;
                targetDiv.style.opacity = '1';
                targetDiv.style.transform = 'translateY(0)';
            }, 300);
        });
    });
});
// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

function animateApproachSection() {
    // 1. Title Split Text Animation
    const splitTitle = new SplitText(".split-text-anim", { type: "chars, words" });
    gsap.from(splitTitle.chars, {
        duration: 1,
        y: 50,
        autoAlpha: 0,
        stagger: 0.02,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".split-text-anim",
            start: "top 85%",
        }
    });

    // 2. Approach Boxes Staggered Reveal
    gsap.from(".gsap-reveal-column", {
        duration: 1.2,
        y: 100,
        autoAlpha: 0,
        stagger: 0.1, // Delay between each box
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".approach-wrapper",
            start: "top 80%",
        }
    });

    // 3. List Item Fade-in
    gsap.from(".approach-list li", {
        duration: 0.8,
        x: -20,
        autoAlpha: 0,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".approach-wrapper",
            start: "top 70%",
        }
    });
}

// Initialize
animateApproachSection();