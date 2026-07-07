/**
 * Breadcrumb Data Configuration
 * Keys are the HTML filenames
 */
const breadcrumbData = {
  "index.html": [
    { label: "Home", href: "index.html", isHome: true }
  ],
  "about-us.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "About Us", href: "about-us.html", active: true }
  ],
  "service.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Services", href: "service.html", active: true }
  ],
  "service-details.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Services", href: "service.html" },
    { label: "Service Name", href: "service-details.html", active: true, dynamic: true }
  ],
  "portfolio.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Portfolio", href: "portfolio.html", active: true }
  ],
  "blog.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Blog", href: "blog.html", active: true }
  ],
  "blog-details.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Blog", href: "blog.html" },
    { label: "Blog Name", href: "blog-details.html", active: true, dynamic: true }
  ],
  "case-studies.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Case Studies", href: "case-studies.html", active: true }
  ],
  "case-studies-details.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Case Studies", href: "case-studies.html" },
    { label: "Case Study Details", href: "case-studies-details.html", active: true, dynamic: true }
  ],
  "industries.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Industries", href: "industries.html", active: true }
  ],
  "industries-details.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Industries", href: "industries.html" },
    { label: "Industry Details", href: "industries-details.html", active: true, dynamic: true }
  ],
  "contact.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Contact Us", href: "contact.html", active: true }
  ],
  "team.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Our Team", href: "team.html", active: true }
  ],
  "faq.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "FAQ", href: "faq.html", active: true }
  ],
  "service-detailsx.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Services", href: "service.html" },
    { label: "Service Name", href: "service-detailsx.html", active: true, dynamic: true }
  ],
  "404.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "404 Error", href: "404.html", active: true }
  ],
  "career.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Careers", href: "career.html", active: true }
  ],
  "privacy-policy.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Privacy Policy", href: "privacy-policy.html", active: true }
  ],
  "terms-and-conditions.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Terms & Conditions", href: "terms-and-conditions.html", active: true }
  ],
  "cookie-policy.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Cookie Policy", href: "cookie-policy.html", active: true }
  ],
  "website-disclaimer.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Website Disclaimer", href: "website-disclaimer.html", active: true }
  ],
  "refund-and-cancellation-policy.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Refund & Cancellation Policy", href: "refund-and-cancellation-policy.html", active: true }
  ],
  "master-service-agreement.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Master Service Agreement (MSA)", href: "master-service-agreement.html", active: true }
  ],
  "data-processing-agreement.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Data Processing Agreement (DPA)", href: "data-processing-agreement.html", active: true }
  ],
  "contact-us.html": [
    { label: "Home", href: "index.html", isHome: true },
    { label: "Contact Us", href: "contact-us.html", active: true }
  ]
};

// Export for use if needed (standard script tag will just make it global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = breadcrumbData;
}
