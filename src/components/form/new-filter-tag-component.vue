<template>
  <div class="filter-tag-container fl-sta-sta" v-show="filterLength">
    <ul class="ov-auto tag-list fl-sta-cen fl-wrap">
      <template v-for="(item, index) of filterList">
        <li
          v-if="item.key !== 'timeRange' && item.value && item.value.length"
          :key="index"
          class="filter-item fl-sta-cen fl-wrap"
        >
          <span class="mr-r-10 tag-name color-grey"
            >{{ `${item.conditionName}` }}:</span
          >
          <div v-for="(valueMap, idx) of item.value" :key="idx">
            <span class="tag-value">{{ valueMap.showValue }}</span>
            <i
              class="iconfont iconshanchu1 mr-l-10 del-icon"
              @click.stop="delFiterTagHandle(item.key, valueMap.realValue)"
            ></i>
            <b
              class="mr-r-10 mr-l-10 color-primary"
              v-if="item.model === 'and' && idx != item.value.length - 1"
            >
              and
            </b>
            <b
              class="mr-r-10 mr-l-10 color-primary"
              v-else-if="idx != item.value.length - 1"
              >or</b
            >
          </div>
        </li>
      </template>
    </ul>
    <el-button class="clear-btn" type="text" @click="clearAllHandle">
      <span>{{ $t("common.clear_btn") }}</span>
    </el-button>
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
        if (k === "fileSuffix" && v === "commonStatic") {
          this.$emit("apiDelStatic");
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
      this.$emit("apiDelStatic");
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
.filter-tag-container {
  margin: 4px 0;
}
.tag-list {
  max-height: 150px;
}
.filter-item {
  width: fit-content;
  padding: 2px 12px;
  margin: 4px 8px 4px 0px;
  cursor: pointer;
  background: #f2f4f7;
  border-radius: 6px;
  border: 1px solid #eef2fe;
  span {
    font-size: 12px;
    font-weight: 400;
    color: #414141;
  }
  .tag-vlaue {
    color: #3d3d3d;
  }
  .del-icon {
    font-size: 13px;
    color: #cccccc;
  }
}
.clear-btn {
  padding: 6px 15px;
  margin-top: 4px;
  span {
    font-size: 13px;
  }
}
</style>
