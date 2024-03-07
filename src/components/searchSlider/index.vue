<template>
  <div
    class="full-height fl-sta-cen side-container"
    :class="{ shrink: isShrink }"
  >
    <div
      class="bg-white radius-8 tree-container full-height pd-16"
      :style="{ width: isShrink ? 0 : '264px' }"
      v-show="!isShrink"
    >
      <div class="search-section mr-b-16">
        <el-input
          v-model.trim="searchValue"
          placeholder="请输入关键字"
          clearable
          @keyup.enter.native="searchHandle"
          @clear="searchHandle"
        >
          <i
            slot="prefix"
            class="el-input__icon el-icon-search cursor"
            @click="searchHandle"
          ></i>
        </el-input>
      </div>
      <div class="tree-section">
        <el-tabs v-model="activeTab">
          <template v-for="tab in listTab">
            <el-tab-pane class="pd-t-16" :label="tab.label" :name="tab.name">
              <slot
                style="height: 100%"
                :name="tab.slotName || tab.name"
              ></slot>
            </el-tab-pane>
          </template>
        </el-tabs>
      </div>
    </div>
    <div class="shrink-btn cursor" @click="shrinkClick">
      <img
        v-if="!isShrink"
        src="@/assets/imgs/struct-spread.svg"
        alt=""
        srcset=""
      />
      <img v-else src="@/assets/imgs/struct-shrink.svg" alt="" srcset="" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    activeName: {
      type: String,
      default: "",
    },
    /**
     * @param listTab[0].label
     * @param listTab[0].name
     * @param listTab[0].slotName 没有该值时使用name作为插槽名称
     * **/
    listTab: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      activeTab: this.activeName,
      searchValue: "",
      isShrink: false,
    };
  },
  // watch: {
  //     activeName: {
  //         handle: function (newVal) {
  //             this.activeTab = newVal;
  //             console.log('newVal', newVal);
  //             console.log('this.activeTab', this.activeTab);
  //         },
  //         immediate: true,
  //     },
  // },
  methods: {
    // 收缩、展开
    shrinkClick() {
      this.isShrink = !this.isShrink;
    },
    searchHandle() {
      this.$emit("search", {
        activeName: this.activeTab,
        value: this.searchValue,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-container {
  width: 290px;
  border: 1px solid rgba(238, 242, 254, 1);
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.el-input__icon {
  margin-top: 2px;
}
::v-deep {
  .el-tabs__header {
    background: #eef2fe;
  }
  .tree-container .el-tabs__nav-wrap:not(.is-scrollable) {
    .el-tabs__nav-scroll {
      display: flex;
      justify-content: center;
    }
  }
  .el-input__inner {
    border-radius: 8px;
  }
}
.side-container {
  width: 264px;
  margin-right: 16px;
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  .shrink-btn {
    position: absolute;
    top: 50%;
    right: -12px;
    height: 40px;
    width: 8px;
    transform: translateY(-20px);
  }
}
.shrink {
  width: 0;
  margin-right: 0px;
  .shrink-btn {
    right: 4px;
  }
}
.tree-section {
  height: calc(100% - 50px);
}
::v-deep .el-tabs {
  height: 100%;
}
::v-deep .el-tabs__content {
  height: calc(100% - 28px);
}
::v-deep .el-tab-pane {
  height: 100%;
}
</style>
