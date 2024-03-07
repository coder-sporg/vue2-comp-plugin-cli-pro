<template>
  <div
    class="re-pos full-height bg-white radius-8 side-container"
    :class="{ shrink: isShrink }"
  >
    <div class="content full-height ov-hide">
      <div class="full-height" :class="{ 'pd-16': showSearch }">
        <div class="search-section mr-b-16 ov-hide" v-if="showSearch">
          <el-input
            v-model.trim="searchValue"
            :placeholder="placeholder"
            clearable
            @keyup.enter.native="searchHandle"
            @clear="searchHandle"
          >
            <i
              slot="prefix"
              class="el-input__icon el-icon-search cursor"
              @click="searchHandle"
            ></i>
          </el-input>
        </div>
        <div class="tree-section">
          <slot></slot>
        </div>
      </div>
    </div>
    <div class="shrink-btn cursor" @click="shrinkClick">
      <img
        v-if="!isShrink"
        src="@/assets/imgs/struct-spread.svg"
        alt=""
        srcset=""
      />
      <img v-else src="@/assets/imgs/struct-shrink.svg" alt="" srcset="" />
    </div>
  </div>
</template>
<script>
import { mapMutations } from "vuex";

export default {
  props: {
    placeholder: {
      type: String,
      default: "请输入关键字",
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      searchValue: "",
      isShrink: false,
    };
  },
  methods: {
    ...mapMutations(["setShrinkSide"]),
    // 收缩、展开
    shrinkClick() {
      this.isShrink = !this.isShrink;
      this.setShrinkSide(this.isShrink);
      this.$emit("shrinkClick");
    },
    searchHandle() {
      this.$emit("search", this.searchValue);
    },
    resetSearch() {
      this.searchValue = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.side-container {
  width: 264px;
  margin-right: 16px;
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  min-width: 240px;
  border: 1px solid #eef2fe;
  .shrink-btn {
    position: absolute;
    top: 50%;
    right: -12px;
    height: 40px;
    width: 8px;
    transform: translateY(-20px);
  }
}
.shrink {
  width: 0;
  margin-right: 0px;
  min-width: 0;
  .shrink-btn {
    right: 4px;
  }
}

.el-icon-search {
  margin-top: 2px;
}

::v-deep {
  .el-tabs__header {
    background: #eef2fe;
  }
  .el-input__inner {
    border-radius: 8px;
  }
  .tree-container .el-tabs__nav-wrap:not(.is-scrollable) {
    .el-tabs__nav-scroll {
      display: flex;
      justify-content: center;
    }
  }
  .el-tabs__nav-wrap::after {
    background-color: #eef2fe;
  }
}
.tree-section {
  height: calc(100% - 52px);
}
</style>
