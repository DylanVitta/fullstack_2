document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
            function emailDomainAllowed(email) { return allowedDomains.some(d => email.endsWith(d)); }

            let isValid = true;
            const name = document.getElementById('name');
            const errorName = document.getElementById('error-name');
            if (!name.value.trim() || name.value.trim().length > 100) {
                errorName.style.display = 'block';
                isValid = false;
            } else {
                errorName.style.display = 'none';
            }

            const email = document.getElementById('email');
            const errorEmail = document.getElementById('error-email');
            const emailVal = email.value.trim().toLowerCase();
            if (!emailVal || emailVal.length > 100 || !emailDomainAllowed(emailVal)) {
                errorEmail.style.display = 'block';
                isValid = false;
            } else {
                errorEmail.style.display = 'none';
            }
            
            const message = document.getElementById('message');
            const errorMessage = document.getElementById('error-message');
            if (!message.value.trim() || message.value.trim().length > 500) {
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                errorMessage.style.display = 'none';
            }

            if (isValid) {
                alert('¡Formulario enviado con éxito!');
                form.submit(); 
            } else {
                alert('Por favor, corrige los errores antes de enviar.');
            }
        });
    }
});