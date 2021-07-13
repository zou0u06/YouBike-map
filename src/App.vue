<template>
  <div class="container-fluid">
    <div class="row">
      <msg-modal/>
      <button
        type="button"
        class="btn-sidebar"
        :class="{ 'd-none': sidebarActive,
          'd-block': !sidebarActive }"
        @click="sidebarActive = !sidebarActive"
      >功能列表
      </button>
      <div
        class="legend"
        @click="legendActive = !legendActive"
      >
        <div
          class="flex-jb-aic"
          :class="{ 'mb-2': legendActive }"
        >
          <i class="fas fa-map-marker-alt"/>
          圖例
          <i
            v-if="legendActive"
            class="fas fa-caret-up"
          />
          <i
            v-else
            class="fas fa-caret-down"
          />
        </div>
        <div :class="{ 'd-block': legendActive,
          'd-none': !legendActive }">
          <div class="d-flex align-items-center">
            <img src="https://raw.githubusercontent.com/zou0u06/YouBike-map/31559bd4812015166487699283aed8fab27d6fe0/src/assets/images/marker.svg">
            <span>正常營運</span>
          </div>
          <div class="d-flex align-items-center">
            <img src="https://raw.githubusercontent.com/zou0u06/YouBike-map/4e8cce62ed489ff8f54f8cfadfa06f0cc53c3bbb/src/assets/images/marker-nobike.svg">
            <span>無法借車</span>
          </div>
          <div class="d-flex align-items-center">
            <img src="https://raw.githubusercontent.com/zou0u06/YouBike-map/4e8cce62ed489ff8f54f8cfadfa06f0cc53c3bbb/src/assets/images/marker-noparking.svg">
            <span>無法還車</span>
          </div>
          <div class="d-flex align-items-center">
            <img src="https://raw.githubusercontent.com/zou0u06/YouBike-map/31559bd4812015166487699283aed8fab27d6fe0/src/assets/images/marker-notworking.svg">
            <span>暫停營運</span>
          </div>
        </div>
      </div>
      <div
        class="col-md-4 sidebar"
        :class="{ 'd-none': !sidebarActive,
          'd-flex': sidebarActive }"
      >
        <div class="sidebar-header">
          <div class="d-flex">
            <h1 class="h2 mb-3">臺北市 YouBike 即時資訊地圖</h1>
            <button
              type="button"
              class="btn-close ms-2"
              aria-label="Close"
              @click="sidebarActive = false"
            />
          </div>
          <div class="sidebar-input">
            <input
              type="text"
              v-model="searchText"
              placeholder="請搜尋站名、路名、地標等關鍵字"
              class="sidebar-input-textfield"
            />
            <span class="sidebar-input-icon fas fa-search"/>
          </div>
        </div>
        <ul class="nav sidebar-nav">
          <li class="nav-item">
            <a
              class="nav-link"
              @click="switchNavActive('searchs')"
              :class="{ 'text-primary': navActive === 'searchs',
                'border-active': navActive === 'searchs' }"
            >搜尋結果</a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              @click="switchNavActive('favs')"
              :class="{ 'text-primary': navActive === 'favs',
                'border-active': navActive === 'favs' }"
            >收藏站點</a>
          </li>
        </ul>
        <div class="sidebar-result">
          <div v-if="navActive === 'searchs'">
            <h6
              v-if="searchs.length === 0 || !searchs"
              class="mt-3 text-center"
            >查無相關站點</h6>
            <card-result
              v-else
              :bases="searchs"
              @closeSidebar="closeSidebar()"
              @deleteFavYoubikes="deleteFavYoubikes"
              @addToFavYoubikes="addToFavYoubikes"
            />
          </div>
          <div v-if="navActive === 'favs'">
            <h6
              v-if="favs.length === 0 || !favs"
              class="mt-3 text-center"
            >目前尚無收藏站點</h6>
            <card-result
              v-else
              :bases="favs"
              @closeSidebar="closeSidebar()"
              @deleteFavYoubikes="deleteFavYoubikes"
              @addToFavYoubikes="addToFavYoubikes"
            />
          </div>
        </div>
        <p class="sidebar-time">資料更新時間：{{ time }}（每分鐘更新１次）</p>
      </div>
      <div
        class="map"
        :class="{ 'col': sidebarActive, 'col-md-8': sidebarActive}"
        @click="closeSidebar()"
      >
        <l-map
          ref="map"
          :zoom="zoom"
          :center="center"
          :options="{zoomControl: false, attributionControl: false}"
        >
          <l-tile-layer :url="url" />
          <l-control-attribution
            position="bottomright"
            prefix="<a href='https://leafletjs.com' target='_blank' title='AJSlibraryforinteractivemaps'>Leaflet</a> | 程式碼：<a href='https://github.com/zou0u06' target='_blank'>Frank Liu</a> 樣式參考：<a href='https://www.behance.net/gallery/93048833/UIUX-?tracking_source=for_you_feed_user_published'>K.T</a>"
          />
          <l-control-zoom position="bottomright" />
          <v-marker-cluster>
            <l-marker
              ref="marker"
              v-for="youbike in youbikes"
              :key="youbike.sno"
              :lat-lng="[youbike.lat, youbike.lng]"
            >
              <l-icon
                :icon-size="iconSize"
                :icon-anchor="iconAnchor"
                :icon-url="setIcons(youbike)"
                :icon-retina-url="setIcons(youbike)"
              />
              <l-popup class="position-relative">
                <div class="d-flex justify-content-between">
                  <div class="flex-fill">
                    <h4 class="text-primary fw-bolder">
                      {{ youbike.sna }}
                      <span v-if="youbike.act === '0'
                        || (youbike.sbi === '0'
                        && youbike.bemp === '0')"
                      >（暫停營運）</span>
                    </h4>
                    <h6>溫度：{{ youbike.temperature }}°C</h6>
                  </div>
                  <i
                    v-if="youbike.favored"
                    class="fas fa-star popup-icon-favs"
                    @click.stop="deleteFavYoubikes(youbike.sno)"
                  />
                  <i
                    v-else
                    class="far fa-star popup-icon-favs"
                    @click.stop="addToFavYoubikes(youbike.sno)"
                  />
                </div>
                <h6>天氣：{{ youbike.weather }}</h6>
                <h6>位置：{{ youbike.ar }}</h6>
                <div class="d-flex">
                  <h6
                    class="popup-footer-block1"
                    :class="{'bg-success': youbike.sbi > 0, 'bg-danger': youbike.sbi === '0'}"
                  >可借：{{ youbike.sbi }}</h6>
                  <h6
                    class="popup-footer-block2"
                    :class="{'bg-success': youbike.bemp > 0, 'bg-danger': youbike.bemp === '0'}"
                  >可還：{{ youbike.bemp }}</h6>
                </div>
              </l-popup>
            </l-marker>
          </v-marker-cluster>
        </l-map>
      </div>
    </div>
  </div>
</template>

<script>
import cardResult from './components/CardResult.vue';

export default {
  name: 'App',
  components: { cardResult },
  data() {
    return {
      youbikes: [
        {
          lat: 0,
          lng: 0,
          favored: false,
        },
      ],
      weathers: [],
      time: '',
      searchText: '',
      navActive: '',
      sidebarActive: false,
      legendActive: false,
      bases: [],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 13,
      center: [25.049, 121.515],
      iconSize: [25, 40],
      iconAnchor: [12, 5],
    };
  },
  computed: {
    searchs() {
      const tempSearchs = [];
      const youbikesL = this.youbikes.length;
      switch (this.searchText) {
        case '':
          return '';
        default:
          for (let i = 0; i < youbikesL; i++) {
            if (
              this.youbikes[i].ar.indexOf(this.searchText) > -1
              || this.youbikes[i].sna.indexOf(this.searchText) > -1
              || this.youbikes[i].sarea.indexOf(this.searchText) > -1
            ) {
              tempSearchs.push({ ...this.youbikes[i], oriIndex: i });
            }
          }
          return tempSearchs;
      }
    },
    favs() {
      const tempFavs = [];
      const youbikesL = this.youbikes.length;
      for (let i = 0; i < youbikesL; i++) {
        if (this.youbikes[i].favored) {
          tempFavs.push({ ...this.youbikes[i], oriIndex: i });
        }
      }
      return tempFavs;
    },
  },
  watch: {
    youbikes: {
      handler() {
        if (this.youbikes.length > 1) {
          this.getWeathers();
        }
      },
      deep: true,
    },
    searchText() {
      switch (this.searchText) {
        case '':
          this.navActive = '';
          break;
        default:
          this.navActive = 'searchs';
          break;
      }
    },
  },
  created() {
    this.getYoubikes();
    this.time = new Date().toLocaleString();
    window.setInterval((() => {
      this.getYoubikes();
      this.time = new Date().toLocaleString();
    }), 60000);
    if (document.body.clientWidth < 767.98) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  },
  methods: {
    getYoubikes() {
      const youbikeAPI = 'https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json';
      this.axios.get(youbikeAPI).then((response) => {
        if (response) {
          this.youbikes = Object.values(response.data.retVal);
          this.setFavYoubikes();
        } else {
          this.$store.commit('SET_MSG', 'errorYoubike');
        }
      });
    },
    setFavYoubikes() {
      const youbikesL = this.youbikes.length;
      const favYoubikesId = JSON.parse(localStorage.getItem('favYoubikesId')) || [];
      const favYoubikesIdL = favYoubikesId.length;
      if (favYoubikesIdL > 0) {
        for (let i = 0; i < youbikesL; i++) {
          for (let j = 0; j < favYoubikesIdL; j++) {
            if (this.youbikes[i].sno === favYoubikesId[j]) {
              this.$set(this.youbikes[i], 'favored', true);
              break;
            } else {
              this.$set(this.youbikes[i], 'favored', false);
            }
          }
        }
      } else {
        for (let i = 0; i < youbikesL; i++) {
          this.$set(this.youbikes[i], 'favored', false);
        }
      }
    },
    setIcons(youbike) {
      if (youbike.act === '0'
        || (youbike.sbi === '0'
        && youbike.bemp === '0')
      ) {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/31559bd4812015166487699283aed8fab27d6fe0/src/assets/images/marker-notworking.svg';
      }
      if (
        youbike.act === '1'
        && youbike.sbi === '0'
      ) {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/4e8cce62ed489ff8f54f8cfadfa06f0cc53c3bbb/src/assets/images/marker-nobike.svg';
      }
      if (
        youbike.act === '1'
        && youbike.bemp === '0'
      ) {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/4e8cce62ed489ff8f54f8cfadfa06f0cc53c3bbb/src/assets/images/marker-noparking.svg';
      }
      return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/31559bd4812015166487699283aed8fab27d6fe0/src/assets/images/marker.svg';
    },
    addToFavYoubikes(addedId) {
      const tempId = JSON.parse(localStorage.getItem('favYoubikesId')) || [];
      tempId.push(addedId);
      localStorage.setItem('favYoubikesId', JSON.stringify(tempId));
      const youbikesL = this.youbikes.length;
      for (let i = 0; i < youbikesL; i++) {
        if (this.youbikes[i].sno === addedId) {
          this.$set(this.youbikes[i], 'favored', true);
          break;
        }
      }
    },
    deleteFavYoubikes(deletedId) {
      const favYoubikesId = JSON.parse(localStorage.getItem('favYoubikesId')) || [];
      const filteredId = favYoubikesId.filter((item) => item !== deletedId);
      localStorage.setItem('favYoubikesId', JSON.stringify(filteredId));
      const youbikesL = this.youbikes.length;
      for (let i = 0; i < youbikesL; i++) {
        if (this.youbikes[i].sno === deletedId) {
          this.$set(this.youbikes[i], 'favored', false);
          break;
        }
      }
    },
    getWeathers() {
      const weatherAPI = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-061?Authorization=rdec-key-123-45678-011121314';
      this.axios.get(weatherAPI).then((response) => {
        if (response) {
          this.weathers = response.data.records.locations[0].location;
          this.setWeathers();
        } else {
          this.$store.commit('SET_MSG', 'errorWeather');
        }
      });
    },
    setWeathers() {
      const youbikesL = this.youbikes.length;
      const weathersL = this.weathers.length;
      const time = new Date().getHours() % 6;
      for (let i = 0; i < youbikesL; i++) {
        for (let j = 0; j < weathersL; j++) {
          if (this.youbikes[i].sarea === this.weathers[j].locationName) {
            if (time < 3) {
              this.$set(this.youbikes[i], 'weather', this.weathers[j].weatherElement[1].time[0].elementValue[0].value);
              this.$set(this.youbikes[i], 'temperature', this.weathers[j].weatherElement[3].time[0].elementValue[0].value);
              break;
            } else {
              this.$set(this.youbikes[i], 'weather', this.weathers[j].weatherElement[1].time[1].elementValue[0].value);
              this.$set(this.youbikes[i], 'temperature', this.weathers[j].weatherElement[3].time[1].elementValue[0].value);
              break;
            }
          }
        }
      }
    },
    closeSidebar() {
      if (document.body.clientWidth < 767.98) {
        this.sidebarActive = false;
      }
    },
    switchNavActive(keyword) {
      switch (this.navActive) {
        case keyword:
          this.navActive = '';
          break;
        default:
          this.navActive = keyword;
          break;
      }
    },
  },
};
</script>

<style lang="scss">
@import "./assets/scss/all.scss";
</style>
