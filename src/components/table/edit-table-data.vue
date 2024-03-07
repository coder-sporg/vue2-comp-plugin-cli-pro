<template>
  <ux-grid
    ref="table"
    widthResize
    keep-source
    :border="border"
    :height="tableHeight"
    :highlightCurrentRow="false"
    :edit-config="{ trigger: 'click', mode: 'cell', showIcon: false }"
    :checkbox-config="{ checkAll: checkAll }"
    row-class-name="row-class"
    :show-header-overflow="'title'"
    @selection-change="selectChange"
    @select="selectRowHandle"
  >
    <ux-table-column
      type="checkbox"
      width="60"
      align="center"
    ></ux-table-column>
    <ux-table-column
      v-for="(item, index) in tableColumns"
      :key="index + item.prop"
      :resizable="item.resizable"
      :field="item.prop"
      :title="item.label"
      :sortable="item.sortable"
      align="center"
      edit-render
      :width="item.width"
      :class-name="renderCell"
    >
      <!-- 自定义头 -->
      <template v-slot:header="{ column }">
        <span>{{ column.title }}</span>
      </template>

      <!-- 编辑模板 -->
      <template v-slot:edit="scope">
        <!-- 禁用模式时显示label -->
        <span
          v-if="
            scope.row.dataStatusMap[item.prop] &&
            scope.row.dataStatusMap[item.prop].isDisabled
          "
        >
          {{ showLabel(scope.row, item) }}
        </span>

        <!-- 输入框 -->
        <el-input
          v-else-if="item.isInput"
          v-model="scope.row[item.prop]"
          @input="() => handleEdit(scope.row, item)"
          @focus="() => handleFocus(scope.row, item)"
          @blur="() => handleBlur(scope.row, item)"
          placeholder="请输入"
        ></el-input>

        <!-- 选择器 -->
        <el-select
          v-else-if="item.isSelect"
          v-model="scope.row[item.prop]"
          :multiple="item.isMultiple"
          @change="(value) => handleEdit(scope.row, item, value)"
          @visible-change="handleVisibleSelect($event, scope.row, item.prop)"
          placeholder="请选择"
        >
          <el-option
            v-for="option in Array.isArray(item.selectOptions)
              ? item.selectOptions
              : item.selectOptions(scope.row)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>

        <!-- 可搜索输入框 -->
        <!-- <el-autocomplete
                    v-else-if="item.isSearch"
                    v-model="scope.row[item.prop]"
                    :fetch-suggestions="(value, cb) => querySearchAsync(item.prop, value, cb)"
                    placeholder="请输入"
                    @select="(section) => handleEdit(scope.row, item, section)"
                ></el-autocomplete> -->

        <el-select
          v-else-if="item.isSearch"
          v-model="scope.row[item.prop]"
          :multiple="item.isMultiple"
          filterable
          clearable
          remote
          reserve-keyword
          placeholder="请选择或输入"
          @change="(value) => handleEdit(scope.row, item, value)"
          :remote-method="(value) => querySearchAsync(item.prop, value)"
          class="full-width"
        >
          <el-option
            v-for="option in Array.isArray(item.selectOptions)
              ? item.selectOptions
              : item.selectOptions(scope.row)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="item.isSearchSelect"
          v-model="scope.row[item.prop]"
          :multiple="item.isMultiple"
          :multiple-limit="item.limitLength"
          filterable
          clearable
          remote
          reserve-keyword
          :disabled="item.disabledSelect"
          placeholder="请选择或输入"
          @change="(value) => handleEdit(scope.row, item, value)"
          @visible-change="handleVisibleSelect($event, scope.row, item.prop)"
          :remote-method="(value) => querySearchAsync(item.prop, value)"
          class="full-width"
        >
          <el-option
            v-for="option in Array.isArray(item.selectOptions)
              ? item.selectOptions
              : item.selectOptions(scope.row)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="item.isNumber"
          v-model="scope.row[item.prop]"
          controls-position="right"
          @input="(value) => handleEdit(scope.row, item, value)"
          :min="item.min || 0"
          :max="item.max || Infinity"
        ></el-input-number>
      </template>

      <!-- 显示值 -->
      <template v-slot="{ row }">
        <el-popover
          placement="top-start"
          trigger="hover"
          popper-class="custom-table-popover"
        >
          <div
            class="add-field-tip"
            v-if="
              row.dataStatusMap[item.prop] &&
              row.dataStatusMap[item.prop].errMsg
            "
          >
            {{ row.dataStatusMap[item.prop].errMsg }}
          </div>
          <div class="add-field-tip" v-else>
            {{ showLabel(row, item) }}
          </div>
          <span
            :class="{
              error:
                row.dataStatusMap[item.prop] &&
                row.dataStatusMap[item.prop].errMsg,
            }"
            slot="reference"
          >
            {{ showLabel(row, item) }}
          </span>
        </el-popover>
      </template>
    </ux-table-column>
  </ux-grid>
</template>
<script>
export default {
  name: "EditTable",
  components: {},
  props: {
    border: {
      type: Boolean,
      default: false,
    },

    tableData: {
      tyle: Array,
      default: () => [],
    },

    tableColumns: {
      tyle: Array,
      default: () => [],
    },

    hasSelectBox: {
      type: Boolean,
      default: true,
    },

    tableHeight: {
      type: String | Number,
      default: 500,
    },

    checkAll: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      // 已选中数据列表
      checkedList: [],
    };
  },
  methods: {
    reloadData(tableData) {
      this.$refs.table.reloadData(tableData);
      this.$emit("checkEvent", tableData);
    },

    /**
     * 数据搜索
     * @param {Object} column  表格列
     * @param {string} prop 属性
     * @param {*} value 属性值
     */
    querySearchAsync(prop, value) {
      this.$emit("querySearchAsync", { prop, value });
    },

    /**
     * 输入框/选择框 编辑事件
     * @param {Object} row  表格行数据
     * @param {Object} column 属性
     * @param {string} section 下拉列表选择的值
     */
    handleEdit(row, column, section) {
      const index = this.tableData.findIndex((item) => item.id === row.id) || 0;
      const prop = column.prop;
      this.$emit("handleEdit", {
        prop,
        row,
        value: section || row[prop],
        index,
        column,
      });
    },

    handleFocus(row, column, section) {
      this.$emit("inputFocus", row);
    },
    handleBlur(row, column, section) {
      const index = this.tableData.findIndex((item) => item.id === row.id) || 0;
      const prop = column.prop;
      this.$emit("handleBlur", {
        prop,
        row,
        value: section || row[prop],
        index,
        column,
      });
    },

    /**
     * 选择框 收起展开事件
     * @param {Object} row  表格行数据
     * @param {string} prop 属性
     * @param {string} status 下拉列表展开收起状态
     */
    handleVisibleSelect(status, row, prop) {
      const index = this.tableData.findIndex((item) => item.id === row.id) || 0;
      if (status) {
        this.$emit("handleVisibleSelect", { prop, row, index });
      }
    },

    /**
     * 选择项需要从options列表中得到lable值
     * @param {Object} row 行数据
     * @param {Object} column 列数据
     */
    getLabel(row, column) {
      const values = row[column.prop];
      const selectOptions = Array.isArray(column.selectOptions)
        ? column.selectOptions
        : column.selectOptions(row);
      // 多选
      if (Array.isArray(values)) {
        const labels = [];
        values.forEach((value) => {
          const option = selectOptions.find((item) => item.value === value);
          if (option) {
            labels.push(option.label);
          } else {
            labels.push(value);
          }
        });
        return labels.length
          ? labels.join(",")
          : row[column.prop].length
          ? row[column.prop].join(",")
          : "请选择";
      }
      // 单选
      const item = selectOptions.find(
        (item) => item.value === row[column.prop]
      );
      return item
        ? item.label
        : row[column.prop] && row[column.prop].length
        ? row[column.prop]
        : "请选择";
    },

    /**
     * 显示label
     * @param {Object} row 行数据
     * @param {Object} column 列数据
     */
    showLabel(row, column) {
      const propStatusInfo = row.dataStatusMap[column.prop];
      // 禁止编辑项显示'-'
      if (propStatusInfo && propStatusInfo.isDisabled) {
        return row[column.prop] || "-";
      } else if (column.isSelect) {
        return this.getLabel(row, column);
      } else if (column.isSearchSelect) {
        return this.getLabel(row, column);
      } else if (column.isInput || column.isSearch) {
        if (
          propStatusInfo &&
          propStatusInfo.errMsg &&
          row[column.prop] === ""
        ) {
          return "请输入";
        } else if (row[column.prop] === "") {
          return "-";
        }
        // 显示的label与真实的value不同
        if (column.isSearch) {
          if (row[column.prop]) {
            return (row.showLabelMap && row.showLabelMap[column.prop]) || "-";
          }
        }
      }
      return row[column.prop];
    },

    /**
     * 表格selection-change
     * @param {Array} data
     */
    selectChange(data) {
      this.checkedList = data;
      this.$emit("checkEvent", this.checkedList);
    },

    /**
     * 表格单选某一行
     * @param {Array} selection
     * @param {Object} row
     */
    selectRowHandle(selection, row) {
      // 判断当前行选中状态
      const selected = selection.some((item) => item === row);
      this.$emit("selectAction", selection);
    },

    /** 表格全选 */
    toggleAllSelection() {
      this.$refs.table.toggleAllSelection();
    },

    /** 清除表格选中 */
    clearSelection() {
      this.$refs.table.clearSelection();
    },

    /**
     * 表格不能编辑时，将单元格置灰
     * @param {Object} e 行列数据信息集合
     */
    renderCell(e) {
      const prop = this.tableColumns[e.columnIndex - 1].prop;
      if (e.row.dataStatusMap[prop] && e.row.dataStatusMap[prop].isDisabled) {
        return "disabled-cell";
      } else {
        return "normal-cell";
      }
    },

    // activeMethod({row, rowIndex, column, columnIndex}) {
    //     if (row.dataStatusMap[prop] && row.dataStatusMap[prop].isDisable) {
    //         return false
    //     } else {
    //         return true
    //     }
    // }
  },
  mounted() {},
};
</script>
<style lang="scss">
// 表格头字体
.elx-table .elx-header--column {
  font-weight: 500;
  background-color: #f0f5fa;
}
.elx-table--body-wrapper {
  min-height: calc(100vh - 320px);
}
// 多选框样式
.elx-table .is--indeterminate.elx-cell--checkbox .elx-checkbox--icon:before,
.elx-table .is--checked.elx-cell--checkbox .elx-checkbox--icon:before,
.elx-table .is--indeterminate.elx-cell--checkbox .elx-checkbox--icon:before {
  background-color: var(--defaultcolors);
  border-color: var(--defaultcolors);
  color: var(--defaultcolors);
}

.custom-table-popover {
  max-width: 500px;
}

// 行样式
.row-class:hover {
  background-color: #f5f7fc;
}
// 单元格样式
.disabled-cell {
  background-color: #f5f7fc;
  cursor: not-allowed;
}
.normal-cell {
  cursor: pointer;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
  right: 5px;
}
</style>

<style lang="scss" scoped>
.add-field-tip {
  padding: 8px;
}

.error {
  color: #fe575d;
}
::v-deep .el-select .el-tag {
  position: relative;
  min-width: 50px;
  line-height: 15px;
}
::v-deep .el-select .el-tag .el-icon-close {
  position: absolute;
  right: 0;
  top: 5px;
}
</style>
