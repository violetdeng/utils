import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import user from './user'
import books from './books'
import words from './words'

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
        switch (item.title) {
          case '下载通知':
            commit('books/update', JSON.parse(item.content))
            break;
          case '文字通知':
            commit('words/update', JSON.parse(item.content))
            break;
          default:
            console.log(item)
        }
      })
    }
  },
  modules: {
    user,
    books,
    words
  },
  plugins: [createPersistedState({
    key: 'violet-tools',
    storage: window.localStorage
  })]
})
