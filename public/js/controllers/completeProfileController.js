import supabase from '../models/supabaseClient.js';

export async function initCompleteProfile() {
    console.log('=== DEBUG INICIADO ===');

    // PRIMERO: Obtener la sesión
    const { data: { session } } = await supabase.auth.getSession();

    console.log('Session obtenida:', session ? 'Sí' : 'No');

    if (!session) {
        console.log('No hay sesión, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }

    console.log('Session user ID:', session.user.id);
    console.log('Session user email:', session.user.email);

    const emailEl = document.getElementById('welcome-email');
    if (emailEl) emailEl.textContent = session.user.email;

    console.log('=== VERIFICANDO PERFIL ===');
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);

    // Buscar en la tabla 'usuarios' por ID
    const { data: existingUser, error: queryError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

    console.log('Búsqueda por ID:', existingUser);
    console.log('Error por ID:', queryError);

    // Si no encuentra por ID, buscar por email
    let finalUser = existingUser;
    if (!finalUser) {
        console.log('No encontrado por ID, buscando por email...');
        const { data: userByEmail } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

        console.log('Búsqueda por email:', userByEmail);

        if (userByEmail) {
            finalUser = userByEmail;
            console.log('Usuario encontrado por email');
        }
    }

    // Verificar si el perfil está COMPLETO
    const perfilCompleto = finalUser &&
        finalUser.nombre &&
        finalUser.nombre.trim() !== '' &&
        finalUser.apellido &&
        finalUser.apellido.trim() !== '' &&
        finalUser.num_expediente &&
        finalUser.num_expediente.trim() !== '';

    console.log('Perfil completo?', perfilCompleto);
    if (finalUser) {
        console.log('Datos del usuario:', {
            nombre: finalUser.nombre,
            apellido: finalUser.apellido,
            expediente: finalUser.num_expediente
        });
    } else {
        console.log('No se encontró el usuario en la tabla');
    }

    // SI EL PERFIL ESTÁ COMPLETO → DASHBOARD DIRECTAMENTE
    if (perfilCompleto) {
        console.log('PERFIL COMPLETO - Redirigiendo a Dashboard');
        window.location.href = 'dashboard.html';
        return;
    }

    // Si el usuario NO EXISTE en la tabla 'usuarios'
    if (!finalUser) {
        console.log('Usuario NO existe - Creando registro temporal...');

        const metadata = session.user.user_metadata || {};
        const nombreCompleto = metadata.full_name || '';
        const partes = nombreCompleto.split(' ');
        const nombreTemp = partes[0] || '';
        const apellidoTemp = partes.slice(1).join(' ') || '';

        console.log('Creando usuario con:', {
            id: session.user.id,
            email: session.user.email,
            nombre: nombreTemp,
            apellido: apellidoTemp
        });

        const { error: insertError } = await supabase
            .from('usuarios')
            .insert({
                id: session.user.id,
                email: session.user.email,
                nombre: nombreTemp,
                apellido: apellidoTemp,
                num_expediente: '',
                rol: 'estudiante'
            });

        if (insertError) {
            console.error('Error al crear usuario:', insertError);
        } else {
            console.log('Usuario temporal creado');
        }
    }

    // Si llegamos aquí, mostrar formulario
    console.log('Mostrando formulario para completar perfil');

    // Precargar datos de Google
    const meta = session.user.user_metadata || {};
    if (meta.full_name) {
        const parts = meta.full_name.split(' ');
        const nombreEl = document.getElementById('cp-nombre');
        const apellidoEl = document.getElementById('cp-apellido');
        if (nombreEl && !nombreEl.value) nombreEl.value = parts[0] || '';
        if (apellidoEl && !apellidoEl.value) apellidoEl.value = parts.slice(1).join(' ') || '';
    }
}

export async function saveProfile() {
    const nombre = document.getElementById('cp-nombre').value.trim();
    const apellido = document.getElementById('cp-apellido').value.trim();
    const expediente = document.getElementById('cp-expediente').value.trim();

    if (!nombre || !apellido || !expediente) {
        showError('Por favor completa todos los campos.');
        return;
    }

    setLoading(true);
    hideError();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        showError('Tu sesión expiró. Por favor inicia sesión de nuevo.');
        setLoading(false);
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    console.log('Guardando perfil para usuario:', session.user.id);
    console.log('Datos a guardar:', { nombre, apellido, expediente });

    // Intentar actualizar el perfil
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            nombre: nombre,
            apellido: apellido,
            num_expediente: expediente
        })
        .eq('id', session.user.id);

    if (updateError) {
        console.error('Error al actualizar:', updateError);

        // Si el error es que no existe el registro, intentar insertar
        if (updateError.code === 'PGRST116' || updateError.message?.includes('JSON object requested')) {
            console.log('Registro no existe, intentando insertar...');
            const { error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    id: session.user.id,
                    email: session.user.email,
                    nombre: nombre,
                    apellido: apellido,
                    num_expediente: expediente,
                    rol: 'estudiante'
                });

            if (insertError) {
                console.error('Error al insertar:', insertError);
                showError('Error al guardar: ' + insertError.message);
                setLoading(false);
                return;
            }
        } else {
            showError('Error al guardar: ' + updateError.message);
            setLoading(false);
            return;
        }
    }

    console.log('Perfil guardado exitosamente');
    window.location.href = 'dashboard.html';
}

function showError(msg) {
    const box = document.getElementById('cp-error');
    const msgEl = document.getElementById('cp-error-msg');
    if (box) box.classList.remove('hidden');
    if (msgEl) msgEl.textContent = msg;
}

function hideError() {
    const box = document.getElementById('cp-error');
    if (box) box.classList.add('hidden');
}

function setLoading(loading) {
    const btn = document.getElementById('cp-btn');
    const text = document.getElementById('cp-btn-text');
    const icon = document.getElementById('cp-btn-icon');
    const loader = document.getElementById('cp-btn-loader');

    if (loading) {
        if (btn) btn.disabled = true;
        if (text) text.textContent = 'Guardando...';
        if (icon) icon.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');
    } else {
        if (btn) btn.disabled = false;
        if (text) text.textContent = 'Guardar y entrar';
        if (icon) icon.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
    }
}