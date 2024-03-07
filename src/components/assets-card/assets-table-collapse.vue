<template>
  <div>
    <div class="panel-box white-bg" v-for="data in lists" :key="data.name">
      <!-- 头部 -->
      <div class="title-box fl-sta-cen">
        <div>{{ data.title }}</div>
        <div class="m-r-l-10">
          <a href="javascript: void(0);" @click="clickHandle(data.key)">{{
            data.total
          }}</a>
        </div>
      </div>
      <div class="show-table">
        <div
          v-for="(item, idx) in data.dataList"
          :key="item.name"
          class="table-row"
        >
          <!-- 行总名称 -->
          <el-row>
            <el-col :span="4">
              <div class="row-item fl-sta-cen">
                <div class="row-total">{{ item.name }}</div>
                <div class="divider" v-show="item.value"></div>
                <div>
                  <a
                    href="javascript: void(0);"
                    @click="clickHandle(data.key, item.key)"
                    v-show="item.value"
                    >{{ item.value }}</a
                  >
                </div>
              </div>
            </el-col>
            <el-col :span="20" class="table-detail-row">
              <!-- 行详情 -->
              <div
                v-for="(ele, index) in item.children"
                :key="ele.name"
                class="row-item fl-sta-cen"
                v-show="index < 4"
              >
                <div class="text-flow max-width-80" :title="ele.name">
                  {{ ele.name }}
                </div>
                <div class="divider" v-show="ele.value"></div>
                <div v-show="ele.value">
                  <a
                    href="javascript: void(0);"
                    @click="clickHandle(data.key, item.key, ele.key)"
                    >{{ ele.value }}</a
                  >
                </div>
              </div>
              <div
                v-for="(ele, index) in item.children"
                :key="ele.name + index"
                class="row-item fl-sta-cen"
                v-show="index >= 4 && item.slideflag"
              >
                <div class="text-flow max-width-80" :title="ele.name">
                  {{ ele.name }}
                </div>
                <div class="divider" v-show="ele.value"></div>
                <div v-show="ele.value">
                  <a
                    href="javascript: void(0);"
                    @click="clickHandle(data.key, item.key, ele.key)"
                    >{{ ele.value }}</a
                  >
                </div>
              </div>
              <div class="icon" v-show="item.children.length > 4">
                <i
                  :class="{
                    'el-icon-arrow-down': !item.slideflag,
                    'el-icon-arrow-up': item.slideflag,
                  }"
                  @click="collapseFn(item, idx)"
                ></i>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "assetsTableCollapse",
  props: ["dataList"],
  data() {
    return {
      lists: [],
    };
  },
  methods: {
    formatData() {
      this.lists = JSON.parse(JSON.stringify(this.dataList));
      this.lists.forEach((item) => {
        if (item.dataList.length) {
          item.dataList.forEach((im) => {
            if (im.children && im.children.length > 4) {
              im.slideflag = false;
            }
          });
        }
      });
    },
    collapseFn(row) {
      row.slideflag = !row.slideflag;
      this.$set(this.lists, 0, this.lists[0]);
    },
    /**
     * 点击跳转到对应的页面- 并携带参数
     * pathname - 跳转页面名称
     * keyname - 需要查询的条件的属性名
     * keyvalue - 需要查询的条件的属性值
     */
    clickHandle(pathname, keyname, keyvalue) {
      let obj = { pathname, keyname, keyvalue };
      this.$emit("handleClick", obj);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.formatData();
    });
  },
};
</script>

<style lang="scss" scoped>
.panel-box {
  // border-radius: 8px;
  margin-bottom: 10px;
  .divider {
    border-right: #eee 1px solid;
    height: 15px;
    margin: 0 10px;
  }
  .title-box {
    padding: 8px 15px;
    border-left: #5a62b3 3px solid;
    border-bottom: #eee 1px solid;
  }
  .show-table {
    .table-row {
      padding: 15px 35px 0;
      border-bottom: 1px dashed lightgray;
      .table-detail-row {
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-flow: row wrap;
        .row-item {
          width: 25%;
          margin-bottom: 14px;
        }
        .icon {
          position: absolute;
          right: -20px;
          top: 0;
          cursor: pointer;
        }
      }
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
.max-width-80 {
  max-width: 80%;
}
</style>
