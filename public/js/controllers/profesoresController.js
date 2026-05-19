import supabase from '../models/supabaseClient.js';

// Estado 
let allDocentes = [];
let searchTerm = '';

// Renderizar cards
function renderDocentes(list) {
    const container = document.getElementById('profesores-container');
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

    container.innerHTML = list.map(d => {
        const nombre = `${d.nombre} ${d.apellido}`;
        const totalRes = d.total_resenas ?? 0;
        const promedio = d.promedio_estrellas;    // number | null
        const tieneRes = totalRes > 0 && promedio !== null;
        const estrellas = tieneRes ? promedio.toFixed(1) : null;
        const area = d.area || 'Ingeniería de Software';
        const slug = encodeURIComponent(d.id);

        const ratingHtml = tieneRes
            ? `<div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-yellow-500"
                        style="font-variation-settings:'FILL' 1; font-size:20px">star</span>
                    <span class="font-bold text-sm dark:text-white">${estrellas}</span>
               </div>`
            : `<span class="text-xs text-[#8f5662]/60 dark:text-white/30">Sin reseñas</span>`;

        const resenasLabel = totalRes === 0
            ? ''
            : `<p class="text-xs text-[#8f5662]/60 dark:text-white/30 mt-1">${totalRes} reseña${totalRes !== 1 ? 's' : ''}</p>`;

        return `
        <a href="./perfil-maestro.html?id=${slug}"
            class="materia-card block transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            data-name="${nombre.toLowerCase()}">

            <div class="flex justify-between items-center mb-8">
                <div class="w-14 h-14 rounded-2xl bg-[#8d2036]/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#8d2036] text-3xl">person</span>
                </div>
                ${ratingHtml}
            </div>

            <h3 class="text-2xl font-black dark:text-white mb-2">${nombre}</h3>
            <p class="text-[#8f5662] dark:text-white/60 text-sm">${area}</p>
            ${resenasLabel}
            ${d.cubiculo ? `<p class="text-xs text-[#8f5662]/70 dark:text-white/40">${d.cubiculo}</p>` : ''}

        </a>`;
    }).join('');
}

// Aplicar filtros
function applyFilters() {
    const filtered = allDocentes.filter(d => {
        const nombre = `${d.nombre} ${d.apellido}`.toLowerCase();
        return nombre.includes(searchTerm);
    });
    renderDocentes(filtered);
}

// Buscador
window.filterProfesores = function () {
    searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    applyFilters();
};

// Cargar desde Supabase
async function loadDocentes() {
    const container = document.getElementById('profesores-container');
    if (!container) return;

    // Skeleton loading
    container.innerHTML = Array(6).fill(`
        <div class="materia-card animate-pulse">
            <div class="flex justify-between items-center mb-8">
                <div class="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/10"></div>
                <div class="w-12 h-5 rounded-full bg-slate-200 dark:bg-white/10"></div>
            </div>
            <div class="h-6 bg-slate-200 dark:bg-white/10 rounded mb-3 w-3/4"></div>
            <div class="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
        </div>`
    ).join('');

    const { data, error } = await supabase
        .from('docentes')
        .select('id, nombre, apellido, area, cubiculo')
        .eq('activo', true)
        .order('apellido');

    if (error) {
        console.error('Error cargando docentes:', error);
        container.innerHTML = `
            <div class="col-span-3 text-center py-16 text-red-500">
                Error al cargar los profesores. Intenta de nuevo.
            </div>`;
        return;
    }

    const docentes = data || [];

    // Actualizar contador
    const countEl = document.getElementById('total-profesores');
    if (countEl) countEl.textContent = docentes.length;

    // Traer conteo y promedio real desde resenas (fuente de verdad)
    const { data: statsData } = await supabase
        .from('resenas')
        .select('docente_id, estrellas');

    // Agrupar estadísticas por docente_id
    const statsMap = {};
    (statsData || []).forEach(r => {
        if (!statsMap[r.docente_id]) statsMap[r.docente_id] = { sum: 0, count: 0 };
        statsMap[r.docente_id].sum += r.estrellas;
        statsMap[r.docente_id].count += 1;
    });

    // Mezclar stats calculadas en cada docente
    allDocentes = docentes.map(d => {
        const stats = statsMap[d.id];
        return {
            ...d,
            total_resenas: stats ? stats.count : 0,
            promedio_estrellas: stats ? stats.sum / stats.count : null,
        };
    });

    applyFilters();
}

// Init
document.addEventListener('DOMContentLoaded', loadDocentes);