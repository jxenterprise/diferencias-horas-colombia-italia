/* ==========================================================================
   script.js · Italia ⇄ Colombia — hora en vivo con su cielo real
   --------------------------------------------------------------------------
   Qué hace, en orden:
     1. Lee la hora real de cada zona (Europe/Rome y America/Bogota) con la
        API Intl del navegador. Por eso el cambio de horario de Italia
        (verano ↔ invierno) se aplica solo: 7 h de diferencia en verano y
        6 h en invierno, sin tocar nada.
     2. Calcula la posición REAL del sol para Roma y Cartagena (algoritmo de
        la NOAA): altura sobre el horizonte y horas de salida y puesta.
     3. Con esa altura decide los colores del cielo y del paisaje, las luces
        de la ciudad, las estrellas, y dónde va el sol (de día) o la luna
        (de noche). La luna se dibuja con su fase real del día.
     4. Pinta el reloj (dígitos que ruedan), la fecha, la diferencia horaria
        y el aviso "+1 día" cuando un país ya pasó a mañana.
     5. Viaje en el tiempo: arrastrar un cielo adelanta o atrasa las horas
        en los dos países a la vez (o flechas ← → con la tarjeta enfocada).
        Al soltar, todo vuelve solo a la hora real.

   Depende de: index.html (atributos data-place / data-role / data-d) y
   css/styles.css (lee las variables CSS que este archivo escribe).
   No usa librerías ni pide datos a internet: todo se calcula aquí mismo.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     0) UTILIDADES (matemática y color)
     ====================================================================== */
  const RAD = Math.PI / 180;
  const DAY_MS = 86400000;
  const HOUR_MS = 3600000;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /** Transición suave 0→1 entre e0 y e1 (también sirve con e0 > e1). */
  function smoothstep(e0, e1, x) {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /** '#rrggbb' → [r, g, b] */
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /** Mezcla dos colores [r, g, b]: t = 0 → a, t = 1 → b. */
  function mix(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  const rgb = (c) => 'rgb(' + Math.round(c[0]) + ', ' + Math.round(c[1]) + ', ' + Math.round(c[2]) + ')';
  const rgba = (c, a) => 'rgba(' + Math.round(c[0]) + ', ' + Math.round(c[1]) + ', ' + Math.round(c[2]) + ', ' + clamp(a, 0, 1).toFixed(3) + ')';
  const px = (v) => v.toFixed(1) + 'px';

  /** Aleatorio con semilla: las estrellas quedan siempre en el mismo sitio. */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Convierte a [r, g, b] los '#hex' de una tabla de fotogramas. */
  function prepTable(table) {
    return table.map((row) => row.map((v, i) => (i > 0 && typeof v === 'string' ? hexToRgb(v) : v)));
  }

  /** Interpola una tabla [[x, valor1, valor2…], …] en el punto x.
      Cada valor puede ser un color [r, g, b] o un número. */
  function sample(table, x) {
    if (x <= table[0][0]) return table[0].slice(1);
    for (let i = 1; i < table.length; i++) {
      const b = table[i];
      if (x <= b[0]) {
        const a = table[i - 1];
        const t = (x - a[0]) / (b[0] - a[0]);
        const out = [];
        for (let k = 1; k < a.length; k++) {
          out.push(Array.isArray(a[k]) ? mix(a[k], b[k], t) : lerp(a[k], b[k], t));
        }
        return out;
      }
    }
    return table[table.length - 1].slice(1);
  }

  function setText(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }


  /* ======================================================================
     1) CONFIGURACIÓN
     ----------------------------------------------------------------------
     · key      → debe coincidir con data-place="…" en index.html.
     · zone     → zona horaria IANA (el navegador conoce sus cambios de hora).
     · lat/lon  → punto exacto para calcular el sol: el Coliseo (Roma) y la
                  Torre del Reloj (Cartagena).
     · seed     → semilla para repartir las estrellas de cada cielo.
     · palette  → color de cada capa del paisaje (variables CSS):
                  day/night = con sol alto / en noche cerrada,
                  haze      = cuánto se funde con el horizonte (bruma),
                  warm      = cuánto toma el tono del amanecer/atardecer,
                  lit       = color "encendido" de noche (reflectores,
                              arcos, reloj) y litAmt = cuánto pesa.
     ====================================================================== */
  const PLACES = [
    {
      key: 'italia',
      country: 'Italia',
      city: 'Roma',
      zone: 'Europe/Rome',
      lat: 41.8902,
      lon: 12.4922,
      seed: 1861,
      palette: {
        '--c-far':   { day: '#93abc0', night: '#0f1426', haze: 0.35 },
        '--c-far2':  { day: '#7d95ad', night: '#121827', haze: 0.25 },
        '--c-dome':  { day: '#7d95ad', night: '#121827', haze: 0.25, lit: '#6e5c47', litAmt: 0.55 },
        '--c-mid':   { day: '#4f6e55', night: '#090d17', haze: 0.12 },
        '--c-land':  { day: '#d6c098', night: '#151219', haze: 0.05, lit: '#8f6d43', litAmt: 0.6 },
        '--c-land2': { day: '#b39a72', night: '#100e14', haze: 0.05, lit: '#6b5133', litAmt: 0.6 },
        '--c-arch':  { day: '#6a5843', night: '#0c0a0e', haze: 0, lit: '#ffbf6a', litAmt: 1 },
        '--c-tree':  { day: '#2d4a34', night: '#04070c', haze: 0.04 },
        '--c-near':  { day: '#4a6440', night: '#05070b', haze: 0 },
      },
    },
    {
      key: 'colombia',
      country: 'Colombia',
      city: 'Cartagena',
      zone: 'America/Bogota',
      lat: 10.4226,
      lon: -75.5487,
      seed: 1533,
      palette: {
        '--c-far':      { day: '#a4b6c6', night: '#0f1528', haze: 0.35 },
        '--c-sea-top':  { day: '#5bb0cf', night: '#0e1d39', haze: 0.3, warm: 0.5 },
        '--c-sea-bot':  { day: '#1b6f95', night: '#060c1c', haze: 0.05 },
        '--c-sea-line': { day: '#d9f1fb', night: '#5d6f95', haze: 0 },
        '--c-mid':      { day: '#d8b27e', night: '#0c0f1a', haze: 0.1 },
        '--c-wall':     { day: '#b89c76', night: '#100f18', haze: 0.04, lit: '#3a2c22', litAmt: 0.4 },
        '--c-wall2':    { day: '#8f7655', night: '#0b0a12', haze: 0.04 },
        '--c-tower':    { day: '#e2ac4f', night: '#18141e', haze: 0.03, lit: '#7a5a2e', litAmt: 0.65 },
        '--c-trim':     { day: '#f3e6c9', night: '#221d29', haze: 0.03, lit: '#a0805a', litAmt: 0.6 },
        '--c-arch':     { day: '#5a4128', night: '#0b090c', haze: 0, lit: '#ffbd66', litAmt: 1 },
        '--c-clock':    { day: '#f6efdc', night: '#1f1c24', haze: 0, lit: '#fff1c2', litAmt: 1 },
        '--c-tree':     { day: '#2a5636', night: '#04070b', haze: 0.03 },
        '--c-near':     { day: '#7d6a55', night: '#05060a', haze: 0 },
      },
    },
  ];

  // Pasa los colores de las paletas a [r, g, b] una sola vez.
  PLACES.forEach((p) => {
    Object.keys(p.palette).forEach((k) => {
      const s = p.palette[k];
      s.dayRgb = hexToRgb(s.day);
      s.nightRgb = hexToRgb(s.night);
      if (s.lit) s.litRgb = hexToRgb(s.lit);
    });
  });

  /* Cielo según la altura del sol en grados: [altura, cenit, medio, horizonte].
     Va de noche cerrada (−18°) → crepúsculos → amanecer dorado → mediodía. */
  const SKY = prepTable([
    [-18, '#04060e', '#070b1a', '#0e1530'],
    [-12, '#060a1d', '#0c1434', '#1e2753'],
    [-8,  '#0b1532', '#1b2557', '#4a3d77'],
    [-4,  '#142553', '#34407e', '#b0647a'],
    [-1,  '#1f3b77', '#5d5f9c', '#f0906a'],
    [1,   '#2b5398', '#8c8fbf', '#ffb877'],
    [5,   '#3769b3', '#8cb2db', '#ffe0ae'],
    [12,  '#3574c9', '#74ade4', '#cde7f7'],
    [30,  '#2b6bcc', '#5ca2ea', '#b5dcf8'],
    [60,  '#255fc6', '#4f97e6', '#a8d5f7'],
  ]);

  /* Resplandor del horizonte alrededor del sol: [altura, color, intensidad]. */
  const GLOW = prepTable([
    [-18, '#3a2f6b', 0],
    [-12, '#46407e', 0.1],
    [-7,  '#a85a86', 0.32],
    [-3,  '#ff7d55', 0.58],
    [0,   '#ff9c55', 0.78],
    [3,   '#ffb867', 0.6],
    [8,   '#ffd9a0', 0.3],
    [16,  '#fff3d6', 0.1],
    [30,  '#ffffff', 0],
  ]);

  /* Color del sol: [altura, núcleo, borde, halo, intensidad del halo]. */
  const SUN = prepTable([
    [-2, '#ff9a52', '#ff5d2e', '#ff6e3c', 0.55],
    [2,  '#ffc070', '#ff8a3d', '#ff9646', 0.5],
    [8,  '#ffe6a8', '#ffc164', '#ffc86e', 0.42],
    [20, '#fff7df', '#ffe2a1', '#ffecb4', 0.38],
    [60, '#ffffff', '#fff1c9', '#fff4d2', 0.35],
  ]);

  const GOLD = hexToRgb('#ffc070');        // tinte extra del amanecer
  const ROSE = hexToRgb('#ff7a72');        // tinte extra del atardecer
  const WHITE = [255, 255, 255];
  const CLOUD_DAY = hexToRgb('#ffffff');
  const CLOUD_NIGHT = hexToRgb('#262e48');

  /* Medidas del viewBox de las siluetas (index.html): 600 × 480 con el
     horizonte en y = 300 y la muralla de Cartagena empezando en y = 336. */
  const VB = { w: 600, h: 480, horizon: 300, seaBottom: 336 };

  /* Viaje en el tiempo: arrastrar todo el ancho de una tarjeta = 12 horas. */
  const TRAVEL_HOURS_PER_WIDTH = 12;
  const TRAVEL_MAX_MS = 48 * HOUR_MS;

  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let reduceMotion = !!(motionQuery && motionQuery.matches);


  /* ======================================================================
     2) ZONAS HORARIAS
     ====================================================================== */
  const formatters = new Map();

  /** Minutos de diferencia de la zona con UTC en ese instante.
      Ej.: Roma en verano = +120, Roma en invierno = +60, Cartagena = −300. */
  function zoneOffset(ms, zone) {
    try {
      let f = formatters.get(zone);
      if (!f) {
        f = new Intl.DateTimeFormat('en-US', {
          timeZone: zone,
          hour12: false,
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric',
        });
        formatters.set(zone, f);
      }
      const p = {};
      f.formatToParts(new Date(ms)).forEach((part) => { p[part.type] = part.value; });
      // "24" a medianoche en algunos navegadores → 0; y si alguno devolviera
      // formato de 12 h (AM/PM), se convierte a 24 h.
      let hour = +p.hour % 24;
      if (p.dayPeriod) hour = (hour % 12) + (/p/i.test(p.dayPeriod) ? 12 : 0);
      const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, hour, +p.minute, +p.second);
      const off = Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
      if (!Number.isFinite(off)) throw new Error('offset inválido');
      return off;
    } catch (err) {
      return fallbackOffset(ms, zone);
    }
  }

  /** Respaldo para navegadores muy viejos: Colombia es UTC−5 todo el año;
      Italia es UTC+1 y UTC+2 en verano (del último domingo de marzo al
      último domingo de octubre, cambiando a la 01:00 UTC). */
  function fallbackOffset(ms, zone) {
    if (zone === 'America/Bogota') return -300;
    if (zone === 'Europe/Rome') {
      const y = new Date(ms).getUTCFullYear();
      const start = lastSundayUtc(y, 2) + HOUR_MS;
      const end = lastSundayUtc(y, 9) + HOUR_MS;
      return ms >= start && ms < end ? 120 : 60;
    }
    return -new Date(ms).getTimezoneOffset();
  }

  function lastSundayUtc(year, month) {
    const last = new Date(Date.UTC(year, month + 1, 0));
    return Date.UTC(year, month, last.getUTCDate() - last.getUTCDay());
  }

  /** Hora "de pared" de una zona en el instante ms. */
  function wallClock(ms, zone) {
    const off = zoneOffset(ms, zone);
    const local = ms + off * 60000;
    const d = new Date(local);
    return {
      off,
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),
      day: d.getUTCDate(),
      weekday: d.getUTCDay(),
      h: d.getUTCHours(),
      m: d.getUTCMinutes(),
      s: d.getUTCSeconds(),
      dayIndex: Math.floor(local / DAY_MS),
    };
  }


  /* ======================================================================
     3) ASTRONOMÍA
     ====================================================================== */

  /** Posición del sol (algoritmo de la NOAA, precisión de ~1 minuto).
      Devuelve: elevation (° sobre el horizonte), hourAngle (° desde el
      mediodía solar: negativo en la mañana) y H0 (° del ángulo horario de
      la salida/puesta, usando −0.833° = borde superior + refracción). */
  function sunPosition(ms, lat, lon) {
    const jd = ms / DAY_MS + 2440587.5;
    const T = (jd - 2451545) / 36525;
    const L0 = ((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360 + 360) % 360;
    const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    const ecc = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    const Mr = M * RAD;
    const C = Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T))
      + Math.sin(2 * Mr) * (0.019993 - 0.000101 * T)
      + Math.sin(3 * Mr) * 0.000289;
    const omega = (125.04 - 1934.136 * T) * RAD;
    const lambda = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega)) * RAD;
    const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    const eps = (eps0 + 0.00256 * Math.cos(omega)) * RAD;
    const decl = Math.asin(Math.sin(eps) * Math.sin(lambda));

    // Ecuación del tiempo (minutos)
    const y = Math.pow(Math.tan(eps / 2), 2);
    const L0r = L0 * RAD;
    const eqTime = 4 / RAD * (y * Math.sin(2 * L0r) - 2 * ecc * Math.sin(Mr)
      + 4 * ecc * y * Math.sin(Mr) * Math.cos(2 * L0r)
      - 0.5 * y * y * Math.sin(4 * L0r) - 1.25 * ecc * ecc * Math.sin(2 * Mr));

    const minutesUtc = ((ms / 60000) % 1440 + 1440) % 1440;
    const trueSolar = ((minutesUtc + eqTime + 4 * lon) % 1440 + 1440) % 1440;
    const hourAngle = trueSolar / 4 - 180;

    const latR = lat * RAD;
    const cosZ = Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(hourAngle * RAD);
    const elevation = 90 - Math.acos(clamp(cosZ, -1, 1)) / RAD;

    const cosH0 = (Math.sin(-0.833 * RAD) - Math.sin(latR) * Math.sin(decl)) / (Math.cos(latR) * Math.cos(decl));
    const H0 = Math.acos(clamp(cosH0, -1, 1)) / RAD;

    return { elevation, hourAngle, H0 };
  }

  /** Iluminación de la luna (fórmulas de baja precisión de "Astronomy
      Answers", las mismas que usa la librería SunCalc).
      fraction: 0 = luna nueva … 1 = luna llena.
      phase:    0 nueva · 0.25 cuarto creciente · 0.5 llena · 0.75 cuarto menguante. */
  function moonIllumination(ms) {
    const d = ms / DAY_MS - 0.5 + 2440588 - 2451545;   // días desde J2000
    const e = RAD * 23.4397;                            // oblicuidad de la eclíptica

    // Sol
    const M = RAD * (357.5291 + 0.98560028 * d);
    const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const Ls = M + C + RAD * 102.9372 + Math.PI;
    const sDec = Math.asin(Math.sin(e) * Math.sin(Ls));
    const sRa = Math.atan2(Math.sin(Ls) * Math.cos(e), Math.cos(Ls));

    // Luna
    const L = RAD * (218.316 + 13.176396 * d);
    const Mm = RAD * (134.963 + 13.064993 * d);
    const F = RAD * (93.272 + 13.22935 * d);
    const l = L + RAD * 6.289 * Math.sin(Mm);
    const b = RAD * 5.128 * Math.sin(F);
    const dist = 385001 - 20905 * Math.cos(Mm);
    const mRa = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    const mDec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));

    const sDist = 149598000;
    const phi = Math.acos(clamp(Math.sin(sDec) * Math.sin(mDec) + Math.cos(sDec) * Math.cos(mDec) * Math.cos(sRa - mRa), -1, 1));
    const inc = Math.atan2(sDist * Math.sin(phi), dist - sDist * Math.cos(phi));
    const angle = Math.atan2(Math.cos(sDec) * Math.sin(sRa - mRa),
      Math.sin(sDec) * Math.cos(mDec) - Math.cos(sDec) * Math.sin(mDec) * Math.cos(sRa - mRa));

    return {
      fraction: (1 + Math.cos(inc)) / 2,
      phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
    };
  }

  /** Forma de la parte iluminada de la luna (viewBox 100 × 100, radio 48).
      Visto desde el hemisferio norte: creciente → luz a la derecha;
      menguante → luz a la izquierda. El terminador es media elipse. */
  function moonPhasePath(fraction, waxing) {
    const r = 48;
    const rx = Math.abs(1 - 2 * fraction) * r;
    const limbSweep = waxing ? 1 : 0;
    const termSweep = (fraction < 0.5) === waxing ? 0 : 1;
    return 'M50 2A48 48 0 0 ' + limbSweep + ' 50 98A' + rx.toFixed(2) + ' 48 0 0 ' + termSweep + ' 50 2Z';
  }

  /** Altura en px del centro de un astro según su elevación real.
      · A la hora oficial de salida/puesta (−0.833°) el disco está justo a
        medio horizonte, como se ve en la vida real.
      · Hacia arriba sigue el seno de la elevación: a 90° su borde superior
        toca el límite alto del cielo.
      · Hacia abajo se hunde más rápido: a −3.5° ya está escondido del todo. */
  function bodyY(elev, r, horizon, span) {
    if (elev >= -0.833) {
      const s = (Math.sin(elev * RAD) + 0.014538) / 1.014538;
      return horizon - s * (span - r);
    }
    return horizon + (r + 3) * ((-0.833 - elev) / 2.667);
  }


  /* ======================================================================
     4) RELOJ CON DÍGITOS RODANTES Y FECHA
     ====================================================================== */

  /** Cambia el dígito de un "slot". Con animate=true, el viejo sube y se
      desvanece mientras el nuevo entra desde abajo (clases del CSS). */
  function setSlot(slot, ch, animate) {
    if (!slot || slot._v === ch) return;
    const first = slot._v === undefined;
    slot._v = ch;
    slot.classList.toggle('is-empty', ch === '');

    const glyph = document.createElement('span');
    glyph.className = 'g';
    glyph.textContent = ch;
    const old = slot.querySelector('.g:not(.is-out)');

    if (!animate || first || reduceMotion || !old) {
      while (slot.firstChild) slot.removeChild(slot.firstChild);
      slot.appendChild(glyph);
      return;
    }
    slot.querySelectorAll('.g.is-out').forEach((n) => n.remove());
    glyph.classList.add('is-in');
    slot.appendChild(glyph);
    void glyph.offsetWidth;            // fija el estado inicial antes de animar
    glyph.classList.remove('is-in');
    old.classList.add('is-out');
    setTimeout(() => { old.remove(); }, 650);
  }

  /** "9:42 p. m." */
  function shortTime(wc) {
    const h12 = wc.h % 12 || 12;
    return h12 + ':' + String(wc.m).padStart(2, '0') + ' ' + (wc.h < 12 ? 'a. m.' : 'p. m.');
  }

  /** "Jueves, 1 de octubre" */
  function longDate(wc) {
    const txt = DAYS[wc.weekday] + ', ' + wc.day + ' de ' + MONTHS[wc.month];
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  function renderClock(place, wc, animate) {
    const h12 = wc.h % 12 || 12;
    const d = {
      h1: h12 >= 10 ? '1' : '',
      h2: String(h12 % 10),
      m1: String(Math.floor(wc.m / 10)),
      m2: String(wc.m % 10),
      s1: String(Math.floor(wc.s / 10)),
      s2: String(wc.s % 10),
    };
    Object.keys(d).forEach((k) => setSlot(place.slots[k], d[k], animate));
    setText(place.periodEl, wc.h < 12 ? 'a. m.' : 'p. m.');
    setText(place.dateEl, longDate(wc));
  }


  /* ======================================================================
     5) CIELO Y PAISAJE (una tarjeta)
     ----------------------------------------------------------------------
     Todo sale de la elevación real del sol (e):
       light  → 0 de noche … 1 de día (colores del paisaje y nubes)
       lights → 0 de día … 1 de noche (ventanas, faroles, reflectores)
       warm   → máximo con el sol en el horizonte (tonos dorados/rosados)
       stars  → visibles desde el final del crepúsculo civil
     El sol recorre un arco de izquierda (salida, este) a derecha (puesta,
     oeste). La luna va en el punto opuesto: sale por la izquierda cuando
     el sol se pone y se esconde por la derecha cuando el sol sale.
     ====================================================================== */
  function renderSky(place, ms, wc, moon) {
    const g = place.geom;
    if (!g) return;
    const st = place.el.style;
    const sun = sunPosition(ms, place.lat, place.lon);
    const e = sun.elevation;
    place.elevation = e;
    place.rising = sun.hourAngle < 0;

    const light = smoothstep(-8, 10, e);
    const lights = smoothstep(4, -5, e);
    const warm = Math.exp(-Math.pow((e - 1.5) / 5.5, 2));
    const starsA = smoothstep(-2, -11, e);

    // — Cielo y resplandor del horizonte —
    const sky = sample(SKY, e);
    const top = sky[0];
    const mid = sky[1];
    const bot = sky[2];
    const glowRow = sample(GLOW, e);
    const glow = mix(glowRow[0], place.rising ? GOLD : ROSE, 0.2 * warm);

    // — Posiciones: progreso del día (0 = salida, 1 = puesta) y de la noche —
    const left = g.w * 0.1;
    const right = g.w * 0.9;
    const span = g.horizon - g.h * 0.15;
    const H0 = clamp(sun.H0, 1, 179);
    const dayP = (sun.hourAngle + H0) / (2 * H0);
    const haPos = sun.hourAngle < 0 ? sun.hourAngle + 360 : sun.hourAngle;
    const nightP = (haPos - H0) / (360 - 2 * H0);
    const sunX = clamp(lerp(left, right, dayP), -g.w, g.w * 2);
    const sunY = bodyY(e, g.sunD / 2, g.horizon, span);
    const moonX = clamp(lerp(left, right, nightP), -g.w, g.w * 2);
    const moonY = bodyY(-e, g.moonD / 2, g.horizon, span);

    st.setProperty('--sky-top', rgb(top));
    st.setProperty('--sky-mid', rgb(mid));
    st.setProperty('--sky-bot', rgb(bot));
    st.setProperty('--glow-color', rgba(glow, glowRow[1]));
    st.setProperty('--glow-x', px(clamp(sunX, -0.15 * g.w, 1.15 * g.w)));
    st.setProperty('--glow-rx', px(g.w * (0.55 + 0.35 * warm)));
    st.setProperty('--glow-ry', px(g.horizon * (0.42 + 0.25 * warm)));

    // — Sol —
    const sunRow = sample(SUN, e);
    st.setProperty('--sun-x', px(sunX));
    st.setProperty('--sun-y', px(sunY));
    st.setProperty('--sun-o', smoothstep(-10, -1.5, e).toFixed(3));
    st.setProperty('--sun-core', rgb(sunRow[0]));
    st.setProperty('--sun-edge', rgb(sunRow[1]));
    st.setProperty('--sun-halo', rgba(sunRow[2], sunRow[3]));
    st.setProperty('--sun-squash', (1 - 0.1 * (1 - smoothstep(-1, 5, e))).toFixed(3));
    st.setProperty('--rays-o', (smoothstep(4, 20, e) * 0.75).toFixed(3));

    // — Luna (fase real) —
    const moonO = smoothstep(2, -4, e);
    st.setProperty('--moon-x', px(moonX));
    st.setProperty('--moon-y', px(moonY));
    st.setProperty('--moon-o', moonO.toFixed(3));
    st.setProperty('--moon-glow', (starsA * (0.35 + 0.65 * moon.fraction)).toFixed(3));
    if (place.phaseEl) {
      const d = moonPhasePath(moon.fraction, moon.phase < 0.5);
      if (d !== place.lastPhase) {
        place.phaseEl.setAttribute('d', d);
        place.lastPhase = d;
      }
    }

    // — Nubes —
    let cloud = mix(CLOUD_NIGHT, CLOUD_DAY, light);
    cloud = mix(cloud, glow, warm * 0.5);
    st.setProperty('--cloud', rgb(cloud));
    st.setProperty('--cloud-shade', rgb(mix(cloud, top, 0.4)));
    st.setProperty('--cloud-a', (0.38 + 0.52 * light).toFixed(3));

    // — Paisaje: día/noche + luces + tinte cálido + bruma del horizonte —
    Object.keys(place.palette).forEach((name) => {
      const s = place.palette[name];
      let c = mix(s.nightRgb, s.dayRgb, light);
      let litK = 0;
      if (s.litRgb) {
        litK = lights * s.litAmt;
        c = mix(c, s.litRgb, litK);
      }
      c = mix(c, glow, warm * (s.warm != null ? s.warm : 0.2) * (1 - litK));
      if (s.haze) c = mix(c, bot, s.haze);
      st.setProperty(name, rgb(c));
    });

    st.setProperty('--lights', lights.toFixed(3));
    st.setProperty('--veil-top', (0.1 + 0.16 * light).toFixed(3));
    st.setProperty('--veil-bot', (0.34 + 0.22 * light).toFixed(3));
    st.setProperty('--ambient', rgba(mix(bot, glow, warm * 0.5), 0.26 + 0.22 * light + 0.2 * warm));

    // — Reflejos en el mar (solo Cartagena) —
    if (place.hasSea) {
      const sunGlint = smoothstep(-1.2, 1.2, e) * lerp(1, 0.3, smoothstep(6, 40, e));
      const moonGlint = moonO * smoothstep(-1.2, 1.2, -e) * (0.25 + 0.75 * moon.fraction) * 0.85;
      st.setProperty('--glint-sun-x', px(sunX));
      st.setProperty('--glint-sun-o', sunGlint.toFixed(3));
      st.setProperty('--glint-sun-c', rgba(mix(sunRow[1], WHITE, light * 0.45), 0.9));
      st.setProperty('--glint-moon-x', px(moonX));
      st.setProperty('--glint-moon-o', moonGlint.toFixed(3));
    }

    // — Manecillas de la Torre del Reloj (hora real de Cartagena) —
    if (place.handH && place.handM) {
      const hourA = ((wc.h % 12) + wc.m / 60) * 30;
      const minA = (wc.m + wc.s / 60) * 6;
      place.handH.setAttribute('transform', 'rotate(' + hourA.toFixed(1) + ' 300 268)');
      place.handM.setAttribute('transform', 'rotate(' + minA.toFixed(1) + ' 300 268)');
    }

    if (place.stars) place.stars.alpha = starsA;
  }

  /** Mide la tarjeta y calcula dónde cae el horizonte del dibujo (el SVG
      usa preserveAspectRatio="xMidYMax slice": escala hasta cubrir y se
      alinea abajo, así que el horizonte depende del tamaño). */
  function measure(place) {
    const w = place.el.clientWidth;
    const h = place.el.clientHeight;
    if (!w || !h) return;
    const scale = Math.max(w / VB.w, h / VB.h);
    const offY = h - VB.h * scale;
    const horizon = offY + VB.horizon * scale;
    const seaBottom = offY + VB.seaBottom * scale;
    const sunD = clamp(w * 0.12, 26, 56);
    const moonD = clamp(w * 0.095, 22, 44);
    place.geom = { w, h, horizon, sunD, moonD };

    const st = place.el.style;
    st.setProperty('--horizon', px(horizon));
    st.setProperty('--sun-d', px(sunD));
    st.setProperty('--moon-d', px(moonD));
    if (place.hasSea) {
      st.setProperty('--glint-top', px(horizon + 1));
      st.setProperty('--glint-h', px(Math.max(8, seaBottom - horizon - 1)));
      st.setProperty('--glint-w', px(sunD * 1.25));
    }
    if (place.stars) place.stars.resize(w, h, horizon);
  }


  /* ======================================================================
     6) ESTRELLAS Y ESTRELLAS FUGACES (canvas)
     ----------------------------------------------------------------------
     Se dibujan solo cuando oscurece (alpha > 0). Titilan a ~25 fps; las
     fugaces aparecen cada 5–16 s en noche cerrada. Con "movimiento
     reducido" las estrellas quedan quietas y no hay fugaces.
     ====================================================================== */
  function StarField(canvas, seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.alpha = 0;
    this.drawn = -1;
    this.lastT = 0;
    this.nextShot = 0;
    this.shooting = [];
    this.w = 0;
    this.horizon = 0;
    this.dpr = 1;
    const r = mulberry32(seed);
    this.stars = [];
    for (let i = 0; i < 170; i++) {
      const big = r() < 0.07;
      const tint = r();
      this.stars.push({
        x: r(),
        y: 0.02 + 0.93 * Math.pow(r(), 1.2),
        size: big ? 1.15 + r() * 0.7 : 0.5 + r() * 0.7,
        base: big ? 0.85 + r() * 0.15 : 0.25 + r() * 0.6,
        speed: 0.6 + r() * 2.4,
        phase: r() * Math.PI * 2,
        color: tint < 0.14 ? '255, 228, 196' : tint < 0.3 ? '208, 224, 255' : '255, 255, 255',
        big,
      });
    }
  }

  StarField.prototype.resize = function (w, h, horizon) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w;
    this.horizon = horizon;
    this.canvas.width = Math.max(1, Math.round(w * this.dpr));
    this.canvas.height = Math.max(1, Math.round(h * this.dpr));
    this.drawn = -1;      // forzar redibujo
  };

  StarField.prototype.frame = function (t, animate) {
    if (!this.ctx || !this.w) return;
    const a = this.alpha;
    if (a < 0.004) {
      if (this.drawn !== 0) {
        this.clear();
        this.drawn = 0;
      }
      this.shooting.length = 0;
      this.nextShot = 0;
      return;
    }
    if (!animate) {
      if (Math.abs(this.drawn - a) < 0.002) return;   // quieto: redibuja solo si cambió
    } else if (!this.shooting.length && t - this.lastT < 40 && this.drawn >= 0) {
      return;
    }
    this.lastT = t;
    this.draw(t, a, animate);
    this.drawn = a;
    if (animate) this.maybeShoot(t, a);
  };

  StarField.prototype.clear = function () {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  StarField.prototype.draw = function (t, a, animate) {
    const ctx = this.ctx;
    const w = this.w;
    const hz = this.horizon;
    this.clear();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const count = Math.round(clamp((w * hz) / 950, 60, this.stars.length));
    for (let i = 0; i < count; i++) {
      const s = this.stars[i];
      const y = s.y * hz;
      let k = s.base * a * smoothstep(hz, hz * 0.72, y);    // se apagan junto al horizonte
      if (animate) k *= 0.62 + 0.38 * Math.sin(t * 0.001 * s.speed + s.phase);
      if (k < 0.02) continue;
      const x = s.x * w;
      ctx.fillStyle = 'rgba(' + s.color + ', ' + k.toFixed(3) + ')';
      if (s.big) {
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(' + s.color + ', ' + (k * 0.32).toFixed(3) + ')';
        ctx.fillRect(x - s.size * 3, y - 0.3, s.size * 6, 0.6);
        ctx.fillRect(x - 0.3, y - s.size * 3, 0.6, s.size * 6);
      } else {
        ctx.fillRect(x - s.size / 2, y - s.size / 2, s.size, s.size);
      }
    }

    for (let i = this.shooting.length - 1; i >= 0; i--) {
      const sh = this.shooting[i];
      const p = (t - sh.t0) / sh.dur;
      if (p >= 1 || p < 0) {
        this.shooting.splice(i, 1);
        continue;
      }
      const dist = sh.speed * (t - sh.t0) / 1000;
      const hx = sh.x + sh.dx * dist;
      const hy = sh.y + sh.dy * dist;
      const len = sh.len * Math.min(1, p * 3);
      const tx = hx - sh.dx * len;
      const ty = hy - sh.dy * len;
      const k = Math.sin(Math.PI * p) * a;
      const grad = ctx.createLinearGradient(hx, hy, tx, ty);
      grad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.95 * k).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, ' + k.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(hx, hy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  StarField.prototype.maybeShoot = function (t, a) {
    if (a < 0.6) {
      this.nextShot = 0;
      return;
    }
    if (!this.nextShot) {
      this.nextShot = t + 2500 + Math.random() * 6000;
      return;
    }
    if (t < this.nextShot || this.shooting.length) return;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const ang = (14 + Math.random() * 22) * RAD;
    this.shooting.push({
      t0: t,
      dur: 650 + Math.random() * 500,
      x: this.w * (dir > 0 ? 0.08 + Math.random() * 0.5 : 0.42 + Math.random() * 0.5),
      y: this.horizon * (0.06 + Math.random() * 0.36),
      dx: Math.cos(ang) * dir,
      dy: Math.sin(ang),
      speed: this.w * (0.9 + Math.random() * 0.7),
      len: this.w * (0.14 + Math.random() * 0.12),
    });
    this.nextShot = t + 5000 + Math.random() * 11000;
  };


  /* ======================================================================
     7) BANDERA ONDEANDO
     Divide el paño en franjas verticales; cada una muestra su pedazo de la
     bandera y se mueve con un pequeño retraso (--i) y más amplitud hacia la
     punta (--amp). El CSS hace la animación.
     ====================================================================== */
  function buildFlag(cloth) {
    if (!cloth || cloth.childElementCount) return;
    const n = 14;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const strip = document.createElement('span');
      strip.className = 'flag__strip';
      strip.style.setProperty('--i', String(i));
      strip.style.setProperty('--amp', (0.15 + 2.2 * (i / (n - 1))).toFixed(2));
      frag.appendChild(strip);
    }
    cloth.style.setProperty('--n', String(n));
    cloth.appendChild(frag);
    cloth.classList.add('is-waving');
  }


  /* ======================================================================
     8) DIFERENCIA HORARIA, "+1 DÍA", TÍTULO Y LECTOR DE PANTALLA
     ====================================================================== */
  const ui = {};

  function renderBridge(wcs) {
    const diff = wcs[0].off - wcs[1].off;              // minutos (Italia − Colombia)
    const abs = Math.abs(diff);
    const hh = Math.floor(abs / 60);
    const mm = abs % 60;
    setText(ui.diffNum, mm ? hh + ':' + String(mm).padStart(2, '0') : String(hh));
    setText(ui.diffUnit, hh === 1 && !mm ? 'hora' : 'horas');
    setText(ui.diffNote, diff > 0 ? places[0].country + ' va adelante'
      : diff < 0 ? places[1].country + ' va adelante' : 'Misma hora');
  }

  /** Muestra "+1 día" en la tarjeta cuya fecha ya va un día adelante. */
  function renderShift(wcs) {
    places.forEach((p, i) => {
      const other = wcs[1 - i];
      const ahead = wcs[i].dayIndex - other.dayIndex;
      if (!p.shiftEl) return;
      p.shiftEl.hidden = ahead <= 0;
      if (ahead > 0) setText(p.shiftEl, '+' + ahead + (ahead === 1 ? ' día' : ' días'));
    });
  }

  function skyState(place) {
    const e = place.elevation;
    if (e > 6) return 'Es de día';
    if (e > -0.833) return place.rising ? 'Está amaneciendo' : 'Está atardeciendo';
    if (e > -12) return place.rising ? 'Está por amanecer' : 'Está anocheciendo';
    return 'Es de noche';
  }

  /** Título de la pestaña y texto para lectores de pantalla (cada minuto). */
  let lastMinuteKey = '';
  function renderTexts(wcs) {
    const key = wcs.map((w) => w.dayIndex + ':' + w.h + ':' + w.m).join('|');
    if (key === lastMinuteKey) return;
    lastMinuteKey = key;
    document.title = places.map((p, i) => p.country + ' ' + shortTime(wcs[i])).join(' · ');
    places.forEach((p, i) => {
      setText(p.srEl, 'En ' + p.city + ', ' + p.country + ', son las ' + shortTime(wcs[i]) + ' del '
        + longDate(wcs[i]).toLowerCase() + '. ' + skyState(p) + '.');
    });
  }


  /* ======================================================================
     9) VIAJE EN EL TIEMPO
     ----------------------------------------------------------------------
     Arrastrar a la derecha = adelantar; a la izquierda = atrasar (el sol se
     mueve igual que el dedo). Al soltar espera medio segundo y regresa
     suavemente a la hora real. Teclado: ← → (Mayús = de a 3 h), Esc.
     ====================================================================== */
  const travel = {
    offset: 0,
    dragging: false,
    started: false,
    pointerId: null,
    el: null,
    startX: 0,
    startY: 0,
    startOffset: 0,
    raf: 0,
    timer: 0,
  };

  function formatOffset(ms) {
    const sign = ms < 0 ? '−' : '+';
    const total = Math.round(Math.abs(ms) / 60000);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (!h) return sign + m + ' min';
    return m ? sign + h + ' h ' + String(m).padStart(2, '0') + ' min' : sign + h + ' h';
  }

  function renderTravel() {
    if (!ui.travel) return;
    const on = Math.abs(travel.offset) >= 30000;
    ui.travel.classList.toggle('is-on', on);
    if (on) setText(ui.travelText, formatOffset(travel.offset));
  }

  function cancelReturn() {
    if (travel.raf) cancelAnimationFrame(travel.raf);
    clearTimeout(travel.timer);
    travel.raf = 0;
  }

  function startReturn() {
    cancelReturn();
    const from = travel.offset;
    if (Math.abs(from) < 1000) {
      finishTravel();
      return;
    }
    const dur = clamp(600 + (Math.abs(from) / HOUR_MS) * 80, 650, 1800);
    let t0 = 0;
    const step = (now) => {
      if (!t0) t0 = now;
      const k = Math.min(1, (now - t0) / dur);
      travel.offset = from * (1 - easeInOutCubic(k));
      renderAll(false);
      if (k < 1) travel.raf = requestAnimationFrame(step);
      else finishTravel();
    };
    travel.raf = requestAnimationFrame(step);
  }

  function finishTravel() {
    travel.offset = 0;
    travel.raf = 0;
    document.body.classList.remove('is-traveling');
    renderAll(false);
  }

  let renderQueued = false;
  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderAll(false);
    });
  }

  function onPointerDown(ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    cancelReturn();
    travel.el = ev.currentTarget;
    travel.pointerId = ev.pointerId;
    travel.startX = ev.clientX;
    travel.startY = ev.clientY;
    travel.startOffset = travel.offset;
    travel.started = false;
    travel.dragging = true;
  }

  function onPointerMove(ev) {
    if (!travel.dragging || ev.pointerId !== travel.pointerId) return;
    const dx = ev.clientX - travel.startX;
    const dy = ev.clientY - travel.startY;
    if (!travel.started) {
      // Solo arranca con un gesto claramente horizontal (el vertical es scroll).
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        endDrag();
        return;
      }
      if (Math.abs(dx) < 6) return;
      travel.started = true;
      try { travel.el.setPointerCapture(ev.pointerId); } catch (err) { /* sin captura: igual funciona */ }
      travel.el.classList.add('is-dragging');
      document.body.classList.add('is-traveling');
    }
    const msPerPx = (TRAVEL_HOURS_PER_WIDTH * HOUR_MS) / Math.max(travel.el.clientWidth, 1);
    travel.offset = clamp(travel.startOffset + dx * msPerPx, -TRAVEL_MAX_MS, TRAVEL_MAX_MS);
    requestRender();
  }

  function endDrag() {
    if (!travel.dragging) return;
    travel.dragging = false;
    if (travel.el) travel.el.classList.remove('is-dragging');
    if (travel.started || travel.offset) {
      clearTimeout(travel.timer);
      travel.timer = setTimeout(startReturn, 500);
    }
    travel.started = false;
  }

  function onPointerUp(ev) {
    if (ev.pointerId !== travel.pointerId) return;
    endDrag();
  }

  /** En pantallas táctiles el navegador "captura" el dedo en el elemento
      tocado (canvas, SVG…). Cuando la tarjeta toma la captura, ese hijo
      la pierde y avisa con lostpointercapture: eso NO es soltar el dedo,
      así que solo cuenta si quien pierde la captura es la tarjeta misma. */
  function onLostCapture(ev) {
    if (ev.target !== ev.currentTarget) return;
    onPointerUp(ev);
  }

  function onKeyDown(ev) {
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      ev.preventDefault();
      cancelReturn();
      const step = (ev.shiftKey ? 180 : 30) * 60000 * (ev.key === 'ArrowRight' ? 1 : -1);
      travel.offset = clamp(travel.offset + step, -TRAVEL_MAX_MS, TRAVEL_MAX_MS);
      document.body.classList.add('is-traveling');
      renderAll(false);
      travel.timer = setTimeout(startReturn, 2200);
    } else if (ev.key === 'Escape' && travel.offset) {
      startReturn();
    }
  }


  /* ======================================================================
     10) BUCLE PRINCIPAL Y ARRANQUE
     ====================================================================== */
  let places = [];
  let tickTimer = 0;

  /** Pinta todo para el instante actual (+ el viaje en el tiempo). */
  function renderAll(animateDigits) {
    const ms = Date.now() + travel.offset;
    const moon = moonIllumination(ms);
    const wcs = places.map((p) => wallClock(ms, p.zone));
    places.forEach((p, i) => {
      renderClock(p, wcs[i], animateDigits);
      renderSky(p, ms, wcs[i], moon);
    });
    if (places.length === 2) {
      renderBridge(wcs);
      renderShift(wcs);
    }
    if (!travel.offset) renderTexts(wcs);
    renderTravel();
  }

  /** Tic cada segundo, alineado al cambio de segundo del reloj. */
  function tick() {
    if (!travel.offset) renderAll(true);
    scheduleTick();
  }

  function scheduleTick() {
    clearTimeout(tickTimer);
    tickTimer = setTimeout(tick, 1000 - (Date.now() % 1000) + 12);
  }

  function starLoop(t) {
    requestAnimationFrame(starLoop);
    for (let i = 0; i < places.length; i++) {
      if (places[i].stars) places[i].stars.frame(t, !reduceMotion);
    }
  }

  function init() {
    places = PLACES.map((cfg) => {
      const el = document.querySelector('[data-place="' + cfg.key + '"]');
      if (!el) return null;
      const q = (sel) => el.querySelector(sel);
      const place = Object.assign({}, cfg, {
        el,
        slots: {},
        periodEl: q('[data-role="period"]'),
        dateEl: q('[data-role="date"]'),
        shiftEl: q('[data-role="shift"]'),
        srEl: q('[data-role="sr"]'),
        phaseEl: q('[data-role="moon-phase"]'),
        handH: q('[data-role="hand-h"]'),
        handM: q('[data-role="hand-m"]'),
        hasSea: !!q('[data-role="glint-sun"]'),
        lastPhase: '',
        geom: null,
        elevation: 0,
        rising: true,
        stars: null,
      });
      el.querySelectorAll('.slot[data-d]').forEach((s) => { place.slots[s.getAttribute('data-d')] = s; });
      const canvas = q('[data-role="stars"]');
      if (canvas && canvas.getContext) {
        const field = new StarField(canvas, cfg.seed);
        if (field.ctx) place.stars = field;
      }
      buildFlag(q('[data-role="flag"]'));
      return place;
    }).filter(Boolean);

    if (!places.length) return;

    ui.diffNum = document.querySelector('[data-role="diff-num"]');
    ui.diffUnit = document.querySelector('[data-role="diff-unit"]');
    ui.diffNote = document.querySelector('[data-role="diff-note"]');
    ui.travel = document.querySelector('[data-role="travel"]');
    ui.travelText = document.querySelector('[data-role="travel-text"]');

    places.forEach(measure);
    renderAll(false);

    // Activa las transiciones después del primer pintado (así el sol y la
    // luna no "vuelan" desde una esquina al cargar).
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

    // Medidas al cambiar el tamaño de la ventana o de las tarjetas.
    const remeasure = () => {
      places.forEach(measure);
      renderAll(false);
    };
    if ('ResizeObserver' in window) {
      let queued = false;
      const ro = new ResizeObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          remeasure();
        });
      });
      places.forEach((p) => ro.observe(p.el));
    } else {
      window.addEventListener('resize', remeasure);
    }

    // Viaje en el tiempo (mouse, dedo o lápiz + teclado).
    places.forEach((p) => {
      p.el.addEventListener('pointerdown', onPointerDown);
      p.el.addEventListener('pointermove', onPointerMove);
      p.el.addEventListener('pointerup', onPointerUp);
      p.el.addEventListener('pointercancel', onPointerUp);
      p.el.addEventListener('lostpointercapture', onLostCapture);
      p.el.addEventListener('keydown', onKeyDown);
    });

    // Al volver a la pestaña: ponerse al día de inmediato.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        renderAll(false);
        scheduleTick();
      }
    });

    // Si el usuario cambia la preferencia de "movimiento reducido".
    if (motionQuery) {
      const onMotion = (e) => {
        reduceMotion = e.matches;
        places.forEach((p) => { if (p.stars) p.stars.drawn = -1; });
      };
      if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
      else if (motionQuery.addListener) motionQuery.addListener(onMotion);
    }

    scheduleTick();
    requestAnimationFrame(starLoop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
