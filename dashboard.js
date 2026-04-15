import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://otibvoqmgsybpfaqiyun.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWJ2b3FtZ3N5YnBmYXFpeXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI4NDcsImV4cCI6MjA5MTcwODg0N30.KQpiRCulIi6c5p021OqqOPS8oyr_-mSfhM70qAwcz9I';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth Guard
async function checkAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
        location.href = 'login.html';
        return null;
    }
    return session;
}

// Cargar datos del usuario
async function loadUserProfile(session) {
    if (!session) return;

    const { data: profile, error } = await supabase
        .from('usuarios')
        .select('nombre, apellido, num_expediente')
        .eq('id', session.user.id)
        .single();

    if (profile) {
        const fullName = `${profile.nombre} ${profile.apellido}`;
        const initials = (profile.nombre[0] + profile.apellido[0]).toUpperCase();

        // Sidebar
        document.getElementById('sb-avatar').textContent = initials;
        document.getElementById('sb-name').textContent = fullName;
        document.getElementById('sb-exp').textContent = `Exp. ${profile.num_expediente}`;

        // Header
        document.getElementById('hd-avatar').textContent = initials;
        document.getElementById('hd-name').textContent = fullName;

        // Welcome
        document.getElementById('welcome-name').textContent = profile.nombre;
    } else {
        // Si no tiene perfil (caso de Google), mostrar datos de auth
        const user = session.user;
        const name = user.user_metadata?.nombre || user.user_metadata?.full_name || 'Usuario';
        document.getElementById('welcome-name').textContent = name.split(' ')[0];
    }
}

// Cargar eventos próximos
async function loadEventos() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data: eventos } = await sb
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', hoy)
        .order('fecha_inicio')
        .limit(4);

    const container = document.getElementById('eventos-grid');

    if (eventos && eventos.length > 0) {
        container.innerHTML = eventos.map(e => {
            const fecha = new Date(e.fecha_inicio).toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long'
            });
            return `
                <div class="bg-white dark:bg-background-dark/40 border border-primary/5 p-4 rounded-xl shadow-sm flex gap-4 hover:border-primary/20 transition-all cursor-pointer">
                    <div class="w-16 h-16 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-2xl">event</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-accent uppercase tracking-wider">${fecha}</span>
                        <h4 class="font-bold text-primary text-sm mt-1">${e.titulo}</h4>
                        <p class="text-xs text-slate-500 mt-0.5">${e.descripcion || ''}</p>
                    </div>
                </div>`;
        }).join('');
    } else {
        container.innerHTML = `<p class="text-sm text-slate-400 col-span-2 p-4">No hay eventos próximos registrados.</p>`;
    }
}

// Cargar reseñas recientes
async function loadResenas() {
    const { data: resenas } = await sb
        .from('resenas_publicas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    const container = document.getElementById('resenas-lista');

    if (resenas && resenas.length > 0) {
        container.innerHTML = resenas.map(r => {
            const stars = '★'.repeat(r.estrellas) + '☆'.repeat(5 - r.estrellas);
            return `
                <div class="bg-white dark:bg-background-dark/40 p-5 rounded-xl border border-primary/5 hover:border-accent/30 transition-all">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold text-xs">
                                ${r.docente_nombre ? r.docente_nombre.split(' ').map(w => w[0]).join('').slice(0, 2) : 'DO'}
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">${r.docente_nombre || 'Docente'}</h4>
                                <p class="text-[10px] text-slate-500">${r.materia_nombre || ''}</p>
                            </div>
                        </div>
                        <span class="text-accent text-sm">${stars}</span>
                    </div>
                    ${r.comentario ? `<p class="text-sm text-slate-600 dark:text-slate-300 italic">"${r.comentario}"</p>` : ''}
                </div>`;
        }).join('');
    } else {
        container.innerHTML = `<p class="text-sm text-slate-400 p-4">No hay reseñas aún. ¡Sé el primero!</p>`;
    }
}

// Cargar calendario
async function loadCalendario() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data: cal } = await sb
        .from('calendario')
        .select('*')
        .gte('fecha_fin', hoy)
        .order('fecha_inicio')
        .limit(5);

    const mes = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    document.getElementById('cal-mes').textContent = mes.charAt(0).toUpperCase() + mes.slice(1);

    const container = document.getElementById('calendario-lista');

    if (cal && cal.length > 0) {
        container.innerHTML = cal.map((c, i) => {
            const d = new Date(c.fecha_inicio);
            const dia = d.getDate();
            const mesCorto = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
            const colorClass = i % 2 === 0
                ? 'bg-accent text-primary shadow-sm shadow-accent/40'
                : 'bg-primary text-white';

            return `
                <div class="flex gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                    <div class="flex flex-col items-center justify-center ${colorClass} w-14 h-14 rounded-xl flex-shrink-0">
                        <span class="text-xs font-bold uppercase leading-none">${mesCorto}</span>
                        <span class="text-xl font-black leading-none">${dia}</span>
                    </div>
                    <div class="flex flex-col justify-center">
                        <h4 class="font-bold text-sm group-hover:text-primary transition-colors">${c.nombre}</h4>
                        <p class="text-xs text-slate-500">${c.descripcion || ''}</p>
                    </div>
                </div>`;
        }).join('');
    } else {
        container.innerHTML = `<p class="text-sm text-slate-400 p-4">Sin fechas próximas.</p>`;
    }
}

// Inicialización principal
async function initDashboard() {
    const session = await checkAuth();
    if (!session) return;

    await loadUserProfile(session);
    await loadEventos();
    await loadResenas();
    await loadCalendario();
}

// Ejecutar al cargar
initDashboard();