let cartas = [];
let filtroActual = "todas";
let textoBusqueda = "";
let expansionActual = "todas";
let cartaSeleccionadaModal = null;

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
   FUNCIONES AUXILIARES
========================================================= */

function obtenerSetId(carta) {
    if (!carta) return "";
    if (carta.setId) return String(carta.setId);
    if (!carta.id) return "";
    return String(carta.id).split("-")[0];
}

function obtenerNumeroNumerico(carta) {
    const numero = String(carta.numero || "").replace(/\D/g, "");
    return parseInt(numero, 10) || 0;
}

function obtenerNombreExpansionEspanol(carta) {
    return nombresExpansiones[obtenerSetId(carta)] || "";
}

function obtenerNombreExpansion(carta) {
    const nombreEspanol = obtenerNombreExpansionEspanol(carta);
    if (nombreEspanol) return nombreEspanol;
    if (carta.expansion && carta.expansion !== "null") return carta.expansion;
    return "Sin expansión";
}

function ordenarCartas() {
    cartas.sort((a, b) => {
        const setA = obtenerSetId(a);
        const setB = obtenerSetId(b);

        const posicionA = ordenExpansiones.indexOf(setA);
        const posicionB = ordenExpansiones.indexOf(setB);

        const ordenA = posicionA === -1 ? 999 : posicionA;
        const ordenB = posicionB === -1 ? 999 : posicionB;

        if (ordenA !== ordenB) return ordenA - ordenB;

        const numeroA = obtenerNumeroNumerico(a);
        const numeroB = obtenerNumeroNumerico(b);

        if (numeroA !== numeroB) return numeroA - numeroB;

        return String(a.id).localeCompare(String(b.id));
    });
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function obtenerNumeroCarta(carta) {
    const numero = String(carta.numero || "").trim();
    if (!numero) return "";

    if (numero.toUpperCase().startsWith("TG") && carta.totalExpansion) {
        return numero.toUpperCase() + "/TG" + String(carta.totalExpansion).trim();
    }

    const numeroFormateado = numero.padStart(3, "0");
    if (carta.totalExpansion) {
        const total = String(carta.totalExpansion).trim().padStart(3, "0");
        return numeroFormateado + "/" + total;
    }

    return numeroFormateado;
}

function obtenerTextoBusquedaCarta(carta) {
    const setId = obtenerSetId(carta);
    const expansionEspanol = nombresExpansiones[setId] || "";
    const expansionOriginal = carta.expansion || "";
    const numero = carta.numero || "";
    const numeroCompleto = obtenerNumeroCarta(carta);

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
        .filter(c => c !== null && c !== undefined && c !== "")
        .map(c => normalizarTexto(c))
        .join(" ");
}

/* =========================================================
   SELECCIONAR EXPANSIÓN Y BOTONERA
========================================================= */

function seleccionarExpansion(setId) {
    expansionActual = setId;

    const botonesExp = document.querySelectorAll(".boton-expansion");
    botonesExp.forEach(btn => {
        if (btn.getAttribute("data-set-id") === setId) {
            btn.classList.add("activo");
            btn.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        } else {
            btn.classList.remove("activo");
        }
    });

    const selector = document.getElementById("selector-expansion");
    if (selector && selector.value !== setId) {
        selector.value = setId;
    }

    mostrarCartas();
}

function crearBotoneraExpansiones() {
    const contenedor = document.getElementById("botonera-expansiones");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    /* BOTÓN TODAS */
    const botonTodas = document.createElement("button");
    botonTodas.type = "button";
    botonTodas.className = "boton-expansion todas-btn" + (expansionActual === "todas" ? " activo" : "");
    botonTodas.setAttribute("data-set-id", "todas");

    const iconoTodas = document.createElement("span");
    iconoTodas.className = "icono-todas";
    iconoTodas.textContent = "⚡";

    const textoTodas = document.createElement("span");
    textoTodas.className = "nombre-exp";
    textoTodas.textContent = "Todas";

    botonTodas.appendChild(iconoTodas);
    botonTodas.appendChild(textoTodas);

    botonTodas.addEventListener("click", () => {
        seleccionarExpansion("todas");
    });

    contenedor.appendChild(botonTodas);

    /* BOTONES POR CADA EXPANSIÓN */
    ordenExpansiones.forEach(setId => {
        const nombre = nombresExpansiones[setId];
        if (!nombre) return;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-expansion" + (expansionActual === setId ? " activo" : "");
        boton.setAttribute("data-set-id", setId);
        boton.title = nombre;

        const imagenLogo = document.createElement("img");
        imagenLogo.src = "imagenes/logos/" + setId + ".png";
        imagenLogo.alt = nombre;
        imagenLogo.loading = "lazy";

        imagenLogo.onerror = function () {
            this.style.display = "none";
            const fallback = document.createElement("span");
            fallback.className = "badge-exp";
            fallback.textContent = setId.toUpperCase();
            this.parentElement.insertBefore(fallback, this);
        };

        const textoNombre = document.createElement("span");
        textoNombre.className = "nombre-exp";
        textoNombre.textContent = nombre;

        boton.appendChild(imagenLogo);
        boton.appendChild(textoNombre);

        boton.addEventListener("click", () => {
            seleccionarExpansion(setId);
        });

        contenedor.appendChild(boton);
    });
}

function crearSelectorExpansiones() {
    let selector = document.getElementById("selector-expansion");
    if (!selector) return;

    selector.innerHTML = "";

    const todas = document.createElement("option");
    todas.value = "todas";
    todas.textContent = "Todas las expansiones";
    selector.appendChild(todas);

    ordenExpansiones.forEach(setId => {
        if (!nombresExpansiones[setId]) return;
        const opcion = document.createElement("option");
        opcion.value = setId;
        opcion.textContent = nombresExpansiones[setId];
        selector.appendChild(opcion);
    });

    selector.value = expansionActual;
    selector.onchange = function () {
        seleccionarExpansion(selector.value);
    };
}

/* =========================================================
   VISOR 3D HOLOGRÁFICO
========================================================= */

function extraerPokemonBase(nombre) {
    if (!nombre) return "";
    let n = nombre.trim();
    // Quitar prefijos comunes de poseedor / entrenador: "Lance's Charizard" -> "Charizard"
    n = n.replace(/^[a-zA-Z0-9\s]+'s\s+/i, "");
    n = n.replace(/^de\s+/i, "");
    // Quitar sufijos de tipo de V: VMAX, VSTAR, V-UNION, V UNION, V
    n = n.replace(/\s+\b(VMAX|VSTAR|V-UNION|V_UNION|V)\b.*$/i, "");
    return n.trim();
}

function obtenerOtrasVersiones(carta) {
    if (!carta || !cartas) return [];
    const baseActual = normalizarTexto(extraerPokemonBase(carta.nombre));
    const palabrasBase = baseActual.split(/\s+/).filter(Boolean);
    const palabraPrincipal = palabrasBase.length > 0 ? (
        ['galarian', 'hisuian', 'alolan', 'origin', 'forma'].includes(palabrasBase[0]) && palabrasBase[1]
            ? palabrasBase[1]
            : palabrasBase[0]
    ) : baseActual;

    return cartas.filter(c => {
        const baseC = normalizarTexto(extraerPokemonBase(c.nombre));
        if (baseC === baseActual) return true;
        if (baseActual.length >= 4 && (baseC.includes(baseActual) || baseActual.includes(baseC))) return true;
        if (palabraPrincipal.length >= 4 && baseC.includes(palabraPrincipal)) return true;
        return false;
    });
}

function renderizarPanelVersiones(carta) {
    abrirModalVersiones(carta);
}

function abrirModalVersiones(carta) {
    const modal = document.getElementById("modal-versiones");
    const grid = document.getElementById("modal-versiones-grid");
    const titulo = document.getElementById("modal-versiones-titulo");
    const subtitulo = document.getElementById("modal-versiones-subtitulo");
    const desc = document.getElementById("modal-versiones-desc");
    if (!modal || !grid || !carta) return;

    const versiones = obtenerOtrasVersiones(carta);
    const baseNombre = extraerPokemonBase(carta.nombre);

    if (titulo) {
        titulo.textContent = `Todas las versiones de ${baseNombre}`;
    }
    if (subtitulo) {
        subtitulo.textContent = `Colección Pokémon V · ${versiones.length} versiones encontradas`;
    }
    if (desc) {
        desc.textContent = `Toca cualquier versión (V, VMAX, VSTAR, Promo) para cargarla directamente en el visor 3D.`;
    }

    grid.innerHTML = "";

    versiones.forEach(v => {
        const item = document.createElement("div");
        item.className = "version-card-item" + (v.id === carta.id ? " actual" : "");
        item.title = `${v.nombre} · ${obtenerNombreExpansion(v)} #${obtenerNumeroCarta(v)}`;

        item.innerHTML = `
            <span class="version-card-badge ${v.conseguida ? 'conseguida' : ''}">${v.conseguida ? '✓' : '+'}</span>
            <img src="${v.imagen}" alt="${v.nombre}" class="version-card-img" loading="lazy">
            <div class="version-card-nombre">${v.nombre}</div>
            <div class="version-card-expansion">${obtenerNombreExpansion(v)} #${obtenerNumeroCarta(v)}</div>
        `;

        item.onclick = function(e) {
            e.stopPropagation();
            abrirModalCarta(v);
            cerrarModalVersiones();
        };

        grid.appendChild(item);
    });

    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
}

function cerrarModalVersiones() {
    const modal = document.getElementById("modal-versiones");
    if (modal) {
        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");
    }
}

function abrirModalCarta(carta) {
    if (!carta) return;
    cartaSeleccionadaModal = carta;

    const modal = document.getElementById("modal-carta");
    const img = document.getElementById("modal-carta-img");
    const nombre = document.getElementById("modal-carta-nombre");
    const expansion = document.getElementById("modal-carta-expansion");
    const numero = document.getElementById("modal-carta-numero");
    const tipo = document.getElementById("modal-carta-tipo");
    const rareza = document.getElementById("modal-carta-rareza");
    const variante = document.getElementById("modal-carta-variante");
    const btnVersionesTexto = document.getElementById("modal-btn-versiones-texto");

    if (img) {
        img.src = carta.imagen;
        img.alt = carta.nombre;
    }
    if (nombre) nombre.textContent = carta.nombre;
    if (expansion) expansion.textContent = obtenerNombreExpansion(carta);
    if (numero) numero.textContent = obtenerNumeroCarta(carta);
    if (tipo) tipo.textContent = (carta.tipo && carta.tipo !== "null") ? carta.tipo : "Sin tipo";
    if (rareza) rareza.textContent = (carta.rareza && carta.rareza !== "null") ? carta.rareza : "Ultra Rara";
    if (variante) variante.textContent = (carta.variante && carta.variante !== "null") ? carta.variante : "Normal";

    if (btnVersionesTexto) {
        const totalVersiones = obtenerOtrasVersiones(carta).length;
        const baseNombre = extraerPokemonBase(carta.nombre);
        btnVersionesTexto.textContent = `Más versiones de ${baseNombre} (${totalVersiones})`;
    }

    actualizarBotonModal();

    if (modal) {
        modal.classList.add("activo");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    resetearCarta3D();
}

function cerrarModalCarta() {
    const modal = document.getElementById("modal-carta");
    if (modal) {
        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
    cerrarModalVersiones();
    cartaSeleccionadaModal = null;
    resetearCarta3D();
}

function actualizarBotonModal() {
    const btn = document.getElementById("modal-btn-toggle");
    const icono = document.getElementById("modal-btn-icono");
    const texto = document.getElementById("modal-btn-texto");

    if (!btn || !cartaSeleccionadaModal) return;

    if (cartaSeleccionadaModal.conseguida) {
        btn.classList.add("conseguida");
        if (icono) icono.textContent = "✓";
        if (texto) texto.textContent = "En mi colección";
    } else {
        btn.classList.remove("conseguida");
        if (icono) icono.textContent = "+";
        if (texto) texto.textContent = "Marcar como conseguida";
    }
}

function resetearCarta3D() {
    const cartaEl = document.getElementById("carta-3d");
    const foil = document.getElementById("holograma-foil");
    const glare = document.getElementById("holograma-glare");
    const sparkles = document.querySelector(".holograma-sparkles");

    if (cartaEl) {
        cartaEl.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
        cartaEl.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        cartaEl.style.boxShadow = "0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.35)";
    }

    if (foil) foil.style.opacity = "0";
    if (glare) glare.style.opacity = "0";
    if (sparkles) sparkles.style.opacity = "0";
}

function inicializarModalHolografico() {
    const wrapper = document.getElementById("carta-3d-wrapper");
    const cartaEl = document.getElementById("carta-3d");
    const foil = document.getElementById("holograma-foil");
    const glare = document.getElementById("holograma-glare");
    const sparkles = document.querySelector(".holograma-sparkles");
    const btnCerrar = document.getElementById("modal-btn-cerrar");
    const backdrop = document.getElementById("modal-backdrop");
    const btnToggle = document.getElementById("modal-btn-toggle");
    const btnVersiones = document.getElementById("modal-btn-versiones");
    const modalVersiones = document.getElementById("modal-versiones");
    const btnCerrarVersiones = document.getElementById("modal-versiones-btn-cerrar");
    const backdropVersiones = document.getElementById("modal-versiones-backdrop");

    if (btnCerrar) {
        btnCerrar.onclick = function(e) {
            e.stopPropagation();
            cerrarModalCarta();
        };
    }

    if (backdrop) {
        backdrop.onclick = function() {
            cerrarModalCarta();
        };
    }

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            if (modalVersiones && modalVersiones.classList.contains("activo")) {
                cerrarModalVersiones();
            } else {
                cerrarModalCarta();
            }
        }
    });

    if (btnToggle) {
        btnToggle.onclick = function() {
            if (!cartaSeleccionadaModal) return;
            cartaSeleccionadaModal.conseguida = !cartaSeleccionadaModal.conseguida;
            guardarColeccion();
            actualizarBotonModal();
            mostrarCartas();
            actualizarEstadisticas();
        };
    }

    if (btnVersiones) {
        btnVersiones.onclick = function(e) {
            e.stopPropagation();
            if (cartaSeleccionadaModal) {
                abrirModalVersiones(cartaSeleccionadaModal);
            }
        };
    }

    if (btnCerrarVersiones) {
        btnCerrarVersiones.onclick = function(e) {
            e.stopPropagation();
            cerrarModalVersiones();
        };
    }

    if (backdropVersiones) {
        backdropVersiones.onclick = function(e) {
            e.stopPropagation();
            cerrarModalVersiones();
        };
    }

    if (!wrapper || !cartaEl) return;

    function calcularInclinacion(clientX, clientY) {
        const rect = wrapper.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const xPct = (mouseX / width - 0.5) * 2; // -1 to 1
        const yPct = (mouseY / height - 0.5) * 2; // -1 to 1

        const rotX = -yPct * 18;
        const rotY = xPct * 18;

        cartaEl.style.transition = "none";
        cartaEl.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

        const shadowX = -rotY * 1.2;
        const shadowY = rotX * 1.2 + 18;
        cartaEl.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 35px -8px rgba(0, 0, 0, 0.65), 0 0 25px rgba(59, 130, 246, 0.3)`;

        if (foil) {
            foil.style.opacity = "0.5";
            const bgPosX = 50 + rotY * 2.2;
            const bgPosY = 50 + rotX * 2.2;
            foil.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        }

        if (glare) {
            glare.style.opacity = "0.45";
            const glareX = (mouseX / width) * 100;
            const glareY = (mouseY / height) * 100;
            glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 70%)`;
        }

        if (sparkles) {
            sparkles.style.opacity = "0.35";
        }
    }

    wrapper.addEventListener("mousemove", e => {
        calcularInclinacion(e.clientX, e.clientY);
    });

    wrapper.addEventListener("mouseleave", () => {
        resetearCarta3D();
    });

    wrapper.addEventListener("touchmove", e => {
        if (e.touches && e.touches[0]) {
            e.preventDefault();
            calcularInclinacion(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    wrapper.addEventListener("touchend", () => {
        resetearCarta3D();
    });
}

/* =========================================================
   MOSTRAR CARTAS EN LA CUADRÍCULA
========================================================= */

function mostrarCartas() {
    listaCartas.innerHTML = "";

    const busquedaNormalizada = normalizarTexto(textoBusqueda);

    const cartasFiltradas = cartas.filter(carta => {
        if (expansionActual !== "todas" && obtenerSetId(carta) !== expansionActual) {
            return false;
        }
        if (filtroActual === "tengo" && !carta.conseguida) {
            return false;
        }
        if (filtroActual === "faltan" && carta.conseguida) {
            return false;
        }
        if (busquedaNormalizada !== "") {
            const textoCarta = obtenerTextoBusquedaCarta(carta);
            if (!textoCarta.includes(busquedaNormalizada)) {
                return false;
            }
        }
        return true;
    });

    cartasFiltradas.forEach(carta => {
        const elemento = document.createElement("div");
        elemento.className = "carta" + (carta.conseguida ? " conseguida" : "");
        elemento.title = `${carta.nombre} · ${obtenerNombreExpansion(carta)} (Haz clic para ver en 3D)`;

        elemento.addEventListener("click", () => {
            abrirModalCarta(carta);
        });

        /* IMAGEN */
        const imagenContenedor = document.createElement("div");
        imagenContenedor.className = "imagen-contenedor";

        const imagen = document.createElement("img");
        imagen.src = carta.imagen;
        imagen.alt = carta.nombre;
        imagen.loading = "lazy";

        if (!carta.conseguida) {
            imagen.classList.add("carta-faltante");
        }

        imagenContenedor.appendChild(imagen);

        /* EFECTO CONSEGUIDA */
        if (carta.conseguida) {
            const luz = document.createElement("div");
            luz.className = "luz-energia";
            imagenContenedor.appendChild(luz);

            const estrellas = document.createElement("div");
            estrellas.className = "estrellas-carta";
            const posiciones = [[18, 22], [72, 30], [35, 68], [80, 75]];

            posiciones.forEach((posicion, indice) => {
                const estrella = document.createElement("span");
                estrella.className = "estrella";
                estrella.textContent = "✦";
                estrella.style.left = posicion[0] + "%";
                estrella.style.top = posicion[1] + "%";
                estrella.style.animationDelay = (indice * 0.75) + "s";
                estrellas.appendChild(estrella);
            });

            imagenContenedor.appendChild(estrellas);
        } else {
            const luzFaltante = document.createElement("div");
            luzFaltante.className = "luz-faltante";
            imagenContenedor.appendChild(luzFaltante);
        }

        /* BOTÓN FLOTANTE (+ / ✓) EN LA ESQUINA */
        const botonFlotante = document.createElement("button");
        botonFlotante.type = "button";
        botonFlotante.className = "btn-coleccion-flotante" + (carta.conseguida ? " conseguida" : "");
        botonFlotante.setAttribute("aria-label", carta.conseguida ? "En mi colección" : "Añadir a mi colección");
        botonFlotante.title = carta.conseguida ? "En mi colección (clic para quitar)" : "Añadir a mi colección";
        botonFlotante.innerHTML = carta.conseguida ? "✓" : "+";

        botonFlotante.addEventListener("click", e => {
            e.stopPropagation();
            carta.conseguida = !carta.conseguida;
            guardarColeccion();
            mostrarCartas();
            actualizarEstadisticas();
        });

        imagenContenedor.appendChild(botonFlotante);
        elemento.appendChild(imagenContenedor);
        listaCartas.appendChild(elemento);
    });

    if (cartasFiltradas.length === 0) {
        listaCartas.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:40px;font-size:16px;">No se han encontrado cartas con los filtros seleccionados.</p>';
    }
}

/* =========================================================
   BUSCADOR Y FILTROS
========================================================= */

if (buscador) {
    buscador.addEventListener("input", () => {
        textoBusqueda = buscador.value.trim().toLowerCase();
        mostrarCartas();
    });
}

botones.forEach((boton, indice) => {
    boton.addEventListener("click", () => {
        botones.forEach(b => b.classList.remove("activo"));
        boton.classList.add("activo");

        if (indice === 0) filtroActual = "todas";
        if (indice === 1) filtroActual = "tengo";
        if (indice === 2) filtroActual = "faltan";

        mostrarCartas();
    });
});

/* =========================================================
   GUARDAR COLECCIÓN Y ESTADÍSTICAS
========================================================= */

function guardarColeccion() {
    const conseguidas = cartas.filter(carta => carta.conseguida).map(carta => carta.id);
    localStorage.setItem(CLAVE_COLECCION, JSON.stringify(conseguidas));
}

/* =========================================================
   SISTEMA DE LOGROS Y VITRINA DE TROFEOS (POKÉMON TCG POCKET)
========================================================= */

const CLAVE_LOGROS = "pokemon_v_logros_desbloqueados";
let logrosDesbloqueados = new Set(JSON.parse(localStorage.getItem(CLAVE_LOGROS) || "[]"));
let toastTimeout = null;

function mostrarToastLogro(imagenSrc, titulo, descripcion) {
    const toast = document.getElementById("toast-logro");
    const toastImg = document.getElementById("toast-icono-img");
    const toastDesc = document.getElementById("toast-descripcion");
    if (!toast || !toastImg || !toastDesc) return;

    toastImg.src = imagenSrc;
    toastDesc.textContent = descripcion;
    const toastTitulo = toast.querySelector(".toast-titulo");
    if (toastTitulo) toastTitulo.textContent = titulo;

    toast.classList.add("activo");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("activo");
    }, 4500);
}

function calcularLogros(notificar = false) {
    if (!cartas || cartas.length === 0) return;

    let totalBronce = 0;
    let totalPlata = 0;
    let totalOro = 0;
    let totalExpansionesCompletadas = 0;
    const totalExpansiones = ordenExpansiones.length;

    const datosExpansiones = [];

    ordenExpansiones.forEach(expId => {
        const cartasExp = cartas.filter(c => obtenerSetId(c) === expId);
        const total = cartasExp.length;
        const conseguidas = cartasExp.filter(c => c.conseguida).length;
        const pct = total > 0 ? (conseguidas / total) * 100 : 0;
        const nombre = nombresExpansiones[expId] || expId;

        const tieneBronce = pct >= 30;
        const tienePlata = pct >= 60;
        const tieneOro = total > 0 && conseguidas === total;

        if (tieneBronce) totalBronce++;
        if (tienePlata) totalPlata++;
        if (tieneOro) {
            totalOro++;
            totalExpansionesCompletadas++;
        }

        // Detectar nuevos desbloqueos
        const idBronce = `logro_${expId}_bronce`;
        const idPlata = `logro_${expId}_plata`;
        const idOro = `logro_${expId}_oro`;

        if (tieneBronce && !logrosDesbloqueados.has(idBronce)) {
            logrosDesbloqueados.add(idBronce);
            if (notificar) mostrarToastLogro("trofeos/bronce.png", "¡TROFEO DE BRONCE!", `${nombre} (30% completado)`);
        } else if (!tieneBronce && logrosDesbloqueados.has(idBronce)) {
            logrosDesbloqueados.delete(idBronce);
        }

        if (tienePlata && !logrosDesbloqueados.has(idPlata)) {
            logrosDesbloqueados.add(idPlata);
            if (notificar) mostrarToastLogro("trofeos/plata.png", "¡TROFEO DE PLATA!", `${nombre} (60% completado)`);
        } else if (!tienePlata && logrosDesbloqueados.has(idPlata)) {
            logrosDesbloqueados.delete(idPlata);
        }

        if (tieneOro && !logrosDesbloqueados.has(idOro)) {
            logrosDesbloqueados.add(idOro);
            if (notificar) mostrarToastLogro("trofeos/oro.png", "¡TROFEO DE ORO!", `${nombre} (¡100% completado!)`);
        } else if (!tieneOro && logrosDesbloqueados.has(idOro)) {
            logrosDesbloqueados.delete(idOro);
        }

        datosExpansiones.push({
            id: expId,
            nombre: nombre,
            total: total,
            conseguidas: conseguidas,
            pct: pct,
            bronce: tieneBronce,
            plata: tienePlata,
            oro: tieneOro
        });
    });

    // Trofeo Maestro Supremo Irisado (100% de todas las expansiones)
    const tieneMaestro = totalExpansionesCompletadas === totalExpansiones && totalExpansiones > 0;
    const idMaestro = "logro_maestro_supremo";
    if (tieneMaestro && !logrosDesbloqueados.has(idMaestro)) {
        logrosDesbloqueados.add(idMaestro);
        if (notificar) mostrarToastLogro("trofeos/irisado.png", "¡TROFEO SUPREMO DESBLOQUEADO!", "¡Has completado el 100% de TODAS las expansiones!");
    } else if (!tieneMaestro && logrosDesbloqueados.has(idMaestro)) {
        logrosDesbloqueados.delete(idMaestro);
    }

    localStorage.setItem(CLAVE_LOGROS, JSON.stringify(Array.from(logrosDesbloqueados)));

    // Actualizar badge en cabecera
    const totalTrofeos = totalBronce + totalPlata + totalOro + (tieneMaestro ? 1 : 0);
    const maxTrofeos = (totalExpansiones * 3) + 1; // 73 trofeos
    const badgeLogros = document.getElementById("badge-contador-logros");
    if (badgeLogros) {
        badgeLogros.textContent = `${totalTrofeos} / ${maxTrofeos}`;
    }

    // Actualizar contadores del modal
    const conteoBronce = document.getElementById("conteo-bronce");
    if (conteoBronce) conteoBronce.textContent = `${totalBronce} / ${totalExpansiones}`;

    const conteoPlata = document.getElementById("conteo-plata");
    if (conteoPlata) conteoPlata.textContent = `${totalPlata} / ${totalExpansiones}`;

    const conteoOro = document.getElementById("conteo-oro");
    if (conteoOro) conteoOro.textContent = `${totalOro} / ${totalExpansiones}`;

    // Actualizar tarjeta del Maestro Supremo
    const maestroCard = document.getElementById("trofeo-maestro-card");
    const maestroFill = document.getElementById("trofeo-maestro-fill");
    const maestroTexto = document.getElementById("trofeo-maestro-texto");

    if (maestroCard) {
        if (tieneMaestro) {
            maestroCard.classList.add("desbloqueado");
        } else {
            maestroCard.classList.remove("desbloqueado");
        }
    }
    if (maestroFill) {
        const pctMaestro = totalExpansiones > 0 ? (totalExpansionesCompletadas / totalExpansiones) * 100 : 0;
        maestroFill.style.width = `${pctMaestro}%`;
    }
    if (maestroTexto) {
        maestroTexto.textContent = `${totalExpansionesCompletadas} / ${totalExpansiones} expansiones al 100%`;
    }

    // Renderizar lista de expansiones en la vitrina
    renderizarVitrinaExpansiones(datosExpansiones);
}

function renderizarVitrinaExpansiones(datosExpansiones) {
    const grid = document.getElementById("logros-expansiones-grid");
    if (!grid) return;

    grid.innerHTML = "";

    datosExpansiones.forEach(exp => {
        const card = document.createElement("div");
        card.className = "logro-expansion-card";

        const pctFormateado = Math.round(exp.pct);
        const rutaLogo = `logos/${exp.id}.png`;

        card.innerHTML = `
            <div class="logro-exp-header">
                <img src="${rutaLogo}" alt="${exp.nombre}" class="logro-exp-logo" onerror="this.style.display='none'">
                <div class="logro-exp-detalles">
                    <div class="logro-exp-nombre">${exp.nombre}</div>
                    <div class="logro-exp-stats">${exp.conseguidas}/${exp.total} cartas (${pctFormateado}%)</div>
                </div>
            </div>
            <div class="logro-exp-barra">
                <div class="logro-exp-fill" style="width: ${pctFormateado}%"></div>
            </div>
            <div class="logro-trofeos-row">
                <div class="trofeo-item bronce ${exp.bronce ? 'desbloqueado' : 'bloqueado'}" title="${exp.bronce ? 'Desbloqueado (30%)' : 'Bloqueado (requiere 30%)'}">
                    <img src="trofeos/bronce.png" alt="Bronce 30%" class="trofeo-item-img">
                    <span class="trofeo-item-label">30%</span>
                </div>
                <div class="trofeo-item plata ${exp.plata ? 'desbloqueado' : 'bloqueado'}" title="${exp.plata ? 'Desbloqueado (60%)' : 'Bloqueado (requiere 60%)'}">
                    <img src="trofeos/plata.png" alt="Plata 60%" class="trofeo-item-img">
                    <span class="trofeo-item-label">60%</span>
                </div>
                <div class="trofeo-item oro ${exp.oro ? 'desbloqueado' : 'bloqueado'}" title="${exp.oro ? 'Desbloqueado (100%)' : 'Bloqueado (requiere 100%)'}">
                    <img src="trofeos/oro.png" alt="Oro 100%" class="trofeo-item-img">
                    <span class="trofeo-item-label">100%</span>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function inicializarModalLogros() {
    const btnAbrir = document.getElementById("btn-abrir-logros");
    const modal = document.getElementById("modal-logros");
    const btnCerrar = document.getElementById("modal-logros-btn-cerrar");
    const backdrop = document.getElementById("modal-logros-backdrop");

    if (btnAbrir && modal) {
        btnAbrir.addEventListener("click", () => {
            calcularLogros(false);
            modal.classList.add("activo");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        });
    }

    function cerrarLogros() {
        if (!modal) return;
        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (btnCerrar) btnCerrar.addEventListener("click", cerrarLogros);
    if (backdrop) backdrop.addEventListener("click", cerrarLogros);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal && modal.classList.contains("activo")) {
            cerrarLogros();
        }
    });
}

function actualizarEstadisticas() {
    const total = cartas.length;
    const conseguidas = cartas.filter(carta => carta.conseguida).length;
    const pendientes = total - conseguidas;
    const porcentaje = total > 0 ? Math.round((conseguidas / total) * 100) : 0;

    const estadisticas = document.querySelectorAll(".estadistica");
    if (estadisticas.length >= 3) {
        estadisticas[0].querySelector("h2").textContent = conseguidas + " / " + total;
        estadisticas[1].querySelector("h2").textContent = porcentaje + "%";
        estadisticas[2].querySelector("h2").textContent = pendientes;

        const progreso = document.querySelector(".progreso");
        if (progreso) {
            progreso.style.width = porcentaje + "%";
        }
    }

    calcularLogros(true);
}

/* =========================================================
   INICIALIZACIÓN / CARGA DE DATOS
========================================================= */

fetch("cartas.json")
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error("No se ha podido cargar cartas.json");
        }
        return respuesta.json();
    })
    .then(datos => {
        cartas = datos;

        const guardadas = JSON.parse(localStorage.getItem(CLAVE_COLECCION) || "[]");
        cartas.forEach(carta => {
            carta.conseguida = guardadas.includes(carta.id);
        });

        ordenarCartas();
        crearBotoneraExpansiones();
        crearSelectorExpansiones();
        inicializarModalHolografico();
        inicializarModalLogros();
        mostrarCartas();
        actualizarEstadisticas();
    })
    .catch(error => {
        console.error("Error al cargar las cartas:", error);
        listaCartas.innerHTML =
            '<p style="grid-column:1/-1;text-align:center;color:#dc2626;padding:40px;">Error al cargar las cartas. Mira la consola del navegador.</p>';
    });

const estilos = document.createElement("style");
estilos.textContent = `
.imagen-contenedor { position: relative; overflow: visible; border-radius: 10px; z-index: 1; }
.carta-faltante { filter: saturate(45%) brightness(75%) contrast(90%); transition: filter 0.3s ease; }
.luz-energia { position: absolute; top: -11px; left: -11px; right: -11px; bottom: -11px; pointer-events: none; z-index: -1; border-radius: 15px; box-shadow: 0 0 10px rgba(70,190,255,0.45), 0 0 22px rgba(60,180,255,0.32), 0 0 38px rgba(50,170,255,0.20), 0 0 55px rgba(40,150,255,0.12); animation: pulsoAzul 4s ease-in-out infinite; }
@keyframes pulsoAzul { 0%, 100% { opacity: 0.55; transform: scale(0.995); } 50% { opacity: 0.80; transform: scale(1.015); } }
.luz-faltante { position: absolute; top: -9px; left: -9px; right: -9px; bottom: -9px; pointer-events: none; z-index: -1; border-radius: 14px; box-shadow: 0 0 12px rgba(255,55,55,0.38), 0 0 25px rgba(255,50,50,0.25), 0 0 42px rgba(255,45,45,0.15); animation: pulsoRojo 4s ease-in-out infinite; }
@keyframes pulsoRojo { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.85; } }
.estrellas-carta { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 10; border-radius: 10px; }
.estrella { position: absolute; color: #ffffff; font-size: 21px; line-height: 1; opacity: 0; pointer-events: none; text-shadow: 0 0 4px #ffffff, 0 0 8px #8ee8ff, 0 0 14px #39caff, 0 0 22px rgba(80,200,255,0.95); animation: brilloEstrella 3s ease-in-out infinite; }
@keyframes brilloEstrella { 0% { opacity: 0; transform: scale(0.2) rotate(0deg); } 12% { opacity: 1; transform: scale(1.4) rotate(20deg); } 25% { opacity: 0.95; transform: scale(1) rotate(45deg); } 40% { opacity: 1; transform: scale(1.3) rotate(70deg); } 55% { opacity: 0; transform: scale(0.25) rotate(100deg); } 100% { opacity: 0; transform: scale(0.2) rotate(120deg); } }
.carta button.conseguida { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-weight: 800; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); }
.carta button.conseguida:hover { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); box-shadow: 0 6px 18px rgba(217, 119, 6, 0.45); }

/* ── MÓVIL: contenemos los efectos para que no invadan cartas vecinas ── */
@media (max-width: 768px) {
  .imagen-contenedor { overflow: hidden; border-radius: 8px; }
  .luz-energia { top: 0; left: 0; right: 0; bottom: 0; border-radius: 8px; box-shadow: 0 0 6px rgba(70,190,255,0.5) inset; }
  .luz-faltante { top: 0; left: 0; right: 0; bottom: 0; border-radius: 8px; box-shadow: 0 0 5px rgba(255,55,55,0.4) inset; }
  .estrellas-carta { border-radius: 8px; }
  .carta { overflow: hidden; border-radius: 8px; }
}
`;
document.head.appendChild(estilos);