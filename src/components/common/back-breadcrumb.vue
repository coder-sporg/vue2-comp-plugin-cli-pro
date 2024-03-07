<template>
  <div class="fl-sta-cen bread-crumb">
    <svg
      class="niconfont mr-r-16 cursor"
      aria-hidden="true"
      style="width: 20px; height: 20px"
      @click="goBackHandle"
    >
      <use xlink:href="#nicon-fanhui"></use>
    </svg>
    <div class="" v-for="(item, index) in breadList" :key="index">
      <span
        class="f-t-16 mr-l-8 mr-r-8"
        style="color: #8a9099"
        v-show="index > 0"
        >/</span
      >
      <span
        class="f-t-16"
        :style="{ color: index < breadList.length - 1 ? '#8A9099' : '#111D3E' }"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      default: "",
    },
    breadList: {
      type: Array,
      default: [],
    },
  },
  methods: {
    goBackHandle() {
      this.$router.push(this.path);
      this.$store.state.bredcrumbVisible = false;
    },
  },
  mounted() {
    this.$store.state.bredcrumbVisible = true;
  },
  activated() {
    this.$store.state.bredcrumbVisible = true;
  },
  beforeDestroy() {
    this.$store.state.bredcrumbVisible = false;
  },
  deactivated() {
    this.$store.state.bredcrumbVisible = false;
  },
};
</script>

<style lang="scss" scoped>
.bread-crumb {
  padding: 0 15px 16px;
}
</style>
