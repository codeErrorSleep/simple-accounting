<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <Toaster position="top-center" :duration="3000" />
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import AppLayout from '@/components/AppLayout.vue'
</script>