/***************************************************
==================== JS INDEX ======================
01. Data Background Set
02. Sticky Header
03. GSAP Plugins Register
04. Smooth Scroll
05. Fade Animation
06. Preloader
07. Side Info Toggle
08. Mean Menu Init
09. Video Popup
10. Text Invert Scroll Effect
11. Smooth Anchor Scroll
12. Nice Select Init
****************************************************/

(function ($) {
    "use strict";

    var windowOn = $(window);
    let mm = gsap.matchMedia();

    /* === Data Css Js (index 01) === */
    $("[data-background]").each(function () {
        $(this).css(
            "background-image",
            "url( " + $(this).attr("data-background") + "  )"
        );
    });

    /* === sticky header Js (index 02) === */
    function pinned_header() {
        var lastScrollTop = 0;

        windowOn.on('scroll', function () {
            var currentScrollTop = $(this).scrollTop();
            if (currentScrollTop > lastScrollTop) {
                $('.header-sticky').removeClass('sticky');
                $('.header-sticky').addClass('transformed');
            } else if ($(this).scrollTop() <= 300) {
                $('.header-sticky').removeClass('sticky');
                $('.header-sticky').removeClass('transformed');
            } else {
                // Scrolling up, remove the class
                $('.header-sticky').addClass('sticky');
                $('.header-sticky').removeClass('transformed');
            }
            lastScrollTop = currentScrollTop;
        });
    }
    pinned_header();

    /* === Register GSAP Plugins Js (index 02) === */
    if (typeof ScrollSmoother !== "undefined") {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);
    } else {
        gsap.registerPlugin(ScrollTrigger, CustomEase);
    }

    let device_width = window.innerWidth;

    if (device_width > 767) {
        if (document.querySelector("#has_smooth") && document.querySelector("#has_smooth").classList.contains("has-smooth")) {
            const smoother = ScrollSmoother.create({
                // smooth: 0.9,
                smooth: 0.9,
                effects: device_width < 1025 ? false : true,
                smoothTouch: 0.1,
                // normalizeScroll: false,
                normalizeScroll: {
                    allowNestedScroll: true,
                },
                ignoreMobileResize: true,
                preventDefault: false,
                smoothTouch: 0.05,
                touchMultiplier: 1,
            });
        }
    }

    /* === GSAP Fade Animation Js (index 04) === */
    let fadeArray_items = document.querySelectorAll(".fade-anim");
    if (fadeArray_items.length > 0) {
        const fadeArray = gsap.utils.toArray(".fade-anim")
        fadeArray.forEach((item, i) => {
            var fade_direction = "bottom"
            var onscroll_value = 1
            var duration_value = 1.15
            var fade_offset = 50
            var delay_value = 0.15
            var ease_value = "power2.out"
            if (item.getAttribute("data-offset")) {
                fade_offset = item.getAttribute("data-offset");
            }
            if (item.getAttribute("data-duration")) {
                duration_value = item.getAttribute("data-duration");
            }
            if (item.getAttribute("data-direction")) {
                fade_direction = item.getAttribute("data-direction");
            }
            if (item.getAttribute("data-on-scroll")) {
                onscroll_value = item.getAttribute("data-on-scroll");
            }
            if (item.getAttribute("data-delay")) {
                delay_value = item.getAttribute("data-delay");
            }
            if (item.getAttribute("data-ease")) {
                ease_value = item.getAttribute("data-ease");
            }
            let animation_settings = {
                opacity: 0,
                ease: ease_value,
                duration: duration_value,
                delay: delay_value,
            }
            if (fade_direction == "top") {
                animation_settings['y'] = -fade_offset
            }
            if (fade_direction == "left") {
                animation_settings['x'] = -fade_offset;
            }
            if (fade_direction == "bottom") {
                animation_settings['y'] = fade_offset;
            }
            if (fade_direction == "right") {
                animation_settings['x'] = fade_offset;
            }
            if (onscroll_value == 1) {
                animation_settings['scrollTrigger'] = {
                    trigger: item,
                    start: 'top 85%',
                }
            }
            gsap.from(item, animation_settings);
        })
    }

    /* === Text Animation Export === */
    window.startTextAnimation = function() {
        if (typeof gsap !== "undefined" && typeof SplitText !== "undefined" && $('.rr-title-anim-2').length) {
            gsap.registerPlugin(ScrollTrigger, SplitText);

            let staggerAmount = 0.05,
                translateXValue = 20,
                delayValue = 0.5,
                easeType = "power2.out",
                animatedTextElements = document.querySelectorAll('.rr-title-anim-2');

            animatedTextElements.forEach((element) => {
                let animationSplitText = new SplitText(element, { type: "chars, words" });
                gsap.from(animationSplitText.chars, {
                    duration: 1,
                    delay: delayValue,
                    x: translateXValue,
                    autoAlpha: 0,
                    stagger: staggerAmount,
                    ease: easeType,
                    scrollTrigger: { trigger: element, start: "top 85%" },
                });
            });
        }
    };


    /* === Side Info  Js (index 06) === */
    $(document).on("click", ".ado-side-toggle", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(".ado-sideinfo").toggleClass("info-open");
        $(".offcanvas-overlay").toggleClass("overlay-open");
    });

    $(document).on("click", ".ado-sideinfo__close,.offcanvas-overlay", function (e) {
        e.preventDefault();
        $(".ado-sideinfo").removeClass("info-open");
        $(".offcanvas-overlay").removeClass("overlay-open");
    });

    $(document).on("click", function (e) {
        if ($(".ado-sideinfo").hasClass("info-open")) {
            if (!$(e.target).closest(".ado-sideinfo").length && !$(e.target).closest(".ado-side-toggle").length) {
                $(".ado-sideinfo").removeClass("info-open");
                $(".offcanvas-overlay").removeClass("overlay-open");
            }
        }
    });

    /* $(window).scroll(function () {
        if ($("body").scrollTop() > 0 || $("html").scrollTop() > 0) {
            $(".ado-sideinfo").removeClass("info-open");
            $(".offcanvas-overlay").removeClass("overlay-open");
        }
    }); */

    /* === Mean menu activation  Js (index 07) === */
    $('.main-menu').meanmenu({
        meanScreenWidth: "1199",
        meanMenuContainer: '.mobile-menu',
        meanMenuCloseSize: '28px',
    });
    $('.main-menu-all').meanmenu({
        meanScreenWidth: "5000",
        meanMenuContainer: '.mobile-menu',
        meanMenuCloseSize: '28px',
    });

    /* === Magnific Video popup Js (index 08) === */
    if ($('.video-popup').length && 'magnificPopup' in jQuery) {
        $('.video-popup').magnificPopup({
            type: 'iframe',
        });
    }

    /* === Text Invert With Scroll Js (index 09) === */
    const split = new SplitText(".text-invert", { type: "lines" });
    split.lines.forEach((target) => {
        gsap.to(target, {
            backgroundPositionX: 0,
            ease: "none",
            scrollTrigger: {
                trigger: target,
                scrub: 1,
                start: 'top 85%',
                end: "bottom center",
            }
        });
    });



    /* === gsap nav Js (index 10) === */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth',
                });
            }
        });
    });

    /* === Nice Select Js (index 11) === */
    $("select").niceSelect();


    /* ========  main Js ======== */

    /* === Services Drawer JS === */
    const $servicesDrawer = $(".services-drawer");
    const $servicesOverlay = $(".services-drawer-overlay");

    function openServicesDrawer() {
        $servicesDrawer.addClass("active");
        $servicesOverlay.addClass("active");
        $("body").addClass("no-scroll");
        // Close other drawers if open
        $(".ado-sideinfo").removeClass("info-open");
        $(".offcanvas-overlay").removeClass("overlay-open");
        $(".contact-drawer").removeClass("active");
        $(".contact-drawer-overlay").removeClass("active");
    }

    function closeServicesDrawer() {
        $servicesDrawer.removeClass("active");
        $servicesOverlay.removeClass("active");
        $("body").removeClass("no-scroll");
    }

    // Intercept "Services" clicks on bottom floating navigation for screens < 576px
    $(document).on("click", ".mob-nav__item[href='service.html']", function (e) {
        if (window.innerWidth < 576) {
            e.preventDefault();
            e.stopPropagation();
            openServicesDrawer();
        }
    });

    // Close listeners
    $(document).on("click", "#closeServicesDrawer, .services-drawer-overlay", function (e) {
        e.preventDefault();
        closeServicesDrawer();
    });

    // Close on ESC key
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            closeServicesDrawer();
        }
    });

})(jQuery);

