<template>
  <nav class="navbar navbar-expand bg-body-tertiary shadow-sm">
    <div class="container">
      <router-link data-testid="link-home-page" to="/">
        <img src="../assets/hoasify.png" alt="Home" width="60%" />
        Home</router-link
      >
      <ul class="navbar-nav">
        <template v-if="!auth.id">
          <li class="nav-item">
            <router-link class="nav-link" to="/login" data-testid="link-login-page">
              {{ $t('login') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" data-testid="link-signup-page" to="/signup">{{
              $t('signUp')
            }}</router-link>
          </li>
        </template>
        <li class="nav-item" v-if="auth.id">
          <router-link class="nav-link" data-testid="link-my-profile" :to="'/user/' + auth.id">
            My Profile
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script setup>
import { useAuthStore } from '@/stores/auth'
const { auth } = useAuthStore()
</script>