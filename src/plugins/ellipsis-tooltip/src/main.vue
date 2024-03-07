<template>
  <el-tooltip :effect="effect" :disabled="disableTip" :placement="placement">
    <template #content>
      <div class="tooltip-content" :classContent="className">
        {{ text }}
      </div>
    </template>
    <div class="ellipsis" :class="className" @mouseover="onMouseOver">
      <span ref="ellipsis">{{ text }}</span>
    </div>
  </el-tooltip>
</template>
<script>
export default {
  name: "EllipsisTooltip",
  props: {
    text: {
      type: String,
      default: "",
    },

    placement: {
      type: String,
      default: "top-start",
    },

    effect: {
      type: String,
      default: "dark",
    },

    // 展示内容样式
    className: {
      type: String,
      default: "",
    },

    // 提示内容样式
    classContent: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      ellipsis: "",
      disableTip: false,
    };
  },
  methods: {
    onMouseOver() {
      let parentWidth = this.$refs.ellipsis.parentNode.offsetWidth;
      let contentWidth = this.$refs.ellipsis.offsetWidth;
      this.disableTip = contentWidth <= parentWidth;
    },
  },
};
</script>
<style lang="scss" scoped>
.tooltip-content {
  max-width: 50vw;
}
.ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
