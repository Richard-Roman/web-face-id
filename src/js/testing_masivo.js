import { evaluateBatch, getServerStatus } from '../services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Testing Masivo controller initialized');
    
    // Server status elements
    const serverStatusDot = document.getElementById('server-status-dot');
    const serverStatusText = document.getElementById('server-status-text');

    async function checkServer() {
        const status = await getServerStatus();
        if (status.estado === 'online') {
            serverStatusDot.classList.replace('bg-status-error', 'bg-status-success') || serverStatusDot.classList.add('bg-status-success');
            serverStatusDot.classList.add('animate-pulse', 'shadow-[0_0_8px_rgba(52,199,89,0.8)]');
            serverStatusText.textContent = 'SERVER: ONLINE';
        } else {
            serverStatusDot.classList.replace('bg-status-success', 'bg-status-error') || serverStatusDot.classList.add('bg-status-error');
            serverStatusDot.classList.remove('animate-pulse', 'shadow-[0_0_8px_rgba(52,199,89,0.8)]');
            serverStatusText.textContent = 'SERVER: OFFLINE';
        }
    }
    checkServer();
    setInterval(checkServer, 10000);
    
    const fileInput = document.getElementById('fileInput');
    const queueCount = document.getElementById('queueCount');
    const executeBtn = document.getElementById('executeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultsSection = document.getElementById('resultsSection');
    
    // Results elements
    const resRate = document.getElementById('res-rate');
    const resTotal = document.getElementById('res-total');
    const resSuccess = document.getElementById('res-success');
    const resError = document.getElementById('res-error');
    const resPieChart = document.getElementById('res-pie-chart');
    const resStatusBadge = document.getElementById('res-status-badge');
    const resTimeText = document.getElementById('res-time-text');
    const detailedResultsCard = document.getElementById('detailed-results-card');
    const detailedResultsBody = document.getElementById('detailed-results-body');

    let currentFiles = [];
    let currentObjectUrls = [];

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            currentFiles = Array.from(e.target.files);
            queueCount.textContent = currentFiles.length.toString();
            executeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            executeBtn.disabled = false;
        } else {
            currentFiles = [];
            queueCount.textContent = "0";
            executeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            executeBtn.disabled = true;
        }
        
        // Limpiar tabla y URLs en caso de nueva selección
        currentObjectUrls.forEach(url => URL.revokeObjectURL(url));
        currentObjectUrls = [];
        detailedResultsBody.innerHTML = '';
        detailedResultsCard.classList.add('hidden');
    });

    executeBtn.addEventListener('click', async () => {
        if (currentFiles.length === 0) return;

        // Reset UI State
        executeBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        resultsSection.classList.add('opacity-50', 'pointer-events-none');
        
        // Simular progreso de subida visualmente (ya que fetch() nativo no tiene progreso onUploadProgress)
        let fakeProgress = 0;
        const interval = setInterval(() => {
            fakeProgress += 10;
            if(fakeProgress >= 90) clearInterval(interval); // Dejar en 90% hasta que termine
            progressBar.style.width = `${fakeProgress}%`;
            progressText.textContent = `${Math.round(fakeProgress)}%`;
        }, 300);

        try {
            const startTime = performance.now();
            const result = await evaluateBatch(currentFiles);
            const endTime = performance.now();
            
            // Llenar el 100% de la barra
            clearInterval(interval);
            progressBar.style.width = `100%`;
            progressText.textContent = `100%`;

            setTimeout(() => {
                progressContainer.classList.add('hidden');
                executeBtn.disabled = false;
                executeBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Evaluar Nuevo Lote';
                
                // Actualizar métricas reales
                resRate.textContent = `${result.tasa_aceptacion}%`;
                resTotal.textContent = result.total_imagenes;
                resSuccess.textContent = result.aceptados;
                resError.textContent = result.rechazados;

                // Actualizar Pie Chart
                resPieChart.style.background = `conic-gradient(#34C759 0% ${result.tasa_aceptacion}%, #FF3B3B ${result.tasa_aceptacion}% 100%)`;

                // Actualizar Etiqueta Óptimo/Crítico
                const badgeIcon = resStatusBadge.querySelector('span:first-child');
                const badgeText = resStatusBadge.querySelector('span:last-child');
                
                resStatusBadge.className = 'mt-md font-label-md text-label-md px-sm py-xs rounded uppercase flex items-center gap-xs';
                resRate.className = 'font-headline-xl text-headline-xl filter';
                
                if (result.tasa_aceptacion >= 80) {
                    resStatusBadge.classList.add('bg-status-success/10', 'text-status-success');
                    badgeIcon.textContent = 'check_circle';
                    badgeText.textContent = 'Óptimo';
                    resRate.classList.add('text-status-success', 'drop-shadow-[0_0_15px_rgba(52,199,89,0.3)]');
                } else if (result.tasa_aceptacion >= 50) {
                    resStatusBadge.classList.add('bg-status-warning/10', 'text-status-warning');
                    badgeIcon.textContent = 'warning';
                    badgeText.textContent = 'Regular';
                    resRate.classList.add('text-status-warning', 'drop-shadow-[0_0_15px_rgba(255,176,32,0.3)]');
                } else {
                    resStatusBadge.classList.add('bg-status-error/10', 'text-status-error');
                    badgeIcon.textContent = 'error';
                    badgeText.textContent = 'Crítico';
                    resRate.classList.add('text-status-error', 'drop-shadow-[0_0_15px_rgba(255,59,59,0.3)]');
                }

                // Actualizar Tiempo de Ejecución
                const totalMs = endTime - startTime;
                const totalSeconds = (totalMs / 1000).toFixed(1);
                const msPerImage = result.total_imagenes > 0 ? (totalMs / result.total_imagenes).toFixed(1) : 0;
                
                let mins = Math.floor(totalSeconds / 60);
                let secs = (totalSeconds % 60).toFixed(1);
                let timeStr = mins > 0 ? `${mins}m ${secs}s` : `${totalSeconds}s`;
                
                resTimeText.textContent = `Tiempo de ejecución: ${timeStr} (${msPerImage}ms / img)`;

                // Poblar Tabla Detallada
                detailedResultsBody.innerHTML = '';
                if (result.resultados && result.resultados.length > 0) {
                    result.resultados.forEach((res, index) => {
                        const file = currentFiles[index];
                        const objectUrl = file ? URL.createObjectURL(file) : null;
                        if (objectUrl) currentObjectUrls.push(objectUrl);
                        
                        const tr = document.createElement('tr');
                        tr.className = "hover:bg-surface-container-high transition-colors";
                        
                        let badgeHtml = '';
                        if (res.rostro_detectado === false) {
                            badgeHtml = `<span class="px-2 py-1 bg-surface-container-highest text-text-medium rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto"><span class="material-symbols-outlined text-[14px]">face_retouching_off</span> SIN ROSTRO</span>`;
                        } else if (res.aceptado) {
                            badgeHtml = `<span class="px-2 py-1 bg-status-success/10 text-status-success rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto border border-status-success/20"><span class="material-symbols-outlined text-[14px]">check_circle</span> MATCH</span>`;
                        } else {
                            badgeHtml = `<span class="px-2 py-1 bg-status-error/10 text-status-error rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto border border-status-error/20"><span class="material-symbols-outlined text-[14px]">cancel</span> RECHAZADO</span>`;
                        }

                        const confStr = (res.similitud !== undefined && res.similitud !== null) ? `${res.similitud.toFixed(1)}%` : '--';
                        const distStr = (res.distancia_minima !== undefined && res.distancia_minima !== null) ? res.distancia_minima.toFixed(3) : '--';
                        const distColor = res.aceptado ? 'text-text-high' : 'text-status-error font-semibold';

                        tr.innerHTML = `
                            <td class="py-sm px-xs md:px-md whitespace-nowrap">
                                <div class="flex items-center gap-xs md:gap-sm">
                                    ${objectUrl ? `<img src="${objectUrl}" class="w-8 h-8 md:w-10 md:h-10 object-cover rounded shadow-sm border border-outline-variant shrink-0" />` : ''}
                                    <span class="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] text-xs md:text-sm text-text-high" title="${res.archivo}">${res.archivo}</span>
                                </div>
                            </td>
                            <td class="py-sm px-xs md:px-md font-mono text-xs md:text-sm whitespace-nowrap">${confStr}</td>
                            <td class="py-sm px-xs md:px-md font-mono text-xs md:text-sm whitespace-nowrap ${distColor}">${distStr}</td>
                            <td class="py-sm px-xs md:px-md text-center whitespace-nowrap">${badgeHtml}</td>
                        `;
                        detailedResultsBody.appendChild(tr);
                    });
                    detailedResultsCard.classList.remove('hidden');
                }

                resultsSection.classList.remove('opacity-50', 'pointer-events-none');
            }, 500);

        } catch (error) {
            clearInterval(interval);
            alert("Error al procesar el lote de imágenes.");
            progressContainer.classList.add('hidden');
            executeBtn.disabled = false;
        }
    });
});
