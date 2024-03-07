<template>
  <div :class="isFullHeight ? 'full-height' : 'auto-height'">
    <!-- 自定义组和架构树 -->
    <div :class="isPadding ? 'orgTree-section' : ''">
      <div v-loading="customLoading" class="full-height">
        <div class="fl-bet-cen mr-b-15 title-div" v-if="titleName">
          {{ titleName }}
        </div>
        <ul
          v-show="!isSearchList"
          style="height: calc(100% - 55px)"
          class="ov-auto"
        >
          <li v-for="custom in customList" :key="custom.id" class="radius">
            <div
              v-if="custom.splidLine"
              class="pd-t-10 mr-b-16"
              style="border-bottom: 1px solid #dcdee4"
            ></div>
            <div
              class="fl-bet-sta custom-item"
              @click="nodeClick('custom', custom, 'first', null)"
            >
              <div
                class="fl-sta-sta mr-r-16"
                :class="{
                  numberText: showFixNumber,
                  'width-90': !showFixNumber,
                }"
              >
                <div class="icon-box">
                  <template v-if="custom.icon">
                    <i class="niconfont icon-style" :class="custom.icon"></i>
                  </template>
                  <template v-else>
                    <i
                      class="niconfont icon-style nicon-fengxian"
                      v-if="custom.label == '风险标签'"
                    ></i>
                    <i
                      class="niconfont icon-style"
                      :class="iconName"
                      v-else
                    ></i>
                  </template>
                </div>
                <span
                  class="customLabel text-flow"
                  :class="{ 'auto-width': showFixNumber }"
                  :title="custom.label"
                >
                  {{ custom.label }}
                </span>
              </div>
              <template v-if="showTotal">
                <div class="auto-width" v-if="showFixNumber">
                  ({{ custom.total || 0 }})
                </div>
              </template>
              <div class="arrow-tip">
                <i
                  class="el-icon-caret-right"
                  :class="{ trans: custom.isLeaf, transfather: !custom.isLeaf }"
                ></i>
              </div>
            </div>
            <transition name="fade">
              <div class="second-all-div" v-if="custom.data && custom.isLeaf">
                <template v-for="child in custom.data">
                  <div
                    class="fl-bet-sta second-div mr-r-16"
                    :class="
                      showActiveState && currNode == child.id ? 'is-active' : ''
                    "
                    @click="nodeClick('custom', child, 'second', null)"
                  >
                    <div
                      class="customLabel text-flow"
                      :class="{ numberText: showFixNumber }"
                      :title="child.label"
                    >
                      {{ child.label }}
                    </div>
                    <template v-if="showTotal">
                      <div style="flex: 1">({{ child.total || 0 }})</div>
                    </template>
                  </div>
                </template>
              </div>
            </transition>
          </li>
        </ul>
        <ul
          v-show="isSearchList && customList.length > 0"
          style="height: calc(100% - 55px)"
          class="ov-auto 1234"
        >
          <li v-for="custom in customList" :key="custom.id" class="radius">
            <div class="second-all-div">
              <template>
                <div
                  class="fl-bet-sta second-div mr-r-16"
                  :class="
                    showActiveState && currNode == custom.id ? 'is-active' : ''
                  "
                  @click="nodeClick('custom', custom, 'second', null)"
                >
                  <div
                    class="customLabel text-flow"
                    :class="{ numberText: showFixNumber }"
                    :title="custom.label"
                  >
                    {{ custom.label }}
                  </div>

                  <template v-if="showTotal">
                    <div style="flex: 1">({{ custom.total || 0 }})</div>
                  </template>
                </div>
              </template>
            </div>
          </li>
        </ul>
        <div
          class="canvas-div fl-cen-cen"
          v-show="isSearchList && customList.length === 0"
        >
          <div style="position: relative; height: 100%">
            <img
              src="@/assets/imgs/dataSecurity/no-data.png"
              alt="暂无数据"
              style="width: 100%; height: 100%; margin-top: 40%"
            />
            <div
              style="
                width: 100%;
                text-align: center;
                color: #9396a3;
                margin-top: 24px;
              "
            >
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isPadding: {
      type: Boolean,
      default: true,
    },

    isFullHeight: {
      type: Boolean,
      default: true,
    },
    //icon图标
    iconName: {
      type: String,
      default: "nicon-API", //TODO:默认图标
    },
    // 是否
    isSearchList: {
      type: Boolean,
      default: false,
    },
    customList: {
      type: Array,
      default: () => [],
    },
    customLoading: {
      type: Boolean,
      default: false,
    },
    // 顶部总分类名称
    titleName: {
      type: String,
      default: "全部",
    },
    // 超过宽度...展示
    showFixNumber: {
      type: Boolean,
      default: false,
    },
    //是否展示选中状态
    showActiveState: {
      type: Boolean,
      default: true,
    },
    //是否展示数字
    showTotal: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      search: "",
      currNode: null,
    };
  },
  methods: {
    /** 搜索 */
    searchHandle() {
      this.$emit("treeSearch", this.search);
    },
    /** 节点点击 */
    nodeClick(type, data, node, element) {
      if (node == "first") {
        data.isLeaf = !data.isLeaf;
        this.currNode = null;
      } else if (node == "second") {
        this.$nextTick(() => {
          this.currNode = data.id;
          this.$emit("nodeClick", data, node, element);
        });
      }
    },
  },
  mounted() {
    this.routeName = this.$route.name;
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-button--small {
  padding-top: 8px;
  padding-bottom: 8px;
}
.auto-height {
  height: fit-content;
}
.custom-tree-node {
  font-size: 14px;
  padding-right: 5px;
}
.more-button {
  color: #8d95a8;
}
.icon-more {
  position: absolute;
  right: 12px;
}
.edit-icon {
  color: #2994ff;
  margin-right: 10px;
}
.custom-item {
  line-height: 32px;
  cursor: pointer;
  position: relative;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #333333;
  background: #f8fafe;
  background: #f8fafe;
  margin: 0 0 8px;
}
.custom-item:hover {
  background-color: #f5f7fa;
}
.second-div {
  line-height: 32px;
  padding: 0 16px 0 30px;
  cursor: pointer;
  position: relative;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #333333;
  margin: 0 0 4px;
}
.second-div:hover {
  transition-delay: 0s;
  background-color: #f5f7fa;
}
.backColor {
  background-color: #f5f7fa;
}
.custom-item:focus {
  background-color: unset;
}
.is-active {
  background-color: rgb(72, 128, 255, 0.08);
  color: var(--defaultcolors);
}
.icon-box {
  width: 28px;
}
.custom-item .customLabel {
  width: auto;
}
.numberText {
  width: auto !important;
  margin-right: 4px;
  max-width: 75%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.arrow-tip {
  width: 16px;
  height: 16px;
  border-radius: 4px 4px 4px 4px;
  position: relative;
  top: 8px;
  text-align: center;
  right: 4px;
  i {
    font-size: 10px;
    color: #8a9099;
    font-weight: 600;
    position: absolute;
    top: 2px;
    left: 2px;
  }
}
.arrow-tip:hover {
  background: #e6eaf5;
}

.splitLine {
  height: 1px;
  width: 100%;
  background: #dcdee4;
}
.treeOpt-popover .el-button--text {
  color: #494f55;
}

/** 修改结构树弹出气泡字体样式 */
.treeOpt-popover {
  .el-button--text:hover {
    color: #494f55;
  }
  .el-button:focus,
  .el-button:hover {
    color: var(--defaultcolors);
  }
}

/**定义机构树样式 */
.searchBox-section {
  padding: 16px;
}
.orgTree-section {
  height: calc(100% - 68px);
}
.tree {
  overflow: auto;
  max-height: 500px;
  background-color: #ffffff;
}
.title-div {
  padding-bottom: 16px;
  border-bottom: 1px solid #dcdee4;
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  color: #333333;
  font-weight: 600;
}
.second-all-div {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.auto-width {
  width: auto !important;
  flex: auto;
}
.width-90 {
  width: 90%;
}
.trans {
  transform: rotate(90deg);
  transition: transform 0.5s;
}
.transfather {
  transition: transform 0.5s;
}
.show-number {
  padding-bottom: 0;
  border-bottom: none;
}
.fade-enter-active,
.fade-leave-active {
  /*设置所有动作延迟0.6秒过渡*/
  transition: all 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  /*向X轴移动150px*/
  transform: translateY(50px);
}
.icon-style {
  font-size: 14px;
  margin-right: 8px;
  margin-left: 6px;
  color: #111d3e;
}
</style>
<style>
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  color: var(--defaultcolors);
}
.el-tree {
  min-width: 100%;
  display: inline-block !important;
}
.el-tree-node > .el-tree-node__children {
  overflow: visible;
}
</style>
