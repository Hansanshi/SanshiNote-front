import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import '../public/theme/index.css'
import ElementUI from 'element-ui';
import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
import * as VueMenu from '@hscmap/vue-menu'

Vue.config.productionTip = false
Vue.use(mavonEditor)
Vue.use(ElementUI)
Vue.use(contentmenu)
Vue.use(VueMenu)

new Vue({
  el:"#app",
  router,
  store,
  render: h => h(App)
}).$mount('#app')
