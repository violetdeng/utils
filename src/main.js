import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './plugins/axios.js'

import { Plugin } from 'vue-fragment'
Vue.use(Plugin)

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
