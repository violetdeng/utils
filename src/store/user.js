import instance from "@/api";

// initial state
const state = {
  loading: false,
  data: {}
};

// getters
const getters = {
  loadingUser: state => state.loading,
  user: state => state.data
};

// actions
const actions = {
  initUser({ commit }) {
    commit("loadUser", true);

    instance
      .get("/user/me")
      .then(data => {
        if (data) {
          commit("setUser", data);
          commit("loadUser", false);
        }
      })
  }
};

// mutations
const mutations = {
  loadUser(state, loading) {
    state.loading = loading;
  },

  setUser(state, data) {
    state.data = data;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
