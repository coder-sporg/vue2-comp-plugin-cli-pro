<template>
  <div class="group-list f-t-14">
    <!-- v-if="!defaultLists.length&&defaultTitle" -->
    <div class="default-group">
      <el-checkbox
        v-model="checked1"
        v-if="hasShowCheckbox"
        @change="checkAll"
        >{{ defaultTitle }}</el-checkbox
      >
      <span v-if="!hasShowCheckbox" class="c-p c-default" @click="getAll"
        ><i class="el-icon-refresh-left"></i> {{ defaultTitle }}</span
      >
    </div>
    <div class="list-container" :style="{ height: isShowTree ? '99%' : '93%' }">
      <!-- 默认列表 -->
      <ul v-if="defaultLists.length">
        <li
          v-for="(item, index) in defaultLists"
          :key="index"
          class="f-t-14 self-tree-li c-p"
          @click="handleNodeClick(item, index, 'default')"
          :class="{
            'active-li': currDeIndex === index,
            'f-t-14 self-tree-li c-p': true,
          }"
        >
          <span>{{ item[keyname] }}</span>
          <div
            class="operte-box f-r"
            :style="{ right: hasShowCheckbox ? '0px' : '0' }"
          >
            <el-popover placement="right-start" trigger="hover" class="">
              <div class="detail-box">
                <p>
                  {{ $t("systemManager.collect_name") }}:{{ item[keyname] }}
                </p>
                <p>{{ $t("common.desc_text") }}:{{ item[keydesc] }}</p>
              </div>
              <img
                slot="reference"
                v-if="operateList.includes('detail')"
                src="../../assets/img/iconGroup/组 30.png"
                alt="详情"
              />
            </el-popover>
          </div>
        </li>
      </ul>
      <!-- 自定义列表 -->
      <div v-if="isShowSelf">
        <ul v-if="groupLists.length" class="self-group-ul">
          <li
            v-for="(item, index) in groupLists"
            :key="index"
            :class="{
              'active-li': currIndex === index,
              'f-t-14 self-tree-li c-p fl-bet-cen': true,
            }"
            @click.prevent="handleNodeClick(item, index, 'self')"
          >
            <div class="d-i-b fix-width fl-sta-cen">
              <i class="el-icon-star-off" v-if="isShowSelfSign"></i>
              <div
                class="m-r-l-10 d-i-b text-flow"
                :title="item[keyname] + '(' + $t(item[keytype]) + ')'"
              >
                {{ item[keyname]
                }}{{ isShowType ? "(" + $t(item[keytype]) + ")" : "" }}
                <!-- <span v-if="isShowType">({{isShowType?$t(item[keytype]):""}})</span> -->
              </div>
            </div>
            <div
              class="operte-box f-r"
              :style="{ right: hasShowCheckbox ? '0px' : '0' }"
              v-if="isIcon"
            >
              <img
                v-if="operateList.includes('remove')"
                src="../../assets/img/iconGroup/联合 6.png"
                alt=""
                @click.stop="operateFn('remove', item)"
              />
              <img
                v-if="operateList.includes('edit')"
                src="../../assets/img/iconGroup/组 37.png"
                alt=""
                @click.stop="operateFn('edit', item)"
              />
              <i
                v-if="operateList.includes('edituser')"
                class="iconfont iconyonghuxinxi f-t-16 blodFont c-p"
                @click.stop="operateFn('edituser', item)"
              ></i>
              <el-popover placement="right-start" trigger="hover">
                <div class="detail-box">
                  <p>
                    {{ $t("systemManager.collect_name") }}:{{ item[keyname] }}
                  </p>
                  <p>
                    {{ $t("common.desc_text") }}:{{ renderDesc(item[keydesc]) }}
                  </p>
                </div>
                <img
                  slot="reference"
                  v-if="operateList.includes('detail')"
                  src="../../assets/img/iconGroup/组 30.png"
                  alt="详情"
                />
              </el-popover>
            </div>
            <div class="operte-box f-r" v-else @click.stop>
              <span v-for="(iom, iox) in operateList" :key="iox + 'ope'">
                <span
                  v-if="iom != 'common.more_btn'"
                  class="c-default"
                  @click.stop="operateFn(iom, item)"
                  >{{ $t(iom) }}</span
                >
                <el-popover
                  placement="right"
                  trigger="hover"
                  ref="popoDom"
                  :open-delay="0"
                  :close-delay="0"
                >
                  <ul class="p-d-10">
                    <li
                      v-for="(im, ix) in moreBtns"
                      :key="ix + 'more'"
                      @click.stop="operateFn(im, item)"
                      class="c-default c-p more-li"
                    >
                      {{ $t(im) }}
                    </li>
                  </ul>
                  <span
                    v-if="iom == 'common.more_btn'"
                    slot="reference"
                    class="c-default"
                    >{{ $t(iom) }}</span
                  >
                </el-popover>
              </span>
            </div>
          </li>
        </ul>
        <p v-else class="t-a-c m-r-t-20">{{ $t("common.no_data_tip") }}</p>
      </div>
      <!-- 组织架构 -->
      <div>
        <el-tree
          v-if="isShowTree"
          :data="organizationLists"
          :props="defaultTreeProps"
          class="custom-tree"
          node-key="group_id"
          :show-checkbox="hasShowCheckbox"
          @node-click="handleTreeClick"
          :default-expanded-keys="defaultExpandLists"
        >
          <span
            class="custom-tree-node d-i-b fl-bet-cen"
            slot-scope="{ node, data }"
            :style="{ left: hasShowCheckbox ? '-13px' : '0' }"
          >
            <div class="fl-sta-cen">
              <span
                v-if="data.level > 1 && data.children.length"
                class="tree-expand-span m-r-r-10"
              >
                <transition name="nameoftransition">
                  <img
                    :class="{
                      expand: node.expanded,
                      'tree-expand-img': true,
                      'expand-hide': !node.expanded,
                    }"
                    src="../../assets/img/iconGroup/矩形 569 拷贝 4@2x(1).png"
                    alt=""
                  />
                </transition>
              </span>
              <span
                v-if="data.level == 1 && data.children"
                class="left-line"
              ></span>

              <span
                :style="{
                  'margin-left': hasShowCheckbox
                    ? data.children.length
                      ? '15px'
                      : data.level == 1
                      ? '15px'
                      : '34px'
                    : 0,
                }"
                class="text-flow"
                :title="data.group_name"
                >{{ data.group_name }}</span
              >
              <span v-if="data.level == 1 && data.children.length" class="">
                <transition name="nameoftransition">
                  <img
                    :class="{
                      expand: node.expanded,
                      'group-expand-img v-a-m': true,
                      'expand-hide': !node.expanded,
                    }"
                    src="../../assets/img/iconGroup/矩形 569 拷贝 4@2x.png"
                    alt=""
                  />
                </transition>
              </span>
            </div>
            <div
              class="operte-box f-r"
              :style="{ right: hasShowCheckbox ? '-13px' : '0' }"
            >
              <!-- <img v-if="operateList.includes('remove')" src="../../assets/img/iconGroup/联合 6.png" alt="" @click.stop="operateFn('remove',data)"> -->
              <el-popover placement="right-start" trigger="hover" class="">
                <div class="detail-box">
                  <p>
                    {{ $t("systemManager.collect_name") }}:{{ data.group_name }}
                  </p>
                  <p>{{ $t("common.desc_text") }}:{{ data.desc }}</p>
                </div>
                <img
                  slot="reference"
                  v-if="operateList.includes('detail')"
                  src="../../assets/img/iconGroup/组 30.png"
                  alt="详情"
                />
              </el-popover>
            </div>
          </span>
        </el-tree>
      </div>
    </div>
  </div>
</template>
<script>
import { reqAccountTree } from "@/api/tree.api.js";
import { getTreeData, unescapeHTML } from "@/utils/tool.js";
import bus from "./bus.js";
import { setTimeout } from "timers";
export default {
  name: "Tree",
  props: {
    groupLists: {
      type: Array,
      default: () => {
        return [];
      },
    },
    defaultTitle: "",
    defaultLists: {
      type: Array,
      default: () => {
        return [];
      },
    },
    defaultExpandLists: {
      type: Array,
      default: () => {
        return [];
      },
    },
    operateList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    moreBtns: {
      //更多中的操作列表
      type: Array,
      default: () => {
        return [];
      },
    },
    hasShowCheckbox: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    isShowTree: {
      //是否显示组织架构
      type: Boolean,
      default: () => {
        return true;
      },
    },
    isShowSelf: {
      //是否显示自定义组
      type: Boolean,
      default: () => {
        return false;
      },
    },
    isShowType: {
      //是否显示自定义组的类型
      type: Boolean,
      default: () => {
        return false;
      },
    },
    isShowSelfSign: {
      //是否显示自定义组前面的icon
      type: Boolean,
      default: () => {
        return true;
      },
    },
    reqtype: {
      //table请求列表的类型，是账户组/用户组/应用组的
      type: String,
      default: () => {
        return "usergroup";
      },
    },
    randomnum: "",
    isIcon: {
      //操作显示 是icon形式 - 自定义的列表中的
      type: Boolean,
      default: () => {
        return true;
      },
    },
    keyname: "", //自定义列表的name属性
    keytype: "", //自定义列表的type属性
    keydesc: {
      //自定义列表的desc属性
      type: String,
      default: () => {
        return "descp";
      },
    },
    hasDefaultClick: {
      //是否默认点击tree
      type: Boolean,
      default: () => {
        return true;
      },
    },
  },
  data() {
    return {
      defaultTreeProps: {
        //树形的默认配置
        children: "children",
        label: "label",
      },
      groupListsCopy: [],
      checked1: false,
      organizationLists: [], //树组件- 组列表
      formTree: {
        limit: 15,
        offset: 0,
        group_name: "",
      },
      radio1: 1,
      currIndex: "", //自定义列表当前index
      currDeIndex: "", //默认列表当前index
      currTreeId: "", //组织架构当前点击的id
      formdata: {},
    };
  },
  components: {},
  computed: {},
  methods: {
    // 获取组织结构Tree
    getTreeData: async function () {
      // 组织架构是同一个接口
      let info = await reqAccountTree(this.formTree);
      if (info.rows) {
        if (info.rows.length) {
          this.organizationLists = getTreeData(info.rows);
          if (this.hasDefaultClick) {
            if (this.defaultExpandLists.length) {
              this.handleTreeClick(this.defaultExpandLists[0]);
            } else {
              this.handleTreeClick();
            }
          }
        } else {
          this.handleTreeClick();
          this.organizationLists = [];
        }
      } else {
        this.handleTreeClick();
      }
    },
    // tree的全选
    checkAll() {},
    clickGroupName(index) {
      this.groupListsCopy[index].isExpand =
        !this.groupListsCopy[index].isExpand;
    },
    // 点击全部，groupid=""
    getAll() {
      let rowData = JSON.parse(JSON.stringify(this.formdata));
      for (var key in rowData) {
        rowData[key] = "";
      }
      this.init();
      this.$emit("nodeclick", rowData);
    },
    /**
     * 非组织架构节点点击事件
     * data - 点击节点的数据
     * index - 点击的索引 点击的是自定义的节点是索引
     * type - “self” 表示自定义节点
     *         “default”表示默认的节点
     */
    handleNodeClick(data, index, type) {
      if (data) {
        this.formdata = Object.assign({}, data);
        if (type == "default") {
          this.currDeIndex = index;
          // this.currDeIndex = this.currDeIndex === index?"无":index;
        } else {
          this.currIndex = index;
          // this.currIndex = this.currIndex===index?"无":index;
        }
        let rowData = JSON.parse(JSON.stringify(data));
        // if(type == "self"&&this.currIndex == "无"  || type == "default"&&this.currDeIndex == "无"){
        //     for(var key in rowData){
        //         rowData[key] = "";
        //     }
        // };
        this.$emit("nodeclick", rowData, index);
      } else {
        let params = {
          group_id: "",
        };
        this.$emit("nodeclick", params, index);
      }
    },
    // 组织架构的节点点击事件
    handleTreeClick(data, node) {
      if (data) {
        this.formdata = Object.assign({}, data);
        this.currTreeId = node.key;
        // this.currTreeId = this.currTreeId===node.key?"无":node.key;
        let rowData = JSON.parse(JSON.stringify(data));
        // if(this.currTreeId == "无"){
        //     for(var key in rowData){
        //         rowData[key] = "";
        //     }
        // };
        this.$emit("nodeclick", rowData);
      } else {
        let params = {
          group_id: "",
        };
        this.$emit("nodeclick", params);
      }
    },
    /** 针对删除 高亮下标与右侧表格不对应 */
    nodeDelHandle(data, index) {
      this.currIndex = index;
      this.$emit("nodeclick", data, index);
    },
    /** 针对添加项目 高亮下表与右侧表格数据不对应 */
    nodeAddHandle(data, index) {
      this.currIndex = index;
      this.$emit("nodeclick", data, index);
    },
    operateFn(type, data) {
      this.$emit("treeOperate", data, type);
    },
    //回调全部选中
    checkInit(data) {
      if (data.length) {
        data.forEach((item) => {
          item.ischeck = true;
          if (item.children && item.children.length) {
            this.checkInit(item.children);
          }
        });
      }
    },
    // 转义
    renderDesc(content) {
      return unescapeHTML(content);
    },
    init() {
      let this_ = this;
      // 目的是解决每次打开的时候，将组织结构默认的全部收缩
      let copyTreeData = JSON.parse(JSON.stringify(this.organizationLists));
      this.organizationLists = [];
      this.organizationLists = copyTreeData;
      // 选中的全部清空
      this.currIndex = "";
      this.currDeIndex = ""; //默认
    },
  },
  created() {
    bus.$off("tree");
    bus.$on("tree", (msg) => {
      this.formTree.group_name = msg.value;
      this.getTreeData();
    });
  },
  mounted() {
    this.groupListsCopy = JSON.parse(JSON.stringify(this.groupLists));
    // 页面需要Tree的时候请求
    if (this.isShowTree) {
      this.getTreeData();
    }
  },
  watch: {
    randomnum(n, o) {
      this.init();
    },
  },
};
</script>
<style scoped lang="scss">
.list-container {
  height: 99%;
  overflow: auto;
}
.group-list {
  height: 95%;
  overflow: auto;
}
.self-group-ul {
  max-height: 40%;
  overflow: auto;
}
.self-tree-li {
  height: 35px;
  line-height: 35px;
  color: var(--defaultfontColor);
  &:hover,
  &.active-li {
    background-color: #f5f7fa;
  }
}
.custom-tree-node {
  position: relative;
  width: 100%;
  // padding-left: 10px;
}

.left-line {
  width: 6px;
  height: 16px;
  background: #5a62b3;
  margin-top: -2px;
  vertical-align: middle;
  margin-right: 8px;
}
.group-expand-img {
  width: 8px;
  height: 5px;
  margin-left: 14px;
}
.tree-expand-img {
  vertical-align: middle;
  font-size: var(--f12);
  color: #5a62b3;
  width: 5px;
  height: 8px;
  margin-top: -3px;
}
//
.expand {
  transition: all 0.5s;
  transform: rotate(90deg) translateZ(0);
  -webkit-transform: rotate(90deg) translateZ(0);
  -webkit-transform-origin: 50% 51%;
}
.expand-hide {
  transition: all 0.5s;
}
.operte-box {
  position: relative;
}
.operte-box img {
  cursor: pointer;
}
.blodFont {
  color: #313131;
  font-weight: 600;
}
.more-li {
  margin: 4px 0;
}
.text-flow {
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>
