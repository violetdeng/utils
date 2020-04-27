import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import user from './user'
import books from './books'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user,
    books
  },
  plugins: [createPersistedState({
    key: 'violet-tools',
    storage: window.localStorage
  })]
})
