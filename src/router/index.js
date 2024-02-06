import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '../views/sing-up/SignUp.vue'
import Home from "../views/home/Home.vue";
import Activation from '@/views/activation/Activation.vue'
import Request from "@/views/password-reset/request/Request.vue"
import Set from "@/views/password-reset/set/Set.vue"
import User from "@/views/user/User.vue"
import Login from "@/views/login/Login.vue"

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
    },
    {
      path: '/password-reset/request',
      name: 'password-reset',
      component: Request
    },
    {
      path: '/password-reset/set',
      name: 'password-set',
      component: Set
    },
    {
      path: '/user/:id',
      component: User
    },
    {
      path: '/login',
      component: Login
    }
  ]
})

export default router
