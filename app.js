let cartas = [];
let filtroActual = "todas";
let textoBusqueda = "";
let expansionActual = "todas";

const listaCartas = document.getElementById("lista-cartas");
const botones = document.querySelectorAll(".controles button");
const buscador = document.getElementById("buscador");

const CLAVE_COLECCION = "pokemon_v_collection";


/* =========================================================
   ORDEN DE EXPANSIONES
========================================================= */

const ordenExpansiones = [
    "swsh1",
    "swsh2",
    "swsh3",
    "swsh35",
    "swsh4",
    "swsh45",
    "swsh45sv",
    "swsh5",
    "swsh6",
    "swsh7",

    /* CELEBRACIONES */
    "cel",

    "swsh8",
    "swsh9",
    "swsh9tg",
    "swsh10",
    "swsh10tg",
    "swsh11",
    "swsh11tg",
    "swsh12",
    "swsh12tg",
    "swsh12pt5",
    "swsh12pt5gg",
    "pgo",
    "swshp"
];


/* =========================================================
   NOMBRES EN ESPAÑOL
========================================================= */

const nombresExpansiones = {

    swsh1: "Espada y Escudo",
    swsh2: "Choque Rebelde",
    swsh3: "Oscuridad Incandescente",
    swsh35: "Camino de Campeones",
    swsh4: "Voltaje Vívido",
    swsh45: "Destinos Brillantes",
    swsh45sv: "Destinos Brillantes · SV",
    swsh5: "Estilos de Combate",
    swsh6: "Reinado Escalofriante",
    swsh7: "Cielos Evolutivos",

    /* CELEBRACIONES */
    cel: "Celebraciones",

    swshp: "Promocionales",
    swsh8: "Golpe Fusión",
    swsh9: "Astros Brillantes",
    swsh9tg: "Galería de Entrenadores de Astros Brillantes",
    swsh10: "Resplandor Astral",
    swsh10tg: "Galería de Entrenadores de Resplandor Astral",
    swsh11: "Origen Perdido",
    swsh11tg: "Galería de Entrenadores de Origen Perdido",
    swsh12: "Tempestad Plateada",
    swsh12tg: "Galería de Entrenadores de Tempestad Plateada",
    swsh12pt5: "Cenit Supremo",
    swsh12pt5gg: "Galería de Galar de Cenit Supremo",
    pgo: "Pokémon GO"

};


/* =========================================================
   OBTENER SET ID
========================================================= */

function obtenerSetId(carta) {

    if (!carta) {
        return "";
    }

    if (carta.setId) {
        return String(carta.setId);
    }

    if (!carta.id) {
        return "";
    }

    return String(carta.id).split("-")[0];
}


/* =========================================================
   OBTENER NÚMERO
========================================================= */

function obtenerNumeroNumerico(carta) {

    const numero =
        String(carta.numero || "")
            .replace(/\D/g, "");

    return parseInt(numero, 10) || 0;
}


/* =========================================================
   NOMBRE DE EXPANSIÓN
========================================================= */

function obtenerNombreExpansionEspanol(carta) {

    return nombresExpansiones[
        obtenerSetId(carta)
    ] || "";
}


function obtenerNombreExpansion(carta) {

    const nombreEspanol =
        obtenerNombreExpansionEspanol(carta);

    if (nombreEspanol) {
        return nombreEspanol;
    }

    if (
        carta.expansion &&
        carta.expansion !== "null"
    ) {
        return carta.expansion;
    }

    return "Sin expansión";
}


/* =========================================================
   ORDENAR CARTAS
========================================================= */

function ordenarCartas() {

    cartas.sort((a, b) => {

        const setA = obtenerSetId(a);
        const setB = obtenerSetId(b);

        const posicionA =
            ordenExpansiones.indexOf(setA);

        const posicionB =
            ordenExpansiones.indexOf(setB);

        const ordenA =
            posicionA === -1 ? 999 : posicionA;

        const ordenB =
            posicionB === -1 ? 999 : posicionB;

        if (ordenA !== ordenB) {
            return ordenA - ordenB;
        }

        const numeroA =
            obtenerNumeroNumerico(a);

        const numeroB =
            obtenerNumeroNumerico(b);

        if (numeroA !== numeroB) {
            return numeroA - numeroB;
        }

        return String(a.id)
            .localeCompare(String(b.id));
    });
}


/* =========================================================
   CREAR SELECTOR DE EXPANSIONES
========================================================= */

function crearSelectorExpansiones() {

    let selector =
        document.getElementById(
            "selector-expansion"
        );

    if (!selector) {

        selector =
            document.createElement("select");

        selector.id =
            "selector-expansion";

        const buscadorElemento =
            document.querySelector(".buscador");

        if (buscadorElemento) {

            buscadorElemento.insertAdjacentElement(
                "afterend",
                selector
            );

        } else {

            listaCartas.parentElement.insertBefore(
                selector,
                listaCartas
            );

        }
    }

    selector.innerHTML = "";

    const todas =
        document.createElement("option");

    todas.value = "todas";
    todas.textContent = "Todas las expansiones";

    selector.appendChild(todas);

    ordenExpansiones.forEach(setId => {

        if (!nombresExpansiones[setId]) {
            return;
        }

        const opcion =
            document.createElement("option");

        opcion.value = setId;
        opcion.textContent =
            nombresExpansiones[setId];

        selector.appendChild(opcion);
    });

    selector.value =
        expansionActual;

    selector.onchange = function () {

        expansionActual =
            selector.value;

        mostrarCartas();
    };


    /* ESTILO DEL DESPLEGABLE */

    selector.style.width = "100%";
    selector.style.padding = "14px 18px";
    selector.style.border = "1px solid #d1d5db";
    selector.style.borderRadius = "12px";
    selector.style.fontSize = "16px";
    selector.style.background = "white";
    selector.style.marginBottom = "15px";
    selector.style.cursor = "pointer";
    selector.style.outline = "none";
}


/* =========================================================
   CARGAR CARTAS
========================================================= */

fetch("cartas.json")

    .then(respuesta => {

        if (!respuesta.ok) {

            throw new Error(
                "No se ha podido cargar cartas.json"
            );
        }

        return respuesta.json();
    })

    .then(datos => {

        cartas = datos;

        const guardadas =
            JSON.parse(
                localStorage.getItem(
                    CLAVE_COLECCION
                ) || "[]"
            );

        cartas.forEach(carta => {

            carta.conseguida =
                guardadas.includes(carta.id);

        });

        ordenarCartas();

        crearSelectorExpansiones();

        mostrarCartas();

        actualizarEstadisticas();
    })

    .catch(error => {

        console.error(
            "Error al cargar las cartas:",
            error
        );

        listaCartas.innerHTML =
            '<p style="grid-column:1/-1;text-align:center;color:#dc2626;padding:40px;">Error al cargar las cartas. Mira la consola del navegador.</p>';
    });


/* =========================================================
   BUSCADOR
========================================================= */

if (buscador) {

    buscador.addEventListener(
        "input",
        () => {

            textoBusqueda =
                buscador.value
                    .trim()
                    .toLowerCase();

            mostrarCartas();
        }
    );
}


/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizarTexto(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}


/* =========================================================
   FORMATO DEL NÚMERO
========================================================= */

function obtenerNumeroCarta(carta) {

    const numero =
        String(carta.numero || "")
            .trim();

    if (!numero) {
        return "";
    }

    if (
        numero.toUpperCase().startsWith("TG") &&
        carta.totalExpansion !== null &&
        carta.totalExpansion !== undefined &&
        carta.totalExpansion !== ""
    ) {

        return (
            numero.toUpperCase() +
            "/TG" +
            String(carta.totalExpansion).trim()
        );
    }

    const numeroFormateado =
        numero.padStart(3, "0");

    if (
        carta.totalExpansion !== null &&
        carta.totalExpansion !== undefined &&
        carta.totalExpansion !== ""
    ) {

        const total =
            String(carta.totalExpansion)
                .trim()
                .padStart(3, "0");

        return (
            numeroFormateado +
            "/" +
            total
        );
    }

    return numeroFormateado;
}


/* =========================================================
   TEXTO DE BÚSQUEDA
========================================================= */

function obtenerTextoBusquedaCarta(carta) {

    const setId =
        obtenerSetId(carta);

    const expansionEspanol =
        nombresExpansiones[setId] || "";

    const expansionOriginal =
        carta.expansion || "";

    const numero =
        carta.numero || "";

    const numeroCompleto =
        obtenerNumeroCarta(carta);

    const campos = [

        carta.nombre,
        expansionOriginal,
        expansionEspanol,
        setId,
        numero,
        numeroCompleto,
        carta.variante,
        carta.tipo,
        carta.rareza,
        carta.id

    ];

    return campos

        .filter(campo =>
            campo !== null &&
            campo !== undefined &&
            campo !== ""
        )

        .map(campo =>
            normalizarTexto(campo)
        )

        .join(" ");
}


/* =========================================================
   MOSTRAR CARTAS
========================================================= */

function mostrarCartas() {

    listaCartas.innerHTML = "";

    const busquedaNormalizada =
        normalizarTexto(textoBusqueda);

    const cartasFiltradas =
        cartas.filter(carta => {

            if (
                expansionActual !== "todas" &&
                obtenerSetId(carta) !==
                    expansionActual
            ) {
                return false;
            }

            if (
                filtroActual === "tengo" &&
                !carta.conseguida
            ) {
                return false;
            }

            if (
                filtroActual === "faltan" &&
                carta.conseguida
            ) {
                return false;
            }

            if (
                busquedaNormalizada !== ""
            ) {

                const textoCarta =
                    obtenerTextoBusquedaCarta(
                        carta
                    );

                if (
                    !textoCarta.includes(
                        busquedaNormalizada
                    )
                ) {
                    return false;
                }
            }

            return true;
        });


    /* =====================================================
       CREAR CARTAS
    ===================================================== */

    cartasFiltradas.forEach(carta => {

        const elemento =
            document.createElement("div");

        elemento.className = "carta";


        /* IMAGEN */

        const imagenContenedor =
            document.createElement("div");

        imagenContenedor.className =
            "imagen-contenedor";

        const imagen =
            document.createElement("img");

        imagen.src = carta.imagen;
        imagen.alt = carta.nombre;

        if (!carta.conseguida) {

            imagen.classList.add(
                "carta-faltante"
            );
        }

        imagenContenedor.appendChild(
            imagen
        );


        /* EFECTO CONSEGUIDA */

        if (carta.conseguida) {

            const luz =
                document.createElement("div");

            luz.className =
                "luz-energia";

            imagenContenedor.appendChild(
                luz
            );

            const estrellas =
                document.createElement("div");

            estrellas.className =
                "estrellas-carta";

            const posiciones = [
                [18, 22],
                [72, 30],
                [35, 68],
                [80, 75]
            ];

            posiciones.forEach(
                (posicion, indice) => {

                    const estrella =
                        document.createElement(
                            "span"
                        );

                    estrella.className =
                        "estrella";

                    estrella.textContent =
                        "✦";

                    estrella.style.left =
                        posicion[0] + "%";

                    estrella.style.top =
                        posicion[1] + "%";

                    estrella.style.animationDelay =
                        (indice * 0.75) + "s";

                    estrellas.appendChild(
                        estrella
                    );
                }
            );

            imagenContenedor.appendChild(
                estrellas
            );

        }

        /* EFECTO FALTANTE */

        else {

            const luzFaltante =
                document.createElement("div");

            luzFaltante.className =
                "luz-faltante";

            imagenContenedor.appendChild(
                luzFaltante
            );
        }


        elemento.appendChild(
            imagenContenedor
        );


        /* NOMBRE */

        const titulo =
            document.createElement("h3");

        titulo.textContent =
            carta.nombre;

        elemento.appendChild(
            titulo
        );


        /* EXPANSIÓN */

        const textoExpansion =
            document.createElement("p");

        textoExpansion.textContent =
            obtenerNombreExpansion(carta);

        elemento.appendChild(
            textoExpansion
        );


        /* NÚMERO Y TIPO */

        const tipoCarta =
            carta.tipo &&
            carta.tipo !== "null"
                ? carta.tipo
                : "Sin tipo";

        const numeroCarta =
            obtenerNumeroCarta(carta);

        const textoNumero =
            document.createElement("p");

        textoNumero.textContent =
            "Nº carta: " +
            numeroCarta +
            " · " +
            tipoCarta;

        elemento.appendChild(
            textoNumero
        );


        /* VARIANTE */

        const variante =
            carta.variante &&
            carta.variante !== "null"
                ? carta.variante
                : "Normal";

        const textoVariante =
            document.createElement("p");

        textoVariante.textContent =
            variante;

        elemento.appendChild(
            textoVariante
        );


        /* RAREZA */

        if (
            carta.rareza &&
            carta.rareza !== "null"
        ) {

            const textoRareza =
                document.createElement("p");

            textoRareza.textContent =
                carta.rareza;

            elemento.appendChild(
                textoRareza
            );
        }


        /* BOTÓN */

        const boton =
            document.createElement("button");

        if (carta.conseguida) {

            boton.textContent =
                "La tengo ✓";

            boton.classList.add(
                "conseguida"
            );

        } else {

            boton.textContent =
                "La tengo";
        }

        boton.addEventListener(
            "click",
            () => {

                carta.conseguida =
                    !carta.conseguida;

                guardarColeccion();

                mostrarCartas();

                actualizarEstadisticas();
            }
        );

        elemento.appendChild(
            boton
        );

        listaCartas.appendChild(
            elemento
        );
    });


    /* SIN RESULTADOS */

    if (
        cartasFiltradas.length === 0
    ) {

        listaCartas.innerHTML =
            '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:40px;">No se han encontrado cartas.</p>';
    }
}


/* =========================================================
   FILTROS
========================================================= */

botones.forEach(
    (boton, indice) => {

        boton.addEventListener(
            "click",
            () => {

                botones.forEach(
                    b =>
                        b.classList.remove(
                            "activo"
                        )
                );

                boton.classList.add(
                    "activo"
                );

                if (indice === 0) {
                    filtroActual = "todas";
                }

                if (indice === 1) {
                    filtroActual = "tengo";
                }

                if (indice === 2) {
                    filtroActual = "faltan";
                }

                mostrarCartas();
            }
        );
    }
);


/* =========================================================
   GUARDAR COLECCIÓN
========================================================= */

function guardarColeccion() {

    const conseguidas =
        cartas
            .filter(carta =>
                carta.conseguida
            )
            .map(carta =>
                carta.id
            );

    localStorage.setItem(
        CLAVE_COLECCION,
        JSON.stringify(conseguidas)
    );
}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    const total =
        cartas.length;

    const conseguidas =
        cartas.filter(
            carta =>
                carta.conseguida
        ).length;

    const pendientes =
        total - conseguidas;

    const porcentaje =
        total > 0
            ? Math.round(
                (conseguidas / total) * 100
            )
            : 0;

    const estadisticas =
        document.querySelectorAll(
            ".estadistica"
        );

    if (
        estadisticas.length >= 3
    ) {

        estadisticas[0]
            .querySelector("h2")
            .textContent =
                conseguidas +
                " / " +
                total;

        estadisticas[1]
            .querySelector("h2")
            .textContent =
                porcentaje +
                "%";

        estadisticas[2]
            .querySelector("h2")
            .textContent =
                pendientes;

        const progreso =
            document.querySelector(
                ".progreso"
            );

        if (progreso) {

            progreso.style.width =
                porcentaje + "%";
        }
    }
}


/* =========================================================
   ESTILOS
========================================================= */

const estilos =
    document.createElement("style");

estilos.textContent = `

.imagen-contenedor {
    position: relative;
    overflow: visible;
    border-radius: 10px;
    z-index: 1;
}

.carta-faltante {
    filter:
        saturate(45%)
        brightness(75%)
        contrast(90%);
    transition: filter 0.3s ease;
}

.luz-energia {
    position: absolute;
    top: -11px;
    left: -11px;
    right: -11px;
    bottom: -11px;
    pointer-events: none;
    z-index: -1;
    border-radius: 15px;

    box-shadow:
        0 0 10px rgba(70,190,255,0.45),
        0 0 22px rgba(60,180,255,0.32),
        0 0 38px rgba(50,170,255,0.20),
        0 0 55px rgba(40,150,255,0.12);

    animation:
        pulsoAzul
        4s
        ease-in-out
        infinite;
}

@keyframes pulsoAzul {

    0%, 100% {
        opacity: 0.55;
        transform: scale(0.995);
    }

    50% {
        opacity: 0.80;
        transform: scale(1.015);
    }
}

.luz-faltante {
    position: absolute;
    top: -9px;
    left: -9px;
    right: -9px;
    bottom: -9px;
    pointer-events: none;
    z-index: -1;
    border-radius: 14px;

    box-shadow:
        0 0 12px rgba(255,55,55,0.38),
        0 0 25px rgba(255,50,50,0.25),
        0 0 42px rgba(255,45,45,0.15);

    animation:
        pulsoRojo
        4s
        ease-in-out
        infinite;
}

@keyframes pulsoRojo {

    0%, 100% {
        opacity: 0.55;
    }

    50% {
        opacity: 0.85;
    }
}

.estrellas-carta {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 10;
    border-radius: 10px;
}

.estrella {
    position: absolute;
    color: #ffffff;
    font-size: 21px;
    line-height: 1;
    opacity: 0;
    pointer-events: none;

    text-shadow:
        0 0 4px #ffffff,
        0 0 8px #8ee8ff,
        0 0 14px #39caff,
        0 0 22px rgba(80,200,255,0.95);

    animation:
        brilloEstrella
        3s
        ease-in-out
        infinite;
}

@keyframes brilloEstrella {

    0% {
        opacity: 0;
        transform: scale(0.2) rotate(0deg);
    }

    12% {
        opacity: 1;
        transform: scale(1.4) rotate(20deg);
    }

    25% {
        opacity: 0.95;
        transform: scale(1) rotate(45deg);
    }

    40% {
        opacity: 1;
        transform: scale(1.3) rotate(70deg);
    }

    55% {
        opacity: 0;
        transform: scale(0.25) rotate(100deg);
    }

    100% {
        opacity: 0;
        transform: scale(0.2) rotate(120deg);
    }
}

.carta button.conseguida {
    background: #f5c400;
    color: #ffffff;
    font-weight: bold;

    box-shadow:
        0 3px 10px
        rgba(245,196,0,0.40);
}

.carta button.conseguida:hover {
    background: #ffd21f;
}

#selector-expansion {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    font-size: 16px;
    background: white;
    margin-bottom: 15px;
    cursor: pointer;
    outline: none;
}

#selector-expansion:focus {
    border-color: #2563eb;
    box-shadow:
        0 0 0 3px
        rgba(37,99,235,0.12);
}

`;

document.head.appendChild(estilos);