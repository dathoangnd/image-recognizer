import Vue from 'vue'
import VueSnackbar from 'vue-snack' 
import App from './App.vue'
import router from './router'
import store from './store'
import 'vue-snack/dist/vue-snack.min.css'

Vue.config.productionTip = false

Vue.use(VueSnackbar, { position: 'bottom', time: 3000 })

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
