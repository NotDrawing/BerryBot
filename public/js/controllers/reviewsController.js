import supabase from '../models/supabaseClient.js';

// Estado global del formulario
let selectedDocente = null;
let selectedMateria = null;
window.currentRating = 0;

//  ESTRELLAS
function initStars() {
    const stars = document.querySelectorAll('.star-btn');
    const ratingLabel = document.getElementById('rating-label');
    if (!stars.length) return;

    function updateStars(n) {
        stars.forEach(btn => {
            const val = parseInt(btn.dataset.value);
            btn.classList.toggle('filled', val <= n);
            btn.classList.toggle('empty', val > n);
        });
        if (ratingLabel) ratingLabel.textContent = n + '.0';
    }

    stars.forEach(btn => {
        btn.addEventListener('click', () => {
            window.currentRating = parseInt(btn.dataset.value);
            updateStars(window.currentRating);
        });
        btn.addEventListener('mouseenter', () => updateStars(parseInt(btn.dataset.value)));
        btn.addEventListener('mouseleave', () => updateStars(window.currentRating));
    });

    updateStars(window.currentRating);
}

//  TAGS
function initTags() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
}

//  CONTADOR DE CARACTERES
function initCharCounter() {
    const textarea = document.getElementById('review-text');
    const counter = document.getElementById('char-counter');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        if (len === 0) {
            counter.textContent = 'Min. 50 caracteres';
            counter.className = 'text-xs text-[#8f5662] dark:text-white/70';
        } else if (len < 50) {
            counter.textContent = len + ' / 50 mínimo';
            counter.className = 'text-xs text-red-600';
        } else {
            counter.textContent = len + ' caracteres ✓';
            counter.className = 'text-xs text-green-600';
        }
        document.getElementById('comentario-error')?.classList.add('hidden');
        textarea.classList.remove('border-red-600');
    });
}

//  LIMPIAR ERRORES EN VIVO
function initLiveErrors() {
    [['profesor-busqueda', 'profesor-error'], ['materia-busqueda', 'materia-error']].forEach(([inputId, errorId]) => {
        document.getElementById(inputId)?.addEventListener('input', () => {
            document.getElementById(errorId)?.classList.add('hidden');
            document.getElementById(inputId)?.classList.remove('border-red-600');
        });
    });
}

//  TOGGLE ANÓNIMO
window.toggleAnon = function () {
    const track = document.getElementById('anon-toggle');
    if (!track) return;
    track.classList.toggle('on');
    track.setAttribute('aria-checked', String(track.classList.contains('on')));
};

//  CANCELAR
window.cancelarReview = function () {
    document.getElementById('profesor-busqueda').value = '';
    document.getElementById('materia-busqueda').value = '';
    document.getElementById('review-text').value = '';

    selectedDocente = null;
    selectedMateria = null;

    ['profesor-error', 'materia-error', 'comentario-error'].forEach(id =>
        document.getElementById(id)?.classList.add('hidden')
    );
    ['profesor-busqueda', 'materia-busqueda', 'review-text'].forEach(id =>
        document.getElementById(id)?.classList.remove('border-red-600')
    );

    const counter = document.getElementById('char-counter');
    if (counter) {
        counter.textContent = 'Min. 50 caracteres';
        counter.className = 'text-xs text-[#8f5662] dark:text-white/70';
    }

    window.currentRating = 0;
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.classList.remove('filled');
        btn.classList.add('empty');
    });
    const ratingLabel = document.getElementById('rating-label');
    if (ratingLabel) ratingLabel.textContent = '0.0';

    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));

    const toggle = document.getElementById('anon-toggle');
    if (toggle) {
        toggle.classList.add('on');
        toggle.setAttribute('aria-checked', 'true');
    }

    const materiaInput = document.getElementById('materia-busqueda');
    if (materiaInput) {
        materiaInput.placeholder = 'Busca el nombre de la materia';
        materiaInput.disabled = false;
        materiaInput._materias = null;
    }
};

//  DROPDOWN — utilidades
//  FIX: position fixed → no se mueve al hacer scroll
//  FIX: color de texto según modo oscuro en JS inline
function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

function createDropdown(anchorEl) {
    removeDropdown();
    const dropdown = document.createElement('ul');
    dropdown.id = 'autocomplete-dropdown';
    const rect = anchorEl.getBoundingClientRect();
    const dark = isDarkMode();

    // position: fixed → se queda anclado en pantalla aunque la página haga scroll
    dropdown.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 4}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        z-index: 9999;
        background: ${dark ? '#2d1a1e' : '#ffffff'};
        border: 1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e4d2d6'};
        border-radius: 12px;
        box-shadow: 0 8px 28px rgba(141,32,54,0.18);
        max-height: 260px;
        overflow-y: auto;
        padding: 4px;
        list-style: none;
        margin: 0;
        color: ${dark ? 'rgba(255,255,255,0.85)' : '#1e293b'};
        font-family: inherit;
    `;
    document.body.appendChild(dropdown);
    return dropdown;
}

function removeDropdown() {
    document.getElementById('autocomplete-dropdown')?.remove();
}

function renderItems(dropdown, items, onSelect) {
    dropdown.innerHTML = '';
    const dark = isDarkMode();

    if (items.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Sin resultados';
        li.style.cssText = `padding:10px 14px; color:${dark ? 'rgba(255,255,255,0.4)' : '#8f5662'}; font-size:14px; cursor:default;`;
        dropdown.appendChild(li);
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.label;
        li.style.cssText = `
            padding: 10px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.15s;
            color: ${dark ? 'rgba(255,255,255,0.85)' : '#1e293b'};
        `;

        li.addEventListener('mouseenter', () => {
            li.style.background = dark ? 'rgba(141,32,54,0.25)' : 'rgba(141,32,54,0.08)';
            li.style.color = dark ? '#f4a0b0' : '#8d2036';
        });
        li.addEventListener('mouseleave', () => {
            li.style.background = '';
            li.style.color = dark ? 'rgba(255,255,255,0.85)' : '#1e293b';
        });
        li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onSelect(item);
            removeDropdown();
        });

        dropdown.appendChild(li);
    });
}

function addLoadingItem(dropdown) {
    const dark = isDarkMode();
    const loading = document.createElement('li');
    loading.textContent = 'Cargando...';
    loading.style.cssText = `padding:10px 14px; color:${dark ? 'rgba(255,255,255,0.4)' : '#8f5662'}; font-size:14px;`;
    dropdown.appendChild(loading);
}

function addKeyboardNav(input) {
    input.addEventListener('keydown', (e) => {
        const dropdown = document.getElementById('autocomplete-dropdown');
        if (!dropdown) return;

        const items = dropdown.querySelectorAll('li');
        const active = dropdown.querySelector('li[aria-selected="true"]');
        const dark = isDarkMode();

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = active ? active.nextElementSibling : items[0];
            if (next) {
                active?.removeAttribute('aria-selected');
                if (active) { active.style.background = ''; active.style.color = dark ? 'rgba(255,255,255,0.85)' : '#1e293b'; }
                next.setAttribute('aria-selected', 'true');
                next.style.background = dark ? 'rgba(141,32,54,0.25)' : 'rgba(141,32,54,0.08)';
                next.style.color = dark ? '#f4a0b0' : '#8d2036';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = active?.previousElementSibling;
            if (prev) {
                active.removeAttribute('aria-selected');
                active.style.background = '';
                active.style.color = dark ? 'rgba(255,255,255,0.85)' : '#1e293b';
                prev.setAttribute('aria-selected', 'true');
                prev.style.background = dark ? 'rgba(141,32,54,0.25)' : 'rgba(141,32,54,0.08)';
                prev.style.color = dark ? '#f4a0b0' : '#8d2036';
            }
        } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            active.dispatchEvent(new MouseEvent('mousedown'));
        } else if (e.key === 'Escape') {
            removeDropdown();
        }
    });
}

//  AUTOCOMPLETE — DOCENTES
function initDocenteAutocomplete() {
    const input = document.getElementById('profesor-busqueda');
    if (!input) return;

    let debounceTimer = null;

    async function mostrarDocentes(q = '') {
        const dropdown = createDropdown(input);
        addLoadingItem(dropdown);

        let query = supabase
            .from('docentes')
            .select('id, nombre, apellido, area')
            .eq('activo', true)
            .order('apellido')
            .limit(50);

        if (q.length >= 2) {
            query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (error) { console.error('Error buscando docentes:', error); removeDropdown(); return; }

        const items = (data || []).map(d => ({
            id: d.id,
            label: `${d.nombre} ${d.apellido}${d.area ? ' · ' + d.area : ''}`,
            nombre_completo: `${d.nombre} ${d.apellido}`,
        }));

        renderItems(dropdown, items, (item) => {
            selectedDocente = { id: item.id, nombre_completo: item.nombre_completo };
            input.value = item.nombre_completo;
            document.getElementById('profesor-error')?.classList.add('hidden');
            input.classList.remove('border-red-600');
            cargarMateriasPorDocente(item.id);
        });
    }

    input.addEventListener('focus', () => mostrarDocentes(input.value.trim()));

    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (selectedDocente && q !== selectedDocente.nombre_completo) {
            selectedDocente = null;
            resetMateriaInput();
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => mostrarDocentes(q), 200);
    });

    input.addEventListener('blur', () => setTimeout(removeDropdown, 150));
    addKeyboardNav(input);
}

//  CARGAR MATERIAS DEL DOCENTE SELECCIONADO
async function cargarMateriasPorDocente(docenteId) {
    const materiaInput = document.getElementById('materia-busqueda');
    if (!materiaInput) return;

    selectedMateria = null;
    materiaInput.value = '';
    materiaInput.disabled = false;
    materiaInput.placeholder = 'Cargando materias...';
    materiaInput._materias = null;
    document.getElementById('materia-error')?.classList.add('hidden');
    materiaInput.classList.remove('border-red-600');

    const { data, error } = await supabase
        .from('docente_materia')
        .select('materias (id, nombre, semestre)')
        .eq('docente_id', docenteId);

    if (error || !data || data.length === 0) {
        materiaInput.placeholder = 'Sin materias asignadas';
        return;
    }

    const materias = data
        .map(r => r.materias)
        .filter(Boolean)
        .sort((a, b) => a.semestre - b.semestre || a.nombre.localeCompare(b.nombre));

    materiaInput.placeholder = `${materias.length} materia${materias.length !== 1 ? 's' : ''} disponible${materias.length !== 1 ? 's' : ''}`;
    materiaInput._materias = materias;

    mostrarDropdownMaterias(materiaInput, materias);
}

//  AUTOCOMPLETE — MATERIAS
function initMateriaAutocomplete() {
    const input = document.getElementById('materia-busqueda');
    if (!input) return;

    let debounceTimer = null;

    input.addEventListener('focus', () => {
        if (selectedDocente && input._materias?.length) {
            const q = input.value.trim().toLowerCase();
            const filtradas = q ? input._materias.filter(m => m.nombre.toLowerCase().includes(q)) : input._materias;
            mostrarDropdownMaterias(input, filtradas);
        } else if (!selectedDocente) {
            buscarTodasMaterias(input, input.value.trim());
        }
    });

    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (selectedMateria && q !== selectedMateria.nombre) selectedMateria = null;

        clearTimeout(debounceTimer);

        if (selectedDocente && input._materias?.length) {
            const filtradas = q
                ? input._materias.filter(m => m.nombre.toLowerCase().includes(q.toLowerCase()))
                : input._materias;
            mostrarDropdownMaterias(input, filtradas);
        } else {
            debounceTimer = setTimeout(() => buscarTodasMaterias(input, q), 280);
        }
    });

    input.addEventListener('blur', () => setTimeout(removeDropdown, 150));
    addKeyboardNav(input);
}

function mostrarDropdownMaterias(input, materias) {
    const dropdown = createDropdown(input);
    const items = materias.map(m => ({
        id: m.id,
        label: `${m.nombre} · Sem ${m.semestre}`,
        nombre: m.nombre,
    }));

    renderItems(dropdown, items, (item) => {
        selectedMateria = { id: item.id, nombre: item.nombre };
        input.value = item.nombre;
        document.getElementById('materia-error')?.classList.add('hidden');
        input.classList.remove('border-red-600');
    });
}

async function buscarTodasMaterias(input, q) {
    const dropdown = createDropdown(input);
    addLoadingItem(dropdown);

    let query = supabase
        .from('materias')
        .select('id, nombre, semestre')
        .order('semestre')
        .order('nombre')
        .limit(50);

    if (q.length >= 2) {
        query = query.or(`nombre.ilike.%${q}%,clave.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) { console.error('Error buscando materias:', error); removeDropdown(); return; }

    const items = (data || []).map(m => ({
        id: m.id,
        label: `${m.nombre} · Sem ${m.semestre}`,
        nombre: m.nombre,
    }));

    renderItems(dropdown, items, (item) => {
        selectedMateria = { id: item.id, nombre: item.nombre };
        input.value = item.nombre;
        document.getElementById('materia-error')?.classList.add('hidden');
        input.classList.remove('border-red-600');
    });
}

function resetMateriaInput() {
    const materiaInput = document.getElementById('materia-busqueda');
    if (!materiaInput) return;
    selectedMateria = null;
    materiaInput.value = '';
    materiaInput.placeholder = 'Busca el nombre de la materia';
    materiaInput.disabled = false;
    materiaInput._materias = null;
    document.getElementById('materia-error')?.classList.add('hidden');
    materiaInput.classList.remove('border-red-600');
}

//  SUBMIT
window.submitReview = async function () {
    const profesorInput = document.getElementById('profesor-busqueda');
    const materiaInput = document.getElementById('materia-busqueda');
    const comentario = document.getElementById('review-text');
    const profesorError = document.getElementById('profesor-error');
    const materiaError = document.getElementById('materia-error');
    const comentarioError = document.getElementById('comentario-error');

    let valido = true;

    [profesorError, materiaError, comentarioError].forEach(el => el?.classList.add('hidden'));
    [profesorInput, materiaInput, comentario].forEach(el => el?.classList.remove('border-red-600'));

    if (!selectedDocente) {
        profesorError?.classList.remove('hidden');
        profesorInput?.classList.add('border-red-600');
        valido = false;
    }
    if (!selectedMateria) {
        materiaError?.classList.remove('hidden');
        materiaInput?.classList.add('border-red-600');
        valido = false;
    }
    if ((comentario?.value.trim().length ?? 0) < 50) {
        comentarioError?.classList.remove('hidden');
        comentario?.classList.add('border-red-600');
        valido = false;
    }
    if (!valido) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Debes iniciar sesión para publicar una reseña.'); return; }

    const estrellas = window.currentRating ?? 0;
    if (estrellas === 0) { alert('Por favor selecciona una calificación con estrellas.'); return; }

    const tags = [...document.querySelectorAll('.tag-btn.active')].map(btn => btn.textContent.trim());

    const btn = document.getElementById('submit-btn');
    if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; btn.style.opacity = '0.7'; }

    const { error } = await supabase.from('resenas').insert({
        usuario_id: user.id,
        docente_id: selectedDocente.id,
        materia_id: selectedMateria.id,
        estrellas,
        comentario: comentario.value.trim(),
        tags,
    });

    if (error) {
        console.error('Error al insertar reseña:', error);
        if (btn) { btn.textContent = 'Enviar Reseña'; btn.disabled = false; btn.style.opacity = '1'; }
        // Solo mostrar error si no es duplicado — la restricción UNIQUE se elimina en BD
        if (error.code !== '23505') {
            alert('Ocurrió un error al enviar la reseña. Intenta de nuevo.');
        }
        return;
    }

    if (btn) { btn.textContent = '¡Enviado!'; btn.style.backgroundColor = '#22c55e'; btn.style.opacity = '1'; }
    setTimeout(() => window.location.reload(), 1200);
};

//  TABS
//  FIX: al cambiar de tab se reaplican clases correctamente
//  FIX: se agrega dark:text-white al tab inactivo
window.showTab = function (tab) {
    const panelNueva = document.getElementById('nueva-resena-panel');
    const panelMis = document.getElementById('mis-resenas-panel');
    const btnNueva = document.getElementById('tab-nueva-btn');
    const btnMis = document.getElementById('tab-mis-btn');

    // Clases del tab ACTIVO
    const activeClasses = ['border-b-2', 'border-[#8d2036]', 'text-[#8d2036]'];
    // Clases del tab INACTIVO — incluye dark:text-white para que sea legible en oscuro
    const inactiveClasses = ['border-b-2', 'border-transparent', 'text-slate-500', 'dark:text-white/70'];

    if (tab === 'nueva') {
        panelNueva?.classList.remove('hidden');
        panelMis?.classList.add('hidden');

        // Activar "Nueva Reseña"
        btnNueva?.classList.remove(...inactiveClasses);
        btnNueva?.classList.add(...activeClasses);

        // Desactivar "Mis Reseñas"
        btnMis?.classList.remove(...activeClasses);
        btnMis?.classList.add(...inactiveClasses);

    } else {
        panelNueva?.classList.add('hidden');
        panelMis?.classList.remove('hidden');

        // Activar "Mis Reseñas"
        btnMis?.classList.remove(...inactiveClasses);
        btnMis?.classList.add(...activeClasses);

        // Desactivar "Nueva Reseña"
        btnNueva?.classList.remove(...activeClasses);
        btnNueva?.classList.add(...inactiveClasses);

        loadMisResenas();
    }
};

//  MIS RESEÑAS
async function loadMisResenas() {
    const lista = document.getElementById('mis-resenas-lista');
    if (!lista) return;

    lista.innerHTML = '<div class="text-center text-slate-500 dark:text-white/50 py-12">Cargando tus reseñas...</div>';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: misData, error: misError } = await supabase
        .from('resenas')
        .select(`
            id,
            estrellas,
            comentario,
            tags,
            created_at,
            docentes (nombre, apellido),
            materias (nombre)
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

    if (misError) {
        lista.innerHTML = '<div class="text-center text-red-500 py-12">Error al cargar las reseñas.</div>';
        return;
    }

    if (!misData || misData.length === 0) {
        lista.innerHTML = `
            <div class="text-center py-16">
                <span class="material-symbols-outlined text-5xl text-[#8d2036]/30 block mb-3">rate_review</span>
                <p class="text-slate-500 dark:text-white/50">Aún no has publicado ninguna reseña.</p>
            </div>`;
        return;
    }

    lista.innerHTML = misData.map(r => {
        const stars = '★'.repeat(r.estrellas) + '☆'.repeat(5 - r.estrellas);
        const fecha = new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        const tagsHtml = (r.tags || []).map(t =>
            `<span class="px-2 py-0.5 text-xs rounded-full bg-[#8d2036]/10 text-[#8d2036] dark:bg-[#8d2036]/30 dark:text-[#f4a0b0]">${t}</span>`
        ).join('');

        return `
        <div class="bg-white dark:bg-[#2d1a1e] rounded-xl border border-[#e4d2d6] dark:border-white/10 p-5 space-y-3">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="font-bold text-slate-800 dark:text-white">${r.docentes?.nombre ?? ''} ${r.docentes?.apellido ?? ''}</p>
                    <p class="text-sm text-[#8f5662] dark:text-white/60">${r.materias?.nombre ?? ''}</p>
                </div>
                <div class="text-right shrink-0">
                    <p class="text-[#8d2036] dark:text-[#f4a0b0] font-bold tracking-wide">${stars}</p>
                    <p class="text-xs text-slate-400 dark:text-white/40">${fecha}</p>
                </div>
            </div>
            ${tagsHtml ? `<div class="flex flex-wrap gap-1">${tagsHtml}</div>` : ''}
            <p class="text-sm text-slate-600 dark:text-white/75">${r.comentario ?? ''}</p>
            <div class="flex justify-end">
                <button onclick="eliminarResena('${r.id}')"
                    class="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                    Eliminar
                </button>
            </div>
        </div>`;
    }).join('');
}

window.eliminarResena = async function (id) {
    if (!confirm('¿Seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('resenas').delete().eq('id', id);
    if (error) { alert('Error al eliminar la reseña.'); return; }
    loadMisResenas();
};

//  INIT
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initTags();
    initCharCounter();
    initLiveErrors();
    initDocenteAutocomplete();
    initMateriaAutocomplete();

    // Limpiar todas las clases de color/borde del HTML original y re-aplicar desde JS
    // para evitar conflictos con clases hardcodeadas en el HTML
    const btnNueva = document.getElementById('tab-nueva-btn');
    const btnMis = document.getElementById('tab-mis-btn');
    const allTabClasses = [
        'border-b-2', 'border-[#8d2036]', 'border-transparent',
        'text-[#8d2036]', 'text-slate-500',
        'dark:text-white', 'dark:text-white/70',
        'hover:text-[#8d2036]', 'dark:hover:text-[#8d2036]',
    ];
    if (btnNueva) {
        btnNueva.classList.remove(...allTabClasses);
        btnNueva.classList.add('border-b-2', 'border-[#8d2036]', 'text-[#8d2036]');
    }
    if (btnMis) {
        btnMis.classList.remove(...allTabClasses);
        btnMis.classList.add('border-b-2', 'border-transparent', 'text-slate-500', 'dark:text-white/70');
    }

    // Cerrar dropdown al click fuera
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('autocomplete-dropdown');
        if (!dropdown) return;
        if (!dropdown.contains(e.target) &&
            e.target.id !== 'profesor-busqueda' &&
            e.target.id !== 'materia-busqueda') {
            removeDropdown();
        }
    });

    // Si la ventana cambia de tamaño, cerrar dropdown para evitar desalineación
    window.addEventListener('resize', removeDropdown);

    // Precarga desde perfil de docente
    // Si llegamos desde perfil-docente.html?docente_id=UUID
    // precargamos el docente y sus materias sin que el usuario tenga que buscar
    const urlParams = new URLSearchParams(window.location.search);
    const preDocenteId = urlParams.get('docente_id');

    if (preDocenteId) {
        precargarDocente(preDocenteId);
    }
});

//  PRECARGA DESDE PERFIL
async function precargarDocente(docenteId) {
    const profesorInput = document.getElementById('profesor-busqueda');
    if (!profesorInput) return;

    // Estado visual: mostrar que está cargando
    profesorInput.value = 'Cargando...';
    profesorInput.disabled = true;

    // 1. Traer datos del docente
    const { data: docente, error } = await supabase
        .from('docentes')
        .select('id, nombre, apellido')
        .eq('id', docenteId)
        .single();

    if (error || !docente) {
        profesorInput.value = '';
        profesorInput.disabled = false;
        return;
    }

    // 2. Fijar el docente seleccionado
    const nombreCompleto = `${docente.nombre} ${docente.apellido}`;
    selectedDocente = { id: docente.id, nombre_completo: nombreCompleto };

    profesorInput.value = nombreCompleto;
    profesorInput.disabled = true;   // bloqueado: ya viene pre-seleccionado

    // Quitar cualquier error previo
    document.getElementById('profesor-error')?.classList.add('hidden');
    profesorInput.classList.remove('border-red-600');

    // 3. Cargar las materias del docente (reutiliza la función existente)
    await cargarMateriasPorDocente(docenteId);

    // Si solo tiene una materia, seleccionarla automáticamente
    const materiaInput = document.getElementById('materia-busqueda');
    if (materiaInput?._materias?.length === 1) {
        const unica = materiaInput._materias[0];
        selectedMateria = { id: unica.id, nombre: unica.nombre };
        materiaInput.value = unica.nombre;
        materiaInput.disabled = true;  // bloqueado: solo hay una opción
        document.getElementById('materia-error')?.classList.add('hidden');
        materiaInput.classList.remove('border-red-600');
        removeDropdown();
    }
    // Si tiene varias, el dropdown ya se mostró desde cargarMateriasPorDocente
    // y el input queda habilitado para que el usuario elija
}