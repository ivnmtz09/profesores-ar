// =============================================================
// home.js
// Controlador principal de la Home: navegación por carreras,
// directorio de docentes de Sistemas, modal de detalle con
// datos de Firestore (nombre + correo) y visor 3D.
// =============================================================

import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// =============================================================
// ESTADO DE LA APLICACIÓN
// =============================================================
let modalViewerLoaded = false; // Evita recargar el mismo modelo en el modal

// =============================================================
// REFERENCIAS AL DOM
// =============================================================
const sectionCarreras = document.getElementById('section-carreras');
const sectionSistemas = document.getElementById('section-sistemas');
const navBreadcrumb   = document.getElementById('nav-breadcrumb');
const modalOverlay    = document.getElementById('modal-docente');
const modal           = modalOverlay?.querySelector('.modal');

// =============================================================
// NAVEGACIÓN POR HASH
// Lee el hash de la URL (#sistemas) al cargar para restaurar la
// vista si el usuario vuelve atrás desde ar.html.
// =============================================================
function initNavegacion() {
  if (window.location.hash === '#sistemas') {
    mostrarSistemas(false); // sin animación al cargar directo por hash
  } else {
    mostrarCarreras(false);
  }
}

// =============================================================
// mostrarCarreras()
// Muestra la vista general de Programas Académicos (grid de carreras)
// y oculta el directorio de Sistemas.
// =============================================================
function mostrarCarreras(pushHistory = true) {
  sectionCarreras.style.display = 'block';
  sectionSistemas.classList.remove('visible');
  navBreadcrumb.style.display = 'none';

  if (pushHistory) {
    history.pushState({ view: 'carreras' }, '', '#carreras');
  }
}

// =============================================================
// mostrarSistemas()
// Muestra el directorio de los 6 docentes de Ingeniería de Sistemas
// y oculta la grilla de carreras.
// =============================================================
function mostrarSistemas(pushHistory = true) {
  sectionCarreras.style.display = 'none';
  sectionSistemas.classList.add('visible');
  navBreadcrumb.style.display = 'flex';

  if (pushHistory) {
    history.pushState({ view: 'sistemas' }, '', '#sistemas');
  }
}

// =============================================================
// BOTÓN "Ver docentes de Sistemas"
// =============================================================
document.getElementById('btn-ir-sistemas')?.addEventListener('click', () => {
  mostrarSistemas();
});

// =============================================================
// BOTÓN DE BREADCRUMB "Programas"
// =============================================================
document.getElementById('crumb-inicio')?.addEventListener('click', () => {
  mostrarCarreras();
});

// =============================================================
// SOPORTE DEL HISTORIAL DEL NAVEGADOR (botón atrás del dispositivo)
// =============================================================
window.addEventListener('popstate', (e) => {
  if (e.state?.view === 'sistemas' || window.location.hash === '#sistemas') {
    mostrarSistemas(false);
  } else {
    mostrarCarreras(false);
  }
});

// =============================================================
// APERTURA DEL MODAL
// Captura clics en cualquier botón .btn-ver de la galería.
// =============================================================
document.querySelectorAll('.btn-ver').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (!id) return;
    abrirModal(id);
  });
});

// =============================================================
// abrirModal(id)
// Muestra el modal de detalle del docente:
//   1. Muestra un estado de carga (skeleton).
//   2. Consulta Firestore para obtener nombre y email.
//   3. Carga el modelo 3D en <model-viewer>.
//   4. Configura el botón de AR.
// =============================================================
async function abrirModal(id) {
  if (!modalOverlay) return;

  // --- Resetear y mostrar estado de carga ---
  setModalLoading(true);
  document.getElementById('modal-nombre').textContent = 'Cargando...';
  document.getElementById('modal-contact').style.display = 'none';

  // Configurar el visor 3D para el nuevo docente
  const viewer = document.getElementById('viewer-3d');
  if (viewer) {
    viewer.src = `models/${id}.glb`;
    viewer.setAttribute('camera-orbit', '0deg 75deg 105%');
  }

  // Configurar enlace a AR
  const btnAR = document.getElementById('btn-ir-ar');
  if (btnAR) {
    btnAR.href = `ar.html?id=${id}`;
  }

  // Bloquear scroll del body cuando el modal está abierto
  document.body.style.overflow = 'hidden';

  // Mostrar el overlay (animación CSS)
  modalOverlay.classList.add('visible');
  modal?.focus();

  // --- Consultar Firestore ---
  try {
    const docRef  = doc(db, 'docentes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datos = docSnap.data();
      renderizarDatosModal(datos);
    } else {
      document.getElementById('modal-nombre').textContent = id;
      console.warn(`⚠️ Docente "${id}" no encontrado en Firestore.`);
    }
  } catch (err) {
    document.getElementById('modal-nombre').textContent = id;
    console.error('❌ Error al leer Firestore:', err);
  } finally {
    setModalLoading(false);
  }
}

// =============================================================
// renderizarDatosModal(datos)
// Escribe en el modal únicamente el NOMBRE y el EMAIL del docente,
// tal como solicita la especificación del proyecto.
// =============================================================
function renderizarDatosModal(datos) {
  // Nombre
  const nombre = datos.nombre || 'Docente';
  document.getElementById('modal-nombre').textContent = nombre;

  // Correo electrónico institucional
  const emailEl = document.getElementById('modal-email-link');
  const contactEl = document.getElementById('modal-contact');
  if (datos.email && emailEl) {
    emailEl.href = `mailto:${datos.email}`;
    emailEl.querySelector('.email-text').textContent = datos.email;
    contactEl.style.display = 'flex';
  } else if (contactEl) {
    contactEl.style.display = 'none';
  }
}

// =============================================================
// setModalLoading(loading)
// Muestra u oculta el indicador de carga de datos dentro del modal.
// =============================================================
function setModalLoading(loading) {
  const indicator = document.getElementById('modal-loading');
  if (indicator) {
    indicator.style.display = loading ? 'flex' : 'none';
  }
}

// =============================================================
// CIERRE DEL MODAL
// Tres formas de cerrar: botón X, botón "Cerrar", clic en el overlay.
// =============================================================
function cerrarModal() {
  modalOverlay?.classList.remove('visible');
  document.body.style.overflow = '';

  // Detener la rotación automática del modelo y liberar recursos
  // (se reanudará al abrir el modal de nuevo)
  modalViewerLoaded = false;
}

document.getElementById('modal-close-btn')?.addEventListener('click', cerrarModal);
document.getElementById('btn-modal-cancel')?.addEventListener('click', cerrarModal);

// Clic fuera del modal (en el overlay oscuro) → cerrar
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

// Tecla ESC → cerrar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('visible')) {
    cerrarModal();
  }
});

// =============================================================
// INICIALIZACIÓN
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎓 Portal de Docentes Uniguajira iniciado.');
  initNavegacion();
});
