/**
 * Supabase Authentication & Cloud Save Integration
 */

// 1. Initialize Supabase Client
const SUPABASE_URL = 'https://hzophibjdftkduxjcopk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_V04uraUJ00_sxlIsrxM68w_bYjGEwe0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Authentication Functions
async function signUpUser(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        alert("Sign-up failed: " + error.message);
        return null;
    }
    alert("Check your email for confirmation or log in if email auth is disabled.");
    return data.user;
}

async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Login failed: " + error.message);
        return null;
    }
    console.log("Logged in successfully:", data.user.email);
    return data.user;
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        location.reload(); // Refresh game state on logout
    }
}

async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
}

// 3. Cloud Save / High Score Functions
async function saveGameProgress(playerStats) {
    const user = await getCurrentUser();
    if (!user) {
        console.warn("User not logged in. Progress not saved to cloud.");
        return;
    }

    const { error } = await supabase
        .from('player_saves')
        .upsert({ 
            user_id: user.id, 
            stats: playerStats, 
            updated_at: new Date() 
        }, { onConflict: 'user_id' });

    if (error) {
        console.error("Failed to save progress:", error.message);
    } else {
        console.log("Game progress successfully saved to Supabase!");
    }
}

async function loadGameProgress() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('player_saves')
        .select('stats')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.log("No existing save found, starting fresh.");
        return null;
    }

    return data ? data.stats : null;
}