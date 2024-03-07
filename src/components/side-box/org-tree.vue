<template>
  <div class="full-height">
    <template v-for="item in orgTreeMap">
      <BaseTree
        v-if="item.haveSubset"
        :data="item.data"
        :key="item.type"
        :default-props="defaultProps"
        node-key="orgId"
        @load-tree-data="(node, resolve) => loadData(item.type, node, resolve)"
      />
    </template>
  </div>
</template>

<script setup>
import BaseTree from "./base-tree.vue";
import { ref, defineExpose } from "vue";
import { getConstructTree } from "@/api/identity.api.js";

const ICONMAP = {
  R: "iconjiaose",
  C: "iconbendiyonghuzu",
  O: "iconzuzhijiagou",
};

// 树节点字段
const defaultProps = ref({
  label: "orgName",
  children: "children",
  isLeaf: "isLeaf",
});
// 三种数据类型根节点
const orgTreeMap = ref([
  {
    type: "R",
    haveSubset: true,
    node: null,
    data: [
      {
        orgName: "本地角色终端",
        icon: "iconjiaose",
        isLeaf: false,
        children: [],
      },
    ],
  },
  {
    type: "C",
    haveSubset: true,
    node: null,
    data: [
      {
        orgName: "本地用户组终端",
        icon: "iconbendiyonghuzu",
        isLeaf: false,

        children: [],
      },
    ],
  },
  {
    type: "O",
    haveSubset: true,
    node: null,
    data: [
      {
        orgName: "组织架构终端",
        icon: "iconzuzhijiagou",
        isLeaf: false,

        children: [],
      },
    ],
  },
]);

/**
 * 请求数据
 * @param {string} type 数据类型
 * @param {Object} node 数据节点
 * @param {Promise} resolve 请求数据回调
 */
const loadData = (type, node, resolve, orgName) => {
  if (node && node.parent) {
    getConstructTree({
      orgName: orgName,
      parentOrgId: node.data.orgId,
      type: type,
    }).then((res) => {
      const data = res.data;
      data.forEach((ele) => {
        ele.isLeaf = !ele.haveSubset;
        ele.icon = ele.haveSubset ? ICONMAP[type] : "";
      });
      resolve(data);
    });
  } else {
    getConstructTree({
      orgName: orgName,
      parentOrgId: "",
      type: type,
    }).then((res) => {
      const data = res.data || [];
      data.forEach((ele) => {
        ele.isLeaf = !ele.haveSubset;
        ele.icon = ele.haveSubset ? ICONMAP[type] : "";
      });
      const orgTree = orgTreeMap.value.find((item) => item.type === type);
      // 缓存根节点
      if (!orgTree.node) {
        orgTree.node = node;
      }
      if (res.data.length) {
        orgTree.data[0].children = res.data;
      } else {
        orgTree.data = [];
        // 不显示没有子节点的树
        orgTree.haveSubset = false;
      }
      resolve && resolve(orgTree.data);
    });
  }
};

/**
 * 本地角色搜索
 * @param {string} orgName
 */
const searchHandle = (orgName) => {
  // 更新数据时,页面上存在节点缓存没有被清除,手动清除一下
  orgTreeMap.value[0].node.childNodes[0].childNodes = [];
  loadData("R", null, null, orgName);
};

defineExpose({
  searchHandle,
});
</script>

<style lang="scss" scoped>
.tree-container {
  border: 1px solid red;
}
.el-input__icon {
  margin-top: 2px;
}
</style>
