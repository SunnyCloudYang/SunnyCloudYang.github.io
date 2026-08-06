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
        var parts = [];
        if (d.caption) parts.push('<p class="gl-cap">' + escapeHtml(d.caption) + '</p>');
        var meta = [];
        if (d.date) meta.push(escapeHtml(String(d.date).slice(0, 10)));
        if (d.album) meta.push(escapeHtml(i18n.album || 'Album') + ': ' + escapeHtml(d.album));
        if (meta.length) parts.push('<div class="gl-meta">' + meta.join(' &middot; ') + '</div>');
        var exif = null;
        if (d.exif && d.exif.trim()) {
            try { exif = JSON.parse(d.exif); } catch (e) { exif = null; }
        }
        if (exif) {
            var items = EXIF_FIELDS.map(function (f) {
                var key = f[0], labelKey = f[1];
                return exif[key] ? '<span><b>' + escapeHtml(i18n[labelKey] || labelKey) + '</b>' + escapeHtml(exif[key]) + '</span>' : '';
            }).join('');
            if (items) parts.push('<div class="gl-exif">' + items + '</div>');
        }
        return parts.join('');
    }

    // ---- GLightbox: one instance per data-gallery group, with HTML descriptions ----
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
                return {
                    href: p.getAttribute('data-src') || p.getAttribute('href'),
                    type: 'image',
                    title: p.getAttribute('data-title') || '',
                    description: buildDescription(p.dataset)
                };
            });
            var lb = window.GLightbox({ elements: elements, loop: true });
            arr.forEach(function (p, i) {
                p.addEventListener('click', function (e) {
                    e.preventDefault();
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
                var ry = (x - 0.5) * 2 * MAX;   // rotateY
                var rx = -(y - 0.5) * 2 * MAX;  // rotateX (inverted so it tilts toward cursor)
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
        function setView(name) {
            views.forEach(function (v) {
                var on = v.getAttribute('data-view') === name;
                v.classList.toggle('is-active', on);
                v.setAttribute('aria-hidden', on ? 'false' : 'true');
            });
            buttons.forEach(function (b) {
                var on = b.getAttribute('data-view') === name;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }
        buttons.forEach(function (b) {
            b.addEventListener('click', function () {
                var name = b.getAttribute('data-view');
                setView(name);
                try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
            });
        });
        if (initial !== 'albums') setView(initial);
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
