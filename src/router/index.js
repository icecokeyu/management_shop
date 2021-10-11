import Vue from 'vue'
import VueRouter from 'vue-router'

// 以懒加载方式导入路由
const Login = () => import('views/login/Login.vue')
const Home = () => import('views/home/Home.vue')

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
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

//给路由添加导航守卫
router.beforeEach((to, from, next) => {
  // to表示要跳转到哪个路由
  // from表示从哪个路由跳转而来
  // next表示放行，后面可以跟地址
  if(to.path === '/login') return next()
  let tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
