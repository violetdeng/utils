import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'
import axios from 'axios'

Vue.use(Vuex)

const API = 'http://47.92.33.106:3000/leaves'

const state = {
  events: []
}

export default new Vuex.Store({
  state,
  mutations: {
    updateEvents (state, payload) {
      state.events = payload
    },
    addEvent (state, payload) {
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
  getters: {
    events (state) {
      return state.events.map(e => {
        return {
          ...e,
          id: e._id
        }
      })
    }
  },
  actions: {
    getEvents ({ commit }) {
      return axios.get(API).then((response) => {
        commit('updateEvents', response.data)
      })
    },
    add (store, param) {
      return new Promise((resolve, reject) => {
        axios.post(API + '/add', param).then((response) => {
          param.id = response.data
          store.commit('addEvent', param)
          resolve('ok')
        })
      })
    },
    update (store, param) {
      return new Promise((resolve, reject) => {
        axios.post(API + '/update', param).then((response) => {
          store.commit('updateEvent', param)
          resolve('ok')
        })
      })
    },
    delete (store, param) {
      return new Promise((resolve, reject) => {
        axios.post(API + '/delete', {
          id: param
        }).then((response) => {
          store.commit('deleteEvent', param)
          resolve('ok')
        })
      })
    }
  },
  plugins: [
    createPersist({
      namespace: 'namespace-for-state',
      initialState: {},
      expires: 7 * 24 * 60 * 60 * 1e3
    })
  ]
})
