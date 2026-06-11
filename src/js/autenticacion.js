import { verifyIdentity } from '../services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Autenticacion controller initialized');
    
    const video = document.getElementById('webcam-video');
    const canvas = document.getElementById('webcam-canvas');
    const placeholder = document.getElementById('camera-placeholder');
    const fallback = document.getElementById('video-fallback');
    const btnVerificar = document.getElementById('btnVerificar');
    
    const btnSubir = document.getElementById('btnSubir');
    const inputFileAuth = document.getElementById('inputFileAuth');
    
    const successOverlay = document.getElementById('overlay-success');
    const errorOverlay = document.getElementById('overlay-error');
    const metricsSuccess = document.getElementById('metrics-success');
    const metricsError = document.getElementById('metrics-error');
    const statusBanner = document.getElementById('status-banner');

    let stream = null;

    // Iniciar cámara
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user" 
            } 
        });
        
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            // Ocultar placeholders y mostrar video real
            placeholder.classList.add('hidden');
            fallback.classList.add('hidden');
            video.classList.remove('hidden');
        };
    } catch (error) {
        console.error("Error accediendo a la cámara:", error);
        // Mostrar banner persistente o alerta si no hay cámara
        statusBanner.querySelector('span:nth-child(2)').textContent = 'Cámara no disponible';
        statusBanner.classList.remove('hidden');
        statusBanner.classList.add('flex');
        btnVerificar.disabled = true;
        btnVerificar.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Botón manual (Subir imagen)
    btnSubir.addEventListener('click', () => {
        inputFileAuth.click();
    });

    const uploadedPreview = document.getElementById('uploaded-preview');

    inputFileAuth.addEventListener('change', async (e) => {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        const objectUrl = URL.createObjectURL(file);
        uploadedPreview.src = objectUrl;
        video.classList.add('hidden');
        placeholder.classList.add('hidden');
        fallback.classList.add('hidden');
        uploadedPreview.classList.remove('hidden');

        await handleVerification(file);
    });

    // Manejar click en Verificar Identidad (Cámara)
    btnVerificar.addEventListener('click', async () => {
        if (!stream) return;

        // Capturar frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir canvas a Blob (JPEG para FastAPI)
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            await handleVerification(blob);
        }, 'image/jpeg', 0.9);
    });

    async function handleVerification(blobOrFile) {
        // Reset UI
        btnVerificar.disabled = true;
        btnSubir.disabled = true;
        btnVerificar.classList.remove('btn-pulse');
        successOverlay.classList.remove('flex');
        successOverlay.classList.add('hidden');
        errorOverlay.classList.remove('flex');
        errorOverlay.classList.add('hidden');
        statusBanner.classList.add('hidden');
        statusBanner.classList.remove('flex');

        function resetCameraView() {
            if (stream) video.classList.remove('hidden');
            uploadedPreview.classList.add('hidden');
            if (uploadedPreview.src) {
                URL.revokeObjectURL(uploadedPreview.src);
                uploadedPreview.src = '';
            }
        }

        try {
            const response = await verifyIdentity(blobOrFile);
            
            if (response.rostro_detectado === false) {
                // Rostro no detectado
                statusBanner.querySelector('span:nth-child(2)').textContent = 'Rostro no detectado';
                statusBanner.classList.remove('hidden');
                statusBanner.classList.add('flex');
                setTimeout(() => {
                    statusBanner.classList.add('hidden');
                    statusBanner.classList.remove('flex');
                    resetCameraView();
                }, 3000);
            } else if (response.aceptado === true) {
                // Match
                const confianzaStr = response.similitud !== undefined ? response.similitud.toFixed(1) : 'N/A';
                const distStr = response.distancia_minima !== undefined ? response.distancia_minima.toFixed(3) : 'N/A';
                metricsSuccess.innerHTML = `Similitud: ${confianzaStr}%<br/>Distancia: ${distStr}`;
                
                successOverlay.classList.remove('hidden');
                successOverlay.classList.add('flex');
                setTimeout(() => {
                    successOverlay.classList.add('hidden');
                    successOverlay.classList.remove('flex');
                    resetCameraView();
                }, 4000);
            } else {
                // Rechazado
                const confianzaStr = response.similitud !== undefined ? response.similitud.toFixed(1) : 'N/A';
                const distStr = response.distancia_minima !== undefined ? response.distancia_minima.toFixed(3) : 'N/A';
                metricsError.innerHTML = `Similitud: ${confianzaStr}%<br/>Distancia: ${distStr}`;
                
                errorOverlay.classList.remove('hidden');
                errorOverlay.classList.add('flex');
                setTimeout(() => {
                    errorOverlay.classList.add('hidden');
                    errorOverlay.classList.remove('flex');
                    resetCameraView();
                }, 4000);
            }
        } catch (error) {
            console.error("Fallo al verificar:", error);
            statusBanner.querySelector('span:nth-child(2)').textContent = 'Error de conexión';
            statusBanner.classList.remove('hidden');
            statusBanner.classList.add('flex');
            setTimeout(() => resetCameraView(), 3000);
        } finally {
            btnVerificar.disabled = false;
            btnSubir.disabled = false;
            btnVerificar.classList.add('btn-pulse');
        }
    }
});
