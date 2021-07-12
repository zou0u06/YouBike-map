import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    msg: {
      event: '',
      times: 0,
    },
  },
  mutations: {
    SET_MSG(state, payload) {
      state.msg.event = payload;
      state.msg.times += 1;
    },
  },
});
