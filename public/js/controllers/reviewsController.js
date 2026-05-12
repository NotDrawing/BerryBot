
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {

    /* botones estrellas */
    const stars = document.querySelectorAll('.star-btn');
    const ratingLabel = document.getElementById('rating-label');

    stars.forEach(btn => {

        btn.addEventListener('click', () => {

            currentRating = parseInt(btn.dataset.value);
            updateStars(currentRating);

        });

        btn.addEventListener('mouseenter', () => {
            updateStars(parseInt(btn.dataset.value));
        });

        btn.addEventListener('mouseleave', () => {
            updateStars(currentRating);
        });

    });

    function updateStars(n) {

        stars.forEach(btn => {

            const val = parseInt(btn.dataset.value);

            btn.classList.toggle('filled', val <= n);
            btn.classList.toggle('empty', val > n);

        });

        ratingLabel.textContent = n + '.0';

    }

    /* tags */
    document.querySelectorAll('.tag-btn').forEach(btn => {

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });

    });

    /* contador comentario */
    const textarea = document.getElementById('review-text');
    const counter = document.getElementById('char-counter');

    textarea.addEventListener('input', () => {

        const len = textarea.value.length;

        if (len === 0) {

            counter.textContent = 'Min. 50 caracteres';
            counter.className = 'text-xs text-[#8f5662] dark:text-white';

        }

        else if (len < 50) {

            counter.textContent = len + ' / 50 mínimo';
            counter.className = 'text-xs text-red-600';

        }

        else {

            counter.textContent = len + ' caracteres ✓';
            counter.className = 'text-xs text-green-600';

        }

    });

    /* quitar error profesor */
    document.getElementById('profesor-busqueda')
        .addEventListener('input', () => {

            document.getElementById('profesor-error')
                .classList.add('hidden');

            document.getElementById('profesor-busqueda')
                .classList.remove('border-red-600');

        });

    /* quitar error materia */
    document.getElementById('materia-busqueda')
        .addEventListener('input', () => {

            document.getElementById('materia-error')
                .classList.add('hidden');

            document.getElementById('materia-busqueda')
                .classList.remove('border-red-600');

        });

    /* quitar error comentario */
    document.getElementById('review-text')
        .addEventListener('input', () => {

            document.getElementById('comentario-error')
                .classList.add('hidden');

            document.getElementById('review-text')
                .classList.remove('border-red-600');

        });

});

/* toggle anonimo */
function toggleAnon() {

    const track = document.getElementById('anon-toggle');

    track.classList.toggle('on');

    track.setAttribute(
        'aria-checked',
        track.classList.contains('on')
    );

}

/* cancelar */
function cancelarReview() {

    document.getElementById('profesor-busqueda').value = '';
    document.getElementById('materia-busqueda').value = '';
    document.getElementById('review-text').value = '';

    /* ocultar errores */
    document.getElementById('profesor-error')
        .classList.add('hidden');

    document.getElementById('materia-error')
        .classList.add('hidden');

    document.getElementById('comentario-error')
        .classList.add('hidden');

    /* quitar bordes rojos */
    document.getElementById('profesor-busqueda')
        .classList.remove('border-red-600');

    document.getElementById('materia-busqueda')
        .classList.remove('border-red-600');

    document.getElementById('review-text')
        .classList.remove('border-red-600');

    /* reset contador */
    document.getElementById('char-counter').textContent =
        'Min. 50 caracteres';

    document.getElementById('char-counter').className =
        'text-xs text-[#8f5662] dark:text-white';

    /* reset estrellas */
    currentRating = 0;

    document.querySelectorAll('.star-btn').forEach(btn => {

        btn.classList.remove('filled');
        btn.classList.add('empty');

    });

    document.getElementById('rating-label').textContent = '0.0';

    /* reset tags */
    document.querySelectorAll('.tag-btn').forEach(btn => {

        btn.classList.remove('active');

    });

    /* reset toggle */
    const toggle = document.getElementById('anon-toggle');

    toggle.classList.add('on');

    toggle.setAttribute('aria-checked', 'true');

}

/* submit */
function sumbitReview() {

    const profesor = document.getElementById('profesor-busqueda');
    const materia = document.getElementById('materia-busqueda');
    const comentario = document.getElementById('review-text');

    const profesorError =
        document.getElementById('profesor-error');

    const materiaError =
        document.getElementById('materia-error');

    const comentarioError =
        document.getElementById('comentario-error');

    let valido = true;

    /* limpiar errores */
    profesorError.classList.add('hidden');
    materiaError.classList.add('hidden');
    comentarioError.classList.add('hidden');

    profesor.classList.remove('border-red-600');
    materia.classList.remove('border-red-600');
    comentario.classList.remove('border-red-600');

    /* validar profesor */
    if (profesor.value.trim() === '') {

        profesorError.classList.remove('hidden');

        profesor.classList.add('border-red-600');

        valido = false;

    }

    /* validar materia */
    if (materia.value.trim() === '') {

        materiaError.classList.remove('hidden');

        materia.classList.add('border-red-600');

        valido = false;

    }

    /* validar comentario */
    if (comentario.value.trim().length < 50) {

        comentarioError.classList.remove('hidden');

        comentario.classList.add('border-red-600');

        valido = false;

    }

    /* detener envio */
    if (!valido) return;

    /* animacion boton */
    const btn = document.getElementById('sumbit-btn');

    btn.textContent = 'Enviando...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {

        btn.textContent = '¡Enviado!';
        btn.style.backgroundColor = '#22c55e';
        btn.style.opacity = '1';

        setTimeout(() => {

            window.location.href = 'reviews.html';

        }, 1200);

    }, 1000);

}
