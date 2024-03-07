<template>
  <div class="fl-sta-cen">
    <div class="fl-sta-cen">
      <template v-if="tagList.length">
        <template v-if="tagList.length <= showSize">
          <div
            v-for="(item, index) in tagList"
            :key="index"
            class="fl-cen-cen tag-item"
            :class="{ 'tag-color-gray': customColor }"
          >
            <div
              class="text-flow"
              :title="item"
              :class="{ cursor: showCursor }"
              @click="tagClick(item)"
            >
              {{ item }}
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="index in showSize"
            :key="index"
            class="fl-cen-cen text-flow tag-item"
            :class="{
              'tag-color-gray': customColor,
              'tag-overflow-item': tagList.length > 1,
            }"
          >
            <div
              class="text-flow"
              :title="tagList[index - 1]"
              :class="{ cursor: showCursor }"
              @click="tagClick(tagList[index - 1])"
            >
              {{ tagList[index - 1] }}
            </div>
          </div>
          <div class="mr-r-6">
            <el-popover placement="top" trigger="hover">
              <div class="tag-popover-box fl-sta-cen">
                <template v-if="showSizeTotal">
                  <div
                    v-for="index in tagList.length"
                    :key="index"
                    class="tag-item"
                    :class="{
                      'tag-color-gray': customColor,
                      cursor: showCursor,
                    }"
                  >
                    <div
                      class="content-tag-div"
                      @click="tagClick(tagList[tagList.length - index])"
                      style="font-size: 12px"
                      :title="tagList[tagList.length - index]"
                    >
                      {{ tagList[tagList.length - index] }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-for="index in tagList.length - showSize"
                    :key="index"
                    class="tag-item"
                    :class="{
                      'tag-color-gray': customColor,
                      cursor: showCursor,
                    }"
                  >
                    <div
                      @click="tagClick(tagList[tagList.length - index])"
                      style="font-size: 12px"
                    >
                      {{ tagList[tagList.length - index] }}
                    </div>
                  </div>
                </template>
              </div>
              <div
                slot="reference"
                class="fl-cen-cen text-flow tag-item mr-r-6"
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
    showCursor: {
      type: Boolean,
      default: false,
    },
    showSizeTotal: {
      type: Boolean,
      default: true,
    },
  },
  data: () => {
    return {
      value: "",
    };
  },
  methods: {
    tagClick(data) {
      this.$emit("tag-click", data);
    },
  },
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
  max-width: 140px;
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
  &:hover {
    background: #e6f0ff;
  }
}

.tag-overflow-item {
  max-width: 64px;
}
.content-tag-div {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tag-color-gray {
  background: rgba(138, 144, 153, 0.15) !important;
  color: #333 !important;
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
  min-width: 30px;
  position: relative;
}
.icon-delete {
  font-size: 12px;
}
.icon-span:hover {
  background: #c6d8ff;
}
</style>
