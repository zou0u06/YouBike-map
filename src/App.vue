<template>
  <div class="container-fluid">
    <div class="row">
      <button
        type="button"
        class="btn-sidebar"
        :class="{ 'd-none': sidebarActive, 'd-block': !sidebarActive}"
        @click="sidebarActive = !sidebarActive"
      >
        快點我
      </button>
      <div
        class="col-md-4 sidebar"
        :class="{ 'd-none': !sidebarActive, 'd-block': sidebarActive}"
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
              @click="switchNavsActive('searchs')"
              :class="{ 'text-secondary': navsActive === 'searchs'}"
            >搜尋結果</a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              @click="switchNavsActive('favs')"
              :class="{ 'text-secondary': navsActive === 'favs'}"
            >收藏站點</a>
          </li>
        </ul>
        <div
          v-if="navsActive === 'searchs'"
          class="sidebar-result"
        >
          <h6
            v-if="searchs.length === 0 || !searchs"
            class="mt-3 text-center"
          >查無相關站點</h6>
          <card-result
            v-else
            :bases="searchs"
            @changeNavsActive="closeSidebar()"
            @deleteFavYoubikes="deleteFavYoubikes"
            @addToFavYoubikes="addToFavYoubikes"
          />
        </div>
        <div
          v-if="navsActive === 'favs'"
          class="sidebar-result"
        >
          <h6
            v-if="favs.length === 0 || !favs"
            class="mt-3 text-center"
          >目前尚無收藏站點</h6>
          <card-result
            v-else
            :bases="favs"
            @changeNavsActive="closeSidebar()"
            @deleteFavYoubikes="deleteFavYoubikes"
            @addToFavYoubikes="addToFavYoubikes"
          />
        </div>
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
                <h6>資料更新時間  {{ youbike.mday|displayDate }}</h6>
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
      navsActive: '',
      sidebarActive: false,
      bases: [],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 13,
      center: [25.049, 121.515],
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
          this.navsActive = '';
          break;
        default:
          this.navsActive = 'searchs';
          break;
      }
    },
    // navsActive() {
    //   switch (this.navsActive) {
    //     case ''
    //   }
    // }
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
      }
      for (let i = 0; i < youbikesL; i++) {
        this.$set(this.youbikes[i], 'favored', false);
      }
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
      for (let i = 0; i < youbikesL; i++) {
        for (let j = 0; j < weathersL; j++) {
          if (
            this.youbikes[i].sarea === this.weathers[j].locationName
            && new Date().getHours() % 6 < 3
          ) {
            this.$set(this.youbikes[i], 'weather', this.weathers[j].weatherElement[1].time[0].elementValue[0].value);
            this.$set(this.youbikes[i], 'temperature', this.weathers[j].weatherElement[3].time[0].elementValue[0].value);
          } else if (
            this.youbikes[i].sarea === this.weathers[j].locationName
            && new Date().getHours() % 6 >= 3
          ) {
            this.$set(this.youbikes[i], 'weather', this.weathers[j].weatherElement[1].time[1].elementValue[0].value);
            this.$set(this.youbikes[i], 'temperature', this.weathers[j].weatherElement[3].time[1].elementValue[0].value);
          }
        }
      }
    },
    closeSidebar() {
      if (document.body.clientWidth < 767.98) {
        this.sidebarActive = false;
      }
    },
    switchNavsActive(keyword) {
      switch (this.navsActive) {
        case keyword:
          this.navsActive = '';
          break;
        default:
          this.navsActive = keyword;
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
