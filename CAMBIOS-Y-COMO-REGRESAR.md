# Cambios realizados y cómo regresar atrás

> Documento de referencia. Si en cualquier momento quieres volver a una versión anterior,
> abre este archivo (o dile a Claude **"quiero regresar a como estaba antes"**) y sabrá a qué te refieres.

Última actualización: **2026-06-04**

---

## ⭐ PUNTO 1 — "como estaba antes" (línea base actual)

**Cuando digas "quiero regresar a como estaba antes", me refiero a ESTE punto.**

- **Qué es:** el sitio con la bifurcación privado/corporativo en páginas separadas (lo que está hoy en producción).
- **Guardado en:** tag `punto-1` + rama `backup/punto-1`
- **Commit:** `e708b74`

A partir de ahora, cualquier cambio nuevo se compara contra el Punto 1. Si algo no gusta,
basta decir **"regresa al Punto 1"** (o "regresa a como estaba antes") y vuelvo exactamente a este estado.

---

## 🟢 Cómo pedir un retorno

Solo dile a Claude una de estas frases y él ejecuta el git por ti:

- **"Regresa a como estaba antes"** / **"Regresa al Punto 1"** → vuelve a la línea base actual (tag `punto-1`, commit `e708b74`).
- **"Regresa a ANTES de la bifurcación"** → sitio de una sola página, sin páginas privado/corporativo. Punto: `v-antes-bifurcacion` (`8a620f1`).
- **"Regresa a ANTES del logo metálico"** → antes de cambiar el monograma JR del nav. Commit `d412f48`.

No necesitas recordar comandos ni códigos. Con la frase basta.

---

## 🔖 Puntos de retorno guardados (restore points)

| Punto | Qué es | Cómo está guardado | Commit |
|-------|--------|--------------------|--------|
| **⭐ PUNTO 1 — "como estaba antes" (actual)** | Bifurcación privado/corporativo en páginas separadas; producción de hoy | Tag `punto-1` + rama `backup/punto-1` | `e708b74` |
| Antes de la bifurcación | Sitio de UNA sola página (sin páginas privado/corporativo) | Tag `v-antes-bifurcacion` + rama `backup/antes-de-bifurcacion` | `8a620f1` |
| Antes del logo metálico | Nav con el texto "JR" dorado en vez del monograma | (en el historial de git) | `d412f48` |

---

## 📋 Qué hemos hecho, en orden

### 1. Logo metálico en el nav
- Se reemplazó el texto **"JR"** dorado de la esquina superior izquierda por el **monograma metálico** recortado del logo (`assets/img/jr_mark.png`), manteniendo "Johana Ramirez" al costado.
- Se generó una versión recortada/transparente del logo a partir de `joha_sin.png`.

### 2. Dos botones en el hero (bifurcación)
- Bajo el subtítulo del hero se añadieron dos botones del mismo tamaño:
  **"Mi evento es · Privado"** y **"Mi evento es · Corporativo"**.
- En móvil se apilan verticalmente.

### 3. Páginas separadas por rama
- El portafolio corporativo y el personal **se movieron a páginas dedicadas**:
  - `privado.html` → bodas, cumpleaños, baby showers, premiaciones (tono cálido/rosa).
  - `corporativo.html` → lanzamientos, convenciones, galas, activaciones (tono navy) + franja de marcas.
- Cada página tiene: nav, back-link "← Volver al inicio", bloque **"lo que ofrecemos"** (4 servicios),
  el reel de portafolio, un cross-link a la otra rama, formulario de contacto y footer.
- En `index.html`, donde estaban los reels, ahora hay **dos tarjetas de bifurcación** grandes
  (rótulo **PRIVADO** / **CORPORATIVO**) que llevan a cada página.
- Los botones del hero ahora enlazan a `privado.html` y `corporativo.html`.

### 4. Publicación segura
- Todo se subió primero a una rama de preview (`feature/paginas-privado-corporativo`).
- Luego se hizo merge a `main` (producción), creando ANTES los respaldos
  `v-antes-bifurcacion` y `backup/antes-de-bifurcacion`.

---

## 🗂️ Archivos involucrados

- `index.html` — botones del hero + tarjetas de bifurcación (se quitaron los 2 reels).
- `privado.html` — **nuevo**, página de eventos privados.
- `corporativo.html` — **nuevo**, página de eventos corporativos.
- `css/style.css` — estilos de botones del hero, tarjetas de bifurcación, ofertas, subpáginas y cross-link.
- `js/app.js` — sin cambios (se reutiliza; ya era defensivo y funciona en las 3 páginas).

---

## 🌿 Ramas y despliegue

- **`main`** → es lo que Vercel publica en producción.
- **`redesign/expert-review`** → se mantiene sincronizada con `main`.
- **`backup/antes-de-bifurcacion`** → foto del sitio antes de la bifurcación (NO tocar; es la red de seguridad).
- **`feature/paginas-privado-corporativo`** → rama donde se desarrolló la función.

> Al regresar a un punto anterior, Vercel redespliega automáticamente y el sitio vuelve a esa versión.

---

## 🛠️ Comandos de referencia (Claude los ejecuta por ti)

**Volver al Punto 1 (línea base "como estaba antes"):**
```bash
git reset --hard punto-1
git push --force-with-lease origin main
```

**Volver completo al estado previo a la bifurcación:**
```bash
git reset --hard v-antes-bifurcacion
git push --force-with-lease origin main
```

**Revertir solo el merge de la bifurcación (conservando historial):**
```bash
git revert -m 1 c074271
git push origin main
```
