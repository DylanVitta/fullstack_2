document.addEventListener('DOMContentLoaded', () => {
    function getSession() {
        try {
            const raw = localStorage.getItem('sessionUser');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Error parsing sessionUser from localStorage', e);
            return null;
        }
    }

    function renderNavbarSession() {
        const session = getSession();
        // buscamos el contenedor del nav (ul.navbar-nav)
        const nav = document.querySelector('.navbar-nav');
        if (!nav) return;

        // si no hay sesión, aseguramos que exista el enlace a login
        if (!session) {
            // si ya existe un botón de login, nada que hacer
            const hasLogin = nav.querySelector('a[href="login.html"]');
            if (!hasLogin) {
                const li = document.createElement('li');
                li.className = 'nav-item ms-lg-3';
                li.innerHTML = `
                    <a class="nav-link btn btn-outline-primary" href="login.html">
                        <i class="bi bi-person-fill"></i> Iniciar Sesión
                    </a>`;
                nav.appendChild(li);
            }
            return;
        }

        // si hay sesión, reemplazamos/ocultamos el enlace de login y mostramos dropdown con email y logout
        // eliminamos cualquier enlace directo a login
        nav.querySelectorAll('a[href="login.html"]').forEach(a => a.parentElement && a.parentElement.remove());

        // crear elemento de sesión
        const li = document.createElement('li');
        li.className = 'nav-item dropdown ms-lg-3';
        li.id = 'session-menu';
        const displayEmail = session.email || 'Usuario';
        li.innerHTML = `
            <a class="nav-link dropdown-toggle btn btn-outline-light text-dark" href="#" id="navbarSessionLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-fill"></i> ${displayEmail}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarSessionLink">
                <li><a class="dropdown-item" href="#">Mi Perfil</a></li>
                <li><a class="dropdown-item" href="reservas.html">Mis Reservas</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button id="logoutBtn" class="dropdown-item text-danger">Cerrar Sesión</button></li>
            </ul>`;

        nav.appendChild(li);

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('sessionUser');
                // opcional: redirigir a inicio
                window.location.href = 'index.html';
            });
        }
    }

    renderNavbarSession();

    // protección básica de rutas: si estamos en admin.html y no hay sesión admin, redirigir
    try {
        const path = window.location.pathname.split('/').pop();
        if (path === 'admin.html') {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                // no autorizado -> volver a inicio
                window.location.href = 'index.html';
            }
        }
    } catch (e) {
        console.error('Error verificando permisos de ruta', e);
    }
    // --- Render Perfil: datos y reservas del usuario ---
    try {
        const currentPath = window.location.pathname.split('/').pop();
        if (currentPath === 'perfil.html') {
            const session = getSession();
            // si no hay sesión, redirigir a login
            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            const nombreEl = document.getElementById('perfilNombre');
            const emailEl = document.getElementById('perfilEmail');
            const comunaEl = document.getElementById('perfilComuna');
            if (emailEl) emailEl.textContent = session.email || '-';
            if (nombreEl) nombreEl.textContent = session.name || session.nombre || '-';
            if (comunaEl) comunaEl.textContent = session.comuna || '-';

            function formatCurrency(n) { return `$${Number(n || 0).toLocaleString()}`; }
            function renderPerfilReservas() {
                const container = document.getElementById('perfilReservasContainer');
                if (!container) return;
                const raw = localStorage.getItem('admin_reservas');
                const reservas = raw ? JSON.parse(raw) : [];
                const mine = reservas.filter(r => r.clienteEmail && r.clienteEmail.toLowerCase() === session.email.toLowerCase());
                if (!mine || mine.length === 0) {
                    container.innerHTML = '<p class="text-muted">No tienes reservas registradas.</p>';
                    return;
                }
                const table = document.createElement('table');
                table.className = 'table table-sm table-striped mb-0';
                const thead = document.createElement('thead');
                thead.innerHTML = '<tr><th>Fecha</th><th>Hora</th><th>Cancha</th><th>Precio</th><th>Estado</th></tr>';
                table.appendChild(thead);
                const tbody = document.createElement('tbody');
                mine.sort((a,b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
                mine.forEach(r => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${r.fecha || '-'}</td>
                        <td>${r.hora || '-'}</td>
                        <td>${r.canchaNombre || r.canchaId || '-'}</td>
                        <td>${formatCurrency(r.precio)}</td>
                        <td>${r.estado || '-'}</td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                container.innerHTML = '';
                container.appendChild(table);
            }
            renderPerfilReservas();
        }
    } catch (e) {
        console.error('Error renderizando perfil/reservas', e);
    }
});
