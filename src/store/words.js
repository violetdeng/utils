import instance, { baseURL } from "@/api";

// initial state
const state = {
  loading: false,
  changing: false,
  data: [],
  total: 0
};

// getters
const getters = {
  loading: state => state.loading,
  all: state => state.data,
  count: state => state.total,
  changing: state => state.changing
};

// actions
const actions = {
  load({ commit }, page) {
    commit("load", true);

    instance
      .get("/words", { params: { page } })
      .then(data => {
        commit("set", data);
      })
      .finally(() => commit("load", false))
  },

  add({ commit }, data) {
    commit("change", true);
    return instance
      .post("/words/add", data)
      .then(result => {
        if (result.result === 0) {
          commit("add", {
            status: 0,
            ...data
          })
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  update({ commit }, data) {
    commit("change", true);
    return instance
      .post("/words/update", data)
      .then(result => {
        if (result.result === 0) {
          commit('update', result.data)
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  replace({ commit }, data) {
    commit("change", true);
    return instance
      .get("/words/replace", { params: { id: data._id } })
      .then(result => {
        if (result.result === 0) {
          commit('update', result.data)
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  exec({ commit }, data) {
    commit("change", true);
    return instance
      .get("/words/exec", { params: { id: data._id } } )
      .then(result => {
        if (result.result === 0) {
          commit('update', result.data)
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  destroy({ commit }, id) {
    commit("change", true);
    return instance
      .get("/words/destroy", { params: { id } })
      .then(result => {
        if (result.result === 0) {
          commit('destroy', id)
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  show({ commit }, id) {
    window.open(baseURL + "words/examine?id=" + id, "_blank")
  }
};

// mutations
const mutations = {
  load(state, loading) {
    state.loading = loading
  },

  set(state, data) {
    state.data = data.data
    state.total = data.count
  },

  add(state, data) {
    state.data.push(data)
    state.total ++
  },

  change(state, loading) {
    state.changing = loading
  },

  update(state, data) {
    state.data = state.data.map(item => {
      if (item._id !== data._id) {
        return item
      } else {
        return data
      }
    })
  },

  destroy(state, id) {
    state.data = state.data.filter(item => item._id !== id)
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

