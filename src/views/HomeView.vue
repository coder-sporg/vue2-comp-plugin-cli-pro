<template>
  <div class="home">
    <div class="fl-bet-cen">
      <div class="left">
        <el-form
          ref="form"
          :model="form"
          label-position="left"
          class="fl-item ov-auto"
          @submit.native.prevent
          style="margin-left: 10px"
        >
          <el-form-item
            v-for="(item, index) in formList"
            :key="item.level"
            :rules="[{ validator: validateValue, trigger: ['blur', 'change'] }]"
            :prop="item.level + ''"
          >
            <span slot="label">
              <span
                class="round-tag text-cen tag"
                :style="{
                  'margin-left': '20px',
                  background: colorArr[item.level - 1],
                }"
              >
                {{ index + 1 }}
              </span>
            </span>
            <el-input
              style="width: 140px"
              v-model.trim="form[item.level]"
              placeholder="请输入级别名称"
              :maxlength="128"
            ></el-input>
          </el-form-item>
          <div
            class="handle-add"
            style="margin-left: 0"
            v-if="this.formList.length < 9"
          >
            <el-button
              :disabled="this.formList.length >= 9"
              @click="addLevel"
              class="level-define-btn"
              type="text"
            >
              <div class="level-btn">添加级别</div>
            </el-button>
            <span class="color-grey" style="margin-left: 8px"
              >(级别添加完成不可删除，请谨慎操作)</span
            >
          </div>
        </el-form>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
// import TableData from "@/components/TableData.vue";

export default {
  name: "HomeView",
  components: {
    // TableData,
  },
  data() {
    return {
      form: {},
      formList: [
        { level: 1, name: "S1" },
        { level: 2, name: "S2" },
        { level: 3, name: "S3" },
        { level: 4, name: "S4" },
      ],
      colorArr: [
        "#F6D636",
        "#F0A853",
        "#EF9259",
        "#EE7D5A",
        "#F36C69",
        "#E15BE3",
        "#E263C2",
        "#E261A1",
        "#D54675",
      ],
    };
  },
  methods: {
    init() {
      this.form = this.formList.reduce((pre, cur) => {
        const { level, name } = cur;
        pre[level] = name;
        return pre;
      }, {});
    },
    addLevel() {
      this.formList.push({
        level: this.formList.length + 1,
      });
      this.$set(this.form, this.formList.length + "", "");
    },
    /** 名称校验 */
    /**
     * rule: { field: '2', fullField: '2', type: 'string', validator: ƒ }
     */
    validateValue(rule, value, callback) {
      // console.log("rule: ", rule);
      if (!value) {
        callback(new Error("请输入级别名称"));
      } else if (value.length > 128) {
        callback(new Error("级别名称不能超过128个字符"));
      } else {
        // 1.找出不是当前的form表单
        let compareArr = this.formList.filter(
          (item) => String(item.level) !== rule.field
        );
        // 2.在其他表单项中查找重复项
        let curr = compareArr.find((item) => this.form[item.level] === value);
        if (curr) {
          callback(new Error("级别名称重复"));
        } else {
          callback();
        }
      }
    },
  },
  created() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.home {
  background-image: url(../assets/img/bg-color.png);
  // background-size: 100% 100%;
  // background-repeat: no-repeat;
}

.level-btn {
  padding: 4px;
  border-radius: 4px;
  &:hover {
    background: rgba(86, 130, 247, 0.1);
  }
  &:active {
    background: rgba(86, 130, 247, 0.2);
  }
}

.round-tag {
  display: inline-block;
  font-weight: 700;
  font-size: 12px;
  border-radius: 50%;
  color: #fff;
}
.tag {
  width: 20px;
  height: 20px;
  line-height: 20px;
}
::v-deep .el-form-item {
  display: flex;
  // justify-content: space-between;
}

::v-deep .el-form-item__content {
  margin-left: 150px;
}
</style>
