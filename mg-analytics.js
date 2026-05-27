/* ================================================
 * MG Analytics v1.2 - eventos custom GA4 + Clarity
 * Frank · MediaGrowth · NÃO EDITAR SEM AVISAR
 * ================================================ */
(function() {
  'use strict';

  if (typeof gtag === 'undefined') {
    console.warn('[mg-analytics] gtag não disponível - GA4 não carregou.');
    return;
  }

  function track(eventName, params) {
    try {
      gtag('event', eventName, params || {});
      if (typeof clarity === 'function') {
        clarity('event', eventName);
        if (params && params.label) clarity('set', eventName, String(params.label));
      }
    } catch (e) {
      console.warn('[mg-analytics]', e);
    }
  }

  const scrollMarks = [25, 50, 75, 100];
  const scrollFired = new Set();
  function onScroll() {
    const h = document.documentElement;
    const maxScroll = h.scrollHeight - window.innerHeight;
    const scrolled = maxScroll <= 0 ? 100 : (h.scrollTop / maxScroll) * 100;
    scrollMarks.forEach(function(mark) {
      if (scrolled >= mark && !scrollFired.has(mark)) {
        scrollFired.add(mark);
        track('scroll_depth', { percent: mark, label: mark + '%' });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);

  document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-track], .cta, .btn-cta, button[type="submit"]');
    if (!el) return;
    const name = el.dataset.track || el.textContent.trim().slice(0, 50) || 'cta_sem_nome';
    track('cta_click', {
      label: name,
      cta_text: el.textContent.trim().slice(0, 100),
      cta_href: el.href || null,
      cta_id: el.id || null
    });
  });

  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    const formName = form.id || form.name || form.dataset.formName || 'form_sem_nome';
    track('form_submit', {
      label: formName,
      form_id: form.id || null,
      form_action: form.action || null,
      page_url: window.location.href
    });
    if (typeof clarity === 'function') clarity('set', 'converted', 'true');
  });

  document.addEventListener('click', function(e) {
    const a = e.target.closest('a[href]');
    if (!a || !a.href) return;
    try {
      const url = new URL(a.href, window.location.href);
      if (url.host && url.host !== window.location.host) {
        track('outbound_click', {
          label: url.host,
          outbound_url: a.href,
          link_text: a.textContent.trim().slice(0, 80)
        });
      }
    } catch (_) {}
  });

  let engagedSec = 0;
  let lastTick = Date.now();
  let isVisible = document.visibilityState === 'visible';
  document.addEventListener('visibilitychange', function() {
    isVisible = document.visibilityState === 'visible';
    lastTick = Date.now();
  });
  setInterval(function() {
    const now = Date.now();
    if (isVisible) engagedSec += Math.round((now - lastTick) / 1000);
    lastTick = now;
    if (engagedSec >= 30) {
      track('engagement_30s', { label: '30s_active' });
      engagedSec = 0;
    }
  }, 5000);

  (function() {
    const params = new URLSearchParams(window.location.search);
    track('page_view_mg', {
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || '(direct)',
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_content: params.get('utm_content') || null
    });
  })();

  window.addEventListener('hashchange', function() {
    track('hash_change', {
      label: window.location.hash || '(removed)',
      new_url: window.location.href
    });
  });

  console.log('✅ mg-analytics v1.2 ativo');
})();
