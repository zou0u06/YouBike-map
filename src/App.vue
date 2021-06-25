<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-3">
        <div class="searchbox">
          <div class="sticky-top">
            <div class="searchbox-bar input-group d-flex">
              <input type="text" class="form-control w-100" v-model="searchText">
            </div>
          </div>
          <ul
            class="list-group"
          >
            <li
              v-for="(display, index) in displays"
              :key="display.sno"
              class="list-group-item"
              @click="focusOn(display, index)"
            >
              <h4>{{ display.sna }}</h4>
              <h6>總停車格數量：{{ display.tot }}</h6>
              <h6>可借車輛數：{{ display.sbi }}</h6>
              <h6>可還車位數：{{ display.bemp }}</h6>
              <h6>資料更新時間：{{ display.mday }}</h6>
              <h6>
                地址：
                <a
                  href="https://www.google.com.tw/maps/place/..."
                  target="_blank"
                  title="Google Map"
                >地址</a>
              </h6>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-9 map">
        <l-map
          :zoom="zoom"
          :center="center"
          :options="{zoomControl: false}"
        >
          <l-tile-layer :url="url"/>
          <l-control-zoom position="bottomleft"/>
          <v-marker-cluster>
            <l-marker
              ref="marker"
              v-for="display in displays"
              :key="display.sno"
              :lat-lng="[display.lat, display.lng]"
            >
              <l-popup>
                <h4>{{ display.sna }}</h4>
                <h6>總停車格數量：{{ display.tot }}</h6>
                <h6>可借車輛數：{{ display.sbi }}</h6>
                <h6>可還車位數：{{ display.bemp }}</h6>
                <h6>資料更新時間：{{ display.mday }}</h6>
              </l-popup>
            </l-marker>
          </v-marker-cluster>
        </l-map>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-restricted-syntax */
export default {
  name: 'App',
  data() {
    return {
      youbikes: {
        '0001': {
          lat: 0,
          lng: 0,
        },
      },
      weather: [],
      searchText: '',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 17,
      center: [25.047739238212436, 121.5168348654844],
    };
  },
  computed: {
    displays() {
      const temp = [];
      switch (this.searchText) {
        case '': {
          for (const key in this.youbikes) {
            if ({}.hasOwnProperty.call(this.youbikes, key)) {
              temp.push(this.youbikes[key]);
            }
          }
          break;
        }
        default: {
          break;
        }
      }
      console.log(temp);
      return temp;
      // return this.youbikes.filter((item) => item.ar.includes(searchText));
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
    },
  },
  methods: {
    getYoubikes() {
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
    // getWeather() {
    //   const weatherAPI = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-069?Authorization=rdec-key-123-45678-011121314';
    //   this.axios.get(weatherAPI).then((response) => {
    //     if (response) {
    //       this.weather = response.data.records.locations[0].location;
    //       // console.log(this.weather);
    //     } else {
    //       console.log('天氣API錯誤');
    //     }
    //   });
    // },
    focusOn(display, index) {
      if (document.body.clientWidth < 767.98) {
        const tempLat = String(Number(display.lat) + 0.002);
        this.center = [tempLat, display.lng];
      } else {
        this.center = [display.lat, display.lng];
      }
      this.$nextTick(() => {
        this.$refs.marker[index].mapObject.openPopup();
      });
    },
  },
  mounted() {
    this.getYoubikes();
    // this.getWeather();
    // const vm = this;
    // console.log(vm.$refs.marker.mapObject);
    // vm.$nextTick(() => {
    //   vm.$refs.marker.mapObject.openPopup();
    // });
  },
};
</script>

<style lang="scss">
@import "./assets/scss/all.scss";

.map {
  height: 100vh;
}
.highlight {
  background: #e9ffe3;
}
.searchbox {
  height: 30%;
  overflow-y: auto;
  position: fixed;
  top: 30px;
  z-index: 401;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 0.25rem;
  background-color: #fff;
  @include media-breakpoint-up(md) {
    position: static;
    margin-left: 0;
    margin-right: 0;
    padding: 0.5rem;
    height: 100vh;
  }
}
.searchbox-bar {
  height: 60px;
}
</style>
