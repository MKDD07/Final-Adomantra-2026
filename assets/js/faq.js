document.addEventListener('DOMContentLoaded', function () {
    const mainFaqContainer = document.getElementById('accordionExample');
    const serviceFaqContainer = document.getElementById('services-faq-accordion') || document.getElementById('services-faq-accordion-new');

    // Determine which container to use
    const targetContainer = mainFaqContainer || serviceFaqContainer;

    if (!targetContainer) {
        // console.warn('FAQ: No target container found (#accordionExample, #services-faq-accordion, or #services-faq-accordion-new)');
        return;
    }

    // Fetch the FAQ data
    fetch('assets/js/json/faq.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Update SEO for General FAQ page
            if (mainFaqContainer) {
                document.title = "Frequently Asked Questions | Adomantra";
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', "Find answers to common questions about Adomantra's digital marketing, SEO, and AI solutions.");
            }

            if (serviceFaqContainer) {
                // If on services page, maybe we filter for specific categories or just render all
                renderServiceFAQs(data, serviceFaqContainer);
            } else {
                renderAllFAQs(data, mainFaqContainer);
            }
        })
        .catch(error => console.error('Error loading FAQ data:', error));

    /**
     * Standard Categorical Rendering (used for main FAQ page)
     */
    function renderAllFAQs(data, container) {
        const { categories, faqs } = data;
        let html = '';
        let globalIndex = 0;

        const activeCategories = categories.filter(cat => faqs.some(f => f.category === cat.id));

        activeCategories.forEach((cat, index) => {
            const categoryFaqs = faqs.filter(f => f.category === cat.id);
            const accordionId = `accordion-cat-${cat.id}`;
            const mbClass = index === activeCategories.length - 1 ? '' : 'mb-5';

            html += `
                <div class="faq-category-box ${mbClass} " data-wow-delay="0.2s">
                    <div class="faq-category-header mb-4">
                        <h2 class="category-title">${cat.name}</h2>
                        <div class="category-divider"></div>
                    </div>
                    <div class="accordion" id="${accordionId}">
                        ${generateAccordionItems(categoryFaqs, accordionId, globalIndex)}
                    </div>
                </div>
            `;
            globalIndex += categoryFaqs.length;
        });

        container.innerHTML = html;
        initWow();
    }

    /**
     * Streamlined Rendering for Service Page
     */
    function renderServiceFAQs(data, container) {
        const { faqs } = data;
        // For services page, we show all FAQs in a single flat list
        // Use the container's own ID as the parent for the accordion items
        const parentId = container.id || 'services-faq-accordion-inner';

        container.innerHTML = generateAccordionItems(faqs, parentId, 0);
        initWow();
    }

    /**
     * Helper to generate accordion items HTML
     */
    function generateAccordionItems(items, parentId, startIndex) {
        return items.map((faq, index) => {
            const globalIndex = startIndex + index;
            const collapseId = `collapseGlobal${globalIndex}`;
            const headerId = `headingGlobal${globalIndex}`;
            const showClass = (index === 0 && startIndex === 0) ? 'show' : '';
            const collapsedClass = (index === 0 && startIndex === 0) ? '' : 'collapsed';
            const expanded = (index === 0 && startIndex === 0) ? 'true' : 'false';

            return `
                <div class="global-accordion-item">
                    <div class="global-accordion-header" id="${headerId}">
                        <button class="faq-button border-bottom-lightgray-500 w-100 d-flex justify-content-between ${collapsedClass} style" 
                             data-bs-toggle="collapse" 
                             data-bs-target="#${collapseId}" 
                             aria-expanded="${expanded}" 
                             aria-controls="${collapseId}">
                             ${faq.question} 
                             <span class="faq-icon">
                                <i class="fa-solid fa-chevron-down"></i>
                             </span>
                        </button>
                    </div>
                    <div id="${collapseId}" class="global-accordion-collapse collapse ${showClass}" 
                         aria-labelledby="${headerId}" data-bs-parent="#${parentId}">
                        <div class="global-accordion-body style">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function initWow() {
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    }
});

