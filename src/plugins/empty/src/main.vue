<template>
  <div class="full-width full-height fl-cen-cen">
    <div class="fl-cen-cen fl-col empty">
      <img
        class="empty-img"
        :style="{ width: size + 'px', height: size * 0.65 + 'px' }"
        src="~/@/assets/img/no-data.png"
        alt=""
        srcset=""
      />
      <p class="color-grey text-center empty-desc">暂无数据</p>
    </div>
  </div>
</template>
<script>
export default {
  name: "Empty",
  props: {
    size: {
      type: Number,
      default: 220,
    },
  },
};
</script>
<style lang="scss" scoped>
.empty {
  user-select: none;
  position: relative;
  .empty-img {
    display: block;
  }
  .empty-desc {
    margin-top: 24px;
    font-size: 14px;
    line-height: 14px;
  }
}
</style>
