import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC4jdAvuZH22Z7KnjtHBTKC8n4X0w4ZCso",
    authDomain: "cineforo-espoch-d7506.firebaseapp.com",
    projectId: "cineforo-espoch-d7506",
    storageBucket: "cineforo-espoch-d7506.firebasestorage.app",
    messagingSenderId: "809823549810",
    appId: "1:809823549810:web:7f0876edf8c22d703245eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================================
// VISTA CELULAR (index.html) - Registro & UI
// =============================================

// ── Mostrar / ocultar campos ESPOCH ──────────────
const tipoSelect    = document.getElementById('tipoAsistente');
const camposEspoch  = document.getElementById('camposEspoch');

if (tipoSelect && camposEspoch) {
    tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'espoch') {
            camposEspoch.classList.add('visible');
        } else {
            camposEspoch.classList.remove('visible');
        }
    });
}

// ── Registro a Firebase ─────────────────────────────────
const formulario = document.getElementById('formAsistencia');
if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validación básica
        const nombres = document.getElementById('nombres').value.trim();
        const correo  = document.getElementById('correo').value.trim();
        const ciudad  = document.getElementById('ciudad').value.trim();
        const tipo    = document.getElementById('tipoAsistente').value;

        if (!nombres || !correo || !ciudad || !tipo) {
            alert('Por favor completa todos los campos obligatorios.');
            return;
        }

        const btnSubmit = document.getElementById('btnSubmit');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner"></span>Registrando…';

        try {
            await addDoc(collection(db, "asistentes"), {
                nombre:    nombres,
                correo:    correo,
                ciudad:    ciudad.charAt(0).toUpperCase() + ciudad.slice(1).toLowerCase(), // Limpieza de datos
                esEspoch:  tipo,
                facultad:  document.getElementById('facultad')?.value || "",
                carrera:   document.getElementById('carrera')?.value.trim()  || "",
                fecha:     new Date()
            });

            document.getElementById('formContainer').innerHTML = `
                <div class="success-box">
                    <div class="success-icon">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                    </div>
                    <h2>Registro Exitoso</h2>
                    <p>Bienvenido/a al<br/><strong style="color:var(--cream)">Cine Foro Sostenibilidad</strong>.<br/>Disfruta el evento.</p>
                </div>
            `;
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("Error de conexión. Intenta de nuevo.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "Registrar Ingreso →";
        }
    });
}

// =============================================
// VISTA PROYECTOR (dashboard.html) - Graficos
// =============================================
const contadorElement = document.getElementById('contadorTotal');
if (contadorElement) {

    const VERDES = [
        '#166534', '#15803d', '#16a34a', '#22c55e',
        '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'
    ];

    const PALETTE = [
        '#16a34a', '#0ea5e9', '#8b5cf6', '#f59e0b',
        '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'
    ];

    // Dona: ESPOCH vs Externos
    const chartDona = new Chart(document.getElementById('chartDona'), {
        type: 'doughnut',
        data: {
            labels: ['ESPOCH', 'Visitantes'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#16a34a', '#e5e7eb'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#6b7280', font: { family: 'DM Sans', size: 13, weight: '500' }, padding: 16, usePointStyle: true, pointStyleWidth: 10 }
                }
            }
        }
    });

    // Barras: Facultades
    const chartFacultades = new Chart(document.getElementById('chartFacultades'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Personas',
                data: [],
                backgroundColor: VERDES,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 28
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1, font: { family: 'DM Sans' } },
                    grid: { color: '#f3f4f6' }
                },
                y: {
                    ticks: { color: '#374151', font: { family: 'DM Sans', size: 12, weight: '500' } },
                    grid: { display: false }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Pastel: Ciudades
    const chartCiudades = new Chart(document.getElementById('chartCiudades'), {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: PALETTE,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#6b7280', font: { family: 'DM Sans', size: 11 }, padding: 10, usePointStyle: true, pointStyleWidth: 8 }
                }
            }
        }
    });

    // Valor anterior para animacion de bump
    let prevTotal = 0;

    // Listener en tiempo real
    onSnapshot(collection(db, "asistentes"), (snapshot) => {
        const total = snapshot.size;

        // Animacion de bump en el contador
        contadorElement.innerText = total;
        if (total !== prevTotal) {
            contadorElement.classList.add('bump');
            setTimeout(() => contadorElement.classList.remove('bump'), 300);
            prevTotal = total;
        }

        let espoch = 0;
        let externos = 0;
        const facultades = {};
        const ciudades = {};
        const registros = [];

        snapshot.forEach((doc) => {
            const d = doc.data();

            if (d.esEspoch === 'espoch') {
                espoch++;
                if (d.facultad) {
                    facultades[d.facultad] = (facultades[d.facultad] || 0) + 1;
                }
            } else {
                externos++;
            }

            if (d.ciudad) {
                ciudades[d.ciudad] = (ciudades[d.ciudad] || 0) + 1;
            }

            registros.push({
                nombre: d.nombre || 'Anonimo',
                fecha: d.fecha && d.fecha.toDate ? d.fecha.toDate() : new Date(d.fecha)
            });
        });

        // Dona
        chartDona.data.datasets[0].data = [espoch, externos];
        chartDona.update('none');

        // Facultades ordenadas
        const facOrdenadas = Object.entries(facultades).sort((a, b) => b[1] - a[1]);
        chartFacultades.data.labels = facOrdenadas.map(f => f[0]);
        chartFacultades.data.datasets[0].data = facOrdenadas.map(f => f[1]);
        chartFacultades.data.datasets[0].backgroundColor = facOrdenadas.map((_, i) => VERDES[i % VERDES.length]);
        chartFacultades.update('none');

        // Ciudades top 8
        const ciuOrdenadas = Object.entries(ciudades).sort((a, b) => b[1] - a[1]).slice(0, 8);
        chartCiudades.data.labels = ciuOrdenadas.map(c => c[0]);
        chartCiudades.data.datasets[0].data = ciuOrdenadas.map(c => c[1]);
        chartCiudades.data.datasets[0].backgroundColor = ciuOrdenadas.map((_, i) => PALETTE[i % PALETTE.length]);
        chartCiudades.update('none');

        // Feed en vivo - ultimos 5
        const logContainer = document.getElementById('liveLog');
        registros.sort((a, b) => b.fecha - a.fecha);
        const ultimos5 = registros.slice(0, 5);

        if (ultimos5.length === 0) {
            logContainer.innerHTML = '<div class="feed-empty">Esperando que lleguen los asistentes...</div>';
        } else {
            logContainer.innerHTML = ultimos5.map((r) => {
                const hora = r.fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const nombreCorto = r.nombre.split(' ').slice(0, 2).join(' ');
                
                // Nuevo formato de UI para feed-item (Dashboard V2)
                return `<div class="feed-item">
                    <div class="feed-av" style="background:var(--surf2); color:var(--tp);">${r.nombre.charAt(0).toUpperCase()}</div>
                    <div class="feed-info">
                        <div class="feed-name">${nombreCorto}</div>
                        <div class="feed-detail">Nuevo Registro</div>
                    </div>
                    <span class="feed-time">${hora}</span>
                </div>`;
            }).join('');
        }

        // ==========================================
        // VINCULACIÓN AL NUEVO DISEÑO (DASHBOARD V2)
        // ==========================================
        if (typeof window.updateRankingUI === 'function') {
            const rankingData = facOrdenadas.map(f => ({
                name: f[0],
                count: f[1]
            }));
            window.updateRankingUI(rankingData);
        }

        if (typeof window.updateMiniStats === 'function') {
            const pctEsp = total > 0 ? Math.round((espoch / total) * 100) : 0;
            let lastTimeStr = '—';
            if (ultimos5.length > 0) {
                 lastTimeStr = ultimos5[0].fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
            }
            window.updateMiniStats({
                ciudades: Object.keys(ciudades).length,
                pctEspoch: pctEsp,
                espochCount: espoch,
                lastTime: lastTimeStr
            });
        }
    });
}
