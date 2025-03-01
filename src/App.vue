<script setup lang="ts">
import { watch, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const backgroundStyle = ref({});

const updateBackground = () => {
  if (route.path === "/") {
    backgroundStyle.value = {
      background: "linear-gradient(to bottom right, #4facfe, #00f2fe)",
    };
  } else if (route.path === "/home") {
    backgroundStyle.value = {
      background: "linear-gradient(to bottom right, #AADCFF, #B8F7F9)",
    };
  } else {
    backgroundStyle.value = {}; // Default background
  }
};

watch(route, updateBackground, { immediate: true });

onMounted(updateBackground);
</script>

<template>
  <div :style="backgroundStyle" class="background-container">
    <router-view />
  </div>
</template>

<style scoped>
.background-container {
  width: 100vw;
  height: 100vh;
}
</style>
