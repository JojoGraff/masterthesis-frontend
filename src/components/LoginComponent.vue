<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Password from "primevue/password";
import { ref, onMounted } from 'vue';
import axios from "axios";
import { store } from "../store.ts";
import { useRouter } from "vue-router";

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

async function logIn() {
  errorMessage.value = '';  // Reset error message on each login attempt

  try {
    // Basic Auth Token generieren
    const credentials = `${username.value}:${password.value}`;
    const basicAuthToken = 'Basic ' + btoa(credentials);
    const url = `${import.meta.env.VITE_API_BASE_URL}/fetch-api/cases`;
    console.log(url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuthToken
      }
    });

    if (response.status === 200) {
      // User-Daten speichern (Nur das Token, nicht das Passwort)
      store.user = username.value;
      store.loggedIn = true;
      store.authToken = basicAuthToken

      // Das Basic Auth Token im Local Storage speichern
      localStorage.setItem("authToken", basicAuthToken);

      // Weiterleitung zur /home Seite
      await router.push('/home');
    }
  } catch (error) {
    console.error("Login fehlgeschlagen", error);
    errorMessage.value = 'Login failed. Please check your credentials and try again.';
  }
}

onMounted(() => {
  const savedToken = localStorage.getItem("authToken");
  if (savedToken) {
    store.authToken = savedToken;
    store.loggedIn = true;
  }
});
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Sign in</h1>
      <div class="top-text">
        Use your Service Cloud Login
      </div>
      <div class="input-container">
        <InputText v-model="username" placeholder="Username" icon="pi-user"/>
        <Password v-model="password" toggleMask placeholder="Password" :feedback="false" :inputStyle="{ width: '100%' }" />
      </div>
      <Button label="Submit" @click="logIn" style="border-color: #000057; background-color: #000057" />

      <!-- Error Message Display -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #0058A3, #0066B3); /* Rich SAP Blue gradient */
}

.login-box {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(100px);
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 0.25rem 0.625rem rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 80vw;
  max-width: 30rem;
  aspect-ratio: 5 / 7;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Align content at the top */
  align-items: center;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 80%; /* Set input container width to 80% */
}

.input-container InputText,
.input-container Password {
  width: 100%; /* Make inputs take up the full width of the container */
}

button {
  width: 80%; /* Set the button width to 80% */
  margin-top: 1rem; /* Optional: Add space between button and the inputs */
}

h1 {
  font-size: 3em;
  color: #fff; /* White text for better contrast */
  align-self: flex-start; /* Aligns the h1 to the left */
  margin-top: 0; /* Remove the default margin-top */
  margin-bottom: 0.5rem; /* Reduce the gap below the h1 */
}

.top-text {
  align-self: flex-start;
  padding-bottom: 3rem; /* Reduce the padding below the top text */
  color: #fff; /* White text to match the overall theme */
}

.error-message {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
