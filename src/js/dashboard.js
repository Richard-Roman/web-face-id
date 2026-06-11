import { getServerStatus, getHistory, clearHistory } from '../services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard controller initialized');
    
    const statStatus = document.getElementById('stat-status');
    const statEncodings = document.getElementById('stat-encodings');
    const statUmbral = document.getElementById('stat-umbral');
    const statUmbralBar = document.getElementById('stat-umbral-bar');
    const statHealth = document.getElementById('stat-health');
    const statUptime = document.getElementById('stat-uptime');
    
    const historyTable = document.getElementById('history-table');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnClear = document.getElementById('btn-clear');
    const btnRefreshTop = document.getElementById('btn-refresh-top');
    const btnClearTop = document.getElementById('btn-clear-top');

    async function fetchStatus() {
        try {
            const status = await getServerStatus();
            if (status.estado === 'online') {
                statStatus.textContent = 'Online';
                statStatus.className = 'font-headline-sm text-headline-sm text-status-success';
                statStatus.previousElementSibling.classList.replace('bg-status-error', 'bg-status-success');
                statStatus.previousElementSibling.classList.replace('shadow-[0_0_10px_#FF3B3B]', 'shadow-[0_0_10px_#34C759]');
            } else {
                statStatus.textContent = 'Offline';
                statStatus.className = 'font-headline-sm text-headline-sm text-status-error';
                statStatus.previousElementSibling.classList.replace('bg-status-success', 'bg-status-error');
                statStatus.previousElementSibling.classList.replace('shadow-[0_0_10px_#34C759]', 'shadow-[0_0_10px_#FF3B3B]');
            }
            statEncodings.textContent = status.encodings_en_modelo !== undefined ? status.encodings_en_modelo : 'N/A';

            if (status.umbral_global !== undefined) {
                statUmbral.textContent = status.umbral_global;
                // El umbral suele ser una distancia (ej 0.45), así que calculamos la barra inversa: (1 - 0.45) * 100
                const umbralPct = Math.max(0, (1 - status.umbral_global) * 100);
                if(statUmbralBar) statUmbralBar.style.width = `${umbralPct}%`;
            }

            if (status.memoria_mb !== undefined) {
                if(statHealth) statHealth.textContent = `${status.memoria_mb} MB`;
            }
            
            if (status.uptime_segundos !== undefined) {
                const totalSeconds = Math.floor(status.uptime_segundos);
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                
                let uptimeStr = '';
                if (h > 0) uptimeStr += `${h}h `;
                if (m > 0 || h > 0) uptimeStr += `${m}m `;
                uptimeStr += `${s}s`;
                
                if(statUptime) statUptime.textContent = `Uptime: ${uptimeStr}`;
            }
        } catch (error) {
            statStatus.textContent = 'Error';
        }
    }

    async function fetchHistory() {
        try {
            const history = await getHistory();
            historyTable.innerHTML = '';
            
            const entradas = history.entradas || [];

            if (entradas.length === 0) {
                historyTable.innerHTML = `
                    <tr>
                        <td colspan="4" class="p-md text-center text-text-low font-caption italic">No hay registros</td>
                    </tr>
                `;
                return;
            }

            entradas.forEach((item, index) => {
                const isMatch = item.aceptado;
                const distance = (item.distancia_minima !== undefined && item.distancia_minima !== null) ? parseFloat(item.distancia_minima).toFixed(3) : 'N/A';
                const confidence = (item.similitud !== undefined && item.similitud !== null) ? `${parseFloat(item.similitud).toFixed(1)}%` : '--';
                
                // Color badges
                let badgeHtml = '';
                if (item.rostro_detectado === false) {
                    badgeHtml = `<span class="inline-flex items-center justify-center px-xs md:px-sm py-xs rounded bg-surface-container-highest text-text-medium font-caption text-[10px] md:text-caption uppercase border border-outline-variant/30 gap-xs shadow-sm">
                        <span class="material-symbols-outlined text-[14px]">face_retouching_off</span> Sin Rostro
                    </span>`;
                } else if (isMatch) {
                    badgeHtml = `<span class="inline-flex items-center justify-center px-xs md:px-sm py-xs rounded bg-status-success/10 text-status-success font-caption text-[10px] md:text-caption uppercase border border-status-success/20 gap-xs">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> Match
                    </span>`;
                } else {
                    badgeHtml = `<span class="inline-flex items-center justify-center px-xs md:px-sm py-xs rounded bg-status-error/10 text-status-error font-caption text-[10px] md:text-caption uppercase border border-status-error/20 gap-xs shadow-[0_0_10px_rgba(255,59,59,0.2)]">
                        <span class="material-symbols-outlined text-[14px]">cancel</span> Rechazado
                    </span>`;
                }

                const tr = document.createElement('tr');
                tr.className = "border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors";
                tr.innerHTML = `
                    <td class="py-sm px-xs md:px-md text-text-medium font-mono text-xs md:text-sm whitespace-nowrap">${item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}</td>
                    <td class="py-sm px-xs md:px-md text-status-cyan font-mono text-xs md:text-sm whitespace-nowrap">
                        <span class="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none inline-block align-bottom" title="${item.archivo || item.id || `Eval #${index + 1}`}">${item.archivo || item.id || `Eval #${index + 1}`}</span>
                    </td>
                    <td class="py-sm px-xs md:px-md font-mono text-xs md:text-sm whitespace-nowrap">${confidence}</td>
                    <td class="py-sm px-xs md:px-md font-mono text-xs md:text-sm whitespace-nowrap ${isMatch ? '' : 'text-status-error font-semibold'}">${distance}</td>
                    <td class="py-sm px-xs md:px-md text-right whitespace-nowrap">${badgeHtml}</td>
                `;
                historyTable.appendChild(tr);
            });
        } catch (error) {
            console.error("No se pudo cargar el historial", error);
        }
    }

    const handleRefresh = () => {
        fetchStatus();
        fetchHistory();
    };

    const handleClear = async () => {
        if(confirm("¿Estás seguro de limpiar todo el historial de auditoría?")) {
            try {
                await clearHistory();
                await fetchHistory();
            } catch (error) {
                alert("Error al limpiar historial");
            }
        }
    };

    if (btnRefresh) btnRefresh.addEventListener('click', handleRefresh);
    if (btnRefreshTop) btnRefreshTop.addEventListener('click', handleRefresh);
    if (btnClear) btnClear.addEventListener('click', handleClear);
    if (btnClearTop) btnClearTop.addEventListener('click', handleClear);

    // Initial load
    fetchStatus();
    fetchHistory();
});
