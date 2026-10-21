/* IGRObeauty — общая интерактивность каталога v6: панель, меню, счётчик в карточке, полоса разделов (фильтры живут в render.js) */
(function () {
  'use strict';
  var body = document.body;

  /* ---------- панель «Фильтры» ---------- */
  /* пока панель открыта, всё под затемнением недоступно ни мыши, ни клавиатуре */
  var BACKDROP = ['.ig-topbar', '.ig-header', '.ig-mainnav', '#page', '.ig-footer'];
  function setInert(on) {
    BACKDROP.forEach(function (s) {
      var el = document.querySelector(s);
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function openDrawer(id, focusKey) {
    var d = document.getElementById(id);
    var scrim = document.querySelector('.ig-scrim');
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('is-open');
    body.style.overflow = 'hidden';
    setInert(true);
    /* фокус уходит в панель: на нужную группу, если открыли чипом «Тип продукта», иначе на кнопку закрытия */
    var group = focusKey && d.querySelector('[data-facet-group="' + focusKey + '"]');
    var target = (group && group.querySelector('.igro-accordion__trigger')) || d.querySelector('.ig-drawer__close');
    if (target) target.focus({ preventScroll: true });
    /* панель открывается прокрученной так, что заголовок нужной группы стоит первой строкой; обычное открытие — с начала */
    var pane = d.querySelector('.ig-drawer__body');
    if (pane) pane.scrollTop = group ? pane.scrollTop + group.getBoundingClientRect().top - pane.getBoundingClientRect().top : 0;
  }
  function closeAll() {
    var wasOpen = document.querySelector('.ig-drawer.is-open');
    document.querySelectorAll('.ig-drawer.is-open').forEach(function (d) {
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
    });
    var scrim = document.querySelector('.ig-scrim');
    if (scrim) scrim.classList.remove('is-open');
    body.style.overflow = '';
    setInert(false);
    /* фокус возвращается на кнопку «Фильтры» */
    if (wasOpen) {
      var back = document.querySelector('.ig-filters-btn');
      if (back) back.focus({ preventScroll: true });
    }
  }

  /* ---------- выпадающее меню каталога ---------- */
  var catalogBtn = document.querySelector('[data-toggle="mega"]');
  var megaEl = document.getElementById('mega');
  var mainnav = document.querySelector('.ig-mainnav');
  var megaByHover = false;
  function megaOpen() { return !!megaEl && megaEl.classList.contains('is-open'); }
  /* тёмная плашка выбранного раздела: переезжает к пункту; instant — без анимации (первое открытие, смена размера окна) */
  function moveMarker(cat, instant) {
    var cats = cat && cat.parentNode;
    if (!cats) return;
    if (instant) cats.classList.add('is-instant');
    cats.style.setProperty('--marker-y', cat.offsetTop + 'px');
    cats.style.setProperty('--marker-h', cat.offsetHeight + 'px');
    if (instant) requestAnimationFrame(function () { requestAnimationFrame(function () { cats.classList.remove('is-instant'); }); });
  }
  function setMega(open) {
    if (!megaEl) return;
    if (open && !megaOpen()) {
      moveMarker(megaEl.querySelector('.ig-mega__cat.is-active'), true);
    }
    megaEl.classList.toggle('is-open', open);
    megaEl.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (catalogBtn) catalogBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) megaByHover = false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;

    var openBtn = t.closest('[data-open]');
    if (openBtn) { openDrawer('drawer-' + openBtn.getAttribute('data-open'), openBtn.getAttribute('data-focus')); return; }

    /* «Показать» и «Сбросить» закрывают панель (сброс применяется сразу) */
    if (t.closest('[data-apply]')) { closeAll(); return; }
    if (t.closest('[data-close]')) { closeAll(); return; }

    /* мега-меню: клик по «Каталог» после наведения не должен закрывать только что открытое меню */
    if (t.closest('[data-toggle="mega"]') && megaEl) {
      if (megaOpen() && megaByHover) megaByHover = false;
      else setMega(!megaOpen());
      return;
    }
    if (t.closest('[data-mega-close]')) { setMega(false); if (catalogBtn) catalogBtn.focus(); return; }
    if (megaOpen() && !t.closest('#mega')) setMega(false);
    var catBtn = t.closest('.ig-mega__cat');
    if (catBtn) { showMegaPanel(catBtn); return; }

    /* «В корзину», счётчик, избранное и «Сообщить о поступлении» новой карточки — в render.js (design-lab, 21.10) */

    /* стрелки рядов (чипы групп, баннеры подкатегорий) листают целую страницу ряда */
    var arr = t.closest('[data-scroll]');
    if (arr) {
      var wrap = arr.closest('.ig-directions__wrap');
      var track = wrap && wrap.querySelector('.ig-directions__track');
      if (track) pageScroll(wrap, track, parseInt(arr.getAttribute('data-scroll') || '1', 10));
      return;
    }
  });

  /* листание ряда страницей: вперёд — первый не до конца видный справа элемент встаёт к левому краю,
     сразу за стрелкой «назад»; назад — последний не до конца видный слева элемент встаёт к правому краю,
     перед стрелкой «вперёд». Края и стрелки учитываются, дальше края ряда не листаем */
  function pageScroll(wrap, track, dir) {
    var cs = getComputedStyle(track);
    var padL = parseFloat(cs.scrollPaddingLeft) || parseFloat(cs.paddingLeft) || 0;
    var padR = parseFloat(cs.scrollPaddingRight) || parseFloat(cs.paddingRight) || 0;
    var tr = track.getBoundingClientRect();
    var GAP = 8;
    /* сколько места у края занимает стрелка (у скрытой стрелки размеры есть, у стрелок на телефоне — нет) */
    var la = wrap.querySelector('.ig-directions__arrow--left'), ra = wrap.querySelector('.ig-directions__arrow--right');
    var lr = la ? la.getBoundingClientRect() : null, rr = ra ? ra.getBoundingClientRect() : null;
    var resL = lr && lr.width ? Math.max(0, lr.right - (tr.left + padL)) + GAP : 0;
    var resR = rr && rr.width ? Math.max(0, (tr.right - padR) - rr.left) + GAP : 0;
    var x = track.scrollLeft, w = track.clientWidth, max = track.scrollWidth - w;
    var items = Array.prototype.map.call(track.children, function (el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - tr.left + x, r: r.right - tr.left + x };
    });
    var target, i;
    if (dir > 0) {
      var edgeR = x + w - padR - resR;
      var next = null;
      for (i = 0; i < items.length; i++) if (items[i].r > edgeR + 1) { next = items[i]; break; }
      target = next ? next.l - padL - resL : max;
    } else {
      var edgeL = x + padL + resL;
      var prev = null;
      for (i = items.length - 1; i >= 0; i--) if (items[i].l < edgeL - 1) { prev = items[i]; break; }
      target = prev ? prev.r - (w - padR - resR) : 0;
    }
    /* элемент шире видимой части — тогда листаем на ширину видимой части */
    if (Math.abs(target - x) < 2) target = x + dir * (w - padL - padR - resL - resR);
    track.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: 'smooth' });
  }

  function parsePrice(txt) { return parseInt((txt || '').replace(/[^0-9]/g, ''), 10) || 0; }
  function fmtPrice(n) { return n.toLocaleString('ru-RU') + '\u00a0₽'; }
  function unitPrice(card) {
    var pe = card && card.querySelector('.ig-card__price');
    return pe ? parseInt(pe.getAttribute('data-unit') || '', 10) || parsePrice(pe.textContent) : 0;
  }
  function updatePrice(card, qty) {
    var pe = card && card.querySelector('.ig-card__price');
    if (!pe || !/\d/.test(pe.textContent)) return;
    var unit = parseInt(pe.getAttribute('data-unit') || '', 10);
    if (!unit) { unit = parsePrice(pe.textContent); pe.setAttribute('data-unit', unit); }
    pe.textContent = fmtPrice(unit * qty);
  }

  function showMegaPanel(catBtn) {
    if (!megaEl || catBtn.classList.contains('is-active')) return;
    megaEl.querySelectorAll('.ig-mega__cat').forEach(function (c) { c.classList.remove('is-active'); });
    catBtn.classList.add('is-active');
    moveMarker(catBtn, false);
    var key = catBtn.getAttribute('data-cat');
    megaEl.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
  }
  window.addEventListener('resize', function () {
    if (megaEl) moveMarker(megaEl.querySelector('.ig-mega__cat.is-active'), true);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll();
      if (megaOpen()) { setMega(false); if (catalogBtn) catalogBtn.focus(); }
    }
  });

  /* каталог и табы мега-меню раскрываются по наведению */
  if (catalogBtn && megaEl && mainnav) {
    catalogBtn.addEventListener('mouseenter', function () {
      if (!megaOpen()) { setMega(true); megaByHover = true; }
    });
    mainnav.addEventListener('mouseleave', function () { setMega(false); });
    mainnav.querySelectorAll('.ig-navlink').forEach(function (link) {
      if (link === catalogBtn) return;
      link.addEventListener('mouseenter', function () { setMega(false); });
    });
    megaEl.querySelectorAll('.ig-mega__cat').forEach(function (cat) {
      cat.addEventListener('mouseenter', function () { showMegaPanel(cat); });
    });
  }

  /* значения быстрых фильтров начинаются по левому краю первого чипа бренда (--qf-indent),
     подписи строк выровнены вправо и кончаются по правому краю кнопки «Фильтры» (--qf-label-w) */
  var alignQf = function () {
    document.querySelectorAll('.ig-qf').forEach(function (qf) {
      var toolbar = document.querySelector('.ig-toolbar');
      var left = toolbar && toolbar.querySelector('.ig-toolbar__left');
      if (!left) return;
      var chip = left.querySelector('.igro-tag');
      var btn = left.querySelector('.ig-filters-btn');
      /* чипов в строке может не быть (в разделе один бренд) — тогда отступ считаем от кнопки «Фильтры» */
      var indent = chip
        ? chip.getBoundingClientRect().left - left.getBoundingClientRect().left
        : (btn ? btn.getBoundingClientRect().right - left.getBoundingClientRect().left + 16 : 0);
      if (indent > 0) qf.style.setProperty('--qf-indent', Math.round(indent) + 'px');
      if (btn) qf.style.setProperty('--qf-label-w', Math.round(btn.getBoundingClientRect().right - left.getBoundingClientRect().left) + 'px');
    });
  };
  alignQf();
  window.addEventListener('resize', alignQf);
  window.addEventListener('load', alignQf);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignQf);
  var qfHost = document.getElementById('ig-qf');
  var tbHost = document.getElementById('ig-tb');
  if (window.MutationObserver && qfHost && tbHost) {
    var mo = new MutationObserver(function () { alignQf(); });
    mo.observe(qfHost, { childList: true, subtree: true });
    mo.observe(tbHost, { childList: true, subtree: true });
  }

  /* полоса направлений: стрелки и запомненная позиция прокрутки */
  document.querySelectorAll('.ig-directions__wrap').forEach(function (wrap) {
    var track = wrap.querySelector('.ig-directions__track');
    var leftBtn = wrap.querySelector('.ig-directions__arrow--left');
    var rightBtn = wrap.querySelector('.ig-directions__arrow--right');
    if (!track) return;
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      if (leftBtn) leftBtn.hidden = track.scrollLeft <= 1;
      if (rightBtn) rightBtn.hidden = track.scrollLeft >= max - 1;
      /* затемнение краёв ряда баннеров: слева — когда ряд прокручен, справа — пока он не дошёл до конца */
      wrap.classList.toggle('is-scrolled', track.scrollLeft > 1);
      wrap.classList.toggle('is-end', track.scrollLeft >= max - 1);
    };
    /* позиция полосы принадлежит конкретной странице: возврат в категорию
       из другого раздела всегда открывает табы с начала */
    var key = 'ig-dirs-scroll:' + location.pathname + location.search;
    var save = function () { try { sessionStorage.setItem(key, String(Math.round(track.scrollLeft))); } catch (err) {} };
    var max = track.scrollWidth - track.clientWidth;
    var saved = null;
    try {
      if (sessionStorage.getItem('ig-dirs-last') === key) saved = sessionStorage.getItem(key);
      else sessionStorage.removeItem(key);
      sessionStorage.setItem('ig-dirs-last', key);
    } catch (err2) {}
    var prevBehavior = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    if (saved !== null && !isNaN(parseFloat(saved))) track.scrollLeft = Math.max(0, Math.min(max, parseFloat(saved)));
    track.addEventListener('scroll', function () { update(); save(); });
    window.addEventListener('resize', update);
    track.addEventListener('click', save);
    window.addEventListener('pagehide', save);
    var act = track.querySelector('[aria-current="page"]');
    if (act) {
      var pad = 24, l = act.offsetLeft, r = l + act.offsetWidth;
      if (l < track.scrollLeft + pad || r > track.scrollLeft + track.clientWidth - pad) {
        track.scrollLeft = Math.max(0, Math.min(max, l - (track.clientWidth - act.offsetWidth) / 2));
      }
    }
    requestAnimationFrame(function () { track.style.scrollBehavior = prevBehavior || ''; });
    update();
  });

  /* ---------- шапка поверх баннера: три состояния (эксперимент design-lab, 21.10.2026) ----------
     1. Полная — пока страница в начале: квадратный логотип, поиск, меню. Не закреплена: уходит вверх
        вместе со страницей (сдвиг transform, слот шапки нулевой высоты прилипает к верху окна).
     2. Компактная — как только полная ушла из виду (прокрутка ниже её низа): выезжает сверху, горизонтальный
        логотип и иконки (is-compact). Прокрутка вниз — меню спрятано (is-collapsed).
     3. Компактная с меню — прокрутка вверх ниже первого экрана: под компактной строкой выезжают меню и
        панель фильтров; в полную шапка возвращается, только когда страница снова в начале.
     is-clear — страница в самом верху: шапка прозрачная; is-on-dark — баннер тёмный, текст белый.
     --mast-h — высота полной шапки (на столько баннер уходит под неё); --tb-top — где встаёт панель фильтров */
  var mast = document.querySelector('[data-mast]');
  if (mast) {
    var docEl = document.documentElement;
    var heroEl = document.querySelector('#page > .ig-cathero, #page > .ig-hero');
    mast.classList.toggle('is-on-dark', !!(heroEl && heroEl.classList.contains('ig-cathero')));
    var lastY = window.scrollY, mastTick = false;
    var mastSlot = mast.parentNode;
    var mastNav = mast.querySelector('.ig-mainnav');
    var fullH = mast.offsetHeight, compactH = 60, navH = 40;
    var setMastH = function () {
      if (mast.classList.contains('is-compact')) return;
      fullH = mast.offsetHeight;
      docEl.style.setProperty('--mast-h', fullH + 'px');
      var inner = mastNav && mastNav.querySelector('.ig-mainnav__inner');
      if (inner && inner.offsetHeight) navH = inner.offsetHeight;
    };
    /* высота компактной строки — когда шапка досжалась */
    mast.addEventListener('transitionend', function (e) {
      if (e.target === mastNav && mast.classList.contains('is-collapsed')) compactH = mast.offsetHeight;
    });
    var isCompact = function () { return mast.classList.contains('is-compact'); };
    var isCollapsed = function () { return mast.classList.contains('is-collapsed'); };
    var collapseMast = function (on) {
      if (isCollapsed() === on) return;
      if (on && megaOpen()) setMega(false);
      mast.classList.toggle('is-collapsed', on);
    };
    var setCompact = function (on) {
      if (isCompact() === on) return;
      if (megaOpen()) setMega(false);
      if (on) {
        /* компактная выезжает сверху */
        mast.style.transform = '';
        mast.classList.add('is-compact', 'was-compact', 'is-entering');
        mast.getBoundingClientRect();
        requestAnimationFrame(function () { mast.classList.remove('is-entering'); });
      } else {
        mast.classList.remove('is-compact', 'is-entering');
      }
    };
    /* где стоит панель фильтров: под компактной строкой и меню */
    var tbTop = function () { return compactH + navH; };
    /* низ видимой шапки — до него панель фильтров стоит на месте */
    var mastBottom = function () {
      if (isCompact()) return isCollapsed() ? compactH : compactH + navH;
      return Math.max(0, mastSlot.getBoundingClientRect().top) + fullH - fullOffset;
    };
    var fullOffset = 0;

    /* панель фильтров (референс goldapple.ru/volosy): пока её место ниже шапки — стоит на месте; ушла под
       шапку — закрепляется под компактной шапкой с меню, секция держит её высоту (страница не прыгает).
       Прокрутка вниз — уезжает вверх вместе с меню, вверх — выезжает */
    var tbSec = document.querySelector('.ig-toolbar');
    var tbPanel = tbSec && tbSec.querySelector('[data-tbpanel]');
    var tbStuck = false;
    var slideFrom = function (fromTop) {
      var d = fromTop - tbPanel.getBoundingClientRect().top;
      if (Math.abs(d) < 1) return;
      tbPanel.classList.add('is-instant');
      tbPanel.style.transform = 'translateY(' + Math.round(d) + 'px)';
      tbPanel.getBoundingClientRect();
      tbPanel.classList.remove('is-instant');
      tbPanel.style.transform = '';
    };
    var placeTb = function () {
      if (!tbPanel) return;
      docEl.style.setProperty('--tb-top', tbTop() + 'px');
      var hide = isCompact() && isCollapsed();
      var stick = tbSec.getBoundingClientRect().top < mastBottom() - 1;
      if (stick === tbStuck) {
        if (stick) tbPanel.classList.toggle('is-hidden', hide);
        return;
      }
      tbStuck = stick;
      var wasTop = tbPanel.getBoundingClientRect().top;
      var wasShown = !tbPanel.classList.contains('is-hidden');
      if (stick) {
        tbSec.style.height = tbPanel.offsetHeight + 'px';
        if (hide) {
          /* место панели уже под шапкой — закрепляется сразу спрятанной */
          tbPanel.classList.add('is-instant', 'is-stuck', 'is-hidden');
          requestAnimationFrame(function () { requestAnimationFrame(function () { tbPanel.classList.remove('is-instant'); }); });
        } else {
          tbPanel.classList.add('is-stuck');
          tbPanel.classList.remove('is-hidden');
          slideFrom(wasTop);
        }
      } else {
        tbPanel.classList.remove('is-stuck', 'is-hidden');
        tbSec.style.height = '';
        if (wasShown) slideFrom(wasTop);
      }
    };
    /* фильтры поменялись в закреплённой панели — место в странице под её новую высоту */
    if (tbPanel && window.ResizeObserver) {
      new ResizeObserver(function () { if (tbStuck) tbSec.style.height = tbPanel.offsetHeight + 'px'; }).observe(tbPanel);
    }
    var onMastScroll = function () {
      mastTick = false;
      var y = Math.max(0, window.scrollY), dy = y - lastY;
      /* естественное место шапки – под плашкой со скидкой (offsetTop у прилипшего слота уже сдвинут) */
      var bar = document.querySelector('.ig-topbar');
      var slotTop = bar ? bar.offsetHeight : 0;
      mast.classList.toggle('is-clear', y <= 0);
      /* полная шапка ушла из виду целиком — компактная; вернулись к началу — снова полная */
      var compact = y > slotTop + fullH;
      setCompact(compact);
      if (compact) {
        fullOffset = 0;
        if (dy > 0) collapseMast(true);
        else if (dy < 0) collapseMast(false);
      } else {
        collapseMast(false);
        /* полная шапка уходит вверх вместе со страницей */
        fullOffset = Math.min(fullH, Math.max(0, y - slotTop));
        mast.style.transform = fullOffset ? 'translateY(' + (-fullOffset) + 'px)' : '';
      }
      lastY = y;
      placeTb();
    };
    window.addEventListener('scroll', function () {
      if (!mastTick) { mastTick = true; requestAnimationFrame(onMastScroll); }
    }, { passive: true });
    window.addEventListener('resize', function () { setMastH(); placeTb(); });
    window.addEventListener('load', setMastH);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setMastH);
    setMastH();
    onMastScroll();
    /* иконка поиска в компактной шапке — наверх, к полю поиска */
    mast.addEventListener('click', function (e) {
      if (!e.target.closest('[data-search-open]')) return;
      var input = mast.querySelector('.igro-search__input');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(function () { if (input) input.focus({ preventScroll: true }); }, 350);
    });
  }
})();
