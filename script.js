/* ============================================================
   BerryBot — script.js
   JavaScript global para todo el proyecto UES
   Importar en todos los HTML: <script src="script.js"></script>
   IMPORTANTE: debe ir ANTES del cierre de </body>, después
   de cualquier <script type="module"> de Supabase.
   ============================================================ */


/* 1. DARK MODE */

/**
 * Aplica el tema guardado en localStorage SIN animación.
 * Se llama automáticamente al cargar cada página.
 * También hay un snippet inline en cada <head> para evitar
 * el flash visual (FOUC) — ese snippet y esta función
 * hacen lo mismo, pero esta actualiza además el ícono.
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    const icon = document.getElementById('dark-icon');

    if (savedTheme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
        if (icon) icon.textContent = 'light_mode';
    } else {
        html.classList.add('light');
        html.classList.remove('dark');
        if (icon) icon.textContent = 'dark_mode';
    }
}

/**
 * Alterna entre modo claro y oscuro.
 * Añade la clase `theme-transitioning` solo durante la animación
 * para que el CSS aplique la transición únicamente en el clic
 * y no al cargar la página.
 */
function toggleDark() {
    const html = document.documentElement;
    const icon = document.getElementById('dark-icon');

    // Activar transición solo durante el toggle
    html.classList.add('theme-transitioning');

    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('theme', 'light');
        if (icon) icon.textContent = 'dark_mode';
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (icon) icon.textContent = 'light_mode';
    }

    // Quitar la clase de transición cuando termina la animación
    setTimeout(() => {
        html.classList.remove('theme-transitioning');
    }, 350);
}


/* 2. TABS (login.html) */

/**
 * Alterna entre el panel de Login y Registro.
 * @param {'login' | 'register'} tab - Pestaña a mostrar
 */
function switchTab(tab) {
    const loginPanel = document.getElementById('panel-login');
    const registerPanel = document.getElementById('panel-register');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');

    // Si alguno de los elementos no existe, salir sin errores
    if (!loginPanel || !registerPanel) return;

    loginPanel.classList.toggle('hidden', tab !== 'login');
    registerPanel.classList.toggle('hidden', tab !== 'register');

    if (tab === 'login') {
        loginTab.classList.add('tab-active');
        loginTab.classList.remove('tab-inactive');
        registerTab.classList.add('tab-inactive');
        registerTab.classList.remove('tab-active');
    } else {
        registerTab.classList.add('tab-active');
        registerTab.classList.remove('tab-inactive');
        loginTab.classList.add('tab-inactive');
        loginTab.classList.remove('tab-active');
    }
}


/* 3. LOGOUT */

/**
 * Cierra la sesión del usuario en Supabase.
 * Llama al método signOut del cliente global window._sb
 * que se inicializa en cada módulo JS
 */
async function logout() {
    try {
        if (window._sb) {
            await window._sb.auth.signOut();
        }
    } catch (e) {
        console.error('Error al cerrar sesión:', e);
    } finally {
        localStorage.removeItem('theme'); // Opcional: resetea el tema al salir
        location.href = 'login.html';
    }
}


/* 4. UTILIDADES GENERALES */

/**
 * Formatea una fecha ISO a texto en español.
 * @param {string} isoDate - Fecha en formato 'YYYY-MM-DD'
 * @param {'short'|'long'} format - Nivel de detalle
 * @returns {string} Ej: "12 de junio" o "lun. 12 jun."
 */
function formatDate(isoDate, format = 'long') {
    const date = new Date(isoDate + 'T12:00:00');
    if (format === 'short') {
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}

/**
 * Genera las iniciales de un nombre completo.
 * @param {string} nombre
 * @param {string} apellido
 * @returns {string} Ej: "JG"
 */
function getInitials(nombre, apellido) {
    return ((nombre?.[0] || '') + (apellido?.[0] || '')).toUpperCase();
}

/**
 * Genera la barra de estrellas en texto unicode.
 * @param {number} promedio - Número del 0 al 5
 * @returns {string} Ej: "★★★★☆"
 */
function renderStars(promedio) {
    const rounded = Math.round(promedio);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}


/* 5. INIT */

// Ejecutar initTheme al cargar para sincronizar el ícono del botón
// (el tema visual ya fue aplicado por el snippet del <head>)
document.addEventListener('DOMContentLoaded', initTheme);