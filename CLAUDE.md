# CLAUDE.md · Diferencia_Horaria_Italia_Colombia

> Contexto para futuros chats de Claude (o de otra IA). **Leer completo antes de tocar el proyecto.**
> Creado el 1 de octubre de 2026.

---

## 1. Qué es

- Página web **pequeña y personal de JX** que muestra la **hora en vivo de Roma (Italia) y de Cartagena (Colombia)**, cada una dentro de su propia "ventana de cielo", y en el centro la **diferencia horaria** entre los dos países.
- El cielo de cada ciudad es **real**: la posición del sol se calcula con astronomía (algoritmo NOAA) para las coordenadas del Coliseo y de la Torre del Reloj. De día se ve el sol; al amanecer la luna se esconde por la derecha mientras el sol sale por la izquierda; de noche el cielo queda oscuro, con estrellas, estrellas fugaces y la luna con su **fase real** del día.
- **Proyecto propio de JX, no de cliente.** Por eso **NO lleva** el crédito "Diseño y desarrollo: JX Company" (regla de JX: en proyectos propios solo se pone si él lo pide expresamente).
- **Alcance pedido por JX:** solo HTML, CSS y JS en archivos separados dentro de una carpeta, más este `CLAUDE.md` y el `README.md`. Sin textos ni imágenes extra en la página. **No es una landing**: no lleva 404, sitemap, robots, llms.txt, páginas legales, GA4 ni banner de cookies (no recoge datos ni usa cookies). Si algún día se publica y JX quiere esos extras, preguntarle antes.
- Modo de diseño: **Modo 2 · Diseño libre** (JX eligió "Dame lo mejor" en todas las preguntas).

## 2. Estructura de archivos

```
Diferencia_Horaria_Italia_Colombia/
├── index.html        ← esqueleto: 2 tarjetas (cielo + siluetas SVG + textos) y el puente central
├── CLAUDE.md         ← este archivo (contexto para futuros chats)
├── README.md         ← documentación completa del proyecto
├── css/
│   └── styles.css    ← diseño, capas del cielo, animaciones y responsive
└── js/
    └── script.js     ← hora de cada zona, astronomía, colores del cielo, estrellas y viaje en el tiempo
```

Vanilla HTML/CSS/JS, sin librerías ni build. Única dependencia externa: Google Fonts (Fraunces y Outfit), cargadas sin bloquear; sin internet se ve con fuentes del sistema.

## 3. Lo que se ve en la página

- **Computador / tablet horizontal:** `[Tarjeta Italia] [Puente: diferencia] [Tarjeta Colombia]`.
- **Celular y tablet vertical:** tarjetas apiladas, lo bastante bajitas para que las dos quepan sin hacer scroll; el puente pasa a ser una pastilla horizontal.
- **Capas de cada tarjeta**, de atrás hacia adelante: cielo (degradado + resplandor del horizonte) → canvas de estrellas y fugaces → luna → sol → nubes → paisaje lejano (SVG) → *(solo Cartagena: olas y reflejos del sol/luna en el mar)* → paisaje cercano (SVG) → velo de legibilidad → encabezado (bandera + país + ciudad) → reloj + fecha.
- **Siluetas Roma:** colinas, ciudad lejana, cúpula de San Pedro, arboleda, Coliseo (arcos encendidos de noche), pinos piñoneros, cipreses, suelo y faroles.
- **Siluetas Cartagena:** mar Caribe con olas, torres de Bocagrande, ciudad amurallada (catedral y cúpula de San Pedro Claver), muralla con garita, Torre del Reloj (su reloj marca la hora real de Cartagena), faroles, palmeras y camellón.
- **Únicos textos visibles:** país, ciudad, hora, a. m./p. m., fecha, "+1 día" (solo cuando ese país ya pasó a mañana), la diferencia ("7 horas") y "Italia va adelante". El aviso flotante "+3 h 20 min" solo aparece durante el viaje en el tiempo.
- **Viaje en el tiempo (función oculta, sin texto en la página):** arrastrar horizontalmente cualquier cielo adelanta (→) o atrasa (←) las horas en los dos países; al soltar espera 0,5 s y vuelve sola a la hora real. Con teclado: tarjeta enfocada + flechas ← → (30 min; con Mayús, 3 h), Esc para volver.

## 4. Dónde editar cada cosa

| Quiero cambiar… | Archivo | Dónde exactamente |
|---|---|---|
| Ciudad, país, zona horaria o coordenadas | `js/script.js` | Constante `PLACES` (sección 1). También el `<h2>` y la ciudad en `index.html`, y `data-place` si cambia la clave |
| Colores del cielo según la hora | `js/script.js` | Tablas `SKY`, `GLOW` y `SUN` (fotogramas por altura del sol, en grados) |
| Colores del paisaje (día / noche / iluminado) | `js/script.js` | `PLACES[].palette` |
| Colores que se ven si el JS no carga | `css/styles.css` | `.place--it` y `.place--co` (sección 4) |
| Sensibilidad del arrastre | `js/script.js` | `TRAVEL_HOURS_PER_WIDTH` (12 h por ancho de tarjeta) y `TRAVEL_MAX_MS` (tope ±48 h) |
| Cuánto espera antes de volver a la hora real | `js/script.js` | `endDrag()` (500 ms) y `onKeyDown()` (2200 ms) |
| Formato de hora y fecha | `js/script.js` | `renderClock()`, `shortTime()`, `longDate()`, `DAYS`, `MONTHS` |
| Texto "Italia va adelante" / "horas" | `js/script.js` | `renderBridge()` |
| Nubes (altura, tamaño, velocidad) | `index.html` | Atributo `style` de cada `<svg class="cloud">`: `--top`, `--w`, `--dur`, `--delay` |
| Dibujos de las ciudades | `index.html` | SVG "PAISAJE LEJANO" y "PAISAJE CERCANO" de cada tarjeta (ver puntos delicados) |
| Banderas | `css/styles.css` | `.flag--it` / `.flag--co` (`--flag-bg`); las franjas que ondean las crea `buildFlag()` |
| Tipografías | `index.html` + `css/styles.css` | `<link>` de Google Fonts y variables `--font-display` / `--font-ui` en `:root` |
| Tamaño de las tarjetas y responsive | `css/styles.css` | `--card-w` en `:root` y sección 18 |
| Estrellas y fugaces | `js/script.js` | `StarField` (sección 6): cantidad, titileo y frecuencia de fugaces |

## 5. Convenciones del proyecto

- **Ganchos HTML ↔ JS:** el JS busca elementos por `data-place` (`italia` / `colombia`), `data-role` (`stars`, `moon`, `moon-phase`, `sun`, `flag`, `period`, `date`, `shift`, `sr`, `glint-sun`, `glint-moon`, `hand-h`, `hand-m`, `diff-num`, `diff-unit`, `diff-note`, `travel`, `travel-text`) y `data-d` (dígitos `h1 h2 m1 m2 s1 s2`). Las clases son solo para estilo.
- **El JS solo escribe variables CSS** en cada `.place` (lista completa en el Mapa del código); el CSS solo las lee. Nunca poner colores del cielo a mano en el CSS.
- **Clases de estado que pone el JS:** `body.is-ready` (activa transiciones tras el primer pintado), `body.is-traveling` (apaga transiciones mientras se arrastra), `.place.is-dragging`, `.travel.is-on`, `.slot.is-empty`, `.g.is-in` / `.g.is-out` (dígitos rodando), `.flag__cloth.is-waving`.
- **IDs del SVG únicos por tarjeta** con sufijo `-it` / `-co` (`moon-clip-it`, `moon-lit-co`, `lamp-glow-it`, `sea-co`, `clock-glow-co`…). Si se duplica un ID, una tarjeta "roba" el degradado o el recorte de la otra.
- **Todo el código comentado en español:** encabezado en cada archivo y un comentario encima de cada bloque explicando qué es, para qué sirve y de qué depende.
- **Accesibilidad:** el reloj visual está oculto a lectores de pantalla; cada tarjeta tiene un texto `.sr-only` que se actualiza cada minuto ("En Roma, Italia, son las…"). Respeta `prefers-reduced-motion`.

## 6. Pendientes `{POR CONFIRMAR}`

**Ninguno.** La página no tiene datos de negocio: todo (hora, sol, luna, diferencia) se calcula en vivo.

## 7. Decisiones tomadas (y por qué)

1. **Dos ventanas de cielo lado a lado + puente central; apiladas en celular** → elección de JX ("Dame lo mejor").
2. **Reloj digital 12 h con a. m./p. m.** (formato colombiano), segundos y periodo pequeños al lado, **dígitos que ruedan**; la decena de la hora desaparece en 1–9 ("9:42", no "09:42").
3. **Textos:** país + ciudad + fecha, y "+1 día" cuando un país ya está en el día siguiente.
4. **Extras elegidos por JX:** luna con fase real + estrellas fugaces, siluetas de cada ciudad y viaje en el tiempo.
5. **Diferencia horaria con `Intl` (zonas IANA `Europe/Rome` y `America/Bogota`)**: el cambio de horario de Italia se aplica solo. Hoy son **7 h**; el **25 de octubre de 2026** (3:00 → 2:00 en Italia) pasa a **6 h**, y vuelve a 7 h el **28 de marzo de 2027**. Colombia no tiene horario de verano (UTC−5 todo el año). Hay reglas de respaldo por si `Intl` fallara.
6. **No depende de la zona horaria del visitante:** se probó con el navegador en Bogotá, Roma, Tokio y Honolulu, y siempre muestra lo mismo.
7. **Sol con convención estándar (USNO, −0,833°):** a la hora oficial de salida/puesta el disco está a medio horizonte y a −3,5° ya se escondió del todo.
8. **La luna se dibuja en el punto opuesto al sol** (sale cuando el sol se pone y se esconde cuando sale) para que **siempre haya luna de noche**, como pidió JX; su **fase sí es la real** del día.
9. **Torre del Reloj con manecillas reales** (hora de Cartagena) y **ventanas que se encienden de a poco** al anochecer (umbral `--th` por ventana).
10. **Sin imágenes rasterizadas:** todo es SVG, CSS y canvas dibujado en código; favicon en SVG en línea para evitar el 404 de `/favicon.ico`.
11. **Rendimiento:** sol, luna, nubes, olas y reflejos se mueven con `transform` (GPU); las olas van en su propia capa SVG; no se anima `box-shadow`; las estrellas titilan a ~25 fps y solo se dibujan cuando oscurece.
12. **Sin crédito de JX Company en la página** (proyecto propio) y **sin archivos de landing** (JX pidió solo HTML/CSS/JS + estos dos `.md`).

---

## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP
Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto nueva que JX entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP de inmediato** antes de meterla al proyecto, conservando resolución y calidad originales, y se guarda en `img/`. Nunca dejar JPG/PNG en el proyecto ni entregar copias de respaldo en otros formatos.
**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y `apple-touch-icon.png`, porque ningún navegador soporta favicons en WebP.

> Nota de este proyecto: hoy no tiene ninguna imagen rasterizada (todo está dibujado en SVG/CSS/canvas) y el favicon es un SVG en línea dentro del `<head>`. Si algún día se agrega una imagen, aplica la regla de arriba y se crea la carpeta `img/`.

---

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO
Cualquier sección, componente, botón o página que se agregue a futuro debe usar **exactamente** el diseño de esta web: mismos colores, mismas tipografías, mismos tamaños, radios, sombras y espaciados, y los mismos patrones de componente que ya existen. **Nunca un diseño distinto.** Si algo no alcanza con lo que hay, preguntarle a JX antes de inventar.

**Ficha de diseño de este proyecto:**

- **Paleta (variables `:root` de `css/styles.css`):**
  - `--bg: #0b0c11` → fondo carbón neutro de la página.
  - `--ink: #f6f3ec` → texto principal (marfil).
  - `--ink-2: rgba(246, 243, 236, .8)` → ciudad, fecha, segundos, a. m./p. m.
  - `--ink-3: rgba(246, 243, 236, .58)` → textos secundarios ("horas", "Italia va adelante").
  - `--hair: rgba(255, 255, 255, .12)` → bordes finos (insignia y aviso flotante).
  - Banderas (oficiales): Italia `#008c45` · `#f4f5f0` · `#cd212a`; Colombia `#fcd116` (½) · `#003893` (¼) · `#ce1126` (¼).
  - Luces nocturnas: ventanas `#ffd58e` (Bocagrande `#fff2cc`), bombillos `#ffe3a8`, resplandor de faroles `#ffd890`, brillo del reloj `#fff1c4`; postes `#1f2228`.
  - Luna: cara oscura `#2c3448`, mares `#b0ab9b`, degradado iluminado `#fffdf4 → #ebe7da → #c9c4b4`.
  - **Colores del cielo y del paisaje:** no son fijos; salen de las tablas `SKY`, `GLOW`, `SUN` y de `PLACES[].palette` en `js/script.js` (de noche cerrada `#04060e` a mediodía `#255fc6`). Para cambiar tonos se tocan esas tablas, no el CSS.
- **Tipografías:**
  - Títulos: **Fraunces** 600 (nombre del país y número de la diferencia; `opsz` automático).
  - Interfaz: **Outfit** — 250 (reloj grande), 400 (segundos y fecha), 500 (ciudad, a. m./p. m., "horas", "+1 día", aviso flotante).
  - Respaldo: `--font-display` → Iowan Old Style, Palatino, Georgia; `--font-ui` → Avenir Next, Segoe UI, system-ui, Roboto.
- **Escala de tamaños** (dentro de las tarjetas todo escala con `cqw`/`cqh`):
  - País: `clamp(1.05rem, 7.4cqw, 2rem)`; ciudad: `clamp(.58rem, 3.3cqw, .82rem)`, MAYÚSCULAS con `letter-spacing: .24em`.
  - Reloj (`--clock-size`): `clamp(1.9rem, min(15.5cqw, 16cqh), 4.6rem)` en computador; `clamp(1.8rem, min(11.8cqw, 16cqh), 4.2rem)` apilado. Segundos y a. m./p. m. = reloj × 0,3; fecha = reloj × 0,245.
  - Insignia de la diferencia (`--badge`): `clamp(78px, 8.4vw, 112px)` (120px en ≥1600px; pastilla de 40px apilado); número = insignia × 0,42; "HORAS" = insignia × 0,115 con `letter-spacing: .24em`.
  - Aviso flotante: `.92rem`; nota del puente: `.8rem`.
- **Radios:** tarjetas `26px` (`--radius`); pastillas `99px`; insignia circular `50%`; bandera `2px`.
- **Sombras:**
  - Tarjeta: `0 32px 80px -34px var(--ambient)` (toma el color del cielo) + `0 14px 34px -16px rgba(0,0,0,.7)`; filo interior `inset 0 0 0 1px rgba(255,255,255,.08)`.
  - Insignia: `inset 0 0 0 1px var(--hair)`, `inset 0 1px 0 rgba(255,255,255,.06)`, `0 20px 44px -18px rgba(0,0,0,.85)`.
  - Aviso flotante: `inset 0 0 0 1px var(--hair)`, `0 12px 30px -12px rgba(0,0,0,.75)`.
  - Reloj: `filter: drop-shadow(0 2px 10px rgba(0,0,0,.28))` (**no** usar `text-shadow`: el `overflow` de cada dígito la recorta en rectángulos).
  - Encabezado: `text-shadow: 0 1px 14px rgba(0,0,0,.35)`; bandera: `drop-shadow(0 2px 4px rgba(0,0,0,.35))`.
- **Espaciados:** `--gap: clamp(14px, 2.4vw, 34px)` entre tarjetas; relleno interno `--pad: clamp(14px, 6.2cqw, 28px)` (apilado `clamp(13px, 4.6cqw, 30px)`).
- **Movimiento:** curva `--ease-out: cubic-bezier(.2, .8, .2, 1)`; dígitos 0,55 s; transiciones del sol/luna de 1 s lineales (se apagan durante el viaje en el tiempo).
- **Patrones de componente:**
  - *Tarjeta de lugar*: ventana 3:4 con esquinas de 26px, cielo vivo, siluetas planas por capas (más claras y brumosas atrás, más oscuras adelante), velo oscuro arriba/abajo, encabezado arriba a la izquierda y reloj abajo a la izquierda.
  - *Bandera*: paño de 3:2 con astil plateado y remate; ondea por franjas.
  - *Insignia*: círculo oscuro con bisel punteado que gira lento; número en Fraunces y unidad en MAYÚSCULAS espaciadas.
  - *Pastillas* (aviso, "+1 día", puente en celular): radio 99px, fondo oscuro o blanco translúcido, texto 500.
- **Modo de diseño usado:** 2 · Diseño libre.

---

## 🗂️ ÍNDICE DE ZONAS EDITABLES
**Este proyecto no tiene zonas editables marcadas** (`ZONA EDITABLE`): no hay precios, horarios, contactos ni textos de negocio; todo lo que se ve se calcula en vivo. Lo que se puede personalizar está en la tabla de la sección 4. Si en el futuro se agregan contenidos fijos, seguir la convención de JX (`<!-- ▼▼▼ ZONA EDITABLE · NOMBRE ▼▼▼ … -->`) y registrarlos aquí.

---

## 🧭 MAPA DEL CÓDIGO
Registro de todo el código del proyecto: qué hay en cada archivo, qué función cumple cada bloque, qué depende de qué y las decisiones tomadas. **Cada vez que se agregue o modifique código, se anota aquí** (al final, en el registro de cambios). Se suma, nunca se borra lo anterior.

### `index.html`
| Bloque | Qué hace | Depende de |
|---|---|---|
| `<head>` | Título, descripción, `theme-color`, favicon SVG en línea, Google Fonts sin bloquear (`preload` + `onload`), `css/styles.css` y `js/script.js` con `defer` | — |
| `main.stage` | Escenario con las dos tarjetas y el puente; `h1` oculto para lectores de pantalla | Sección 3 del CSS |
| `article.place--it` (`data-place="italia"`) | Tarjeta de Roma: `.sky` con canvas de estrellas, luna (SVG con recorte `#moon-clip-it`), sol, 3 nubes, paisaje lejano (colinas, ciudad, San Pedro, ventanas, arboleda), paisaje cercano (Coliseo con arcos en un solo `path.arch`, pinos, cipreses, suelo, 5 faroles), velo; encabezado con bandera; reloj con slots `data-d`; fecha, "+1 día" y texto `.sr-only` | `PLACES[0]` en el JS; secciones 4–14 del CSS |
| `div.bridge` | Hilo punteado + insignia ("7" / "horas") + nota ("Italia va adelante") | `renderBridge()`; sección 15 del CSS |
| `article.place--co` (`data-place="colombia"`) | Tarjeta de Cartagena: igual que Roma + mar con degradado `#sea-co`, Bocagrande con ventanas, **capa propia de olas** (`.scene--waves`), reflejos `.glint`, ciudad amurallada, muralla, garita, **Torre del Reloj** (manecillas `data-role="hand-h/hand-m"`), 3 faroles, 3 palmeras y camellón | `PLACES[1]`; `VB.seaBottom`; sección 10 del CSS |
| `div.travel` | Aviso flotante del viaje en el tiempo | `renderTravel()`; sección 16 del CSS |

### `css/styles.css` (índice en su encabezado)
1 Tokens · 2 Base y `.sr-only` · 3 Escenario (grid de 3 columnas) · 4 Tarjeta (container de tamaño, sombra `--ambient`, colores de respaldo) · 5 Cielo (degradado + resplandor con `--horizon`) · 6 Sol (halo, rayos que giran, disco que se aplasta en el horizonte) · 7 Luna · 8 Nubes (`drift` con `cqw`) · 9 Paisaje: clases de color `.c-*` que leen las variables del JS, ventanas con umbral `--th`, faroles, reloj de la torre, olas · 10 Reflejos en el mar · 11 Velo · 12 Encabezado y bandera por franjas · 13 Reloj con dígitos rodantes · 14 Fecha y "+1 día" · 15 Puente · 16 Aviso del viaje · 17 Animaciones (`@keyframes`) · 18 Responsive · 19 Movimiento reducido.

### `js/script.js` (todo dentro de una función autoejecutable, sin variables globales)
| Sección | Contenido | Notas |
|---|---|---|
| 0 Utilidades | `clamp`, `lerp`, `smoothstep`, `hexToRgb`, `mix`, `rgb`/`rgba`, `mulberry32` (aleatorio con semilla), `sample` (interpola tablas de fotogramas), `setText` | `setText` solo toca el DOM si el texto cambió |
| 1 Configuración | `PLACES` (Italia/Colombia: zona, coordenadas, semilla, paleta), tablas `SKY`/`GLOW`/`SUN`, tintes `GOLD`/`ROSE`, nubes, `VB` (viewBox 600×480, horizonte 300, muralla 336), constantes del viaje, `DAYS`/`MONTHS` | El **orden** de `PLACES` importa: [0] Italia, [1] Colombia |
| 2 Zonas horarias | `zoneOffset()` (Intl con `hour12:false`, corrige "24" y AM/PM), `fallbackOffset()` (reglas UE/Colombia), `lastSundayUtc()`, `wallClock()` | Independiente de la zona del visitante |
| 3 Astronomía | `sunPosition()` (NOAA: elevación, ángulo horario y `H0` de salida/puesta), `moonIllumination()` (fórmulas de Astronomy Answers/SunCalc: fracción y fase), `moonPhasePath()` (dibuja la fase), `bodyY()` (altura en px del astro) | Verificado contra PyEphem (diferencias de segundos) |
| 4 Reloj | `setSlot()` (dígito que rueda), `shortTime()`, `longDate()`, `renderClock()` | Animación solo en el tic normal, nunca en el viaje |
| 5 Cielo y paisaje | `renderSky()` escribe todas las variables CSS de una tarjeta; `measure()` calcula el horizonte en px según el tamaño (SVG con `xMidYMax slice`) | Ver tabla de variables abajo |
| 6 Estrellas | `StarField` en canvas: `resize`, `frame` (~25 fps, se apaga de día), `draw` (estrellas con titileo y destello en cruz + fugaces), `maybeShoot` (cada 5–16 s en noche cerrada) | Con movimiento reducido: estrellas quietas, sin fugaces |
| 7 Bandera | `buildFlag()` crea 14 franjas con `--i` y `--amp` | El CSS hace la animación |
| 8 Textos | `renderBridge()`, `renderShift()` ("+1 día"), `skyState()`, `renderTexts()` (título de la pestaña y texto para lectores, cada minuto) | — |
| 9 Viaje en el tiempo | Estado `travel`, `formatOffset()`, `renderTravel()`, `startReturn()` (regreso suave con `easeInOutCubic`), `finishTravel()`, `requestRender()` (1 render por frame), `onPointerDown/Move/Up`, `endDrag()`, `onKeyDown()` | Solo arranca con gesto horizontal (> 6 px); el vertical sigue siendo scroll (`touch-action: pan-y`) |
| 10 Bucle y arranque | `renderAll()`, `tick()` cada segundo alineado al cambio de segundo, `starLoop()` (rAF), `init()` (busca elementos, mide, pinta, `ResizeObserver`, eventos, `visibilitychange`, cambio de movimiento reducido) | Si falta un elemento, se salta sin romper nada |

**Variables CSS que escribe el JS en cada `.place`:**
`--horizon`, `--sun-d`, `--moon-d`, `--sky-top`, `--sky-mid`, `--sky-bot`, `--glow-color`, `--glow-x`, `--glow-rx`, `--glow-ry`, `--sun-x`, `--sun-y`, `--sun-o`, `--sun-core`, `--sun-edge`, `--sun-halo`, `--sun-squash`, `--rays-o`, `--moon-x`, `--moon-y`, `--moon-o`, `--moon-glow`, `--cloud`, `--cloud-shade`, `--cloud-a`, `--lights`, `--veil-top`, `--veil-bot`, `--ambient`, los colores de la paleta (`--c-far`, `--c-far2`, `--c-dome`, `--c-mid`, `--c-land`, `--c-land2`, `--c-arch`, `--c-tree`, `--c-near` en Roma; `--c-far`, `--c-sea-top`, `--c-sea-bot`, `--c-sea-line`, `--c-mid`, `--c-wall`, `--c-wall2`, `--c-tower`, `--c-trim`, `--c-arch`, `--c-clock`, `--c-tree`, `--c-near` en Cartagena) y, solo en Cartagena, `--glint-top`, `--glint-h`, `--glint-w`, `--glint-sun-x`, `--glint-sun-o`, `--glint-sun-c`, `--glint-moon-x`, `--glint-moon-o`.

**Puntos delicados (no romper):**
- Si se redibujan las siluetas y cambia la línea del horizonte (y = 300) o el borde de la muralla (y = 336), actualizar `VB` en `script.js`; si no, el sol se esconde en el lugar equivocado.
- Las manecillas giran alrededor de (300, 268): si se mueve la Torre del Reloj, actualizar ese centro en `renderSky()`.
- Mantener iguales las claves `data-place` del HTML y `PLACES[].key` del JS.
- No cambiar `preserveAspectRatio="xMidYMax slice"` ni el `viewBox` 600×480 sin revisar `measure()`.
- No usar `text-shadow` en el reloj (usar `drop-shadow`) ni animar `box-shadow` (repinta en cada frame).

### Registro de cambios
- **2026-10-01 · Creación.** Estructura completa: dos tarjetas con cielo real, siluetas de Roma y Cartagena, banderas que ondean, reloj de 12 h con dígitos rodantes, diferencia horaria automática, luna con fase real, estrellas y fugaces, luces que se encienden al anochecer, reflejos en el mar, reloj de la Torre con hora real y viaje en el tiempo (mouse, dedo y teclado).
- **2026-10-01 · Ajustes tras las pruebas.** (a) `bodyY()`: el sol queda a medio horizonte a la hora oficial de salida/puesta. (b) Nubes más abajo (≥ 23 %) para no tapar bandera y nombre. (c) Suelo más claro de día en ambas ciudades y postes de faroles en gris hierro. (d) `drop-shadow` en el reloj en vez de `text-shadow`. (e) Tablets verticales también apiladas y con tamaños mayores. (f) Olas en su propia capa SVG animada por GPU. (g) `Intl` con `hour12:false` + conversión de AM/PM por compatibilidad. (h) Quitada la transición de `box-shadow` de las tarjetas (rendimiento).
- **2026-10-01 · Documentación.** Se agregan `CLAUDE.md` y `README.md` a pedido de JX.
