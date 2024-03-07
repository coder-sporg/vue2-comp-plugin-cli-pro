<script>
export default {
  name: "CustomConfirm",
  props: {
    message: [String, Object, Number],
    // 支持option选项式、VNode、string
    title: [String, Object, Number],
    options: Object,
    resolveFn: Function,
    rejectFn: Function,
  },
  data() {
    return {
      visible: true,
    };
  },
  methods: {
    confirm() {
      this.visible = false;
      this.resolveFn();
    },
    cancel() {
      this.visible = false;
      this.rejectFn();
    },
  },
  render() {
    let isOption;
    if (this.title.tag || ["string", "number"].includes(typeof this.title)) {
      isOption = false;
    } else {
      isOption = true;
    }
    return (
      <el-dialog
        visible={this.visible}
        width="400px"
        before-close={this.cancel}
      >
        <div slot="title">
          {isOption ? (
            <div class="fl-sta-cen">
              {this.title.icon ? (
                <div
                  class={`${
                    this.title.isBlue ? "normal" : "warning"
                  }-icon title-icon-box fl-cen-cen mr-r-8`}
                >
                  <i class={`niconfont f-t-16 ${this.title.icon}`}></i>
                </div>
              ) : (
                ""
              )}
              <b>{this.title.text}</b>
            </div>
          ) : (
            this.title || "提示"
          )}
        </div>
        <div>{this.message}</div>
        <div slot="footer" class="dialog-footer">
          <el-button
            class={`${
              this.title.isBlue ? "normal" : "warning"
            }-cancel-btn cancel-btn`}
            onclick={this.cancel}
          >
            取 消
          </el-button>
          <el-button
            class={`${
              this.title.isBlue ? "normal" : "warning"
            }-confirm-btn confirm-btn`}
            type="primary"
            onclick={this.confirm}
          >
            确 定
          </el-button>
        </div>
      </el-dialog>
    );
  },
};
</script>
<style lang="scss" scoped>
.title-icon-box {
  height: 34px;
  width: 34px;
  border-radius: 50%;
}

.warning-icon {
  color: var(--defaultNwarnColors);
  background: rgba(248, 104, 57, 0.2);
}

.normal-icon {
  color: var(--defaultcolors);
  background: rgba(86, 130, 247, 0.2);
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
    &:focus .el-dialog__close,
    &:hover .el-dialog__close {
      color: var(--defaultNwarnColors);
    }
  }
  .el-dialog__footer {
    padding-top: 0px;
  }
  .btn {
    height: 36px;
    width: 76px;
    // line-height: 36px;
    border-radius: 8px;
  }
  .cancel-btn {
    @extend .btn;
    border: 1px solid #e6eaf5;
    background: #fff;
    color: #606266;
  }

  .warning-cancel-btn {
    &:focus {
      color: var(--defaultNwarnColors);
    }
    &:hover {
      background: #fff;
      span {
        color: var(--defaultNwarnColors);
      }
    }
  }

  .normal-cancel-btn {
    &:focus {
      color: var(--defaultcolors);
    }
    &:hover {
      background: #fff;
      span {
        color: var(--defaultcolors);
      }
    }
  }
  .confirm-btn {
    @extend .btn;
  }

  .warning-confirm-btn {
    border: 1px solid var(--defaultNwarnColors);
    background: var(--defaultNwarnColors);
  }

  .normal-confirm-btn {
    border: 1px solid var(--defaultcolors);
    background: var(--defaultcolors);
  }
}
</style>
