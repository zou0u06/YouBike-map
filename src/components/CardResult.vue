<template>
  <div>
    <div
      v-for="base in bases"
      :key="base.sno"
      class="cardresult"
      @click="focusOnMarkers(base)"
    >
      <div class="d-flex">
        <h5 class="flex-fill text-primary">
          {{ base.sna }}
          <span v-if="base.act === '0'
            || (base.sbi === '0'
            && base.bemp === '0')"
          >（暫停營運）</span>
        </h5>
        <i
          v-if="base.favored"
          class="cardresult-icon-favs fas fa-star"
          @click.stop="deleteFavYoubikes(base.sno)"
        />
        <i
          v-else
          class="cardresult-icon-favs far fa-star"
          @click.stop="addToFavYoubikes(base.sno)"
        />
      </div>
      <h6 class="mb-0">{{ base.ar }}</h6>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bases: Array,
  },
  methods: {
    focusOnMarkers(base) {
      const tempLat = String(Number(base.lat) + 0.0013);
      this.$parent.$refs.map.mapObject.setView([tempLat, base.lng], 17);
      this.$parent.$refs.marker[base.oriIndex].mapObject.openPopup();
      this.$emit('closeSidebar');
    },
    deleteFavYoubikes(baseId) {
      this.$emit('deleteFavYoubikes', baseId);
    },
    addToFavYoubikes(baseId) {
      this.$emit('addToFavYoubikes', baseId);
    },
  },
};
</script>

<style>

</style>
