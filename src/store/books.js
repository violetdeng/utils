import instance from "@/api";

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
  changing: state => state.changing
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
    instance
      .post("/books/add", data)
      .then(result => {
        if (result.result === 0) {
          commit("add", {
            id: result.data,
            ...data
          })
        }
      })
      .finally(() => commit("change", false))
  },

  destroy({ commit }, id) {
    commit("change", true);
    instance
      .get("/books/destroy", { params: { id } })
      .then(data => {
        if (data.result === 0) {
          commit('destroy', id)
        }
      })
      .finally(() => commit("change", false))
  }
};

// mutations
const mutations = {
  load(state, loading) {
    state.loading = loading
  },

  set(state, data) {
    state.data = data.data
    state.total = state.data.count
  },

  add(state, data) {
    state.data.push(data)
    state.total ++
  },

  change(state, loading) {
    state.changing = loading
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

