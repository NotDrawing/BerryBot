// public/js/controllers/authController.js
import supabase from '../models/supabaseClient.js';

export async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value.trim();

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
        return;
    }

    // Para login con email, también verificar perfil
    await redirectBasedOnProfile(data.user.id);
}

export async function handleRegister() {
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const expediente = document.getElementById('reg-expediente').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const pass2 = document.getElementById('reg-pass2').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!nombre || !apellido || !expediente || !email || !pass || !pass2) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (pass !== pass2) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (!terms) {
        alert('Debes aceptar los términos y condiciones');
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                nombre,
                apellido,
                expediente,
                full_name: `${nombre} ${apellido}`
            }
        }
    });

    if (error) {
        alert('Error al crear la cuenta: ' + error.message);
        return;
    }

    alert('¡Cuenta creada exitosamente! Revisa tu correo electrónico para confirmar tu cuenta.');

    if (data.user && data.user.confirmed_at) {
        await redirectBasedOnProfile(data.user.id);
    }
}

export async function handleGoogle() {
    try {
        const googleBtn = document.getElementById('google-login-btn');
        const originalContent = googleBtn?.innerHTML;

        if (googleBtn) {
            googleBtn.innerHTML = `
                <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span class="font-medium">Conectando con Google...</span>
            `;
            googleBtn.disabled = true;
        }

        const getRedirectUrl = () => {
            const origin = window.location.origin;
            const isLocalhost = origin.includes('127.0.0.1') || origin.includes('localhost');

            if (isLocalhost) {
                return 'http://127.0.0.1:5500/public/complete-profile.html';
            } else {
                return 'https://notdrawing.github.io/BerryBot/public/complete-profile.html';
            }
        };

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account'
                }
            }
        });

        if (error) {
            console.error('Error de Google OAuth:', error);
            alert('Error al iniciar sesión con Google: ' + error.message);
            if (googleBtn) {
                googleBtn.innerHTML = originalContent;
                googleBtn.disabled = false;
            }
        }

    } catch (error) {
        console.error('Error inesperado:', error);
        alert('Error inesperado: ' + error.message);
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            googleBtn.innerHTML = `
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="w-5 h-5">
                <span class="font-medium">Continuar con Google</span>
            `;
            googleBtn.disabled = false;
        }
    }
}

async function redirectBasedOnProfile(userId) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { data: profile, error } = await supabase
            .from('usuarios')
            .select('id, nombre, num_expediente')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error al verificar perfil:', error);
            window.location.href = 'dashboard.html';
            return;
        }

        const perfilCompleto = profile &&
            profile.nombre &&
            profile.nombre.trim() !== '' &&
            profile.num_expediente &&
            profile.num_expediente.trim() !== '';

        console.log('Perfil completo?', perfilCompleto, profile);

        if (perfilCompleto) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'complete-profile.html';
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'complete-profile.html';
    }
}