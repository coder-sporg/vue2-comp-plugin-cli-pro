<template>
  <div class="fl-sta-str full-height">
    <div
      class="full-height table-section"
      :style="{ width: `calc(100% - ${rightWidth} - 20px)` }"
    >
      <SearchForm
        ref="searchForm"
        v-if="searchForm.length"
        :FormLists="searchForm"
        @Search="searchHandle"
        @change="formChange"
      />
      <div
        class="table-wrap"
        :style="{ height: searchForm.length ? 'calc(100% - 56px)' : '100%' }"
      >
        <TableData
          ref="table"
          :table-data="tableData"
          :table-columns="tableConfig.column"
          :total="tableConfig.total"
          :loading="tableConfig.loading"
          table-height="calc(100% - 70px)"
          is-full
          @loadPage="changePageFn(arguments)"
          @loadPageSize="changePageSizeFn(arguments)"
          :pagLoading="pagLoading"
          has-select-box
          @checkEvent="selectChange"
          @opeClick="opeClickFn"
          @sort="changeLevelSort"
          @init-sort="changeInitSort"
          :row-key="rowkey"
          reserveSelection
          class="radius"
        />
      </div>
    </div>
    <div class="fl-shrink full-height mr-l-20" :style="{ width: rightWidth }">
      <div class="right-title mr-b-15">
        已勾选列表 {{ `${checkedList.length} / ${tableConfig.total}` }}
      </div>
      <div class="border radius" style="height: calc(100% - 55px)">
        <ul class="right-list-header fl-sta-cen">
          <li
            class="text-left"
            v-for="field in rightFields"
            :key="field.key"
            :style="{ width: field.width }"
          >
            {{ $t(field.label) }}
          </li>
          <li class="fl-shrink">操作</li>
        </ul>
        <ul class="right-list ov-auto">
          <li
            class="list-item fl-bet-cen"
            v-for="(item, index) in checkedList"
            :key="index"
          >
            <div class="fl-sta-cen" style="width: calc(100% - 40px)">
              <!-- <template v-for="field in rightFields" >
                                <el-tooltip  :key="field.key" :content="item[field.key]" placement="bottom-start" effect="dark">
                                    <span :style="{ width: field.width }" class="text-flow" style="padding-right: 5px;">{{ item[field.key] }}</span>
                                </el-tooltip>
                            </template> -->
              <span
                v-for="field in rightFields"
                :key="field.key"
                :style="{ width: field.width }"
                class="text-flow-wrap"
                style="padding-right: 5px"
                :alt="item[field.key]"
              >
                {{ item[field.key] === "" ? "-" : item[field.key] }}
              </span>
            </div>
            <div
              class="cursor delBtn fl-shrink"
              style="width: 40px; text-align: right"
              @click="delSeletion(item)"
            >
              删除
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import SearchForm from "@/components/form/search-form-component.vue";
import TableData from "@/components/table/table-data-component.vue";
export default {
  components: {
    SearchForm,
    TableData,
  },
  props: {
    searchForm: {
      type: Array,
      default: () => [],
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    tableParams: {
      type: Object,
      default: () => {
        return {
          limit: 15,
          page: 0,
        };
      },
    },
    tableConfig: {
      type: Object,
      default: () => {
        return {
          total: 0,
          column: [],
        };
      },
    },
    rightFields: {
      type: Array,
      default: () => [],
    },
    rowkey: {
      type: String,
      default: "",
    },
    rightWidth: {
      type: String,
      default: "350px",
    },
    pagLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checkedList: [],
    };
  },
  methods: {
    searchHandle(formData = {}) {
      // this.checkedList = [];
      this.$emit("search", "form", formData);
    },
    formChange(type_name, type, detail_name, detail) {
      this.$emit("change", type_name, type, detail_name, detail);
    },
    changePageFn(arg) {
      let limit =
        this.tableParams.limit === undefined
          ? this.tableParams.size
          : this.tableParams.limit;
      let num = arg[0].num;
      let page = (num - 1) * limit;
      this.$emit("search", "page", page);
    },
    changePageSizeFn(arg) {
      let num = arg[0].num;
      this.$emit("search", "pagesize", num);
    },
    /** 重置页码 */
    setCurrPage() {
      this.$refs.table.setCurrPage();
    },
    changeLevelSort(data) {
      this.$emit("sort", data);
    },
    // 初始化排序
    changeInitSort() {
      this.$emit("init-sort");
    },
    selectChange(list) {
      this.checkedList = list;
    },
    /** 回显选中数据 */
    selectHandle(data) {
      this.$refs.table.toggleSelection(data, true);
    },
    /** 右侧列表删除选中项 */
    delSeletion(row) {
      this.$refs.table.toggleSelection(row, false);
    },
    /** 还原所有搜索参数 */
    resetSearchParams() {
      this.$nextTick(() => {
        this.$refs.searchForm.clearHandle();
      });
    },
    /** 清除所有选项 */
    clearSelection() {
      this.$nextTick(() => {
        this.$refs.table.clearSelection();
        this.checkedList = [];
      });
    },
    /** 组合参数 */
    combineData() {
      return JSON.parse(JSON.stringify(this.checkedList));
    },
    opeClickFn(type, row) {
      this.$emit("opeClick", type, row);
    },
    doLayout() {
      this.$refs.table.doLayout();
    },
  },
};
</script>

<style lang="scss" scoped>
.right-title {
  border-left: var(--defaultcolors) 3px solid;
  padding-left: 10px;
}
.right-list-header {
  height: 48px;
  background: #f5f7fc;
  padding: 10px 15px;
  li {
    // line-height: 48px;
  }
}
.right-list {
  height: calc(100% - 48px);
}
.border {
  border: #ddd 1px solid;
}
.list-item {
  padding: 10px 15px;
  .delBtn {
    color: var(--defaultcolors);
  }
}
.text-left {
  text-align: left;
}
.text-flow-wrap {
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
