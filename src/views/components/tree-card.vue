<template>
  <div class="tree-card fl-sta-str re-pos">
    <div class="full-height flex fl-col fl-item" style="width: 388px">
      <div class="title flex">全部规则</div>
      <div class="tree-wrap flex fl-col full-height radius-8">
        <div class="search-section pd-16 ov-hide">
          <el-input
            v-model.trim="searchValue"
            placeholder="输入关键字搜索"
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
        <div class="tree ov-auto" style="height: calc(100% - 84px)">
          <TreeData
            ref="tree"
            :data="treeData"
            :lazy="false"
            :show-checkbox="true"
            :showNumber="true"
            :isHighColor="false"
            :defaultProps="defaultProps"
            :defaultExpandedKeys="defaultExpandedKeys"
            :defaultCheckedKeys="defaultCheckedKeys"
            :filterNodeMethod="filterNode"
            @check-data="checkData"
          >
            <template v-slot="{ data }">
              <div
                class="fl-sta-cen"
                style="max-width: 230px; overflow: hidden"
              >
                <span
                  class="text-flow"
                  :class="{ 'mr-l-10': data.label }"
                  :title="data.label"
                  >{{ data.label }}</span
                >
              </div>
              <span class="mr-l-4" v-if="data.data && data.id !== '0'"
                >({{ data.total }})</span
              >
            </template>
          </TreeData>
        </div>
      </div>
    </div>
    <div class="fl-shrink full-height right-content flex fl-col">
      <div class="title-wrap fl-bet-cen">
        <div class="title">
          已选择 <span style="color: #5682f7">{{ resultList.length }}</span> 条
        </div>
        <el-button
          type="text"
          @click="clearAllHandle"
          v-show="resultList.length"
          >取消全部</el-button
        >
      </div>
      <div class="tree-wrap result-wrap full-height radius-8 ov-auto">
        <template v-if="resultList.length">
          <div
            class="result-item flex fl-bet-cen"
            v-for="(result, index) in resultList"
            :key="result.id"
          >
            <div class="result-label mr-r-16 flex-item" :title="result.label">
              {{ result.label }}
            </div>
            <el-select
              @change="selectChange"
              style="width: 130px"
              v-model="result.levelInTmpl"
            >
              <el-option
                v-for="item in levelList"
                :key="item.level"
                :label="item.name"
                :value="item.level"
              ></el-option>
            </el-select>
            <i
              class="niconfont nicon-quxiao edit-icon fl-end-cen mr-l-15"
              @click="deleteRes(index)"
            ></i>
          </div>
        </template>
        <div v-else class="full-height">
          <Empty />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TreeData from "@/components/side-box/base-tree.vue";
import _ from "lodash";

import mockTreeData from "./treeData";

export default {
  components: {
    TreeData,
  },
  props: {
    templateId: {
      type: Number,
      default: 0,
    },
    treeData: {
      type: Array,
      default: () => mockTreeData,
    },
  },
  data() {
    return {
      nodeKey: "id",
      defaultProps: {
        label: "label",
        children: "data",
      },
      searchValue: "",
      defaultExpandedKeys: [],
      defaultCheckedKeys: [],
      checkedNodes: [],
      tmpList: [], // 临时存储的 选取结果列表
      resultList: [],
      originalData: [],
      dicList: [],
      levelList: [
        {
          name: "S1",
          level: 1,
        },
        {
          name: "S2",
          level: 2,
        },
        {
          name: "S3",
          level: 3,
        },
        {
          name: "S4",
          level: 4,
        },
        {
          name: "S5",
          level: 5,
        },
        {
          name: "S6",
          level: 6,
        },
      ],
    };
  },
  methods: {
    /** 初始化 */
    init() {
      this.getRuleList();
      this.defaultExpandedKeys = [this.treeData[0].id];
      this.handleOriginal();
    },
    /** 获取原有数据进行处理->选中状态 */
    handleOriginal() {
      this.resultList.forEach((item) => {
        const res = this.getCurNode(this.treeData[0], item.groupId, item.id);
        if (res) {
          this.originalData.push(res);
        }
      });
      this.defaultCheckedKeys = this.originalData.map((item) => item.id);
      this.$refs.tree.setCheckedKeys(this.defaultCheckedKeys);
    },
    /** 在树中查找已存在的节点，先找组id，再查字典id */
    getCurNode(treeData, groupId, id) {
      const group = treeData.data.find((item) => item.value == groupId);
      if (group?.data) {
        const item = group.data.find((item) => item.value == id);
        return item;
      }
    },
    handleResult() {
      const addDicts = [];
      const updateDicts = [];
      const delDicts = [];
      const stillDicts = [];
      // 原始数据存储
      const map = new Map();
      this.originalData.forEach((item) => {
        map.set(Number(item.value), item);
      });
      for (const result of this.resultList) {
        if (map.has(result.id)) {
          updateDicts.push({
            dictId: result.id,
            levelInTmpl: result.levelInTmpl,
          });
        } else if (map.has(Number(result.value))) {
          // 处理 删除原有然后又选中
          updateDicts.push({
            dictId: Number(result.value),
            levelInTmpl: result.levelInTmpl,
          });
        } else if (map.has(Number(result.id.replace("dict_", "")))) {
          updateDicts.push({
            dictId: Number(result.id.replace("dict_", "")),
            levelInTmpl: result.levelInTmpl,
          });
        } else {
          addDicts.push({
            // dictId: Number(result.value),
            dictId: Number(result.value ?? result.id.replace("dict_", "")),
            levelInTmpl: result.levelInTmpl,
          });
        }
        // 重新选择已存在的需要用value
        const stillItem = this.originalData.find((item) => {
          // 第二次添加的 规则 根据id来判断需要将id转换成Number
          return (
            item.value == result.id ||
            item.value == result.value ||
            item.value ==
              Number(
                typeof result.id == "string" && result.id.replace("dict_", "")
              )
          );
        });
        if (stillItem) stillDicts.push(stillItem);
      }

      this.originalData.forEach((item) => {
        const result = stillDicts.some((stillItem) => stillItem.id == item.id);
        if (!result) {
          delDicts.push({
            dictId: Number(item.value),
            levelInTmpl: item.level,
          });
        }
      });

      return {
        addDicts,
        updateDicts,
        delDicts,
      };
    },
    /** 获取当前模板已有的字典规则 */
    getRuleList() {
      const res = [
        // {
        //   id: 2,
        //   name: "统一社会信用代码",
        //   levelInTmpl: 1,
        //   description: "统一社会信用代码",
        //   type: 0,
        //   groupId: 4,
        //   groupName: "企业敏感信息",
        // },
        // {
        //   id: 3,
        //   name: "税务登记证号码",
        //   levelInTmpl: 2,
        //   description: "税务登记证号码",
        //   type: 0,
        //   groupId: 4,
        //   groupName: "企业敏感信息",
        // },
        // {
        //   id: 27,
        //   name: "省份（中国内地）",
        //   levelInTmpl: 1,
        //   description: "省份（中国内地）",
        //   type: 0,
        //   groupId: 2,
        //   groupName: "位置敏感信息",
        // },
        // {
        //   id: 28,
        //   name: "GPS位置",
        //   levelInTmpl: 2,
        //   description: "GPS位置",
        //   type: 0,
        //   groupId: 2,
        //   groupName: "位置敏感信息",
        // },
      ];
      this.resultList = res.map((item) => {
        return {
          ...item,
          label: item.name,
          level: item.levelInTmpl,
        };
      });
    },
    searchHandle() {
      this.$refs.tree.filter(this.searchValue);
      this.isFilter = !!this.searchValue;
      // 清空筛选的时候，回显选中数据
      if (!this.searchValue) {
        this.tmpList = _.cloneDeep(this.resultList);
        this.tmpList.forEach((item) => {
          item.id = typeof item.id == "number" ? "dict_" + item.id : item.id;
          this.$refs.tree.setChecked(item.id, true);
        });
      }
      // 更改默认展开 清空筛选
      this.defaultExpandedKeys = [this.treeData[0].data[0].id];
      // this.$nextTick(() => {
      //     this.$refs.tree.setCheckedKeys([], true)
      // })
    },
    checkData(data, checkedNodes, checkedKeys) {
      // console.log('data: ', data);
      this.checkedNodes = checkedNodes;
      if (data.data && data.data.length > 0) {
        checkedKeys.forEach((item) => {
          const node = this.$refs.tree.getNode(item);
          if (!node.visible && node.checked) {
            node.checked = false;
            // this.$refs.tree.setChecked(item, false)
          }
        });
      }

      this.updateCheckData();
      this.dicList = this.handleResult();
      this.$emit("formData", this.dicList);
    },
    /** 处理勾选的数据 */
    /** 勾选数据的不同情况：原始数据 + 新数据 => 保证筛选的时候不修改原始数据
     * 直接新增
     * 有原始数据：
     *      1.修改
     *      2.删除
     * 没有原始数据，直接添加
     * 筛选数据的处理：
     *      存储筛选前的结果
     */
    updateCheckData() {
      // 1.获取筛选的节点以及id
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      // console.log("checkedNodes: ", checkedNodes);
      const checkedKeys = this.$refs.tree
        .getCheckedKeys()
        .filter((item) => item.startsWith("dict_"));
      // console.log("checkedKeys: ", checkedKeys);

      // 2.定义数据：默认已选中的节点 旧的列表 新选中的列表
      let defaultKeys = [];
      let alreadyList = [];
      let checkedList = [];

      // 3.默认选中数据的处理 tmpList 有值 则是筛选后的，否则是初始化选中的数据
      if (this.tmpList.length) {
        alreadyList = this.tmpList;
        defaultKeys = this.tmpList.map((item) => {
          item.id = typeof item.id == "number" ? "dict_" + item.id : item.id;
          return item.id;
        });
      } else {
        defaultKeys = this.originalData.map((item) => item.id);
        defaultKeys.forEach((item) => {
          const alreadyItem = this.resultList.find((result) => {
            return result.id == item.replace("dict_", "") || result.id == item;
          });
          if (alreadyItem) {
            alreadyList.push(alreadyItem);
          }
        });
      }

      // 4.处理新增筛选和修改数据

      if (this.resultList.length > 0) {
        // 已选中节点中不包含原有数据的节点
        const newList = checkedNodes
          .filter((item) => !item.data && !defaultKeys.includes(item.id))
          .map((item) => {
            return {
              ...item,
              levelInTmpl: item.level,
            };
          });
        // 4.2 原有数据基础上新增
        if (newList.length) {
          checkedList = newList;
        } else {
          // 树中已经筛选的节点
          let originTreeList = checkedNodes.filter(
            (item) => !item.data && defaultKeys.includes(item.id)
          );
          // 已选中节点的id
          const existKeys = alreadyList.map((i) =>
            typeof i.id === "number" ? "dict_" + i.id : i.id
          );
          // 当前所有选中的节点id
          let currentKeys = [];
          if (this.isFilter) {
            console.log(JSON.parse(JSON.stringify(checkedNodes)), 999);
            console.log(originTreeList, 888);
            // originTreeList = this.tmpList;
            const oldKeys = this.tmpList.map((item) => item.id);
            const diffKeys = oldKeys
              .concat(checkedKeys)
              .filter((item) => !checkedKeys.includes(item));
            console.log("checkedKeys: ", checkedKeys);
            console.log("diffKeys: ", diffKeys);
            // 有长度表示 已选中的有删除
            if (this.tmpList.length && diffKeys.length) {
              currentKeys = checkedKeys;
            } else {
              currentKeys = Array.from(
                new Set(this.tmpList.map((item) => item.id).concat(checkedKeys))
              );
            }
            console.log("currentKeys: ", currentKeys);
          } else {
            currentKeys = checkedKeys;
          }

          // 4.3 已选数据的删除
          if (originTreeList.length < alreadyList.length) {
            // 找出不同的key
            let delKeys = existKeys
              .concat(currentKeys)
              .filter((item) => !currentKeys.includes(item));

            // 删除操作
            delKeys.forEach((key) => {
              const index = existKeys.indexOf(key);
              if (index !== -1) alreadyList[index] = null;
            });
            alreadyList = alreadyList.filter((item) => !!item);
          }
        }
      } else {
        // 4.1 直接新增数据
        checkedList = checkedNodes
          .filter((item) => !item.data)
          .map((item) => {
            return {
              ...item,
              levelInTmpl: item.level,
            };
          });
      }

      //   if (this.resultList.length > 0) {
      //     // 新增的

      //     if (newList.length > 0) {
      //       checkedList = newList;
      //     } else {
      //       // 树中存储的原始数据的修改
      //       let originTreeList = checkedNodes.filter(
      //         (item) => !item.data && defaultKeys.includes(item.id)
      //       );
      //       let keys = [];
      //       if (this.isFilter) {
      //         originTreeList = this.tmpList;
      //         // console.log('originTreeList: ', originTreeList.map(item => item.id));
      //         // console.log('checkedKeys: ', checkedKeys);
      //         keys = Array.from(
      //           new Set(this.tmpList.map((item) => item.id).concat(checkedKeys))
      //         );
      //       } else {
      //         keys = checkedKeys;
      //       }
      //       const originTreeListLength = originTreeList.length;
      //       const alreadyListLength = alreadyList.length;
      //       if (originTreeListLength > 0) {
      //         const existKeys = alreadyList.map((i) =>
      //           typeof i.id == "number" ? "dict_" + i.id : i.id
      //         );

      //         // 原始数据的删除处理
      //         if (originTreeListLength < alreadyListLength) {
      //           let delKeys = existKeys
      //             .concat(keys)
      //             .filter((item) => !keys.includes(item));
      //           // console.log('existKeys: ', existKeys);
      //           // console.log('keys: ', keys);
      //           // console.log('delKeys: ', delKeys);
      //           if (this.isFilter) delKeys = [delKeys[0]];
      //           delKeys.forEach((key) => {
      //             const index = existKeys.indexOf(key);
      //             if (index !== -1) alreadyList[index] = 0;
      //           });
      //           alreadyList = alreadyList.filter((item) => !!item);
      //         } else {
      //           const diffKey = checkedKeys
      //             .concat(existKeys)
      //             .filter((item) => !existKeys.includes(item))[0];
      //           const node = checkedNodes.find((item) => item.id === diffKey);
      //           if (node) {
      //             alreadyList.push({
      //               ...node,
      //               levelInTmpl: node.level,
      //             });
      //           }
      //         }
      //       }
      //     }
      //   } else {
      //     checkedList = checkedNodes
      //       .filter((item) => !item.data)
      //       .map((item) => {
      //         return {
      //           ...item,
      //           levelInTmpl: item.level,
      //         };
      //       });
      //   }

      // 清空时，已存在的数据也清空
      if (!this.isFilter && checkedKeys.length === 0) {
        alreadyList = [];
      }
      //   // console.log('alreadyList: ', alreadyList);
      //   // console.log('checkedList: ', checkedList);
      this.resultList = [...alreadyList, ...checkedList];
      if (!this.isFilter) {
        alreadyList.push(...checkedList);
      }
      // 保存副本
      this.tmpList = _.cloneDeep(alreadyList);
      console.log("result", JSON.parse(JSON.stringify(this.resultList)));
    },

    /** 修改当前的敏感等级 */
    selectChange() {
      this.dicList = this.handleResult();
      this.$emit("formData", this.dicList);
    },
    /** 清空全部已选择 */
    clearAllHandle() {
      this.$customConfirm(<span>确定取消全部数据？</span>, {
        icon: "nicon-shanchu",
        text: "取消全部",
      })
        .then(() => {
          this.$nextTick(() => {
            this.defaultCheckedKeys = [];
            this.$refs.tree.setCheckedKeys([], true);
            // console.log(this.$refs.tree.$refs.treeRef.getCheckedKeys())
          });
          this.resultList = [];
          this.dicList = this.handleResult();
          this.$emit("formData", this.dicList);
          this.$message({
            showClose: true,
            type: "success",
            message: "取消成功",
          });
        })
        .catch(() => {});
    },
    deleteRes(index) {
      this.$customConfirm(<span>确定删除该规则吗？</span>, {
        icon: "nicon-shanchu",
        text: "删除",
      })
        .then(() => {
          this.$nextTick(() => {
            // 移除的id 回显时的id 时value，需要加 'dict_' 匹配树结构的id
            const id =
              typeof this.resultList[index].id == "number"
                ? "dict_" + this.resultList[index].id
                : this.resultList[index].id;
            this.$refs.tree.setChecked(id, false);
            this.resultList.splice(index, 1);
            this.dicList = this.handleResult();
            this.$emit("formData", this.dicList);
            // console.log(this.$refs.tree.$refs.treeRef.getCheckedKeys())
          });
          this.$message({
            showClose: true,
            type: "success",
            message: "删除成功",
          });
        })
        .catch(() => {});
    },
    // 过滤树(进行搜索)
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.tree-card {
  margin-top: 20px;
  height: 800px;
}
.title-wrap {
  height: 14px;
}
.title {
  position: relative;
  height: 14px;
  line-height: 14px;
  padding-left: 12px;
  font-weight: 600;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 14px;
    position: absolute;
    left: 0;
    background: var(--defaaultTabColor);
    border-radius: 2px 0px 2px 0px;
  }
}

.clear-btn {
  color: var(--defaultcolors);
  cursor: pointer;
}

.tree-wrap {
  width: 100%;
  height: calc(100% - 45px);
  margin-top: 16px;
  border: 1px solid #e6eaf5;
}

.tree {
  padding: 24px;
  padding-top: 8px;
}

.right-content {
  width: 321px;
  margin-left: 48px;

  .result-wrap {
    padding: 24px;

    .result-item {
      height: 36px;
      margin-bottom: 16px;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .result-label {
      text-align: left;
      width: 140px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .edit-icon {
      color: #ccc;
      font-size: 14px;
      cursor: pointer;

      &:focus {
        color: #89a8fa;
      }
      &:hover {
        color: #89a8fa;
      }
      &:active {
        color: var(--defaultcolors);
      }
    }
  }
}
</style>
