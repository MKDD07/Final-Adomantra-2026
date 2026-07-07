/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │  spline-path.js  –  Scroll-drawn spline plugin              │
 * │  A single SVG line draws itself top→bottom as you scroll.   │
 * │  The stroke colour shifts seamlessly across sections.       │
 * └─────────────────────────────────────────────────────────────┘
 *
 * DEPENDENCIES  (load BEFORE this script)
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
 *
 * HOW IT WORKS
 *   • An SVG is injected that fills the full document height.
 *   • A single <path> is built from bezier waypoints – one per
 *     section listed in SPLINE_CONFIG.sections.
 *   • stroke-dashoffset is animated 0→totalLength via GSAP scrub,
 *     so the line "draws" exactly as fast as you scroll.
 *   • A <linearGradient> along the path is rebuilt on resize so
 *     colours always map to the right section.
 *
 * CONFIGURATION  –  set window.SPLINE_CONFIG before loading.
 * ─────────────────────────────────────────────────────────────
 * global
 *   strokeWidth   px (default 2.5)
 *   opacity       0–1 (default 0.85)
 *   zIndex        default -1 (behind page)
 *   glowBlur      px – soft glow radius (default 8)
 *   scrubSpeed    higher = more lag, smoother feel (default 1.5)
 *   xAmplitude    how wide the spline swings left/right (default 0.38 × vw)
 *   design        global shape: "wave"|"zig"|"curl"|"center"
 *                 (can be overridden per section)
 *
 * sections[]
 *   id            element id to anchor this segment to
 *   colors        array of ≥2 hex/rgba – gradient across this segment
 *   design        override global shape for this segment only (optional)
 *   strokeWidth   override width for this segment (optional)
 * ─────────────────────────────────────────────────────────────
 */

;(function () {
  'use strict'

  /* ── default config ────────────────────────────────────────── */
  var CFG = window.SPLINE_CONFIG = Object.assign({
    global: {},
    sections: []
  }, window.SPLINE_CONFIG)

  var G = Object.assign({
    strokeWidth : 2.5,
    opacity     : 0.85,
    zIndex      : -1,
    glowBlur    : 8,
    scrubSpeed  : 1.5,
    xAmplitude  : 0.38,   // fraction of viewport width
    design      : 'wave'
  }, CFG.global)

  /* ── inject SVG ────────────────────────────────────────────── */
  var svgNS = 'http://www.w3.org/2000/svg'

  var svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('id', 'spline-path-svg')
  svg.setAttribute('xmlns', svgNS)
  Object.assign(svg.style, {
    position       : 'absolute',
    top            : '0',
    left           : '0',
    width          : '100%',
    height         : '100%',
    pointerEvents  : 'none',
    zIndex         : G.zIndex,
    opacity        : G.opacity,
    overflow       : 'visible'
  })

  /* wrapper so svg sits behind content but above body bg */
  var wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position       : 'absolute',
    top            : '0',
    left           : '0',
    width          : '100%',
    height         : '100%',
    pointerEvents  : 'none',
    zIndex         : G.zIndex,
    overflow       : 'hidden'
  })

  /* make sure body is positioned */
  if (getComputedStyle(document.body).position === 'static') {
    document.body.style.position = 'relative'
  }

  /* defs */
  var defs = document.createElementNS(svgNS, 'defs')

  /* gradient */
  var grad = document.createElementNS(svgNS, 'linearGradient')
  grad.setAttribute('id', 'spline-grad')
  grad.setAttribute('gradientUnits', 'userSpaceOnUse')
  /* x1/y1/x2/y2 set at build time */
  defs.appendChild(grad)

  /* filter: glow */
  var filter = document.createElementNS(svgNS, 'filter')
  filter.setAttribute('id', 'spline-glow')
  filter.setAttribute('x', '-50%'); filter.setAttribute('width', '200%')
  filter.setAttribute('y', '-5%');  filter.setAttribute('height', '110%')
  var feGauss = document.createElementNS(svgNS, 'feGaussianBlur')
  feGauss.setAttribute('stdDeviation', G.glowBlur)
  feGauss.setAttribute('result', 'blur')
  var feMerge = document.createElementNS(svgNS, 'feMerge')
  var feMn1   = document.createElementNS(svgNS, 'feMergeNode')
  feMn1.setAttribute('in', 'blur')
  var feMn2   = document.createElementNS(svgNS, 'feMergeNode')
  feMn2.setAttribute('in', 'SourceGraphic')
  feMerge.appendChild(feMn1); feMerge.appendChild(feMn2)
  filter.appendChild(feGauss); filter.appendChild(feMerge)
  defs.appendChild(filter)

  svg.appendChild(defs)

  /* the path */
  var path = document.createElementNS(svgNS, 'path')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'url(#spline-grad)')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('filter', 'url(#spline-glow)')
  svg.appendChild(path)

  wrapper.appendChild(svg)
  document.body.appendChild(wrapper)

  /* ── bezier point generators per design ───────────────────── */
  function segmentPoints(design, cx, y0, y1, vw, flip) {
    /*
     * Returns an array of {x,y} waypoints spanning y0→y1.
     * cx   = horizontal centre (px)
     * flip = alternate oscillation side
     */
    var amp  = vw * G.xAmplitude
    var hmid = (y0 + y1) / 2
    var d    = design || G.design

    switch (d) {
      case 'zig':
        return [
          { x: cx + (flip ? -amp : amp) * 0.9, y: y0 + (y1 - y0) * 0.25 },
          { x: cx + (flip ?  amp : -amp) * 0.9, y: y0 + (y1 - y0) * 0.75 }
        ]

      case 'curl':
        return [
          { x: cx + (flip ? -amp : amp),  y: y0 + (y1 - y0) * 0.2  },
          { x: cx + (flip ?  amp * 0.3 : -amp * 0.3), y: hmid },
          { x: cx + (flip ? -amp : amp),  y: y0 + (y1 - y0) * 0.8  }
        ]

      case 'center':
        return [
          { x: cx, y: hmid }
        ]

      case 'wave':
      default:
        return [
          { x: cx + (flip ? -amp : amp) * 0.85, y: hmid }
        ]
    }
  }

  /* ── build the full path d and gradient stops ─────────────── */
  var scrollTriggerInstance = null
  var proxyObj = { progress: 0 }

  function buildPath() {
    var vw    = window.innerWidth
    var cx    = vw / 2
    var total = document.body.scrollHeight

    /* resolve section anchors */
    var anchors = []
    var sections = CFG.sections || []

    /* always start at top */
    anchors.push({ y: 0, x: cx, colors: sections[0] ? sections[0].colors : ['#fff','#fff'] })

    sections.forEach(function (sec, i) {
      var el = document.getElementById(sec.id)
      if (!el) return
      var rect = el.getBoundingClientRect()
      var top  = rect.top  + window.scrollY
      var bot  = rect.bottom + window.scrollY
      anchors.push({
        y      : top,
        x      : cx,
        colors : sec.colors,
        design : sec.design,
        sw     : sec.strokeWidth
      })
      anchors.push({
        y      : bot,
        x      : cx,
        colors : sec.colors,
        design : sec.design,
        sw     : sec.strokeWidth
      })
    })

    /* always end at bottom */
    var lastSec = sections[sections.length - 1]
    anchors.push({
      y: total,
      x: cx,
      colors: lastSec ? lastSec.colors : ['#fff','#fff']
    })

    /* sort by y */
    anchors.sort(function (a, b) { return a.y - b.y })

    /* ── build SVG path as smooth bezier through anchor Ys ── */
    var pts = anchors
    var d   = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1)

    for (var i = 0; i < pts.length - 1; i++) {
      var p0   = pts[Math.max(i - 1, 0)]
      var p1   = pts[i]
      var p2   = pts[i + 1]
      var p3   = pts[Math.min(i + 2, pts.length - 1)]
      var flip = i % 2 === 0

      /* interior waypoints for the current design segment */
      var sec    = CFG.sections ? CFG.sections[Math.floor(i / 2)] || {} : {}
      var design = sec.design || G.design
      var inner  = segmentPoints(design, cx, p1.y, p2.y, vw, flip)

      /* smooth cubic using catmull-rom tangents */
      var tension = 0.42
      var cp1x = p1.x + (p2.x - p0.x) * tension
      var cp1y = p1.y + (p2.y - p0.y) * tension
      var cp2x = p2.x - (p3.x - p1.x) * tension
      var cp2y = p2.y - (p3.y - p1.y) * tension

      if (inner.length === 0) {
        d += ' C ' + cp1x.toFixed(1) + ' ' + cp1y.toFixed(1) + ', '
                   + cp2x.toFixed(1) + ' ' + cp2y.toFixed(1) + ', '
                   + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1)
      } else {
        /* route through the inner waypoints */
        var all = [p1].concat(inner).concat([p2])
        for (var j = 0; j < all.length - 1; j++) {
          var a  = all[j]
          var b  = all[j + 1]
          var midX = (a.x + b.x) / 2
          d += ' C ' + (a.x + (midX - a.x) * 0.6).toFixed(1) + ' ' + a.y.toFixed(1) + ', '
                     + (b.x - (b.x - midX) * 0.6).toFixed(1) + ' ' + b.y.toFixed(1) + ', '
                     + b.x.toFixed(1)  + ' ' + b.y.toFixed(1)
        }
      }
    }

    path.setAttribute('d', d)
    path.setAttribute('stroke-width', G.strokeWidth)

    /* ── build gradient stops (vertical, full page height) ── */
    grad.setAttribute('x1', cx)
    grad.setAttribute('y1', 0)
    grad.setAttribute('x2', cx)
    grad.setAttribute('y2', total)

    /* clear old stops */
    while (grad.firstChild) grad.removeChild(grad.firstChild)

    /* collect all gradient stop positions */
    var stops = []
    anchors.forEach(function (a) {
      var colors = a.colors || ['#ffffff', '#ffffff']
      if (!Array.isArray(colors)) colors = [colors]
      var offset = total > 0 ? a.y / total : 0
      stops.push({ offset: offset, colors: colors })
    })

    /* turn stops into actual SVG stop elements */
    stops.forEach(function (s, si) {
      var colors = s.colors
      colors.forEach(function (c, ci) {
        var el = document.createElementNS(svgNS, 'stop')
        /* spread colors evenly within each anchor's band */
        var band   = 1 / Math.max(stops.length - 1, 1)
        var inner  = colors.length > 1 ? (ci / (colors.length - 1)) * band * 0.98 : 0
        var offset = Math.min(1, s.offset + inner)
        el.setAttribute('offset', offset.toFixed(4))
        el.setAttribute('stop-color', c)
        grad.appendChild(el)
      })
    })

    /* ── set dasharray / dashoffset for scroll drawing ── */
    var len = path.getTotalLength()
    path.style.strokeDasharray  = len
    path.style.strokeDashoffset = len

    /* resize svg canvas */
    svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + total)
    svg.setAttribute('width',  vw)
    svg.setAttribute('height', total)

    return len
  }

  /* ── GSAP scroll animation ─────────────────────────────────── */
  function attachScroll(totalLen) {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
      scrollTriggerInstance = null
    }

    proxyObj.progress = 0

    scrollTriggerInstance = ScrollTrigger.create({
      trigger : document.documentElement,
      start   : 'top top',
      end     : 'bottom bottom',
      scrub   : G.scrubSpeed,
      onUpdate: function (self) {
        var offset = totalLen * (1 - self.progress)
        path.style.strokeDashoffset = offset
      }
    })
  }

  /* ── init ─────────────────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[spline-path] GSAP + ScrollTrigger required.')
      return
    }
    gsap.registerPlugin(ScrollTrigger)

    var len = buildPath()
    attachScroll(len)
  }

  /* ── rebuild on resize (debounced) ────────────────────────── */
  var resizeTimer
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(function () {
      var len = buildPath()
      attachScroll(len)
    }, 180)
  })

  /* boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()