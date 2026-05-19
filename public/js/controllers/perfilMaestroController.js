import supabase from '../models/supabaseClient.js';

// Leer ID de la URL
const params = new URLSearchParams(window.location.search);
const docenteId = params.get('id');

// Helpers
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function buildStars(n, total = 5) {
    return Array.from({ length: total }, (_, i) => {
        const filled = i < Math.round(n);
        return `<span class="material-symbols-outlined text-yellow-500"
            style="font-variation-settings:'FILL' ${filled ? 1 : 0}; font-size:22px">star</span>`;
    }).join('');
}

// Renderizar barras de rating
function renderRatingBars(resenas) {
    const counts = [0, 0, 0, 0, 0]; // índice 0 = 1 estrella
    resenas.forEach(r => { if (r.estrellas >= 1 && r.estrellas <= 5) counts[r.estrellas - 1]++; });
    const max = Math.max(...counts, 1);

    const barsEl = document.getElementById('rating-bars');
    if (!barsEl) return;

    barsEl.innerHTML = [5, 4, 3, 2, 1].map(n => {
        const count = counts[n - 1];
        const pct = Math.round((count / max) * 100);
        return `
        <div class="flex items-center gap-3">
            <span class="text-sm dark:text-white w-3 text-right">${n}</span>
            <div class="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-500 rounded-full transition-all duration-700" style="width:${pct}%"></div>
            </div>
            <span class="text-xs text-[#8f5662] dark:text-white/40 w-4 text-right">${count}</span>
        </div>`;
    }).join('');
}

// Renderizar reseñas
function renderResenas(resenas) {
    const container = document.getElementById('perfil-resenas');
    if (!container) return;

    if (resenas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <span class="material-symbols-outlined text-5xl text-[#8d2036]/20 block mb-3">rate_review</span>
                <p class="text-[#8f5662] dark:text-white/50">Todavía no hay reseñas para este profesor.</p>
                <a href="./reviews.html"
                    class="inline-block mt-5 px-6 py-2.5 bg-[#8d2036] text-white rounded-xl text-sm font-semibold hover:bg-[#74192d] transition-colors">
                    Sé el primero en reseñar
                </a>
            </div>`;
        return;
    }

    container.innerHTML = resenas.map(r => {
        const stars = buildStars(r.estrellas);
        const fecha = new Date(r.created_at).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const materia = r.materias?.nombre || '';
        const tagsHtml = (r.tags || []).map(t =>
            `<span class="text-[10px] px-2 py-1 bg-[#f8f6f6] dark:bg-white/5 text-[#8f5662] dark:text-white/60 rounded-lg border border-[#e4d2d6] dark:border-white/10">${t}</span>`
        ).join('');

        return `
        <article class="bg-white dark:bg-[#2d1a1e] p-6 rounded-3xl shadow-sm border border-[#8d2036]/10 dark:border-white/10 transition-transform hover:scale-[1.01]">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#8d2036]/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#8d2036]">person</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-[#1f1315] dark:text-white">Anónimo</p>
                        <p class="text-[10px] text-[#8f5662] dark:text-white/40 uppercase tracking-wider">
                            ${materia}${materia ? ' · ' : ''}${fecha}
                        </p>
                    </div>
                </div>
                <div class="flex gap-0.5">${stars}</div>
            </div>
            <p class="text-sm text-slate-700 dark:text-white/75 leading-relaxed italic">
                "${r.comentario}"
            </p>
            ${tagsHtml ? `<div class="mt-4 flex flex-wrap gap-2">${tagsHtml}</div>` : ''}
        </article>`;
    }).join('');
}

// Calcular tags más frecuentes
function getTopTags(resenas, limit = 8) {
    const freq = {};
    resenas.forEach(r => {
        (r.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    });
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
}

// Cargar todo
async function loadPerfil() {
    if (!docenteId) {
        hide('loading-state');
        show('error-state');
        return;
    }

    // 1. Datos del docente
    const { data: docente, error: docError } = await supabase
        .from('docentes')
        .select('id, nombre, apellido, area, cubiculo, promedio_estrellas, total_resenas')
        .eq('id', docenteId)
        .single();

    if (docError || !docente) {
        hide('loading-state');
        show('error-state');
        return;
    }

    // 2. Materias del docente
    const { data: materiaRows } = await supabase
        .from('docente_materia')
        .select('materias (id, nombre, semestre)')
        .eq('docente_id', docenteId);

    const materias = (materiaRows || [])
        .map(r => r.materias)
        .filter(Boolean)
        .sort((a, b) => a.semestre - b.semestre);

    // 3. Reseñas del docente — fuente de verdad para conteo y promedio
    const { data: resenas } = await supabase
        .from('resenas')
        .select('id, estrellas, comentario, tags, created_at, materias (nombre)')
        .eq('docente_id', docenteId)
        .order('created_at', { ascending: false });

    const resenasList = resenas || [];
    const totalResenas = resenasList.length;

    // Calcular promedio directamente desde las reseñas obtenidas
    const promedioReal = totalResenas > 0
        ? resenasList.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas
        : null;

    // ── Poblar UI ─────────────────────────────────────────────
    const nombre = `${docente.nombre} ${docente.apellido}`;

    document.title = `BerryBot - ${nombre}`;
    setText('breadcrumb-nombre', nombre);

    // Actualizar href del botón "Agregar reseña" con el docente_id
    const btnResena = document.getElementById('btn-agregar-resena');
    if (btnResena) {
        btnResena.href = `./reviews.html?docente_id=${docenteId}`;
    }

    setText('perfil-nombre', nombre);
    setText('perfil-area', docente.area || 'Ingeniería de Software');

    if (docente.cubiculo) {
        setText('perfil-cubiculo', docente.cubiculo);
        document.getElementById('perfil-cubiculo-row')?.classList.replace('hidden', 'flex');
    }

    setText('perfil-total-resenas', `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}`);

    if (promedioReal !== null) {
        const rating = promedioReal.toFixed(1);
        setText('perfil-rating-badge-num', rating);
        setText('perfil-rating-big', rating);
        document.getElementById('perfil-stars-row').innerHTML = buildStars(promedioReal);
        setText('perfil-total-label',
            `Basado en ${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}`);
    } else {
        setText('perfil-rating-big', '—');
        setText('perfil-total-label', 'Sin reseñas aún');
        document.getElementById('perfil-rating-badge').classList.add('hidden');
    }

    // Materias
    const materiasEl = document.getElementById('perfil-materias');
    if (materiasEl) {
        if (materias.length === 0) {
            materiasEl.innerHTML = '<span class="text-sm text-[#8f5662] dark:text-white/50">Sin materias asignadas</span>';
        } else {
            materiasEl.innerHTML = materias.map(m =>
                `<span class="px-3 py-1.5 bg-[#8d2036]/5 text-[#8d2036] text-xs font-medium rounded-xl border border-[#8d2036]/10">${m.nombre}</span>`
            ).join('');
        }
    }

    // Tags frecuentes
    const topTags = getTopTags(resenasList);
    if (topTags.length > 0) {
        show('perfil-tags-card');
        document.getElementById('perfil-tags').innerHTML = topTags.map(({ tag, count }) =>
            `<span class="flex items-center gap-1 px-3 py-1.5 bg-[#8d2036]/5 text-[#8d2036] text-xs font-medium rounded-xl border border-[#8d2036]/10">
                ${tag}
                <span class="bg-[#8d2036]/10 px-1.5 py-0.5 rounded-full text-[10px] font-bold">${count}</span>
            </span>`
        ).join('');
    }

    // Barras de rating
    renderRatingBars(resenasList);

    // Reseñas
    renderResenas(resenasList);

    // Mostrar contenido
    hide('loading-state');
    show('perfil-content');
    document.getElementById('perfil-content')?.classList.add('grid');
}

// Init
document.addEventListener('DOMContentLoaded', loadPerfil);