import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4jdAvuZH22Z7KnjtHBTKC8n4X0w4ZCso",
  authDomain: "cineforo-espoch-d7506.firebaseapp.com",
  projectId: "cineforo-espoch-d7506",
  storageBucket: "cineforo-espoch-d7506.firebasestorage.app",
  messagingSenderId: "809823549810",
  appId: "1:809823549810:web:7f0876edf8c22d703245eb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DE LA VISTA DEL CELULAR (index.html) ---
const formulario = document.getElementById('formAsistencia');
if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita recargar la página

        const btnSubmit = document.getElementById('btnSubmit');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Registrando...";

        try {
            await addDoc(collection(db, "asistentes"), {
                nombre: document.getElementById('nombres').value,
                correo: document.getElementById('correo').value,
                ciudad: document.getElementById('ciudad').value,
                esEspoch: document.getElementById('tipoAsistente').value,
                facultad: document.getElementById('facultad') ? document.getElementById('facultad').value : "",
                carrera: document.getElementById('carrera') ? document.getElementById('carrera').value : "",
                fecha: new Date()
            });
            
            document.getElementById('formContainer').innerHTML = `
                <div class="text-center p-6 bg-green-100 rounded-lg">
                    <h2 class="text-2xl font-bold text-green-800">¡Registro Exitoso!</h2>
                    <p class="text-green-700 mt-2">Bienvenido al Cine Foro Sostenibilidad.</p>
                </div>
            `;
        } catch (error) {
            console.error("Error al registrar: ", error);
            alert("Hubo un error de conexión.");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Registrar Ingreso";
        }
    });
}

// --- LÓGICA DE LA VISTA DEL AUDITORIO (dashboard.html) ---
const contadorElement = document.getElementById('contadorTotal');
if (contadorElement) {
    // onSnapshot escucha los datos en tiempo real (Latencia cero)
    onSnapshot(collection(db, "asistentes"), (snapshot) => {
        contadorElement.innerText = snapshot.size;

        // Aquí el equipo puede agregar la lógica para extraer datos
        // y pasárselos a Chart.js para los gráficos dinámicos.
        // Ejemplo rápido para ver en consola:
        let espoch = 0, externos = 0;
        snapshot.forEach((doc) => {
            if (doc.data().esEspoch === 'espoch') espoch++;
            else externos++;
        });
        console.log(`Universitarios: ${espoch} | Externos: ${externos}`);
    });
}