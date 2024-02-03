import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '../views/sing-up/SignUp.vue'
import Home from "../views/home/Home.vue";
import Activation from '@/views/activation/Activation.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/activation/:token',
      name: 'activation',
      component: Activation
    }
  ]
})

export default router
