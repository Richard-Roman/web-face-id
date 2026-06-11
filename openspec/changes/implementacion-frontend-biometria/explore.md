## Exploration: implementacion-frontend-biometria

### Current State
El sistema cuenta con un backend en FastAPI documentado en `api_integration_guide.md` y tres mockups en HTML (`testing_masivo.html`, `Dashboard.html`, `Autenticación Biometrica.html`) que implementan un sistema de diseño "Cyber-Sentinel" (documentado en `DESIGN.md`) usando Tailwind vía CDN y scripts simulados (timeouts y randoms). Actualmente no hay conexión real con la API ni una arquitectura de frontend definida (el código y los estilos están duplicados en cada archivo).

### Affected Areas
- `vistas/testing_masivo.html` — Requiere integración real con `POST /evaluar-lote` usando `FormData`.
- `vistas/Dashboard.html` — Requiere consumo de `GET /`, `GET /historial` y `DELETE /historial` para actualizar métricas y tablas.
- `vistas/Autenticación Biometrica.html` — Requiere acceso a `navigator.mediaDevices.getUserMedia` para capturar fotos reales y enviar a `POST /verificar`.
- Configuración global — El config de Tailwind y los componentes repetidos (Nav, Header) están hardcodeados en cada vista.

### Approaches
1. **Vanilla JS + Vite (Modular Architecture)**
   - Configurar Vite como bundler. Extraer Tailwind a un archivo de configuración real (`tailwind.config.js`).
   - Implementar patrón MVC/Container-Presentational con Vanilla JS. Crear un servicio `api.js` centralizado.
   - Pros: Fundamentos sólidos, sin overhead de frameworks pesados, aprovecha el HTML existente.
   - Cons: El manejo del DOM manual en vistas complejas (como el Dashboard) requiere más boilerplate.
   - Effort: Medium

2. **Migración a React / SPA (Vite)**
   - Convertir los mockups a componentes funcionales de React (JSX).
   - Extraer `TopAppBar` y `NavigationDrawer` a layout components. Manejo de estado global con Zustand o Context.
   - Pros: Componentización real, manejo de estado declarativo, preparado para escalar.
   - Cons: Requiere reescribir todo el HTML a JSX e introducir la curva del framework.
   - Effort: High

### Recommendation
**Vanilla JS + Vite (Modular Architecture).**
Acá venimos a hacer las cosas con fundamentos. Nada de meter React por meter. Los mockups ya están armados en HTML puro; lo ideal es armar un entorno con Vite, sacar el Tailwind del CDN (que es una aberración para producción) y estructurar el código JS separando la capa de red (`api.js`) de los controladores de vista. Así aprendemos arquitectura pura antes de depender de un framework.

### Risks
- CORS: Si el frontend (Vite) corre en otro puerto (ej: 5173) y el backend en 8089, asegurarse que FastAPI tenga los origins permitidos.
- WebRTC (Cámara): El acceso a la cámara requiere contexto seguro (localhost o HTTPS).
- FormData: Riesgo de armar mal los boundaries si se usan headers manuales con Fetch (como advierte la guía).

### Ready for Proposal
Yes. El orchestrator debe pedirle al usuario que apruebe el enfoque (Vanilla JS modular vs React) antes de pasar a la fase de Proposal.
