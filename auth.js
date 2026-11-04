/**
 * Supabase Authentication API Engine
 */

// Initialize Supabase Client using the credentials from config.js
const SUPABASE_URL = window.ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Registration Function
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Registration failed: " + error.message);
        return null;
    }

    alert("Success! Check your email for a confirmation link (if enabled), or log in directly.");
    return data.user;
}

// Login Function
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login failed: " + error.message);
        return null;
    }

    console.log("Logged in successfully:", data.user.email);
    return data.user;
}

// Session Check Helper
async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
}