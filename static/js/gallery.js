/* gallery.js — GLightbox init (with EXIF/caption description), tag-bar filter,
   and the 3D tilt hover on thumbnail cards. No external deps beyond GLightbox
   (loaded via extend_head.html on gallery pages). */

(function () {
    'use strict';

    // i18n strings injected by the layout via data-* attributes on #gallery-i18n.
    var i18nEl = document.getElementById('gallery-i18n');
    var i18n = i18nEl ? i18nEl.dataset : {};

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    var EXIF_FIELDS = [
        ['camera', 'exifCamera'],
        ['lens', 'exifLens'],
        ['aperture', 'exifAperture'],
        ['shutter', 'exifShutter'],
        ['iso', 'exifIso'],
        ['focal', 'exifFocal']
    ];

    // Build the lightbox description HTML (caption + date/album meta + EXIF).
    function buildDescription(d) {
        var parts = ['<div class="gl-desc">'];
        if (d.caption) {
            parts.push('<p class="gl-cap">' + escapeHtml(d.caption) + '</p>');
        }
        var meta = [];
        if (d.date) {
            meta.push('<span class="gl-chip">' + escapeHtml(String(d.date).slice(0, 10)) + '</span>');
        }
        if (d.album) {
            meta.push(
                '<span class="gl-chip">' +
                '<span class="gl-chip-k">' + escapeHtml(i18n.album || 'Album') + '</span>' +
                escapeHtml(d.album) +
                '</span>'
            );
        }
        if (meta.length) parts.push('<div class="gl-meta">' + meta.join('') + '</div>');
        var exif = null;
        if (d.exif && d.exif.trim()) {
            try { exif = JSON.parse(d.exif); } catch (e) { exif = null; }
        }
        if (exif) {
            var items = EXIF_FIELDS.map(function (f) {
                var key = f[0], labelKey = f[1];
                if (!exif[key]) return '';
                return (
                    '<div class="gl-exif-cell">' +
                    '<span class="gl-exif-k">' + escapeHtml(i18n[labelKey] || labelKey) + '</span>' +
                    '<span class="gl-exif-v">' + escapeHtml(exif[key]) + '</span>' +
                    '</div>'
                );
            }).join('');
            if (items) parts.push('<div class="gl-exif">' + items + '</div>');
        }
        parts.push('</div>');
        return parts.join('');
    }

    // Lightbox fit box: 100vw × 90vh. Display size is not "fill the box";
    // show a ladder rung at CSS = natural / (dprUsed × k). For non-integer
    // devicePixelRatio, try raw / floor / ceil / round and keep the sharpest.
    function parseVariants(raw) {
        if (!raw) return [];
        try {
            var v = JSON.parse(raw);
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function lightboxViewport() {
        var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
        var vh = (window.innerHeight || document.documentElement.clientHeight || 800) * 0.9;
        return { vw: vw, vh: vh };
    }

    function dprCandidates(actual) {
        actual = actual > 0 ? actual : 1;
        var list = [actual];
        if (Math.abs(actual - Math.round(actual)) > 1e-6) {
            list.push(Math.floor(actual), Math.ceil(actual), Math.round(actual));
        }
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            if (!(d > 0)) continue;
            // Integer stand-ins stay in the 1–3 ladder band; raw actual is kept as-is.
            if (d !== actual) d = Math.min(Math.max(d, 1), 3);
            var seen = false;
            for (var j = 0; j < out.length; j++) {
                if (Math.abs(out[j] - d) < 1e-6) { seen = true; break; }
            }
            if (!seen) out.push(d);
        }
        return out;
    }

    // Lower is sharper: 0 = exact integer image-pixels-per-device-pixel.
    function alignmentError(plan, actualDpr) {
        var deviceW = plan.cssW * actualDpr;
        if (deviceW <= 0) return 99;
        var samples = plan.w / deviceW;
        return Math.abs(samples - Math.round(samples));
    }

    function isUpscaled(plan, actualDpr) {
        return plan.cssW * actualDpr > plan.w + 0.5 || plan.cssH * actualDpr > plan.h + 0.5;
    }

    function isBetterPlan(next, prev, actualDpr) {
        if (!prev) return true;
        var upN = isUpscaled(next, actualDpr);
        var upP = isUpscaled(prev, actualDpr);
        if (upN !== upP) return !upN; // never prefer an upscaled plan
        var errN = alignmentError(next, actualDpr);
        var errP = alignmentError(prev, actualDpr);
        if (Math.abs(errN - errP) > 0.02) return errN < errP;
        if (Math.abs(next.score - prev.score) > 0.25) return next.score > prev.score;
        if (next.k !== prev.k) return next.k < prev.k;
        return next.w * next.h < prev.w * prev.h;
    }

    function pickLightboxPlan(variants) {
        if (!variants || !variants.length) return null;
        var box = lightboxViewport();
        var actualDpr = window.devicePixelRatio || 1;
        var candidates = dprCandidates(actualDpr);
        var best = null;

        for (var c = 0; c < candidates.length; c++) {
            var dprUsed = candidates[c];
            for (var k = 1; k <= 8; k++) {
                for (var i = 0; i < variants.length; i++) {
                    var v = variants[i];
                    var w = +v.w;
                    var h = +v.h;
                    if (!w || !h || !v.src) continue;
                    var cssW = w / (dprUsed * k);
                    var cssH = h / (dprUsed * k);
                    if (cssW > box.vw + 0.01 || cssH > box.vh + 0.01) continue;
                    var plan = {
                        src: v.src,
                        cssW: cssW,
                        cssH: cssH,
                        k: k,
                        dpr: dprUsed,
                        w: w,
                        h: h,
                        score: cssW * cssH
                    };
                    if (isBetterPlan(plan, best, actualDpr)) best = plan;
                }
            }
        }
        if (best) return best;

        // Nothing fits — largest rung, prefer a non-upscaling integer-ish scale.
        var largest = variants[0];
        for (var j = 1; j < variants.length; j++) {
            if ((+variants[j].w * +variants[j].h) > (+largest.w * +largest.h)) {
                largest = variants[j];
            }
        }
        var lw = +largest.w;
        var lh = +largest.h;
        var fit = Math.min(box.vw / lw, box.vh / lh, 1);
        var fallback = null;
        for (var fc = 0; fc < candidates.length; fc++) {
            var fd = candidates[fc];
            var kFall = Math.max(1, Math.ceil(1 / (fit * fd) - 1e-6));
            var fp = {
                src: largest.src,
                cssW: lw / (fd * kFall),
                cssH: lh / (fd * kFall),
                k: kFall,
                dpr: fd,
                w: lw,
                h: lh,
                score: 0
            };
            if (isBetterPlan(fp, fallback, actualDpr)) fallback = fp;
        }
        return fallback;
    }

    function applyLightboxPlan(img, plan) {
        if (!img || !plan || !plan.cssW || !plan.cssH) return;
        // Important: set width/height after any GLightbox resize() which does
        // img.setAttribute('style', 'max-height: …') and wipes pinned size.
        img.style.width = plan.cssW + 'px';
        img.style.height = plan.cssH + 'px';
        img.style.maxWidth = '100vw';
        img.style.maxHeight = '90vh';
        img._galleryPan = { x: 0, y: 0 };
        img._galleryZoomMode = '';
        img.style.transform = '';
        img.style.transformOrigin = 'center center';
    }

    function planFromConfig(cfg) {
        if (!cfg || !cfg.cssW || !cfg.cssH) return null;
        return { cssW: cfg.cssW, cssH: cfg.cssH };
    }

    function slideMainImage(slideNode) {
        if (!slideNode) return null;
        var media = slideNode.querySelector('.gslide-media');
        if (!media) return null;
        return media.querySelector('img.gl-full') || media.querySelector('img:not(.gl-lqip)');
    }

    function zoomTargetSize(img) {
        var box = lightboxViewport();
        var nw = img.naturalWidth;
        var nh = img.naturalHeight;
        if (!nw || !nh) return null;
        var scale = Math.min(box.vw / nw, box.vh / nh, 1);
        return { cssW: nw * scale, cssH: nh * scale };
    }

    function applyZoomTransform(img) {
        var pan = img._galleryPan || { x: 0, y: 0 };
        var t = 'translate3d(' + pan.x + 'px,' + pan.y + 'px,0)';
        if (img._galleryZoomMode === 'scale') t += ' scale(2)';
        img.style.transform = t;
        img.style.transformOrigin = 'center center';
    }

    function resetSlideZoom(slideNode) {
        if (!slideNode) return;
        slideNode.classList.remove('zoomed');
        var img = slideMainImage(slideNode);
        if (img) {
            img._galleryPan = { x: 0, y: 0 };
            img._galleryZoomMode = '';
            img.style.transform = '';
            img.style.cursor = 'zoom-in';
        }
        var media = slideNode.querySelector('.gslide-media');
        if (media) media.style.transform = '';
    }

    // Own zoom + pan (GLightbox zoomable/draggable stay off — they fight pinned size).
    function bindGalleryZoom(img, slideNode, plan) {
        if (!img || !plan) return;
        img._galleryPlan = plan;
        if (img._galleryZoomBound) return;
        img._galleryZoomBound = true;
        img.classList.add('zoomable');
        img.style.cursor = 'zoom-in';
        img._galleryPan = { x: 0, y: 0 };
        img._galleryZoomMode = '';

        var drag = null; // { pointerId, startX, startY, origX, origY, moved }

        function zoomOut() {
            var p = img._galleryPlan;
            if (p) applyLightboxPlan(img, p);
            else {
                img._galleryPan = { x: 0, y: 0 };
                img._galleryZoomMode = '';
                img.style.transform = '';
            }
            img.style.cursor = 'zoom-in';
            slideNode.classList.remove('zoomed');
        }

        function zoomIn() {
            var p = img._galleryPlan;
            if (!p) return;
            img._galleryPan = { x: 0, y: 0 };
            var z = zoomTargetSize(img);
            if (z && (z.cssW > p.cssW + 1 || z.cssH > p.cssH + 1)) {
                img._galleryZoomMode = 'size';
                img.style.width = z.cssW + 'px';
                img.style.height = z.cssH + 'px';
                img.style.maxWidth = '100vw';
                img.style.maxHeight = '90vh';
                applyZoomTransform(img);
            } else {
                // Already at/near native fit (e.g. 1× DPR): allow a 2× inspect zoom.
                img._galleryZoomMode = 'scale';
                applyZoomTransform(img);
            }
            img.style.cursor = 'grab';
            slideNode.classList.add('zoomed');
        }

        img.addEventListener('pointerdown', function (e) {
            if (!slideNode.classList.contains('zoomed')) return;
            if (e.button != null && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            var pan = img._galleryPan || { x: 0, y: 0 };
            drag = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origX: pan.x,
                origY: pan.y,
                moved: false
            };
            img.setPointerCapture(e.pointerId);
            img.classList.add('is-dragging');
            img.style.cursor = 'grabbing';
        });

        img.addEventListener('pointermove', function (e) {
            if (!drag || drag.pointerId !== e.pointerId) return;
            e.preventDefault();
            var dx = e.clientX - drag.startX;
            var dy = e.clientY - drag.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
            img._galleryPan = { x: drag.origX + dx, y: drag.origY + dy };
            applyZoomTransform(img);
        });

        function endDrag(e) {
            if (!drag || (e && drag.pointerId !== e.pointerId)) return;
            var moved = drag.moved;
            drag = null;
            img.classList.remove('is-dragging');
            if (slideNode.classList.contains('zoomed')) {
                img.style.cursor = 'grab';
                // Suppress the click that follows a drag so we don't zoom out.
                if (moved) img._gallerySkipClick = true;
            }
        }

        img.addEventListener('pointerup', endDrag);
        img.addEventListener('pointercancel', endDrag);

        img.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (img._gallerySkipClick) {
                img._gallerySkipClick = false;
                return;
            }
            if (slideNode.classList.contains('zoomed')) zoomOut();
            else zoomIn();
        }, true);
    }

    function presentSlide(slideNode, cfg) {
        if (!slideNode) return false;
        var media = slideNode.querySelector('.gslide-media');
        var img = slideMainImage(slideNode);
        if (!img) return false;
        var plan = planFromConfig(cfg);
        resetSlideZoom(slideNode);
        if (plan) {
            img._galleryPlan = plan;
            applyLightboxPlan(img, plan);
            var ph = media && media.querySelector('img.gl-lqip');
            if (ph) applyLightboxPlan(ph, plan);
            bindGalleryZoom(img, slideNode, plan);
            // Re-pin after GLightbox's delayed resize(~100ms) which wipes styles.
            var token = (img._galleryPinToken || 0) + 1;
            img._galleryPinToken = token;
            [0, 50, 120, 250].forEach(function (ms) {
                setTimeout(function () {
                    if (img._galleryPinToken !== token) return;
                    if (slideNode.classList.contains('zoomed')) return;
                    var p = img._galleryPlan;
                    if (!p) return;
                    applyLightboxPlan(img, p);
                    var ph2 = media && media.querySelector('img.gl-lqip');
                    if (ph2) applyLightboxPlan(ph2, p);
                }, ms);
            });
        }
        if (!(img.complete && img.naturalWidth > 0)) {
            img.addEventListener('load', function () {
                var p = img._galleryPlan;
                if (!p || slideNode.classList.contains('zoomed')) return;
                applyLightboxPlan(img, p);
                var ph3 = media && media.querySelector('img.gl-lqip');
                if (ph3) applyLightboxPlan(ph3, p);
            }, { once: true });
        }
        return true;
    }

    function schedulePresent(slideNode, cfg) {
        if (!slideNode || !cfg) return;
        var attempts = 0;
        var tick = function () {
            if (presentSlide(slideNode, cfg)) return;
            if (++attempts < 90) requestAnimationFrame(tick);
        };
        tick();
    }

    function applyPlanToElement(el, plan, fallbackHref) {
        if (!plan) {
            el.href = fallbackHref || el.href;
            el.cssW = 0;
            el.cssH = 0;
            return;
        }
        el.href = plan.src;
        el.cssW = plan.cssW;
        el.cssH = plan.cssH;
        el.planK = plan.k;
        el.planDpr = plan.dpr;
    }

    // Keep GLightbox's copied slideConfig in sync (extend() clones at init).
    function syncPlanToSlideConfig(lb, index, el) {
        if (!lb || !lb.elements || !lb.elements[index] || !el) return;
        var sc = lb.elements[index].slideConfig;
        if (!sc) return;
        sc.href = el.href;
        sc.cssW = el.cssW;
        sc.cssH = el.cssH;
        sc.thumb = el.thumb;
        sc.blur = el.blur;
    }

    function currentSlideNode(lb) {
        if (lb && lb.activeSlide) return lb.activeSlide;
        return document.querySelector('.glightbox-container .gslide.current');
    }

    // ---- Lightbox progressive load: show cached thumb/LQIP, fade in large ----
    function enhanceLightboxSlide(data, elements) {
        var slideNode = data.slideNode;
        var idx = typeof data.index === 'number' ? data.index : data.slideIndex;
        var cfg = (elements && elements[idx]) || data.slideConfig || {};
        if (!slideNode) return;

        var attempts = 0;
        var tryEnhance = function () {
            var media = slideNode.querySelector('.gslide-media');
            if (!media) {
                if (++attempts < 90) requestAnimationFrame(tryEnhance);
                return;
            }
            var img = media.querySelector('img.gl-full') || media.querySelector('img:not(.gl-lqip)');
            if (!img) {
                if (++attempts < 90) requestAnimationFrame(tryEnhance);
                return;
            }

            if (slideNode.getAttribute('data-gl-progressive') === '1') {
                schedulePresent(slideNode, cfg);
                return;
            }
            slideNode.setAttribute('data-gl-progressive', '1');

            var placeholderSrc = cfg.thumb || cfg.blur || '';
            if (!placeholderSrc || (img.complete && img.naturalWidth > 0)) {
                media.classList.add('is-loaded');
                schedulePresent(slideNode, cfg);
                return;
            }

            media.classList.add('gl-progressive');
            var ph = document.createElement('img');
            ph.className = 'gl-lqip';
            ph.src = placeholderSrc;
            ph.alt = '';
            ph.setAttribute('aria-hidden', 'true');
            img.parentNode.insertBefore(ph, img);
            img.classList.add('gl-full');
            schedulePresent(slideNode, cfg);

            var reveal = function () {
                media.classList.add('is-loaded');
                schedulePresent(slideNode, cfg);
            };
            if (img.complete && img.naturalWidth > 0) {
                reveal();
            } else {
                img.addEventListener('load', reveal, { once: true });
                img.addEventListener('error', reveal, { once: true });
            }
        };
        tryEnhance();
    }

    // ---- GLightbox: one instance per data-gallery group ----
    function initLightbox() {
        if (typeof window.GLightbox === 'undefined') return;
        var photos = Array.prototype.slice.call(document.querySelectorAll('.photo'));
        if (!photos.length) return;
        var groups = {};
        photos.forEach(function (p) {
            var g = p.getAttribute('data-gallery') || 'default';
            (groups[g] = groups[g] || []).push(p);
        });
        Object.keys(groups).forEach(function (g) {
            var arr = groups[g];
            var elements = arr.map(function (p) {
                var variants = parseVariants(p.getAttribute('data-variants'));
                var el = {
                    href: p.getAttribute('data-src') || p.getAttribute('href'),
                    type: 'image',
                    title: p.getAttribute('data-title') || '',
                    thumb: p.getAttribute('data-thumb') || '',
                    blur: p.getAttribute('data-blur') || '',
                    variants: variants,
                    cssW: 0,
                    cssH: 0,
                    // TEMP: lightbox detail panel disabled; restore buildDescription(p.dataset)
                    description: ''
                };
                applyPlanToElement(el, pickLightboxPlan(variants), el.href);
                return el;
            });
            // Built-in zoom fights pinned size (1st open: no zoom; reopen: size lost).
            var lb = window.GLightbox({
                elements: elements,
                loop: true,
                zoomable: false,
                draggable: false
            });

            // Re-apply pin after GLightbox.resize() wipes inline width/height.
            if (typeof lb.resize === 'function') {
                var rawResize = lb.resize.bind(lb);
                lb.resize = function () {
                    var slide = arguments.length ? arguments[0] : null;
                    rawResize(slide);
                    var idx = typeof lb.index === 'number' ? lb.index : 0;
                    var node = slide || currentSlideNode(lb);
                    if (node && !node.classList.contains('zoomed')) {
                        presentSlide(node, elements[idx]);
                    }
                };
            }

            lb.on('slide_before_load', function (data) {
                enhanceLightboxSlide(data, elements);
            });
            lb.on('slide_after_load', function (data) {
                enhanceLightboxSlide(data, elements);
            });
            lb.on('slide_changed', function () {
                var idx = typeof lb.index === 'number' ? lb.index : 0;
                var slides = document.querySelectorAll('.glightbox-container .gslide');
                for (var i = 0; i < slides.length; i++) {
                    if (i !== idx) resetSlideZoom(slides[i]);
                }
                schedulePresent(currentSlideNode(lb), elements[idx]);
            });
            lb.on('open', function () {
                var idx = typeof lb.index === 'number' ? lb.index : 0;
                schedulePresent(currentSlideNode(lb), elements[idx]);
            });
            arr.forEach(function (p, i) {
                p.addEventListener('click', function (e) {
                    e.preventDefault();
                    applyPlanToElement(
                        elements[i],
                        pickLightboxPlan(elements[i].variants),
                        p.getAttribute('data-src') || elements[i].href
                    );
                    syncPlanToSlideConfig(lb, i, elements[i]);
                    lb.openAt(i);
                });
            });
        });
    }


    // ---- Tag filter bar (populated client-side from photo data-tags) ----
    function makeChip(label, tag) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-tag', tag);
        b.textContent = label;
        return b;
    }

    function initTagFilter() {
        var bar = document.querySelector('.tag-bar');
        var grid = document.querySelector('.photo-grid');
        if (!bar || !grid) return;
        var photos = Array.prototype.slice.call(grid.querySelectorAll('.photo'));
        if (!photos.length) { bar.style.display = 'none'; return; }
        var tags = [];
        photos.forEach(function (p) {
            (p.getAttribute('data-tags') || '').trim().split(/\s+/).forEach(function (t) {
                if (t && tags.indexOf(t) === -1) tags.push(t);
            });
        });
        if (!tags.length) { bar.style.display = 'none'; return; }
        bar.innerHTML = '';
        var label = document.createElement('span');
        label.className = 'tag-label';
        label.textContent = i18n.filter || 'Filter';
        bar.appendChild(label);
        var allBtn = makeChip(i18n.all || 'All', '');
        allBtn.classList.add('active');
        bar.appendChild(allBtn);
        tags.sort().forEach(function (t) { bar.appendChild(makeChip(t, t)); });
        bar.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('button[data-tag]') : null;
            if (!btn) return;
            var btns = bar.querySelectorAll('button[data-tag]');
            Array.prototype.forEach.call(btns, function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var tag = btn.getAttribute('data-tag');
            photos.forEach(function (p) {
                var list = (p.getAttribute('data-tags') || '').trim().split(/\s+/);
                var has = !tag || list.indexOf(tag) !== -1;
                p.classList.toggle('is-hidden', !has);
            });
        });
    }

    // ---- Progressive image loading (blur-up crossfade) ----
    // Mark .photo-img/.photo as .loaded once the sharp image arrives so CSS
    // can crossfade it in over the blurred LQIP placeholder. Cached images
    // (complete with naturalWidth) are revealed immediately.
    function initProgressiveImages() {
        var imgs = Array.prototype.slice.call(document.querySelectorAll('.photo-img'));
        if (!imgs.length) return;
        var reveal = function (img) {
            img.classList.add('loaded');
            var photo = img.closest('.photo');
            if (photo) photo.classList.add('loaded');
        };
        imgs.forEach(function (img) {
            if (img.complete && img.naturalWidth > 0) {
                reveal(img);
            } else {
                img.addEventListener('load', function () { reveal(img); }, { once: true });
                // On error, leave the blur placeholder in place (no reveal).
            }
        });
    }

    // ---- 3D tilt hover (pure JS + CSS, no library) ----
    function initTilt() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var MAX = 14; // max degrees
        var photos = Array.prototype.slice.call(document.querySelectorAll('.photo'));
        photos.forEach(function (photo) {
            var card = photo.querySelector('.photo-card');
            if (!card) return;
            photo.addEventListener('pointermove', function (e) {
                var r = photo.getBoundingClientRect();
                if (!r.width || !r.height) return;
                var x = (e.clientX - r.left) / r.width;   // 0..1
                var y = (e.clientY - r.top) / r.height;    // 0..1
                // Cursor side comes toward the viewer (feels "higher").
                var ry = -(x - 0.5) * 2 * MAX;  // rotateY
                var rx = (y - 0.5) * 2 * MAX;   // rotateX
                card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
                card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
            });
            photo.addEventListener('pointerleave', function () {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    // ---- View toggle (albums grid <-> all photos) on the gallery index ----
    function initViewToggle() {
        var toggle = document.querySelector('.gallery-view-toggle');
        if (!toggle) return;
        var views = Array.prototype.slice.call(document.querySelectorAll('.gallery-view'));
        var buttons = Array.prototype.slice.call(toggle.querySelectorAll('.view-btn'));
        if (!views.length || !buttons.length) return;
        var STORAGE_KEY = 'gallery-view';
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        var initial = (saved === 'all' || saved === 'albums') ? saved : 'albums';
        var busy = false;
        var reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function syncButtons(name) {
            buttons.forEach(function (b) {
                var on = b.getAttribute('data-view') === name;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }

        function showInstant(name) {
            views.forEach(function (v) {
                var on = v.getAttribute('data-view') === name;
                v.classList.remove('is-exit', 'is-enter', 'is-enter-active');
                v.classList.toggle('is-active', on);
                v.setAttribute('aria-hidden', on ? 'false' : 'true');
            });
            syncButtons(name);
            busy = false;
        }

        function setView(name, animate) {
            var next = null;
            var prev = null;
            views.forEach(function (v) {
                if (v.getAttribute('data-view') === name) next = v;
                if (v.classList.contains('is-active') && !v.classList.contains('is-exit')) prev = v;
            });
            if (!next) return;
            if (prev === next) {
                syncButtons(name);
                return;
            }
            if (!animate || reduceMotion || !prev || busy) {
                showInstant(name);
                return;
            }

            busy = true;
            syncButtons(name);

            prev.classList.remove('is-active');
            prev.classList.add('is-exit');
            prev.setAttribute('aria-hidden', 'true');

            next.classList.add('is-active', 'is-enter');
            next.setAttribute('aria-hidden', 'false');

            var finished = false;
            var finish = function () {
                if (finished) return;
                finished = true;
                prev.classList.remove('is-exit');
                next.classList.remove('is-enter', 'is-enter-active');
                busy = false;
            };

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    next.classList.add('is-enter-active');
                });
            });

            var onEnd = function (e) {
                if (e.target !== next || e.propertyName !== 'opacity') return;
                next.removeEventListener('transitionend', onEnd);
                finish();
            };
            next.addEventListener('transitionend', onEnd);
            setTimeout(finish, 450);
        }

        buttons.forEach(function (b) {
            b.addEventListener('click', function () {
                var name = b.getAttribute('data-view');
                setView(name, true);
                try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
            });
        });
        if (initial !== 'albums') setView(initial, false);
    }

    function init() {
        initViewToggle();
        initProgressiveImages();
        initTagFilter();
        initLightbox();
        initTilt();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
