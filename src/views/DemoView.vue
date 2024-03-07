<template>
  <div class="demo-wrap">
    <el-button class="btn" type="info" @click="addTip">添加提示</el-button>
    <div class="box" ref="box"></div>
    <div class="fl-cen-cen">
      <ellipsis />
    </div>
    <el-button type="primary" @click="start">执行动画</el-button>
  </div>
</template>

<script>
import Ellipsis from "./components/ellipsis.vue";
export default {
  name: "DemoView",
  components: {
    Ellipsis,
  },
  methods: {
    addTip() {
      this.$customMessage("哈哈哈");
      this.$customMessage.info("信息提示");
      this.$customMessage.success("成功啦");
      this.$customMessage.error("报错啦");
      this.$customMessage.warning("警告喔");
    },
    start() {
      let transform = this.$refs.box.style.transform;
      if (!transform) {
        this.$refs.box.style.transform = "translateY(-100px)";
        this.$refs.box.style.opacity = "0";
      } else {
        this.$refs.box.style.transform = "";
        this.$refs.box.style.opacity = "1";
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.demo-wrap {
  background-color: #f8fafe;
}

.btn {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 100px;
}

.box {
  width: 50px;
  height: 50px;
  margin: auto;
  background-color: orange;
  opacity: 1;
  transition: all 0.4s;
  //   animation: move 2s linear infinite;
}
@keyframes move {
  //   from {
  //     transform: translate(100px, 100px);
  //   }
  to {
    transform: translate(-100px, -100px);
  }
}
</style>
