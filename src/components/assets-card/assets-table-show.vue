<template>
  <div>
    <div class="panel-box" v-for="data in dataList" :key="data.name">
      <div class="title-box fl-sta-cen">
        <div class="fl-sta-cen row-item">
          <div>{{ data.title }}</div>
          <div class="m-r-l-10">{{ data.total }}</div>
        </div>
        <template v-if="data.siblings && data.siblings.length">
          <div
            v-for="item in data.siblings"
            :key="item.name"
            class="fl-sta-cen row-item mr-l-10"
          >
            <div>{{ data.title }}</div>
            <div class="m-r-l-10">{{ item.total }}</div>
          </div>
        </template>
      </div>
      <div class="show-table">
        <template v-if="data.dataList && data.dataList.length">
          <div
            v-for="item in data.dataList"
            :key="item.name"
            class="table-row flex"
          >
            <div class="fl-sta-cen row-item">
              <div>{{ item.name }}</div>
              <div class="mr-l-10" v-if="!item.children.length">
                <a
                  href="javascript: void(0);"
                  @click="clickHandle(data.key, item.key, item.value)"
                  >{{ item.value }}</a
                >
              </div>
            </div>
            <div
              v-for="ele in item.children"
              :key="ele.name"
              class="fl-sta-cen row-item"
            >
              <div>{{ ele.title || ele.name }}</div>
              <div class="mr-l-10">
                <a
                  href="javascript: void(0);"
                  @click="clickHandle(data.key, item.key, ele.key)"
                  >{{ ele.total !== undefined ? ele.total : ele.value }}</a
                >
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="data.children && data.children.length">
          <div
            v-for="item in data.children"
            :key="item.name"
            class="table-row flex"
          >
            <div v-if="childName" class="fl-sta-cen row-item">
              <div>{{ childName }}</div>
            </div>
            <template v-for="ele in Object.keys(item)">
              <template v-for="num in item[ele]">
                <div class="fl-sta-cen row-item" :key="num.title">
                  <div>{{ num.title }}</div>
                  <!-- 跳转OTP令牌 - 需要额外携带 令牌类型 参数 -->
                  <div
                    class="mr-l-10"
                    v-if="data.key == 'otpToken' && ele !== 'tokenType'"
                  >
                    <a
                      href="javascript: void(0);"
                      @click="
                        clickHandle(data.key, ele, num.key, item['tokenType'])
                      "
                      >{{ num.total }}</a
                    >
                  </div>
                  <div class="mr-l-10" v-else>
                    <a
                      href="javascript: void(0);"
                      @click="clickHandle(data.key, ele, num.key)"
                      >{{ num.total }}</a
                    >
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "assetsTableShow",
  props: ["dataList", "childName"],
  methods: {
    /**
     * 点击事件
     * @param { path } 跳转的页面路径
     * @param { key } 页面应该查询的参数名
     * @param { value } 页面应该查询的参数值
     */
    clickHandle(path, key, value, tokenType = undefined) {
      /** path可能为 string 或者 array，如果无length属性，则不需要跳转 */
      if (path.length) {
        /** 页面路由 */
        let route = Array.isArray(path) ? path[0] : path;
        /** 页面tab */
        let tab = Array.isArray(path) ? path[1] : "";
        let { href } = this.$router.resolve(route);
        let params;
        if (tokenType == undefined) {
          params = { tab, key, value };
        } else {
          params = { tab, key, value, tokenType };
        }
        sessionStorage.setItem("jumpParams", JSON.stringify(params));
        window.open(href, "CAZTP", "noopener=yes,noreferrer=yes");
      }
    },
  },
  mounted() {
    // console.log(this.dataList)
  },
};
</script>

<style lang="scss" scoped>
.panel-box {
  margin-bottom: 15px;
  background-color: #f5f5f5;
}
.title-box {
  padding: 10px 20px;
  border-left: #5a62b3 3px solid;
  border-bottom: #fff 1px solid;
}
.table-row {
  padding: 18px 40px;
  line-height: 1;
}
.row-item {
  width: 14%;
}
a {
  color: #5a62b3;
}
</style>
