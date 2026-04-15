import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://otibvoqmgsybpfaqiyun.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWJ2b3FtZ3N5YnBmYXFpeXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI4NDcsImV4cCI6MjA5MTcwODg0N30.KQpiRCulIi6c5p021OqqOPS8oyr_-mSfhM70qAwcz9I';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window._sb = supabase;

// Verificar si ya hay sesión
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        location.href = 'dashboard.html';
    }
}

checkSession();

// ==================== GOOGLE - LOGIN / REGISTRO ====================
window.handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: location.origin + '/dashboard.html',
            // Esto ayuda a que Supabase maneje mejor el flujo
            queryParams: {
                access_type: 'offline',
                prompt: 'consent'
            }
        }
    });
};

// ==================== LOGIN CON EMAIL ====================
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!email || !pass) {
        alert('Por favor completa todos los campos.');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
        return;
    }

    location.href = 'dashboard.html';
};

// ==================== REGISTRO CON EMAIL ====================
window.handleRegister = async () => {
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const expediente = document.getElementById('reg-expediente').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const pass2 = document.getElementById('reg-pass2').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!nombre || !apellido || !expediente || !email || !pass) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    if (pass !== pass2) {
        alert('Las contraseñas no coinciden.');
        return;
    }
    if (!terms) {
        alert('Debes aceptar los términos y condiciones.');
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: { nombre, apellido, expediente }
        }
    });

    if (error) {
        alert('Error al crear la cuenta: ' + error.message);
        return;
    }

    alert('¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta.');
};