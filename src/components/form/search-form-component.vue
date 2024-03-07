<template>
  <div :class="{ 'have-filter-form': hasFilter }">
    <el-form
      ref="searchForm"
      label-width="0px"
      :inline="true"
      @submit.native.prevent
      class="fl-sta-sta fl-wrap searchForm"
    >
      <slot></slot>
      <el-form-item v-for="(item, index) in FormLists" :key="index">
        <el-select
          ref="select"
          :class="{ 'custom-select': customSelect }"
          filterable
          v-if="item.type == 'select'"
          :multiple="item.multiple"
          v-model="item.value"
          :placeholder="$t(item.placeholder)"
          clearable
          @change="searchHandle(item.key, item.value)"
          :popper-class="popperClass"
        >
          <el-option
            v-for="(ism, idx) in item.optionList"
            :key="idx"
            :label="$t(ism.label)"
            :value="ism.value"
          ></el-option>
        </el-select>
        <el-input
          v-if="item.type == 'input'"
          :placeholder="$t('common.input_default_place')"
          v-model.trim="item.value"
          clearable
          @keyup.enter.native="searchHandle"
          @clear="searchHandle"
        >
          <el-select
            v-model="inputForm.select"
            slot="prepend"
            :placeholder="$t('common.select_default_place')"
            :style="{
              width: item.selectWidth ? item.selectWidth + 'px' : '120px',
            }"
            @change="item.value = ''"
          >
            <el-option
              v-for="(inp, index) in item.list"
              :key="index"
              :label="$t(inp.label)"
              :value="index"
            ></el-option>
          </el-select>
        </el-input>
        <el-input
          class="search-form-input-text"
          v-if="item.type == 'searchInput'"
          v-model.trim="item.value"
          :placeholder="item.placeholder || $t('common.input_default_place')"
          clearable
          @keyup.enter.native="searchHandle"
          @clear="searchHandle"
        >
          <template slot="append">
            <span @click="searchHandle">搜索</span>
          </template>
          <i
            slot="prefix"
            class="el-input__icon el-icon-search cursor"
            @click="searchHandle"
          ></i>
        </el-input>
        <el-date-picker
          style="width: 400px; line-height: 36px"
          v-if="item.type == 'timerange'"
          v-model="item.value"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="~"
          :start-placeholder="$t('common.start_time_place')"
          :end-placeholder="$t('common.end_time_place')"
          align="right"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="searchHandle"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          @click="searchHandle"
          v-if="btnVisible"
          >{{ $t("common.confirm_btn") }}</el-button
        >
      </el-form-item>
    </el-form>
    <FilterTag
      ref="filterTag"
      :corresModule="this.corresModule"
      v-if="hasFilter"
    ></FilterTag>
  </div>
</template>
<script>
import FilterTag from "@/components/form/filter-tag-component.vue";
export default {
  name: "searchFormModule",
  components: {
    FilterTag,
  },
  props: {
    // 页面初始化时是否请求列表
    autoEmitReq: {
      type: Boolean,
      default: true,
    },
    FormLists: {
      type: Array,
      default: [],
    },
    customSelect: {
      type: Boolean,
      default: false,
    },
    btnVisible: {
      type: Boolean,
      default: true,
    },
    // 是否可筛选
    hasFilter: {
      type: Boolean,
      default: false,
    },
    corresModule: {
      type: String,
      default: "",
      // require: true
    },
    entry: {
      type: String,
      default: "",
      // require: true
    },
    // 日期默认快捷键
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
    // select 下拉框的类名
    popperClass: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      formData: {},
      /** 输入框下拉列表 */
      inputForm: {
        select: 0,
      },
    };
  },
  methods: {
    blurHandle() {
      this.$nextTick(() => {
        this.$refs.select.forEach((ele) => {
          ele.blur();
        });
      });
    },
    inputSelectInit(idx) {
      this.inputForm.select = 0;
    },
    /** 搜索handle */
    searchHandle(type_name, type, detail_name, detail) {
      this.FormLists.forEach((ele) => {
        if (ele.type == "input") {
          ele.list.forEach((item, idx) => {
            if (idx == this.inputForm.select) {
              this.formData[item.key] = ele.value;
            } else {
              this.formData[item.key] = "";
            }
          });
        } else if (ele.type == "select") {
          /** 下拉框联动 - PC终端 系统类型 */
          this.$emit("change", type_name, type, detail_name, detail);
          this.formData[ele.key] = ele.value;
        } else {
          this.formData[ele.key] = ele.value;
        }
      });
      this.$emit("Search", this.formData);
    },
    /** 清空搜索项 */
    clearHandle(type) {
      this.FormLists.forEach((ele, index) => {
        if (ele.key == "platform") {
          /** 针对 门户 平台下拉框 */
          this.FormLists[index].value = "WEB";
        } else {
          if (ele.multiple) {
            this.FormLists[index].value = [];
          } else {
            this.FormLists[index].value = "";
          }
        }
        if (ele.type == "input") {
          ele.list.forEach((item, idx) => {
            this.formData[item.key] = "";
          });
        } else {
          if (ele.key == "platform") {
            /** 针对 门户 平台下拉框 */
            this.formData[ele.key] = "WEB";
          } else {
            if (ele.multiple) {
              this.formData[ele.key] = [];
            } else {
              this.formData[ele.key] = "";
            }
          }
        }
      });
      if (type !== "clear") {
        this.$emit("Search", this.formData);
      }
    },
  },
  mounted() {
    if (!this.autoEmitReq) return;
    let type,
      type_name = "os_type";
    let detail,
      detail_name = "";
    this.FormLists.forEach((ele) => {
      if (ele.type == "select") {
        if (ele.key == "os_type") {
          type = ele.value;
        } else if (ele.key == "os_version" || ele.key == "os_detail") {
          detail_name = ele.key;
          detail = ele.value;
        }
      }
    });
    /** 为满足change事件触发 */
    this.searchHandle(type_name, type, detail_name, detail);
  },
};
</script>
<style scoped lang="scss">
.searchForm .el-range-editor--small.el-input__inner {
  height: 36px;
}
.custom-select {
  width: 200px;
}
.have-filter-form {
  padding-bottom: 10px;
  .searchForm .el-form-item--small.el-form-item {
    margin-bottom: 10px;
  }
}
.search-form-input-text {
  ::v-deep .el-input-group__append {
    position: relative;
    background-color: #fff;
    border-radius: 8px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    cursor: pointer;
    &::after {
      display: block;
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 18px;
      background: #e6eaf5;
      border-radius: 0px 0px 0px 0px;
    }
    &:hover {
      color: #5682f7;
    }
  }
  ::v-deep .el-input__inner {
    border-right: 0;
    border-radius: 8px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    &:focus {
      border: 1px solid #409eff;
    }
  }

  ::v-deep .el-input__icon {
    line-height: 36px !important;
  }
}
</style>
