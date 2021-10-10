import Vue from 'vue'
import VueRouter from 'vue-router'

// 以懒加载方式导入路由
const Login = () => import('views/login/Login.vue')

Vue.use(VueRouter)

const routes = [
  // 重定向
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
