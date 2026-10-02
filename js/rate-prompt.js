/* Invitación no invasiva a calificar la app en Google My Business. Compartido por todas las apps del sitio. */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'orp_rate_prompt_v1';
    var REVIEW_URL = 'https://g.page/r/CWbtrBOdyGoaEBM/review';
    var SNOOZE_DAYS = 30;

    function getState() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
    }

    function setState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* noop */ }
    }

    function shouldShow() {
        var state = getState();
        if (state.rated) return false;
        if (state.dismissedAt && (Date.now() - state.dismissedAt) / 86400000 < SNOOZE_DAYS) return false;
        return true;
    }

    function injectStyles() {
        if (document.getElementById('orp-rate-styles')) return;
        var style = document.createElement('style');
        style.id = 'orp-rate-styles';
        style.textContent =
            '.orp-rate-banner{position:fixed;left:50%;bottom:16px;transform:translateX(-50%) translateY(140%);' +
            'max-width:400px;width:calc(100% - 32px);background:#ffffff;color:#0f172a;border-radius:14px;' +
            'box-shadow:0 10px 30px rgba(0,0,0,0.22);padding:14px 40px 14px 16px;display:flex;align-items:flex-start;' +
            'gap:10px;z-index:2000;transition:transform .35s ease;border:1px solid #e2e8f0;font-family:inherit;}' +
            '.orp-rate-banner.show{transform:translateX(-50%) translateY(0);}' +
            '.orp-rate-banner__icon{font-size:1.3rem;line-height:1;flex-shrink:0;}' +
            '.orp-rate-banner__text{flex:1;font-size:.82rem;line-height:1.35;color:#334155;}' +
            '.orp-rate-banner__text strong{display:block;font-size:.88rem;margin-bottom:2px;color:#0f172a;}' +
            '.orp-rate-banner__actions{display:flex;flex-direction:column;gap:6px;flex-shrink:0;margin-left:4px;}' +
            '.orp-rate-banner__btn{border:none;border-radius:999px;padding:6px 12px;font-size:.76rem;font-weight:700;' +
            'cursor:pointer;white-space:nowrap;text-decoration:none;text-align:center;display:block;}' +
            '.orp-rate-banner__btn--primary{background:#f59e0b;color:#1e293b;}' +
            '.orp-rate-banner__btn--ghost{background:transparent;color:#64748b;}' +
            '.orp-rate-banner__close{position:absolute;top:6px;right:8px;background:none;border:none;color:#94a3b8;' +
            'font-size:1rem;cursor:pointer;padding:4px;line-height:1;}';
        document.head.appendChild(style);
    }

    function buildBanner() {
        var el = document.createElement('div');
        el.className = 'orp-rate-banner';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Calificar esta app en Google');
        el.style.position = 'fixed';
        el.innerHTML =
            '<button type="button" class="orp-rate-banner__close" aria-label="Cerrar">&times;</button>' +
            '<span class="orp-rate-banner__icon" aria-hidden="true">⭐</span>' +
            '<span class="orp-rate-banner__text"><strong>¿Te sirvió esta app gratuita?</strong>Tu calificación en Google nos ayuda a seguir mejorándola.</span>' +
            '<span class="orp-rate-banner__actions">' +
            '<a class="orp-rate-banner__btn orp-rate-banner__btn--primary" href="' + REVIEW_URL + '" target="_blank" rel="noopener noreferrer">Calificar</a>' +
            '<button type="button" class="orp-rate-banner__btn orp-rate-banner__btn--ghost">Ahora no</button>' +
            '</span>';
        return el;
    }

    function show() {
        if (shownThisPageView || document.querySelector('.orp-rate-banner')) return;
        shownThisPageView = true;
        injectStyles();
        var el = buildBanner();
        document.body.appendChild(el);
        requestAnimationFrame(function () { el.classList.add('show'); });

        function dismiss(rated) {
            var state = getState();
            if (rated) state.rated = true; else state.dismissedAt = Date.now();
            setState(state);
            el.classList.remove('show');
            setTimeout(function () { el.remove(); }, 400);
        }

        el.querySelector('.orp-rate-banner__close').addEventListener('click', function () { dismiss(false); });
        el.querySelector('.orp-rate-banner__btn--ghost').addEventListener('click', function () { dismiss(false); });
        el.querySelector('.orp-rate-banner__btn--primary').addEventListener('click', function () { dismiss(true); });
    }

    var shownThisPageView = false;
    var pendingTimer = null;

    function autoShowOnEngagement(opts) {
        opts = opts || {};
        var minTime = opts.minTime || 60000;
        var minScrollPct = opts.minScrollPct || 50;
        var exitIntentMinTime = opts.exitIntentMinTime || 30000;

        if (shownThisPageView || !shouldShow()) return;

        var startTime = Date.now();
        var scrollReached = false;
        var triggered = false;
        var intervalId = null;

        function scrollPercent() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        }

        function cleanup() {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('mouseleave', onExitIntent);
            clearInterval(intervalId);
        }

        function tryTrigger() {
            if (triggered) return;
            if (Date.now() - startTime >= minTime && scrollReached) {
                triggered = true;
                cleanup();
                show();
            }
        }

        function onScroll() {
            if (scrollPercent() >= minScrollPct) scrollReached = true;
            tryTrigger();
        }

        function onExitIntent(e) {
            if (triggered) return;
            if (e.clientY <= 0 && Date.now() - startTime >= exitIntentMinTime) {
                triggered = true;
                cleanup();
                show();
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('mouseleave', onExitIntent);
        intervalId = setInterval(tryTrigger, 5000);
    }

    global.ORPRatePrompt = {
        maybeShow: function (delay) {
            if (shownThisPageView || pendingTimer !== null) return;
            if (!shouldShow()) return;
            pendingTimer = setTimeout(function () {
                pendingTimer = null;
                show();
            }, delay || 0);
        },
        autoShowOnEngagement: autoShowOnEngagement
    };
})(window);
