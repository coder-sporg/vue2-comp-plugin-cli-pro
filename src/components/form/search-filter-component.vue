<template>
  <div class="searchWrap full-width">
    <div class="searchFormWrap fl-bet-cen fl-wrap">
      <div class="fl-sta-cen">
        <slot></slot>
        <el-form
          class="fl-sta-sta fl-wrap"
          ref="searchForm"
          label-width="0px"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item v-for="(item, index) in searchFormList" :key="index">
            <el-autocomplete
              v-if="item.type == 'fixinput'"
              v-model.trim="item.value"
              :maxLength="128"
              :trigger-on-focus="triggerOnfocus"
              value-key="label"
              :debounce="300"
              :select-when-unmatched="false"
              type="text"
              :fetch-suggestions="(qs, cb) => querySearchAsync(qs, cb, item)"
              @select="(selection) => fixinputHandle(selection)"
              @keyup.enter.native="fixinputHandle(undefined)"
              :placeholder="showPlaceholder(item)"
              :style="{ width: item.width ? item.width + 'px' : '340px' }"
            >
              <el-select
                ref="cascade"
                slot="prepend"
                filterable
                :options="item.list"
                v-model="item.key"
                :placeholder="$t('common.select_default_place')"
                :style="{
                  width: item.selectWidth ? item.selectWidth + 'px' : '120px',
                }"
                @change="(value) => fixinputChange(value, item)"
              >
                <el-option
                  v-for="(inp, index) in item.list"
                  :key="index"
                  :label="$t(inp.label)"
                  :value="inp.key"
                ></el-option>
              </el-select>
              <template slot-scope="{ item }">
                <el-popover placement="bottom" trigger="hover" v-if="item.icon">
                  <div class="pd-10">{{ item.iconTip }}</div>
                  <span
                    slot="reference"
                    class="iconfont mr-r-10"
                    :class="item.icon"
                    style="margin-left: -5px"
                  ></span>
                </el-popover>
                <span class="">{{ item.label }}</span>
              </template>
            </el-autocomplete>
            <el-date-picker
              :style="{ 'line-height': '36px', width: dateRangeWidth + 'px' }"
              v-if="item.type == 'timerange'"
              v-model="item.value"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              align="right"
              :clearable="false"
              :format="item.format || 'yyyy-MM-dd HH:mm:ss'"
              :value-format="item.format || 'yyyy-MM-dd HH:mm:ss'"
              @change="(v) => timeChangeHandle(v, true, item)"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item v-if="isChoosePageSize" label-width="114px">
            <el-select
              v-model="maxDataLength"
              style="width: 200px"
              @change="changePageSizeHandle"
            >
              <el-option
                v-for="item in [100, 200, 500, 1000]"
                :key="item"
                :label="'返回最大数据量：' + item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <slot name="btn-before"></slot>
          <el-button
            type="primary"
            plain
            @click="searchHandle"
            v-if="btnVisible"
            class="mr-b-20"
            >{{ $t("common.search_btn") }}</el-button
          >
        </el-form>
      </div>
      <slot name="right"></slot>
    </div>
    <FilterTag
      ref="filterTag"
      :corresModule="this.corresModule"
      @apiDelStatic="apiDelStatic"
    ></FilterTag>
  </div>
</template>
<script>
import FilterTag from "@/components/form/filter-tag-component.vue";
import moment from "moment";

export default {
  components: {
    FilterTag,
  },
  props: {
    formLists: {
      type: Array,
      default: () => [],
    },
    /** 是否focus后立马显示输入建议 */
    triggerOnfocus: {
      type: Boolean,
      default: true,
    },
    btnVisible: {
      type: Boolean,
      default: true,
    },
    /** 页面显示的过滤项 */
    filterList: {
      type: Array,
      default: () => [],
    },
    /** 组件名称, 页面有多个tab时必传项!!!  用于与组件关联 */
    corresModule: {
      type: String,
      default: "",
      // require: true
    },
    /** 日选范围控件宽度 */
    dateRangeWidth: {
      type: String,
      default: "400",
    },
    /** 日期快捷键 */
    pickerOptions: {
      type: Object,
      default: () => {
        return {
          shortcuts: [
            {
              text: "最近一周",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "最近一个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "最近三个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit("pick", [start, end]);
              },
            },
          ],
        };
      },
    },
    // 是否需要选择返回数据条数大小
    isChoosePageSize: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    filterList: {
      immediate: true,
      handler: function (data) {},
    },
    formLists: {
      immediate: true,
      handler: function (data) {
        this.searchFormList = JSON.parse(JSON.stringify(data));
      },
    },
  },
  data() {
    return {
      searchFormList: [],
      // 返回最大数据量
      maxDataLength: 100,
    };
  },
  methods: {
    // fixinput key变化
    fixinputChange(value, item) {
      item.value = "";
    },
    /** 清空搜索条件 */
    clearAllFilterTag() {
      this.$nextTick(() => {
        this.$refs.filterTag && this.$refs.filterTag.clearAllHandle();
      });
    },
    /** fixinput值处理 */
    fixinputHandle(data) {
      /** 搜素条件 只有
       * 时间范围 + 标签搜索
       * 根据key 去判断，时间范围key 是time
       * 如果是时间范围，添加标签数据但是不显示标签内容
       */
      for (let i = 0; i < this.searchFormList.length; i++) {
        let item = this.searchFormList[i];
        let value;
        let condition;
        if (item.key === "timeRange") {
          value = {
            showValue: `${item.value[0]} 至 ${item.value[1]}`,
            realValue: {
              start: item.value[0],
              end: item.value[1],
            },
          };
          condition = {
            corresModule: this.corresModule,
            conditionName: "查询时间",
            model: "mutex",
            key: "timeRange",
            value: [value],
          };
          this.addFilterHandle(condition);
        } else {
          if (item.value) {
            let filter = item.list.find((option) => option.key === item.key);
            if (!filter) {
              return false;
            }
            /** 如果条件类型是select, 则必须从值列表中选中值 */
            if (!data && filter.type === "select") {
              return false;
            }
            if (data) {
              /** 从值列表中选择的值 */
              value = {
                showValue: data.label,
                realValue: data.value,
              };
            } else {
              /** 正常输入值 */
              value = {
                showValue: item.value.substring(0, 128),
                realValue: item.value.substring(0, 128),
              };
            }
            condition = {
              corresModule: this.corresModule,
              conditionName: filter.label,
              model: filter.model || "or",
              key: item.key,
              value: [value],
            };
            this.addFilterHandle(condition);
            item.value = "";
          } else {
            this.$nextTick(() => {
              if (this.$refs.filterTag.getLength() > 0) {
                let flag = this.$refs.filterTag.filterList.find(
                  (ele) => ele.key === "timeRange"
                );
                if (!flag) {
                  this.$refs.filterTag.searchBtnHandle();
                }
              } else {
                this.$EventBus.$emit("refreshFn", {}, this.corresModule);
              }
            });
          }
        }
      }
    },
    /** 时间范围变化
     * @param {Array} v 时间范围改变后的值
     * @param {Boolean} searchFlag 是否需要添加筛选条件并进行请求
     */
    timeChangeHandle(v, searchFlag = true, item) {
      let range = JSON.parse(JSON.stringify(v));
      if (moment(v[0]).add(1, "month").valueOf() < moment(v[1]).valueOf()) {
        this.$message({
          type: "warning",
          message: "时间范围最多选择一个月",
        });
        range = [v[0], moment(v[0]).add(1, "month").format("YYYY-MM-DD")];
        item.value = range;
      }
      let value = {
        showValue: `${range[0]} 至 ${range[1]}`,
        realValue: {
          start: range[0],
          end: range[1],
        },
      };
      let condition = {
        corresModule: this.corresModule,
        conditionName: "查询时间",
        model: "mutex",
        key: "timeRange",
        value: [value],
      };
      if (searchFlag) {
        this.addFilterHandle(condition);
      }
    },
    /** 添加筛选项 */
    addFilterHandle(condition) {
      this.$EventBus.$emit("addFiterTag", condition, this.corresModule);
    },

    /**
     * @desc 删除条件tag
     * @param {string} k 条件key
     * @param {string | number} v 条件值
     */
    delFilterHandle(k, v) {
      this.$nextTick(() => {
        this.$refs.filterTag.delFiterTagHandle(k, v);
        // this.$EventBus.$emit('delFiterTag', condition, this.corresModule);
      });
    },

    /** 点击搜索按钮 */
    searchHandle() {
      this.fixinputHandle(undefined);
    },

    /** 输入处理 */
    querySearchAsync(qs, cb, item) {
      if (!item.key) {
        cb([]);
        return false;
      }
      let filter = item.list.find((data) => data.key === item.key);
      // 带有默认选项
      if (filter.options && filter.type === "select") {
        cb(filter.options);
      }
      // 需要远程搜索字段
      else if (filter.type === "select") {
        this.$emit("querySearchFn", filter.key, qs, cb, this.corresModule);
      }
      // 手动输入
      else {
        cb([]);
      }
    },

    /** 显示placeholder */
    showPlaceholder(formItem) {
      let placeholder = "";
      if (formItem.type === "fixinput") {
        formItem.list.forEach((item) => {
          if (item.key === formItem.key) {
            placeholder =
              item.placeholder ||
              (item.type === "select" ? "请选择" : "请输入查询关键字");
          }
        });
      } else {
        placeholder = "请输入查询关键字";
      }
      return placeholder;
    },

    /** API接口识别，页面打开filterTag数据初始化 */
    clearTagHandle(flag) {
      this.$nextTick(() => {
        this.$refs.filterTag.clearTagHandle(flag);
      });
    },

    /** 切换页面显示条数 */
    changePageSizeHandle() {
      this.$emit("changeSize", this.maxDataLength);
    },

    /**
     * API接口 静态文件checkbox联动
     */
    apiDelStatic(type) {
      this.$emit("apiDelStatic", type);
    },
  },
};
</script>
<style scoped lang="scss">
.searchForm .el-range-editor--small.el-input__inner {
  height: 36px;
}
.searchForm .el-form-item {
  margin-bottom: 0;
}
</style>
