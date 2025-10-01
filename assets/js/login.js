document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com', '@canchas.cl', '@duocuc.cl'];
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            event.stopPropagation();
            
            let valido = true;

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const loginError = document.getElementById('login-error');
            const userEmail = emailInput.value.trim().toLowerCase();
            
            emailInput.classList.remove('is-invalid');
            passwordInput.classList.remove('is-invalid');
            loginError.classList.add('d-none');

            function emailDomainAllowed(email) {
                return allowedDomains.some(d => email.endsWith(d));
            }

            if (!userEmail || !emailDomainAllowed(userEmail) || userEmail.length > 100) {
                emailInput.classList.add('is-invalid');
                valido = false;
            }

            if (!passwordInput.value || passwordInput.value.length < 4 || passwordInput.value.length > 10) {
                passwordInput.classList.add('is-invalid');
                valido = false;
            }

            if (!valido) {
                loginError.textContent = "Error: Email inválido o contraseña no cumple (4-10 caracteres).";
                loginError.classList.remove('d-none');
                return; 
            }
            
            let redirectPage = 'index.html'; 

            if ((userEmail === 'admin@canchas.cl' || userEmail === 'admin@duocuc.cl') && passwordInput.value === '12345678') {
                redirectPage = 'admin.html'; 
                alert('Login exitoso. Redirigiendo a Panel de Administración.');
                // guardar sesión
                const userData = { email: userEmail, role: 'admin', loggedAt: new Date().toISOString() };
                localStorage.setItem('sessionUser', JSON.stringify(userData));
            } else if ((userEmail === 'vendedor@canchas.cl' || userEmail === 'vendedor@duocuc.cl') && passwordInput.value === '12345678') {
                redirectPage = 'perfil.html'; 
                alert('Login exitoso. Redirigiendo a Vista de Vendedor.');
                const userData = { email: userEmail, role: 'vendedor', loggedAt: new Date().toISOString() };
                localStorage.setItem('sessionUser', JSON.stringify(userData));
            } else if (passwordInput.value.length >= 4 && passwordInput.value.length <= 10) {
                redirectPage = 'index.html'; 
                alert('Login exitoso. Redirigiendo a la Tienda.');
                const userData = { email: userEmail, role: 'cliente', loggedAt: new Date().toISOString() };
                localStorage.setItem('sessionUser', JSON.stringify(userData));
            } else {
                loginError.textContent = "Usuario o contraseña incorrectos.";
                loginError.classList.remove('d-none');
                return;
            }

            window.location.href = redirectPage;
        });
    }
});


function validarRegistro(event) {
    event.preventDefault(); 
    event.stopPropagation();
    
    let valido = true;

    const rut = document.getElementById('rut');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const telefono = document.getElementById('telefono');
    const comuna = document.getElementById('comuna');
    const direccion = document.getElementById('direccion');
    
    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com', '@canchas.cl'];
    const phoneRegex = /^[0-9]*$/; 

    function emailDomainAllowed(email) {
        return allowedDomains.some(d => email.endsWith(d));
    }

    function marcarInvalido(input, condition) {
        if (condition) {
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
            valido = false;
        }
    }
    
    const rutVal = rut.value.trim();
    const rutOk = /^[0-9Kk]{7,9}$/.test(rutVal);
    marcarInvalido(rut, rutVal !== '' && rutOk);

    marcarInvalido(nombre, nombre && nombre.value.trim() !== '' && nombre.value.length <= 50);
    if (apellido) marcarInvalido(apellido, apellido.value.trim() !== '' && apellido.value.length <= 100);

    const emailVal = email.value.trim().toLowerCase();
    marcarInvalido(email, emailVal !== '' && emailDomainAllowed(emailVal) && emailVal.length <= 100);

    marcarInvalido(password, password.value.length >= 4 && password.value.length <= 10);

    if (telefono && telefono.value.trim() !== '') {
        marcarInvalido(telefono, phoneRegex.test(telefono.value) && telefono.value.length <= 15);
    } else if (telefono) {
        telefono.classList.remove('is-invalid');
    }

    if (comuna) marcarInvalido(comuna, comuna.value !== ''); 
    if (direccion) marcarInvalido(direccion, direccion.value.trim() !== '' && direccion.value.length <= 300);

    if (valido) {
        alert('Registro exitoso. Ya puedes iniciar sesión.');
        window.location.href = 'login.html'; 
        return true;
    } else {
        alert('Error: Por favor, revisa todos los campos obligatorios y sus restricciones.');
        return false;
    }
}


function confirmarReserva() {
    const sessionRaw = localStorage.getItem('sessionUser');
    if (!sessionRaw) {
        alert('Debes iniciar sesión para confirmar una reserva.');
        window.location.href = 'login.html';
        return false;
    }
    const sessionUser = JSON.parse(sessionRaw);
    const fecha = document.getElementById('reservaFechaInput') ? document.getElementById('reservaFechaInput').value : '';
    const hora = document.getElementById('reservaHoraInput') ? document.getElementById('reservaHoraInput').value : '';
    const canchaId = document.getElementById('reservaCanchaSelectMini') ? document.getElementById('reservaCanchaSelectMini').value : '';
    if (!fecha || !hora) {
        alert('Seleccione día y hora para su reserva.');
        return false;
    }

    const reservasRaw = localStorage.getItem('admin_reservas');
    const reservas = reservasRaw ? JSON.parse(reservasRaw) : [];
    const id = 'r' + (Date.now()).toString(36).slice(-6);
    let canchaNombre = null;
    let canchaPrecio = 0;
    const canchaSelect = document.getElementById('reservaCanchaSelectMini');
    if (canchaSelect && canchaSelect.options[canchaSelect.selectedIndex]) {
        canchaNombre = canchaSelect.options[canchaSelect.selectedIndex].textContent.split(' - $')[0];
        canchaPrecio = Number(canchaSelect.options[canchaSelect.selectedIndex].dataset.precio || 0);
    }

    const reserva = {
        id,
        clienteEmail: sessionUser.email,
        canchaId: canchaId || null,
        canchaNombre: canchaNombre,
        precio: canchaPrecio,
        fecha,
        hora,
        estado: 'pendiente',
        createdAt: new Date().toISOString()
    };
    reservas.push(reserva);
    localStorage.setItem('admin_reservas', JSON.stringify(reservas));

    try {
        if (typeof renderReservaHistory === 'function') renderReservaHistory();
    } catch (e) { console.warn('No se pudo actualizar historial en memoria', e); }
    window.location.href = 'confirmacion.html';
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    const reservaClienteName = document.getElementById('reservaClienteName');
    const sessionRaw = localStorage.getItem('sessionUser');
    if (reservaClienteName) {
        if (sessionRaw) {
            try {
                const sessionUser = JSON.parse(sessionRaw);
                reservaClienteName.textContent = sessionUser.email;
            } catch (e) {
                console.warn('Error parseando sessionUser', e);
            }
        } else {
            reservaClienteName.textContent = 'Usuario no identificado';
        }
    }

    const confirmarBtn = document.getElementById('confirmarReservaBtn');
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', (e) => {
            confirmarReserva();
        });
    }
    try {
        const canchaSelect = document.getElementById('reservaCanchaSelectMini');
        if (canchaSelect) {
            canchaSelect.innerHTML = '';
            const raw = localStorage.getItem('admin_canchas') || localStorage.getItem('admin_canchas');
            const canchas = raw ? JSON.parse(raw) : [];
            if (canchas.length === 0) {
                canchaSelect.innerHTML = '<option value="">-- No hay canchas registradas --</option>';
            } else {
                canchas.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id || c.code || c.nombre;
                    opt.textContent = `${c.nombre} - $${c.precio || 0}`;
                    opt.dataset.precio = c.precio || 0;
                    canchaSelect.appendChild(opt);
                });
            }

            const fechaInput = document.getElementById('reservaFechaInput');
            const horaInput = document.getElementById('reservaHoraInput');
            function updateSummary() {
                const selected = canchaSelect.options[canchaSelect.selectedIndex];
                const nombre = selected ? selected.textContent.split(' - $')[0] : '-';
                const precio = selected ? Number(selected.dataset.precio || 0) : 0;
                document.getElementById('summaryCanchaName').textContent = nombre;
                const fecha = fechaInput ? fechaInput.value : '';
                const hora = horaInput ? horaInput.value : '';
                document.getElementById('summaryHorario').textContent = fecha && hora ? `Horario: ${fecha} ${hora}` : 'Horario: -';
                document.getElementById('summaryPrice').textContent = `$${precio.toLocaleString()}`;
                const service = Number((document.getElementById('summaryService').textContent || '1500').replace(/[^0-9]/g,'')) || 0;
                document.getElementById('summaryTotal').textContent = `$${(precio + service).toLocaleString()}`;
            }
            canchaSelect.addEventListener('change', updateSummary);
            if (document.getElementById('reservaFechaInput')) document.getElementById('reservaFechaInput').addEventListener('change', updateSummary);
            if (document.getElementById('reservaHoraInput')) document.getElementById('reservaHoraInput').addEventListener('change', updateSummary);
            updateSummary();
        }
    } catch (e) {
        console.error('Error populating cancha select', e);
    }
    function formatCurrency(n) {
        return `$${Number(n || 0).toLocaleString()}`;
    }

    function renderReservaHistory() {
        const container = document.getElementById('reservasHistoryContainer');
        if (!container) return;
        const sessionRaw = localStorage.getItem('sessionUser');
        if (!sessionRaw) {
            container.innerHTML = '<p class="text-muted">Debes iniciar sesión para ver tu historial de reservas.</p>';
            return;
        }
        let sessionUser;
        try { sessionUser = JSON.parse(sessionRaw); } catch (e) { sessionUser = null; }
        if (!sessionUser) {
            container.innerHTML = '<p class="text-muted">Usuario inválido.</p>';
            return;
        }

        const raw = localStorage.getItem('admin_reservas');
        const reservas = raw ? JSON.parse(raw) : [];
        const mine = reservas.filter(r => r.clienteEmail && r.clienteEmail.toLowerCase() === sessionUser.email.toLowerCase());

        if (!mine || mine.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes reservas previas.</p>';
            return;
        }

        // build table
        const table = document.createElement('table');
        table.className = 'table table-striped mb-0';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Fecha</th><th>Hora</th><th>Cancha</th><th>Precio</th><th>Estado</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        // sort by fecha+hora desc
        mine.sort((a,b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
        mine.forEach(r => {
            const tr = document.createElement('tr');
            const fechaTd = document.createElement('td'); fechaTd.textContent = r.fecha || '-';
            const horaTd = document.createElement('td'); horaTd.textContent = r.hora || '-';
            const canchaTd = document.createElement('td'); canchaTd.textContent = r.canchaNombre || r.canchaId || '-';
            const precioTd = document.createElement('td'); precioTd.textContent = formatCurrency(r.precio);
            const estadoTd = document.createElement('td'); estadoTd.textContent = r.estado || '-';
            tr.appendChild(fechaTd);
            tr.appendChild(horaTd);
            tr.appendChild(canchaTd);
            tr.appendChild(precioTd);
            tr.appendChild(estadoTd);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
    }

    try { renderReservaHistory(); } catch (e) { console.error('Error rendering reserva history', e); }
});