import Vue from 'vue'
import Vuex from 'vuex'
import loadToken from '@/utils/loadToken.js'

Vue.use(Vuex)

let user = loadToken()

export default new Vuex.Store({
  state: {
    id: user.id,
    username: user.username || ''
  },
  mutations: {
    updateUser (state, user) {
      state.id = user.id,
      state.username = user.username || ''
    }
  },
  actions: {
    updateUser(context, user) {
      context.commit('updateUser', user)
    }
  },
  modules: {
  }
})
