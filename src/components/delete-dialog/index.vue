<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    :modal="modal"
    custom-class="delete-dialog"
  >
    <div class="flex">
      <i class="iconfont icontishi" v-if="showIcon"></i>
      <div class="flex fl-col">
        <span class="dialog-text fl-cen-cen" v-if="type === 'gateway'">
          请确认是否删除网关“
          <span class="more-text gateway-more" :title="name">{{ name }}</span
          >”?
        </span>
        <span class="dialog-text" v-if="type === 'gatewayPoint'">
          请确认是否删除网关节点“
          <span class="more-text gatewayPoint-more" :title="name">{{
            name
          }}</span
          >”？请做好网关节点下资源迁移，否则可能会造成资源无法访问
        </span>
        <span class="dialog-text" v-if="type === 'point' && balanceList.length">
          “<span class="more-text point-balance-more" :title="name">{{
            name
          }}</span
          >”下存在网关节点，无法删除，请先删除接入点下网关节点
        </span>
        <span
          class="dialog-text fl-cen-cen"
          v-if="type === 'point' && !balanceList.length"
        >
          请确认是否删除接入点“
          <span class="more-text point-more" :title="name">{{ name }}</span
          >”?
        </span>
        <span class="dialog-text" v-if="type === 'issue'">
          请确定是否将当前网关及节点配置信息下发到终端，该操作将会触发终端重新加载当前节点配置
        </span>
        <!-- <span class="dialog-message">{{message}}</span> -->
        <div
          class="dialog-select-gateway mr-t-10 fl-sta-cen"
          v-if="type === 'gatewayPoint'"
        >
          <span class="dialog-text mr-r-10"
            >请指定该网关节点下资源迁移至哪一个节点</span
          >
          <el-select
            v-model="gatePointValue"
            :placeholder="$t('common.select_default_place')"
            :style="{ width: '180px', fontSize: '13px', margin: 0 }"
            @change="changePointHandle"
          >
            <el-option
              v-for="(gateway, index) in gatewayPointList"
              :key="index"
              :label="gateway.label"
              :value="gateway.value"
            ></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer" v-if="btnType === 'submit'">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="deleteAccessPointHandle">
        确 定
        <!-- <span class="btn-text">确认提交</span>
                <i class="iconfont iconbai7"></i> -->
      </el-button>
    </span>
    <span slot="footer" class="dialog-footer close-dialog" v-else>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: "descriptions",
  props: {
    title: {
      type: String,
      default: "提示",
    },
    dialogWidth: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    modal: {
      type: Boolean,
      default: true,
    },
    btnType: {
      type: String,
      default: "submit",
    },
    gatewayStatus: {
      type: Boolean,
      default: false,
    },
    gatewayPointList: {
      type: Array,
      default: () => [],
    },
    gatewayPointValue: {
      type: String,
      default: "",
    },
    balanceList: {
      type: Array,
      default: () => [],
    },
    // customClass: {
    //     type: String,
    //     default: 'delete-dialog'
    // }
  },
  watch: {
    gatewayPointValue(value) {
      this.gatePointValue = value;
    },
  },
  data() {
    return {
      dialogVisible: false,
      gatePointValue: this.gatewayPointValue,
    };
  },
  methods: {
    open() {
      this.dialogVisible = true;
    },
    close() {
      this.dialogVisible = false;
    },
    deleteAccessPointHandle() {
      if (this.type === "issue") {
        this.$emit("gateway-issue");
      } else {
        this.$emit("delete-accesspoint");
      }
    },
    changePointHandle(value) {
      this.$emit("select-pointvalue", value);
    },
  },
};
</script>
<style lang="scss">
.delete-dialog {
  .el-dialog__header {
    .el-dialog__headerbtn {
      top: 34px;
      right: 32px;
      font-size: 16px;
    }
  }
  .el-dialog__title {
    color: #121212;
    font-size: 20px;
  }
  .more-text {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .gateway-more {
    max-width: 150px;
  }
  .gatewayPoint-more {
    vertical-align: middle;
    max-width: 330px;
  }
  .point-more {
    max-width: 115px;
  }
  .point-balance-more {
    vertical-align: middle;
    max-width: 260px;
  }
  .icontishi {
    margin-left: 40px;
    font-size: 24px;
    margin-right: 16px;
    color: #fd3240;
    margin-top: 3px;
  }
  .dialog-text,
  .dialog-message {
    color: #3a424f;
    font-size: 14px;
    line-height: 26px;
  }
  .dialog-select-gateway {
    color: #3a424f;
    font-size: 14px;
    line-height: 26px;
  }
  .el-dialog__body {
    padding-right: 80px;
  }
  .el-dialog__footer {
    padding: 10px 32px 32px;
    .el-button {
      span {
        font-size: 13px;
      }
    }
  }
  // .dialog-footer {
  //     .custom-btn {
  //         height: 40px;
  //         border-radius: 20px;
  //     }
  //     .cancel-btn {
  //         border: 1px solid #CDCDCE;
  //         color: #747C88;
  //         padding: 0 40px;
  //     }
  //     .sure-btn {
  //         padding-left: 32px;
  //         padding-right: 8px;
  //         position: relative;
  //     }
  //     .btn-text {
  //         vertical-align: middle;
  //     }
  //     .iconbai7 {
  //         margin-left: 16px;
  //         font-size: 24px;
  //         vertical-align: middle;
  //         color: #1650D3;
  //     }
  // }
}
</style>
