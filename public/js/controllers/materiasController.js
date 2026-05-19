import supabase from '../models/supabaseClient.js';

// Estado
let allMaterias = [];
let activeSem = 'all';
let searchTerm = '';

// Íconos por área/nombre de materia
const iconMap = [
    { keys: ['cálculo', 'calculo', 'álgebra', 'algebra', 'matemáticas', 'matematicas', 'probabilidad', 'estadística'], icon: 'functions' },
    { keys: ['base', 'datos', 'database', 'sql'], icon: 'storage' },
    { keys: ['programación', 'programacion', 'algoritmo', 'estructura'], icon: 'code' },
    { keys: ['redes', 'protocolo', 'comunicación'], icon: 'lan' },
    { keys: ['web', 'interfaz', 'diseño', 'frontend'], icon: 'web' },
    { keys: ['móvil', 'movil', 'android', 'ios', 'app'], icon: 'smartphone' },
    { keys: ['inteligencia', 'artificial', 'machine', 'aprendizaje'], icon: 'psychology' },
    { keys: ['seguridad', 'criptografía', 'integridad'], icon: 'security' },
    { keys: ['inglés', 'ingles', 'comunicación oral'], icon: 'translate' },
    { keys: ['electrónica', 'electronica', 'circuito'], icon: 'electrical_services' },
    { keys: ['compilador', 'lenguaje'], icon: 'terminal' },
    { keys: ['calidad', 'pruebas', 'testing'], icon: 'verified' },
    { keys: ['operaciones', 'simulación', 'optimización'], icon: 'analytics' },
    { keys: ['administración', 'finanzas', 'emprendimiento'], icon: 'business_center' },
    { keys: ['graficación', 'gráficas', 'graficos'], icon: 'bar_chart' },
    { keys: ['sistema operativo', 'linux', 'red'], icon: 'dns' },
    { keys: ['big data', 'minería', 'datos masivos'], icon: 'hub' },
    { keys: ['servicio social', 'práctica', 'practica'], icon: 'work' },
    { keys: ['metodología', 'investigación'], icon: 'science' },
    { keys: ['género', 'genero', 'sociedad', 'salud', 'cuidado'], icon: 'diversity_3' },
];

function getIcon(nombre) {
    const lower = nombre.toLowerCase();
    for (const entry of iconMap) {
        if (entry.keys.some(k => lower.includes(k))) return entry.icon;
    }
    return 'book';
}

const semLabels = {
    1: '1er Sem', 2: '2do Sem', 3: '3er Sem', 4: '4to Sem',
    5: '5to Sem', 6: '6to Sem', 7: '7mo Sem', 8: '8vo Sem',
};

// Renderizar cards
function renderMaterias(list) {
    const container = document.getElementById('materias-container');
    const empty = document.getElementById('empty-state');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '';
        empty?.classList.remove('hidden');
        empty?.classList.add('flex');
        return;
    }

    empty?.classList.add('hidden');
    empty?.classList.remove('flex');

    container.innerHTML = list.map(m => {
        const icon = getIcon(m.nombre);
        const semLabel = semLabels[m.semestre] || `Sem ${m.semestre}`;
        const creditos = m.creditos || 6;

        return `
        <div class="materia-card" data-sem="${m.semestre}" data-name="${m.nombre.toLowerCase()}">
            <div class="flex justify-between items-center mb-8">
                <span class="material-symbols-outlined text-[#8d2036] text-3xl">${icon}</span>
                <span class="semester-tag">${semLabel}</span>
            </div>
            <h3 class="text-2xl font-black dark:text-white mb-2">${m.nombre}</h3>
            <p class="text-[#8f5662] dark:text-white/60 text-sm">Ing. de Software · ${creditos} créditos</p>
            ${m.clave ? `<p class="text-xs text-[#8f5662]/50 dark:text-white/30 mt-1">${m.clave}</p>` : ''}
        </div>`;
    }).join('');
}

// Aplicar filtros
function applyFilters() {
    const filtered = allMaterias.filter(m => {
        const semMatch = activeSem === 'all' || String(m.semestre) === activeSem;
        const nameMatch = m.nombre.toLowerCase().includes(searchTerm) ||
            (m.clave || '').toLowerCase().includes(searchTerm);
        return semMatch && nameMatch;
    });
    renderMaterias(filtered);
}

// Filtro semestres
window.filterSem = function (btn, sem) {
    activeSem = sem;
    document.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
};

// Buscador
window.filterMaterias = function () {
    searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    applyFilters();
};

// Cargar desde Supabase
async function loadMaterias() {
    const container = document.getElementById('materias-container');
    if (!container) return;

    // Skeleton loading
    container.innerHTML = Array(6).fill(`
        <div class="materia-card animate-pulse">
            <div class="flex justify-between items-center mb-8">
                <div class="w-8 h-8 rounded bg-slate-200 dark:bg-white/10"></div>
                <div class="w-16 h-6 rounded-full bg-slate-200 dark:bg-white/10"></div>
            </div>
            <div class="h-6 bg-slate-200 dark:bg-white/10 rounded mb-3 w-3/4"></div>
            <div class="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
        </div>`
    ).join('');

    const { data, error } = await supabase
        .from('materias')
        .select('id, nombre, clave, semestre, creditos')
        .order('semestre')
        .order('nombre');

    if (error) {
        console.error('Error cargando materias:', error);
        container.innerHTML = `
            <div class="col-span-3 text-center py-16 text-red-500">
                Error al cargar las materias. Intenta de nuevo.
            </div>`;
        return;
    }

    // Actualizar estadísticas
    const totalEl = document.getElementById('total-materias');
    if (totalEl) totalEl.textContent = data.length;

    allMaterias = data || [];
    applyFilters();
}

// Init
document.addEventListener('DOMContentLoaded', loadMaterias);