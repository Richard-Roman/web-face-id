# RedShield (Web Face ID) - Frontend 🛡️

Interfaz web moderna y segura para el ecosistema de reconocimiento facial de **RedShield**. Construida sobre Vite, TailwindCSS y Vanilla JavaScript, priorizando rendimiento, responsividad y seguridad biométrica.

## Características Principales

*   **Autenticación Biométrica:** Interfaz de simulación y captura en tiempo real de rostros.
*   **Dashboard de Monitoreo:** Métricas de estado, tasas de aceptación, uptime y recursos consumidos por el motor de inferencia.
*   **Testing Masivo (QA):** Herramienta para validación en lote (Batch) arrastrando imágenes directamente contra el modelo de IA.
*   **Responsive Design:** Optimizado `mobile-first` con adaptaciones fluidas desde pantallas pequeñas (celulares) hasta monitores 4K.
*   **Ecosistema Remoto:** Conexión estandarizada al backend FastAPI remoto en la nube (puerto 8089) para procesamiento de inteligencia artificial.

## Pila Tecnológica (Tech Stack)

*   **Bundler:** [Vite](https://vitejs.dev/)
*   **Estilos:** [TailwindCSS v3](https://tailwindcss.com/)
*   **Lógica de Negocio:** Vanilla JS (ES6 Modules)
*   **Iconografía:** Material Symbols (Google)

## Configuración y Despliegue Local

### 1. Prerrequisitos

*   [Node.js](https://nodejs.org/) (Versión 18+ recomendada)
*   Backend activo de RedShield corriendo remotamente (Ver `api_integration_guide.md` para estructura y endpoints).

### 2. Instalación de Dependencias

Clona este repositorio (si usas control de versiones) y descarga las dependencias del frontend:

```bash
git clone <URL_DEL_REPO>
cd web-face-id
npm install
```

### 3. Entorno de Desarrollo (Development Server)

Para iniciar el servidor local con Hot Module Replacement (HMR). El archivo `vite.config.js` ya posee un proxy inteligente configurado para comunicarse con el servidor backend en la nube sin problemas de CORS ni certificados cruzados en desarrollo.

```bash
npm run dev
```

### 4. Build de Producción

Para empaquetar, compilar, limpiar purgas de CSS y minificar los activos para el despliegue final a producción:

```bash
npm run build
```

Esto generará la carpeta estática `/dist` lista para ser servida por cualquier servidor web de producción (Nginx, Apache, Vercel, Netlify, Cloudflare Pages, etc).

## Guía de Integración API

Consulta el archivo de referencia interna: [`api_integration_guide.md`](./api_integration_guide.md) para detalles técnicos de las arquitecturas de respuesta, endpoints POST y parseos del Backend.

## Licencia
Ver archivo `LICENSE`.
