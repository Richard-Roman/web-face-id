// api.js - Cliente centralizado para FastAPI
// Todas las llamadas apuntan a /api, que será proxied por Vite a 34.41.144.88:8089

const BASE_URL = 'https://my-face-id-ip.richard-roman.workers.dev'; // Proxy Cloudflare para HTTPS

/**
 * Verifica si el servidor está online y el modelo cargado
 */
export async function getServerStatus() {
    try {
        const response = await fetch(`${BASE_URL}/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en getServerStatus:", error);
        return { estado: 'offline', modelo_cargado: false };
    }
}

/**
 * Endpoint de Verificación Biométrica
 * @param {Blob | File} imagenBlob 
 */
export async function verifyIdentity(imagenBlob) {
    const formData = new FormData();
    formData.append('imagen', imagenBlob);

    try {
        const response = await fetch(`${BASE_URL}/verificar`, {
            method: 'POST',
            body: formData // NUNCA setear el Content-Type multipart a mano en fetch
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en verifyIdentity:", error);
        throw error;
    }
}

/**
 * Evaluación Masiva
 * @param {FileList | Array<File>} fileList 
 */
export async function evaluateBatch(fileList) {
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
        formData.append('imagenes', fileList[i]);
    }

    try {
        const response = await fetch(`${BASE_URL}/evaluar-lote`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en evaluateBatch:", error);
        throw error;
    }
}

/**
 * Obtener historial de auditoría
 * @param {number} limite 
 */
export async function getHistory(limite = 20) {
    try {
        const response = await fetch(`${BASE_URL}/historial?limite=${limite}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en getHistory:", error);
        throw error;
    }
}

/**
 * Limpiar historial de auditoría
 */
export async function clearHistory() {
    try {
        const response = await fetch(`${BASE_URL}/historial`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en clearHistory:", error);
        throw error;
    }
}
