<script setup>
import { LanguageSelector, NavBar } from './components'
</script>

<template>
  <div>
    <NavBar />
    <main class="container mt-3">
      <div>
        <router-link to="/activation/123">Activatioin 123</router-link>
      </div>
      <div>
        <router-link to="/activation/456">Activatioin 456</router-link>
      </div>
      <LanguageSelector />
      <router-view></router-view>
    </main>
  </div>
</template>
