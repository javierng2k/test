/**
 * Authentication UI Controller
 * Manages Auth Modals, Form Inputs, and User Feedback.
 */

// DOM Cache for Auth UI
const AuthUI = {
    modal: document.getElementById('signup-modal'),
    emailInput: document.getElementById('signup-email'),
    passwordInput: document.getElementById('signup-password'),
    btnSubmit: document.getElementById('btn-submit-signup'),
    btnClose: document.getElementById('btn-close-signup'),
    btnOpen: document.getElementById('btn-open-signup') // Optional button in options/header
};

// Modal Controls
function toggleAuthModal(show = null) {
    if (!AuthUI.modal) return;
    if (show === true) {
        AuthUI.modal.classList.remove('hidden');
    } else if (show === false) {
        AuthUI.modal.classList.add('hidden');
    } else {
        AuthUI.modal.classList.toggle('hidden');
    }
}

// Event Bindings
if (AuthUI.btnSubmit) {
    AuthUI.btnSubmit.addEventListener('click', async () => {
        const email = AuthUI.emailInput.value.trim();
        const password = AuthUI.passwordInput.value.trim();

        if (!email || !password) {
            alert("Please fill in both Email and Password fields.");
            return;
        }

        AuthUI.btnSubmit.disabled = true;
        AuthUI.btnSubmit.textContent = "Registering...";

        // Call the registration API function defined in auth.js
        const user = await registerUser(email, password);

        AuthUI.btnSubmit.disabled = false;
        AuthUI.btnSubmit.textContent = "Register";

        if (user) {
            AuthUI.emailInput.value = '';
            AuthUI.passwordInput.value = '';
            toggleAuthModal(false);
        }
    });
}

if (AuthUI.btnClose) {
    AuthUI.btnClose.addEventListener('click', () => toggleAuthModal(false));
}

if (AuthUI.btnOpen) {
    AuthUI.btnOpen.addEventListener('click', () => toggleAuthModal(true));
}