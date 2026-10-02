# Italia ⇄ Colombia · Hora en vivo con su cielo real

Página pequeña que muestra **la hora en vivo de Roma (Italia) y de Cartagena (Colombia)**, cada una dentro de su propia ventana de cielo, y en el centro **la diferencia horaria** entre los dos países.

El cielo de cada ciudad es el **de verdad**: la posición del sol se calcula con astronomía para el Coliseo y para la Torre del Reloj. Si en Roma está anocheciendo, su tarjeta se pone rosada y naranja, se encienden las luces y salen las estrellas; si en Cartagena es mediodía, el sol está arriba y el mar brilla.

Hecha en **HTML, CSS y JavaScript puros**: sin librerías, sin instalar nada y sin pedir datos a internet. Todo se calcula en el propio navegador.

🌐 **En vivo:** [diferencias-horarios.pages.dev](https://diferencias-horarios.pages.dev/)

---

## Qué tiene

- **Dos relojes en vivo** (formato 12 h con a. m./p. m.) con segundos y números que ruedan al cambiar.
- **Fecha de cada país** y aviso **"+1 día"** cuando en Italia ya es mañana y en Colombia todavía no.
- **Diferencia horaria automática:** hoy son **7 horas** y pasa sola a **6 horas** cuando Italia cambia a su horario de invierno. "Italia va adelante".
- **Sol real:** sale por la izquierda, sube según la estación y se pone por la derecha, a la hora oficial de cada ciudad.
- **Amanecer y atardecer reales:** el cielo pasa de noche cerrada a los crepúsculos, al dorado del amanecer y al azul del día (y al revés en la tarde).
- **Luna con su fase real del día** (llena, creciente, menguante…): sale cuando el sol se pone y se esconde cuando el sol sale.
- **Noche de verdad:** cielo oscuro, estrellas que titilan y **estrellas fugaces** de vez en cuando.
- **Siluetas de cada ciudad:**
  - **Roma:** el Coliseo (sus arcos se iluminan de noche), la cúpula de San Pedro, pinos piñoneros, cipreses y faroles.
  - **Cartagena:** la Torre del Reloj (**su reloj marca la hora real de Cartagena**), las murallas con su garita, la catedral, San Pedro Claver, palmeras, el mar Caribe con olas y reflejos, y los edificios de Bocagrande.
- **Las ventanas y los faroles se encienden de a poco** cuando anochece.
- **Banderas que ondean**, nubes que cruzan el cielo y tonos que cambian con la luz del día.
- **Viaje en el tiempo** (función oculta, ver abajo): con mouse, con el dedo o con el teclado.
- **Vista previa al compartir:** al pegar el enlace en WhatsApp, Facebook, X o Telegram sale una foto de la página con el título *"Diferencia de hora entre Colombia e Italia"* y el texto *"… Creado por JX."*
- **Responsive:** en computador, tablet acostada y celular acostado las tarjetas van lado a lado; en celular y tablet en vertical se apilan y las dos caben en la pantalla sin hacer scroll (desde 280 px de ancho).

---

## Cómo verla

**En internet:** https://diferencias-horarios.pages.dev/

**En el computador:**

1. Descomprime el ZIP.
2. Abre `index.html` con doble clic (Chrome, Edge, Safari o Firefox).
3. **No separes los archivos:** `index.html` necesita tener al lado sus carpetas `css/` y `js/`.

> Opcional, para probarla como en un servidor: dentro de la carpeta ejecuta `python -m http.server 8080` y entra a `http://localhost:8080` (o usa la extensión *Live Server* de VS Code).

## Cómo se usa

La página funciona sola: se actualiza cada segundo y no hay que tocar nada.

**Viaje en el tiempo** (no tiene texto en la página para que quede limpia):

| Acción | Qué pasa |
|---|---|
| Arrastrar un cielo hacia la **derecha** (mouse o dedo) | Adelanta las horas en los dos países: el sol avanza, cae la tarde, sale la luna… |
| Arrastrar hacia la **izquierda** | Atrasa las horas |
| Soltar | Medio segundo después todo vuelve solo y suave a la hora real |
| Teclado: clic en una tarjeta (o `Tab`) y flechas `←` `→` | Mueve 30 minutos por toque (`Mayús` + flecha = 3 horas) |
| `Esc` | Regresa enseguida a la hora real |

Mientras viajas, arriba aparece un aviso con cuánto adelantaste o atrasaste (ej. `+3 h 20 min`). Arrastrar todo el ancho de una tarjeta equivale a 12 horas. En el celular, deslizar hacia arriba o abajo sigue siendo scroll normal; solo el gesto horizontal mueve el tiempo.

---

## Estructura de archivos

```
Diferencia_Horaria_Italia_Colombia/
├── index.html        ← la página: tarjetas, dibujos de las ciudades, textos y datos para compartir
├── README.md         ← este archivo
├── _redirects        ← regla de Cloudflare Pages (protege un archivo privado de trabajo)
├── .gitignore        ← archivos que no se suben al repositorio
├── css/
│   └── styles.css    ← diseño, colores, animaciones y responsive
├── js/
│   └── script.js     ← hora de cada país, astronomía, cielo, estrellas y viaje en el tiempo
└── img/
    └── og-imagen.jpg ← imagen de la vista previa al compartir (1200 × 630)
```

---

## Cómo funciona por dentro

1. **La hora de cada país.** El navegador conoce las zonas horarias oficiales (`Europe/Rome` y `America/Bogota`) y sus cambios de horario. Por eso la página **no depende de la hora del lugar donde estés** (se probó con el navegador en Bogotá, Roma, Tokio y Honolulu y muestra siempre lo mismo).
   - Colombia: UTC−5 todo el año (no tiene horario de verano).
   - Italia: UTC+2 en verano y UTC+1 en invierno.

   | Desde | Italia | Diferencia |
   |---|---|---|
   | 29 de marzo de 2026 | horario de verano (UTC+2) | **7 horas** |
   | 25 de octubre de 2026, 3:00 → 2:00 en Italia | horario de invierno (UTC+1) | **6 horas** |
   | 28 de marzo de 2027 | horario de verano otra vez | **7 horas** |

   Italia cambia siempre el último domingo de marzo y el último domingo de octubre; la página lo aplica sola cada año.

2. **El sol.** Con la fecha, la hora y las coordenadas (Coliseo: 41,8902° N · 12,4922° E; Torre del Reloj: 10,4226° N · 75,5487° O) se calcula la altura real del sol con el algoritmo de la NOAA (Administración Nacional Oceánica y Atmosférica de EE. UU.). A la hora oficial de salida o puesta, el sol se dibuja justo a medio horizonte.

3. **El cielo.** Según la altura del sol se mezclan los colores: noche cerrada (sol a −18° o menos), crepúsculo azul y violeta, amanecer/atardecer dorado y rosado, mañana y mediodía azul. En la mañana el tono es más dorado y en la tarde más rosado.

4. **La luna.** Su **fase** es la real de ese día (fórmulas astronómicas de baja precisión, las mismas de la librería SunCalc). Para que **siempre haya luna de noche**, se dibuja en el punto opuesto al sol: sale por la izquierda cuando el sol se pone y se esconde por la derecha cuando el sol sale.

5. **Las luces y las estrellas.** Al bajar el sol se encienden faroles y ventanas (cada ventana a su ritmo), se iluminan los arcos del Coliseo y la Torre del Reloj, aparecen las estrellas y, en noche cerrada, alguna estrella fugaz cada 5 a 16 segundos.

---

## Cómo editar

| Quiero cambiar… | Archivo | Dónde |
|---|---|---|
| La ciudad, el país, la zona horaria o las coordenadas | `js/script.js` | Bloque `PLACES` al principio (y los nombres visibles en `index.html`) |
| Los colores del cielo | `js/script.js` | Tablas `SKY`, `GLOW` y `SUN` |
| Los colores de los dibujos de día y de noche | `js/script.js` | `palette` dentro de cada lugar en `PLACES` |
| Qué tanto avanza el tiempo al arrastrar | `js/script.js` | `TRAVEL_HOURS_PER_WIDTH` (hoy 12 horas por ancho de tarjeta) |
| Cuánto espera antes de volver a la hora real | `js/script.js` | `endDrag()` (500 ms) y `onKeyDown()` (2200 ms) |
| El formato de la hora o de la fecha | `js/script.js` | `renderClock()`, `shortTime()` y `longDate()` |
| El texto "Italia va adelante" | `js/script.js` | `renderBridge()` |
| Altura, tamaño o velocidad de las nubes | `index.html` | Atributo `style` de cada nube: `--top`, `--w`, `--dur`, `--delay` |
| Las tipografías | `index.html` y `css/styles.css` | El `<link>` de Google Fonts y las variables `--font-display` y `--font-ui` |
| El tamaño de las tarjetas | `css/styles.css` | Variable `--card-w` en `:root` y la sección 18 (Responsive) |
| El título, el texto o la imagen que salen al compartir el enlace | `index.html` | Bloque `ZONA EDITABLE · COMPARTIR` dentro del `<head>` |
| El dominio (si la página se muda) | `index.html` | Mismo bloque: cambiar `https://diferencias-horarios.pages.dev/` en `canonical`, `og:url`, `og:image` y `twitter:image` |

> Punto delicado: si se redibuja una ciudad hay que mantener la línea del horizonte (y = 300 en el dibujo) o actualizar `VB` en `js/script.js`; si no, el sol se esconde en el lugar equivocado.

Todo el código está comentado en español, bloque por bloque.

---

## Publicarla en internet

Hoy está publicada en **Cloudflare Pages**: https://diferencias-horarios.pages.dev/

Es una página estática, así que se puede publicar gratis.

**Cloudflare Pages (la que se usa):**
1. En el panel de Cloudflare entra a **Workers & Pages**.
2. **Create application** → **Get started** → **Drag and drop your files**.
3. Ponle un nombre al proyecto, arrastra la carpeta (o el ZIP) y pulsa **Deploy site**.
4. Queda en `https://<nombre>.pages.dev`. Para subir una versión nueva: **Create a new deployment**.

**GitHub Pages:** sube los archivos a un repositorio (con `index.html` en la raíz), entra a **Settings → Pages**, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`, y guarda.

**Hostinger u otro hosting:** sube el **contenido** de la carpeta (no la carpeta) a `public_html` desde el Administrador de archivos.

> En cualquier caso, `index.html` debe quedar en la raíz junto a `css/`, `js/`, `img/` y `_redirects`.

**Vista previa en WhatsApp y redes.** WhatsApp y Facebook guardan la vista previa en caché varios días. Si se cambia la imagen, conviene ponerle otro nombre (ej. `og-imagen-2.jpg`) y actualizarlo en el `<head>`. Para revisar cómo se ve, se puede pegar el enlace en el [Depurador de Compartir de Facebook](https://developers.facebook.com/tools/debug/) (sirve también para WhatsApp) y pulsar *Volver a extraer*.

> La imagen para compartir es una foto fija de la página tomada con 7 horas de diferencia (horario de verano de Italia). Entre el último domingo de octubre y el último domingo de marzo la página en vivo muestra 6 horas; la página siempre muestra el dato correcto, la foto es solo ilustrativa.

---

## Compatibilidad

- Navegadores actuales: **Chrome / Edge 105+, Safari 16+, Firefox 110+** (computador, Android y iPhone).
- En navegadores más viejos funciona igual con tamaños fijos de respaldo.
- Si el JS no cargara, se ve un cielo de día con los dibujos de las ciudades.
- Las tipografías (Fraunces y Outfit) se cargan de Google Fonts: sin internet, la página usa las fuentes del sistema y todo lo demás sigue funcionando.

## Accesibilidad y rendimiento

- Cada tarjeta se puede enfocar con `Tab`, y los lectores de pantalla leen la hora completa (ej. "En Cartagena, Colombia, son las 6:40 p. m. del jueves, 1 de octubre. Es de noche."), actualizada cada minuto.
- Si el sistema tiene activado **"reducir movimiento"**, se apagan las animaciones decorativas (nubes, bandera, dígitos rodantes, fugaces). El cielo sigue cambiando con la hora real.
- Las animaciones van por la tarjeta gráfica y las estrellas solo se dibujan cuando oscurece. Cuando la pestaña no está a la vista, la página casi no consume.
- Sin imágenes pesadas: todo está dibujado en código (≈ 120 KB en total, sin contar las fuentes). La única imagen, `img/og-imagen.jpg` (69 KB), no la descarga la página: solo la leen WhatsApp y las redes para la vista previa.

---

## Verificación de los datos

Última revisión completa: **2 de octubre de 2026, 12:05 a. m. (hora de Colombia)**. Primera revisión: 1 de octubre de 2026.

**Salida y puesta del sol**, calculadas con el mismo código de la página y comparadas con PyEphem (cálculo astronómico de alta precisión con la convención oficial del Observatorio Naval de EE. UU.: centro del sol a −0,833°):

| Fecha | Ciudad | Salida (página) | Salida (PyEphem) | Puesta (página) | Puesta (PyEphem) |
|---|---|---|---|---|---|
| 1 oct 2026 | Roma | 07:06:46 | 07:06:46 | 18:51:58 | 18:51:56 |
| 2 oct 2026 | Roma | 07:07:51 | 07:07:50 | 18:50:15 | 18:50:13 |
| 25 oct 2026 (ya en horario de invierno) | Roma | 06:33:48 | 06:33:51 | 17:13:44 | 17:13:47 |
| 21 dic 2026 | Roma | 07:34:15 | 07:34:13 | 16:41:55 | 16:41:55 |
| 1 oct 2026 | Cartagena | 05:50:54 | 05:50:54 | 17:52:33 | 17:52:31 |
| 2 oct 2026 | Cartagena | 05:50:52 | 05:50:51 | 17:51:56 | 17:51:55 |
| 21 dic 2026 | Cartagena | 06:14:50 | 06:14:49 | 17:45:54 | 17:45:53 |

La página coincide con PyEphem con 3 segundos o menos de diferencia. Las páginas web de horarios del sol dan entre 0 y 2 minutos de diferencia porque usan otras coordenadas (el centro de la ciudad y no el Coliseo o la Torre del Reloj) y redondean distinto: por ejemplo, para el 2 de octubre [sunrisesunsettime.org](https://www.sunrisesunsettime.org/europe/italy/rome.htm) da en Roma 07:08 y 18:52, y [Meteogram](https://meteogram.org/sun/colombia/cartagena/) da en Cartagena 05:50 y 17:52 (1 de octubre).

**El dibujo concuerda con la hora:** se pusieron los relojes exactamente a la hora oficial de salida y de puesta y se midió el sol en pantalla: en los 4 casos su centro queda **justo sobre la línea del horizonte** (medio sol), por la izquierda (este) al salir y por la derecha (oeste) al ponerse. Al mediodía solar de Cartagena (11:51 a. m.) el sol está en el centro y arriba. Las luces de la ciudad y las estrellas se encienden con el crepúsculo, como en la vida real.

**Fases de la luna de octubre de 2026** (horas UTC del calendario de [TheSkyLive](https://theskylive.com/moon-calendar?year=2026&month=10) y [timeanddate](https://www.timeanddate.com/news/astronomy/moon-october-2026), confirmadas con PyEphem): cuarto menguante el 3 a las 13:25, luna nueva el 10 a las 15:50, cuarto creciente el 18 a las 16:12 y luna llena el 26 a las 04:11. En esos momentos la página da 50,4 %, 0,1 %, 50,6 % y 99,8 % de luna iluminada (PyEphem: 50,1 %, 0,1 %, 50,2 % y 99,8 %).

**Diferencia horaria:** 7 h hasta el domingo 25 de octubre de 2026 a la 01:00 UTC (en Italia las 3:00 pasan a ser las 2:00, según [Il Gazzettino](https://www.ilgazzettino.it/italia/cronaca_bianca/ora_solare_2026_quando_cambia_lancette_indietro-9790736.html)); desde ese segundo, 6 h; y 7 h otra vez desde el 28 de marzo de 2027. Se probó segundo a segundo: a las 2:59:59 a. m. de Italia la página dice "7 horas" y al siguiente segundo marca 2:00 a. m. y "6 horas". Colombia sigue en UTC−5 todo el año, sin horario de verano ([timeanddate](https://www.timeanddate.com/time/zone/colombia)). Todo da igual con el navegador configurado en otra zona (se probó en Tokio).

**Pantallas** (motor de Chrome, con las tipografías reales cargadas), 37 tamaños:

| Tipo | Tamaños probados (ancho × alto visible) |
|---|---|
| Celulares Android | Galaxy Fold cerrado 280×653, 360×560 (Chrome con barras), Galaxy S8 360×740, Galaxy A 360×800, Pixel 5 393×851, Pixel 7 412×839 y 412×915 |
| iPhone | SE 1.ª gen. 320×460 (Safari con barras) y 320×568, SE 2/3 375×553 (Safari) y 375×667, 12 mini 375×812, 14 390×664 (Safari) y 390×844, 15 Pro 393×852, 11 414×896, 14 Plus 428×926, 15 Pro Max 430×932 |
| Tablets | 600×960, 720×800, iPad mini 768×1024, 800×1280, iPad Air 820×1180 |
| Celular acostado | 568×320, 640×360, 653×280, 667×375, 740×360, 812×375, 844×390, 932×430 |
| Computador | 600×500, 720×720, 800×600, 1366×657, 1920×969 |

Resultado: sin scroll horizontal en ningún tamaño, sin textos encimados, las dos tarjetas caben sin scroll en todos los celulares en vertical (incluido el iPhone SE más pequeño con las barras de Safari) y sin errores ni advertencias en la consola. El viaje en el tiempo se probó con mouse, con el dedo (eventos táctiles reales) y con el teclado; el gesto vertical sigue siendo scroll normal. También se probó el modo "reducir movimiento" y que el reloj avance solo cada segundo. El HTML pasa la validación de html-validate y el JS no tiene errores en ESLint.

---

## Preguntas frecuentes

**La hora no cuadra con la de mi celular.**
La página usa el reloj del dispositivo. Si el equipo tiene la hora mal configurada, se verá corrida; con la hora automática activada queda exacta.

**La página se ve sin diseño.**
Seguramente `index.html` quedó separado de sus carpetas `css/` y `js/`. Abre la carpeta completa.

**¿Por qué ahora dice 6 horas?**
Desde el último domingo de octubre Italia está en horario de invierno. En marzo vuelve a 7 horas.

**¿Por qué el sol se esconde un poquito antes en Roma?**
Porque se pone detrás de las colinas y de la cúpula de San Pedro del dibujo. En Cartagena se pone sobre el mar.

**¿La luna está donde está en el cielo de verdad?**
Su fase sí es la real. Su posición es la opuesta al sol, para que siempre se vea de noche y se esconda al amanecer.

**No veo animaciones.**
Probablemente el sistema tiene activada la opción de reducir movimiento. La hora y el cielo siguen funcionando.

**Compartí el enlace en WhatsApp y no sale la foto (o sale una vieja).**
WhatsApp guarda la vista previa en caché. Revisa el enlace en el [Depurador de Compartir de Facebook](https://developers.facebook.com/tools/debug/), pulsa *Volver a extraer* y vuelve a compartir. Si cambiaste la imagen, ponle otro nombre de archivo.

---

## Copia de seguridad

Guarda el ZIP en Google Drive o en otro lugar seguro. Si lo editas seguido, súbelo a un repositorio de GitHub y tendrás todo el historial de cambios.

---

## Créditos y fuentes

- Posición del sol: algoritmo del Solar Calculator de la **NOAA** (Global Monitoring Laboratory).
- Fase de la luna: fórmulas de **Astronomy Answers** (aa.quae.nl), las mismas que usa la librería **SunCalc**.
- Tipografías: **Fraunces** (Undercase Type) y **Outfit** (Rodrigo Fuenzalida), licencia SIL Open Font License, vía Google Fonts.
- Colores de las banderas: valores oficiales de Italia (Pantone del decreto de 2006) y de Colombia.
- Vista previa al compartir: requisitos de la [documentación de WhatsApp (Meta)](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/) (imagen de menos de 600 KB y 300 px o más de ancho) y protocolo [Open Graph](https://ogp.me/).
- Protección de archivos privados en Cloudflare: [reglas `_redirects` de Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/redirects/) ("se aplican aunque exista el archivo").
- Verificación: PyEphem; calendario lunar de [TheSkyLive](https://theskylive.com/moon-calendar?year=2026&month=10); horarios del sol de [sunrisesunsettime.org](https://www.sunrisesunsettime.org/europe/italy/rome.htm), [sunrise-sunset.org](https://sunrise-sunset.org/it/rome) y [Meteogram](https://meteogram.org/sun/colombia/cartagena/); diferencia horaria de [CityTimeDiff](https://citytimediff.com/es/compare/colombia/rome); cambio de hora en Italia según [Quotidiano di Ragusa](https://www.quotidianodiragusa.it/2026/09/27/attualita/ora-solare-2026-cambio-ora/) e [Il Gazzettino](https://www.ilgazzettino.it/italia/cronaca_bianca/ora_solare_2026_quando_cambia_lancette_indietro-9790736.html); zona horaria de Colombia en [timeanddate](https://www.timeanddate.com/time/zone/colombia); pasos de publicación de la [documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/).

---

Proyecto personal de **JX** · Cartagena, Colombia · 2026.

*Documentación actualizada el 2 de octubre de 2026 a las 12:05 a. m. (hora de Colombia).*
