import supabase from '../models/supabaseClient.js';

// Auth Guard + Carga inicial del Dashboard
async function initDashboard() {
    const session = await checkAuth();
    if (!session) return;

    await loadUserProfile(session);
    await loadEventos();
    await loadResenas();

    // Inicializar el icono del modo oscuro después de cargar
    initDarkModeIcon();
}

// Verificar si el usuario está autenticado
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    return session;
}

// Inicializar el icono del modo oscuro
function initDarkModeIcon() {
    const darkIcon = document.getElementById('dark-icon');
    if (!darkIcon) return;

    const isDark = document.documentElement.classList.contains('dark');
    darkIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
}

// Cargar información del usuario (nombre, avatar, etc.)
async function loadUserProfile(session) {
    if (!session) return;

    // Intentar cargar perfil desde tabla 'usuarios'
    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre, apellido, num_expediente')
        .eq('id', session.user.id)
        .single();

    const hdAvatar = document.getElementById('hd-avatar');
    const hdName = document.getElementById('hd-name');
    const welcomeName = document.getElementById('welcome-name');

    if (profile && profile.nombre) {
        const fullName = `${profile.nombre} ${profile.apellido || ''}`.trim();
        const initials = (profile.nombre[0] + (profile.apellido ? profile.apellido[0] : '')).toUpperCase();

        if (hdAvatar) hdAvatar.textContent = initials;
        if (hdName) hdName.textContent = fullName;
        if (welcomeName) welcomeName.textContent = profile.nombre;
    }
    else {
        // Caso de login con Google (sin perfil guardado)
        const user = session.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.nombre || user.email?.split('@')[0] || 'Estudiante';
        const displayName = name.split(' ')[0];

        if (hdName) hdName.textContent = name;
        if (welcomeName) welcomeName.textContent = displayName;

        // Iniciales genéricas
        if (hdAvatar) hdAvatar.textContent = displayName.substring(0, 2).toUpperCase();
    }
}

// Cargar próximos eventos
async function loadEventos() {
    const hoy = new Date().toISOString().split('T')[0];

    const { data: eventos } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', hoy)
        .order('fecha_inicio', { ascending: true })
        .limit(4);

    const container = document.getElementById('eventos-grid');
    if (!container) return;

    if (eventos && eventos.length > 0) {
        container.innerHTML = eventos.map(evento => `
            <div class="bg-white dark:bg-[#2d1a1e] border border-slate-200 dark:border-white/10 p-4 rounded-2xl hover:border-[#8d2036]/30 transition-all">
                <div class="flex gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-[#8d2036]/10 flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#8d2036] dark:text-[#8d2036]">event</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-[#8d2036] dark:text-[#8d2036]">${new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <h4 class="font-semibold text-sm text-slate-700 dark:text-slate-200 mt-1 line-clamp-2">${evento.titulo}</h4>
                        ${evento.descripcion ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${evento.descripcion}</p>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <p class="text-slate-500 dark:text-slate-400 text-center py-8">
                No hay eventos próximos registrados.
            </p>`;
    }
}

// Cargar últimas reseñas
async function loadResenas() {
    const { data: resenas } = await supabase
        .from('resenas_publicas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    const container = document.getElementById('resenas-lista');
    if (!container) return;

    if (resenas && resenas.length > 0) {
        container.innerHTML = resenas.map(resena => {
            const stars = '★'.repeat(resena.estrellas || 5) + '☆'.repeat(5 - (resena.estrellas || 5));
            return `
                <div class="bg-white dark:bg-[#2d1a1e] border border-slate-200 dark:border-white/10 p-5 rounded-3xl">
                    <div class="flex justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center text-[#8d2036] dark:text-[#8d2036] font-bold text-xs">
                                ${resena.docente_nombre ? resena.docente_nombre.substring(0, 2).toUpperCase() : 'DO'}
                            </div>
                            <div>
                                <h4 class="font-semibold text-sm text-slate-700 dark:text-slate-200">${resena.docente_nombre || 'Docente'}</h4>
                                <p class="text-xs text-slate-500 dark:text-slate-400">${resena.materia_nombre || ''}</p>
                            </div>
                        </div>
                        <span class="text-[#D4AF37] text-lg">${stars}</span>
                    </div>
                    ${resena.comentario ? `<p class="mt-4 text-sm italic text-slate-600 dark:text-slate-300">"${resena.comentario}"</p>` : ''}
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = `
            <p class="col-span-3 text-center py-12 text-slate-500 dark:text-slate-400">
                Aún no hay reseñas. ¡Sé el primero en publicar una!
            </p>`;
    }
}

// Función de logout mejorada
async function logout() {
    console.log('Función logout ejecutada'); // Para depuración

    try {
        // Mostrar confirmación
        const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?');
        if (!confirmLogout) return;

        console.log('Cerrando sesión en Supabase...');

        // Cerrar sesión en Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Error al cerrar sesión: ' + error.message);
            return;
        }

        console.log('Sesión cerrada correctamente');

        // Limpiar localStorage
        localStorage.removeItem('supabase.auth.token');

        // Redirigir al login
        console.log('Redirigiendo a login...');
        window.location.href = 'login.html';

    } catch (e) {
        console.error('Error inesperado:', e);
        alert('Error al cerrar sesión: ' + e.message);
    }
}

// Exponer funciones necesarias globalmente
window.logout = logout;
window.initDashboard = initDashboard;

// Inicializar automáticamente al importar
// Pequeño delay para asegurar que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initDashboard();
    });
} else {
    initDashboard();
}