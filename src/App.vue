<template>
  <div class="container-fluid">
    <div class="row no-gutters">
      <div class="menubox col-md-3">
        <div class="shadow-sm p-2">
          <div class="form-group d-flex">
            <label for="area" class="mr-2 col-form-label">地區</label>
            <div class="flex-fill menubox-bar">
              <select id="area" class="form-control" v-model="location">
                <option value>-- 請選擇要查詢的行政區 --</option>
                <option value="中山區">中山區</option>
                <option value="中正區">中正區</option>
              </select>
            </div>
          </div>
          <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有車輛）</p>
        </div>
        <ul class="list-group" v-for="youbike in youbikes" :key="youbike.sno">
          <a class="list-group-item text-left">
            <h4>{{ youbike.sna }}</h4>
            <h6>總停車格數量：{{ youbike.tot }}</h6>
            <h6>可借車輛數：{{ youbike.sbi }}</h6>
            <h6>可還車位數：{{ youbike.bemp }}</h6>
            <h6>資料更新時間：{{ youbike.mday }}</h6>
            <p class="mb-0">
              地址：
              <a
                href="https://www.google.com.tw/maps/place/..."
                target="_blank"
                title="Google Map"
              >地址</a>
            </p>
          </a>
        </ul>
      </div>
      <div class="col-sm-9">
        <l-map :zoom="zoom" :center="center">
          <l-tile-layer :url="url" />
          <l-marker
            :lat-lng="[youbike.lat, youbike.lng]"
            v-for="youbike in youbikes"
            :key="youbike.sno"
          />
        </l-map>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
// import L from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';

console.log('top');

export default {
  name: 'App',
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      youbikes: {},
      weather: [],
      location: '',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 17,
      center: [25.047845898630204, 121.5168620095192],
    };
  },
  methods: {
    getYoubikes() {
      console.log('getYoubike');

      // this.markers = L.markerClusterGroup().addTo(OSM);
      // console.log(this.markers);

      const youbikeAPI = 'https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json';
      this.axios.get(youbikeAPI).then((response) => {
        console.log(response);
        if (response) {
          this.youbikes = response.data.retVal;
          console.log(this.youbikes);
        } else {
          console.log('伺服器錯誤，請稍後再試');
        }
      });
    },
    getWeather() {
      const weatherAPI = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-069?Authorization=rdec-key-123-45678-011121314';
      this.axios.get(weatherAPI).then((response) => {
        if (response) {
          this.weather = response.data.records.locations[0].location;
          // console.log(this.weather);
        } else {
          console.log('天氣API錯誤');
        }
      });
    },
  },
  computed: {
    display() {
      console.log('display');
      // this.weather.filter((item) => item.locationName === this.location);
      // switch (this.location) {
      //   case '':
      //     return this.youbike;
      //   default: {
      //     const tempData = this.youbike.filter(
      //       (item) => item.sarea === this.location,
      //     );
      //     return tempData;
      //   }
      // }
      return false;
    },
  },
  mounted() {
    this.getYoubikes();
    this.getWeather();
  },
};
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";

#mapId {
  height: 100%;
}
.highlight {
  background: #e9ffe3;
}
.menubox {
  height: 60%;
  overflow-y: auto;
  position: fixed;
  top: 30px;
  background-color: #fff;
  @include media-breakpoint-up(md) {
    height: 100%;
  }
}
.menubox-bar {
  height: 60px;
}
</style>
