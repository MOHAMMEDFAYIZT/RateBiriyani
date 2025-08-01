document.addEventListener('DOMContentLoaded', () => {
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    const codeSection = document.getElementById('codeSection');
    const messageDiv = document.getElementById('loginMessage');
    const emailInput = document.getElementById('loginEmail');
    const codeInput = document.getElementById('verificationCode');

    // Clear verification state when email changes
    emailInput.addEventListener('input', () => {
        codeSection.classList.add('hidden');
        messageDiv.textContent = '';
    });

    sendCodeBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        
        if (!email.endsWith('@gectcr.ac.in')) {
            showMessage('Please use your GECTCR email', 'error');
            return;
        }

        try {
            // Request new code from server
            const response = await fetch('/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('DEBUG: Your verification code is:', data.code);
                showMessage('Verification code sent', 'success');
                codeSection.classList.remove('hidden');
                codeInput.value = '';
                codeInput.focus();
            } else {
                throw new Error(data.error || 'Failed to send code');
            }
        } catch (error) {
            showMessage(error.message, 'error');
            console.error('Error:', error);
        }
    });

    verifyBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const code = codeInput.value.trim();

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok && data.verified) {
                localStorage.setItem('biriyaniAuth', email);
                window.location.href = '/index.html';
            } else {
                throw new Error(data.error || 'Invalid verification code');
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.textContent === text) {
                    messageDiv.textContent = '';
                }
            }, 5000);
        }
    }
});