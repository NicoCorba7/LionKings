// ========================================
// AVELLANEDA LIONKINGS
// SCRIPT PRINCIPAL
// ========================================


// ========================================
// PESTAÑAS (Módulos)
// ========================================

function cambiarTab(botonClickeado, idTab) {

    // Quitar clase activo de todos los tabs y contenidos
    var tabs = document.querySelectorAll('.tab');
    var contenidos = document.querySelectorAll('.tabContenido');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('activo');
    }

    for (var j = 0; j < contenidos.length; j++) {
        contenidos[j].style.display = 'none';
        contenidos[j].classList.remove('activo');
    }

    // Activar el tab y contenido seleccionado
    botonClickeado.classList.add('activo');
    var contenidoActivo = document.getElementById(idTab);
    contenidoActivo.style.display = 'block';
    contenidoActivo.classList.add('activo');

}

function cambiarTabPorId(idTab) {

    var tabs = document.querySelectorAll('.tab');
    var contenidos = document.querySelectorAll('.tabContenido');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('activo');
    }

    for (var j = 0; j < contenidos.length; j++) {
        contenidos[j].style.display = 'none';
        contenidos[j].classList.remove('activo');
    }

    // Buscar el botón que corresponde al id del tab
    var mapaIds = {
        'tabSocios': 0,
        'tabJugadoresForm': 1,
        'tabFixtureForm': 2
    };

    var indice = mapaIds[idTab];
    if (indice !== undefined) {
        tabs[indice].classList.add('activo');
    }

    var contenidoActivo = document.getElementById(idTab);
    if (contenidoActivo) {
        contenidoActivo.style.display = 'block';
        contenidoActivo.classList.add('activo');
    }

}


// ========================================
// MODALES
// ========================================

function abrirModalSocio() {
    document.getElementById('modalSocio').style.display = 'flex';
}

function abrirModalJugador() {
    document.getElementById('modalJugador').style.display = 'flex';
}

function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(evento) {
    var modales = document.querySelectorAll('.modalOverlay');
    for (var i = 0; i < modales.length; i++) {
        if (evento.target === modales[i]) {
            modales[i].style.display = 'none';
        }
    }
});


// ========================================
// MÓDULO 1: SOCIOS
// Persistencia con localStorage
// ========================================

function obtenerSocios() {
    var datos = localStorage.getItem('lionkings_socios');
    if (datos) {
        return JSON.parse(datos);
    }
    return [];
}

function guardarSocios(socios) {
    localStorage.setItem('lionkings_socios', JSON.stringify(socios));
}

function registrarSocio(evento) {

    evento.preventDefault();

    // Limpiar errores anteriores
    document.getElementById('errNombre').textContent = '';
    document.getElementById('errDni').textContent = '';
    document.getElementById('errEmail').textContent = '';
    document.getElementById('errPlan').textContent = '';
    document.getElementById('errFecha').textContent = '';

    var nombre = document.getElementById('socioNombre').value.trim();
    var dni = document.getElementById('socioDni').value.trim();
    var email = document.getElementById('socioEmail').value.trim();
    var telefono = document.getElementById('socioTelefono').value.trim();
    var plan = document.getElementById('socioPlan').value;
    var fecha = document.getElementById('socioFecha').value;

    var hayError = false;

    // Validaciones
    if (nombre.length < 3) {
        document.getElementById('errNombre').textContent = 'El nombre debe tener al menos 3 caracteres.';
        hayError = true;
    }

    if (!/^\d{7,8}$/.test(dni)) {
        document.getElementById('errDni').textContent = 'El DNI debe tener 7 u 8 números sin puntos ni espacios.';
        hayError = true;
    }

    if (email === '' || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        document.getElementById('errEmail').textContent = 'Ingresá un email válido.';
        hayError = true;
    }

    if (plan === '') {
        document.getElementById('errPlan').textContent = 'Seleccioná un plan.';
        hayError = true;
    }

    if (fecha === '') {
        document.getElementById('errFecha').textContent = 'Seleccioná una fecha de alta.';
        hayError = true;
    }

    if (hayError) return;

    // Verificar DNI duplicado
    var socios = obtenerSocios();
    for (var i = 0; i < socios.length; i++) {
        if (socios[i].dni === dni) {
            document.getElementById('errDni').textContent = 'Ya existe un socio con ese DNI.';
            return;
        }
    }

    // Crear socio y guardar
    var nuevoSocio = {
        id: Date.now(),
        nombre: nombre,
        dni: dni,
        email: email,
        telefono: telefono,
        plan: plan,
        fecha: fecha
    };

    socios.push(nuevoSocio);
    guardarSocios(socios);

    // Limpiar formulario
    document.getElementById('formSocio').reset();

    // Mostrar mensaje de éxito
    var mensaje = document.getElementById('mensajeSocio');
    mensaje.style.display = 'block';
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);

    // Actualizar vistas
    actualizarContadorSocios();
    renderTablaSocios();
    renderResumen();

}

function eliminarSocio(id) {

    if (!confirm('¿Seguro que querés eliminar este socio?')) return;

    var socios = obtenerSocios();
    var nuevos = [];

    for (var i = 0; i < socios.length; i++) {
        if (socios[i].id !== id) {
            nuevos.push(socios[i]);
        }
    }

    guardarSocios(nuevos);
    actualizarContadorSocios();
    renderTablaSocios();
    renderResumen();

}

function borrarTodosSocios() {

    if (!confirm('¿Seguro que querés eliminar TODOS los socios? Esta acción no se puede deshacer.')) return;

    localStorage.removeItem('lionkings_socios');
    actualizarContadorSocios();
    renderTablaSocios();
    renderResumen();

}

function actualizarContadorSocios() {
    var socios = obtenerSocios();
    var contador = document.getElementById('contadorSocios');
    if (contador) {
        contador.textContent = socios.length;
    }
}

function renderTablaSocios() {

    var socios = obtenerSocios();
    var contenedor = document.getElementById('tablaSocios');
    var buscar = document.getElementById('buscarSocio').value.toLowerCase();

    // Filtrar por búsqueda
    var filtrados = [];
    for (var i = 0; i < socios.length; i++) {
        if (
            socios[i].nombre.toLowerCase().indexOf(buscar) !== -1 ||
            socios[i].dni.indexOf(buscar) !== -1
        ) {
            filtrados.push(socios[i]);
        }
    }

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p class="sinDatos">No hay socios que coincidan con la búsqueda.</p>';
        return;
    }

    var html = '<table class="tablaEstilos">';
    html += '<tr>';
    html += '<th>Nombre</th>';
    html += '<th>DNI</th>';
    html += '<th>Plan</th>';
    html += '<th>Fecha Alta</th>';
    html += '<th></th>';
    html += '</tr>';

    for (var j = 0; j < filtrados.length; j++) {
        var s = filtrados[j];
        html += '<tr>';
        html += '<td>' + s.nombre + '</td>';
        html += '<td>' + s.dni + '</td>';
        html += '<td>' + s.plan + '</td>';
        html += '<td>' + formatearFecha(s.fecha) + '</td>';
        html += '<td><button class="btnEliminar" onclick="eliminarSocio(' + s.id + ')">🗑</button></td>';
        html += '</tr>';
    }

    html += '</table>';
    contenedor.innerHTML = html;

}

function exportarSocios() {

    var socios = obtenerSocios();

    if (socios.length === 0) {
        alert('No hay socios para exportar.');
        return;
    }

    var texto = 'LISTADO DE SOCIOS - Avellaneda LionKings\n';
    texto += '========================================\n\n';
    texto += 'Nombre | DNI | Email | Teléfono | Plan | Fecha Alta\n';
    texto += '------------------------------------------------------\n';

    for (var i = 0; i < socios.length; i++) {
        var s = socios[i];
        texto += s.nombre + ' | ' + s.dni + ' | ' + s.email + ' | ' + (s.telefono || '-') + ' | ' + s.plan + ' | ' + formatearFecha(s.fecha) + '\n';
    }

    texto += '\nTotal de socios: ' + socios.length;

    // Crear y descargar archivo de texto
    var blob = new Blob([texto], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'socios_lionkings.txt';
    enlace.click();
    URL.revokeObjectURL(url);

}


// ========================================
// MÓDULO 2: JUGADORES
// ========================================

function obtenerJugadores() {
    var datos = localStorage.getItem('lionkings_jugadores');
    if (datos) {
        return JSON.parse(datos);
    }
    return [];
}

function guardarJugadores(jugadores) {
    localStorage.setItem('lionkings_jugadores', JSON.stringify(jugadores));
}

function registrarJugador(evento) {

    evento.preventDefault();

    document.getElementById('errJugNombre').textContent = '';
    document.getElementById('errJugNumero').textContent = '';
    document.getElementById('errJugPosicion').textContent = '';

    var nombre = document.getElementById('jugNombre').value.trim();
    var numero = document.getElementById('jugNumero').value.trim();
    var posicion = document.getElementById('jugPosicion').value;
    var edad = document.getElementById('jugEdad').value.trim();

    var hayError = false;

    if (nombre.length < 3) {
        document.getElementById('errJugNombre').textContent = 'El nombre debe tener al menos 3 caracteres.';
        hayError = true;
    }

    if (numero === '' || isNaN(numero) || parseInt(numero) < 0 || parseInt(numero) > 99) {
        document.getElementById('errJugNumero').textContent = 'Ingresá un número entre 0 y 99.';
        hayError = true;
    }

    if (posicion === '') {
        document.getElementById('errJugPosicion').textContent = 'Seleccioná una posición.';
        hayError = true;
    }

    if (hayError) return;

    // Verificar número de camiseta duplicado
    var jugadores = obtenerJugadores();
    for (var i = 0; i < jugadores.length; i++) {
        if (jugadores[i].numero === parseInt(numero)) {
            document.getElementById('errJugNumero').textContent = 'Ya hay un jugador con ese número de camiseta.';
            return;
        }
    }

    var nuevoJugador = {
        id: Date.now(),
        nombre: nombre,
        numero: parseInt(numero),
        posicion: posicion,
        edad: edad || '-'
    };

    jugadores.push(nuevoJugador);
    guardarJugadores(jugadores);

    document.getElementById('formJugador').reset();

    var mensaje = document.getElementById('mensajeJugador');
    mensaje.style.display = 'block';
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);

    renderTablaJugadores();
    actualizarPlantelDestacado();
    renderResumen();

}

function eliminarJugador(id) {

    if (!confirm('¿Seguro que querés eliminar este jugador?')) return;

    var jugadores = obtenerJugadores();
    var nuevos = [];

    for (var i = 0; i < jugadores.length; i++) {
        if (jugadores[i].id !== id) {
            nuevos.push(jugadores[i]);
        }
    }

    guardarJugadores(nuevos);
    renderTablaJugadores();
    actualizarPlantelDestacado();
    renderResumen();

}

function borrarTodosJugadores() {

    if (!confirm('¿Seguro que querés eliminar TODOS los jugadores del plantel?')) return;

    localStorage.removeItem('lionkings_jugadores');
    renderTablaJugadores();
    actualizarPlantelDestacado();
    renderResumen();

}

function renderTablaJugadores() {

    var jugadores = obtenerJugadores();
    var contenedor = document.getElementById('tablaJugadores');

    if (jugadores.length === 0) {
        contenedor.innerHTML = '<p class="sinDatos">No hay jugadores cargados.</p>';
        return;
    }

    var html = '<table class="tablaEstilos">';
    html += '<tr>';
    html += '<th>#</th>';
    html += '<th>Nombre</th>';
    html += '<th>Posición</th>';
    html += '<th>Edad</th>';
    html += '<th></th>';
    html += '</tr>';

    for (var i = 0; i < jugadores.length; i++) {
        var j = jugadores[i];
        html += '<tr>';
        html += '<td>' + j.numero + '</td>';
        html += '<td>' + j.nombre + '</td>';
        html += '<td>' + j.posicion + '</td>';
        html += '<td>' + j.edad + '</td>';
        html += '<td><button class="btnEliminar" onclick="eliminarJugador(' + j.id + ')">🗑</button></td>';
        html += '</tr>';
    }

    html += '</table>';
    contenedor.innerHTML = html;

}

function actualizarPlantelDestacado() {

    // Agregar jugadores nuevos como tarjetas en la sección de plantel
    var jugadores = obtenerJugadores();
    var contenedor = document.getElementById('contenedorJugadores');

    if (!contenedor) return;

    // Mantener los 4 jugadores base del HTML y agregar los nuevos
    // (los primeros 4 hijos son los jugadores base)
    var hijos = contenedor.children;
    var cantBase = 4;

    // Eliminar jugadores agregados dinámicamente (los que tienen data-dinamico)
    var aEliminar = [];
    for (var i = 0; i < hijos.length; i++) {
        if (hijos[i].getAttribute('data-dinamico') === 'true') {
            aEliminar.push(hijos[i]);
        }
    }

    for (var k = 0; k < aEliminar.length; k++) {
        contenedor.removeChild(aEliminar[k]);
    }

    // Agregar nuevos jugadores
    for (var j = 0; j < jugadores.length; j++) {
        var div = document.createElement('div');
        div.className = 'jugador';
        div.setAttribute('data-dinamico', 'true');
        div.innerHTML = '<h3>' + jugadores[j].nombre + '</h3><p>' + jugadores[j].posicion + '</p>';
        contenedor.appendChild(div);
    }

}


// ========================================
// MÓDULO 3: FIXTURE / PARTIDOS
// ========================================

function obtenerPartidos() {
    var datos = localStorage.getItem('lionkings_partidos');
    if (datos) {
        return JSON.parse(datos);
    }
    return [];
}

function guardarPartidos(partidos) {
    localStorage.setItem('lionkings_partidos', JSON.stringify(partidos));
}

function registrarPartido(evento) {

    evento.preventDefault();

    document.getElementById('errParRival').textContent = '';
    document.getElementById('errParFecha').textContent = '';
    document.getElementById('errParHora').textContent = '';

    var rival = document.getElementById('parRival').value.trim();
    var fecha = document.getElementById('parFecha').value;
    var hora = document.getElementById('parHora').value;
    var condicion = document.getElementById('parCondicion').value;
    var resultado = document.getElementById('parResultado').value.trim();
    var categoria = document.getElementById('parCategoria').value;

    var hayError = false;

    if (rival.length < 2) {
        document.getElementById('errParRival').textContent = 'Ingresá el nombre del equipo rival.';
        hayError = true;
    }

    if (fecha === '') {
        document.getElementById('errParFecha').textContent = 'Seleccioná una fecha.';
        hayError = true;
    }

    if (hora === '') {
        document.getElementById('errParHora').textContent = 'Ingresá la hora del partido.';
        hayError = true;
    }

    if (hayError) return;

    var nuevoPartido = {
        id: Date.now(),
        rival: rival,
        fecha: fecha,
        hora: hora,
        condicion: condicion,
        resultado: resultado || '-',
        categoria: categoria
    };

    var partidos = obtenerPartidos();
    partidos.push(nuevoPartido);
    guardarPartidos(partidos);

    document.getElementById('formPartido').reset();

    var mensaje = document.getElementById('mensajePartido');
    mensaje.style.display = 'block';
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);

    renderFixture();
    renderResumen();

}

function eliminarPartido(id) {

    if (!confirm('¿Seguro que querés eliminar este partido?')) return;

    var partidos = obtenerPartidos();
    var nuevos = [];

    for (var i = 0; i < partidos.length; i++) {
        if (partidos[i].id !== id) {
            nuevos.push(partidos[i]);
        }
    }

    guardarPartidos(nuevos);
    renderFixture();
    renderResumen();

}

function renderFixture() {

    var partidos = obtenerPartidos();
    var contenedor = document.getElementById('tablaFixture');
    var filtro = document.getElementById('filtroCategoria').value;

    var filtrados = [];
    for (var i = 0; i < partidos.length; i++) {
        if (filtro === '' || partidos[i].categoria === filtro) {
            filtrados.push(partidos[i]);
        }
    }

    // Ordenar por fecha
    filtrados.sort(function(a, b) {
        return a.fecha > b.fecha ? 1 : -1;
    });

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p class="sinDatos">No hay partidos cargados todavía.</p>';
        return;
    }

    var html = '<table class="tablaEstilos">';
    html += '<tr>';
    html += '<th>Rival</th>';
    html += '<th>Fecha</th>';
    html += '<th>Hora</th>';
    html += '<th>Condición</th>';
    html += '<th>Categoría</th>';
    html += '<th>Resultado</th>';
    html += '<th></th>';
    html += '</tr>';

    for (var j = 0; j < filtrados.length; j++) {
        var p = filtrados[j];
        var badge = p.condicion === 'Local'
            ? '<span class="badgeLocal">Local</span>'
            : '<span class="badgeVisitante">Visitante</span>';

        html += '<tr>';
        html += '<td>vs ' + p.rival + '</td>';
        html += '<td>' + formatearFecha(p.fecha) + '</td>';
        html += '<td>' + p.hora + ' hs</td>';
        html += '<td>' + badge + '</td>';
        html += '<td>' + p.categoria + '</td>';
        html += '<td>' + p.resultado + '</td>';
        html += '<td><button class="btnEliminar" onclick="eliminarPartido(' + p.id + ')">🗑</button></td>';
        html += '</tr>';
    }

    html += '</table>';
    contenedor.innerHTML = html;

}


// ========================================
// REPORTES: RESUMEN DEL CLUB
// ========================================

function renderResumen() {

    var socios = obtenerSocios();
    var jugadores = obtenerJugadores();
    var partidos = obtenerPartidos();

    // Contar socios por plan
    var cantBasico = 0, cantFamiliar = 0, cantPremium = 0;
    for (var i = 0; i < socios.length; i++) {
        if (socios[i].plan === 'Básico') cantBasico++;
        if (socios[i].plan === 'Familiar') cantFamiliar++;
        if (socios[i].plan === 'Premium') cantPremium++;
    }

    // Contar partidos con resultado
    var conResultado = 0;
    for (var j = 0; j < partidos.length; j++) {
        if (partidos[j].resultado !== '-' && partidos[j].resultado !== '') conResultado++;
    }

    var contenedor = document.getElementById('resumenEstadisticas');

    var html = '';

    html += '<div class="resumenItem">';
    html += '<p>Total Socios</p>';
    html += '<strong>' + socios.length + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Jugadores en Plantel</p>';
    html += '<strong>' + jugadores.length + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Partidos Cargados</p>';
    html += '<strong>' + partidos.length + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Partidos con Resultado</p>';
    html += '<strong>' + conResultado + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Socios Plan Básico</p>';
    html += '<strong>' + cantBasico + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Socios Plan Familiar</p>';
    html += '<strong>' + cantFamiliar + '</strong>';
    html += '</div>';

    html += '<div class="resumenItem">';
    html += '<p>Socios Plan Premium</p>';
    html += '<strong>' + cantPremium + '</strong>';
    html += '</div>';

    contenedor.innerHTML = html;

}


// ========================================
// FORMULARIO DE CONTACTO
// ========================================

function enviarContacto(evento) {

    evento.preventDefault();

    document.getElementById('errContactoNombre').textContent = '';
    document.getElementById('errContactoEmail').textContent = '';
    document.getElementById('errContactoMensaje').textContent = '';

    var nombre = document.getElementById('contactoNombre').value.trim();
    var email = document.getElementById('contactoEmail').value.trim();
    var mensaje = document.getElementById('contactoMensaje').value.trim();

    var hayError = false;

    if (nombre.length < 2) {
        document.getElementById('errContactoNombre').textContent = 'Ingresá tu nombre.';
        hayError = true;
    }

    if (email === '' || email.indexOf('@') === -1) {
        document.getElementById('errContactoEmail').textContent = 'Ingresá un email válido.';
        hayError = true;
    }

    if (mensaje.length < 10) {
        document.getElementById('errContactoMensaje').textContent = 'El mensaje debe tener al menos 10 caracteres.';
        hayError = true;
    }

    if (hayError) return;

    document.getElementById('formContacto').reset();

    var msgOk = document.getElementById('mensajeContacto');
    msgOk.style.display = 'block';
    setTimeout(function() {
        msgOk.style.display = 'none';
    }, 4000);

}


// ========================================
// UTILIDADES
// ========================================

function formatearFecha(fechaStr) {
    // Recibe "YYYY-MM-DD" y devuelve "DD/MM/YYYY"
    if (!fechaStr) return '-';
    var partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}


// ========================================
// INICIO: cargar todo al abrir la página
// ========================================

window.onload = function() {

    actualizarContadorSocios();
    renderTablaSocios();
    renderTablaJugadores();
    renderFixture();
    renderResumen();
    actualizarPlantelDestacado();

};
