<template>
  <el-dialog :visible.sync="elvisible" :width="width" :before-close="cancel">
    <div slot="title">
      <div class="fl-sta-cen">
        <div v-if="icon" class="title-icon-box fl-cen-cen">
          <i class="niconfont f-t-16 color-primary" :class="icon"></i>
        </div>
        <b>{{ title }}</b>
      </div>
    </div>
    <div class="ov-hide">
      <slot></slot>
    </div>
    <div>
      <slot name="footer">
        <div class="fl-end-cen dialog-footer">
          <el-button class="btn" @click="cancel">取 消</el-button>
          <el-button class="btn" type="primary" @click="confirm"
            >确 定</el-button
          >
        </div>
      </slot>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "CustomDialog",
  props: {
    title: String,
    icon: String,
    visible: Boolean,
    width: {
      type: String,
      default: "400px",
    },
  },
  data() {
    return {
      elvisible: this.visible,
    };
  },
  watch: {
    visible(val) {
      this.elvisible = val;
    },
  },
  methods: {
    cancel() {
      this.$emit("update:visible", false);
      this.$emit("cancel");
    },
    confirm() {
      this.$emit("update:visible", false);
      this.$emit("confirm");
    },
  },
};
</script>
<style lang="scss" scoped>
.title-icon-box {
  height: 34px;
  width: 34px;
  color: var(--defaultNwarnColors);
  border-radius: 50%;
  background: rgba(86, 130, 247, 0.2);
  margin-right: 8px;
}
::v-deep {
  .el-dialog {
    border-radius: 8px;
  }
  .el-dialog__body {
    padding: 20px 24px;
  }
  .el-dialog__header {
    padding: 24px 24px;
    padding-bottom: 0;
  }
  .el-dialog__headerbtn {
    top: 16px;
    right: 16px;
  }
  .el-dialog__footer {
    padding-top: 0px;
  }
  .btn {
    height: 36px;
    width: 76px;
    line-height: 36px;
    border-radius: 8px;
  }
}
</style>
