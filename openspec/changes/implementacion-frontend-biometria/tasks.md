# Tasks: implementacion-frontend-biometria

## Phase 1: Foundation & Build Setup

- [x] 1.1 Inicializar el proyecto: Crear `package.json` en la raíz (si no existe) e instalar dependencias (`vite`, `tailwindcss`, `postcss`, `autoprefixer`).
- [x] 1.2 Configurar Vite: Crear `vite.config.js` definiendo `build.rollupOptions.input` para los tres HTML (`testing_masivo.html`, `Dashboard.html`, `Autenticación Biometrica.html`) y un proxy a `http://34.41.144.88:8089/`.
- [x] 1.3 Configurar Tailwind: Crear `tailwind.config.js` y `postcss.config.js`, transcribiendo el objeto de configuración (colores Cyber-Sentinel, fuentes Poppins) extraído de `DESIGN.md`.
- [x] 1.4 Configurar Estilos Base: Crear `src/styles/main.css` integrando `@tailwind base; @tailwind components; @tailwind utilities;` y copiando los estilos custom (animaciones, glass-card, cyber-button) actualmente hardcodeados en los HTML.
- [x] 1.5 Crear cliente API: Crear `src/services/api.js` que exporte métodos puros (`getServerStatus`, `getHistory`, `clearHistory`, `verifyIdentity`, `evaluateBatch`) para manejar los fetch al backend.

## Phase 2: HTML Refactoring & Asset Wiring

- [x] 2.1 Limpiar `testing_masivo.html`: Eliminar el CDN de Tailwind y los tags `<script>` inline. Enlazar `<link href="/src/styles/main.css" rel="stylesheet">` y `<script type="module" src="/src/js/testing_masivo.js">`.
- [x] 2.2 Limpiar `Dashboard.html`: Eliminar CDN de Tailwind y scripts inline. Enlazar estilos base y `<script type="module" src="/src/js/dashboard.js">`.
- [x] 2.3 Limpiar `Autenticación Biometrica.html`: Eliminar CDN de Tailwind y scripts simulados de "simulateScan()". Enlazar estilos base y `<script type="module" src="/src/js/autenticacion.js">`.

## Phase 3: Core Implementation (View Controllers)

- [x] 3.1 Implementar `src/js/dashboard.js`: Lógica para consumir `getServerStatus()` y `getHistory()` al cargar el DOM. Destruir las filas de prueba estáticas del HTML y construir dinámicamente las filas (`<tr>`) con datos de la API.
- [x] 3.2 Completar `dashboard.js` (Acciones): Conectar el botón "Actualizar" al refresh de datos, y "Limpiar Historial" al método `clearHistory()` de la API, refrescando la tabla al finalizar.
- [x] 3.3 Implementar `src/js/testing_masivo.js`: Lógica para escuchar el `<input type="file" multiple>`. Armar dinámicamente el `FormData` (append 'imagenes'), consumir `evaluateBatch()`, y actualizar el DOM (porcentajes, métricas) con la respuesta.
- [x] 3.4 Implementar `src/js/autenticacion.js` (Cámara): Configurar inicialización de `navigator.mediaDevices.getUserMedia`, ocultar el placeholder, y montar el flujo de video en un elemento `<video autoplay>`.
- [x] 3.5 Implementar `src/js/autenticacion.js` (Verificación): Configurar botón principal para extraer el frame actual usando un `<canvas>`, exportar el blob a `FormData` (append 'imagen'), consumir `verifyIdentity()`, y manipular la visibilidad de los banners de éxito/error.

## Phase 4: Testing & Verification

- [x] 4.1 Validar Frontend Server: Ejecutar `npm run dev` y navegar por las tres páginas asegurando que Tailwind compile correctamente los estilos de Cyber-Sentinel.
- [x] 4.2 Pruebas de Integración: Ejecutar flujo completo de Login Biométrica con un servidor Uvicorn corriendo localmente, para asegurar que no salten errores de CORS y que `FormData` respete los boundaries (sin `Content-Type` forzado).
- [x] 4.3 Validar Build Prod: Ejecutar `npm run build` y comprobar que el dist se genere sin errores de importación circular o assets faltantes.
