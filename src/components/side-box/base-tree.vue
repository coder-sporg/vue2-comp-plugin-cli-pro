<template>
  <el-tree
    ref="treeRef"
    class="full-height full-width"
    :lazy="lazy"
    :data="data"
    :node-key="nodeKey"
    :expand-on-click-node="false"
    :load="loadTreeData"
    :indent="0"
    :props="defaultProps"
    :show-checkbox="showCheckbox"
    :default-expand-all="defaultExpandAll"
    :default-expanded-keys="defaultExpandedKeys"
    :default-checked-keys="defaultCheckedKeys"
    :filter-node-method="filterNodeMethod"
    :check-strictly="checkStrictly"
    empty-text=""
    @check="checkBoxFn"
    @check-change="checkChangeFn"
    @node-click="(data, node, element) => nodeClickHandle(data, node, element)"
  >
    <span class="custom-tree-node flex" slot-scope="{ node, data }">
      <i
        class="iconfont mr-r-8 mr-l-6"
        :class="node.data.icon"
        v-if="node.data.icon"
      ></i>
      <slot :data="data">
        <span>{{ node.label }}</span>
      </slot>
    </span>
  </el-tree>
</template>

<script setup>
/* eslint-disable */
import { ref } from "vue";

// 声明props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  nodeKey: {
    type: String,
    default: "id",
  },
  defaultProps: {
    type: Object,
    default: () => {
      return {
        label: "label",
        children: "children",
      };
    },
  },
  //节点是否可被选择
  showCheckbox: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  //是否懒加载
  lazy: {
    type: Boolean,
    default: true,
  },
  // 是否全部展开子节点
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  // 点击当前节点是否高亮显示
  isHighColor: {
    type: Boolean,
    default: true,
  },
  // 默认展开的节点
  defaultExpandedKeys: {
    type: Array,
    default: () => [],
  },
  // 默认选中的节点
  defaultCheckedKeys: {
    type: Array,
    default: () => [],
  },
  // 过滤树的方法
  filterNodeMethod: {
    type: Function,
    default: () => true,
  },
  checkStrictly: false
});

// 是否高亮, 使用css的v-bind
const highColor = props.isHighColor ? "#5682F7" : "unset";

// const nodeClick = inject('nodeClick');

// 声明触发事件
const emits = defineEmits(["node-click", "load-tree-data", "check-data"]);

// 树的引用
const treeRef = ref(null);
// 当前高亮节点
const curNode = ref(null);

/**
 * 节点点击
 * @param {Object} data 节点原始数据
 * @param {Object} node 节点数据
 * @param {Component} element 节点组件对象
 */
const nodeClickHandle = (data, node, element) => {
  // 第二次点击 清空高亮
  if (curNode.value === data[props.nodeKey]) {
    treeRef.value.setCurrentKey(null);
    curNode.value = null;
    emits("node-click", null, node);
    // nodeClick(null, node);
  } else {
    const pathInfo = loopParent(node);
    curNode.value = data[props.nodeKey];
    emits("node-click", data, node, pathInfo, element);
    // nodeClick(data, node, pathInfo, element);
  }
};

const loopParent = (node) => {
  const temp = [];
  const loop = (node) => {
    temp.unshift(node.data);
    if (node.level >= 2) {
      loop(node.parent);
    }
  };
  loop(node);
  return temp;
};

/**
 * 数据加载
 * @param {Object} node
 * @param {Promise} resolve
 */
const loadTreeData = (node, resolve) => {
  emits("load-tree-data", node, resolve);
};

/**
 * 多选框选中事件
 * @param {*} data
 * @param {*} checked 目前选中状态
 */
const checkBoxFn = (data, checked) => {
  emits("check-data", data, checked.checkedNodes, checked.checkedKeys);
};

/**
 * 节点选中状态发生变化时的回调
 * @param {*} data
 * @param {*} isCheck 节点自身是否选中
 */
const checkChangeFn = (data, isCheck) => {
  emits("check-change", data, isCheck);
};

/**
 * 通过key/data设置某个节点的勾选状态
 * @param {*} key 勾选节点的key
 * @param {*} checked 是否选中
 * @param {*} deep 是否设置子节点
 */
const setChecked = (key, checked, deep = false) => {
  treeRef.value?.setChecked(key, checked, deep);
};

/**
 *
 * @param {*} keys 勾选节点key的数组
 * @param {*} leafOnly 设置叶子节点的选中状态，默认false
 */
const setCheckedKeys = (keys, leafOnly = false) => {
  treeRef.value?.setCheckedKeys(keys, leafOnly);
};

/**
 * 对树节点进行筛选操作
 * @param {*} value
 */
const filter = (value) => {
  treeRef.value?.filter(value);
};

/** 获取某一节点 */
const getNode = (data) => {
  return treeRef.value?.getNode(data);
};

/** 获取已选择的节点key */
const getCheckedKeys = () => {
  return treeRef.value?.getCheckedKeys();
};

/** 获取已选择的节点key */
const getCheckedNodes = () => {
  return treeRef.value?.getCheckedNodes();
};

// 暴露事件给父组件调用
defineExpose({
  setChecked,
  setCheckedKeys,
  filter,
  getNode,
  getCheckedKeys,
  getCheckedNodes,
});
</script>

<style lang="scss" scoped>
.tree-container {
  border: 1px solid red;
}
.el-input__icon {
  margin-top: 2px;
}
::v-deep {
  .el-tree-node__expand-icon {
    margin-right: 6px;
  }
  .el-tree-node__content > label.el-checkbox {
    margin-right: 10px;
  }
  // 纵向引导线
  .el-tree-node__children {
    position: relative;
    padding-left: 16px;
    &::before {
      content: "";
      position: absolute;
      top: 0px;
      left: 10px;
      height: 100%;
      width: auto;
      border-left: 1px solid #ccc;
    }
    .el-tree-node {
      padding-left: 8px;
    }
  }
  // 叶子节点标注
  .is-leaf {
    margin-left: 4px;
    margin-right: 10px;
    &::before {
      content: " ";
      display: inline-block;
      height: 4px;
      width: 4px;
      border-radius: 50%;
      background: #cccfd9;
      transform: translateY(-2px);
    }
  }
  // 节点选中时高亮
  .el-tree-node.is-current > .el-tree-node__content {
    color: v-bind(highColor);
  }
}
</style>
