import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import {store} from "./store.ts";
import 'primeicons/primeicons.css';
import '/node_modules/primeflex/primeflex.css'


import { createRouter, createWebHashHistory } from 'vue-router';
import LoginComponent from "./components/LoginComponent.vue";
import HomeComponent from "./components/HomeComponent.vue";
import Aura from "@primeuix/themes/Aura";
import {definePreset} from "@primeuix/themes";

const routes = [
    { path: '/', component: LoginComponent },
    { path: '/home', component: HomeComponent, meta: { requiresAuth: true } },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeEach((to, _: any, next) => {
    if (to.meta.requiresAuth && !store.loggedIn) {
        next('/');
    } else {
        next();
    }
});




const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});


const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    },
    pt: {
        column: {
            headerCell: {
                class: ['text-black bg-blue-200'],
            },
        },
    },
});
app.use(router)

app.mount('#app');