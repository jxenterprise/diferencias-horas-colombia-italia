# Italia ⇄ Colombia · Hora en vivo con su cielo real

Página pequeña que muestra **la hora en vivo de Roma (Italia) y de Cartagena (Colombia)**, cada una dentro de su propia ventana de cielo, y en el centro **la diferencia horaria** entre los dos países.

El cielo de cada ciudad es el **de verdad**: la posición del sol se calcula con astronomía para el Coliseo y para la Torre del Reloj. Si en Roma está anocheciendo, su tarjeta se pone rosada y naranja, se encienden las luces y salen las estrellas; si en Cartagena es mediodía, el sol está arriba y el mar brilla.

Hecha en **HTML, CSS y JavaScript puros**: sin librerías, sin instalar nada y sin pedir datos a internet. Todo se calcula en el propio navegador.

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
- **Viaje en el tiempo** (función oculta, ver abajo).
- **Responsive:** en computador las tarjetas van lado a lado; en celular y tablet vertical se apilan y las dos caben en la pantalla sin hacer scroll.

---

## Cómo verla

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
├── index.html        ← la página: tarjetas, dibujos de las ciudades y textos
├── CLAUDE.md         ← contexto técnico para retomar el proyecto con IA
├── README.md         ← este archivo
├── css/
│   └── styles.css    ← diseño, colores, animaciones y responsive
└── js/
    └── script.js     ← hora de cada país, astronomía, cielo, estrellas y viaje en el tiempo
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

> Antes de hacer cambios grandes, lee el `CLAUDE.md`: ahí están la ficha de diseño, el mapa completo del código y los puntos delicados (por ejemplo, si se redibuja una ciudad hay que mantener la línea del horizonte).

Todo el código está comentado en español, bloque por bloque.

---

## Publicarla en internet

Es una página estática, así que se puede publicar gratis.

**Cloudflare Pages (recomendado):**
1. En el panel de Cloudflare entra a **Workers & Pages**.
2. **Create application** → **Get started** → **Drag and drop your files**.
3. Ponle un nombre al proyecto, arrastra la carpeta (o el ZIP) y pulsa **Deploy site**.
4. Queda en `https://<nombre>.pages.dev`. Para subir una versión nueva: **Create a new deployment**.

**GitHub Pages:** sube los archivos a un repositorio (con `index.html` en la raíz), entra a **Settings → Pages**, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`, y guarda.

**Hostinger u otro hosting:** sube el **contenido** de la carpeta (no la carpeta) a `public_html` desde el Administrador de archivos.

> En cualquier caso, `index.html` debe quedar en la raíz junto a `css/` y `js/`.

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
- Sin imágenes pesadas: todo está dibujado en código (≈ 115 KB en total, sin contar las fuentes).

---

## Verificación de los datos

Pruebas hechas el 1 de octubre de 2026:

**Salida y puesta del sol**, comparadas con PyEphem (cálculo astronómico de alta precisión, misma convención estándar):

| Fecha | Ciudad | Salida (página) | Salida (PyEphem) | Puesta (página) | Puesta (PyEphem) |
|---|---|---|---|---|---|
| 1 oct 2026 | Roma | 07:06:46 | 07:06:46 | 18:51:58 | 18:51:56 |
| 26 oct 2026 | Roma | 06:34:59 | 06:35:02 | 17:12:20 | 17:12:23 |
| 1 oct 2026 | Cartagena | 05:50:54 | 05:50:54 | 17:52:33 | 17:52:31 |

Las páginas web de horarios del sol dan valores con 1 o 2 minutos de diferencia porque cada una calcula con supuestos un poco distintos (por ejemplo, la altura del lugar).

**Fases de la luna de octubre de 2026**, comparadas con el calendario de TheSkyLive: cuarto menguante el 3 de octubre, luna nueva el 10, cuarto creciente el 18 y luna llena el 26. La página da 50,6 %, 0,1 %, 50,6 % y 99,8 % de luna iluminada en esos momentos.

**Diferencia horaria:** 7 h hasta el 25 de octubre de 2026 a la 01:00 UTC; 6 h desde ese momento; 7 h otra vez desde el 28 de marzo de 2027.

**Pantallas:** probada en 1440×900, 1366×657, tablet 820×1180, celulares 390×664 y 360×640, y celular acostado 844×390 (motor de Chrome). No hay scroll horizontal ni errores o advertencias en la consola. También funciona abriendo el archivo directamente (`file://`).

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

---

## Copia de seguridad

Guarda el ZIP en Google Drive o en otro lugar seguro. Si lo editas seguido, súbelo a un repositorio de GitHub y tendrás todo el historial de cambios.

---

## Créditos y fuentes

- Posición del sol: algoritmo del Solar Calculator de la **NOAA** (Global Monitoring Laboratory).
- Fase de la luna: fórmulas de **Astronomy Answers** (aa.quae.nl), las mismas que usa la librería **SunCalc**.
- Tipografías: **Fraunces** (Undercase Type) y **Outfit** (Rodrigo Fuenzalida), licencia SIL Open Font License, vía Google Fonts.
- Colores de las banderas: valores oficiales de Italia (Pantone del decreto de 2006) y de Colombia.
- Verificación: PyEphem; calendario lunar de [TheSkyLive](https://theskylive.com/moon-calendar?year=2026&month=10); horarios del sol de [sunrisesunsettime.org](https://www.sunrisesunsettime.org/europe/italy/rome.htm), [sunrise-sunset.org](https://sunrise-sunset.org/it/rome) y [Meteogram](https://meteogram.org/sun/colombia/cartagena/); diferencia horaria de [CityTimeDiff](https://citytimediff.com/es/compare/colombia/rome); cambio de hora en Italia según [Quotidiano di Ragusa](https://www.quotidianodiragusa.it/2026/09/27/attualita/ora-solare-2026-cambio-ora/); pasos de publicación de la [documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/).

---

Proyecto personal de **JX** · Cartagena, Colombia · 2026.
