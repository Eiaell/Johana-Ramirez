# Johana Ramirez — Storytelling Landing

Página de storytelling vertical para Johana Ramirez · Eventos corporativos & personales.

## Estructura

```
/
├── index.html         ← Página principal
├── css/style.css      ← Estilos
├── js/app.js          ← Animaciones de scroll
├── assets/
│   ├── logo.png       ← Logo (usado en loader)
│   ├── video.mp4      ← Video de Johana
│   └── img/           ← Fotos de eventos
└── vercel.json        ← Config de cache para Vercel
```

## Subir a Vercel

### Opción A — drag & drop (más fácil)
1. Ve a https://vercel.com/new
2. Arrastra esta carpeta completa al área de drop
3. Click en **Deploy**
4. Listo. Te da una URL `https://...vercel.app`

### Opción B — desde GitHub
1. Sube esta carpeta a un repo de GitHub
2. En Vercel, **Add New → Project → Import** el repo
3. Como es solo HTML estático, no necesita configuración adicional. Deploy.

### Opción C — Vercel CLI
```bash
npm i -g vercel
cd "este-directorio"
vercel
```

## Cómo personalizar

- **Cambiar Instagram real:** en `index.html` busca `@johanaramirez.eventos` y `https://instagram.com/`.
- **Cambiar textos:** todos los textos están en `index.html`, fácil de editar.
- **Cambiar fotos:** reemplaza los archivos en `assets/img/` manteniendo los mismos nombres.
- **Cambiar el formulario:** hoy abre el cliente de email (mailto). Para recibir mensajes en tu inbox sin que el usuario tenga que abrir su mail, conecta un servicio como [Formspree](https://formspree.io) o [Web3Forms](https://web3forms.com) cambiando el `action` del `<form>`.

## Móvil

Diseñado mobile-first. Probado en iOS/Android.
