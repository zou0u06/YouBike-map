/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import vueAxios from 'vue-axios';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {
  LMap, LTileLayer, LMarker, LControlZoom, LPopup, LIcon, LControlAttribution,
} from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import App from './App.vue';
import store from './store';
import MsgModal from './components/MsgModal.vue';
import displayDate from './filters/displayDate';

// 處理icon消失的程式碼
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-icon', LIcon);
Vue.component('l-control-zoom', LControlZoom);
Vue.component('l-popup', LPopup);
Vue.component('l-control-attribution', LControlAttribution);
Vue.component('v-marker-cluster', Vue2LeafletMarkerCluster);
Vue.component('msg-modal', MsgModal);

Vue.config.productionTip = false;

Vue.use(vueAxios, axios, Vuex);

Vue.filter('displayDate', displayDate);

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
