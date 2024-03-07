<template>
  <div class="tree-wrap">
    <el-input
      placeholder="输入关键字进行过滤"
      clearable
      v-model="filterText"
      @clear="searchHandle"
      @keyup.enter.native="searchHandle"
    >
    </el-input>
    <el-tree
      ref="tree"
      :data="data"
      show-checkbox
      node-key="id"
      :default-expand-all="true"
      :check-strictly="true"
      :default-checked-keys="defaultCheckedKeys"
      :filterNodeMethod="filterNode"
      @check="checkChange"
    >
    </el-tree>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterText: "",
      data: [
        {
          id: "0",
          label: "全部",
          children: [
            {
              id: 1,
              label: "node 1",
              selected: false,
              children: [
                {
                  id: 2,
                  label: "node 1-1",
                  selected: false,
                  children: [
                    {
                      id: 7,
                      label: "node 1-1-1",
                      selected: false,
                    },
                    {
                      id: 8,
                      label: "node 1-1-2",
                      selected: false,
                    },
                  ],
                },
                {
                  id: 3,
                  label: "node 1-2",
                  selected: false,
                },
              ],
            },
            {
              id: 4,
              label: "node 2",
              selected: false,
              children: [
                {
                  id: 5,
                  label: "node 2-1",
                  selected: false,
                },
                {
                  id: 6,
                  label: "node 2-2",
                  selected: false,
                },
              ],
            },
          ],
        },
      ],
      props: {
        children: "children",
        label: "label",
        selectable: true,
        selected: "selected",
      },
      defaultCheckedKeys: [], // 选中节点的id数组
      searchText: "", // 搜索关键字
    };
  },
  methods: {
    //点击树节点
    checkChange(a) {
      const anode = this.$refs.tree.getNode(a);
      console.log("anode: ", anode);

      const checkedKeys = this.$refs.tree.getCheckedKeys();
      if (a.children && a.children.length > 0) {
        checkedKeys.forEach((item) => {
          const node = this.$refs.tree.getNode(item);
          if (!node.visible && node.checked) {
            node.checked = false;
            // this.$refs.tree.setChecked(item, false)
          }
        });
      }
      if (anode.checked) {
        //删除选中的
        this.setParentChecked(anode.parent);
        //点击全选子节点
        // anode.childNodes.map((res) => {
        //   res.checked = true;

        // });
        this.setChildChecked(anode.childNodes);
      } else {
        //新增选中的
        this.deleteParentChecked(anode.parent);
        this.deleteChildChecked(anode.childNodes);
      }
      // 1.获取筛选的节点以及id
      // const checkedNodes = this.$refs.tree.getCheckedNodes();
      // console.log("checkedNodes: ", checkedNodes);
      // const checkedKeys = this.$refs.tree.getCheckedKeys();
      // console.log("checkedKeys: ", checkedKeys);
    },
    setParentChecked(parent) {
      //如果不是全选中为父级添加半选状态，如果子集全选后，父级也要全选
      const fnode = this.$refs.tree.getNode(parent);
      const isAllChecked = fnode.childNodes.every(
        (k) => k.checked && k.indeterminate === false
      ); //子集是否是全选
      if (!fnode.isLeaf) {
        fnode.indeterminate = !isAllChecked; //子集是否是全选，如果子集全选，则半选状态为假
        fnode.checked = true;
      }
      if (fnode.parent) {
        this.setParentChecked(fnode.parent);
      }
    },
    deleteParentChecked(parent, d = false) {
      //如果取消子节点的选中， 设置父级节点选中状态
      const fnode = this.$refs.tree.getNode(parent);
      const isAllChecked = fnode.childNodes.some((k) =>
        d ? k.checked || k.indeterminate : k.checked
      ); //子集是否是全选
      if (!fnode.isLeaf) {
        fnode.indeterminate = isAllChecked; //子集是否是全选，如果子集全选，则半选状态为假
        fnode.checked = isAllChecked;
        if (fnode.parent) {
          //如果有父节点，则需要去判断父节点是否选中
          this.deleteParentChecked(fnode.parent, true);
        }
      }
    },
    setChildChecked(childNodes) {
      //删除子节点的勾选状态
      if (childNodes && childNodes.length > 0) {
        childNodes.map((k) => {
          k.indeterminate = false;
          k.checked = true;
          if (k.childNodes) this.setChildChecked(k.childNodes);
        });
      }
    },
    deleteChildChecked(childNodes) {
      //删除子节点的勾选状态
      if (childNodes && childNodes.length > 0) {
        childNodes.map((k) => {
          k.indeterminate = false;
          k.checked = false;
          this.deleteChildChecked(this.$refs.tree.getNode(k).childNodes);
        });
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    searchHandle() {
      // console.log(1111);
      this.$refs.tree.filter(this.filterText);
    },
  },
  // watch: {
  //   searchText() {
  //     this.$refs.tree.filter(this.searchText);
  //   },
  // },
};
</script>
<style scoped>
.tree-wrap {
  width: 50%;
  height: 800px;
  margin: 0 auto;
  padding: 16px;
  background-color: #fff;
}
</style>
