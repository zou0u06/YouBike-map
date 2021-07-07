<template>
  <div class="container-fluid">
    <div class="row">
      <button
        type="button"
        class="btn-sidebar"
        :class="{ 'd-none': sidebarActive,
          'd-block': !sidebarActive }"
        @click="sidebarActive = !sidebarActive"
      >
        快點我
      </button>
      <div
        class="col-md-4 sidebar"
        :class="{ 'd-none': !sidebarActive,
          'd-flex': sidebarActive }"
      >
        <div class="sidebar-header">
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="sidebarActive = false"
          />
          <input
            type="text"
            v-model="searchText"
            placeholder="尋找站點"
            class="sidebar-input"
          />
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
        <p class="sidebar-time">資料更新時間：{{ new Date().toLocaleString() }}</p>
      </div>
      <div
        class="map"
        :class="{ 'col': sidebarActive, 'col-md-8': sidebarActive}"
        @click="closeSidebar()"
      >
        <l-map ref="map" :zoom="zoom" :center="center" :options="{zoomControl: false}">
          <l-tile-layer :url="url" />
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
                :icon-url="switchIcon(youbike)"
                :icon-retina-url="switchIcon(youbike)"
              />
              <l-popup class="position-relative">
                <div class="d-flex justify-content-between">
                  <div class="flex-fill">
                    <h4 class="text-primary bg-white">
                      {{ youbike.sna }}
                      <span v-if="youbike.act === '0'">（暫停營運）</span>
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
                    :class="{'bg-success': youbike.sbi > 0, 'bg-danger': youbike.sbi === '0'}"
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
      searchText: '',
      navActive: '',
      sidebarActive: false,
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
    youbikes() {
      if (this.youbikes.length > 1) {
        this.getWeathers();
      }
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
  methods: {
    getYoubikes() {
      const youbikeAPI = 'https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json';
      this.axios.get(youbikeAPI).then((response) => {
        if (response) {
          this.youbikes = Object.values(response.data.retVal);
          this.setFavYoubikes();
        } else {
          console.log('伺服器錯誤，請稍後再試');
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
    switchIcon(youbike) {
      if (youbike.act === '0') {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/6bd04058579f7751faad7875f2c93a72381ff93e/src/assets/images/marker-notworking.svg';
      }
      if (
        youbike.act === '1'
        && youbike.sbi === '0'
      ) {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/6bd04058579f7751faad7875f2c93a72381ff93e/src/assets/images/marker-noparking.svg';
      }
      if (
        youbike.act === '1'
        && youbike.bemp === '0'
      ) {
        return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/6bd04058579f7751faad7875f2c93a72381ff93e/src/assets/images/marker-nobike.svg';
      }
      return 'https://raw.githubusercontent.com/zou0u06/YouBike-map/0aa68fbd314578893b3d09b16a697b9f35164a76/src/assets/images/marker.svg';
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
          console.log('天氣API錯誤');
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
  created() {
    this.getYoubikes();
    if (document.body.clientWidth < 767.98) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  },
};
</script>

<style lang="scss">
@import "./assets/scss/all.scss";
</style>
