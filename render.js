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
  /* тёмные фоны шапки – на них шапка сайта в варианте для тёмного фона (светлый логотип, белый текст);
     по замеру контраста 19.10 тёмный только «Мужской уход» */
  var HERO_DARK = ['hair-muzhskoy-uhod'];
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
  /* затемнение фото: по умолчанию круговой градиент с белым кругом до половины радиуса;
     ?shade=soft – градиент от самого центра, ?shade=flat – прежнее ровное (сравнение, 23.10) */
  if (/^(soft|flat)$/.test(params.get('shade') || '')) document.body.classList.add('ig-shade-' + params.get('shade'));
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
        cards.push({ key: 's' + s[0], i: i, k: p.k, d: p.d, g: p.g, l: p.l || '', n: p.n, y: p.y, a: p.a || [], img: p.img || '', x: s[2] || p.x, f: p.f, vc: p.vc, r: PRICE, multi: false, arts: [s[0]], desc: s[1] });
      });
      return;
    }
    /* несколько вариантов (объём, оттенок, размер) — выбор в карточке товара, а не в списке.
       Вариант — артикул без префикса «МТ»: пара «с МТ и без» остаётся одним товаром.
       sh — число оттенков у красителей: в карточке пишется «N оттенков» вместо «N вариантов» */
    cards.push({
      key: 'p' + p.k, i: i, k: p.k, d: p.d, g: p.g, l: p.l || '', n: p.n, y: p.y, a: p.a || [], img: p.img || '', x: p.x, f: p.f, vc: p.vc,
      r: PRICE, multi: p.vc > 1, sh: p.sh || 0, vo: p.vo,
      arts: p.v.map(function (s) { return s[0]; })
    });
  });

  var cardByKey = Object.create(null);
  cards.forEach(function (c) { cardByKey[c.key] = c; });

  /* ---------- раскрытый продукт (23.10, design-lab) ----------
     «Выбрать», картинка или название стопки раскрывают продукт: вместо его карточки в списке – карточки товаров
     (вариантов), в чипах – фильтры бренда, линии и продукта. Продукт = бренд + линия + «Продукт» («Свод 22»,
     документ «Продуктовая модель»). Пара артикулов «с МТ и без» – один товар; картинка – своя у артикула
     (p.vi), если её нет – картинка продукта. Подпись товара – атрибуты, которыми варианты различаются, и объём */
  var itemByK = Object.create(null);
  D.items.forEach(function (p, i) { itemByK[p.k] = i; });
  var variantCache = Object.create(null);
  function variantsOf(k) {
    if (variantCache[k]) return variantCache[k];
    var i = itemByK[k], p = D.items[i], seen = Object.create(null), out = [];
    if (p) p.v.forEach(function (s, j) {
      var b = s[0].replace(/^МТ/, ''), img = (p.vi && p.vi[j]) || '';
      if (seen[b]) { if (!seen[b].ownImg && img) { seen[b].img = img; seen[b].ownImg = true; } return; }
      var c = { key: 's' + s[0], i: i, j: out.length, k: p.k, d: p.d, g: p.g, l: p.l || '', n: p.n, y: p.y, a: p.a || [],
        img: img || p.img || '', ownImg: !!img, x: s[2] || p.x, f: p.f, vc: 1, r: PRICE, multi: false, arts: [s[0]], desc: s[1] };
      seen[b] = c; out.push(c); cardByKey[c.key] = c;
    });
    return (variantCache[k] = out);
  }

  /* ---------- переключатели в карточке продукта (26.10, design-lab) ----------
     Если товары продукта различаются только окислением, размером и объёмом (p.vo в data.js – 226 продуктов),
     выбор – прямо в карточке списка: выпадающие списки признаков в одну строку, без подписей (26.10, вместо чипов –
     карточка не растёт в высоту); фото и «В корзину» – выбранного товара. Все товары продукта уже в карточке
     (блоки покупки каждого – скрытые панели), поэтому при переключении количество в счётчике не сбрасывается.
     Оттенки и цвета выбирают внутри продукта (клик по карточке). Значение, которого нет с остальным выбором, в списке
     серое, но выбирается: подставляется ближайший товар с этим значением (другой объём или процент) */
  var OPT_T = { ox: 'Окисление', size: 'Размер', vol: 'Объём' };
  var OPT_W = { ox: ['вид', 'вида', 'видов'], size: ['размер', 'размера', 'размеров'], vol: ['объём', 'объёма', 'объёмов'] };
  var SIZE_ORDER = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, XXXL: 7 };
  function optNum(s) {
    if (SIZE_ORDER[s] !== undefined) return SIZE_ORDER[s];
    var m = /(\d+(?:[.,]\d+)?)/.exec(s);
    return m ? parseFloat(m[1].replace(',', '.')) : 1e9;
  }
  var optCache = Object.create(null);
  function optsOf(c) {
    if (optCache[c.k]) return optCache[c.k];
    var p = D.items[itemByK[c.k]], vars = variantsOf(c.k), at = Object.create(null);
    p.v.forEach(function (s, j) { at[s[0]] = j; });
    var keys = Object.keys(p.vo);
    vars.forEach(function (v) {
      var j = at[v.arts[0]];
      v.o = {};
      keys.forEach(function (d) { v.o[d] = p.vo[d][j]; });
    });
    var dims = keys.map(function (d) {
      var vals = [];
      vars.forEach(function (v) { if (vals.indexOf(v.o[d]) < 0) vals.push(v.o[d]); });
      vals.sort(function (a, b) { return optNum(a) - optNum(b) || a.localeCompare(b, 'ru'); });
      return { k: d, t: OPT_T[d], vals: vals };
    });
    var sorted = vars.slice().sort(function (a, b) {
      for (var i = 0; i < dims.length; i++) {
        var x = dims[i].vals.indexOf(a.o[dims[i].k]) - dims[i].vals.indexOf(b.o[dims[i].k]);
        if (x) return x;
      }
      return 0;
    });
    return (optCache[c.k] = { dims: dims, vars: sorted });
  }
  /* выбранный товар продукта – переживает перерисовку списка (фильтры, страницы) */
  var optSel = Object.create(null);
  function optCurrent(c) {
    var o = optsOf(c), v = optSel[c.key] && cardByKey[optSel[c.key]];
    if (v) return v;
    v = o.vars.filter(function (x) { return x.ownImg; })[0] || o.vars[0];
    optSel[c.key] = v.key;
    return v;
  }
  function optFind(c, attrs) {
    return optsOf(c).vars.filter(function (v) {
      for (var d in attrs) if (v.o[d] !== attrs[d]) return false;
      return true;
    })[0];
  }
  /* ---------- корзина (имитация) ----------
     «В корзину» и счётчик в карточке меняют корзину, в шапке — кружок с числом товаров и сумма.
     Корзина хранится в localStorage этого браузера: переживает переход между разделами и обновление страницы.
     Ключ товара — номер продукта (в режиме «по артикулам» — артикул). Страницы корзины в прототипе нет.
     Ключ хранилища сменён 13.10.2026 после пересборки по «Своду 18»: номера продуктов сдвинулись */
  /* 21.10: ключ ветки design-lab сменён – корзина очищена по просьбе (0 товаров), v6 своей корзины не теряет.
     23.10 (данные из «Свода 22»): ключ товара в лабе – постоянный код продукта p.k (или артикул варианта),
     а не номер в списке – корзина и избранное переживают пересборку данных */
  var CART_KEY = 'ig-catalog-v6-lab-cart-k';
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
    /* добавить n шт. к тому, что уже в корзине (новая карточка: «В корзину» и кнопка корзины у счётчика) */
    add: function (key, n, price) {
      if (!key || n < 1) return 0;
      cart[key] = { q: cartQty(key) + n, r: price };
      cartSave(); renderCart();
      return cart[key].q;
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
    if (k === 'p') return [p.k];
    return [];
  }
  /* l — линия: включается кликом по линии в карточке, в панели «Фильтры» её нет */
  function lineKey(p) { return p.g + ' · ' + p.l; }
  /* p — продукт (раскрытый кнопкой «Выбрать»): в чипах, в панели «Фильтры» его нет */
  var KEYS = ['g', 'c', 'y', 'a', 'l', 't', 'p'];
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
  /* выбран продукт – список из его товаров (вариантов), иначе – карточки раздела */
  function pool(s, skip) {
    if (!s.p || !s.p.length || (skip && skip.p)) return scope;
    var out = [];
    s.p.forEach(function (k) { out = out.concat(variantsOf(k)); });
    return out;
  }
  function filtered(s, skip) { return pool(s, skip).filter(function (p) { return matches(p, s, skip); }); }
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
                  g.links.map(function (l) { return '<li><a href="' + link(l.href) + '"><span>' + esc(l.t) + '</span></a></li>'; }).join('') + '</ul>' : '') +
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
    var tex = HERO_TEX.indexOf(texId) > -1 ? 'assets/hero-tall/' + texId + '.jpg' : '';
    html = '<section class="ig-hero' + (tex ? ' ig-hero--tex' : '') + (tex && HERO_DARK.indexOf(texId) > -1 ? ' ig-hero--dark' : '') + '"' + (tex ? ' style="--hero-tex: url(&quot;' + tex + '&quot;)"' : '') + '><div class="ig-container">' + crumbsHTML() +
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
  html += '<section class="ig-toolbar"><div class="ig-toolbar__panel" data-tbpanel><div class="ig-container">' +
    '<div class="ig-toolbar__row" id="ig-tb"></div><div id="ig-qf"></div></div></div></section>' +
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
    var KIND = { set: ', собрана по полю «Тип продукта» = «Набор»', spf: ', собрана по полю «Наличие SPF» = «SPF»' };
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
  /* подпись чипа или ссылки с запасом ширины под полужирное выбранное состояние: рядом невидимая полужирная копия
     в той же ячейке сетки – при выборе ширина не меняется и строка не дёргается (замечание 21.10) */
  function tw(t) { return '<span class="ig-tw" data-t="' + esc(t) + '">' + esc(t) + '</span>'; }
  function chipHTML(k, v, on) {
    var medal = k === 'g' && brandType(v) === 'ex';
    return '<button type="button" class="igro-tag igro-tag--interactive' + (medal ? ' ig-tag-hit' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" data-facet="' + k + '" data-val="' + esc(v) + '">' +
      tw(v) + (medal ? MEDAL : '') + '</button>';
  }
  function removableTag(k, v, label, cls) {
    return '<span class="igro-tag igro-tag--selected igro-tag--removable' + (cls ? ' ' + cls : '') + '"' + (cls ? ' title="' + esc(label) + '"' : '') + '>' +
      (cls ? '<span class="' + cls + '__t">' + esc(label) + '</span>' : esc(label)) +
      '<button type="button" class="igro-tag__remove" data-facet="' + k + '" data-val="' + esc(v) + '" aria-label="Убрать фильтр: ' + esc(label) + '">' + ic('close', 16) + '</button></span>';
  }
  /* значения, которые при текущих фильтрах дают хотя бы один товар (выбранное остаётся всегда) */
  function available(k) {
    var cnts = countsFor(sel, k), picked = sel[k];
    return ORDER[k].filter(function (v) { return (cnts[v] || 0) > 0 || picked.indexOf(v) > -1; });
  }

  /* «Фильтры» одной ширины с числом и без: ширина измеряется один раз с «· 0» и закрепляется;
     пока фильтров нет, числа нет, а иконка и слово стоят по центру этой ширины (21.10) */
  var filtersBtnW = 0;
  function fixFiltersBtn() {
    var fb = document.querySelector('.ig-filters-btn');
    if (!fb) return;
    if (!filtersBtnW) {
      fb.classList.add('is-measure');
      filtersBtnW = Math.ceil(fb.getBoundingClientRect().width);
      fb.classList.remove('is-measure');
    }
    fb.style.minWidth = filtersBtnW + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { filtersBtnW = 0; fixFiltersBtn(); });
  function renderToolbar() {
    /* счётчик у сортировки – сколько всего товаров в разделе; от выбранных фильтров не зависит (решение 20.10.2026) */
    /* v6-lab, 23.10: число у сортировки – сколько товаров после фильтров (в v6 – всего в разделе) */
    var total = filtered(sel).length;
    var n = panelSelected(sel);
    /* «Фильтры» — Button sm: ghost, а когда в панели что-то выбрано — dark */
    var left = '<button type="button" class="igro-btn igro-btn--sm ' + (n ? 'igro-btn--dark' : 'igro-btn--ghost') + ' ig-filters-btn" data-open="filters" aria-haspopup="dialog">' +
      ic('filter', 18) + 'Фильтры<span class="ig-btn__num' + (n ? '' : ' is-empty') + '"' + (n ? '' : ' aria-hidden="true"') + '>· ' + (n || 0) + '</span></button>';

    /* ключевые бренды раздела. Чипа «Все бренды» нет (26.10): все бренды – когда ни один чип бренда не выбран */
    if (soleBrand) {
      var sb = keyBrands[0], sm = brandType(sb) === 'ex';
      left += '<span class="igro-tag igro-tag--selected' + (sm ? ' ig-tag-hit' : '') + '">' + esc(sb) + (sm ? MEDAL : '') + '</span>';
    } else if (keyBrands.length) {
      var ab = available('g');
      keyBrands.forEach(function (b) {
        if (ab.indexOf(b) > -1) left += chipHTML('g', b, sel.g.indexOf(b) > -1);
      });
    }
    /* бренд без своего чипа (не ключевой) и линия, выбранные кликом в карточке, — чипами с крестиком (Tag ДС, removable) */
    sel.g.forEach(function (b) { if (keyBrands.indexOf(b) < 0) left += removableTag('g', b, b); });
    sel.l.forEach(function (v) { left += removableTag('l', v, 'Линия: ' + v.split(' · ').slice(1).join(' · ')); });
    /* раскрытый продукт – чип с названием; длинное обрезается многоточием, целиком – во всплывающей подсказке */
    sel.p.forEach(function (k) { var it = D.items[itemByK[k]]; if (it) left += removableTag('p', k, it.n, 'ig-tag-product'); });

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
    fixFiltersBtn();

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
        return '<button type="button" class="ig-tlink" aria-pressed="' + (on ? 'true' : 'false') + '" data-facet="y" data-val="' + esc(v) + '" data-t="' + esc(v) + '">' + esc(v) + '</button>';
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
  /* иконки новой карточки — из макета Figma 2740:3615, цвет — currentColor */
  var SVG = {
    heart: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M14.25 10.5C15.3675 9.405 16.5 8.0925 16.5 6.375C16.5 5.28098 16.0654 4.23177 15.2918 3.45818C14.5182 2.68459 13.469 2.25 12.375 2.25C11.055 2.25 10.125 2.625 9 3.75C7.875 2.625 6.945 2.25 5.625 2.25C4.53098 2.25 3.48177 2.68459 2.70818 3.45818C1.93459 4.23177 1.5 5.28098 1.5 6.375C1.5 8.1 2.625 9.4125 3.75 10.5L9 15.75L14.25 10.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cart: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4.5 1.5L2.25 4.5V15C2.25 15.3978 2.40803 15.7793 2.68934 16.0606C2.97064 16.342 3.35218 16.5 3.75 16.5H14.25C14.6478 16.5 15.0293 16.342 15.3106 16.0606C15.592 15.7793 15.75 15.3978 15.75 15V4.5L13.5 1.5H4.5Z M2.25 4.5H15.75 M12 7.5C12 8.29567 11.6839 9.05872 11.1213 9.6213C10.5587 10.1839 9.79568 10.5 9 10.5C8.20432 10.5 7.44129 10.1839 6.87868 9.6213C6.31607 9.05872 6 8.29567 6 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    /* корзина с плюсом – на квадратной кнопке раскрытого блока (Figma 2755:464, «add-to-cart») */
    cartAdd: '<svg class="ig-card__buyicon-add" viewBox="0 0 21.1631 21.835" fill="none" aria-hidden="true"><path d="M3.66309 10.8327V4.99935L6.16309 1.66602H16.1631L18.6631 4.99935V16.666C18.6631 17.108 18.4875 17.5319 18.1749 17.8445C17.8623 18.1571 17.4384 18.3327 16.9964 18.3327H11.1631 M3.66309 5H18.6631 M14.4958 8.33398C14.4958 9.21807 14.1446 10.0659 13.5194 10.691C12.8944 11.3162 12.0465 11.6673 11.1624 11.6673C10.2784 11.6673 9.43053 11.3162 8.80541 10.691C8.18029 10.0659 7.8291 9.21807 7.8291 8.33398" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path fill="currentColor" d="M3.99902 13.8369C4.46018 13.8369 4.83398 14.2107 4.83398 14.6719V17.001H7.16309C7.62424 17.001 7.99805 17.3748 7.99805 17.8359C7.99805 18.2971 7.62424 18.6709 7.16309 18.6709H4.83398V21C4.83398 21.4612 4.46018 21.835 3.99902 21.835C3.53787 21.835 3.16406 21.4612 3.16406 21V18.6709H0.834961C0.373803 18.6709 0 18.2971 0 17.8359C0 17.3748 0.373803 17.001 0.834961 17.001H3.16406V14.6719C3.16406 14.2107 3.53787 13.8369 3.99902 13.8369Z"/></svg>',
    chevron: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M6.65 4.9L11.15 9.4L6.65 13.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    minus: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3.75 9H14.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 12.59V10c0-3.22-2.18-5.93-5.14-6.74A1.99 1.99 0 0 0 12 2c-.85 0-1.56.52-1.86 1.26C7.18 4.08 5 6.79 5 10v2.59L3.29 14.3a1 1 0 0 0-.29.71v2c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-2c0-.27-.11-.52-.29-.71L19 12.59ZM19 16H5v-.59l1.71-1.71A1 1 0 0 0 7 12.99V10c0-2.76 2.24-5 5-5s5 2.24 5 5v3c0 .27.11.52.29.71L19 15.41V16ZM5.64 3.3 4.23 1.89A10.94 10.94 0 0 0 1 9.67h2c0-2.4.94-4.66 2.64-6.36V3.3Zm12.72 0C20.06 5 21 7.26 21 9.66h2c0-2.94-1.14-5.7-3.22-7.78l-1.41 1.41-.01.01ZM12 22c1.31 0 2.41-.83 2.82-2H9.18c.41 1.17 1.51 2 2.82 2Z"/></svg>'
  };
  /* избранное (имитация) — в localStorage этого браузера */
  var FAV_KEY = 'ig-catalog-v6-lab-fav-k';   /* 23.10: ключ – постоянный код продукта */
  var fav = {};
  try { fav = JSON.parse(localStorage.getItem(FAV_KEY) || '{}') || {}; } catch (e) { fav = {}; }
  function favSave() { try { localStorage.setItem(FAV_KEY, JSON.stringify(fav)); } catch (e) {} }
  /* «нет в наличии»: данных о наличии в справочнике нет. Чтобы состояние из макета было видно, в прототипе
     нет в наличии каждый 12-й товар с одним вариантом (демонстрация; ?stock=all — все в наличии) */
  var STOCK_DEMO = new URLSearchParams(location.search).get('stock') !== 'all';
  function isOut(p) { return !!p.out || (STOCK_DEMO && !p.multi && (p.j === undefined ? p.i : p.j) % 12 === 7); }
  /* «В корзину» и счётчик — один блок: кнопка не заменяется, а превращается (сжимается в квадрат справа,
     темнеет, надпись гаснет), на освободившемся месте проявляется счётчик. Счётчик вне открытого блока — inert */
  function buyHTML(name) {
    return '<div class="ig-card__buy" data-buy>' +
      '<div class="ig-card__qty" role="group" aria-label="Количество" inert>' +
      '<button type="button" class="ig-card__qty-btn" data-qty="-1" aria-label="Меньше">' + SVG.minus + '</button>' +
      '<input class="ig-card__qty-in" type="text" inputmode="numeric" maxlength="3" value="1" aria-label="Количество: ' + esc(name) + '">' +
      '<button type="button" class="ig-card__qty-btn" data-qty="1" aria-label="Больше">' + SVG.plus + '</button></div>' +
      '<button type="button" class="ig-card__buybtn" data-buy-btn aria-label="В корзину: ' + esc(name) + '">' +
      '<span class="ig-card__buyicon">' + SVG.cart + SVG.cartAdd + '</span><span class="ig-card__buylabel">В корзину</span></button></div>';
  }
  /* выпадающие списки признаков (Menu ДС) и скрытые блоки покупки всех товаров продукта */
  function optItemsHTML(p, d, cur) {
    return d.vals.map(function (val) {
      var want = {}; for (var k in cur.o) want[k] = cur.o[k]; want[d.k] = val;
      var on = cur.o[d.k] === val, off = !optFind(p, want);
      return '<button type="button" class="igro-menu__item ig-card__dd-item' + (off ? ' is-off' : '') + '" role="option" aria-selected="' + on + '"' +
        (on ? ' aria-current="true"' : '') + ' data-opt="' + d.k + '" data-val="' + esc(val) + '"' +
        (off ? ' title="С текущим выбором такого товара нет – подставится ближайший"' : '') + '>' + esc(val) + '</button>';
    }).join('');
  }
  function optHTML(p, cur) {
    return '<div class="ig-card__opts">' + optsOf(p).dims.map(function (d) {
      return '<div class="ig-card__dd" data-dd="' + d.k + '">' +
        '<button type="button" class="ig-card__dd-btn" data-dd-btn aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(d.t) + ': ' + esc(cur.o[d.k]) + '">' +
        '<span data-opt-cur="' + d.k + '">' + esc(cur.o[d.k]) + '</span>' + ic('chevron', 16) + '</button>' +
        '<div class="igro-menu ig-card__dd-menu" role="listbox" aria-label="' + esc(d.t) + '" hidden>' + optItemsHTML(p, d, cur) + '</div></div>';
    }).join('') + '</div>';
  }
  function optPanesHTML(p, cur) {
    return optsOf(p).vars.map(function (v) {
      var label = p.n + ', ' + v.desc;
      return '<div class="ig-card__pane" data-vkey="' + esc(v.key) + '"' + (v.key === cur.key ? '' : ' hidden') + '>' +
        (isOut(v)
          ? '<div class="ig-card__split"><div class="ig-card__nostock">' + SVG.close + 'нет в наличии</div>' +
            '<button type="button" class="ig-card__sq ig-card__sq--bell" data-notify aria-label="Сообщить о поступлении: ' + esc(label) + '">' + SVG.bell + '</button></div>'
          : buyHTML(label)) + '</div>';
    }).join('');
  }
  function cardHTML(p) {
    var opt = p.multi && p.vo ? optCurrent(p) : null;
    /* у продукта с вариантами — «стопка» и плашка с числом оттенков или вариантов */
    var badge = p.multi ? (p.sh ? NUM(p.sh) + ' ' + plural(p.sh, ['оттенок', 'оттенка', 'оттенков'])
      : NUM(p.vc) + ' ' + plural(p.vc, ['вариант', 'варианта', 'вариантов'])) : '';
    var img = opt ? opt.img : p.img;
    var controls = opt ? optPanesHTML(p, opt) : p.multi
      ? '<button type="button" class="ig-card__btn" data-variants aria-label="Выбрать: ' + esc(p.n) + '">Выбрать' + SVG.chevron + '</button>'
      : isOut(p)
        ? '<div class="ig-card__split"><div class="ig-card__nostock">' + SVG.close + 'нет в наличии</div>' +
          '<button type="button" class="ig-card__sq ig-card__sq--bell" data-notify aria-label="Сообщить о поступлении: ' + esc(p.n) + '">' + SVG.bell + '</button></div>'
        : buyHTML(p.n);
    var faved = !!fav[p.key];
    /* ig-card--variant – товар внутри раскрытого продукта (у всех одно название, различает подпись) */
    return '<article class="ig-card' + (p.multi ? ' ig-card--stack' : '') + (opt ? ' ig-card--opts' : '') + (p.j !== undefined && p.desc ? ' ig-card--variant' : '') + '" data-key="' + esc(p.key) + '">' +
      /* картинка и название ведут в карточку товара (в прототипе её нет — подсказка); с клавиатуры — через название */
      '<div class="ig-card__media' + (img ? ' ig-card__media--img' : '') + '" data-product aria-hidden="true">' +
      (img ? '<img class="ig-card__img" src="' + esc(imgThumb(img)) + '" data-full="' + esc(imgFull(img)) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : '') +
      '</div>' +
      (badge ? '<span class="ig-card__badge">' + esc(badge) + '</span>'
        : '<button type="button" class="ig-card__fav" data-fav aria-pressed="' + faved + '" aria-label="В избранное: ' + esc(p.n) + '">' + SVG.heart + '</button>') +
      /* бренд и линия — кнопки-фильтры; в одной строке через «·», не помещаются — линия на новой строке без точки */
      '<div class="ig-card__brandrow"><button type="button" class="ig-card__brand" data-card-brand="' + esc(p.g) + '" title="Все товары бренда в разделе">' + esc(p.g) + '</button>' +
      (p.l ? '<button type="button" class="ig-card__line" data-card-line="' + esc(lineKey(p)) + '" data-card-line-brand="' + esc(p.g) + '" title="Все товары линии «' + esc(p.l) + '» в разделе">' + esc(p.l) + '</button>' : '') + '</div>' +
      '<div class="ig-card__name" title="' + esc(p.n) + '"><a class="ig-card__link" href="#" data-product>' + soft(p.n) + '</a></div>' +
      (p.desc ? '<div class="ig-card__desc">' + esc(p.desc) + '</div>' : '') +
      (opt ? optHTML(p, opt) : '') +
      /* цена: слева цена и «Розничная цена» (вправо), справа «Узнать проф. цену» (влево) — макет 2740:3615 */
      '<div class="ig-card__price"><div class="ig-card__price-l">' +
      '<span class="ig-card__price-v" data-unit="' + p.r + '">' + esc(rub(p.r)) + '</span>' +
      '<span class="ig-card__price-n">Розничная цена</span></div>' +
      '<button type="button" class="ig-card__pro" data-pro-price>Узнать<br>проф.&nbsp;цену</button></div>' +
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
  /* бренд и линия в одной строке через «·»; если линия ушла на новую строку — без точки и на всю ширину
     (is-wrapped). Перенос виден только после раскладки — проверяется после отрисовки, при смене ширины, после шрифтов */
  function alignBrandlines() {
    document.querySelectorAll('.ig-card__brandrow').forEach(function (row) {
      var line = row.querySelector('.ig-card__line');
      row.classList.remove('is-wrapped');
      if (line && line.offsetTop > row.firstElementChild.offsetTop + 2) row.classList.add('is-wrapped');
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
  /* бренды – одна строка (26.10): не помещаются – с конца прячутся невыбранные чипы брендов. Выбранные бренды
     и чипы с крестиком (линия, продукт, бренд без своего чипа) видны всегда */
  function clampBrands() {
    var left = document.querySelector('.ig-toolbar__left');
    if (!left || !left.firstElementChild) return;
    var chips = Array.prototype.slice.call(left.querySelectorAll(':scope > .igro-tag[data-facet="g"]'));
    chips.forEach(function (c) { c.hidden = false; });
    var top = left.firstElementChild.offsetTop;
    function wrapped() {
      for (var i = 0; i < left.children.length; i++) {
        var el = left.children[i];
        if (!el.hidden && el.offsetTop > top + 2) return true;
      }
      return false;
    }
    for (var i = chips.length - 1; i >= 0 && wrapped(); i--) {
      if (chips[i].getAttribute('aria-pressed') !== 'true') chips[i].hidden = true;
    }
  }
  function clampRows() {
    clampBrands();
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
  /* раскрыть или свернуть блок покупки; фокус — туда, где продолжит работу пользователь */
  function setBuy(buy, open) {
    var qty = buy.querySelector('.ig-card__qty'), btn = buy.querySelector('[data-buy-btn]');
    var name = (btn.getAttribute('aria-label') || '').replace(/^[^:]*:\s*/, '');
    buy.classList.toggle('is-open', open);
    if (open) {
      qty.removeAttribute('inert');
      btn.setAttribute('aria-label', 'Добавить в корзину: ' + name);
      var plus = qty.querySelector('[data-qty="1"]');
      if (plus) plus.focus({ preventScroll: true });
    } else {
      qty.setAttribute('inert', '');
      qty.querySelector('.ig-card__qty-in').value = 1;
      btn.setAttribute('aria-label', 'В корзину: ' + name);
      btn.focus({ preventScroll: true });
    }
  }
  /* иконка корзины коротко «подпрыгивает», когда добавили ещё */
  function bump(el) {
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || !el.animate || calm) return;
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) translateY(-2px)' }, { transform: 'scale(1)' }],
      { duration: 224, easing: 'cubic-bezier(0.32, 1.6, 0.6, 1)' });
  }
  var notifyBack = null;
  function closeNotify() {
    var s = document.querySelector('.ig-notify');
    if (s) s.remove();
    document.documentElement.classList.remove('igro-scroll-locked');
    if (notifyBack) { notifyBack.focus({ preventScroll: true }); notifyBack = null; }
  }
  function openNotify(name, back) {
    notifyBack = back;
    var s = document.createElement('div');
    s.className = 'igro-dialog-scrim ig-notify';
    s.innerHTML = '<div class="igro-dialog" role="dialog" aria-modal="true" aria-labelledby="ig-notify-t" tabindex="-1">' +
      '<div class="igro-dialog__head"><div class="igro-dialog__titles"><h2 class="igro-dialog__title" id="ig-notify-t">Сообщить о поступлении</h2>' +
      '<div class="igro-dialog__subtitle">Пришлём письмо, когда товар появится на складе</div></div>' +
      '<button type="button" class="igro-dialog__close" data-notify-close aria-label="Закрыть">' + SVG.close + '</button></div>' +
      '<div class="igro-dialog__body"><p class="ig-notify__product">' + esc(name) + '</p>' +
      '<form data-notify-form novalidate><div class="igro-field"><div class="igro-field__control">' +
      '<input class="igro-field__input" id="ig-notify-mail" type="email" placeholder=" " autocomplete="email" required>' +
      '<label class="igro-field__label" for="ig-notify-mail">Электронная почта</label></div>' +
      '<div class="igro-field__hint" data-notify-hint>Только для этого уведомления</div></div>' +
      '<div class="ig-notify__foot"><button type="submit" class="igro-btn igro-btn--primary igro-btn--lg">Сообщить</button>' +
      '<button type="button" class="igro-btn igro-btn--secondary igro-btn--lg" data-notify-close>Отмена</button></div></form></div></div>';
    document.body.appendChild(s);
    document.documentElement.classList.add('igro-scroll-locked');
    s.querySelector('input').focus();
    s.addEventListener('click', function (e) {
      if (e.target === s || e.target.closest('[data-notify-close]')) closeNotify();
    });
    s.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNotify(); });
    s.querySelector('[data-notify-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = s.querySelector('input');
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
      var field = inp.closest('.igro-field');
      inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
      field.classList.toggle('igro-field--invalid', !ok);
      s.querySelector('[data-notify-hint]').textContent = ok ? 'Только для этого уведомления' : 'Проверьте адрес почты';
      if (!ok) { inp.focus(); return; }
      closeNotify();
      toast('Сообщим о поступлении', 'Письмо придёт на ' + inp.value.trim() + ', когда «' + name + '» появится в наличии. В прототипе письма не отправляются.');
    });
  }
  /* img – превью товара слева (добавление в корзину, 23.10) */
  function toast(title, msg, img) {
    if (!toastList) {
      var region = document.createElement('div');
      region.className = 'igro-toast-region igro-toast-region--top';   /* правый верхний угол (23.10) */
      region.innerHTML = '<ol class="igro-toast-region__list" aria-live="polite"></ol>';
      document.body.appendChild(region);
      toastList = region.firstChild;
    }
    var li = document.createElement('li');
    li.className = 'igro-toast-region__item';
    li.innerHTML = '<div class="igro-toast">' +
      (img ? '<img class="igro-toast__thumb" src="' + esc(img) + '" alt="" decoding="async" referrerpolicy="no-referrer">' : '') +
      '<div class="igro-toast__body">' +
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
    var mastH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mast-h')) || 0;
    var y = toolbar.getBoundingClientRect().top + window.pageYOffset - (mastH || 12);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  /* адрес раскрытого продукта: ?product=<код> – «Назад» в браузере возвращает к списку, ссылкой можно поделиться */
  var beforeProduct = null, productFrom = null;
  function productUrl(k) {
    var q = new URLSearchParams(location.search);
    if (k) q.set('product', k); else q.delete('product');
    var s = q.toString();
    return location.pathname + (s ? '?' + s : '');
  }
  function selectProduct(c) {
    sel.g = [c.g]; sel.l = c.l ? [lineKey(c)] : []; sel.p = [c.k];
  }
  function openProduct(key) {
    var c = cardByKey[key];
    if (!c || !c.multi) return;
    beforeProduct = { sel: clone(sel), page: state.page };
    productFrom = key;
    selectProduct(c);
    state.page = 1; renderAll();
    history.pushState({ product: c.k }, '', productUrl(c.k));
    scrollToGrid();
  }
  /* после закрытия продукта – к его карточке в списке, если она на этой странице */
  function backToCard() {
    var el = productFrom && document.querySelector('.ig-card[data-key="' + productFrom + '"]');
    if (el) el.scrollIntoView({ block: 'center' }); else scrollToGrid();
  }
  window.addEventListener('popstate', function () {
    var k = new URLSearchParams(location.search).get('product');
    var c = k && cardByKey['p' + k];
    if (c && inScope(c, sc)) { selectProduct(c); state.page = 1; renderAll(); scrollToGrid(); return; }
    if (!sel.p.length) return;
    if (beforeProduct) { sel = clone(beforeProduct.sel); state.page = beforeProduct.page; } else sel.p = [];
    beforeProduct = null;
    renderAll(); backToCard();
  });
  function pickOpt(cardEl, dim, val) {
    var c = cardByKey[cardEl.getAttribute('data-key')];
    if (!c || !c.vo) return;
    var cur = optCurrent(c), want = {};
    for (var k in cur.o) want[k] = cur.o[k];
    want[dim] = val;
    var v = optFind(c, want);
    if (!v) { var only = {}; only[dim] = val; v = optFind(c, only); }
    if (!v || v.key === cur.key) return;
    optSel[c.key] = v.key;
    cardEl.querySelectorAll('[data-vkey]').forEach(function (pn) { pn.hidden = pn.getAttribute('data-vkey') !== v.key; });
    cardEl.querySelectorAll('[data-opt]').forEach(function (b) {
      var d = b.getAttribute('data-opt'), bv = b.getAttribute('data-val'), w = {}, on = v.o[d] === bv;
      for (var k in v.o) w[k] = v.o[k];
      w[d] = bv;
      b.setAttribute('aria-selected', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.classList.toggle('is-off', !optFind(c, w));
    });
    cardEl.querySelectorAll('[data-opt-cur]').forEach(function (s) {
      var d = s.getAttribute('data-opt-cur');
      s.textContent = v.o[d];
      s.parentNode.setAttribute('aria-label', OPT_T[d] + ': ' + v.o[d]);
    });
    var media = cardEl.querySelector('.ig-card__media'), im = media.querySelector('.ig-card__img');
    if (v.img) {
      if (!im) { im = document.createElement('img'); im.className = 'ig-card__img'; im.alt = ''; im.setAttribute('referrerpolicy', 'no-referrer'); media.appendChild(im); media.classList.add('ig-card__media--img'); }
      im.setAttribute('data-full', imgFull(v.img));
      im.src = imgThumb(v.img);
    }
  }
  function closeOptMenus() {
    document.querySelectorAll('.ig-card__dd.is-open').forEach(function (w) {
      w.classList.remove('is-open');
      w.querySelector('.ig-card__dd-menu').hidden = true;
      w.querySelector('[data-dd-btn]').setAttribute('aria-expanded', 'false');
      var card = w.closest('.ig-card');
      if (card) card.classList.remove('is-dd-open');
    });
  }
  function toggleOptMenu(w) {
    var open = !w.classList.contains('is-open');
    closeOptMenus();
    if (!open) return;
    w.classList.add('is-open');
    w.closest('.ig-card').classList.add('is-dd-open');
    var m = w.querySelector('.ig-card__dd-menu');
    m.hidden = false;
    w.querySelector('[data-dd-btn]').setAttribute('aria-expanded', 'true');
    var sel = m.querySelector('[aria-selected="true"]') || m.querySelector('[role="option"]');
    if (sel) sel.focus({ preventScroll: true });
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
    if (!t.closest('[data-dd]')) closeOptMenus();

    /* быстрые фильтры — применяются сразу */
    var chip = t.closest('.ig-toolbar [data-facet]');
    if (chip) {
      var ck = chip.getAttribute('data-facet'), cv = chip.getAttribute('data-val');
      toggle(sel[ck], cv); afterFilterChange();
      /* крестик на чипе продукта: снимается только продукт, бренд и линия остаются */
      if (ck === 'p') { history.replaceState(null, '', productUrl(sel.p[0])); beforeProduct = null; backToCard(); return; }
      refocus('.ig-toolbar [data-facet="' + ck + '"]', cv);
      return;
    }
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
    /* картинка или название — переход в карточку товара; в прототипе её нет. У стопки – раскрытие продукта */
    var prod = t.closest('[data-product]');
    if (prod) {
      e.preventDefault();
      var pc = prod.closest('.ig-card');
      if (pc && pc.classList.contains('ig-card--stack')) { openProduct(pc.getAttribute('data-key')); return; }
      var pn = pc && pc.querySelector('.ig-card__name');
      toast('Карточка товара', 'Здесь откроется страница товара' + (pn ? ' «' + pn.textContent + '»' : '') + '. В прототипе её нет.');
      return;
    }
    /* ---- новая карточка (эксперимент design-lab, макет 2740:3615) ---- */
    var cardEl = t.closest('.ig-card');
    /* товар внутри карточки продукта с переключателями – своя панель покупки с ключом товара */
    var paneEl = t.closest('[data-vkey]');
    var itemKey = paneEl ? paneEl.getAttribute('data-vkey') : cardEl && cardEl.getAttribute('data-key');
    var cardName = function () {
      var a = cardEl && cardEl.querySelector('.ig-card__link'), v = paneEl && cardByKey[itemKey];
      return (a ? a.textContent : '') + (v ? ', ' + v.desc : '');
    };
    /* выпадающий список признака: открыть / закрыть; выбор – товар, его фото и блок покупки */
    var ddBtn = t.closest('[data-dd-btn]');
    if (ddBtn && cardEl) { toggleOptMenu(ddBtn.parentNode); return; }
    var optBtn = t.closest('[data-opt]');
    if (optBtn && cardEl) {
      var ddWrap = optBtn.closest('[data-dd]');
      pickOpt(cardEl, optBtn.getAttribute('data-opt'), optBtn.getAttribute('data-val'));
      closeOptMenus();
      var tb = ddWrap && ddWrap.querySelector('[data-dd-btn]');
      if (tb) tb.focus({ preventScroll: true });
      return;
    }
    var cardImg = function () { var im = cardEl && cardEl.querySelector('.ig-card__img'); return im ? im.getAttribute('src') : ''; };
    var cardUnit = function () { var v = cardEl && cardEl.querySelector('[data-unit]'); return v ? parseInt(v.getAttribute('data-unit'), 10) || 0 : 0; };
    /* избранное: нажатие заливает сердце */
    var favBtn = t.closest('[data-fav]');
    if (favBtn && cardEl) {
      var on = favBtn.getAttribute('aria-pressed') !== 'true';
      favBtn.setAttribute('aria-pressed', on);
      var fk = cardEl.getAttribute('data-key');
      if (on) fav[fk] = 1; else delete fav[fk];
      favSave();
      toast(on ? 'В избранном' : 'Убрано из избранного', '«' + cardName() + '»');
      return;
    }
    /* «В корзину»: 1 шт. сразу в корзине и блок раскрывается в счётчик + квадратную кнопку;
       у раскрытого блока кнопка корзины добавляет столько, сколько в счётчике */
    var buyBtn = t.closest('[data-buy-btn]');
    if (buyBtn && cardEl) {
      var buy = buyBtn.closest('[data-buy]');
      var key = itemKey;
      if (!buy.classList.contains('is-open')) {
        var total = window.IG_CART.add(key, 1, cardUnit());
        toast('Товар в корзине', '«' + cardName() + '» – 1 шт.' + (total > 1 ? ' Всего этого товара в корзине: ' + total + ' шт.' : ''), cardImg());
        setBuy(buy, true);
      } else {
        var qin = buy.querySelector('.ig-card__qty-in');
        var q = Math.max(1, Math.min(999, parseInt(qin.value, 10) || 1));
        qin.value = q;
        var tot = window.IG_CART.add(key, q, cardUnit());
        toast('Добавлено в корзину', '«' + cardName() + '» – ' + q + ' шт. Всего этого товара в корзине: ' + tot + ' шт.', cardImg());
        bump(buyBtn.querySelector('.ig-card__buyicon'));
      }
      return;
    }
    /* − и + меняют только число в счётчике; «−» на единице сворачивает блок обратно в «В корзину» */
    var qb = t.closest('[data-qty]');
    if (qb && cardEl) {
      var bx = qb.closest('[data-buy]');
      var inp = bx.querySelector('.ig-card__qty-in');
      var n = (parseInt(inp.value, 10) || 1) + parseInt(qb.getAttribute('data-qty'), 10);
      if (n < 1) setBuy(bx, false);
      else inp.value = Math.min(999, n);
      return;
    }
    /* нет в наличии — окно «Сообщить о поступлении» */
    if (t.closest('[data-notify]') && cardEl) {
      openNotify(cardName(), t.closest('[data-notify]'));
      return;
    }

    if (t.closest('[data-pro-price]')) {
      toast('Профессиональная цена', 'Профессиональные цены видны после регистрации на сайте. Вход и регистрация в прототип не входят.');
      return;
    }

    /* у продукта несколько вариантов — «Выбрать» раскрывает его товары */
    if (t.closest('[data-variants]') && cardEl) {
      openProduct(cardEl.getAttribute('data-key'));
      return;
    }
    /* продукт (стопка) раскрывается кликом по любому месту карточки, кроме её кнопок и ссылок */
    if (cardEl && cardEl.classList.contains('ig-card--stack') && !t.closest('button, a, input')) {
      openProduct(cardEl.getAttribute('data-key'));
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

  document.addEventListener('input', function (e) {
    var inp = e.target.closest && e.target.closest('.ig-card__qty-in');
    if (inp) inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 3);
  });
  document.addEventListener('focusout', function (e) {
    var inp = e.target.closest && e.target.closest('.ig-card__qty-in');
    if (inp && !(parseInt(inp.value, 10) > 0)) inp.value = 1;
  });
  document.addEventListener('keydown', function (e) {
    /* Enter в счётчике — то же, что кнопка корзины */
    var qi = e.target.closest && e.target.closest('.ig-card__qty-in');
    if (qi && e.key === 'Enter') { var cb = qi.closest('[data-buy]').querySelector('[data-buy-btn]'); if (cb) cb.click(); return; }

    /* выпадающий список признака в карточке: ↑/↓ по пунктам, Esc – закрыть и вернуть фокус на плашку */
    var ddItem = e.target.closest && e.target.closest('.ig-card__dd-item');
    if (ddItem && /^(ArrowDown|ArrowUp|Escape)$/.test(e.key)) {
      if (e.key === 'Escape') { var dw = ddItem.closest('[data-dd]'); closeOptMenus(); dw.querySelector('[data-dd-btn]').focus(); e.preventDefault(); return; }
      var its = Array.prototype.slice.call(ddItem.parentNode.querySelectorAll('[role="option"]'));
      its[(its.indexOf(ddItem) + (e.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length].focus();
      e.preventDefault();
      return;
    }
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

  /* открыта ссылка на раскрытый продукт */
  (function () {
    var k = params.get('product'), c = k && cardByKey['p' + k];
    if (c && c.multi && inScope(c, sc)) { selectProduct(c); history.replaceState({ product: k }, '', location.href); }
    else if (k) history.replaceState(null, '', productUrl(''));
  })();
  renderAll();
  renderCart();
})();
