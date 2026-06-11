# Proposal: Implementación Frontend Biometría

## Intent
El frontend actual consiste en tres mockups de HTML crudo con Tailwind inyectado vía CDN y scripts simulados. Para convertirlo en un entorno de producción, necesitamos integrarlo con la API de FastAPI existente de manera segura y escalable. El objetivo es estructurar una arquitectura Vanilla JS con Vite, separar la lógica de negocio de la UI (Container-Presentational), y asegurar el sistema de diseño "Cyber-Sentinel" sin perder la simplicidad de no depender de un framework pesado.

## Scope

### In Scope
- Setup de proyecto Vite para empaquetado de assets y dev server.
- Configuración local de Tailwind CSS extrayendo los tokens del `DESIGN.md`.
- Implementación del servicio `api.js` para conexión centralizada con FastAPI (`GET /`, `POST /verificar`, `POST /evaluar-lote`, `GET/DELETE /historial`).
- Refactorización de `testing_masivo.html`, `Dashboard.html` y `Autenticación Biometrica.html` a módulos JS (controladores).
- Implementación de la captura de webcam (`getUserMedia`) y envío de imagen por `FormData`.

### Out of Scope
- Migración a React u otros frameworks SPA complejos.
- Modificaciones en la arquitectura, endpoints o lógica de la API FastAPI.
- Implementación de WebSockets en tiempo real (se usará petición estática/polling para el Dashboard).

## Approach
**Arquitectura Modular (Vanilla JS + Vite)**
Se inicializará un proyecto Vanilla JS con Vite. Se estructurarán las carpetas en `src/vistas/`, `src/services/`, `src/js/` y `src/styles/`. Tailwind se procesará localmente y se eliminarán los CDNs. Los componentes repetidos en el HTML (Navbar, Drawer) se pueden abstraer ligeramente o mantener por vista, asociando un archivo JS específico (ej. `dashboardController.js`) como Entry Point para manejar eventos, `fetch` al servicio `api.js` y manipulación del DOM (Vanilla Reactivity).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | New | Dependencias (Vite, Tailwind, PostCSS, Autoprefixer) |
| `tailwind.config.js` | New | Traslado del config que actualmente está inyectado en cada HTML |
| `src/services/api.js` | New | Cliente fetch apuntando a `34.41.144.88:8089` |
| `vistas/*.html` | Modified | Limpieza de scripts inline y CDN. Importación de módulos JS locales |
| `src/js/controllers/`| New | Scripts individuales para la lógica de cada página |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CORS entre Puertos | Medium | Configurar proxy en `vite.config.js` apuntando a `8089` para evitar bloqueos del navegador. |
| Permisos de WebRTC | High | La cámara exige contexto seguro. Desarrollo estrictamente en `localhost` o bajo túnel HTTPS. |
| Gestión de Boundaries en FormData | Low | Utilizar `FormData` puro en `fetch` omitiendo setear el header de `Content-Type`, tal como aclara la guía de la API. |

## Rollback Plan
Si el setup de Vite o la refactorización corrompen el diseño original, se revertirá el commit a la versión de los mockups estáticos actuales y se replanteará la extracción de estilos.

## Dependencies
- Node.js y npm instalados en el sistema anfitrión.
- Backend FastAPI levantado con Uvicorn en `34.41.144.88:8089`.

## Success Criteria
- [ ] El entorno Vite levanta y procesa los estilos Tailwind sin romper el "Corporate Technicism" del `DESIGN.md`.
- [ ] La cámara se inicializa correctamente y manda captures por `POST /verificar`.
- [ ] El Dashboard lee de `/` y `/historial` e inyecta los datos reales en el DOM.
- [ ] El tester masivo empuja correctamente arrays de archivos e imprime la tasa de aceptación.
