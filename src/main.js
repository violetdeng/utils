import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './plugins/axios.js'

import { Plugin } from 'vue-fragment'
Vue.use(Plugin)

import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'

Vue.use(new VueSocketIO({
  connection: SocketIO('http://violetdeng.com:3000', {
    query: {
      access_token: localStorage.getItem('Authorization')
    },
    reconnectionAttempts: 2
  }),
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))

import Moment from 'moment'
import { extendMoment } from 'moment-range'

import './assets/css/fontello.css'

extendMoment(Moment)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export { router }
