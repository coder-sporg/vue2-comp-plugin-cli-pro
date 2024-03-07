<template>
  <div>
    <el-container>
      <Sidebar ref="mainnav" v-show="!isFullScreen" />
      <div class="fl-item fl-col ov-auto">
        <Header v-if="withHeader" />
        <Content />
      </div>
    </el-container>
  </div>
</template>

<script>
import Sidebar from "./main-sidebar.vue";
import Header from "./main-header.vue";
import Content from "./main-content.vue";
import { mapGetters, mapMutations } from "vuex";

export default {
  components: {
    Sidebar,
    Header,
    Content,
  },
  data() {
    return {
      /** 可视化页面全屏隐藏 Slidebar */
      isFullScreen: false,
      /** 应急响应日志详情隐藏 Header */
      withHeader: true,
    };
  },
  computed: {
    ...mapGetters(["getSetMenuList"]),
  },
  watch: {
    $route: "routeHandle",
    /** 页面刷新重新获取menuList */
    getSetMenuList(menuList) {
      if (this.$route.path === "/") {
        this.routeRedirect(menuList[0]);
      }
    },
  },
  methods: {
    ...mapMutations(["setActiveTab"]),
    /** 路由监听 */
    routeHandle(route) {
      if (route.path === "/" && this.$store.state.SidebarMenuList.length) {
        this.routeRedirect(this.$store.state.SidebarMenuList[0]);
      } else {
        this.withHeader = !(route.meta.withHeader === false);
        this.isFullScreen = route.meta.isFullScreen;
        this.$nextTick(() => {
          // 左侧菜单
          const sidebNav = route.path.split("/")[2];
          this.$refs.mainnav.selectMenu(sidebNav);
        });
      }
    },

    /** 根路径-路由跳转 */
    routeRedirect(menu) {
      if (menu.sub_permission[0] && menu.sub_permission[0].right_type == 2) {
        this.$router.push({ name: menu.sub_permission[0].right_url });
      } else {
        this.$router.push({ name: menu.right_url });
      }
    },

    /** 窗口缩放监听 */
    windowResize() {
      let that = this;
      window.onresize = function () {
        let width = document.body.clientWidth;
        if (width <= 1280) {
          that.$store.state.isCollapse = true;
        } else {
          that.$store.state.isCollapse = false;
        }
      };
    },
  },
  mounted() {
    this.routeHandle(this.$route);
    this.windowResize();
  },
};
</script>

<style lang="scss" scoped></style>
