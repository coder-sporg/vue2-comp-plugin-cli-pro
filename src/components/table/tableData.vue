<template>
  <div :class="{ 'full-height': isFull, 'custom-table': true }">
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :border="border"
      :cell-style="setCellStyle"
      style="width: 100%"
      :height="tableHeight"
      :default-sort="defaultSort"
      @selection-change="selectChange"
      :row-key="rowKey"
      :default-expand-all="false"
      :tree-props="{ children: 'children' }"
      @select="selectRowHandle"
      @row-click="rowClick"
      @select-all="selectAllRowHandle"
      @expand-change="expandHandle"
      @sort-change="sortChangeFn"
    >
      <el-table-column type="expand" v-if="isExpend">
        <template slot-scope="{ row }">
          <slot name="expand" v-bind:expand="row"></slot>
        </template>
      </el-table-column>

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

      <!-- 正常数据列 -->
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
        <!-- 渲染表格header头内容 -->
        <template slot="header" slot-scope="scope">
          <div class="dis-inb" :class="{ alignCenter: item.isAlign }">
            <!-- 渲染固定图标提示-解释说明 -->
            <template v-if="item.tooltip">
              <el-popover
                ref="popover1"
                placement="top"
                title=""
                trigger="hover"
              >
                <template slot="reference">
                  <i class="iconfont iconshuoming cursor mr-r-5"></i>
                </template>
                <div class="pd-10">{{ item.tooltip }}</div>
              </el-popover>
              <!-- {{ $t(item.label) }} -->
            </template>

            <!-- 渲染自定义图标和图标提示 -->
            <template v-if="item.showTip">
              <span>
                {{ $t(item.label) }}
                <el-popover placement="bottom" trigger="hover">
                  <div class="pd-10">{{ item.tip }}</div>
                  <i
                    slot="reference"
                    :class="`iconfont ${item.icon}`"
                    :style="{ 'font-size': '14px', ...item.iconStyle }"
                  ></i>
                </el-popover>
              </span>
            </template>

            <!-- 日志列表最后一列作为固定列 -->
            <template v-else-if="item.colFixed">
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
                  >
                    {{ $t("common.all") }}
                  </el-checkbox>
                  <el-checkbox-group
                    v-model="otherCheckedList"
                    @change="checkItemChangeHandle"
                    class="fl-sta-sta fl-col"
                  >
                    <el-checkbox
                      v-for="(item, index) in otherColumns"
                      :key="index + item.prop"
                      :label="item.prop"
                      :disabled="item.disabled || item.editDisabled"
                      class="mr-b-15"
                    >
                      {{ item.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <i
                  slot="reference"
                  style="position: absolute; right: 10px"
                  class="iconfont iconmore-column bold f-t-18 moreColBtn cursor"
                ></i>
              </el-popover>
            </template>

            <!-- 渲染普通文本 -->
            <span v-else>{{ $t(item.label) }}</span>

            <!-- 渲染固定图标提示-解释说明 -->
            <template v-if="item.nextTooltip">
              <el-popover
                ref="popover1"
                placement="top"
                title=""
                trigger="hover"
              >
                <template slot="reference">
                  <i class="iconfont iconshuoming cursor mr-l-5"></i>
                </template>
                <div class="pd-10">{{ item.nextTooltip }}</div>
              </el-popover>
              <!-- {{ $t(item.label) }} -->
            </template>

            <!-- 渲染筛选下拉列表 -->
            <el-dropdown
              trigger="click"
              placement="bottom"
              v-if="item.dropdown"
              @command="(command) => handleCommand(command, index)"
            >
              <i
                class="iconfont iconguolv cursor"
                :style="{
                  color: item.isHightLight ? 'var(--defaultcolors)' : '',
                }"
                @click.stop
              ></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(dowmItem, index) in item.dropDownList"
                  :key="index"
                  :command="{
                    head_label: $t(item.label),
                    conditionName: item.conditionName,
                    model: item.model,
                    head_prop: item.prop,
                    ...dowmItem,
                  }"
                >
                  <span :class="{ 'color-primary': dowmItem.isSelected }">{{
                    dowmItem.label
                  }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>

        <!-- 渲染表格行内容 -->
        <template slot-scope="{ row, $index }">
          <div class="field-content">
            <!-- 渲染日志列表中添加筛选条件的浮层按钮 -->
            <el-popover
              placement="top"
              trigger="hover"
              v-if="
                showAdd.show &&
                showAdd.fields.find(
                  (items) => items.prop === item.prop && !items.searchLess
                ) &&
                (Array.isArray(row[item.prop])
                  ? row[item.prop].length
                  : !(
                      row[item.prop] === '' ||
                      row[item.prop] === undefined ||
                      row[item.prop] === '-'
                    ))
              "
            >
              <div class="add-field-tip">添加条件</div>
              <div
                slot="reference"
                class="add-field"
                @click.stop="addSearchField({ row, item })"
              >
                <svg class="add-field-icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu3"></use>
                </svg>
              </div>
            </el-popover>

            <!-- 渲染多数据列表: 换行、 是否可点击: isAbleClick -->
            <div v-else-if="item.isList">
              <template v-if="Array.isArray(item.render(row))">
                <p
                  v-for="listItem of item.render(row)"
                  :key="listItem.value"
                  :class="{
                    'color-primary': listItem.label && listItem.isAbleClick,
                    cursor: listItem.label && listItem.isAbleClick,
                  }"
                  @click="
                    listItem.isAbleClick
                      ? rowBtnClickHandle(row, item.prop, listItem)
                      : () => {}
                  "
                >
                  {{ listItem.label || "-" }}
                </p>
              </template>
              <template v-else>
                <p>-</p>
              </template>
            </div>

            <!-- 渲染More按钮 以抽屉形式展示更多内容 -->
            <div v-if="item.isShowMore">
              <div>
                {{ item.render(row).slice(0, 30) }}
                <el-button
                  type="text"
                  v-if="item.render(row).length > 30"
                  @click="operateClick('more', item.render(row), '')"
                >
                  More
                </el-button>
              </div>
            </div>

            <!-- 渲染按钮 需要定义render并返回结果时才能渲染成Button -->
            <div v-else-if="item.isBtn" class="text-flow">
              <el-button
                v-if="item.render(row)"
                type="text"
                @click="rowBtnClickHandle(row, item.prop)"
              >
                {{ row[item.prop] }}
              </el-button>
              <div v-else>{{ row[item.prop] }}</div>
            </div>

            <!-- 渲染按钮 可显示禁用状态按钮 -->
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
              <template v-else-if="item.render(row) || item.render(row) === 0">
                <el-button
                  v-if="
                    item.render(row) !== '-' &&
                    row.osType !== 'Android' &&
                    row.osType !== 'iOS'
                  "
                  type="text"
                  @click="rowBtnClickHandle(row, item.prop)"
                >
                  {{ item.render(row) }}
                </el-button>
                <span v-else>{{ item.render(row) }}</span>
              </template>
              <!-- <el-button v-else-if="item.render(row) || item.render(row) === 0" type="text" @click="rowBtnClickHandle(row, item.prop)">{{ item.render(row) }}</el-button> -->
            </div>

            <!-- 渲染可编辑表格 -->
            <div v-else-if="item.isSelect || item.isInput || item.isSearch">
              <el-popover placement="top" trigger="hover">
                <!-- 错误信息提示 -->
                <div
                  class="add-field-tip"
                  v-if="
                    row.dataStatusMap[[item.prop]] &&
                    row.dataStatusMap[[item.prop]].errMsg
                  "
                >
                  {{ row.dataStatusMap[[item.prop]].errMsg }}
                </div>

                <!-- 详细信息提示 -->
                <div
                  class="add-field-tip"
                  v-else-if="row[item.prop] || row[item.prop] === 0"
                >
                  <!-- input: 值为字符串 -->
                  <template v-if="item.isInput || item.isSearch">{{
                    row[item.prop]
                  }}</template>

                  <!-- select: 需要从下拉选项中得到对应的label -->
                  <template v-else-if="item.isSelect">
                    <!-- 多选: 值为数组 -->
                    <template
                      v-if="
                        Array.isArray(row[item.prop]) && row[item.prop].length
                      "
                    >
                      <template v-for="(child, index) of row[item.prop]">
                        <p
                          :key="index"
                          v-if="
                            (Array.isArray(item.selectOptions)
                              ? item.selectOptions
                              : item.selectOptions(row)
                            ).find((option) => option.value === child)
                          "
                        >
                          {{
                            (Array.isArray(item.selectOptions)
                              ? item.selectOptions
                              : item.selectOptions(row)
                            ).find((option) => option.value === child).label
                          }}
                        </p>
                      </template>
                    </template>

                    <!-- 单选: 值为单个值 -->
                    <template v-else>
                      <p
                        v-if="
                          (Array.isArray(item.selectOptions)
                            ? item.selectOptions
                            : item.selectOptions(row)
                          ).find((option) => option.value === row[item.prop])
                        "
                      >
                        {{
                          (Array.isArray(item.selectOptions)
                            ? item.selectOptions
                            : item.selectOptions(row)
                          ).find((option) => option.value === row[item.prop])
                            .label
                        }}
                      </p>
                      <p v-else>{{ row[item.prop] }}</p>
                    </template>
                  </template>
                </div>

                <!-- 渲染select选择器 -->
                <template v-if="item.isSelect">
                  <el-select
                    slot="reference"
                    :class="{
                      error:
                        row.dataStatusMap[[item.prop]] &&
                        row.dataStatusMap[[item.prop]].errMsg,
                    }"
                    filterable
                    v-model="row[item.prop]"
                    :loading="item.loading"
                    :disabled="
                      row.dataStatusMap[[item.prop]] &&
                      row.dataStatusMap[[item.prop]].isDisabled
                    "
                    :multiple="item.isMultiple"
                    @change="() => handleEdit(row, item.prop, $index)"
                    @visible-change="
                      handleVisibleSelect($event, row, item.prop, $index)
                    "
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="option in Array.isArray(item.selectOptions)
                        ? item.selectOptions
                        : item.selectOptions(row)"
                      :key="option.value"
                      :value="option.value"
                      :label="option.label"
                    />
                  </el-select>
                </template>

                <!-- 渲染input -->
                <template v-if="item.isInput">
                  <el-input
                    class="is-edit-input"
                    slot="reference"
                    :maxlength="128"
                    :class="{
                      error:
                        row.dataStatusMap[[item.prop]] &&
                        row.dataStatusMap[[item.prop]].errMsg,
                    }"
                    v-model="row[item.prop]"
                    :disabled="
                      row.dataStatusMap[[item.prop]] &&
                      row.dataStatusMap[[item.prop]].isDisabled
                    "
                    placeholder="请输入"
                    @input="() => handleEdit(row, item.prop, $index)"
                  />
                </template>

                <!-- 渲染可搜索input -->
                <template v-if="item.isSearch">
                  <el-autocomplete
                    slot="reference"
                    v-model="row[item.prop]"
                    value-key="label"
                    popper-class="popperClass"
                    :class="{
                      error:
                        row.dataStatusMap[[item.prop]] &&
                        row.dataStatusMap[[item.prop]].errMsg,
                    }"
                    :disabled="
                      row.dataStatusMap[[item.prop]] &&
                      row.dataStatusMap[[item.prop]].isDisabled
                    "
                    :fetch-suggestions="
                      (value, cb) => querySearchAsync(item.prop, value, cb)
                    "
                    placeholder="请输入"
                    @select="
                      (section) => handleEdit(row, item.prop, $index, section)
                    "
                  ></el-autocomplete>
                </template>
              </el-popover>
            </div>

            <!-- 渲染switch -->
            <div v-else-if="item.isSwitch" class="text-flow">
              <el-switch
                v-model="row[item.prop]"
                :active-value="1"
                :inactive-value="0"
                :disabled="item.isDisabled ? item.isDisabled(row) : false"
                @change="(value) => rowBtnClickHandle(row, item.prop, value)"
              ></el-switch>
            </div>

            <!-- 渲染tag标签 -->
            <div v-else-if="item.isTag">
              <template v-if="row[item.prop].length > 5">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="row[item.prop].join(',')"
                  placement="top-start"
                >
                  <div>
                    <el-tag
                      v-for="(tag, index) in row[item.prop].slice(0, 5)"
                      :key="index"
                      type="primary"
                      class=""
                      size="mini"
                      style="margin: 2px 3px"
                    >
                      {{ tag }}
                    </el-tag>
                    <el-tag
                      type="primary"
                      class=""
                      size="mini"
                      style="margin: 2px 3px"
                      >...</el-tag
                    >
                  </div>
                </el-tooltip>
              </template>
              <template v-else>
                <el-tag
                  v-for="(tag, index) in row[item.prop].slice(0, 5)"
                  :key="index"
                  type="primary"
                  class=""
                  size="mini"
                  style="margin: 2px 3px"
                >
                  {{ tag }}
                </el-tag>
              </template>
            </div>

            <!-- 以JSX方式渲染自定义内容 取代以render方式不能渲染的场景 -->
            <CreateDom
              v-else-if="item.isJSX"
              :column="item"
              :row="row"
              :render="item.render"
              :index="index"
            ></CreateDom>

            <!-- 以render函数渲染自定义内容 -->
            <div
              v-else-if="item.render"
              v-html="item.render(row)"
              :class="item.isOmit ? 'text-flow' : ''"
            ></div>

            <!-- 渲染图片 -->
            <div v-else-if="item.isImg">
              <!-- 图片获取成功时渲染 -->
              <el-image
                v-if="item.handler && item.handler(row).src"
                style="width: 100px; height: 100px"
                :src="item.handler(row).src"
                fit="contain"
                :preview-src-list="[item.handler(row).src]"
              ></el-image>

              <!-- 图片获取失败时渲染 -->
              <div
                v-else-if="item.handler"
                v-html="item.handler(row).errRender"
              >
                {{ item.handler(row).errRender }}
              </div>

              <!-- 正常渲染图片 -->
              <el-image
                v-else
                style="width: 100px; height: 100px"
                :src="row.img_path"
                fit="contain"
              ></el-image>
            </div>

            <!-- 渲染普通文本内容 -->
            <!-- <div v-else :class="item.isOmit ? 'text-flow' : ''">{{ row[item.prop] }}</div> -->
            <div v-else :class="item.isOmit ? 'text-flow' : ''">
              {{
                row[item.prop] === "" || row[item.prop] === undefined
                  ? "-"
                  : showAdd.show
                  ? secPostureRender({ row, item })
                  : row[item.prop]
              }}
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 渲染操作列 -->
      <el-table-column
        v-if="operateBtns.isShow || moreBtns.isShow"
        label="操作"
        :width="operateBtns.isShow ? operateBtns.width : moreBtns.width"
        align="left"
        fixed="right"
      >
        <!-- 渲染操作列头 -->
        <template slot="header" slot-scope="scope">
          <span>{{ $t("common.operate_table_column") }}</span>
          <el-popover
            v-if="hasOperateExpand"
            placement="left-start"
            trigger="click"
            class="f-r"
          >
            <div style="padding: 16px 16px 0">
              <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="otherCheckAll"
                @change="checkAllChangeHandle"
                class="mr-b-15"
              >
                {{ $t("common.all") }}
              </el-checkbox>
              <el-checkbox-group
                v-model="otherCheckedList"
                @change="checkItemChangeHandle"
                class="fl-sta-sta fl-col"
              >
                <el-checkbox
                  v-for="item in otherColumns"
                  :key="item.prop"
                  :label="item.prop"
                  :disabled="item.disabled || item.editDisabled"
                  class="mr-b-15"
                >
                  <span style="white-space: nowrap">{{ $t(item.label) }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <i
              slot="reference"
              class="iconfont iconmore-column bold f-t-18 moreColBtn cursor"
            ></i>
          </el-popover>
        </template>

        <!-- 渲染操作列按钮列表 -->
        <template slot-scope="scope">
          <div class="fl-sta-cen fl-wrap">
            <template v-for="ele in operateBtns.list(scope.row, scope.$index)">
              <div class="table-btn-box" :class="ele.class">
                <el-button
                  type="text"
                  v-if="ele.isPop"
                  :key="ele + '-pop'"
                  @click.stop
                >
                  <el-popover placement="left" width="120px" trigger="hover">
                    <div class="pd-10">{{ ele.tip }}</div>
                    <span slot="reference" style="color: #c0c4cc">{{
                      ele.txt
                    }}</span>
                  </el-popover>
                </el-button>

                <el-button
                  type="text"
                  :style="ele.style"
                  v-else-if="ele.isHaveIcon"
                  :key="ele.txt + '-icon'"
                  :disabled="disableBtns(scope.row).includes(ele.txt)"
                  @click="operateClick(ele, scope.row, scope.$index)"
                >
                  <i :class="ele.iconClass" style="margin-right: 5px"></i>
                  <span>{{ ele.txt }}</span>
                </el-button>
                <el-button
                  :key="ele"
                  v-else
                  type="text"
                  :class="{ makeColor: styleBtns(scope.row).includes(ele) }"
                  :disabled="disableBtns(scope.row).includes(ele)"
                  @click="operateClick(ele, scope.row, scope.$index)"
                >
                  {{ $t(ele) }}
                </el-button>
              </div>
              <span class="vertical-line" v-show="ele.verticalLine"></span>
            </template>
            <el-popover
              placement="left-start"
              width="120px"
              trigger="click"
              v-if="moreBtns.isShow && !scope.row.isIp"
              class="mr-l-10"
            >
              <div
                class="operate-more-box"
                :class="{ 'custom-more-btn': moreBtns.isExtend }"
              >
                <ul>
                  <li
                    class="opt-btn custom-btn"
                    :class="{
                      'is-disabled':
                        disableBtns(scope.row).includes($t(immore)) ||
                        disableBtns(scope.row).includes($t(immore).text),
                      'warning-btn': immore.text,
                    }"
                    v-for="(immore, index) in moreBtns.list(scope.row)"
                    :key="immore.text ? immore.text : immore"
                    @click="operateClick(immore, scope.row, scope.$index)"
                  >
                    <!-- <el-button
                                            class="btn"
                                            type="text"
                                            @click="operateClick(immore, scope.row, scope.$index)"
                                            :disabled="disableBtns(scope.row).includes($t(immore))"
                                        >
                                            {{ $t(immore) }}
                                        </el-button> -->
                    {{ immore.text ? $t(immore.text) : $t(immore) }}
                  </li>
                </ul>
              </div>
              <!-- <el-button slot="reference" type="text">{{ $t('common.more_btn') }}</el-button> -->
              <div slot="reference" class="more-btn fl-cen-cen fl-col cursor">
                <span class=""></span>
                <span class="mr-t-6"></span>
              </div>
            </el-popover>
          </div>
        </template>
      </el-table-column>

      <!-- 渲染空数据图 -->
      <div slot="empty">
        <slot name="table-empty">
          <Empty></Empty>
        </slot>
      </div>
    </el-table>

    <!-- 分页组件 -->
    <div
      class="pagination ov-hide mr-t-10 fl-bet-cen"
      v-if="showPage"
      v-loading="pagLoading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading"
      element-loading-customClass="pagLoadingClass"
    >
      <div v-if="showSelectNum">
        <slot name="select-num">
          <div style="color: #7f7f7f">
            已选
            <span style="color: #5682f7">{{ allCheckedList.length }}</span>
            个
          </div>
        </slot>
      </div>
      <el-pagination
        @size-change="changePageSize"
        class="f-r"
        @current-change="changePage"
        :total="total"
        :current-page.sync="currPageNum"
        :page-sizes="defaultpagesizes"
        :page-size.sync="currPageSize"
        :layout="layout"
        style="color: #606266; margin-left: auto"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "TableDataPage",
  props: {
    isFull: {
      type: Boolean,
      default: false,
    },

    showAdd: {
      type: Object,
      default: function () {
        return {
          show: false,
          fields: [],
        };
      },
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

    cellIndex: {
      type: Number,
      default: -1,
    },

    hasSelectBox: {
      type: Boolean,
      default: false,
    },

    hasOperateExpand: {
      type: Boolean,
      default: false,
    },

    disableBtns: {
      type: Function,
      default: () => [],
    },
    styleBtns: {
      type: Function,
      default: () => [],
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
      // default: '',
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
    // 是否展示筛选项个数
    showSelectNum: {
      type: Boolean,
      default: false,
    },
    // 同上，当前表格的所有筛选项
    allCheckedList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // 已选中数据列表
      checkedList: [],
      // 更多操作-全选
      otherCheckAll: false,
      // 表格的未展示的列表
      otherCheckedList: [],
      // 默认选中且不可勾选的列
      disabledCheckList: [],
      // 是否全选
      isIndeterminate: false,
      // 其他列的name集合
      OtherColumnNames: [],
      currPageNum: this.currPage,
      currPageSize: this.defaultpagesize,
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
  // mounted(){
  //     this.otherColumns.forEach(ele=>{
  //         this.OtherColumnNames.push(ele.prop);
  //         if(ele.selected){
  //             this.otherCheckedList.push(ele.prop);
  //         }
  //         if(ele.selected && ele.disabled){
  //             this.disabledCheckList.push(ele.prop);
  //         }
  //     })
  //     this.checkItemChangeHandle(this.otherCheckedList);
  //     this.doLayout();
  // },
  watch: {
    otherColumns: {
      handler(v1, v2) {
        v1.forEach((ele) => {
          if (!this.OtherColumnNames.includes(ele.prop)) {
            this.OtherColumnNames.push(ele.prop);
          }
          if (ele.selected && !this.otherCheckedList.includes(ele.prop)) {
            this.otherCheckedList.push(ele.prop);
          }
          if (ele.selected && (ele.disabled || ele.editDisabled)) {
            this.disabledCheckList.push(ele.prop);
          }
        });
        this.checkItemChangeHandle(this.otherCheckedList);
        this.doLayout();
      },
      immediate: true,
      deep: true,
    },

    tableData: {
      handler() {
        this.$nextTick(() => {
          this.$refs.table.doLayout(); // 对 Table 进行重新布局
        });
      },
      deep: true,
    },
  },
  methods: {
    /** 重新布局 */
    doLayout() {
      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    },

    /**
     * 重置页码
     * @param {number} page
     */
    setCurrPage(page = 1) {
      this.$nextTick(() => {
        this.currPageNum = page;
      });
    },

    /**
     * 重置页数大小
     * @param {number} pagesize
     */
    setCurrPageSize(size = 15) {
      this.$nextTick(() => {
        this.currPageSize = size;
      });
    },

    /**
     * 字段展示处理-针对安全分析
     * @param {Object} row
     * @param {Object} item
     */
    secPostureRender({ row, item }) {
      if (item.fieldType) {
        if (item.fieldType === "date") {
          return moment(row[item.fieldName]).format("YYYY-MM-DD HH:mm:ss");
        } else if (item.fieldType === "select") {
          const curr = item.options.find(
            (items) => items.value == row[item.fieldName]
          );
          return curr ? curr.label : row[item.fieldName];
        } else {
          return row[item.fieldName];
        }
      } else {
        return row[item.prop];
      }
    },

    /**
     * 点击操作按钮
     * @param {string} optName
     * @param {Object} row
     * @param {number} index
     */
    operateClick(optName, row, index) {
      if (
        this.disableBtns(row).includes(this.$t(optName)) ||
        this.disableBtns(row).includes(this.$t(optName).text)
      ) {
        return;
      }
      this.$emit("opeClick", optName, row, index);
    },

    /**
     * 点击添加搜索字段-针对安全分析
     */
    addSearchField({ row, item }) {
      this.$emit("addSearchField", {
        fieldName: item.prop,
        value: Array.isArray(row[item.prop])
          ? row[item.prop]
          : [row[item.prop]],
        row: row,
      });
    },

    /**
     * changePage
     * @param {number} page
     */
    changePage: function (page) {
      var obj = {
        type: this.tabletype,
        num: page,
      };
      this.$emit("loadPage", obj);
    },

    /**
     * changePageSize
     * @param {number} pageSize
     */
    changePageSize: function (pageSize) {
      var obj = {
        type: this.tabletype,
        num: pageSize,
      };
      this.$emit("loadPageSize", obj);
    },

    /** 扩展行 */
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
     * @param {Object} data
     */
    sortChangeFn(data) {
      if (data.order) {
        let obj = {
          orderby: data.prop,
          seq: data.order == "ascending" ? "asc" : "desc",
        };
        this.$emit("sort", obj);
      } else {
        this.$emit("init-sort");
      }
    },

    /**
     * 表格划过某一单元列
     * @param {Object} column
     * @param {Object} row
     */
    // handleCellMouseEnter(row, column) {
    //     row.editable = column.property;
    // },

    /**
     * 表格单选某一行
     * @param {Array} selection
     * @param {Object} row
     */
    selectRowHandle(selection, row) {
      // 判断当前行选中状态
      const selected = selection.some((item) => item === row);
      this.selectChildren(row, selected);
      this.$emit("selectAction", selection);
      this.$emit("selectChildren", row, selected);
    },
    //点击表格整行
    rowClick(row) {
      this.$emit("rowClick", row);
    },
    /**
     * 选择框 收起展开事件
     * @param {Object} row  表格行数据
     * @param {string} prop 属性
     * @param {number} index 行索引
     * @param {string} status 下拉列表展开收起状态
     */
    handleVisibleSelect(status, row, prop, index) {
      if (status) {
        this.$emit("handleVisibleSelect", { prop, row, index });
      }
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
      this.$emit("selectAction", selection);
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

    /** 表格全选 */
    toggleAllSelection() {
      this.$refs.table.toggleAllSelection();
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
     * 输入框/选择框 编辑事件
     * @param {Object} row  表格行数据
     * @param {string} prop 属性
     * @param {number} index 行索引
     * @param {string} section 下拉列表选择的值
     */
    handleEdit(row, prop, index, section) {
      this.$emit("handleEdit", {
        prop,
        row,
        value: section || row[prop],
        index,
      });
    },

    /**
     * 数据搜索
     * @param {Object} column  表格列
     * @param {string} prop 属性
     * @param {*} value 属性值
     */
    querySearchAsync(prop, value, cb) {
      this.$emit("querySearchAsync", { prop, value }, cb);
    },

    /**
     * 右侧有购物车列表 - 删除操作 切换表格某一行选中状态
     * @param {number} index
     * @param {Object} row
     */
    toggleRowSelection(index, row) {
      this.checkedList.splice(index, 1);
      this.$refs["table"].toggleRowSelection(row);
    },

    /** 清空选项 */
    clearSelection() {
      this.$nextTick(() => {
        this.$refs["table"].clearSelection();
      });
    },

    setCellStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === this.cellIndex) {
        return "borderRight:1px solid #EBEEF5;paddingRight:10px;";
      } else {
        return "";
      }
    },

    /**
     * 显示隐藏列 - 多选的全选和单选的改变
     * @param {boolean} val
     */
    checkAllChangeHandle(val) {
      this.isIndeterminate = false;
      if (val) {
        this.otherCheckedList = this.OtherColumnNames;
        this.$emit("toggleColumns", this.otherColumns);
      } else {
        this.otherCheckedList = this.disabledCheckList;
        this.checkItemChangeHandle(this.otherCheckedList);
        // this.$emit('toggleColumns', this.otherCheckedList);
      }
    },

    /**
     * 显示隐藏列 - 单选事件
     * @param {Array} value
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
     * @param {Object} row
     * @param {string} prop
     * @param {Object} data
     */
    rowBtnClickHandle(row, prop, data) {
      this.$emit("rowBtnClickHandle", row, prop, data);
    },

    /**
     * 表头下拉菜单选择事件
     * @param {Object} command
     */
    handleCommand(command, index) {
      this.$emit("theadSelect", command);
    },
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

// 子元素行背景加深
.el-table__row--level-1 {
  background: #f8f9fc !important;
}

.is-edit-input .el-input__inner {
  padding-left: 5px !important;
  font-size: 14px;
}

.cell-item-normal {
  height: 36px;
  line-height: 36px;
  padding-left: 5px;
}

// 解决表格横向滚动条被隐藏1px
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
.el-table__body tr.hover-row > td {
  background-color: #f8fafeff;
}
.hover-row {
  position: relative;
  &::after {
    position: absolute;
    display: block;
    content: "";
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #5682f7ff;
  }
}

.alignCenter {
  padding-left: 10px !important;
}

// 设置分页loading样式
.pagination {
  margin-top: 18px;
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
//火狐浏览器下特殊处理
@-moz-document url-prefix() {
  .text-flow {
    display: inline;
  }
}
//IE10以上
@media screen and (min-width: 0\0) {
  .text-flow {
    display: inline;
  }
}
//IE9和IE10
@media screen and (min-width: 1367px) and (max-width: 1920px) and (-ms-high-contrast: active),
  (-ms-high-contrast: none) {
  .text-flow {
    display: inline;
  }
}
.vertical-line {
  /*margin-left: 7px;*/
  width: 1px;
  height: 12px;
  background: #cccfd9;
  display: inline-block;
}
/*::v-deep .el-button + .el-button {
    margin-left: 8px !important;
}*/
.table-btn-box {
  margin-left: 8px;
}
.table-btn-box:nth-child(1) {
  margin-left: 0;
}
.field-content {
  position: relative;
}
.add-field {
  display: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  right: 0;
  z-index: 10;

  .add-field-icon {
    width: 16px;
    height: 20px;
  }
}
.field-content:hover .add-field {
  display: block;
  cursor: pointer;
}
.add-field-tip {
  padding: 8px;
}
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
  ul {
    li {
      width: 84px;
      height: 30px;
      padding: 0 12px;
      line-height: 30px;
      text-align: center;
      color: #333333;
      cursor: pointer;
      &:hover {
        color: var(--defaultcolors);
        background: #eef2fe;
      }
      &.is-disabled {
        color: #c0c4cc !important;
      }
      &.is-disabled:hover {
        color: #c0c4cc !important;
        background: #fff !important;
      }
    }
    li.warning-btn {
      color: #f27c55;
      &:hover {
        color: #f27c55;
        background: rgba(242, 124, 85, 0.1);
      }
      &:active {
        background: rgba(242, 124, 85, 0.2);
      }
    }
  }
}

.custom-more-btn {
  padding: 8px;
  box-shadow: 0px 4px 12px 6px rgba(206, 211, 224, 0.55);
  border-radius: 8px;

  .custom-btn {
    width: 84px;
    height: 30px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-weight: 400;
    &:hover {
      background-color: rgba(86, 130, 247, 0.1);
      font-weight: 600;
    }
    &:active {
      background-color: rgba(86, 130, 247, 0.2);
      font-weight: 600;
    }
  }
  .warning-btn {
    width: 84px;
    height: 30px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-weight: 400;
    &:hover {
      background-color: rgba(242, 124, 85, 0.149);
      font-weight: 600;
    }
    &:active {
      background-color: rgba(242, 124, 85, 0.2);
      font-weight: 600;
    }
  }

  .is-disabled {
    cursor: not-allowed;
    &:hover {
      background: none;
      font-weight: normal;
    }
    &:active {
      background: none;
      font-weight: normal;
    }
  }
}
// 列表中button按钮 换行显示
.table-btn .el-button--text {
  white-space: normal;
  text-align: left;
}

.iconguolv {
  margin-left: 4px;
  position: relative;
  top: 1px;
  font-size: 14px;
  color: #858689;
}

// 可编辑输入框样式
::v-deep .el-input--small .el-input__inner {
  border: none;
  padding-left: 0px;
}
.error {
  color: #fe575d;
  ::v-deep .el-input__inner::-webkit-input-placeholder {
    color: #fe575d;
  }
  ::v-deep .el-input__inner {
    color: #fe575d;
  }
  ::v-deep .el-input__inner::placeholder {
    color: #fe575d;
  }
  ::v-deep .el-input--small .el-input__inner {
    color: #fe575d;
  }
}
.makeColor {
  color: #fe575d !important;
}
// 显示更多操作按钮
.more-btn {
  padding: 2px 6px;
  span {
    display: inline-block;
    height: 4px;
    width: 4px;
    border-radius: 50%;
    background-color: var(--defaultcolors);
    transform: scale(0.8);
  }
}

.table-btn-box-blue {
  padding: 0 5px;
  border-radius: 4px 4px 4px 4px;
  margin-left: 0;
  &:hover {
    background: rgba(86, 130, 247, 0.1);
  }
  &:active {
    background: rgba(86, 130, 247, 0.2);
  }
  button {
    padding: 0;
    height: 24px;
    line-height: 24px;
    color: rgba(86, 130, 247, 1);
  }
}
.table-btn-box-gray {
  padding: 0 5px;
  border-radius: 4px 4px 4px 4px;
  margin-left: 0;
  &:hover {
    background: none;
  }
  &:active {
    background: none;
  }
  button {
    padding: 0;
    height: 24px;
    line-height: 24px;
    color: #c0c4cc;
  }
}
.table-btn-box-red {
  padding: 0 5px;
  border-radius: 4px 4px 4px 4px;
  margin-left: 0;
  &:hover {
    background: rgba(242, 124, 85, 0.1);
  }
  &:active {
    background: rgba(242, 124, 85, 0.2);
  }
  button {
    padding: 0;
    height: 24px;
    line-height: 24px;
    color: rgba(242, 124, 85, 1);
  }
}
</style>
