<template>
  <div class="input-number dis-inb">
    <el-input
      class="full-width"
      v-model="number"
      placeholder="请输入"
      @input="(v) => numInputHandle(v)"
      @blur="(e) => numInputBlurHandle(e)"
    >
    </el-input>
  </div>
</template>
<script>
export default {
  name: "InputNumber",
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    // 最大值
    max: {
      type: Number,
      default: 10000000,
    },
    // 最小值
    min: {
      type: Number,
      default: 0,
    },
    // 默认值
    default: {
      type: Number,
      default: 0,
    },
    // 初识值
    value: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      number: parseInt(this.value) || 0,
    };
  },
  methods: {
    numInputHandle(v) {
      if (v !== "") {
        v = parseInt(v.replace(/^(0+)|[^\d]+/g, ""));
        if (isNaN(v)) {
          v = "";
        } else if (v > this.max) {
          v = this.max;
        } else if (v < this.min) {
          v = this.min;
        }
      }
      this.number = v;
      this.$emit("input", v);
    },
    numInputBlurHandle() {
      if (
        this.number === "" ||
        this.number === undefined ||
        isNaN(this.number)
      ) {
        this.number = 0 || this.default;
        this.$emit("input", this.number);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.input-number {
  width: 60px;
}
</style>
