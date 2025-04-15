import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import VideoPlayer from '../views/VideoPlayer.vue'
import Manage from '../views/Manage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/video/:id',
    name: 'VideoPlayer',
    component: VideoPlayer,
    props: true
  },
  {
    path: '/manage',
    name: 'Manage',
    component: Manage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
