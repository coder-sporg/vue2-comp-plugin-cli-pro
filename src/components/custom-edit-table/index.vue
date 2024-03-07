<template>
  <div class="custom-edit-table">
    <el-table
      ref="editabletable"
      v-loading="loading"
      element-loading-text="加载中"
      :data="tableData"
      :height="tableHeight"
      current-row-key="id"
      :header-cell-style="{ background: '#F0F5FA', color: '#494F55' }"
      :row-style="{ height: '52px' }"
      :border="false"
      @select="selectRowHandle"
      @select-all="selectAllRowHandle"
      @cell-dblclick="handleCellClick"
    >
      <!-- 多选框列 -->
      <el-table-column
        type="selection"
        width="45"
        align="center"
        v-if="hasSelectBox"
        :selectable="selectableHandle"
        :reserve-selection="reserveSelection"
        fixed="left"
      ></el-table-column>
      <el-table-column
        v-for="(item, index) in tableColumns"
        :key="index + item.prop"
        :label="$t(item.label)"
        :prop="item.prop"
        :width="item.width"
        align="left"
        :show-overflow-tooltip="item.isOmit"
      >
        <template slot-scope="row">
          <!-- 渲染可编辑列 input-->
          <div v-if="item.isInput">
            <el-input
              v-if="row.editable === item.prop"
              v-model="row[item.prop]"
              v-focus
              :placeholder="item.placeholder"
              style="width: 80%"
              :controls="false"
              @blur="row.editable = ''"
            />
            <el-popover v-else placement="bottom-start" trigger="hover">
              <div class="cell-pops" v-if="row.isError">111111</div>
              <div class="cell-pops" v-if="row.isSuccess">222222</div>
              <div class="cell-item-normal cursor" slot="reference">
                <span :class="{ 'error-text': row.isError }">{{
                  row[item.prop]
                }}</span>
              </div>
            </el-popover>
          </div>

          <!-- 渲染可编辑列 select-->
          <div v-else-if="item.isSelect">
            <el-select
              ref="selects"
              v-focus
              v-if="row.editable === item.prop"
              v-model="row[item.prop]"
              style="width: 80%"
              clearable
              filterable
              placeholder="请选择"
              @blur="selectBlurHandle(row)"
              @visible-change="visibleChange(item.prop, row)"
              @change="selectChangeHandle($event, row)"
            >
              <el-option
                v-for="item in row[`${item.prop}Options`]"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
            <el-popover v-else placement="bottom-start" trigger="hover">
              <div class="cell-pops" v-if="row.isError">111111</div>
              <div class="cell-pops" v-if="row.isSuccess">222222</div>
              <div class="cell-item-normal cursor" slot="reference">
                <span :class="{ 'error-text': row.isError }">{{
                  row[item.prop]
                }}</span>
              </div>
            </el-popover>
          </div>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="cell1" label="对外服务地址" align="center">
                <template slot-scope="scope">
                    <el-input v-if="scope.row.editable === 'cell1'" v-model="scope.row.cell1" v-focus style="width:80%"
                        :controls="false" @blur="handleInputReset(scope.row)" />
                    <span v-if="scope.row.editable !== 'cell1'">
                        {{ scope.row.cell1 }}
                    </span>
                </template>
            </el-table-column> -->
    </el-table>
    <!-- <div class="add-load-balance mr-t-10">
            <el-button type="text" class="mr-r-20" @click="addServiceHandle">
                <i class="iconfont icontianjia1"></i>
                <span>新增服务</span>
            </el-button>
        </div> -->
  </div>
</template>
<script>
export default {
  props: {
    tableData: {
      tyle: Array,
      default: () => [],
    },

    tableColumns: {
      tyle: Array,
      default: () => [],
    },

    loading: {
      type: Boolean,
      default: false,
    },
    hasSelectBox: {
      type: Boolean,
      default: false,
    },

    reserveSelection: {
      type: Boolean,
      default: false,
    },

    hasOperateExpand: {
      type: Boolean,
      default: false,
    },
    tableHeight: {
      type: String | Number,
      default: "10vh",
    },
  },
  data() {
    return {
      loading: false,
      tabList: [
        {
          label: "负载均衡/高可用服务名称",
          propName: "balance",
          placeholder: "请输入服务名称",
        },
        {
          label: "对外服务地址",
          propName: "service",
          placeholder: "请输入服务对外地址（域名或IP地址）",
        },
        {
          label: "对外TCP端口",
          propName: "tPort",
          placeholder: "请输入对外TCP端口",
        },
        {
          label: "对外UDP端口",
          propName: "uPort",
          placeholder: "请输入对外UDP端口",
        },
      ],
      dataSource: [
        {
          balance: "默认名称1",
          service: "111.111.111.111",
          tPort: "9001",
          uPort: "9002",
          editable: "",
          isEdit: false,
        },
      ],
    };
  },
  directives: {
    // 注册一个局部的自定义指令 v-focus
    focus: {
      // 指令的定义
      inserted: function (el) {
        // 聚焦元素
        if (el) {
          el.querySelector("input").focus();
        }
      },
    },
  },
  methods: {
    handleCellClick(row, column) {
      row.editable = column.property;
      row.isEdit = true;
    },
    handleInputReset(row) {
      row.editable = "";
    },
    addServiceHandle() {
      const length = this.dataSource.length + 1;
      const tableItem = {
        balance: "默认名称" + length,
        service: "111.111.111.111",
        tPort: "9001",
        uPort: "9002",
        editable: "",
        isEdit: false,
      };
      this.dataSource.push(tableItem);
    },
    visibleChange(status, row) {
      console.log(row, "....1");
      this.selectVisible = status;
      if (status === "region") {
        this.$emit("update-region-list");
      }
    },

    selectChangeHandle(e, row) {
      console.log(e, row, "....");
      row.region = "";
      row.city = "";
    },

    selectBlurHandle(row) {
      // if (!this.selectVisible) {
      setTimeout(() => {
        row.editable = "";
      }, 300);
      // }
    },

    /**
     * 表格单选某一行
     * @param {Array} selection
     * @param {Object} row
     */
    selectRowHandle(selection, row) {
      // 判断当前行选中状态
      const selected = selection.some((item) => item === row);
      this.selectChildren(row, selected);
    },

    /**
     * 表格全选
     * @param {Array} selection
     */
    selectAllRowHandle(selection) {
      // tableData 只要有一层在selection中，就是全选状态
      const isSelect = this.tableData.some((item) => selection.includes(item));
      if (isSelect) {
        selection.forEach((item) => {
          this.selectChildren(item, isSelect);
        });
      } else {
        // 否则 是全不选状态
        this.tableData.forEach((item) => {
          this.selectChildren(item, isSelect);
        });
      }
    },

    /**
     * 选择子项
     * @param {Object} row
     * @param {boolean} selected
     */
    selectChildren(row, selected) {
      if (row.children && Array.isArray(row.children)) {
        row.children.forEach((item) => {
          this.toggleSelection(item, selected);
          this.selectChildren(item, selected);
        });
      }
    },

    /**
     * 切换行选中状态
     * @param {Object} row
     * @param {boolean} select
     */
    toggleSelection(row, select) {
      row &&
        this.$nextTick(() => {
          this.$refs.table && this.$refs.table.toggleRowSelection(row, select);
        });
    },

    /** 该行checkbox是否可用 */
    selectableHandle(row, index) {
      // 针对【身份源模块】字段映射
      if (row.required === "true") {
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
.add-load-balance {
  .iconfont {
    color: #3371fc;
    font-size: 12px;
    font-weight: normal;
  }

  span {
    font-size: 12px;
    margin-left: 3px;
  }
}
.custom-edit-table
  .el-checkbox__input.is-disabled.is-checked
  .el-checkbox__inner {
  background-color: rgba(51, 113, 252, 0.6);
  border-color: rgba(41, 148, 255, 0.2);
}

.custom-edit-table
  .el-checkbox__input.is-disabled.is-checked
  .el-checkbox__inner::after {
  border-color: #ffffff;
}
</style>
