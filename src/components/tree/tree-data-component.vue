<template>
  <div :class="isFullHeight ? 'full-height' : 'auto-height'" :key="pageKey">
    <!-- 筛选框 -->
    <div v-if="isSearch" class="searchBox-section">
      <el-input
        v-model.trim="search"
        type="text"
        :placeholder="searchPlace"
        :readonly="readonly"
        @focus="handlerIptClick"
        @input="debounceInput"
        autocomplete="off"
        @keyup.enter.native="searchHandle"
        clearable
        @clear="searchHandle"
      >
        <i
          slot="prefix"
          class="el-input__icon el-icon-search cursor"
          @click="searchHandle"
        ></i>
      </el-input>
    </div>
    <!-- 自定义组和架构树 -->
    <div :class="isPadding ? 'orgTree-section' : ''">
      <div class="full-height">
        <div
          class="fl-bet-cen mr-l-15 mr-r-15 mr-b-15 title-div"
          v-if="allTitle"
        >
          <span>
            {{ allTitle }}
            <span v-if="isShowAllNumber">({{ allNumber }})</span>
          </span>
          <el-popover placement="bottom" trigger="hover" v-if="isShowAddBtn">
            <div class="pd-10">{{ addTitle }}</div>
            <i
              slot="reference"
              class="iconfont iconchuangjianzu cursor color-primary f-t-20"
              @click="addHandle"
            ></i>
          </el-popover>
        </div>
        <ul
          v-show="isShowCustom && customList.length > 0"
          v-loading="customLoading"
          style="height: calc(100% - 55px)"
          class="ov-auto"
        >
          <li
            v-for="custom in customList"
            :key="custom[nodeKey]"
            class="fl-bet-sta custom-item radius"
            :class="currNode == custom[nodeKey] ? 'is-active' : ''"
            @click="nodeClick('custom', custom, null, null)"
          >
            <!-- customKey2 针对门户 - 导航分类 展示中英文导航 -->
            <div
              class="fl-sta-cen"
              v-if="customKey2"
              style="width: calc(100% - 42px)"
            >
              <i
                class="iconfont iconzidingyizu1 edit-icon f-t-16"
                :class="custom.icon"
              ></i>
              <div style="width: 90%">
                <div class="text-flow" :title="customLabel + custom[customKey]">
                  {{ customLabel + custom[customKey] }}
                </div>
                <div
                  class="text-flow"
                  :title="customLabel2 + custom[customKey2]"
                >
                  {{ customLabel2 + custom[customKey2] }}
                </div>
              </div>
            </div>
            <div
              class="fl-sta-sta mr-r-16"
              v-else
              :class="{
                numberText: showFixNumber,
                'width-90': !showFixNumber,
                'max-width-70': showFixNumber && isShowOpe,
              }"
            >
              <slot name="icon">
                <i
                  class="iconfont iconzidingyizu1 edit-icon f-t-16"
                  :class="custom.icon ? `defaultColor ${custom.icon}` : ''"
                ></i>
              </slot>
              <span
                class="customLabel text-flow"
                :class="{ 'auto-width': showFixNumber }"
                v-if="!showFixNumber"
                :title="custom[customKey]"
                >{{ custom[customKey] }}</span
              >
              <span
                class="customLabel text-flow"
                :class="{ 'auto-width': showFixNumber }"
                v-if="showFixNumber"
                :title="custom.label"
                >{{ custom.label }}</span
              >
            </div>
            <div class="auto-width" v-if="showFixNumber">
              ({{ custom.total || 0 }})
            </div>
            <div
              class="icon-more"
              v-if="
                (typeof isShowOpe === 'function'
                  ? isShowOpe(custom)
                  : isShowOpe) && !(pageType == 'terminal' && custom.type == 1)
              "
              @click.stop.prevent
            >
              <el-popover
                v-if="isAllowOpt(custom)"
                placement="bottom"
                trigger="click"
                :open-delay="0"
                :close-delay="0"
              >
                <slot name="opt-btn" :data="{ customButtons, custom }">
                  <div style="padding: 8px" class="treeOpt-popover">
                    <template v-if="typeof customButtons === 'function'">
                      <div
                        v-for="(item, index) in customButtons(custom)"
                        :key="index"
                      >
                        <el-button
                          class="custom-btn"
                          :class="{
                            'edit-btn': item == '编辑',
                            'delete-btn': item == '删除',
                          }"
                          type="text"
                          @click="handleClick(item, custom)"
                          >{{ $t(item) }}</el-button
                        >
                      </div>
                    </template>
                    <template v-else>
                      <div v-for="(item, index) in customButtons" :key="index">
                        <el-button
                          type="text"
                          @click="handleClick(item, custom)"
                          >{{ $t(item) }}</el-button
                        >
                      </div>
                    </template>
                  </div>
                </slot>
                <i
                  slot="reference"
                  class="iconfont icongengduo more-button f-t-16"
                  v-if="!custom.isDefault"
                ></i>
              </el-popover>
              <svg
                v-else
                class="icon"
                aria-hidden="true"
                style="
                  width: 38px;
                  height: 22px;
                  position: relative;
                  top: 6px;
                  right: -12px;
                "
              >
                <use :xlink:href="`#${optIconName || 'nicon-neizhi'}`"></use>
              </svg>
            </div>
          </li>
          <el-button
            type="text"
            class="full-width"
            v-if="loadMore"
            @click="loadMoreFunc"
            >查看更多</el-button
          >
        </ul>
        <div
          v-show="isShowCustom && customList.length === 0"
          v-loading="customLoading"
          class="ov-auto canvas-div fl-cen-cen"
        >
          <div style="position: relative">
            <img
              src="@/assets/imgs/dataSecurity/no-data.png"
              alt="暂无数据"
              style="width: 100%; height: 100%; margin-top: 44%"
            />
            <div style="color: #9396a3; margin-top: 20px; text-align: center">
              暂无数据
            </div>
          </div>
        </div>
        <div
          v-if="treeData.length && isShowCustom"
          class="splitLine mr-b-16"
        ></div>
        <div v-if="treeData.length && org_title" class="fl-bet-cen mr-b-16">
          <span style="color: #3a424f">{{ org_title }}</span>
        </div>
        <div class="tree" v-show="isShowTree">
          <el-tree
            ref="tree"
            :show-checkbox="showCheckbox"
            :data="treeData"
            :node-key="nodeKey"
            :expand-on-click-node="false"
            lazy
            :load="loadTreeData"
            :highlight-current="highlightCurrent"
            :props="defaultProps"
            @node-click="
              (data, node, element) => nodeClick('tree', data, node, element)
            "
            empty-text=""
            :check-strictly="checkStrictly"
          >
            <span
              class="custom-tree-node fl-item fl-bet-cen"
              slot-scope="{ node, data }"
            >
              <span class="mr-r-10">{{ node.label }}</span>
              <div v-if="buttons.length">
                <el-popover
                  placement="bottom"
                  trigger="click"
                  :open-delay="0"
                  :close-delay="0"
                >
                  <div style="padding: 8px" class="treeOpt-popover">
                    <div v-for="(item, index) in buttons" :key="index">
                      <el-button type="text" @click="handleClick(item, data)">{{
                        item
                      }}</el-button>
                    </div>
                  </div>
                  <i
                    slot="reference"
                    class="iconfont icongengduo more-button f-t-16"
                  ></i>
                </el-popover>
              </div>
            </span>
          </el-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loadMore: {
      type: Boolean,
      defaut: false,
    },
    highlightCurrent: {
      type: Boolean,
      default: true,
    },
    isPadding: {
      type: Boolean,
      default: true,
    },
    isFullHeight: {
      type: Boolean,
      default: true,
    },
    isSearch: {
      type: Boolean,
      default: true,
    },
    pageType: {
      type: String,
      default: "",
    },
    nodeKey: {
      type: String,
      default: "id",
    },
    /**是否显示增加按钮 */
    isShowAddBtn: {
      type: Boolean,
      default: true,
    },
    /** 自定义组 */
    isShowCustom: {
      type: Boolean,
      default: true,
    },
    customList: {
      type: Array,
      default: () => [],
    },
    customButtons: {
      type: Array | Function,
      default: () => [],
    },
    customKey: {
      type: String,
      default: "label",
    },
    customLabel: {
      type: String,
      default: "名称",
    },
    customKey2: {
      type: String,
      default: "",
    },
    customLabel2: {
      type: String,
      default: "",
    },
    customLoading: {
      type: Boolean,
      default: false,
    },
    /** 组织架构树形数据 */
    defaultProps: {
      type: Object,
      default: () => {
        return {
          label: "label",
          children: "children",
        };
      },
    },
    isShowTree: {
      type: Boolean,
      default: true,
    },
    treeData: {
      type: Array,
      default: () => [],
    },
    buttons: {
      type: Array,
      default: () => [],
    },
    allTitle: {
      type: String,
      default: "全部",
    },
    isShowAllNumber: {
      type: Boolean,
      default: false,
    },
    allNumber: {
      type: Number,
      default: 0,
    },
    org_title: {
      type: String,
      default: "组织架构",
    },
    searchPlace: {
      type: String,
      default: "搜索",
    },
    addTitle: {
      type: String,
      default: "",
    },
    isShowOpe: {
      type: Boolean | Function,
      default: true,
    },
    showFixNumber: {
      type: Boolean,
      default: false,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: true,
    },
    // 是否允许重复点击
    isAllowRepeatClick: {
      type: Boolean,
      default: true,
    },
    // 树节点不允许编辑时展示icon
    isAllowOpt: {
      type: Function,
      default: () => true,
    },
    // 同上，不允许操作时展示的icon
    optIconName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      pageKey: 0,
      search: "",
      currNode: null,
      timeout: null,
      readonly: true,
    };
  },
  methods: {
    handlerIptClick() {
      this.readonly = false;
    },
    init(tree) {
      this.treeData = tree;
      // this.pageKey++;
    },
    //搜索防抖
    debounceInput(value) {
      if (this.timeout !== null) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.searchHandle();
      }, 1000);
    },
    // 搜索
    searchHandle() {
      this.$emit("treeSearch", this.search);
    },
    /** 节点点击 */
    nodeClick(type, data, node, element) {
      if (this.currNode === data[this.nodeKey]) {
        if (this.isAllowRepeatClick) {
          /** 第二次点击 清空高亮 */
          this.currNode = null;
          if (type == "tree") {
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(null);
            });
          }
          this.$emit("nodeClick", null, node, element);
        } else {
          return;
        }
      } else {
        this.currNode = data[this.nodeKey];
        if (type == "custom") {
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(null);
          });
        }
        /** 通知父级 */
        this.$emit("nodeClick", data, node, element);
      }
    },
    /** 操作按钮 */
    handleClick(name, data) {
      this.$emit("buttonClick", name, data);
    },
    /** 创建按钮 */
    addHandle() {
      this.$emit("addHandle");
    },
    /** 清空所有高亮 */
    clearHighLight() {
      this.currNode = null;
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(null);
      });
    },
    /** 高亮某一项 自定义组 */
    highLightKey(id) {
      this.currNode = id;
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(id);
      });
    },
    /** 获取某一节点 */
    getNode(data) {
      return this.$refs.tree.getNode(data);
    },
    loadTreeData(node, resolve) {
      this.$emit("loadTreeData", node, resolve);
    },
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys();
    },
    setCheckedKeys(keys) {
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(keys);
      });
    },
    loadMoreFunc() {
      this.$emit("loadMore");
    },
    /** 清除搜索 */
    resetHandle() {
      this.search = "";
    },
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
.is-active {
  .defaultColor {
    color: #5682f7;
  }
}
.defaultColor {
  color: #111d3e;
}
.custom-item {
  line-height: 32px;
  padding: 0 16px;
  cursor: pointer;
  margin-bottom: 5px;
  position: relative;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #333333;
}
.custom-item:hover {
  background-color: #f5f7fa;
}
.custom-item:focus {
  background-color: unset;
}
.custom-item.is-active {
  background-color: rgb(72, 128, 255, 0.08);
  color: var(--defaultcolors);
  font-weight: 600;
}

.custom-item .customLabel {
  width: calc(100% - 27px);
}
.numberText {
  width: auto !important;
  margin-right: 8px;
  max-width: 85%;
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
  box-shadow: 0 4px 12px 6px rgb(206 211 224 / 55%);
  border-radius: 8px;
  .custom-btn {
    width: 84px;
    height: 30px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    cursor: pointer;
    color: #333333 !important;
    font-weight: 400;
    &:hover {
      background-color: rgba(86, 130, 247, 0.1);
      font-weight: 600;
    }
    &:active {
      background-color: rgba(86, 130, 247, 0.2);
      font-weight: 600;
    }
  }
  .edit-btn {
    // color:#5682F7!important;
    &:hover {
      color: #5682f7 !important;
      font-weight: 600;
    }
    &:active {
      color: #5682f7 !important;
      font-weight: 600;
    }
  }
  .delete-btn {
    color: #f27c55 !important;
    &:hover {
      background: rgba(242, 124, 85, 0.1);
      font-weight: 600;
    }
    &:active {
      background: rgba(242, 124, 85, 0.2);
      font-weight: 600;
    }
  }
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
  span {
    font-size: 14px;
    font-family: PingFang SC-Regular, PingFang SC;
    color: #333333;
    font-weight: 600;
  }
}
.auto-width {
  width: auto !important;
  flex: auto;
}

.max-width-70 {
  max-width: 70%;
}
.width-90 {
  width: 90%;
}
.show-number {
  padding-bottom: 0;
  border-bottom: none;
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
