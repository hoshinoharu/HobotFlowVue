// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from './js/http'
import Vuex from 'vuex'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/components/ef/index.css'

Vue.use(ElementUI, {size: 'small'})
Vue.use(Vuex)
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$displayKey = function () {
  if (this.$store.state.displayInfo == null) {
    return null;
  }
  let info = this.$store.state.displayInfo;
  return info.orientation % 2 === 0 ? (info.width + 'x' + info.height) : (info.height + 'x' + info.width);
}
Vue.prototype.$image = function (image) {
  if (image == null || this.$displayKey() == null) {
    return null;
  }
  return image[this.$displayKey()];
}
const store = new Vuex.Store({
  state: {
    displayInfo: null
  },
  mutations: {
    setDisplayInfo(state, displayInfo) {
      state.displayInfo = displayInfo;
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {App},
  template: '<App/>',
  store
})
