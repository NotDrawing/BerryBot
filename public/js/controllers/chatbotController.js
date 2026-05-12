document.addEventListener("DOMContentLoaded", () => {

    const messages = document.getElementById("chatbot-messages");
    const input = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send");

    // Mensaje inicial
    agregarMensajeBot("Hola, ¿en qué puedo ayudarte?");

    // Crear mensaje
    function crearMensaje(texto, tipo) {

        const div = document.createElement("div");

        if (tipo === "usuario") {
            div.className =
                "bg-red-800 text-white p-3 rounded-xl ml-auto max-w-xs w-fit";
        } else {
            div.className =
                "bg-red-100 text-red-900 p-3 rounded-xl max-w-xs";
        }

        div.innerHTML = texto;

        messages.appendChild(div);

        // Scroll automático
        messages.scrollTop = messages.scrollHeight;
    }

    function agregarMensajeUsuario(texto) {
        crearMensaje(texto, "usuario");
    }

    function agregarMensajeBot(texto) {
        crearMensaje(texto, "bot");
    }
    //Funcion para arrays maestros
    const maestros = [
        //Arrays para agregar funcion de materias a cada maestro
        //Y viceversa.
        {
            nombre: "Jalil Gerardo Espinoza Zepeda",
            materias: [
                "diseño web",
                "sistemas operativos libres",
                "tics"
            ]
        },

        {
            nombre: "Margarita Soto",
            materias: [
                "introducción a base de datos",
                "programacion de base de datos",
                "programacion",
                "estructura de datos"
            ]
        },

        {
            nombre: "Julian Flores Figueroa",
            materias: [
                "programacion",
                "programacion orientada a objetos",
                "programacion de interfaces"
            ]
        },

        {
            nombre: "Erick Alonso Castro Navarro",
            materias: [
                "matematicas para ingenieria",
                "introduccion al campo de la is",
                "programacion orientada a objetos",
                "calidad de software"
            ]
        },
        {
            nombre: "Martin Anduaga",
            materias: [
                "diseño web"
            ]
        }
    ];
    //Funcion para obtener listado de maestros
    function obtenerListaMaestros() {

        let html = `
        <div class="space-y-3">

            <h3 class="font-bold text-lg text-red-900 mb-2">
                📚 Maestros disponibles
            </h3>
    `;

        maestros.forEach(maestro => {

            html += `
            <div class="bg-white border border-red-200 rounded-xl p-4 shadow-sm">

                <div class="font-semibold text-red-900 text-base">
                    👨‍🏫 ${maestro.nombre}
                </div>

                <div class="text-gray-700 text-sm mt-2">
                    Materias:
                    <span class="font-medium">
                        ${maestro.materias.join(", ") + "."}
                    </span>
                </div>

            </div>
        `;
        });

        html += `</div>`;

        return html;
    }

    //Funcion para arrays horarios
    const horarios = [
        {
            Lugar: "Escuela",
            hora: "7:00 a 21:00",
            dia: "Lunes a Viernes"
        },
        {
            Lugar: "Biblioteca",
            hora: "7:00 a 20:00",
            dia: "Lunes a Viernes"
        },
        {
            Lugar: "Control Escolar",
            hora: "8:00 a 15:00",
            dia: "Lunes a Viernes"
        },
        {
            Lugar: "Cafetería",
            hora: "7:00 a 18:00",
            dia: "Lunes a Viernes"
        }
    ];

    //Funcion para obtener lista de horarios
    function obtenerListaHorarios() {

        let html = `
        <div class="space-y-3">
            <h3 class="font-bold text-lg text-red-900 mb-2">
                🕒 Horarios disponibles
            </h3>
    `;

        // Aquí iría la lógica para obtener los horarios disponibles
        horarios.forEach(horario => {

            html += `
         <div class="bg-white border border-red-200 rounded-xl p-3 shadow-sm">

                <div class="font-semibold text-red-900 text-base">
                     ${horario.Lugar}
                </div>

                <div class="text-gray-700 text-sm mt-1">
                    Hora:
                    <span class="font-medium">
                       ${horario.hora}
                    </span>
                </div>

                <div class="text-gray-700 text-sm mt-1">
                    Día:
                    <span class="font-medium">
                       ${horario.dia}
                    </span>
                </div>

            </div>
        `;
        });

        html += `</div>`;

        return html;
    }
    //Obtener maestro por materia
    function buscarMaestroPorMateria(mensaje) {

        let maestrosEncontrados = [];
        for (let maestro of maestros) {

            const materiaEncontrada =
                maestro.materias.find(materia =>
                    mensaje.includes(materia)
                );

            if (materiaEncontrada) {

                maestrosEncontrados.push({
                    nombre: maestro.nombre,
                    materia: materiaEncontrada
                });
            }
        }
        //Si no se encuentra nada
        if (maestrosEncontrados.length === 0) {
            return "Lo siento, no pude encontrar un maestro para esa materia.";
        }
        // Mostrar maestros que se encuentren
        let html = `
        <div class="space-y-3">

            <h3 class="font-bold text-lg text-red-900 mb-2">
                👨‍🏫 Maestros que imparten esa materia
            </h3>
    `;

        maestrosEncontrados.forEach(maestro => {

            html += `
            <div class="bg-white border border-red-200 rounded-xl p-4 shadow-sm">

                <div class="font-bold text-red-900 text-lg">
                    👨‍🏫 ${maestro.nombre}
                </div>

                <div class="text-gray-700 mt-2">
                    Imparte:
                    <span class="font-semibold">
                        ${maestro.materia + "."}
                    </span>
                </div>

            </div>
        `;
        });

        html += `</div>`;

        return html;
    }

    // Respuestas del bot
    function obtenerRespuesta(mensaje) {

        mensaje = mensaje.toLowerCase();

        const respuestas = {
            "hola": "Hola 👋 ¿Cómo estás?",
            "bien": "¡Me alegra escuchar eso! 😊, Puedo ayudarte en algo?",
            "ayuda": "Claro, dime qué necesitas.",
            "gracias": "¡De nada! 😄",
            "adios": "Hasta luego 👋",
            "quien eres": "Soy BerryBot."
        };

        for (let palabra in respuestas) {
            if (mensaje.includes(palabra)) {
                return respuestas[palabra];
            }
        }

        // Obtener listado de maestros
        if (
            mensaje.includes("maestros") ||
            mensaje.includes("docentes") ||
            mensaje.includes("profesores")
        ) {
            return obtenerListaMaestros();
        }

        //Obtener listado de horarios
        if (
            mensaje.includes("horario") ||
            mensaje.includes("horarios")
        ) {
            return obtenerListaHorarios();
        }

        //Buscar maestro por materia
        if (mensaje.includes("quien imparte") ||
            mensaje.includes("quien enseña") ||
            mensaje.includes("quien da") ||
            mensaje.includes("quien es el maestro de") ||
            mensaje.includes("quien es la maestra de") ||
            mensaje.includes("quien es el profesor de") ||
            mensaje.includes("quien es la profesora de") ||
            mensaje.includes("quien es el docente de") ||
            mensaje.includes("quien es la docente de") ||
            mensaje.includes("quien da clase de")||
            mensaje.includes("que maestro da") 
        ) {
            const resultado = buscarMaestroPorMateria(mensaje);
            if (resultado) {
                return resultado;
            }
        }

        return "Lo siento, aún estoy aprendiendo 🤖";
    }



    // Enviar mensaje
    function enviarMensaje() {

        const texto = input.value.trim();

        if (texto === "") return;

        agregarMensajeUsuario(texto);

        input.value = "";

        setTimeout(() => {

            const respuesta = obtenerRespuesta(texto);

            agregarMensajeBot(respuesta);

        }, 600);
    }

    // Click botón
    sendBtn.addEventListener("click", enviarMensaje);

    // Enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            enviarMensaje();
        }
    });

});