<script setup lang="ts">
import { store } from "../store.ts";
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

// Define the logout function
function logOut() {
  store.logout();
  router.push('/');
}
</script>

<template>
  <div class="logout-container">
    <!-- PrimeVue Button for logging out -->
    <Button label="Logout" icon="pi pi-sign-out" class="p-button-danger" @click="logOut" />
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
