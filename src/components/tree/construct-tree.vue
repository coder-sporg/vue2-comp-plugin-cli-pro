<template>
  <div :class="isFullHeight ? 'full-height' : 'auto-height'" :key="pageKey">
    <!-- 自定义组和架构树 -->
    <div class="ov-y-auto orgTree-section">
      <div v-if="treeData.length" class="fl-bet-cen mr-b-16">
        <span style="color: #3a424f">{{ org_title }}</span>
      </div>
      <div class="tree">
        <el-tree
          ref="tree"
          class="construct-tree"
          :show-checkbox="showCheckbox"
          v-show="isShowTree"
          :data="treeData"
          :node-key="nodeKey"
          :expand-on-click-node="false"
          lazy
          :load="loadTreeData"
          highlight-current
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
            <span>{{ node.label }}</span>
            <div v-if="buttons.length">
              <el-popover
                placement="bottom"
                trigger="hover"
                :open-delay="0"
                :close-delay="0"
              >
                <div style="padding: 0px 15px" class="treeOpt-popover">
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
</template>

<script>
import { elementTools } from "jointjs";
export default {
  props: {
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
      type: Array,
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
    org_title: {
      type: String,
      default: "组织架构及角色",
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
      type: Boolean,
      default: true,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      pageKey: 0,
      search: "",
      currNode: null,
      activeName: [],
    };
  },
  methods: {
    collapseChange() {},
    init(tree) {
      console.log(111, tree);
      this.treeData = tree;
      // this.pageKey++;
    },
    // 搜索
    searchHandle() {
      this.$emit("treeSearch", this.search);
    },
    /** 节点点击 */
    nodeClick(type, data, node, element) {
      if (this.currNode === data[this.nodeKey]) {
        /** 第二次点击 清空高亮 */
        this.currNode = null;
        if (type == "tree") {
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(null);
          });
        }
        this.$emit("nodeClick", null, node, element);
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
  },
};
</script>

<style lang="scss" scoped>
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
.edit-icon {
  color: #2994ff;
  margin-right: 10px;
}
.custom-item {
  color: #606266;
  line-height: 32px;
  padding: 0 5px;
  cursor: pointer;
  margin-bottom: 5px;
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
}

.custom-item .customLabel {
  white-space: normal;
  width: calc(100% - 27px);
  word-break: break-all;
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
  padding: 0 8px 16px 16px;
  margin-right: 4px;
}
.tree {
  overflow: auto;
  max-height: 500px;
  background-color: #ffffff;
}
</style>
<style>
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  color: var(--defaultcolors);
}
.construct-tree > .el-tree-node > .el-tree-node__content {
  background: linear-gradient(180deg, #f4f7fc, #eaf0f5);
  border-radius: 4px;
}
</style>
