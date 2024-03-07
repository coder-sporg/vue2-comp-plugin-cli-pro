<template>
  <el-dialog
    :width="width"
    custom-class="dialog-wrapper"
    :visible.sync="visible"
    :before-close="cancelHandle"
    :title="title"
  >
    <slot name="body">
      <span class="f-t-16 fl-cen-sta">
        <i class="iconfont" :class="icon" :style="{ color: iconColor }"></i>
        {{ tipText }}
      </span>
    </slot>
    <div slot="footer" class="fl-cen-cen">
      <el-button @click="cancelHandle">取消</el-button>
      <el-button class="mr-l-24" type="primary" @click="confirmHandle">{{
        leftBtnText
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "DialogWrapper",
  props: {
    // 提示框title
    title: {
      type: String,
      default: "提示",
    },

    width: {
      type: String,
      default: "450px",
    },

    // 提示的文字内容
    tipText: {
      type: String,
      default: "您修改的内容尚未保存, 是否退出编辑",
    },

    // iconfont图标
    icon: {
      type: String,
      default: "icontishi",
    },

    // iconfont图标颜色
    iconColor: {
      type: String,
      default: "#ff9023",
    },

    isCenter: {
      type: Boolean,
      default: true,
    },

    // 右侧按钮文字
    leftBtnText: {
      type: String,
      default: "退出",
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      console.log("z");
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmHandle() {
      this.$emit("confirm");
    },
    cancelHandle() {
      this.$emit("cancel");
      this.visible = false;
    },
  },
};
</script>
<style lang="scss">
.dialog-wrapper {
  .el-dialog__header {
    text-align: left;
  }
  .el-dialog__body {
    text-align: center;
    color: #121212;
    .iconfont {
      font-size: 28px;
      margin-right: 10px;
      margin-top: -8px;
    }
  }
  .el-dialog__footer {
    .el-button {
      width: 100px;
      margin-left: 24px;
    }
    .el-button:first-of-type {
      margin-left: 0;
    }
  }
}
</style>
