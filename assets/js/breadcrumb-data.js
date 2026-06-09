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
  ]
};

// Export for use if needed (standard script tag will just make it global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = breadcrumbData;
}
