<template>
  <div class="fl-sta-cen">
    <div class="fl-sta-cen" style="flex-wrap: wrap">
      <template v-if="tagList.length">
        <template v-if="tagList.length <= showSize">
          <div
            v-for="(item, index) in tagList"
            :key="index"
            class="fl-cen-cen tag-item"
            :class="{ 'tag-color-gray': customColor }"
          >
            <el-popover placement="bottom" title="" trigger="hover">
              <div style="padding: 8px 16px">
                {{ item.levelName || "-" }}:
                {{ item.name }}
              </div>
              <div class="text-flow" slot="reference">
                {{ item.name }}
              </div>
            </el-popover>
            <div v-if="showCount">({{ item.count || 0 }})</div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="index in showSize"
            :key="index"
            class="fl-cen-cen text-flow tag-item"
            :class="{ 'tag-color-gray': customColor }"
          >
            <el-popover placement="bottom" title="" trigger="hover">
              <div style="padding: 8px 16px">
                {{ tagList[index - 1].levelName || "-" }}
              </div>
              <div class="text-flow" slot="reference">
                {{ tagList[index - 1].name }}
              </div>
            </el-popover>
            <div v-if="showCount">({{ tagList[index - 1].count || 0 }})</div>
          </div>
          <div class="mr-r-6">
            <el-popover placement="top" trigger="hover">
              <div class="tag-popover-box fl-sta-cen">
                <div
                  v-for="index in tagList.length - showSize"
                  :key="index"
                  class="tag-item"
                  :class="{ 'tag-color-gray': customColor }"
                  :title="tagList[tagList.length - index].levelName"
                >
                  {{ tagList[tagList.length - index].name }}
                  <span v-if="showCount">
                    ({{ tagList[tagList.length - index].count || 0 }})
                  </span>
                </div>
              </div>
              <div
                slot="reference"
                class="fl-cen-cen text-flow cursor tag-item mr-r-6"
                :class="{ 'text-gray': customColor }"
              >
                +{{ tagList.length - showSize }}
              </div>
            </el-popover>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "tag-list",
  props: {
    tagList: {
      type: Array,
      default: () => [],
    },
    showSize: {
      type: Number,
      default: 2,
    },
    customColor: {
      type: Boolean,
      default: false,
    },
    showCount: {
      type: Boolean,
      default: false,
    },
    showType: {
      type: String,
      default: "",
    },
  },
  data: () => {
    return {
      value: "",
    };
  },
  methods: {},
};
</script>
<style lang="scss">
.tag-popover-box {
  padding: 2px 0px 8px 6px !important;
}
</style>
<style lang="scss" scoped>
.disFunc {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}
.input-box {
  width: 180px;
}
::v-deep .el-input--small .el-input__inner {
  padding-left: 8px;
  height: 32px;
  line-height: 32px;
}
.tag-item {
  margin-right: 6px;
  padding: 0px 8px;
  background: rgba(86, 130, 247, 0.1);
  line-height: 26px;
  text-align: center;
  height: 26px;
  border-radius: 8px 8px 8px 8px;
  font-size: 12px;
  font-family: PingFang SC-Medium, PingFang SC;
  font-weight: 500;
  color: #5682f7;
  margin-bottom: 8px;
  &:hover {
    background: #e6f0ff;
  }
}
.tag-color-gray {
  background: rgba(138, 144, 153, 0.15) !important;
  color: #333333 !important;
  &:hover {
    background: rgba(138, 144, 153, 0.2) !important;
  }
}
.text-gray {
  background: rgba(138, 144, 153, 0.15) !important;
  color: #333333 !important;
  &:hover {
    background: rgba(138, 144, 153, 0.2) !important;
  }
}
.add-div {
  &:active {
    background: #d6e4ff;
  }
}
.tag-popover-box {
  flex-wrap: wrap;
  max-width: 274px;
  padding: 6px 14px 14px !important;
  .tag-item {
    max-width: 230px;
    margin-top: 8px;
    text-align: left;
  }
}
.text-flow {
  font-size: 12px;
  min-width: 40px;
  position: relative;
  max-width: 80px;
}
.icon-delete {
  font-size: 12px;
}
.icon-span:hover {
  background: #c6d8ff;
}
</style>
