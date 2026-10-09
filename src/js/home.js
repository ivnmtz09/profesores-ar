// =============================================================
// home.js
// Controlador principal: navegación por carreras,
// directorio de docentes de Sistemas, modal con
// datos de Firestore (nombre + correo) y visor 3D interactivo.
// =============================================================

import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// =============================================================
// REFERENCIAS AL DOM
// =============================================================
const sectionCarreras = document.getElementById('section-carreras');
const sectionSistemas = document.getElementById('section-sistemas');
const navBreadcrumb   = document.getElementById('nav-breadcrumb');
const modalOverlay    = document.getElementById('modal-docente');
const modalDialog     = modalOverlay?.querySelector('.modal-dialog');

// =============================================================
// NAVEGACIÓN POR VISTAS Y HASH
// =============================================================
function initNavegacion() {
  if (window.location.hash === '#sistemas') {
    mostrarSistemas(false);
  } else {
    mostrarCarreras(false);
  }
}

function mostrarCarreras(pushHistory = true) {
  if (sectionCarreras) sectionCarreras.style.display = 'block';
  if (sectionSistemas) sectionSistemas.classList.remove('visible');
  if (navBreadcrumb) navBreadcrumb.style.display = 'none';

  if (pushHistory) {
    history.pushState({ view: 'carreras' }, '', '#carreras');
  }
}

function mostrarSistemas(pushHistory = true) {
  if (sectionCarreras) sectionCarreras.style.display = 'none';
  if (sectionSistemas) sectionSistemas.classList.add('visible');
  if (navBreadcrumb) navBreadcrumb.style.display = 'block';

  if (pushHistory) {
    history.pushState({ view: 'sistemas' }, '', '#sistemas');
  }
}

// Botones de navegación
document.getElementById('btn-ir-sistemas')?.addEventListener('click', () => {
  mostrarSistemas();
});

document.getElementById('crumb-inicio')?.addEventListener('click', () => {
  mostrarCarreras();
});

document.getElementById('btn-volver-carreras')?.addEventListener('click', () => {
  mostrarCarreras();
});

// Soporte para botón atrás/adelante del navegador
window.addEventListener('popstate', (e) => {
  if (e.state?.view === 'sistemas' || window.location.hash === '#sistemas') {
    mostrarSistemas(false);
  } else {
    mostrarCarreras(false);
  }
});

// =============================================================
// APERTURA DEL MODAL DE DETALLE
// =============================================================
document.querySelectorAll('.btn-ver').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (!id) return;
    abrirModal(id);
  });
});

async function abrirModal(id) {
  if (!modalOverlay) return;

  // Estado inicial de carga
  setModalLoading(true);
  const nombreEl = document.getElementById('modal-nombre');
  if (nombreEl) nombreEl.textContent = 'Cargando datos...';

  const contactEl = document.getElementById('modal-contact');
  if (contactEl) contactEl.style.display = 'none';

  // Carga del modelo 3D en <model-viewer>
  const viewer = document.getElementById('viewer-3d');
  if (viewer) {
    viewer.src = `models/${id}.glb`;
    viewer.setAttribute('camera-orbit', '0deg 75deg 105%');
  }

  // Enlace hacia experiencia AR
  const btnAR = document.getElementById('btn-ir-ar');
  if (btnAR) {
    btnAR.href = `ar.html?id=${id}`;
  }

  // Prevenir scroll del fondo y mostrar modal
  document.body.style.overflow = 'hidden';
  modalOverlay.classList.add('visible');
  modalDialog?.focus();

  // Consulta en Firestore
  try {
    const docRef  = doc(db, 'docentes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datos = docSnap.data();
      renderizarDatosModal(datos);
    } else {
      if (nombreEl) nombreEl.textContent = id;
      console.warn(`[Docentes AR] Docente "${id}" no encontrado en Firestore.`);
    }
  } catch (err) {
    if (nombreEl) nombreEl.textContent = id;
    console.error('[Docentes AR] Error al consultar Firestore:', err);
  } finally {
    setModalLoading(false);
  }
}

function renderizarDatosModal(datos) {
  const nombreEl = document.getElementById('modal-nombre');
  if (nombreEl) {
    nombreEl.textContent = datos.nombre || 'Docente de Sistemas';
  }

  // Correo electrónico institucional obtenido de Firestore
  const emailLinkEl = document.getElementById('modal-email-link');
  const contactEl   = document.getElementById('modal-contact');

  if (datos.email && emailLinkEl && contactEl) {
    emailLinkEl.href = `mailto:${datos.email}`;
    const textSpan = emailLinkEl.querySelector('.email-text');
    if (textSpan) textSpan.textContent = datos.email;
    contactEl.style.display = 'block';
  } else if (contactEl) {
    contactEl.style.display = 'none';
  }
}

function setModalLoading(loading) {
  const indicator = document.getElementById('modal-loading');
  if (indicator) {
    indicator.style.display = loading ? 'flex' : 'none';
  }
}

// =============================================================
// CIERRE DEL MODAL
// =============================================================
function cerrarModal() {
  modalOverlay?.classList.remove('visible');
  document.body.style.overflow = '';
}

document.getElementById('modal-close-btn')?.addEventListener('click', cerrarModal);
document.getElementById('btn-modal-cancel')?.addEventListener('click', cerrarModal);

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('visible')) {
    cerrarModal();
  }
});

// =============================================================
// INICIALIZACIÓN
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Docentes AR] Portal de Docentes Uniguajira iniciado correctamente.');
  initNavegacion();
});
