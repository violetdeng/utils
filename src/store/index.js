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
    //SOCKET_update_books() {
    //  console.log('update')
    //}
  },
  actions: {
    SOCKET_messages({ commit }, payload) {
      payload.forEach(item => {
        commit('books/update', JSON.parse(item.content))
      })
    }
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
