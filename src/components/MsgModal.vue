<template>
  <div
    class="modal fade"
    id="msgModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    aria-labelledby="msgModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div
          class="modal-header d-flex"
          :class="`bg-${theme}`"
        >
          <h5
            id="msgModalLabel"
            class="modal-title text-white"
          >{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <div class="modal-body">
          <h6 class="lh-base">{{ action }}</h6>
        </div>
        <div class="modal-footer">
          <!-- 依事件不同使用不同的按鍵及動作 -->
          <button
            type="button"
            class="btn btn-outline-dark"
            data-bs-dismiss="modal"
          >關閉</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from 'bootstrap/js/dist/modal';

export default {
  data() {
    return {
      theme: '',
      title: '',
      action: '',
    };
  },
  computed: {
    msg() {
      return this.$store.state.msg;
    },
  },
  watch: {
    msg: {
      handler() {
        switch (this.msg.event) {
          case 'errorYoubike': {
            this.title = '伺服器錯誤';
            this.theme = 'danger';
            this.action = 'YouBike 網站伺服器錯誤，請稍後再使用';
            this.msgModal.show();
            this.dismissWithTiming();
            break;
          }
          default: {
            this.title = '伺服器錯誤';
            this.theme = 'danger';
            this.action = '氣象局網站伺服器錯誤，以下將為您呈現無氣象資訊的版本';
            this.msgModal.show();
            this.dismissWithTiming();
            break;
          }
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.msgModal = new Modal('#msgModal');
  },
  methods: {
    dismissWithTiming() {
      setTimeout(() => {
        this.msgModal.hide();
      }, 5000);
    },
  },
};
</script>

<style>
</style>
