---
name: instagram-publisher
description: >
  Publishes Instagram carousel posts from local images.
  Uploads images to catbox.moe for temporary public hosting, creates Instagram
  media containers via the Graph API, and publishes the carousel.
  Supports 2-10 images per post and retrieves the real post permalink.
description_es: >
  Publica carruseles de Instagram a partir de imágenes locales.
  Sube las imágenes a catbox.moe como hosting público temporal, crea
  contenedores de medios vía Graph API y publica el carrusel.
  Soporta de 2 a 10 imágenes por post y obtiene el permalink real.
type: script
version: "1.0.0"
script:
  path: scripts/publish.js
  runtime: node
  invoke: "node --env-file=.env {skill_path}/scripts/publish.js --images \"{images}\" --caption \"{caption}\""
env:
  - INSTAGRAM_ACCESS_TOKEN
  - INSTAGRAM_USER_ID
categories: [social-media, publishing, instagram]
---

# Instagram Publisher

## When to use

Use the Instagram Publisher when you need to publish carousel posts directly to an Instagram Business account. This skill handles the full workflow: uploading images to a temporary public host (catbox.moe), creating Instagram media containers via the Graph API, and publishing the carousel. It supports 2-10 JPEG images per post.


## Instructions

### Workflow

1. List JPEG files in `cuadrillas/{cuadrilla}/output/images/` sorted by name.
   If no files found: stop and ask the user to add images before continuing.
2. Present the image list to the user with AskUserQuestion to confirm order.
3. Extract the caption from the content draft:
   - Use the hook slide text + CTA slide text
   - Max 2200 characters (Instagram limit)
4. Run the publish script:
   ```
   node --env-file=.env cuadrillas/{cuadrilla}/tools/publish.js \
     --images "<comma-separated-ordered-paths>" \
     --caption "<caption>"
   ```
   Add `--dry-run` to test the full flow without actually publishing.
5. On success: save the post URL and post ID to the step output file.
6. On failure: display the error and ask the user how to proceed.

### Constraints

- Images: JPEG only, 2-10 per carousel
- Caption: max 2200 characters
- Requires Instagram Business account (not Personal or Creator)
- Rate limit: 25 API-published posts per 24 hours

### Setup (first-time)

Copy `.env.example` to `.env` and fill in the two required variables:

```
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
```

#### INSTAGRAM_ACCESS_TOKEN

Requisito: cuenta Instagram Business vinculada a una página de Facebook y una app creada en [developers.facebook.com](https://developers.facebook.com/) (tipo: **Empresa**).

**Para obtener un token de larga duración (válido 60 días):**

1. Entra en tu app → **Graph API Explorer**
2. En el menú superior, selecciona tu app
3. Pulsa **«Generar token de acceso»**
4. Activa los permisos:
   - `instagram_content_publish`
   - `instagram_basic`
   - `pages_read_engagement`
5. Pulsa **«Generar token de acceso»** y autoriza; recibirás un token de corta duración (1 h)
6. Conviértelo a larga duración (60 días) con este GET:
   ```
   https://graph.facebook.com/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={APP_ID}
     &client_secret={APP_SECRET}
     &fb_exchange_token={TOKEN_CORTO}
   ```
   _(APP_ID y APP_SECRET: tu app → Configuración → Básico)_
7. Copia el `access_token` de la respuesta y pégalo en `.env`

> El token caduca a los 60 días. Repite el proceso para renovarlo.

#### INSTAGRAM_USER_ID

1. En Graph API Explorer (con el token anterior), haz GET a:
   ```
   /me/accounts
   ```
2. Localiza tu **página de Facebook** en la respuesta y anota el `id`
3. Haz GET a:
   ```
   /{page-id}?fields=instagram_business_account
   ```
4. Copia el `id` dentro de `instagram_business_account` — ese es tu User ID

## Available operations

- **Publish Carousel** -- Upload images and publish a carousel post to Instagram
- **Dry Run** -- Test the full publishing flow without actually posting (use `--dry-run` flag)
- **Image Upload** -- Upload local JPEG images to catbox.moe for temporary public hosting
- **Status Check** -- Monitor media container processing status before publishing
