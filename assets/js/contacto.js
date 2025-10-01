document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const result = document.getElementById('contactResult');
    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

    function emailAllowed(email) {
        if (!email) return false;
        const lower = email.trim().toLowerCase();
        return allowedDomains.some(d => lower.endsWith(d));
    }

    function showMessage(msg, type = 'success') {
        result.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const message = document.getElementById('contactMessage');

        let valid = true;
        // name
        if (!name.value.trim() || name.value.trim().length > 100) {
            name.classList.add('is-invalid');
            valid = false;
        } else {
            name.classList.remove('is-invalid');
        }
        // email
        if (!emailAllowed(email.value) || email.value.trim().length > 100) {
            email.classList.add('is-invalid');
            valid = false;
        } else {
            email.classList.remove('is-invalid');
        }
        // message
        if (!message.value.trim() || message.value.trim().length > 500) {
            message.classList.add('is-invalid');
            valid = false;
        } else {
            message.classList.remove('is-invalid');
        }

        if (!valid) {
            showMessage('Por favor corrija los errores en el formulario.', 'danger');
            return;
        }

        // save message
        try {
            const raw = localStorage.getItem('contact_messages');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ id: 'm' + Date.now().toString(36).slice(-6), name: name.value.trim(), email: email.value.trim().toLowerCase(), message: message.value.trim(), createdAt: new Date().toISOString() });
            localStorage.setItem('contact_messages', JSON.stringify(arr));
            form.reset();
            showMessage('Mensaje enviado. Gracias por contactarnos.');
        } catch (err) {
            console.error('Error saving contact message', err);
            showMessage('Ocurrió un error al enviar. Intente nuevamente.', 'danger');
        }
    });
});
