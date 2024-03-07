<!-- 
    两种类型
        1. 单个条件模版且可以添加多条重复规则       应用场景: 网络准入/准入策略
        2. 多个条件模版且每种规则类型只能添加一次   应用场景: 资源管理/访问控制策略/创建规则模板
            switchTplHanlde 切换规则类型
 -->
<template>
  <div class="dragable-wrap radius">
    <div class="fl-bet-cen mr-b-20" v-if="showHeader">
      <div class="module-title">
        <span>触发条件</span>
      </div>
      <!-- <el-button type="text" v-if="!enableDrag" class="color-primary" @click="sortHandle(0)">
                <i class="iconfont iconpaixu f-t-12 mr-r-5"></i>条件排序
            </el-button>
            <el-button type="text" v-else class="color-primary" @click="sortHandle(1)">
                <i class="iconfont iconqueding f-t-12 mr-r-5"></i>确定
            </el-button> -->
    </div>
    <Draggable
      v-model="conditionList"
      :disabled="!enableDrag"
      handle=".dragBtn"
      animation="600"
      dragClass="dragClass"
      ghostClass="ghostClass"
      chosenClass="chosenClass"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <transition-group>
        <div v-for="(condition, idx) in conditionList" :key="'condition' + idx">
          <div class="fl-bet-cen">
            <div
              class="condition radius fl-item"
              :class="{
                after: idx !== conditionList.length - 1,
                before: idx !== 0,
                active: activeIndex == idx,
                border: sourceType == 'AccessStrategy',
              }"
            >
              <el-row
                :gutter="gutter"
                type="flex"
                justify="start"
                class="row"
                :class="{ active: enableDrag }"
              >
                <el-col
                  :span="0.5"
                  style="padding-right: 5px"
                  v-if="!isEditDisabled"
                >
                  <i
                    class="iconfont iconkeyidong cursor dragBtn"
                    style="color: #8d95a8"
                  ></i>
                </el-col>
                <slot :condition="condition" :idx="idx"></slot>
              </el-row>
            </div>
            <div
              class="mr-l-20"
              v-if="!isEditDisabled"
              style="margin-top: 2px; width: 54px"
            >
              <span
                v-if="conditionList.length < numLimit"
                @click="addConHandle(idx)"
                ><i class="opt-btn iconfont icona- cursor mr-r-10"></i
              ></span>
              <span v-if="conditionList.length > 1" @click="delConHandle(idx)"
                ><i class="opt-btn iconfont icona-- cursor"></i
              ></span>
            </div>
          </div>
          <div
            class="logical-symbol fl-end-cen cursor"
            :class="{ disabled: isEditDisabled }"
            :key="idx + condition.logic"
            v-if="condition.logic"
          >
            <el-popover placement="right" trigger="hover" class="popper-class">
              <div class="logical-popover-box cursor" v-if="!isEditDisabled">
                <p class="" @click="chooseLogical(idx, 0)">且</p>
                <p class="" @click="chooseLogical(idx, 1)">或</p>
              </div>
              <div slot="reference">
                <span>{{ logicalSymbolMap[condition.logic] }}</span>
                <i class="iconfont iconzhankai1 rightRow"></i>
              </div>
            </el-popover>
          </div>
        </div>
      </transition-group>
    </Draggable>
    <!-- 添加按钮 -->
    <div
      v-if="showFooter"
      class="fl-cen-cen footerBtn mr-t-20 cursor"
      @click="addConHandle(conditionList.length - 1)"
    >
      <i class="iconfont icontianjia mr-r-5"></i>
      <span>添加触发条件</span>
    </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "DragableCom",
  components: {
    Draggable,
  },
  props: {
    // 条件列表数据源
    data: {
      type: Array,
      default: () => [],
    },
    // 条件数据模板
    dataTpl: {
      type: Object,
      default: () => {},
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    gutter: {
      type: Number,
      default: 20,
    },
    // 条件数量限制
    numLimit: {
      type: Number,
      default: 1000,
    },
    // AccessStrategy-准入策略 | AccessCtrlPolicyList-动态访问控制策略
    sourceType: {
      type: String,
      default: "AccessCtrlPolicyList",
    },
    // 规则不可编辑
    isEditDisabled: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    data: {
      handler(newValue) {
        this.conditionList = JSON.parse(JSON.stringify(newValue));
      },
    },
    deep: true,
  },
  data() {
    return {
      conditionList: JSON.parse(JSON.stringify(this.data)),
      //当前拖动的组
      activeIndex: -1,
      logicalSymbolMap: {
        "&&": "且",
        "||": "或",
      },
    };
  },
  computed: {
    // 是否可以拖动
    enableDrag() {
      if (this.conditionList.length > 1) {
        return true;
      }
      return false;
    },
  },
  methods: {
    /** 点击排序按钮 */
    // sortHandle(){
    //     this.enableDrag = !this.enableDrag;
    // },
    /** 删除条件 */
    delConHandle(idx) {
      if (this.conditionList.length > 1) {
        this.$confirm("确定删除该规则吗?", this.$t("common.tip"), {
          type: "warning",
        })
          .then(() => {
            if (idx == this.conditionList.length - 1) {
              this.$set(this.conditionList[idx - 1], "logic", "");
            }
            this.conditionList.splice(idx, 1);
            this.$emit("delConHandle");
          })
          .catch(() => {});
      }
    },
    /** 添加条件 */
    addConHandle(idx) {
      if (idx == this.conditionList.length - 1) {
        this.$set(this.conditionList[idx], "logic", "||");
        this.conditionList.splice(
          idx + 1,
          0,
          JSON.parse(JSON.stringify({ ...this.dataTpl["default"], logic: "" }))
        );
      } else {
        this.conditionList.splice(
          idx + 1,
          0,
          JSON.parse(
            JSON.stringify({ ...this.dataTpl["default"], logic: "||" })
          )
        );
      }
      this.$emit("addConHandle");
    },
    /** 选择逻辑运算符 type 0-且  1-或 */
    chooseLogical(idx, type) {
      this.$set(this.conditionList[idx], "logic", type == 0 ? "&&" : "||");
      this.$forceUpdate();
    },
    /** 条件开始拖动 */
    onDragStart(e) {
      this.activeIndex = e.oldIndex;
    },
    /** 条件结束拖动 */
    onDragEnd(e) {
      let oldIndex = e.oldIndex,
        newIndex = e.newIndex,
        lastIndex = this.conditionList.length - 1;
      if (newIndex == lastIndex) {
        this.$set(this.conditionList[newIndex], "logic", "");
        this.$set(this.conditionList[lastIndex - 1], "logic", "||");
      } else if (oldIndex == lastIndex) {
        this.$set(this.conditionList[newIndex], "logic", "||");
        this.$set(this.conditionList[lastIndex], "logic", "");
      }
      this.activeIndex = -1;
    },
    /** 条件是否完整验证 */
    verifyCon() {
      let flag = true;
      for (let index = 0; index < this.conditionList.length; index++) {
        let condition = this.conditionList[index];
        for (let key in condition) {
          if (condition[key].length == 0 && key != "logic") {
            flag = false;
          }
        }
      }
      if (!flag) {
        this.$message.warning("请将触发条件补充完整!");
        return false;
      }
      return flag;
    },
    /** 属性值重置 */
    resetProperty(idx, property, newValue = "") {
      this.$set(this.conditionList[idx], property, newValue);
    },
    /**
     * @description 多个条件模版场景 切换条件类型触发
     * @param {string} value 手动条件规则类型的值
     * @param {number} idx 触发切换事件的条件索引
     * @param {string} prop 触发切换事件的条件类型字段
     * @param {string} tplType 要切换到的条件数据模版
     * @return null
     * */
    switchTplHanlde(value, idx, prop, tplType) {
      if (this.conditionList.length - 1 === idx) {
        this.$set(this.conditionList, idx, {
          ...this.dataTpl[tplType],
          logic: "",
        });
      } else {
        this.$set(this.conditionList, idx, { ...this.dataTpl[tplType] });
      }
      this.$nextTick(() => {
        this.$set(this.conditionList[idx], prop, value);
      });
    },
    /** 提交数据 */
    composeData() {
      return this.conditionList;
    },
  },
};
</script>
<style>
.dragable-wrap .el-range-editor--small.el-input__inner {
  height: 36px;
  line-height: 36px;
}
.logical-popover-box {
  width: 70px;
  text-align: center;
  line-height: 30px;
}
</style>
<style lang="scss" scoped>
.condition {
  padding: 16px 20px 16px;
  position: relative;
  transition: "background" 0.3s ease;
  background: #fff;
  overflow: hidden;
  .row {
    // padding: 8px 0;
  }
  .dragBtn {
    height: 20px;
    width: 10px;
    line-height: 36px;
    cursor: move;
    span {
      height: 4px;
      width: 4px;
      background: #8d95a8;
      border-radius: 50%;
      display: inline-block;
      transform: scale(0.6);
    }
  }
  .dragBtn.dragActive span {
    background: var(--defaultcolors) !important;
  }
}
.border {
  border: 1px dashed #c4c6cc;
}
.border.before {
  &::before {
    border-right: 1px dashed #dcdfe6;
    border-bottom: 1px dashed #dcdfe6;
  }
}
.border.after {
  &::after {
    border-right: 1px dashed #dcdfe6;
    border-top: 1px dashed #dcdfe6;
  }
}
.condition.active {
  background: #f5f6fa;
}
.condition.before {
  &::before {
    display: block;
    position: absolute;
    content: " ";
    left: -2px;
    top: -2px;
    width: 36px;
    height: 18px;
    border-bottom-right-radius: 2em 1.5em;
    background-color: #f7f8fa;
  }
}
.condition.after {
  &::after {
    display: block;
    position: absolute;
    content: " ";
    left: -2px;
    bottom: -2px;
    width: 36px;
    height: 18px;
    border-top-right-radius: 2em 1.5em;
    background-color: #f7f8fa;
  }
}
.chosen {
  opacity: 0.8;
  box-shadow: 0 0 6px 2px #c4c6cc;
}

/** 逻辑符 */
.logical-symbol {
  height: 32px;
  width: 28px;
  background: var(--defaultcolors);
  color: #fff;
  border-bottom-right-radius: 20px;
  border-top-right-radius: 20px;
  margin-top: -10px;
  margin-bottom: -10px;
  position: relative;
  z-index: 10;
  span {
    font-size: 12px;
    margin-right: -2px;
  }
  .rightRow {
    display: inline-block;
    transform: rotate(-90deg);
  }
}
.logical-symbol.disabled {
  background: #b1b1b1;
}

/** 加减操作符 */
.opt-btn {
  font-size: 22px;
  color: #b6bac1;
}
.opt-btn:hover {
  color: var(--defaultcolors);
}

.footerBtn {
  border: 1px solid #dcdfe6;
  background: #fff;
  line-height: 34px;
  color: var(--defaultcolors);
  border-radius: 3px;
}
.footerBtn:hover {
  background: #fafafc;
}

.chosenClass {
  opacity: 0.8;
  // box-shadow: 0 0 6px 2px #C4C6CC;
}
</style>
