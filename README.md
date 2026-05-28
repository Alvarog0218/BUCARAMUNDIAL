# BUCARAMUNDIAL

Landing page para el evento "Bucaramundial" en Neomundo Bucaramanga, reconstruida como proyecto Astro con npm.

## Stack

- Astro como generador estático.
- Tailwind CSS local con npm y Vite para que los estilos se compilen con Astro.
- JavaScript cliente modular en `src/scripts/site.js`.
- Supabase vía CDN para guardar leads cuando se configure la anon key.

## Estructura

- `src/pages/index.astro`: página principal.
- `src/layouts/BaseLayout.astro`: HTML base, metadatos, Tailwind CDN, fuentes y scripts globales.
- `src/components/`: secciones de la landing separadas por responsabilidad.
- `src/styles/global.css`: estilos personalizados que no pertenecen a clases Tailwind.
- `src/scripts/site.js`: modal del mapa, selección de zona, formularios, Supabase y redirección a Quick Ticket.
- `public/assets/`: assets servidos por Astro con rutas limpias.
- `.env.example`: variables públicas necesarias para habilitar Supabase.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Supabase

Para guardar leads, crea un archivo `.env` a partir de `.env.example` y reemplaza:

```bash
PUBLIC_SUPABASE_URL=https://wiyoiuijzpskryxmdqzo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_REAL
```

Si la anon key no está configurada, el formulario continúa redirigiendo a Quick Ticket sin bloquear al usuario.
