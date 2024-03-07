<template>
  <div
    class="input-tag fieldType-tag"
    :class="{ disabled: disabled }"
    :style="inputStyle"
    ref="inputWrap"
    @click.stop="focusHandle"
  >
    <div class="el-select__tags">
      <!-- 不可编辑 -->
      <template>
        <span v-if="disabled && value.length">
          <span class="disabled-tag" v-for="tag in value" :key="tag">
            {{ valueHandle(tag) }}
          </span>
        </span>
        <!-- 敏感数据字典临时加 -->
        <el-input
          class="prohibitediting"
          v-else-if="disabled && source == 'sensitiveWords'"
          :disabled="disabled"
          :placeholder="placeholder"
        />
      </template>

      <!-- 可编辑 -->
      <template>
        <span v-if="!disabled">
          <el-tag
            disable-transitions
            v-for="(tag, index) in value"
            type="info"
            :key="tag"
            size="mini"
            :closable="!disabled"
            @close="closeTagHandle(index)"
            style="
              white-space: normal;
              word-break: break-all;
              height: auto;
              margin: 2px 6px;
            "
          >
            {{ tag }}
          </el-tag>
        </span>
        <input
          v-if="!disabled"
          type="text"
          class="input"
          ref="input"
          v-model="inputValue"
          @blur="blurHandle"
          @keydown.enter.prevent="enterHandle"
          :placeholder="placeholder"
          :style="{
            'flex-grow': '1',
            width: inputLength / (inputWidth - 32) + '%',
            'max-width': inputWidth - 42 + 'px',
            'font-size': '13px',
            'line-height': '24px',
          }"
        />
      </template>
    </div>
  </div>
</template>
<script>
export default {
  name: "InputTag",
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    value: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    inputStyle: {
      type: Object,
      default: () => {},
    },
    source: {
      type: String,
      default: "emergency",
    },
    maxLength: {
      type: [Boolean, Number],
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      inputWidth: 0,
      inputLength: 80,
      inputValue: "",
    };
  },
  watch: {
    value(inputValue) {
      this.$emit("input", inputValue);
    },
  },
  methods: {
    blurHandle() {
      this.inputValue = "";
    },
    focusHandle() {
      if (!this.disabled) {
        this.$refs.input.focus();
      }
    },
    closeTagHandle(index) {
      // eslint-disable-next-line vue/no-mutating-props
      this.value.splice(index, 1);
    },
    enterHandle(e) {
      if (e.keyCode == "13" && this.inputValue !== "") {
        let index = this.value.findIndex((item) => item === this.inputValue);
        if (index > -1) {
          // this.value.splice(index, 1);
        } else {
          if (this.maxLength && this.inputValue.length > this.maxLength) {
            this.$message.warning(`最多输入${this.maxLength}个字符`);
            return;
          } else if (this.size !== 0 && this.value.length >= this.size) {
            this.$message.warning(`最多输入${this.size}个标签`);
          } else {
            // eslint-disable-next-line vue/no-mutating-props
            this.value.push(this.inputValue);
          }
        }
        this.inputValue = "";
      }
    },
    /**
     * 内置规则时浮点数展示为百分比
     * 自定义规则不做处理
     */
    valueHandle(data) {
      if (this.disabled && typeof parseFloat(data) === "number" && data < 1) {
        return data * 100 + "%";
      }
      return data;
    },
  },
  mounted() {
    this.inputWidth = this.$refs.inputWrap.getBoundingClientRect().width;
  },
};
</script>
<style lang="scss">
.input-tag {
  .el-input.is-disabled .el-input__inner {
    height: 34px;
    line-height: 34px;
    border: none;
  }
  .el-tag .el-icon-close {
    flex-shrink: 0;
  }
}
</style>
<style lang="scss" scoped>
.input-tag {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  min-height: 36px;
  line-height: 36px;
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  background: #fff;
  .el-select__tags {
    width: 100%;
    position: static;
    top: 0;
    transform: translateY(0);
    padding-right: 6px;
    & > span {
      display: contents;
    }
    input {
      flex-grow: 1;
      max-width: 240px;
      margin-left: 5px;
      outline: 0;
      border: none;
      padding-left: 10px;
    }
  }
  .prohibitediting {
    max-width: 350px;
    .el-input.is-disabled {
      .el-input__inner {
        border: none !important;
      }
    }
  }
}

.input-tag.disabled {
  background-color: #f5f7fc;
  color: #414141;
  cursor: not-allowed;
}

.disabled-tag {
  height: 24px;
  padding: 0 8px;
  line-height: 22px;
  font-size: 13px;
}
.input::-webkit-input-placeholder {
  color: #c0c4cc;
}
.input::-moz-placeholder {
  color: #c0c4cc;
}
.input::-ms-input-placeholder {
  color: #c0c4cc;
}
.input::placeholder {
  color: #c0c4cc;
}
</style>
