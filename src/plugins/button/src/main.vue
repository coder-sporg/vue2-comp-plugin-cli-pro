<template>
  <el-button
    @click="click"
    type="primary"
    :loading="loading"
    :disabled="disabled"
    :class="[
      `custom-button-${level}`,
      `custom-button-${level}-${type}`,
      `${customClass}`,
      `custom-button`,
    ]"
    :style="customStyle"
  >
    <!-- 一级按钮 -->
    <template v-if="level == 1">
      <div class="fl-cen-cen">
        <div v-if="icon" class="fl-cen-cen icon-box mr-r-8">
          <i class="niconfont" :class="icon"></i>
        </div>
        <slot />
      </div>
    </template>
    <template v-if="level == 2">
      <div class="fl-cen-cen">
        <i v-if="icon" class="niconfont mr-r-8" :class="icon"></i>
        <slot />
      </div>
    </template>

    <template v-if="level == 3">
      <div class="fl-cen-cen">
        <div v-if="icon" class="fl-cen-cen icon-box mr-r-8">
          <i class="niconfont" :class="icon"></i>
        </div>
        <slot />
      </div>
    </template>

    <template v-if="level == 4">
      <i class="niconfont mr-r-4" :class="icon"></i>
      <slot />
    </template>
  </el-button>
</template>

<script>
export default {
  name: "CustomButton",
  props: {
    //按钮级别 1：一级按钮 2：二级按钮 3：三级按钮 4：四级按钮 (对应蓝湖新版后台)
    level: {
      type: [Number, String],
      default: () => {
        return 1;
      },
    },
    //按钮颜色 primary：要按钮-蓝色， warning：橙色
    type: {
      type: String,
      default: () => {
        return "primary";
      },
    },
    //icon
    icon: {
      type: String,
      default: () => {
        return "";
      },
    },

    //自定义类名
    customClass: {
      type: String,
      default: () => {
        return "";
      },
    },
    customStyle: {
      type: String,
      default: () => {
        return "";
      },
    },

    //是否加载中状态
    loading: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    //是否加载中状态
    disabled: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  methods: {
    click(e) {
      this.$emit("click", e);
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
/*一级按钮样式-start*/
.custom-button-1 {
  min-width: 76px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 14px;
  font-family: PingFang SC-Semibold, PingFang SC;
  /*font-weight: 600;*/
  color: #ffffff;
  line-height: 36px;
  .icon-box {
    width: 22px;
    height: 22px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
}
.custom-button-1-primary {
  background: #5682f7;
  &:hover {
    background: #89a8fa;
  }
  &:active {
    background: #446edf;
  }
}
.custom-button-1-warning {
  background: #f27c55;
  &:hover {
    background: rgba(242, 124, 85, 0.7);
  }
  &:active {
    background: #d9653f;
  }
}
/*一级按钮样式-end*/

/*二级按钮样式-start*/
.custom-button-2 {
  min-width: 76px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 14px;
  font-family: PingFang SC-Semibold, PingFang SC;
  /*font-weight: 600;*/
  line-height: 36px;
}
.custom-button-2-primary {
  background: #eef2fe;
  color: #5682f7;
  &:hover {
    color: #ffffff;
    background: #89a8fa;
  }
  &:active {
    color: #ffffff;
    background: #446edf;
  }
}
/*二级按钮样式-end*/

/*三级按钮样式-start*/
.custom-button-3 {
  min-width: 76px;
  height: 36px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e6eaf5;

  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  line-height: 36px;
  .icon-box {
    width: 22px;
    height: 22px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
}
.custom-button-3-primary {
  color: #333333;
  &:hover {
    border: 1px solid #5682f7;
    color: #5682f7;
  }
  &:active {
    border: 1px solid #446edf;
    color: #446edf;
  }
}
/*三级按钮样式-end*/

/*四级按钮样式-start*/
.custom-button-4 {
  height: 22px;
  padding: 0 4px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  line-height: 22px;
}
.custom-button-4-primary {
  color: #5682f7;
  &:hover {
    background: rgba(86, 130, 247, 0.1);
  }
  &:active {
    background: rgba(86, 130, 247, 0.2);
  }
}
.custom-button-4-warning {
  color: #f27c55;
  &:hover {
    background: rgba(242, 124, 85, 0.1);
  }
  &:active {
    background: rgba(242, 124, 85, 0.2);
  }
}
/*四级按钮样式-end*/
</style>
