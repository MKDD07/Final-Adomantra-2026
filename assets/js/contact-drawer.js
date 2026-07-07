(function ($) {
  "use strict";

  $(document).ready(function () {
    // Inject left-side image dynamically for desktop two-column view
    const $drawerContent = $(".contact-drawer-content");
    if ($drawerContent.length && !$(".contact-drawer-image").length) {
      $drawerContent.prepend('<div class="contact-drawer-image d-none d-sm-block"><img data-pexels="modern digital agency teamwork workspace" alt="Contact Us"></div>');
      if (window.PexelsLoader && typeof window.PexelsLoader.scan === 'function') {
        window.PexelsLoader.scan($drawerContent[0]);
      }
    }

    const $drawer = $(".contact-drawer");
    const $overlay = $(".contact-drawer-overlay");
    const $triggers = $(".contact-drawer-trigger");
    const $closeBtn = $("#closeDrawer");

    function openDrawer() {
      $drawer.addClass("active");
      $overlay.addClass("active");
      $("body").addClass("no-scroll");
      $(".ado-sideinfo").removeClass("info-open");
      $(".offcanvas-overlay").removeClass("overlay-open");
      $(".services-drawer").removeClass("active");
      $(".services-drawer-overlay").removeClass("active");
    }

    function closeDrawer() {
      $drawer.removeClass("active");
      $overlay.removeClass("active");
      $("body").removeClass("no-scroll");
    }

    $(document).on("click", ".contact-drawer-trigger", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openDrawer();
    });

    $closeBtn.on("click", closeDrawer);
    $overlay.on("click", closeDrawer);

    // Close on ESC
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  });

})(jQuery);