import { reactive } from 'vue'

export const store = reactive({
    user: '',
    authToken: '', // Speichern des Auth Tokens statt des Passworts
    loggedIn: false,
    backendUrl: import.meta.env.VITE_API_BASE_URL,

    // Initialisierung aus localStorage
    init() {
        const savedToken = localStorage.getItem("authToken");
        if (savedToken) {
            this.authToken = savedToken;
            this.loggedIn = true;
        }
    },

    logout() {
        this.user = '';
        this.authToken = ''; // Das Auth Token beim Logout löschen
        this.loggedIn = false;
        localStorage.removeItem("authToken");
    }
});

store.init();
