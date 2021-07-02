<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-4">
        <div class="featurebox">
          <div class="featurebox-bar">
            <input
              type="text"
              v-model="searchText"
              placeholder="尋找站點"
              class="featurebox-bar-input"
            />
            <span
              class="featurebox-bar-icon"
              @click="navsActive = 'searchs'"
            >
              <i class="fas fa-search"/>
            </span>
            <span
              class="featurebox-bar-icon"
              @click="navsActive = 'favs'"
            >
              <i class="fas fa-star"/>
            </span>
          </div>
          <ul
            v-if="navsActive === 'searchs'"
            class="list-group featurebox-result"
          >
            <li
              v-for="search in searchs"
              :key="search.sno"
              class="list-group-item"
              :class="{ 'text-danger': search.act === '0'}"
              @click="focusOn(search)"
            >
              <h4 class="d-flex justify-content-between align-items-center">
                <span>{{ search.sna }}</span>
                <i
                  v-if="!search.favored"
                  class="icon-favs far fa-star"
                  @click.stop="addToFavYoubikes(search.sno)"
                />
                <i
                  v-else
                  class="icon-favs fas fa-star"
                  @click.stop="deletedFavYoubikes(search.sno)"
                />
              </h4>
              <h6 class="d-flex justify-content-between">
                <span v-if="search.act === '1'">正常營運</span>
                <span v-else>暫停營運</span>
                <span>可借：{{ search.sbi }}</span>
                <span>可還：{{ search.bemp }}</span>
              </h6>
              <h6 class="mb-0">地址：{{ search.ar }}</h6>
            </li>
          </ul>
          <ul
            v-if="navsActive === 'favs'"
            class="list-group featurebox-result"
          >
            <li
              v-if="favs.length === 0"
              class="mt-3 text-center"
            >
              目前尚無儲存站點
            </li>
            <li
              v-for="fav in favs"
              :key="fav.sno"
              class="list-group-item"
              :class="{ 'text-danger': fav.act === '0'}"
              @click="focusOn(fav)"
            >
              <h4 class="d-flex justify-content-between align-items-center">
                <span>{{ fav.sna }}</span>
                <i
                  v-if="!fav.favored"
                  class="icon-favs far fa-star"
                  @click.stop="addToFavYoubikes(fav.sno)"
                />
                <i
                  v-else
                  class="icon-favs fas fa-star"
                  @click.stop="deletedFavYoubikes(fav.sno)"
                />
              </h4>
              <h6 class="d-flex justify-content-between">
                <span v-if="fav.act === '1'">正常營運</span>
                <span v-else>暫停營運</span>
                <span>可借：{{ fav.sbi }}</span>
                <span>可還：{{ fav.bemp }}</span>
              </h6>
              <h6 class="mb-0">地址：{{ fav.ar }}</h6>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-8 map">
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
              <l-popup :class="{ 'text-danger': youbike.act === '0'}">
                <h4 class="d-flex justify-content-between align-items-center">
                  <span>{{ youbike.sna }}</span>
                  <i
                    v-if="!youbike.favored"
                    class="icon-popup icon-favs far fa-star"
                    @click.stop="addToFavYoubikes(youbike.sno)"
                  />
                  <i
                    v-else
                    class="icon-popup icon-favs fas fa-star"
                    @click.stop="deletedFavYoubikes(youbike.sno)"
                  />
                </h4>
                <h6 class="d-flex justify-content-between">
                  <span v-if="youbike.act === '1'">正常營運</span>
                  <span v-else>暫停營運</span>
                  <span>可借：{{ youbike.sbi }}</span>
                  <span>可還：{{ youbike.bemp }}</span>
                </h6>
                <h6>地址：{{ youbike.ar }}</h6>
                <h6>近三小時內天氣：{{ youbike.weather }}</h6>
                <h6>近三小時內平均溫度：{{ youbike.temperature }}°C</h6>
                <h6>資料更新時間  {{ youbike.mday|displayDate }}</h6>
              </l-popup>
            </l-marker>
          </v-marker-cluster>
        </l-map>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
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
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 13,
      center: [25.047739238212436, 121.5168348654844],
    };
  },
  computed: {
    searchs() {
      switch (this.searchText) {
        case '': {
          return false;
        }
        default: {
          const tempSearchs = [];
          this.youbikes.forEach((item, oriIndex) => {
            if (
              item.ar.indexOf(this.searchText) > -1
              || item.sna.indexOf(this.searchText) > -1
              || item.sarea.indexOf(this.searchText) > -1
            ) {
              tempSearchs.push({ ...item, oriIndex });
            }
          });
          return tempSearchs;
        }
      }
    },
    favs() {
      const tempFavs = [];
      this.youbikes.forEach((item, oriIndex) => {
        if (item.favored) {
          tempFavs.push({ ...item, oriIndex });
        }
      });
      return tempFavs;
    },
  },
  watch: {
    youbikes() {
      if (this.youbikes.length > 1) {
        this.getWeathers();
      }
    },
    searchText(searchText) {
      switch (searchText) {
        case '':
          this.navsActive = '';
          break;
        default:
          this.navsActive = 'searchs';
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
    deletedFavYoubikes(deletedId) {
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
      this.youbikes.forEach((item, index) => {
        this.weathers.forEach((ite) => {
          if (
            item.sarea === ite.locationName
            && new Date().getHours() % 6 < 3
          ) {
            this.$set(this.youbikes[index], 'weather', ite.weatherElement[1].time[0].elementValue[0].value);
            this.$set(this.youbikes[index], 'temperature', ite.weatherElement[3].time[0].elementValue[0].value);
          } else if (
            item.sarea === ite.locationName
            && new Date().getHours() % 6 >= 3
          ) {
            this.$set(this.youbikes[index], 'weather', ite.weatherElement[1].time[1].elementValue[0].value);
            this.$set(this.youbikes[index], 'temperature', ite.weatherElement[3].time[1].elementValue[0].value);
          }
        });
      });
    },
    focusOn(display) {
      if (document.body.clientWidth < 767.98) {
        const tempLat = String(Number(display.lat) + 0.0021);
        this.$refs.map.mapObject.setView([tempLat, display.lng], 17);
      } else {
        this.$refs.map.mapObject.setView([display.lat, display.lng], 17);
      }
      this.$nextTick(() => {
        this.$refs.marker[display.oriIndex].mapObject.openPopup();
      });
    },
  },
  created() {
    this.getYoubikes();
  },
};
</script>

<style lang="scss">
@import "./assets/scss/all.scss";

.map {
  height: 100vh;
}
.featurebox {
  position: fixed;
  top: 30px;
  left: 10px;
  right: 10px;
  z-index: 401;
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
.featurebox-bar {
  height: 60px;
  display: flex;
  justify-content: end;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  line-height: 1.5;
  font-weight: 400;
  font-size: 1rem;
  color: #212529;
}
.featurebox-bar-input {
  flex: 1 1 auto;
  min-width: 140px;
  border: none;
  padding: 0.375rem 0.75rem;
}
.featurebox-bar-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 44px;
  text-align: center;
  cursor: pointer;
}
.featurebox-result {
  height: 25vh;
  overflow-y: auto;
  cursor: pointer;
  @include media-breakpoint-up(md) {
    height: calc(100vh - 68px);
  }
}
.icon-favs {
  font-size: 20px;
}
.icon-popup {
  position: relative;
  bottom: 2px;
}
.leaflet-popup-content {
  width: 260px !important;
}
.leaflet-popup-close-button {
  display: none;
}
</style>
