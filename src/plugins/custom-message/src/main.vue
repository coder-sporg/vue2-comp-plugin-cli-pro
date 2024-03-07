<template>
  <transition name="message-fade">
    <div
      :class="['message', 'message-' + type, center ? 'is-center' : '']"
      :style="{ top: offset + 'px' }"
      v-if="visible"
    >
      <p class="message-content">{{ message }}</p>
      <i class="icon el-icon-close" v-if="showClose"></i>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    offsetTop: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      message: "默认信息",
      type: "success",
      center: true,
      offset: 20,
      visible: true,
      duration: 2000,
      timer: null,
      showClose: false,
    };
  },
  mounted() {
    this.offset = this.offsetTop;
    this.timer = setTimeout(() => {
      if (this.visible) {
        this.close();
      }
    }, this.duration);
  },
  methods: {
    close() {
      this.visible = false;
      //如果该组件可以接收到this.onClose方法则调用该方法
      //该方法是在该消息弹框消失的时候被触发
      if (typeof this.onClose === "function") {
        this.onClose();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./main.css";
</style>
