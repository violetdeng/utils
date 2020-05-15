import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/layouts/Main.vue'
import Login from '@/views/Login.vue'

Vue.use(VueRouter)

let MainRoutes = ['vacations', 'books', 'words'].map((name) => {
  let filename = name.charAt(0).toUpperCase() + name.slice(1)
  return {
    path: `/${name}`,
    name,
    component: () => import(`@/views/${filename}/index.vue`)
  }
})

const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '/',
        redirect: '/vacations'
      },
      ...MainRoutes
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next();
  } else {
    let token = localStorage.getItem('Authorization');

    if (token === 'null' || token === '') {
      next('/login');
    } else {
      next();
    }
  }
});

export default router
