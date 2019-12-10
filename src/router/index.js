import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/layouts/Main.vue'
import Login from '@/views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '/',
        redirect: '/vacations'
      },
      {
        path: '/vacations',
        name: 'vacations',
        component: () => import(/* webpackChunkName:'vacations'*/ '@/views/Vacations')
      }
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
