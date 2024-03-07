<template>
  <div>
    <ul
      class="ov-auto tag-box fl-sta-cen fl-wrap"
      :style="{ 'margin-bottom': filterList.length ? '12px' : '' }"
    >
      <template v-for="(item, index) of filterList">
        <li
          v-if="item.key !== 'timeRange' && item.value && item.value.length"
          :key="index"
          class="filter-item mr-r-8 mr-b-20 fl-sta-cen fl-wrap"
        >
          <span class="mr-r-10">{{ `${item.conditionName}` }}: </span>
          <div
            v-for="(valueMap, idx) of item.value"
            :key="idx"
            class="fl-sta-cen"
          >
            <span
              style="max-width: 120px"
              class="dis-inb text-flow"
              :title="valueMap.showValue"
              >{{ valueMap.showValue }}</span
            >
            <i
              class="iconfont iconshanchu1 mr-l-8 del-icon"
              @click.stop="delFiterTagHandle(item.key, valueMap.realValue)"
            ></i>
            <b
              class="mr-r-10 mr-l-10 color-primary"
              v-if="item.model === 'and' && idx != item.value.length - 1"
              >and</b
            >
            <b
              class="mr-r-10 mr-l-10 color-primary"
              v-else-if="idx != item.value.length - 1"
              >or</b
            >
          </div>
        </li>
      </template>
      <el-button
        type="text"
        @click="clearAllHandle"
        v-show="filterLength"
        style="margin-bottom: 8px"
        ><span style="font-size: 13px">{{
          $t("common.clear_btn")
        }}</span></el-button
      >
    </ul>
  </div>
</template>

<script>
export default {
  name: "FilterTagComponent",
  props: {
    /** 组件名称, 页面有多个tab时必传项!!!  用于与组件关联 */
    corresModule: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      filterList: [
        // {
        //     conditionName: '授权状态',    // 条件名称
        //     model: 'or',                 // 且-and 或-or 互斥-mutex 默认条件类型or
        //     key: 'authStatus',           // 真实条件key
        //     value: [
        //         {
        //             showValue: '',       // 显示值
        //             realValue: '',       // 真实值
        //         },
        //     ]
        // }
      ],

      // filterList 除去 timeRange 标签的长度，为了实现时间范围标签不显示时，正确判断清空按钮的可见状态
      filterLength: 0,

      // filterList变更是否触发搜索
      shouldSearch: true,
    };
  },
  watch: {
    filterList: {
      handler(curFilterList) {
        this.filterLength = 0;
        let newCondition = {};
        curFilterList.length &&
          curFilterList.forEach((item) => {
            if (item.key !== "timeRange") {
              this.filterLength++;
            }
            let value = item.value.map((item) => item.realValue);
            newCondition[item.key] = value;
          });
        // 刷新数据
        if (this.shouldSearch) {
          this.$EventBus.$emit("refreshFn", newCondition, this.corresModule);
        } else {
          this.shouldSearch = true;
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
     * 获取filter数组长度
     */
    getLength() {
      return this.filterList.length;
    },
    // 搜索输入框为空时，点击搜索按钮触发搜索
    searchBtnHandle() {
      let newCondition = {};
      this.filterList.length &&
        this.filterList.forEach((item) => {
          let value = item.value.map((item) => item.realValue);
          newCondition[item.key] = value;
        });
      // 刷新数据
      this.$EventBus.$emit("refreshFn", newCondition, this.corresModule);
    },
    /**
     * @desc 添加条件tag
     * @param {Object} condition 条件
     * */
    addFiterTagHandle(condition) {
      // console.log(condition, 'condition')
      try {
        // 条件只能添加到对应的tab
        if (
          condition.hasOwnProperty("corresModule") &&
          condition.corresModule !== this.corresModule
        ) {
          return false;
        }

        let index = this.filterList.findIndex(
          (item) => item.conditionName === condition.conditionName
        );
        // 条件列表已存在
        if (index > -1) {
          // 条件类型为互斥直接替换
          if (condition.model === "mutex") {
            this.filterList.splice(index, 1, condition);
          }
          // 其他条件类型 and or
          else {
            // 条件值存在互斥的情况
            // eg: 选择"全部"筛选项时 清空已有的条件列表
            if (condition.value[0].model === "mutex") {
              this.filterList.splice(index, 1, condition);
            } else {
              const curData = this.filterList[index];
              // 值列表中已经存在互斥值
              // eg: 值列表中已经存在了"全部"筛选项值则先清除"全部"筛选项值 再添加其它值
              if (curData.value[0].model === "mutex") {
                if (this.filterList.length < 2) {
                  this.filterList = [condition];
                } else {
                  this.filterList.splice(index, 1, condition);
                }
              } else {
                // 判断条件值是否重复
                let i = curData.value.findIndex(
                  (item) => item.realValue === condition.value[0].realValue
                );
                if (i === -1) {
                  curData.value = [...curData.value, ...condition.value];
                }
              }
            }
          }
        }
        // 不存在
        else if (condition.key) {
          this.filterList.push(condition);
        }
        // 添加筛选项后其他模块同步设置条件选中效果
        this.$EventBus.$emit(
          "addFilterSelected",
          condition.key,
          condition.value[0].realValue,
          this.corresModule
        );
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * @desc 删除条件tag
     * @param {string} k 条件key
     * @param {string | number} v 条件值
     * */
    delFiterTagHandle(k, v) {
      try {
        // API接口 静态文件checkbox联动
        if (this.corresModule === "ApiDiscovery") {
          if (k === "fileSuffix" && v === "commonStatic") {
            this.$emit("apiDelStatic", "fileSuffix");
          }
          if (k === "ipNot" && v === "public") {
            this.$emit("apiDelStatic", "ipNot");
          }
          if (k === "ip" && v === "private") {
            this.$emit("apiDelStatic", "ip");
          }
          if (k === "userAgentNot" && v === "commonUa") {
            this.$emit("apiDelStatic", "userAgentNot");
          }
          if (k === "userAgentNot" && v === "") {
            this.$emit("apiDelStatic", "userAgentNotContainNull");
          }
          if (k === "userAgent" && v === "") {
            this.$emit("apiDelStatic", "userAgentContainNull");
          }
        }

        let index = this.filterList.findIndex((item) => item.key === k);
        if (index > -1) {
          let condition = this.filterList[index];
          condition.value = condition.value.filter(
            (item) => item.realValue !== v
          );

          // 添加筛选项后其他模块同步清除条件选中效果
          this.$EventBus.$emit("clearFilterSelected", k, v, this.corresModule);

          // 如果没有条件值为空则将条件删除
          if (condition.value.length === 0) {
            this.filterList.splice(index, 1);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    /** 清空搜索条件 */
    clearAllHandle() {
      this.$emit("apiDelStatic", "all");
      this.$EventBus.$emit("clearAllFilter", this.corresModule);
      // this.filterList = [];
      let tempArr = [];
      this.filterList.forEach((ele) => {
        if (ele.key === "timeRange") {
          tempArr.push(ele);
        }
      });
      this.filterList = tempArr;
    },

    /** API接口识别，抽屉打开 filterTag数据初始化
     * @param Boolean flag filterList长度改变是否触发搜索
     */
    clearTagHandle(flag) {
      let tempArr = [];
      this.filterList.forEach((ele) => {
        if (ele.key === "timeRange") {
          tempArr.push(ele);
        }
      });
      this.filterList = tempArr;
      this.shouldSearch = flag;
    },
  },
  mounted() {
    this.$EventBus.$on("addFiterTag", this.addFiterTagHandle);
    this.$EventBus.$on("delFiterTag", this.delFiterTagHandle);
  },
  beforeDestroy() {
    this.$EventBus.$off("addFiterTag", this.addFiterTagHandle);
    this.$EventBus.$off("delFiterTag", this.delFiterTagHandle);
  },
};
</script>

<style lang="scss" scoped>
.tag-box {
  max-height: 150px;
}
.del-icon {
  font-size: 13px;
  color: #c4c6cc;
}
.filter-item {
  width: fit-content;
  padding: 4px 12px;
  // margin-top: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  background: #f2f4f7;
  border-radius: 2px;
  span {
    font-size: 13px;
    font-weight: 400;
    color: #414141;
  }
}
</style>
