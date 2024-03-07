<template>
  <div :class="{ 'full-height': isFull, 'custom-table': true }">
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :border="border"
      style="width: 100%"
      :height="tableHeight"
      :default-sort="defaultSort"
      @selection-change="selectChange"
      :row-key="rowKey"
      :default-expand-all="false"
      :tree-props="{ children: 'children' }"
      @select="selectRowHandle"
      @select-all="selectAllRowHandle"
      stripe
      @expand-change="expandHandle"
      @sort-change="sortChangeFn"
    >
      <el-table-column type="expand" v-if="isExpend">
        <template slot-scope="{ row }">
          <slot name="expand" v-bind:expand="row"></slot>
        </template>
      </el-table-column>
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
        :min-width="item.minWidth"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.isOmit"
        :sortable="item.sort"
      >
        <template slot="header" slot-scope="scope">
          <div v-if="item.showTip">
            <span>
              {{ $t(item.label) }}
              <el-popover placement="bottom" trigger="hover">
                <div class="pd-10">{{ item.tip }}</div>
                <i
                  slot="reference"
                  :class="`iconfont ${item.icon}`"
                  :style="item.iconStyle"
                ></i>
              </el-popover>
            </span>
          </div>
          <!-- 数据检索 日志信息 -->
          <div v-else-if="item.colFixed">
            <span>{{ $t(item.label) }}</span>
            <el-popover
              v-if="hasOperateExpand && item.showColumns"
              placement="left-start"
              trigger="click"
              popper-class="popperClass"
            >
              <div style="padding: 15px 20px 0">
                <el-checkbox
                  :indeterminate="isIndeterminate"
                  v-model="otherCheckAll"
                  @change="checkAllChangeHandle"
                  class="mr-b-15"
                  >{{ $t("common.all") }}</el-checkbox
                >
                <el-checkbox-group
                  v-model="otherCheckedList"
                  @change="checkItemChangeHandle"
                  class="fl-sta-sta fl-col"
                >
                  <el-checkbox
                    v-for="(item, index) in otherColumns"
                    :key="index + item.prop"
                    :label="item.prop"
                    class="mr-b-15"
                    >{{ item.label }}</el-checkbox
                  >
                </el-checkbox-group>
              </div>
              <i
                slot="reference"
                style="float: right"
                class="iconfont iconmore-column bold f-t-18 moreColBtn cursor"
              ></i>
            </el-popover>
          </div>
          <span v-else>{{ $t(item.label) }}</span>
        </template>
        <template slot-scope="{ row }">
          <div v-if="item.isBtn" class="text-flow">
            <!-- 针对按钮列 -->
            <el-button
              v-if="item.render(row)"
              type="text"
              @click="rowBtnClickHandle(row, item.prop)"
              >{{ row[item.prop] }}</el-button
            >
            <div v-else>{{ row[item.prop] }}</div>
          </div>
          <div v-else-if="item.isShowMore">
            <!-- 针对需要显示更多的列 主要是日志 -->
            <div>
              {{ item.render(row).slice(0, 30) }}
              <el-button
                type="text"
                v-if="item.render(row).length > 30"
                @click="operateClick('more', item.render(row), '')"
                >More</el-button
              >
            </div>
          </div>
          <div v-else-if="item.isRenderBtn" class="table-btn">
            <!-- 针对按钮列 -->
            <el-button
              v-if="item.isDisabled"
              type="text"
              :disabled="!item.isDisabled(row)"
              @click="
                item.isDisabled(row)
                  ? rowBtnClickHandle(row, item.prop)
                  : () => {}
              "
            >
              <span v-if="!item.isDisabled(row)" style="color: #aaaaaa">{{
                row[item.prop]
              }}</span>
              <span v-else>{{ row[item.prop] }}</span>
            </el-button>
            <el-button
              v-else-if="item.render(row) || item.render(row) === 0"
              type="text"
              @click="rowBtnClickHandle(row, item.prop)"
              >{{ item.render(row) }}</el-button
            >
          </div>

          <!-- 针对switch -->
          <div v-else-if="item.isSwitch" class="text-flow">
            <el-switch
              v-model="row[item.prop]"
              :active-value="1"
              :inactive-value="0"
              @change="(value) => rowBtnClickHandle(row, item.prop, value)"
            ></el-switch>
          </div>

          <!-- 针对tag标签 -->
          <div v-else-if="item.isTag">
            <template v-if="typeof row[item.prop] == 'string'">
              <el-tag
                v-for="(tag, index) in row[item.prop].split(',')"
                :key="index"
                type="primary"
                class=""
                size="mini"
                style="margin: 2px 3px"
                >{{ tag }}</el-tag
              >
            </template>
            <template v-if="typeof row[item.prop] == 'object'">
              <el-tag
                v-for="(tag, index) in row[item.prop]"
                :key="index"
                type="primary"
                class=""
                size="mini"
                style="margin: 2px 3px"
                >{{ tag }}</el-tag
              >
            </template>
          </div>

          <!-- 针对自定义文字渲染列 -->
          <div v-else-if="item.render" v-html="item.render(row)"></div>
          <!-- 图片渲染 -->
          <div v-else-if="item.isImg">
            <el-image
              v-if="item.handler && item.handler(row).src"
              style="width: 100px; height: 100px"
              :src="item.handler(row).src"
              fit="contain"
              :preview-src-list="[item.handler(row).src]"
            ></el-image>
            <div v-else-if="item.handler" v-html="item.handler(row).errRender">
              {{ item.handler(row).errRender }}
            </div>
            <el-image
              v-else
              style="width: 100px; height: 100px"
              :src="row.img_path"
              fit="contain"
            ></el-image>
          </div>
          <!-- 普通列 -->
          <!-- <div v-else :class="item.isOmit ? 'text-flow' : ''">{{ row[item.prop] }}</div> -->
          <div v-else :class="item.isOmit ? 'text-flow' : ''">
            {{
              row[item.prop] === "" || row[item.prop] === undefined
                ? "-"
                : row[item.prop]
            }}
          </div>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column
        v-if="operateBtns.isShow"
        label="操作"
        :width="operateBtns.width"
        align="left"
        fixed="right"
      >
        <template slot="header" slot-scope="scope">
          <span>{{ $t("common.operate_table_column") }}</span>
          <el-popover
            v-if="hasOperateExpand"
            placement="left-start"
            trigger="click"
            class="f-r"
          >
            <div style="padding: 15px 20px 0">
              <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="otherCheckAll"
                @change="checkAllChangeHandle"
                class="mr-b-15"
                >{{ $t("common.all") }}</el-checkbox
              >
              <el-checkbox-group
                v-model="otherCheckedList"
                @change="checkItemChangeHandle"
                class="fl-sta-sta fl-col"
              >
                <el-checkbox
                  v-for="item in otherColumns"
                  :key="item.prop"
                  :label="item.prop"
                  class="mr-b-15"
                  >{{ $t(item.label) }}</el-checkbox
                >
              </el-checkbox-group>
            </div>
            <i
              slot="reference"
              class="iconfont iconmore-column bold f-t-18 moreColBtn cursor"
            ></i>
          </el-popover>
        </template>
        <template slot-scope="scope">
          <div class="fl-sta-cen fl-wrap">
            <el-button
              v-for="ele in operateBtns.list(scope.row, scope.$index)"
              :key="ele"
              type="text"
              @click="operateClick(ele, scope.row, scope.$index)"
              >{{ $t(ele) }}</el-button
            >
            <el-popover
              placement="left-start"
              width="120px"
              trigger="click"
              v-if="moreBtns.isShow"
              class="mr-l-10"
            >
              <div class="operate-more-box">
                <ul>
                  <li
                    v-for="immore in moreBtns.list(scope.row)"
                    :key="immore"
                    @click="operateClick(immore, scope.row, scope.$index)"
                  >
                    {{ $t(immore) }}
                  </li>
                </ul>
              </div>
              <el-button slot="reference" type="text">{{
                $t("common.more_btn")
              }}</el-button>
            </el-popover>
          </div>
        </template>
      </el-table-column>

      <div slot="empty">
        <p>
          <img
            style="width: 320px; height: 270px"
            src="../../assets/imgs/dataSecurity/no-data-common.png"
            alt=""
          />
        </p>
      </div>
    </el-table>
    <div
      class="pagination ov-hide mr-t-10"
      v-if="showPage"
      v-loading="pagLoading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading"
      element-loading-customClass="pagLoadingClass"
    >
      <el-pagination
        @size-change="changePageSize"
        class="f-r"
        @current-change="changePage"
        :total="total"
        :current-page.sync="currPageNum"
        :page-sizes="defaultpagesizes"
        :page-size.sync="currPageSize"
        :layout="layout"
        style="color: #606266"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "TableDataPage",
  props: {
    isFull: {
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
    loading: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: false,
    },
    isExpend: {
      type: Boolean,
      default: false,
    },
    expendKey: {
      type: String,
      default: "",
    },
    hasSelectBox: {
      type: Boolean,
      default: false,
    },
    hasOperateExpand: {
      type: Boolean,
      default: false,
    },
    operateBtns: {
      type: Object,
      default() {
        return {
          width: 0,
          isShow: false,
          list: (row) => [],
        };
      },
    },
    moreBtns: {
      //操作中的更多 操作按钮的列表
      type: Object,
      default() {
        return {};
      },
    },
    total: {
      type: Number,
      default: 0,
    },
    showPage: {
      type: Boolean,
      default: true,
    },
    otherFields: {
      type: Object,
      default() {
        return {};
      },
    },
    currPage: {
      type: Number,
      default: 1,
    },
    tableHeight: {
      type: String | Number,
      default: "10vh",
    },
    defaultpagesizes: {
      type: Array,
      default() {
        return [15, 30, 50, 100, 200];
      },
    },
    defaultpagesize: {
      type: Number,
      default: 15,
    },
    otherColumns: {
      type: Array,
      default() {
        return [];
      },
    },
    otherColumnsCreate: {
      type: Function,
      default: () => {},
    },
    rowKey: {
      type: String,
      default: "",
    },
    reserveSelection: {
      type: Boolean,
      default: false,
    },
    defaultSort: {
      type: Object,
      default: () => {
        return { prop: "", order: "descending" };
      },
    },
    uniqueKey: {
      type: Boolean,
      default: () => false,
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper",
    },
    pagLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /** 已选中数据列表 */
      checkedList: [],
      /** 更多操作 - 全选 */
      otherCheckAll: false,
      /** 表格的未展示的列表 */
      otherCheckedList: [],
      /** 是否全选 */
      isIndeterminate: false,
      /** 其他列的name集合 */
      OtherColumnNames: [],
      currPageNum: this.currPage,
      currPageSize: this.defaultpagesize,
    };
  },
  mounted() {
    this.otherColumns.forEach((ele) => {
      this.OtherColumnNames.push(ele.prop);
    });
    this.doLayout();
  },
  watch: {
    otherColumns: {
      handler(v1, v2) {
        v1.forEach((ele) => {
          this.OtherColumnNames.push(ele.prop);
        });
      },
      deep: true,
    },
    tableData: {
      handler() {
        this.$refs.table.bodyWrapper.scrollTop = 0;
        this.$refs.table.bodyWrapper.scrollLeft = 0;
      },
      deep: true,
    },
  },
  methods: {
    /**
     * 重新布局
     */
    doLayout() {
      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    },
    /**
     * 重置页码 page
     */
    setCurrPage(page = 1) {
      this.$nextTick(() => {
        this.currPageNum = page;
      });
    },
    /**
     * 重置页数大小 pagesize
     */
    setCurrPageSize(size = 15) {
      this.$nextTick(() => {
        this.currPageSize = size;
      });
    },
    /**
     * 操作按钮
     */
    operateClick(row, op, index) {
      this.$emit("opeClick", row, op, index);
    },
    /**
     * page
     */
    changePage: function (page) {
      var obj = {
        type: this.tabletype,
        num: page,
      };
      this.$emit("loadPage", obj);
    },
    /**
     * pagesize
     */
    changePageSize: function (pageSize) {
      var obj = {
        type: this.tabletype,
        num: pageSize,
      };
      this.$emit("loadPageSize", obj);
    },
    /**
     * 扩展行
     */
    expandHandle(data, expended) {
      console.log(data, expended);
      // 判断关闭还是展开
      // let hasExpend = expended.some(item=>{
      //     return item[this.expendKey] == data[this.expendKey]
      // });
      // if(hasExpend){
      //     this.$emit("expandData",data,hasExpend);
      // };
    },
    /**
     * 排序
     */
    sortChangeFn(data) {
      let obj = {
        orderby: data.prop,
        seq: data.order == "ascending" ? "asc" : "desc",
      };
      this.$emit("sort", obj);
    },
    /**
     * 表格单选某一行
     */
    selectRowHandle(selection, row) {
      /** 判断当前行选中状态 */
      const selected = selection.some((item) => item === row);
      this.selectChildren(row, selected);
    },
    /**
     * 表格全选
     */
    selectAllRowHandle(selection) {
      /* tableData 只要有一层在selection中，就是全选状态 */
      const isSelect = this.tableData.some((item) => selection.includes(item));
      if (isSelect) {
        selection.forEach((item) => {
          this.selectChildren(item, isSelect);
        });
      } else {
        /** 否则 是全不选状态 */
        this.tableData.forEach((item) => {
          this.selectChildren(item, isSelect);
        });
      }
    },
    /** 选择子项 */
    selectChildren(row, selected) {
      if (row.children && Array.isArray(row.children)) {
        row.children.forEach((item) => {
          this.toggleSelection(item, selected);
          this.selectChildren(item, selected);
        });
      }
    },
    /** 切换行选中状态 */
    toggleSelection(row, select) {
      row &&
        this.$nextTick(() => {
          this.$refs.table && this.$refs.table.toggleRowSelection(row, select);
        });
    },
    /** 该行checkbox是否可用 */
    selectableHandle(row, index) {
      /** 针对【身份源模块】字段映射 */
      if (row.required === "true") {
        return false;
      }
      return true;
    },
    toggleAllSelection() {
      this.$refs.table.toggleAllSelection();
    },

    /**
     * 表格selection-change
     */
    selectChange(data) {
      this.checkedList = data;
      this.$emit("checkEvent", this.checkedList);
    },
    /**
     * 右侧有购物车列表 - 删除操作 切换表格某一行选中状态
     */
    toggleRowSelection(index, row) {
      this.checkedList.splice(index, 1);
      this.$refs["table"].toggleRowSelection(row);
    },
    /**
     * 清空选项
     */
    clearSelection() {
      this.$nextTick(() => {
        this.$refs["table"].clearSelection();
      });
    },
    /**
     * 显示隐藏列 - 多选的全选和单选的改变
     */
    checkAllChangeHandle(val) {
      this.isIndeterminate = false;
      if (val) {
        this.otherCheckedList = this.OtherColumnNames;
        this.$emit("toggleColumns", this.otherColumns);
      } else {
        this.otherCheckedList = [];
        this.$emit("toggleColumns", []);
      }
    },
    /**
     * 显示隐藏列 - 单选事件
     */
    checkItemChangeHandle(value) {
      let checkedCount = value.length;
      this.otherCheckAll = checkedCount === this.otherColumns.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.otherColumns.length;
      let showColumns = [];
      this.otherColumns.forEach((ele) => {
        if (value.includes(ele.prop)) {
          showColumns.push(ele);
        }
      });
      this.$emit("toggleColumns", showColumns);
    },
    /**
     * 行内可点击
     */
    rowBtnClickHandle(row, prop, data) {
      this.$emit("rowBtnClickHandle", row, prop, data);
    },
    /**
     * 行内select
     */
    // modalTableSelectChange(val){
    //     console.log(val)
    // },
  },
};
</script>

<style lang="scss">
// el-popover弹框高度控制
.popperClass {
  min-width: 150px;
  max-height: 54%;
  overflow-y: scroll;
}
.custom-table .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: rgba(51, 113, 252, 0.6);
  border-color: rgba(41, 148, 255, 0.2);
}
.custom-table
  .el-checkbox__input.is-disabled.is-checked
  .el-checkbox__inner::after {
  border-color: #ffffff;
}

/** 子元素行背景加深 */
.el-table__row--level-1 {
  background: #f8f9fc !important;
}

/** 解决表格横向滚动条被隐藏1px */
.el-table__body {
  margin-top: -2px;
}
.el-table__body-wrapper {
  top: -2px !important;
}
.el-table__fixed,
.el-table__fixed-right {
  top: -2px;
}
.el-table__fixed-right::before,
.el-table__fixed::before {
  height: 0px !important;
}

/** 设置分页loading样式 */
.pagination {
  .el-loading-spinner {
    top: 70%;
    display: flex;
    justify-content: flex-end;
    padding-right: 50px;
    align-items: center;
  }
  .el-loading-spinner .el-loading-text {
    margin-left: 10px;
  }
}
</style>

<style lang="scss" scoped>
.moreColBtn {
  color: var(--defaultcolors);
}
.total-title {
  line-height: 32px;
}
.total-color {
  color: #b8b8b8;
}
.select-color {
  color: #555555;
}
.ver-top {
  vertical-align: top;
}
.operate-more-box {
  padding: 0 20px;
  ul {
    li {
      height: 30px;
      line-height: 30px;
      color: #494f55;
      cursor: pointer;
    }
    li:hover {
      color: var(--defaultcolors);
    }
  }
}
/** 列表中button按钮 换行显示 */
.table-btn .el-button--text {
  white-space: normal;
  text-align: left;
}
</style>
