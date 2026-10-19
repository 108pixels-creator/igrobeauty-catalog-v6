/* IGRObeauty — каталог v6: рендер страниц и рабочая фильтрация по данным справочника.
   v6 (12.10.2026) — копия v5; подкатегории в шапке категории показаны мини-баннерами (макет Figma «IB — my DESIGN», узел 2574:3195),
   группы, как и раньше, — чипами.

   Структура (ТЗ Милы от 01.10.2026, правки после обсуждения 02.10.2026):
   · три уровня со своими страницами: категория → подкатегория → группа;
   · «Технология / задача» — не уровень, а быстрый фильтр внутри группы;
   · сквозные фильтры: бренд, страна бренда, тип продукта (+ наличие и новинки — ждут данных 1С);
   · быстрые фильтры: ключевые бренды — на всех уровнях, тип продукта — с подкатегории, технология / задача — в группе;
   · числа товаров — только общий счётчик страницы и значения в панели «Фильтры»;
   · сортировка по умолчанию — «по популярности» с приоритетом брендов: эксклюзивные → партнёрские → остальные;
   · карточка каталога = продукт (поле «Продукт/карточка товара»): короткое название, бренд, линия. */
(function () {
  'use strict';
  var D = window.IG_DATA;
  var PER_PAGE = 24;
  var QF_LINES = 2;            /* строки быстрых фильтров (тип продукта, технология / задача) — не больше двух, дальше «ещё (N)» */
  var FACET_LIMIT = 8;         /* строк в группе панели до ссылки «Ещё N значений» */
  var SET_TYPE = 'Набор';      /* аналитическая подкатегория «Наборы» */
  var PRICE = D.meta.price;    /* единая демонстрационная цена: реальных цен в справочнике нет */
  var VERSION = 'v6';          /* версия прототипа; D.meta.version — версия сборки data.js */
  /* мини-баннеры подкатегорий: картинка assets/banners/<id>.jpg, цвет подписи — в styles.css по data-banner.
     Подпись короче названия раздела там, где так в макете */
  var BANNERS = {
    'hair-okrashivanie': 'Окрашивание',
    'hair-blond': 'Блонд',
    'hair-uhod-dlya-volos': 'Уход',
    'hair-terapiya': 'Терапия',
    'hair-zavivka': 'Завивка',
    'hair-stayling': 'Стайлинг',
    'hair-nabory': 'Наборы',
    'hair-muzhskoy-uhod': 'Мужской уход',
    'hair-aksessuary': 'Аксессуары',
    'hair-instrumenty': 'Инструменты'
  };
  /* фон шапки подкатегорий «Волос» и их групп: assets/hero/<id подкатегории>.jpg, 2880×480, в центре светло —
     заголовок читается. С 19.10.2026 — интерьеры из banners/horizontal/08_2026-10-19_hair-krea3-final
     (до этого — текстуры из 02_2026-10-12_hair-hero-textures). Группа берёт картинку своей подкатегории */
  var HERO_TEX = ['hair-okrashivanie', 'hair-blond', 'hair-uhod-dlya-volos', 'hair-terapiya', 'hair-zavivka',
    'hair-stayling', 'hair-nabory', 'hair-muzhskoy-uhod', 'hair-aksessuary', 'hair-instrumenty'];
  /* иконки групп «Волос» в чипах: assets/groups/<id>.png — набор icons/hair без прозрачных полей по бокам,
     высота файла 192 px. Здесь ширина на экране при высоте 96 px: чип знает размер иконки до её загрузки */
  var ICON_W = {
    'hair-aksessuary-dlya-okrashivaniya-i-zavivki': 72,
    'hair-aksessuary-dlya-strizhki-i-ukladki': 80,
    'hair-aksessuary-odezhda': 85,
    'hair-aksessuary-prochie-parikmaherskie-prinadlezhnosti': 81,
    'hair-aksessuary-vorotniki-i-zhguty': 82,
    'hair-blond-neytralizaciya-zheltizny': 49,
    'hair-blond-obescvechivanie-i-osvetlenie-volos': 79,
    'hair-blond-specialnyy-uhod-za-blondom': 85,
    'hair-blond-zaschita-volos-pri-osvetlenii': 48,
    'hair-instrumenty-feny': 72,
    'hair-instrumenty-mashinki-dlya-strizhki': 51,
    'hair-instrumenty-schipcy-i-ployki': 68,
    'hair-instrumenty-uhod-za-instrumentami': 68,
    'hair-muzhskoy-uhod-muzhskie-shampuni': 48,
    'hair-muzhskoy-uhod-muzhskoy-stayling': 80,
    'hair-muzhskoy-uhod-okrashivanie-dlya-muzhchin': 62,
    'hair-muzhskoy-uhod-sredstva-dlya-britya': 68,
    'hair-muzhskoy-uhod-uhod-za-borodoy-i-usami': 72,
    'hair-nabory': 85,
    'hair-okrashivanie-bezammiachnye-krasiteli': 52,
    'hair-okrashivanie-okisliteli-i-aktivatory': 50,
    'hair-okrashivanie-servisnye-sredstva': 77,
    'hair-okrashivanie-stoykie-ammiachnye-krasiteli': 82,
    'hair-okrashivanie-stoykie-bezammiachnye-krasiteli': 58,
    'hair-stayling-fiksaciya': 41,
    'hair-stayling-gladkost-i-blesk': 73,
    'hair-stayling-nabory-dlya-staylinga': 80,
    'hair-stayling-obem': 52,
    'hair-stayling-tekstura-i-kudri': 75,
    'hair-stayling-termozaschita': 86,
    'hair-terapiya-dlya-rosta-volos': 75,
    'hair-terapiya-glubokoe-ochischenie': 68,
    'hair-terapiya-protiv-vypadeniya-volos': 64,
    'hair-uhod-dlya-volos-nesmyvaemyy-uhod': 57,
    'hair-uhod-dlya-volos-obem-volos': 62,
    'hair-uhod-dlya-volos-pitanie-i-vosstanovlenie-volos': 67,
    'hair-uhod-dlya-volos-salonnyy-spa-uhod': 81,
    'hair-uhod-dlya-volos-uhod-dlya-kudryavyh-volos': 67,
    'hair-uhod-dlya-volos-uhod-dlya-okrashennyh-volos': 85,
    'hair-uhod-dlya-volos-uhod-dlya-sedyh-volos': 75,
    'hair-uhod-dlya-volos-universalnyy-uhod': 68,
    'hair-uhod-dlya-volos-uvlazhnenie-i-blesk-volos': 64,
    'hair-zavivka-biozavivka': 77,
    'hair-zavivka-himicheskaya-zavivka': 74
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* в названиях из справочника после запятой часто нет пробела — даём браузеру место для переноса */
  function soft(s) { return esc(s).replace(/,(?=\S)/g, ',&#8203;'); }
  function ic(name, size) { return '<i class="ig-ic ig-ic--' + name + ' ig-ic-' + size + '" aria-hidden="true"></i>'; }
  function NUM(n) { return n.toLocaleString('ru-RU'); }
  function plural(n, f) { var a = Math.abs(n) % 100, b = a % 10; if (a > 10 && a < 20) return f[2]; if (b > 1 && b < 5) return f[1]; if (b === 1) return f[0]; return f[2]; }
  function goods(n) { return NUM(n) + ' ' + plural(n, ['товар', 'товара', 'товаров']); }
  function rub(n) { return NUM(n) + '\u00a0₽'; }
  function own(o, k) { return k != null && Object.prototype.hasOwnProperty.call(o, k); }

  var params = new URLSearchParams(location.search);
  /* карточка каталога — продукт; ?cards=sku показывает прежнюю логику «карточка на каждый артикул» */
  var MODE = params.get('cards') === 'sku' ? 'sku' : 'product';
  function link(href) {
    if (!href) return '#';
    if (MODE !== 'sku') return href;
    return href + (href.indexOf('?') > -1 ? '&' : '?') + 'cards=sku';
  }
  /* картинки товаров — ссылки на сайт igrobeauty.ru («Картинка для анонса» из выгрузки Битрикса 12.10.2026),
     сами файлы в прототип не скачиваются. Оригиналы — 1000×1000 и до 0,5 МБ, поэтому в карточку картинка идёт
     уменьшенной до 440 px через сервис wsrv.nl: он берёт её по ссылке, уменьшает и кэширует (около 20 КБ вместо 500).
     ?img=direct — показывать оригиналы с сайта без уменьшения */
  var IMG_BASE = D.meta.img_base || '';
  var IMG_DIRECT = params.get('img') === 'direct';
  function imgFull(path) { return /^https?:/.test(path) ? path : IMG_BASE + path; }
  function imgThumb(path) {
    var full = imgFull(path);
    if (IMG_DIRECT) return full;
    return 'https://wsrv.nl/?url=' + encodeURIComponent(full.replace(/^https?:\/\//, '')) + '&w=440&h=440&fit=inside&output=webp&q=82';
  }
  /* неизвестный id не должен ронять страницу — открываем раздел по умолчанию */
  var idParam = params.get('id'), idDefault = document.body.getAttribute('data-default');
  var node = own(D.nodes, idParam) ? D.nodes[idParam] : (own(D.nodes, idDefault) ? D.nodes[idDefault] : D.nodes.hair);
  document.title = node.title + ' – IGRObeauty';

  /* ---------- справочник брендов: страна, тип и ID ---------- */
  var BT_TIER = { ex: 0, pa: 1 };
  function brand(b) { return own(D.brands, b) ? D.brands[b] : {}; }
  function brandType(b) { return brand(b).t || ''; }
  /* ID бренда с листа «Бренды map» задаёт порядок в быстрых фильтрах и в панели */
  function brandId(b) { return brand(b).i || 9999; }
  /* приоритет брендов един для всего каталога: эксклюзивные → партнёрские → остальные */
  function brandTier(b) { var t = BT_TIER[brandType(b)]; return t === undefined ? 2 : t; }

  /* ---------- карточки ---------- */
  var cards = [];
  D.items.forEach(function (p, i) {
    if (MODE === 'sku') {
      p.v.forEach(function (s) {
        /* s[2] — собственная разметка артикула, если она отличается от разметки продукта */
        cards.push({ key: 's' + s[0], i: i, d: p.d, g: p.g, l: p.l || '', n: p.n, y: p.y, a: p.a || [], img: p.img || '', x: s[2] || p.x, f: p.f, vc: p.vc, r: PRICE, multi: false, arts: [s[0]], desc: s[1] });
      });
      return;
    }
    /* несколько вариантов (объём, оттенок, размер) — выбор в карточке товара, а не в списке.
       Вариант — артикул без префикса «МТ»: пара «с МТ и без» остаётся одним товаром.
       sh — число оттенков у красителей: в карточке пишется «N оттенков» вместо «N вариантов» */
    cards.push({
      key: 'p' + i, i: i, d: p.d, g: p.g, l: p.l || '', n: p.n, y: p.y, a: p.a || [], img: p.img || '', x: p.x, f: p.f, vc: p.vc,
      r: PRICE, multi: p.vc > 1, sh: p.sh || 0,
      arts: p.v.map(function (s) { return s[0]; })
    });
  });

  /* ---------- корзина (имитация) ----------
     «В корзину» и счётчик в карточке меняют корзину, в шапке — кружок с числом товаров и сумма.
     Корзина хранится в localStorage этого браузера: переживает переход между разделами и обновление страницы.
     Ключ товара — номер продукта (в режиме «по артикулам» — артикул). Страницы корзины в прототипе нет.
     Ключ хранилища сменён 13.10.2026 после пересборки по «Своду 18»: номера продуктов сдвинулись */
  var CART_KEY = 'ig-catalog-v6-cart-s18';
  var cart = {};
  function cartLoad(raw) { try { var c = JSON.parse(raw || '{}'); return c && typeof c === 'object' ? c : {}; } catch (e) { return {}; } }
  try { cart = cartLoad(localStorage.getItem(CART_KEY)); } catch (e) { cart = {}; }
  function cartSave() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function cartQty(key) { return cart[key] ? cart[key].q : 0; }
  function cartTotals() {
    var n = 0, sum = 0;
    for (var k in cart) if (own(cart, k)) { n += cart[k].q; sum += cart[k].q * cart[k].r; }
    return { n: n, sum: sum };
  }
  var cartShown = null;
  function renderCart() {
    var btn = document.querySelector('[data-cart]');
    if (!btn) return;
    var t = cartTotals();
    var badge = btn.querySelector('.ig-cart__count'), sum = btn.querySelector('.ig-cart__sum');
    badge.hidden = !t.n;
    badge.textContent = t.n > 99 ? '99+' : String(t.n);
    sum.hidden = !t.n;
    sum.textContent = rub(t.sum);
    btn.setAttribute('aria-label', t.n ? 'Корзина: ' + goods(t.n) + ' на ' + rub(t.sum) : 'Корзина пуста');
    /* кружок коротко увеличивается, когда товаров стало больше */
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cartShown !== null && t.n > cartShown && badge.animate && !calm) {
      badge.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
    }
    cartShown = t.n;
  }
  /* разметка счётчика количества (QuantityStepper ДС) — общая для карточки и script.js */
  function stepperHTML(q, addLabel) {
    return '<div class="igro-stepper" role="group" aria-label="Количество" data-add-label="' + esc(addLabel || '') + '">' +
      '<button type="button" class="igro-stepper__btn" data-step="-1" aria-label="Уменьшить">' + ic('minus', 20) + '</button>' +
      '<span class="igro-stepper__value" aria-live="polite">' + q + '</span>' +
      '<button type="button" class="igro-stepper__btn" data-step="1" aria-label="Увеличить">' + ic('plus', 20) + '</button></div>';
  }
  window.IG_CART = {
    qty: cartQty,
    set: function (key, q, price) {
      if (!key) return;
      if (q > 0) cart[key] = { q: q, r: price }; else delete cart[key];
      cartSave(); renderCart();
    },
    clear: function () { cart = {}; cartSave(); renderCart(); renderContent(); },
    stepperHTML: stepperHTML
  };
  /* корзину поменяли в другой вкладке */
  window.addEventListener('storage', function (e) {
    if (e.key !== CART_KEY) return;
    cart = cartLoad(e.newValue); renderCart(); renderContent();
  });

  /* ---------- выборка раздела ----------
     товар может стоять в нескольких разделах (до трёх привязок), в списке он показывается один раз;
     аналитические подкатегории собираются по полю товара (плюс прямая разметка, если она есть) */
  function placed(p, s) {
    for (var i = 0; i < p.x.length; i++) if (p.x[i][0] === s.p && (!s.t || p.x[i][1] === s.t)) return true;
    return false;
  }
  function inScope(p, s) {
    if (p.d !== s.d) return false;
    if (s.a === 'set') return p.y === SET_TYPE || (!!s.p && placed(p, s));
    if (s.a === 'spf') return !!p.f || (!!s.p && placed(p, s));
    if (!s.p) return true;
    return placed(p, s);
  }
  var sc = node.scope;
  var scope = cards.filter(function (p) { return inScope(p, sc); });
  var isGroup = node.level === 3;

  /* технологии / задачи товара внутри текущей группы */
  function techs(p) {
    if (p._t) return p._t;
    var out = [];
    if (isGroup) p.x.forEach(function (pl) {
      if (pl[0] === sc.p && pl[1] === sc.t && pl[2] && out.indexOf(pl[2]) < 0) out.push(pl[2]);
    });
    return (p._t = out);
  }
  /* место товара в дереве каталога: «подкатегория|группа» → номер по порядку листа «Каталог map».
     Считаем только привязки внутри текущего раздела */
  var TREE = Object.create(null), treeN = 0;
  Object.keys(D.nodes).forEach(function (id) {
    var n = D.nodes[id];
    if (n.cat !== node.cat || n.level === 1 || n.scope.a) return;
    TREE[n.scope.p + '|' + (n.scope.t || '')] = treeN++;
  });
  function treePos(p) {
    if (p._o !== undefined) return p._o;
    var best = 1e9;
    p.x.forEach(function (pl) {
      if (sc.p && !sc.a && (pl[0] !== sc.p || (sc.t && pl[1] !== sc.t))) return;
      var o = TREE[pl[0] + '|' + pl[1]];
      if (o !== undefined && o < best) best = o;
    });
    return (p._o = best);
  }

  /* значения товара по ключу фильтра: g — бренд, c — страна бренда, y — тип продукта, a — область применения,
     t — технология / задача. Область применения — из «Свода 18» (12.10.2026); у продукта их может быть несколько */
  function vals(p, k) {
    if (k === 'g') return [p.g];
    if (k === 'y') return p.y ? [p.y] : [];
    if (k === 'a') return p.a;
    if (k === 'l') return p.l ? [lineKey(p)] : [];
    if (k === 'c') { var c = brand(p.g).c; return c ? [c] : []; }
    if (k === 't') return techs(p);
    return [];
  }
  /* l — линия: включается кликом по линии в карточке, в панели «Фильтры» её нет */
  function lineKey(p) { return p.g + ' · ' + p.l; }
  var KEYS = ['g', 'c', 'y', 'a', 'l', 't'];
  /* сквозные фильтры панели */
  var FACETS = [
    { k: 'g', title: 'Бренд', open: true },
    { k: 'c', title: 'Страна бренда' },
    { k: 'y', title: 'Тип продукта' },
    { k: 'a', title: 'Область применения' }
  ];

  function countBy(list, k) {
    var m = Object.create(null);
    list.forEach(function (p) { vals(p, k).forEach(function (v) { m[v] = (m[v] || 0) + 1; }); });
    return m;
  }
  var base = {};
  KEYS.forEach(function (k) { base[k] = countBy(scope, k); });
  function distinct(k) { return Object.keys(base[k]).length; }

  /* порядок значений:
     бренды — по ID бренда; технологии / задачи — по ID из «Каталог map»; страны и типы продукта — по алфавиту */
  var ORDER = {};
  KEYS.forEach(function (k) {
    var m = base[k], list = Object.keys(m);
    if (k === 'g') {
      list.sort(function (a, b) { return brandId(a) - brandId(b) || a.localeCompare(b, 'ru'); });
    } else if (k === 't') {
      var ord = node.tech || [];
      list.sort(function (a, b) {
        var ia = ord.indexOf(a), ib = ord.indexOf(b);
        return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib) || a.localeCompare(b, 'ru');
      });
    } else {
      list.sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    }
    ORDER[k] = list;
  });

  /* быстрый фильтр по брендам — только ключевые бренды раздела: эксклюзивные и партнёрские, в порядке ID.
     Остальные бренды доступны в панели «Фильтры» */
  var keyBrands = ORDER.g.filter(function (b) { return brandType(b); });
  var soleBrand = keyBrands.length === 1 && distinct('g') === 1;   /* в разделе один бренд: чип ничего не фильтрует */
  var showTech = isGroup && distinct('t') >= 2;
  /* тип продукта виден на всех подкатегориях и группах, даже если значение одно: он ещё и подписывает страницу */
  var typeCount = node.level >= 2 ? distinct('y') : 0;
  var facets = FACETS.filter(function (f) { return distinct(f.k) >= 1; });

  /* ---------- состояние ---------- */
  var sel = {}, pending = null, expanded = {}, openFacets = {};
  KEYS.forEach(function (k) { sel[k] = []; });
  FACETS.forEach(function (f) { if (f.open) openFacets[f.k] = true; });
  var state = { sort: 'pop', page: 1 };
  var SORTS = [
    { k: 'pop', label: 'По популярности' },
    { k: 'asc', label: 'По цене: по возрастанию' },
    { k: 'desc', label: 'По цене: по убыванию' }
  ];

  function clone(s) { var o = {}; for (var k in s) o[k] = s[k].slice(); return o; }
  function panelSelected(s) { return s.g.length + s.c.length + s.y.length + s.a.length; }
  function anySelected(s) { for (var k in s) if (s[k].length) return true; return false; }
  function resetAll() { KEYS.forEach(function (k) { sel[k] = []; }); pending = null; }
  function matches(p, s, skip) {
    for (var k in s) {
      if (skip && skip[k]) continue;
      var v = s[k]; if (!v.length) continue;
      var pv = vals(p, k), hit = false;
      for (var i = 0; i < v.length; i++) if (pv.indexOf(v[i]) > -1) { hit = true; break; }
      if (!hit) return false;
    }
    return true;
  }
  function filtered(s, skip) { return scope.filter(function (p) { return matches(p, s, skip); }); }
  /* счётчик = сколько товаров останется, если выбрать это значение (свой фильтр не учитываем) */
  function countsFor(s, k) {
    var skip = {}; skip[k] = 1;
    return countBy(filtered(s, skip), k);
  }
  function sortItems(list) {
    if (state.sort === 'pop') {
      /* приоритет брендов по типу: эксклюзивные → партнёрские → остальные (ID бренда на порядок товаров не влияет).
         Данных о популярности в справочнике нет, поэтому внутри типа стоит заглушка:
         порядок разделов каталога, в одном разделе выше продукты с большим числом вариантов, дальше — порядок справочника */
      return list.slice().sort(function (a, b) {
        return brandTier(a.g) - brandTier(b.g) || treePos(a) - treePos(b) || b.vc - a.vc || a.i - b.i;
      });
    }
    var dir = state.sort === 'desc' ? -1 : 1;
    return list.slice().sort(function (a, b) {
      if (!a.r !== !b.r) return a.r ? -1 : 1;          /* без цены — в конец */
      if (a.r !== b.r) return (a.r - b.r) * dir;
      return a.n.localeCompare(b.n, 'ru');
    });
  }

  /* ---------- мега-меню ---------- */
  var megaEl = document.getElementById('mega');
  if (megaEl) {
    megaEl.innerHTML = '<div class="ig-container ig-mega__inner">' +
      '<button type="button" class="igro-icon-btn igro-icon-btn--ghost ig-mega__close" data-mega-close aria-label="Закрыть каталог">' + ic('close', 20) + '</button>' +
      '<div class="ig-mega__cats"><span class="ig-mega__marker" aria-hidden="true"></span>' +
      D.mega.cats.map(function (c) {
        return '<a class="ig-mega__cat' + (c.cat === node.cat ? ' is-active' : '') + '" data-cat="' + c.cat + '" href="' + link(c.href) + '">' + esc(c.t) + '</a>';
      }).join('') + '</div>' +
      D.mega.panels.map(function (p) {
        return '<div class="ig-mega__cols" data-panel="' + p.cat + '"' + (p.cat === node.cat ? '' : ' hidden') + '>' +
          p.cols.map(function (col) {
            return '<div>' + col.map(function (g) {
              return '<div class="ig-mega__group"><h3 class="ig-mega__group-title"><a href="' + link(g.href) + '">' + esc(g.title) + '</a></h3>' +
                (g.links.length ? '<ul class="ig-mega__links">' +
                  g.links.map(function (l) { return '<li><a href="' + link(l.href) + '">' + esc(l.t) + '</a></li>'; }).join('') + '</ul>' : '') +
                '</div>';
            }).join('') + '</div>';
          }).join('') + '</div>';
      }).join('') + '</div>';
  }

  /* ---------- шапка страницы: крошки, заголовок, ссылки на разделы ---------- */
  var chain = [];
  for (var cur = node; cur; cur = D.nodes[cur.parent]) chain.unshift(cur);
  var trail = [{ t: 'Главная', href: 'index.html' }].concat(chain.map(function (c) {
    return { t: c.title, href: c.href, cur: c === node };
  }));
  /* Breadcrumb ДС: прежние шаги — ссылки, текущая страница — igro-crumbs__current с aria-current */
  function crumbsHTML(extra) {
    return '<nav class="igro-crumbs' + (extra ? ' ' + extra : '') + '" aria-label="Хлебные крошки"><ol class="igro-crumbs__list">' +
      trail.map(function (c, i) {
        return '<li class="igro-crumbs__item">' + (c.cur
          ? '<span class="igro-crumbs__current" aria-current="page">' + esc(c.t) + '</span>'
          : '<a class="igro-crumbs__link" href="' + link(c.href) + '">' + esc(c.t) + '</a>') +
          (i < trail.length - 1 ? '<span class="igro-crumbs__sep" aria-hidden="true">/</span>' : '') + '</li>';
      }).join('') + '</ol></nav>';
  }

  /* ряд под шапкой: категория → её подкатегории; подкатегория → её группы; группа → соседние группы, текущая подсвечена.
     Подкатегория без групп («Наборы» и др.) выглядит как остальные подкатегории — шапка с заголовком, ряда нет (12.10) */
  var ownKids = node.kids && node.kids.length;
  var dirIds = ownKids ? node.kids : (node.level === 3 ? D.nodes[node.parent].kids : []);
  var dirs = dirIds.map(function (id) {
    var n = D.nodes[id];
    /* у групп «Волос» есть иконки: assets/groups/<id группы>.png — уменьшенные копии icons/hair (Figma «Hair icons», узел 2569:418) */
    return { id: id, t: n.title, href: n.href, active: n === node, icon: own(ICON_W, id) };
  });
  /* подкатегории — мини-баннерами, если картинки есть у всех; группы остаются чипами */
  /* мини-баннеры — только на странице категории */
  var banners = node.level === 1 && dirs.length > 0 &&
    dirIds.every(function (id) { return own(BANNERS, id); });

  var html;
  if (banners) {
    /* тёмная полоса со сценой из ЛК: крошки и ряд баннеров во всю ширину окна.
       Заголовка в макете нет — h1 остаётся для поиска и экранного диктора */
    html = '<section class="ig-cathero"><div class="ig-container">' +
      crumbsHTML('ig-cathero__crumbs') +
      '<h1 class="igro-sr-only">' + esc(node.title) + '</h1></div>' +
      '<div class="ig-cathero__rail ig-directions__wrap">' +
      '<button type="button" class="ig-directions__arrow ig-directions__arrow--left" data-scroll="-1" aria-label="Предыдущие разделы" hidden>' + ic('arrow-left', 20) + '</button>' +
      '<div class="ig-cathero__track ig-directions__track">' +
      dirs.map(function (d) {
        return '<a class="ig-banner" data-banner="' + d.id + '" href="' + link(d.href) + '"' + (d.active ? ' aria-current="page"' : '') + '>' +
          '<img class="ig-banner__img" src="assets/banners/' + d.id + '.jpg" width="184" height="184" alt="" loading="lazy" decoding="async">' +
          '<span class="ig-banner__t">' + esc(BANNERS[d.id]) + '</span></a>';
      }).join('') +
      '</div><button type="button" class="ig-directions__arrow ig-directions__arrow--right" data-scroll="1" aria-label="Ещё разделы">' + ic('arrow-right', 20) + '</button></div></section>';
  } else {
    var texId = node.level === 3 ? node.parent : node.id;
    var tex = HERO_TEX.indexOf(texId) > -1 ? 'assets/hero/' + texId + '.jpg' : '';
    html = '<section class="ig-hero' + (tex ? ' ig-hero--tex' : '') + '"' + (tex ? ' style="--hero-tex: url(&quot;' + tex + '&quot;)"' : '') + '><div class="ig-container">' + crumbsHTML() +
      '<h1 class="igro-promo ig-hero__title">' + esc(node.title) + '</h1>' +
      '</div></section>';
  }
  if (dirs.length && !banners) {
    html += '<section class="ig-directions"><div class="ig-container ig-directions__wrap">' +
      '<button type="button" class="ig-directions__arrow ig-directions__arrow--left" data-scroll="-1" aria-label="Предыдущие разделы" hidden>' + ic('arrow-left', 20) + '</button>' +
      '<div class="ig-directions__track">' +
      dirs.map(function (d) {
        return '<a class="ig-direction' + (d.icon ? ' ig-direction--icon' : '') + '" href="' + link(d.href) + '"' + (d.active ? ' aria-current="page"' : '') + '>' +
          (d.icon
            ? '<img class="ig-direction__icon" src="assets/groups/' + d.id + '.png" width="' + ICON_W[d.id] + '" height="96" alt="" decoding="async">'
            : '<span class="ig-direction__dot"></span>') +
          '<span class="ig-direction__t">' + esc(d.t) + '</span></a>';
      }).join('') +
      '</div><button type="button" class="ig-directions__arrow ig-directions__arrow--right" data-scroll="1" aria-label="Ещё разделы">' + ic('arrow-right', 20) + '</button></div></section>';
  }
  html += '<section class="ig-toolbar"><div class="ig-container">' +
    '<div class="ig-toolbar__row" id="ig-tb"></div><div id="ig-qf"></div></div></section>' +
    '<main class="ig-content"><div class="ig-container" id="ig-content"></div></main>';
  document.getElementById('page').innerHTML = html;

  /* логотип ведёт на первую категорию и сохраняет режим карточек */
  var logo = document.querySelector('.ig-logo');
  if (logo) logo.setAttribute('href', link('index.html'));

  /* ---------- подвал: категории и служебная строка прототипа ---------- */
  var footNav = document.getElementById('ig-footer-nav');
  if (footNav) footNav.innerHTML = D.mega.cats.map(function (c) { return '<a href="' + link(c.href) + '">' + esc(c.t) + '</a>'; }).join('');
  var proto = document.getElementById('ig-proto');
  if (proto) {
    var here = function (mode) {
      var q = new URLSearchParams(location.search);
      if (mode === 'sku') q.set('cards', 'sku'); else q.delete('cards');
      var s = q.toString();
      /* прототип могут открыть как папку, без имени файла в адресе */
      return (location.pathname.split('/').pop() || 'index.html') + (s ? '?' + s : '');
    };
    var built = (D.meta.built || '').split('-').reverse().join('.');
    /* номер раздела по листу «Каталог map» — чтобы страницу было легко сверить со справочником */
    var LEVEL = { 1: 'категория', 2: 'подкатегория', 3: 'группа' };
    var KIND = { set: ', собрана по полю «Тип продукта» = «Набор»', spf: ', собрана по полю «Уровень тона» = «SPF»' };
    proto.innerHTML = '<span>Прототип каталога ' + esc(VERSION) + ' · справочник «' + esc(D.meta.source.replace(/\.xlsx$/, '')) + '» · сборка ' + esc(built) +
      ' · раздел ' + esc(node.mid) + ', ' + LEVEL[node.level] + (KIND[node.kind] || '') + '</span>' +
      '<span class="ig-proto__mode">Карточки: ' +
      (MODE === 'product' ? '<b>по продуктам</b>' : '<a href="' + here('product') + '">по продуктам</a>') + ' · ' +
      (MODE === 'sku' ? '<b>по артикулам</b>' : '<a href="' + here('sku') + '">по артикулам</a>') +
      ' · <button type="button" class="ig-proto__link" data-cart-clear>очистить корзину</button></span>';
  }

  /* ---------- тулбар ---------- */
  /* медаль на чипе эксклюзивного бренда: кружок со звёздочкой, заливка — currentColor */
  var MEDAL = '<span class="ig-medal" title="Эксклюзивный бренд">' +
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/>' +
    '<path class="ig-medal__star" d="M10 5.4l1.42 2.88 3.18.46-2.3 2.24.54 3.17L10 12.65l-2.84 1.5.54-3.17-2.3-2.24 3.18-.46z"/></svg>' +
    '<span class="igro-sr-only">, эксклюзивный бренд</span></span>';

  /* чипы быстрых фильтров — Tag ДС (кнопка-переключатель, выбранный — aria-pressed); без числа товаров:
     числа остались только в общем счётчике и в панели */
  function chipHTML(k, v, on) {
    var medal = k === 'g' && brandType(v) === 'ex';
    return '<button type="button" class="igro-tag igro-tag--interactive' + (medal ? ' ig-tag-hit' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" data-facet="' + k + '" data-val="' + esc(v) + '">' +
      esc(v) + (medal ? MEDAL : '') + '</button>';
  }
  function removableTag(k, v, label) {
    return '<span class="igro-tag igro-tag--selected igro-tag--removable">' + esc(label) +
      '<button type="button" class="igro-tag__remove" data-facet="' + k + '" data-val="' + esc(v) + '" aria-label="Убрать фильтр: ' + esc(label) + '">' + ic('close', 16) + '</button></span>';
  }
  /* значения, которые при текущих фильтрах дают хотя бы один товар (выбранное остаётся всегда) */
  function available(k) {
    var cnts = countsFor(sel, k), picked = sel[k];
    return ORDER[k].filter(function (v) { return (cnts[v] || 0) > 0 || picked.indexOf(v) > -1; });
  }

  function renderToolbar() {
    /* счётчик у сортировки – сколько всего товаров в разделе; от выбранных фильтров не зависит (решение 20.10.2026) */
    var total = scope.length;
    var n = panelSelected(sel);
    /* «Фильтры» — Button sm: ghost, а когда в панели что-то выбрано — dark */
    var left = '<button type="button" class="igro-btn igro-btn--sm ' + (n ? 'igro-btn--dark' : 'igro-btn--ghost') + ' ig-filters-btn" data-open="filters" aria-haspopup="dialog">' +
      ic('filter', 18) + 'Фильтры<span class="ig-btn__num">' + (n ? '· ' + n : '') + '</span></button>';

    /* ключевые бренды раздела. «Все бренды» — только когда ключевых брендов два и больше */
    if (soleBrand) {
      var sb = keyBrands[0], sm = brandType(sb) === 'ex';
      left += '<span class="igro-tag igro-tag--selected' + (sm ? ' ig-tag-hit' : '') + '">' + esc(sb) + (sm ? MEDAL : '') + '</span>';
    } else if (keyBrands.length) {
      if (keyBrands.length > 1) {
        var allOn = !sel.g.length;
        left += '<button type="button" class="igro-tag igro-tag--interactive" aria-pressed="' + (allOn ? 'true' : 'false') + '" data-all-brands>Все бренды</button>';
      }
      var ab = available('g');
      keyBrands.forEach(function (b) {
        if (ab.indexOf(b) > -1) left += chipHTML('g', b, sel.g.indexOf(b) > -1);
      });
    }
    /* бренд без своего чипа (не ключевой) и линия, выбранные кликом в карточке, — чипами с крестиком (Tag ДС, removable) */
    sel.g.forEach(function (b) { if (keyBrands.indexOf(b) < 0) left += removableTag('g', b, b); });
    sel.l.forEach(function (v) { left += removableTag('l', v, 'Линия: ' + v.split(' · ').slice(1).join(' · ')); });

    var sortLabel = SORTS.filter(function (s) { return s.k === state.sort; })[0].label;
    var right = '<span class="ig-count">' + goods(total) + '</span>' +
      '<div class="ig-sortwrap"><button type="button" class="ig-sort" data-sortmenu aria-haspopup="menu" aria-expanded="false">' + esc(sortLabel) + ic('chevron', 16) + '</button>' +
      /* Menu ДС: текущий пункт — aria-current (светло-зелёная плашка) */
      '<div class="igro-menu ig-sortmenu" role="menu" aria-label="Сортировка" hidden>' +
      SORTS.map(function (s) {
        return '<button type="button" class="igro-menu__item" role="menuitem"' + (state.sort === s.k ? ' aria-current="true"' : '') + ' data-sort="' + s.k + '">' + esc(s.label) + '</button>';
      }).join('') + '</div></div>';

    document.getElementById('ig-tb').innerHTML =
      '<div class="ig-toolbar__left">' + left + '</div><div class="ig-toolbar__right">' + right + '</div>';

    var rows = '';
    /* технология / задача — чипы. Больше двух строк — «ещё (N)» в конце второй строки; в панели «Фильтры» этого
       фильтра нет, поэтому «ещё» раскрывает строку на месте, «свернуть» — сворачивает */
    if (showTech) {
      var techChips = available('t').map(function (v) { return chipHTML('t', v, sel.t.indexOf(v) > -1); }).join('');
      if (techChips) rows += '<div class="ig-qf__row"><span class="ig-qf__label">Технология / задача:</span>' +
        '<div class="ig-qf__chips" data-clamp="' + (techOpen ? 'open' : 't') + '">' + techChips +
        '<button type="button" class="igro-tag igro-tag--interactive ig-qf__more" data-tech-more hidden></button>' +
        (techOpen ? '<button type="button" class="igro-tag igro-tag--interactive ig-qf__more" data-tech-less>свернуть</button>' : '') +
        '</div></div>';
    }
    /* тип продукта — на всех подкатегориях и группах одинаково: ссылки по алфавиту.
       Одно значение — просто подпись. Не помещаются в две строки — показываем, сколько влезет до конца второй строки,
       и в конце «ещё (N)», который открывает панель «Фильтры» на группе «Тип продукта» */
    if (typeCount === 1) {
      rows += '<div class="ig-qf__row ig-qf__row--text"><span class="ig-qf__label">Тип продукта:</span>' +
        '<div class="ig-typelist"><span class="ig-typelist__only">' + esc(ORDER.y[0]) + '</span></div></div>';
    } else if (typeCount > 1) {
      var links = available('y').map(function (v) {
        var on = sel.y.indexOf(v) > -1;
        return '<button type="button" class="ig-tlink" aria-pressed="' + (on ? 'true' : 'false') + '" data-facet="y" data-val="' + esc(v) + '">' + esc(v) + '</button>';
      }).join('');
      if (links) rows += '<div class="ig-qf__row ig-qf__row--text"><span class="ig-qf__label">Тип продукта:</span>' +
        '<div class="ig-typelist" data-clamp="y">' + links +
        '<button type="button" class="ig-tlink ig-tlink--more" data-open="filters" data-focus="y" aria-haspopup="dialog" hidden></button></div></div>';
    }
    document.getElementById('ig-qf').innerHTML = rows ? '<div class="ig-qf">' + rows + '</div>' : '';
    /* обрезка до двух строк — после того, как script.js выровняет подписи строк (ширина колонки меняется) */
    requestAnimationFrame(clampRows);
  }

  /* ---------- контент ---------- */
  /* карточка по макету Figma: картинка, бренд, линия, название, артикул, цена с подписью, действие во всю ширину */
  function cardHTML(p) {
    /* у красителей с разными оттенками считаем оттенки, у остальных продуктов — варианты */
    var art = !p.multi ? 'Арт: ' + p.arts.join(' · ')
      : p.sh ? NUM(p.sh) + ' ' + plural(p.sh, ['оттенок', 'оттенка', 'оттенков'])
      : NUM(p.vc) + ' ' + plural(p.vc, ['вариант', 'варианта', 'вариантов']);
    /* «нет в наличии» — состояние из макета; данных о наличии в справочнике нет, признак out пока никому не ставится */
    /* «В корзину» — dark, как в макете карточки; «Выбрать» (у продукта несколько вариантов) — secondary */
    var controls = p.out
      ? '<div class="ig-card__nostock">' + ic('close', 20) + 'нет в наличии</div>'
      : p.multi
        ? '<button type="button" class="igro-btn igro-btn--secondary igro-btn--block ig-card__btn" data-variants aria-label="Выбрать: ' + esc(p.n) + '">Выбрать</button>'
        : cartQty(p.key)
          ? stepperHTML(cartQty(p.key), 'В корзину: ' + p.n)
          : '<button type="button" class="igro-btn igro-btn--dark igro-btn--block ig-card__btn" data-add aria-label="В корзину: ' + esc(p.n) + '">В корзину</button>';
    return '<article class="igro-product-card ig-card" data-key="' + esc(p.key) + '">' +
      /* картинка и название ведут в карточку товара (в прототипе её нет — подсказка); с клавиатуры — через название */
      '<div class="ig-card__media' + (p.img ? ' ig-card__media--img' : '') + '" data-product aria-hidden="true">' +
      (p.img ? '<img class="ig-card__img" src="' + esc(imgThumb(p.img)) + '" data-full="' + esc(imgFull(p.img)) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : '') +
      '</div>' +
      '<div class="ig-card__body">' +
      /* бренд и серия одной строкой через среднюю точку; не помещаются — серия уходит на новую строку без точки (как в ЛК6) */
      /* бренд и линия — кнопки: включают фильтр по бренду или по линии на текущей странице */
      '<div class="ig-card__brandline"><button type="button" class="igro-product-card__brand ig-card__brand" data-card-brand="' + esc(p.g) + '" title="Все товары бренда в разделе">' + esc(p.g) + '</button>' +
      (p.l ? '<button type="button" class="ig-card__line" data-card-line="' + esc(lineKey(p)) + '" data-card-line-brand="' + esc(p.g) + '" title="Все товары линии «' + esc(p.l) + '» в разделе"><span class="ig-card__line-text">' + esc(p.l) + '</span></button>' : '') + '</div>' +
      '<div class="igro-product-card__name ig-card__name" title="' + esc(p.n) + '"><a class="igro-product-card__link ig-card__link" href="#" data-product>' + soft(p.n) + '</a></div>' +
      (p.desc ? '<div class="ig-card__desc" title="' + esc(p.desc) + '">' + esc(p.desc) + '</div>' : '') +
      '<div class="ig-card__art" title="' + esc(art) + '">' + esc(art) + '</div>' +
      /* цена в карточке — за выбранное количество (как было со счётчиком); data-unit — цена за штуку */
      /* по макету Figma «IB — my DESIGN», узел 2593:5468: «Розничная цена» под ценой, справа — «Узнать проф. цену»
         (профессиональная цена видна после регистрации на сайте) */
      '<div class="ig-card__pricerow"><div class="ig-card__priceblock">' +
      '<span class="igro-price igro-price--lg"><span class="igro-price__amount ig-card__price" data-unit="' + p.r + '">' + esc(rub(p.r * (cartQty(p.key) || 1))) + '</span></span>' +
      '<span class="ig-card__pricenote">Розничная цена</span></div>' +
      '<button type="button" class="ig-card__pro" data-pro-price><span class="ig-card__pro-l">Узнать</span> проф.&nbsp;цену</button></div>' +
      '</div>' +
      '<div class="ig-card__controls">' + controls + '</div>' +
      '</article>';
  }
  function pagerHTML(pages) {
    if (pages < 2) return '';
    var cur = state.page, out = [];
    function num(i) { return '<button type="button" class="igro-pagination__cell igro-pagination__page"' + (i === cur ? ' aria-current="page"' : '') + ' aria-label="Страница ' + i + '" data-page="' + i + '">' + i + '</button>'; }
    var show = {};
    [1, pages, cur - 1, cur, cur + 1].forEach(function (i) { if (i >= 1 && i <= pages) show[i] = 1; });
    var prev = 0;
    Object.keys(show).map(Number).sort(function (a, b) { return a - b; }).forEach(function (i) {
      if (prev && i - prev > 1) out.push('<span class="igro-pagination__ellipsis" aria-hidden="true">…</span>');
      out.push(num(i)); prev = i;
    });
    return '<nav class="igro-pagination ig-pager" aria-label="Страницы">' +
      '<button type="button" class="igro-pagination__cell igro-pagination__arrow" data-page="' + (cur - 1) + '"' + (cur === 1 ? ' disabled' : '') + ' aria-label="Предыдущая страница">' + ic('chevron-left', 20) + '</button>' +
      out.join('') +
      '<button type="button" class="igro-pagination__cell igro-pagination__arrow" data-page="' + (cur + 1) + '"' + (cur === pages ? ' disabled' : '') + ' aria-label="Следующая страница">' + ic('chevron-right', 20) + '</button></nav>';
  }
  function renderContent() {
    var el = document.getElementById('ig-content');
    /* раздел без товаров открыт по прямой ссылке — фильтры тут ни при чём */
    if (!scope.length) {
      el.innerHTML = '<div class="igro-empty ig-empty--block">' +
        '<div class="igro-empty__title">В разделе пока нет товаров</div>' +
        '<p class="igro-empty__text">Раздел есть в справочнике каталога, но товары в него ещё не размечены.</p></div>';
      return;
    }
    var list = sortItems(filtered(sel));
    if (!list.length) {
      el.innerHTML = '<div class="igro-empty ig-empty--block">' +
        '<div class="igro-empty__title">Ничего не найдено</div>' +
        '<p class="igro-empty__text">По выбранным фильтрам в разделе нет товаров. Снимите часть условий.</p>' +
        '<button type="button" class="igro-btn igro-btn--primary igro-empty__action" data-reset-all>Сбросить фильтры</button></div>';
      return;
    }
    var pages = Math.ceil(list.length / PER_PAGE);
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER_PAGE;
    var page = list.slice(start, start + PER_PAGE);
    el.innerHTML = '<div class="ig-grid">' + page.map(cardHTML).join('') + '</div>' + pagerHTML(pages);
    alignBrandlines();
  }
  /* строка «бренд · серия» занимает одну или две строки — в ряду карточек высота выравнивается по самой высокой,
     чтобы названия стояли на одной линии */
  function alignBrandlines() {
    var lines = Array.prototype.slice.call(document.querySelectorAll('.ig-card__brandline'));
    lines.forEach(function (l) { l.style.minHeight = ''; });
    var rows = {};
    lines.forEach(function (l) { var top = l.closest('.ig-card').offsetTop; (rows[top] = rows[top] || []).push(l); });
    Object.keys(rows).forEach(function (top) {
      var max = Math.max.apply(null, rows[top].map(function (l) { return l.offsetHeight; }));
      rows[top].forEach(function (l) { if (l.offsetHeight < max) l.style.minHeight = max + 'px'; });
    });
  }
  var alignQueued = false;
  window.addEventListener('resize', function () {
    if (alignQueued) return;
    alignQueued = true;
    requestAnimationFrame(function () { alignQueued = false; alignBrandlines(); });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignBrandlines);

  /* ---------- панель «Фильтры» ----------
     группы — Accordion ДС (свёрнутая группа показывает выбранное), значения — Checkbox ДС с настоящим
     input type="checkbox", наличие и новинки — Switch ДС (выключены: данных 1С нет) */
  var CHECK = '<svg class="igro-icon igro-checkbox__check" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function switchHTML(label) {
    return '<label class="igro-switch igro-switch--disabled ig-frow"><span>' + esc(label) + '</span>' +
      '<input type="checkbox" role="switch" class="igro-control-input" disabled>' +
      '<span class="igro-control-visual igro-switch__track" aria-hidden="true"><span class="igro-switch__knob"></span></span></label>';
  }
  function renderFilters() {
    var body = document.querySelector('#drawer-filters .ig-drawer__body');
    if (!body) return;
    var s = pending || sel;
    body.innerHTML = '<div class="igro-accordion">' + facets.map(function (f) {
      var cnts = countsFor(s, f.k), picked = s[f.k];
      /* бренды — по ID, страны и типы — по алфавиту; значения с нулём уходят в конец в том же порядке */
      var list = ORDER[f.k].filter(function (v) { return cnts[v] || picked.indexOf(v) > -1; })
        .concat(ORDER[f.k].filter(function (v) { return !cnts[v] && picked.indexOf(v) < 0; }));
      var limit = expanded[f.k] ? list.length : FACET_LIMIT;
      /* выбранное значение не должно прятаться под «Ещё N значений» */
      picked.forEach(function (v) { if (list.indexOf(v) >= limit) limit = list.length; });
      if (openFacets[f.k] === undefined && picked.length > 0) openFacets[f.k] = true;
      var open = !!openFacets[f.k];
      var rows = list.slice(0, limit).map(function (v) {
        var on = picked.indexOf(v) > -1, c = cnts[v] || 0, off = !c && !on;
        return '<label class="igro-checkbox ig-check' + (off ? ' igro-checkbox--disabled' : '') + '">' +
          '<input type="checkbox" class="igro-control-input" data-facet="' + f.k + '" data-val="' + esc(v) + '"' + (on ? ' checked' : '') + (off ? ' disabled' : '') + '>' +
          '<span class="igro-control-visual igro-checkbox__box" aria-hidden="true">' + CHECK + '</span>' +
          '<span class="igro-checkbox__text">' + esc(v) + '</span>' +
          '<span class="ig-check__count" aria-label="' + goods(c) + '">' + NUM(c) + '</span></label>';
      }).join('');
      var rest = list.length - limit;
      var pid = 'ig-facet-' + f.k;
      return '<div class="igro-accordion__item" data-facet-group="' + f.k + '">' +
        '<div class="igro-accordion__heading" role="heading" aria-level="3">' +
        '<button type="button" class="igro-accordion__trigger" id="' + pid + '-h" aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + pid + '">' +
        '<span class="igro-accordion__title">' + esc(f.title) + '</span>' +
        (!open && picked.length ? '<span class="igro-accordion__value">' + esc(picked.join(', ')) + '</span>' : '') +
        '<span class="igro-accordion__chevron">' + ic('chevron', 20) + '</span></button></div>' +
        '<div class="igro-accordion__panel" id="' + pid + '" role="region" aria-labelledby="' + pid + '-h"' + (open ? '' : ' hidden') + '>' + rows +
        (rest > 0 ? '<button type="button" class="ig-morelink" data-expand="' + f.k + '">Ещё ' + rest + ' ' + plural(rest, ['значение', 'значения', 'значений']) + '</button>' : '') +
        '</div></div>';
    }).join('') + '</div>' +
      /* наличие и новинки заложены в логику каталога, данные придут из 1С */
      '<div class="ig-soon">' + switchHTML('В наличии') + switchHTML('Новинки') +
      '<p class="ig-soon__note">Данные о наличии и новинках придут из 1С. В прототипе эти два фильтра не работают.</p>' +
      '</div>';
    var foot = document.querySelector('#drawer-filters [data-apply]');
    if (foot) foot.textContent = 'Показать ' + goods(filtered(s).length);
    var reset = document.querySelector('#drawer-filters [data-reset]');
    if (reset) reset.disabled = !anySelected(s);
  }

  function renderAll() { renderToolbar(); renderContent(); renderFilters(); }

  /* ---------- строки быстрых фильтров: не больше двух строк ----------
     прячем значения с конца, пока они вместе с «ещё (N)» не уложатся в две строки; выбранные значения не прячем */
  var techOpen = false;
  function lineCount(els) {
    var tops = [];
    els.forEach(function (el) {
      if (el.hidden) return;
      var t = el.offsetTop;
      if (!tops.some(function (x) { return Math.abs(x - t) < 4; })) tops.push(t);
    });
    return tops.length;
  }
  function clampRow(row, more, label) {
    var items = Array.prototype.slice.call(row.querySelectorAll('[data-facet]'));
    items.forEach(function (el) { el.hidden = false; });
    more.hidden = true;
    if (lineCount(items) <= QF_LINES) return;
    more.hidden = false;
    var hidden = 0;
    more.textContent = label(0);
    for (var i = items.length - 1; i >= 0 && lineCount(items.concat([more])) > QF_LINES; i--) {
      if (items[i].getAttribute('aria-pressed') === 'true') continue;
      items[i].hidden = true;
      hidden++;
      more.textContent = label(hidden);
    }
    more.setAttribute('aria-label', label(hidden).replace(/^ещё \((\d+)\)$/, 'Ещё $1 ' + (row.getAttribute('data-clamp') === 'y' ? 'типов продукта' : 'значений')));
  }
  function clampRows() {
    var types = document.querySelector('.ig-qf [data-clamp="y"]');
    if (types) clampRow(types, types.querySelector('.ig-tlink--more'), function (n) { return 'ещё (' + n + ')'; });
    var tech = document.querySelector('.ig-qf [data-clamp="t"]');
    if (tech) clampRow(tech, tech.querySelector('[data-tech-more]'), function (n) { return 'ещё (' + n + ')'; });
  }
  var clampQueued = false;
  window.addEventListener('resize', function () {
    if (clampQueued) return;
    clampQueued = true;
    requestAnimationFrame(function () { clampQueued = false; clampRows(); });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(clampRows);

  /* ---------- уведомления — ToastRegion ДС ----------
     одна стопка в правом нижнем углу; не больше трёх; на экране 6 с, при наведении и фокусе таймер стоит */
  var toastList = null;
  function toast(title, msg) {
    if (!toastList) {
      var region = document.createElement('div');
      region.className = 'igro-toast-region';
      region.innerHTML = '<ol class="igro-toast-region__list" aria-live="polite"></ol>';
      document.body.appendChild(region);
      toastList = region.firstChild;
    }
    var li = document.createElement('li');
    li.className = 'igro-toast-region__item';
    li.innerHTML = '<div class="igro-toast"><div class="igro-toast__body">' +
      '<div class="igro-toast__title">' + esc(title) + '</div><div class="igro-toast__message">' + esc(msg) + '</div></div>' +
      '<button type="button" class="igro-toast__close" aria-label="Закрыть">' + ic('close', 18) + '</button></div>';
    toastList.appendChild(li);
    while (toastList.children.length > 3) toastList.removeChild(toastList.firstChild);
    var left = 6000, started = 0, timer = null, holds = 0;
    function close() { clearTimeout(timer); if (li.parentNode) li.parentNode.removeChild(li); }
    function run() { started = Date.now(); timer = setTimeout(close, left); }
    function hold() { if (holds++ === 0) { clearTimeout(timer); left -= Date.now() - started; } }
    function release() { if (holds > 0 && --holds === 0) run(); }
    li.addEventListener('mouseenter', hold); li.addEventListener('mouseleave', release);
    li.addEventListener('focusin', hold); li.addEventListener('focusout', release);
    li.querySelector('.igro-toast__close').addEventListener('click', close);
    run();
  }

  /* картинка не загрузилась: сервис уменьшения не ответил — берём оригинал с сайта; нет и его — остаётся пустое поле */
  document.addEventListener('error', function (e) {
    var im = e.target;
    if (!im || !im.classList || !im.classList.contains('ig-card__img')) return;
    var full = im.getAttribute('data-full');
    if (full && im.getAttribute('src') !== full) { im.setAttribute('src', full); return; }
    if (im.parentNode) im.parentNode.classList.remove('ig-card__media--img');
    im.remove();
  }, true);

  /* ---------- взаимодействие ---------- */
  function toggle(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }
  function afterFilterChange() { state.page = 1; renderAll(); }
  /* после перерисовки возвращаем фокус на тот же элемент, иначе с клавиатуры каждый раз начинать сначала */
  function refocus(selector, val) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      if (val == null || els[i].getAttribute('data-val') === val) { els[i].focus({ preventScroll: true }); return; }
    }
  }
  function scrollToGrid() {
    var grid = document.querySelector('.ig-grid');
    var toolbar = document.querySelector('.ig-toolbar');
    if (!grid || !toolbar) return;
    var y = toolbar.getBoundingClientRect().top + window.pageYOffset - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function closeSortMenu() {
    document.querySelectorAll('.ig-sortmenu').forEach(function (m) { m.hidden = true; });
    document.querySelectorAll('[data-sortmenu]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }

  /* галочка в панели: правим копию состояния, применяется по «Показать» */
  document.addEventListener('change', function (e) {
    var box = e.target.closest && e.target.closest('.ig-drawer input[data-facet]');
    if (!box) return;
    var k = box.getAttribute('data-facet'), v = box.getAttribute('data-val');
    if (!pending) pending = clone(sel);
    toggle(pending[k], v);
    renderFilters();
    refocus('#drawer-filters input[data-facet="' + k + '"]', v);
  });

  document.addEventListener('click', function (e) {
    var t = e.target;

    /* быстрые фильтры — применяются сразу */
    var chip = t.closest('.ig-toolbar [data-facet]');
    if (chip) {
      var ck = chip.getAttribute('data-facet'), cv = chip.getAttribute('data-val');
      toggle(sel[ck], cv); afterFilterChange();
      refocus('.ig-toolbar [data-facet="' + ck + '"]', cv);
      return;
    }
    if (t.closest('[data-all-brands]')) { sel.g = []; afterFilterChange(); refocus('[data-all-brands]'); return; }
    /* технологии: «ещё (N)» раскрывает строку, «свернуть» — сворачивает до двух строк */
    if (t.closest('[data-tech-more]')) { techOpen = true; renderToolbar(); refocus('[data-tech-less]'); return; }
    if (t.closest('[data-tech-less]')) { techOpen = false; renderToolbar(); requestAnimationFrame(function () { refocus('[data-tech-more]'); }); return; }

    /* открытие панели: правим копию состояния; чип «Тип продукта» раскрывает свою группу целиком */
    var opener = t.closest('[data-open]');
    if (opener) {
      pending = clone(sel);
      var focus = opener.getAttribute('data-focus');
      if (focus) { openFacets[focus] = true; expanded[focus] = true; }
      renderFilters();
      return;
    }

    /* раскрытие групп фильтров живёт в состоянии, иначе оно терялось бы на каждой галочке */
    var accHead = t.closest('.ig-drawer .igro-accordion__trigger');
    if (accHead) {
      var key = accHead.closest('[data-facet-group]').getAttribute('data-facet-group');
      openFacets[key] = !openFacets[key];
      renderFilters();
      refocus('#drawer-filters [data-facet-group="' + key + '"] .igro-accordion__trigger');
      return;
    }
    var expand = t.closest('[data-expand]');
    if (expand) {
      var ek = expand.getAttribute('data-expand');
      expanded[ek] = true; openFacets[ek] = true; renderFilters();
      /* фокус — на первое из только что показанных значений */
      var rows = document.querySelectorAll('#drawer-filters input[data-facet="' + ek + '"]');
      if (rows[FACET_LIMIT]) rows[FACET_LIMIT].focus({ preventScroll: true });
      return;
    }

    /* «Показать» — применяем выбор */
    if (t.closest('[data-apply]')) {
      if (pending) sel = clone(pending);
      pending = null;
      afterFilterChange(); return;
    }
    /* «Сбросить» — снимает все фильтры сразу и закрывает панель */
    if (t.closest('[data-reset]')) { resetAll(); afterFilterChange(); return; }
    /* закрытие панели без «Показать» — выбор в панели не применяется */
    if (t.closest('[data-close]')) { pending = null; renderFilters(); return; }

    if (t.closest('[data-reset-all]')) { resetAll(); afterFilterChange(); refocus('.ig-filters-btn'); return; }

    /* сортировка */
    var sortBtn = t.closest('[data-sortmenu]');
    if (sortBtn) {
      var menu = sortBtn.parentNode.querySelector('.ig-sortmenu');
      menu.hidden = !menu.hidden;
      sortBtn.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
      return;
    }
    var sortItem = t.closest('[data-sort]');
    if (sortItem) { state.sort = sortItem.getAttribute('data-sort'); state.page = 1; renderAll(); refocus('[data-sortmenu]'); return; }
    if (!t.closest('.ig-sortwrap')) closeSortMenu();

    /* корзина в шапке — страницы корзины в прототипе нет, показываем, что в ней */
    if (t.closest('[data-cart]')) {
      var ct = cartTotals();
      toast('Корзина', ct.n
        ? 'В корзине ' + goods(ct.n) + ' на ' + rub(ct.sum) + '. Страница корзины в прототип не входит.'
        : 'Корзина пуста. Добавьте товар кнопкой «В корзину» в карточке.');
      return;
    }
    if (t.closest('[data-cart-clear]')) { window.IG_CART.clear(); return; }

    /* «Узнать проф. цену» — входа и регистрации в прототипе нет, поясняем, как это работает на сайте */
    /* бренд или линия в карточке — фильтр по ним на текущей странице, список — с начала */
    var cb = t.closest('[data-card-brand]');
    if (cb) {
      sel.g = [cb.getAttribute('data-card-brand')]; sel.l = [];
      afterFilterChange(); scrollToGrid();
      return;
    }
    var cline = t.closest('[data-card-line]');
    if (cline) {
      sel.g = [cline.getAttribute('data-card-line-brand')]; sel.l = [cline.getAttribute('data-card-line')];
      afterFilterChange(); scrollToGrid();
      return;
    }
    /* картинка или название — переход в карточку товара; в прототипе её нет */
    var prod = t.closest('[data-product]');
    if (prod) {
      e.preventDefault();
      var pc = prod.closest('.ig-card');
      var pn = pc && pc.querySelector('.ig-card__name');
      toast('Карточка товара', 'Здесь откроется страница товара' + (pn ? ' «' + pn.textContent + '»' : '') + '. В прототипе её нет.');
      return;
    }
    if (t.closest('[data-pro-price]')) {
      toast('Профессиональная цена', 'Профессиональные цены видны после регистрации на сайте. Вход и регистрация в прототип не входят.');
      return;
    }

    /* у продукта несколько вариантов — выбор в карточке товара */
    if (t.closest('[data-variants]')) {
      toast('Выбор варианта', 'Оттенок, объём или размер выбирают в карточке товара. В этот прототип она не входит.');
      return;
    }

    /* страницы */
    var pg = t.closest('[data-page]');
    if (pg && !pg.disabled) {
      state.page = parseInt(pg.getAttribute('data-page'), 10) || 1;
      renderContent(); scrollToGrid();
      refocus('.igro-pagination__page[aria-current="page"]');
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    /* меню сортировки, как Menu ДС: ↑/↓ и Home/End двигают фокус по пунктам */
    var item = e.target.closest && e.target.closest('.ig-sortmenu [role="menuitem"]');
    if (item && /^(ArrowDown|ArrowUp|Home|End)$/.test(e.key)) {
      var items = Array.prototype.slice.call(item.parentNode.querySelectorAll('[role="menuitem"]'));
      var i = items.indexOf(item);
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next].focus();
      e.preventDefault();
      return;
    }
    var trigger = e.target.closest && e.target.closest('[data-sortmenu]');
    if (trigger && e.key === 'ArrowDown') {
      var m = trigger.parentNode.querySelector('.ig-sortmenu');
      m.hidden = false; trigger.setAttribute('aria-expanded', 'true');
      var first = m.querySelector('[aria-current="true"]') || m.querySelector('[role="menuitem"]');
      if (first) first.focus();
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      /* Esc закрывает меню сортировки и панель без применения */
      var openMenu = document.querySelector('.ig-sortmenu:not([hidden])');
      if (openMenu) { closeSortMenu(); refocus('[data-sortmenu]'); }
      if (pending) { pending = null; renderFilters(); }
    }
  });

  renderAll();
  renderCart();
})();
