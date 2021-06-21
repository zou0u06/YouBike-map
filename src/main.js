import Vue from 'vue';
import axios from 'axios';
import vueAxios from 'vue-axios';
import 'leaflet/dist/leaflet.css';

import App from './App.vue';

Vue.config.productionTip = false;

Vue.use(vueAxios, axios);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
