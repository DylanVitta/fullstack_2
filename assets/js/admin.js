// admin.js - CRUD simple en localStorage para canchas, usuarios y reservas
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEYS = {
        canchas: 'admin_canchas',
        usuarios: 'admin_usuarios',
        reservas: 'admin_reservas'
    };

    // datos de ejemplo iniciales
    function seedData() {
        if (!localStorage.getItem(STORAGE_KEYS.canchas)) {
            const canchas = [
                { id: 'c1', nombre: 'Cancha N°1 (7v7)', precio: 25000 },
                { id: 'c2', nombre: 'Cancha N°2 (5v5)', precio: 20000 }
            ];
            localStorage.setItem(STORAGE_KEYS.canchas, JSON.stringify(canchas));
        }
        if (!localStorage.getItem(STORAGE_KEYS.usuarios)) {
            const usuarios = [
                { id: 'u1', email: 'admin@canchas.cl', nombre: 'Admin Duoc', role: 'admin' },
                { id: 'u2', email: 'vendedor@canchas.cl', nombre: 'Vendedor Jefe', role: 'vendedor' },
                { id: 'u3', email: 'cliente@test.cl', nombre: 'Cliente Prueba', role: 'cliente' }
            ];
            localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(usuarios));
        }
        if (!localStorage.getItem(STORAGE_KEYS.reservas)) {
            const reservas = [
                { id: 'r1', clienteId: 'u3', canchaId: 'c1', fecha: '2025-10-01', total: 25000, estado: 'pagada' },
                { id: 'r2', clienteId: 'u3', canchaId: 'c2', fecha: '2025-10-05', total: 30000, estado: 'pendiente' }
            ];
            localStorage.setItem(STORAGE_KEYS.reservas, JSON.stringify(reservas));
        }
    }

    function read(key) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    }

    function write(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Renderers
    // --- Debug panel helper (visible on-screen) ---
    function ensureDebugPanel() {
        if (document.getElementById('adminDebugLog')) return;
        const panel = document.createElement('div');
        panel.id = 'adminDebugLog';
        panel.style.position = 'fixed';
        panel.style.right = '12px';
        panel.style.bottom = '12px';
        panel.style.width = '320px';
        panel.style.maxHeight = '40vh';
        panel.style.overflow = 'auto';
        panel.style.background = 'rgba(0,0,0,0.75)';
        panel.style.color = 'white';
        panel.style.fontSize = '12px';
        panel.style.padding = '8px';
        panel.style.zIndex = 99999;
        panel.style.borderRadius = '6px';
        panel.innerHTML = '<strong>ADMIN DEBUG</strong><div id="adminDebugList" style="margin-top:6px"></div>';
        document.body.appendChild(panel);
    }

    function appendDebug(msg) {
        try {
            console.log(msg);
            ensureDebugPanel();
            const list = document.getElementById('adminDebugList');
            if (!list) return;
            const el = document.createElement('div');
            el.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
            el.style.marginBottom = '4px';
            list.insertBefore(el, list.firstChild);
            while (list.children.length > 30) list.removeChild(list.lastChild);
        } catch (e) {
            console.error('appendDebug error', e);
        }
    }
    function renderCanchasList() {
        const list = document.querySelector('#canchas .list-group');
        if (!list) return;
        const canchas = read(STORAGE_KEYS.canchas);
        list.innerHTML = '';
        canchas.forEach(c => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `${c.nombre} <div><span class="badge bg-primary rounded-pill me-2">${c.precio}</span><button class="btn btn-sm btn-warning me-1" data-id="${c.id}" data-action="edit-c">Editar</button><button class="btn btn-sm btn-danger" data-id="${c.id}" data-action="del-c">Eliminar</button></div>`;
            list.appendChild(li);
        });
    }

    function renderUsuariosTable() {
        const tbody = document.querySelector('#usuarios table tbody');
        if (!tbody) return;
        const usuarios = read(STORAGE_KEYS.usuarios);
        tbody.innerHTML = '';
        usuarios.forEach((u, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i+1}</td><td>${u.email}</td><td>${u.nombre || ''}</td><td><span class="badge ${u.role==='admin' ? 'bg-danger' : u.role==='vendedor' ? 'bg-primary' : 'bg-secondary'}">${u.role.toUpperCase()}</span></td><td><button class="btn btn-sm btn-warning me-1" data-id="${u.id}" data-action="change-role">Cambiar Rol</button><button class="btn btn-sm btn-danger" data-id="${u.id}" data-action="del-u">Eliminar</button></td>`;
            tbody.appendChild(tr);
        });
    }

    function renderReservasTable() {
        const tbody = document.querySelector('#reservas table tbody');
        if (!tbody) return;
        const reservas = read(STORAGE_KEYS.reservas);
        const usuarios = read(STORAGE_KEYS.usuarios);
        const canchas = read(STORAGE_KEYS.canchas);
        tbody.innerHTML = '';
        reservas.forEach(r => {
            // resolver cliente (acepta clienteId o clienteEmail)
            let cliente = { email: '—' };
            if (r.clienteId) {
                cliente = usuarios.find(u => u.id === r.clienteId) || { email: r.clienteEmail || '—' };
            } else if (r.clienteEmail) {
                cliente = usuarios.find(u => u.email === r.clienteEmail) || { email: r.clienteEmail };
            }
            // resolver cancha
            const cancha = canchas.find(c => c.id === (r.canchaId || r.cancha)) || { nombre: r.canchaNombre || '—' };
            const tr = document.createElement('tr');
            const displayFecha = r.fecha ? `${r.fecha}${r.hora ? ' ' + r.hora : ''}` : '—';
            const displayTotal = (r.total || 0);
            tr.innerHTML = `<td>${r.id}</td><td>${cliente.email}</td><td>${displayFecha}</td><td>$${displayTotal.toLocaleString()}</td><td><span class="badge ${r.estado==='pagada' ? 'bg-success' : 'bg-warning text-dark'}">${r.estado}</span></td><td><button class="btn btn-sm btn-info" data-id="${r.id}" data-action="detalle-r">Detalle</button> <button class="btn btn-sm btn-secondary" data-id="${r.id}" data-action="toggle-status">Cambiar Estado</button> <button class="btn btn-sm btn-danger" data-id="${r.id}" data-action="delete-r">Eliminar</button></td>`;
            tbody.appendChild(tr);
        });
    }

    // Handlers
    function handleCreateCancha(event) {
        event.preventDefault();
        const nombre = document.getElementById('nombreCancha').value.trim();
        const precio = Number(document.getElementById('precio').value) || 0;
        if (!nombre) return alert('Ingrese nombre de la cancha');
        const canchas = read(STORAGE_KEYS.canchas);
        const id = 'c' + (Date.now()).toString(36).slice(-6);
        canchas.push({ id, nombre, precio });
        write(STORAGE_KEYS.canchas, canchas);
        renderCanchasList();
        alert('Cancha creada');
    }

    function handleUsuariosClick(e) {
        const btn = e.target.closest('button');
    console.log('[admin] handleUsuariosClick invoked', { target: e.target.tagName, btn: btn ? btn.outerHTML : null });
    appendDebug('[admin] handleUsuariosClick invoked ' + (btn ? btn.dataset.action + ' id=' + (btn.dataset.id||'') : 'no-btn'));
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'change-role') {
            const usuarios = read(STORAGE_KEYS.usuarios);
            const user = usuarios.find(u => u.id === id);
            if (!user) return;
            const nuevo = prompt('Ingrese nuevo rol (admin|vendedor|cliente):', user.role) || user.role;
            if (!['admin','vendedor','cliente'].includes(nuevo)) return alert('Rol inválido');
            user.role = nuevo;
            write(STORAGE_KEYS.usuarios, usuarios);
            renderUsuariosTable();
            alert('Rol actualizado');
        } else if (action === 'del-u') {
            if (!confirm('Eliminar usuario?')) return;
            let usuarios = read(STORAGE_KEYS.usuarios);
            usuarios = usuarios.filter(u => u.id !== id);
            write(STORAGE_KEYS.usuarios, usuarios);
            renderUsuariosTable();
            renderReservaSelectors();
            alert('Usuario eliminado');
        }
    }

    // Crear usuario
    function handleCreateUser(e) {
        e.preventDefault();
        const email = document.getElementById('userEmail').value.trim().toLowerCase();
        const nombre = document.getElementById('userName').value.trim();
        const role = document.getElementById('userRole').value;
        if (!email) return alert('Ingrese email');
        const usuarios = read(STORAGE_KEYS.usuarios);
        if (usuarios.find(u => u.email === email)) return alert('Usuario ya existe');
        const id = 'u' + (Date.now()).toString(36).slice(-6);
        usuarios.push({ id, email, nombre, role });
        write(STORAGE_KEYS.usuarios, usuarios);
        renderUsuariosTable();
        renderReservaSelectors();
        document.getElementById('createUserForm').reset();
        alert('Usuario creado');
    }

    function handleCanchasClick(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const canchas = read(STORAGE_KEYS.canchas);
        if (action === 'del-c') {
            if (!confirm('Eliminar cancha?')) return;
            const idx = canchas.findIndex(c => c.id === id);
            if (idx >= 0) {
                canchas.splice(idx,1);
                write(STORAGE_KEYS.canchas, canchas);
                renderCanchasList();
            }
        } else if (action === 'edit-c') {
            const cancha = canchas.find(c => c.id === id);
            if (!cancha) return;
            const nuevoNombre = prompt('Nombre:', cancha.nombre) || cancha.nombre;
            const nuevoPrecio = Number(prompt('Precio:', cancha.precio) || cancha.precio);
            cancha.nombre = nuevoNombre;
            cancha.precio = nuevoPrecio;
            write(STORAGE_KEYS.canchas, canchas);
            renderCanchasList();
            alert('Cancha actualizada');
        }
    }

    function handleReservasClick(e) {
        const btn = e.target.closest('button');
    console.log('[admin] handleReservasClick invoked', { target: e.target.tagName, btn: btn ? btn.outerHTML : null });
    appendDebug('[admin] handleReservasClick invoked ' + (btn ? btn.dataset.action + ' id=' + (btn.dataset.id||'') : 'no-btn'));
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const reservas = read(STORAGE_KEYS.reservas);
        const res = reservas.find(r => r.id === id);
        if (!res) return;
        if (action === 'toggle-status') {
            res.estado = res.estado === 'pagada' ? 'pendiente' : 'pagada';
            write(STORAGE_KEYS.reservas, reservas);
            renderReservasTable();
            alert('Estado actualizado');
        } else if (action === 'detalle-r') {
            alert(JSON.stringify(res, null, 2));
        }
    }

    // Crear reserva
    function handleCreateReserva(e) {
        e.preventDefault();
        const clienteId = document.getElementById('reservaClienteSelect').value;
        const canchaId = document.getElementById('reservaCanchaSelect').value;
        const fecha = document.getElementById('reservaFecha').value;
        const total = Number(document.getElementById('reservaTotal').value) || 0;
        const estado = document.getElementById('reservaEstado').value;
        if (!clienteId || !canchaId || !fecha) return alert('Complete los campos necesarios');
        const reservas = read(STORAGE_KEYS.reservas);
        const id = 'r' + (Date.now()).toString(36).slice(-6);
        reservas.push({ id, clienteId, canchaId, fecha, total, estado });
        write(STORAGE_KEYS.reservas, reservas);
        renderReservasTable();
        document.getElementById('createReservaForm').reset();
        alert('Reserva creada');
    }

    function handleReservasTableClick(e) {
        const btn = e.target.closest('button');
    console.log('[admin] handleReservasTableClick invoked', { target: e.target.tagName, btn: btn ? btn.outerHTML : null });
    appendDebug('[admin] handleReservasTableClick invoked ' + (btn ? btn.dataset.action + ' id=' + (btn.dataset.id||'') : 'no-btn'));
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'delete-r') {
            if (!confirm('Eliminar reserva?')) return;
            let reservas = read(STORAGE_KEYS.reservas);
            reservas = reservas.filter(r => r.id !== id);
            write(STORAGE_KEYS.reservas, reservas);
            renderReservasTable();
            alert('Reserva eliminada');
        }
    }

    // Helper: poblar selects de reservas
    function renderReservaSelectors() {
        const clientes = read(STORAGE_KEYS.usuarios);
        const canchas = read(STORAGE_KEYS.canchas);
        const clienteSelect = document.getElementById('reservaClienteSelect');
        const canchaSelect = document.getElementById('reservaCanchaSelect');
        if (clienteSelect) {
            clienteSelect.innerHTML = '';
            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.email;
                clienteSelect.appendChild(opt);
            });
        }
        if (canchaSelect) {
            canchaSelect.innerHTML = '';
            canchas.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.nombre} - $${c.precio}`;
                canchaSelect.appendChild(opt);
            });
        }
    }

    // Init
    seedData();
    renderCanchasList();
    renderUsuariosTable();
    renderReservasTable();
    renderReservaSelectors();

    try {
        const tabButtons = document.querySelectorAll('#adminTabs [data-bs-toggle="tab"]');
        if (tabButtons && tabButtons.length) {
            tabButtons.forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    try {
                        ev.preventDefault();
                        // prefer native Bootstrap Tab if available
                        if (window.bootstrap && window.bootstrap.Tab) {
                            const t = new bootstrap.Tab(btn);
                            t.show();
                            appendDebug('[admin] bootstrap.Tab.show() called for ' + (btn.id || btn.getAttribute('data-bs-target')));
                        } else {
                            // manual fallback: toggle classes
                            const targetSelector = btn.getAttribute('data-bs-target') || btn.dataset.bsTarget;
                            const target = targetSelector ? document.querySelector(targetSelector) : null;
                            if (target) {
                                document.querySelectorAll('#adminTabsContent .tab-pane').forEach(p => p.classList.remove('show','active'));
                                target.classList.add('show','active');
                                // update active class on buttons
                                document.querySelectorAll('#adminTabs .nav-link').forEach(nb => nb.classList.remove('active'));
                                btn.classList.add('active');
                                appendDebug('[admin] manual tab toggle for ' + targetSelector);
                            }
                        }
                    } catch (err) {
                        console.error('Tab click handler error', err);
                        appendDebug('Tab click handler error: ' + (err && err.message));
                    }
                });
            });
        }
    } catch (e) {
        console.error('Error wiring tab fallback', e);
    }

    // eventos
    const createForm = document.querySelector('#canchas form');
    if (createForm) createForm.addEventListener('submit', handleCreateCancha);
    const canchasList = document.querySelector('#canchas .list-group');
    if (canchasList) canchasList.addEventListener('click', handleCanchasClick);
    const usuariosTable = document.querySelector('#usuarios table');
    if (usuariosTable) usuariosTable.addEventListener('click', handleUsuariosClick);
    const reservasTable = document.querySelector('#reservas table');
    if (reservasTable) {
        reservasTable.addEventListener('click', handleReservasClick);
        reservasTable.addEventListener('click', handleReservasTableClick);
    }
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);
    const createReservaForm = document.getElementById('createReservaForm');
    if (createReservaForm) createReservaForm.addEventListener('submit', handleCreateReserva);

    // Delegated routing: ensure buttons inside tab panes (dynamic content) are handled
    const adminTabsContent = document.getElementById('adminTabsContent');
    if (adminTabsContent) {
        adminTabsContent.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            if (!action) return;

            // route to the appropriate handler based on known actions
            const userActions = ['change-role', 'del-u'];
            const canchaActions = ['del-c', 'edit-c'];
            const reservaActions = ['toggle-status', 'detalle-r', 'delete-r'];

            if (userActions.includes(action)) return handleUsuariosClick(e);
            if (canchaActions.includes(action)) return handleCanchasClick(e);
            if (reservaActions.includes(action)) {
                // delete-r should be handled by reservas table delete handler
                if (action === 'delete-r') return handleReservasTableClick(e);
                return handleReservasClick(e);
            }
        });
    }

    // Global delegated listener as fallback: catch any element with data-action
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.dataset.action;
        if (!action) return;
    console.log('[admin] global router detected action', action, { outer: el.outerHTML });
    appendDebug('[admin] global router detected action ' + action);

        const userActions = ['change-role', 'del-u'];
        const canchaActions = ['del-c', 'edit-c'];
        const reservaActions = ['toggle-status', 'detalle-r', 'delete-r'];

        // Build a synthetic event where target is the clicked element so handlers work
        const syntheticEvent = { target: el, stopPropagation: () => {}, preventDefault: () => {} };

        if (userActions.includes(action)) return handleUsuariosClick(syntheticEvent);
        if (canchaActions.includes(action)) return handleCanchasClick(syntheticEvent);
        if (reservaActions.includes(action)) {
            if (action === 'delete-r') return handleReservasTableClick(syntheticEvent);
            return handleReservasClick(syntheticEvent);
        }
    });
});
