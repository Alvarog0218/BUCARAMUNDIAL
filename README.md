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
- `supabase/leads.sql`: tabla, índices y políticas RLS para recibir los datos del formulario.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Supabase

Para guardar leads:

1. En Supabase, abre el proyecto y ve a **SQL Editor**.
2. Ejecuta el contenido de `supabase/leads.sql`.
3. Crea un archivo `.env` a partir de `.env.example` y reemplaza la anon key:

```bash
PUBLIC_SUPABASE_URL=https://tkguainbzaqejvvveohf.supabase.co
PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_REAL
```

La anon key está en **Project Settings > API > Project API keys > anon public**.

El formulario inserta registros en la tabla `public.leads` con nombre, WhatsApp, correo, tipo de compra, zona, autorización de tratamiento de datos, URL de origen, user agent y parámetros UTM. Si la anon key no está configurada, el formulario continúa redirigiendo a Quick Ticket sin bloquear al usuario.

### Filtros anti-spam

El formulario bloquea dominios de correo desechables conocidos y usa un campo honeypot invisible para cortar envíos automatizados simples. La base de datos también valida el correo con `public.is_allowed_lead_email(email)`, por lo que Supabase rechaza esos dominios aunque alguien intente insertar directamente con la anon key.

Para una protección más fuerte contra bots, usa una función intermedia antes de insertar en Supabase, por ejemplo una Supabase Edge Function o una API serverless, y valida allí un captcha como Cloudflare Turnstile o hCaptcha. En un sitio estático, la anon key pública siempre queda visible en el navegador.
