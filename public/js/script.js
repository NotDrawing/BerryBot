// DARK MODE
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
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

    // Actualizar todos los iconos de material symbols para que se vean bien
    updateMaterialIcons();
}

function toggleDark() {
    const html = document.documentElement;
    const icon = document.getElementById('dark-icon');

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

    // Actualizar iconos después del cambio
    setTimeout(() => {
        updateMaterialIcons();
        html.classList.remove('theme-transitioning');
    }, 50);
}

// Función para actualizar los iconos de material symbols
function updateMaterialIcons() {
    // Esto fuerza a los navegadores a re-renderizar los iconos
    const icons = document.querySelectorAll('.material-symbols-outlined');
    icons.forEach(icon => {
        const content = icon.textContent;
        icon.style.opacity = '0.99';
        setTimeout(() => {
            icon.style.opacity = '1';
        }, 10);
    });
}

// TABS (Login / Registro)
function switchTab(tab) {
    const panelLogin = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (!panelLogin || !panelRegister) return;

    if (tab === 'login') {
        panelLogin.classList.remove('hidden');
        panelRegister.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        panelLogin.classList.add('hidden');
        panelRegister.classList.remove('hidden');
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // También inicializar cuando el DOM cambie (para contenido dinámico)
    const observer = new MutationObserver(() => {
        updateMaterialIcons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// Exponer funciones globales para los botones onclick
window.toggleDark = toggleDark;
window.switchTab = switchTab;