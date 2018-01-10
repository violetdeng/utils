import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'
import uuid from 'uuid/v1'

Vue.use(Vuex)

const state = {
  events: []
}

export default new Vuex.Store({
  state,
  mutations: {
    addEvent (state, payload) {
      payload.id = uuid()
      state.events.push(payload)
    },
    updateEvent (state, payload) {
      state.events = state.events.map(event =>
        (event.id === payload.id)
        ? payload
        : event
      )
    },
    deleteEvent (state, payload) {
      const index = state.events.findIndex(event => event.id === payload)
      state.events.splice(index, 1)
    }
  },
  getters: {},
  actions: {},
  plugins: [
    createPersist({
      namespace: 'namespace-for-state',
      initialState: {},
      expires: 7 * 24 * 60 * 60 * 1e3
    })
  ]
})
