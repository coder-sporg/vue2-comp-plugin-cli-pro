<template>
  <div>
    <el-input
      placeholder="输入关键字进行过滤"
      v-model="filterText"
      @change="searchHandle"
      @keyup.enter.native="searchHandle"
    >
    </el-input>
    <el-tree
      ref="tree"
      :data="treeData"
      :props="treeProps"
      node-key="id"
      :defaultExpandedKeys="defaultExpandedKeys"
      :filter-node-method="filterNode"
    >
      <template v-slot="{ node }">
        <span>
          <el-checkbox v-model="node.selected">{{ node.label }}</el-checkbox>
        </span>
      </template>
    </el-tree>
    <div>{{ selectedNodes }}</div>
  </div>
</template>

<script>
import treeData from "./components/treeData";
export default {
  data() {
    return {
      filterText: "",
      treeData: treeData,
      selectedNodes: [],
      defaultExpandedKeys: [],
    };
  },
  computed: {
    treeProps() {
      return {
        children: "data",
        label: "label",
        isLeaf: "isLeaf",
        selected: "selected",
      };
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
      if (val) {
        // 获取选中的节点 ID 和选中状态
        this.handleFilterChange();
      } else {
        this.handleFilterCancel();
      }
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleFilterChange(value, data) {
      this.selectedNodes = this.getSelectedNodes(this.treeData);
    },
    handleFilterCancel() {
      // 取消筛选时，根据保存的 selectedNodes，重新选中节点
      this.traverseTree(this.treeData, (node) => {
        if (this.selectedNodes.includes(node.id)) {
          //   node.selected = true;
          this.$set(node, "selected", true);
        }
      });
      // 清空保存的 selectedNodes
      this.selectedNodes = [];
    },
    getSelectedNodes(data) {
      const selectedNodes = [];
      this.traverseTree(data, (node) => {
        if (node.selected) {
          selectedNodes.push(node.id);
        }
      });
      return selectedNodes;
    },
    traverseTree(data, callback) {
      data.forEach((node) => {
        callback(node);
        if (node.data && node.data.length > 0) {
          this.traverseTree(node.data, callback);
        }
      });
    },
    searchHandle() {
      console.log(1111);
      //   this.selectedNodes = this.getSelectedNodes(this.treeData);
      //   this.$refs.tree.filter(this.filterText);
    },
  },
  mounted() {
    this.defaultExpandedKeys = [this.treeData[0].id];
  },
};
</script>
