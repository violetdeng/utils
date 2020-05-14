import instance, { baseURL } from "@/api";

// initial state
const state = {
  loading: false,
  changing: false,
  data: [],
  total: 0,
  downloadConfigure: null
};

// getters
const getters = {
  loading: state => state.loading,
  all: state => state.data,
  count: state => state.total,
  changing: state => state.changing,
  downloadConfigure: state => state.downloadConfigure
};

// actions
const actions = {
  load({ commit }, page) {
    commit("load", true);

    instance
      .get("/books", { params: { page } })
      .then(data => {
        commit("set", data);
      })
      .finally(() => commit("load", false))
  },

  add({ commit }, data) {
    commit("change", true);
    return instance
      .post("/books/add", data)
      .then(result => {
        if (result.result === 0) {
          commit("add", {
            _id: result.data._id,
            status: data.type === 1 ? 2 : 0,
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
      .post("/books/update", data)
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
      .get("/books/destroy", { params: { id } })
      .then(result => {
        if (result.result === 0) {
          commit('destroy', id)
        } else {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  refresh({ commit }, params) {
    commit("change", true);
    return instance
      .get("/books/crawler/start", { params })
      .then(result => {
        if (result.result !== 0) {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },

  download({ commit }, id) {
    window.open(baseURL + "books/export?id=" + id, "_blank")
  },

  stop({ commit }, id) {
    commit("change", true);
    return instance
      .get("/books/crawler/stop", { params: id })
      .then(result => {
        if (result.result !== 0) {
          return Promise.reject(result.errors)
        }
      })
      .finally(() => commit("change", false))
  },
};

// mutations
const mutations = {
  load(state, loading) {
    state.loading = loading
  },

  set(state, data) {
    state.data = data.data
    state.total = data.count
    state.downloadConfigure = data.config
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

