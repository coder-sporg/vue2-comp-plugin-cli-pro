<template>
  <el-menu
    ref="elMenu"
    :default-active="$store.state.activeRouteData.right_url || 'Dashboard'"
    :unique-opened="true"
    :collapse-transition="false"
    :collapse="$store.state.isCollapse"
    text-color="#fff"
    active-text-color="#fff"
    :class="$store.state.isCollapse ? 'width-68' : 'width-180'"
  >
    <div
      class="logo fl-cen-cen"
      :class="$store.state.isCollapse ? 'width-68' : 'width-168'"
    >
      <img :class="logoSet.class" :src="logoSet.src" alt="" @click="goHome" />
      <img
        src="@/assets/imgs/dataSecurity/round-img.png"
        alt=""
        class="round-img"
      />

      <i
        class="niconfont nicon-sq f-t-16 mr-r-10 cursor"
        :class="{
          'collapse-icon-transform': $store.state.isCollapse,
          'collapse-icon': !$store.state.isCollapse,
        }"
        @click="$store.state.isCollapse = !$store.state.isCollapse"
      ></i>
    </div>
    <el-scrollbar style="height: calc(100vh - 56px); padding-top: 16px">
      <div v-for="(item, index) in $store.state.SidebarMenuObj" :key="index">
        <div
          class="divider"
          v-if="
            index > 0 &&
            index < 3 &&
            $store.state.SidebarMenuObj[index - 1].length
          "
        ></div>
        <SubMenu
          v-for="menu in item"
          :key="menu.name"
          :menu="menu"
          :curMenu="curMenu"
        />
      </div>
    </el-scrollbar>
  </el-menu>
</template>

<script>
import SubMenu from "./main-sidebar-sub-menu.vue";
import { mapActions, mapMutations } from "vuex";

export default {
  components: {
    SubMenu,
  },
  data() {
    return {
      curMenu: "Dashboard",
      logoSet: {
        src: require("../../assets/imgs/logo-normal.svg"),
        class: "logo-normal",
      },
    };
  },
  watch: {
    "$store.state.isCollapse": {
      handler(newVal) {
        let className, src;
        if (newVal) {
          src = require("../../assets/imgs/logo-shrink.svg");
          className = "logo-shrink";
        } else {
          src = require("../../assets/imgs/logo-normal.svg");
          className = "logo-normal";
        }
        this.logoSet = {
          src: src,
          class: className,
        };
      },
    },
  },
  methods: {
    ...mapActions(["initMenuList"]),
    ...mapMutations(["setPageTab", "setActiveTab"]),

    /** 侧边栏选择 */
    async selectMenu(name) {
      if (!this.$store.state.SidebarMenuList.length) {
        await this.initMenuList();
      }
      this.curMenu = this.$route.path.split("/")[1];
      let menuList = JSON.parse(
        JSON.stringify(this.$store.state.SidebarMenuList)
      );
      // 查找激活的二级路由
      let currNav = this.loopFindNav(name, menuList);
      this.setPageTab(currNav);
      let activeTab = "";
      if (currNav.sub_permission && currNav.sub_permission.length) {
        let item = currNav.sub_permission.find((ele) =>
          this.$route.path.includes(ele.right_url)
        );
        activeTab = item.right_url;
      }
      this.setActiveTab(activeTab);
    },

    /** 递归查找当前点击菜单（侧边栏） */
    loopFindNav(name, list) {
      if (list && list.length) {
        for (let i = 0, len = list.length; i < len; i++) {
          if (list[i].right_url == name && list[i].right_type != 0) {
            return list[i];
          } else {
            if (list[i].sub_permission && list[i].sub_permission.length) {
              let res = this.loopFindNav(name, list[i].sub_permission);
              if (res) return res;
            }
          }
        }
      }
    },

    goHome() {
      let home =
        this.$store.state.SidebarMenuList[0].sub_permission[0].right_url;
      this.$router.push({ name: home });
    },

    /** 点击menu切换菜单，某些模块表单保存提示保存阻止跳转， 导致el-menu高亮项不匹配 */
    changeMenu(menu) {
      this.$nextTick(() => {
        this.$refs.elMenu.activeIndex = menu;
      });
    },
  },
  beforeDestroy() {
    this.$EventBus.$off("changeMenu", this.changeMenu);
  },
  mounted() {
    this.$EventBus.$on("changeMenu", this.changeMenu);
  },
};
</script>

<style lang="scss">
.el-menu {
  background: #111d3e;
}

// 菜单收缩时隐藏箭头
.el-menu--collapse .el-submenu__icon-arrow {
  display: none;
}

// 有二级菜单折叠时弹框样式
.el-menu--popup {
  padding-left: 0;
  .el-menu-item {
    position: relative;
    height: 40px;
    line-height: 40px;
    padding-left: 40px !important;
    margin-left: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    span {
      font-size: 12px;
    }
    &::before {
      content: " ";
      position: absolute;
      left: 18px;
      top: 20px;
      display: inline-block;
      height: 4px;
      width: 4px;
      border-radius: 50%;
      background: #fff;
    }
  }
  .el-menu-item:nth-of-type(1) {
    border-left: none;
  }
  .el-menu-item.is-active {
    background: rgba(195, 207, 229, 0.35);
  }
}

// 没有二级菜单折叠时弹框样式
.el-tooltip__popper {
  .popup-nav-flow {
    width: auto;
    margin-left: 0;
    font-size: 12px;
  }
}
</style>
<style lang="scss" scoped>
.round-img {
  width: 12px;
  height: 56px;
  position: absolute;
  right: 0;
  top: 0;
  background: #f8fafe;
}
.logo {
  height: 56px;
  // background: #4f5b78;
  i {
    cursor: pointer;
  }
  .logo-shrink {
    height: 34px;
    width: 34px;
    position: relative;
    left: -3px;
  }
  .logo-normal {
    width: 100px;
    height: 34px;
    margin-left: -10px;
  }
  & > div {
    margin-left: -10px;
  }
}

.width-68 {
  width: 53px;
}
.width-168 {
  width: calc(100% - 12px);
}
.width-80 {
  width: 65px;
}
.width-180 {
  width: 180px;
}
.divider {
  width: 80%;
  border: 1px solid rgba(195, 207, 229, 0.35);
  margin: 10px auto;
}
.collapse-icon {
  color: #5682f7;
  position: absolute;
  left: 97%;
  z-index: 1000;
}
.collapse-icon-transform {
  color: #5682f7;
  position: absolute;
  left: 90%;
  z-index: 1000;
  transform: rotate(180deg);
}

// 菜单样式
::v-deep {
  .el-menu-item {
    position: relative;
    height: 40px;
    min-width: auto;
    margin-left: 0;
    line-height: 40px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);

    &.menu-left-disc::before {
      content: " ";
      position: absolute;
      left: 22px;
      top: 18px;
      display: inline-block;
      height: 4px;
      width: 4px;
      border-radius: 50%;
      background: #fff;
    }
    &.is-active {
      height: 40px;
      border-left: none;
      background: rgba(195, 207, 229, 0.35);
      .nav-text {
        font-weight: 600;
      }
    }
    &:hover {
      background: rgba(195, 207, 229, 0.15);
    }
  }
  .el-submenu__title:hover {
    background: rgba(195, 207, 229, 0.15);
  }
  // 二级菜单样式
  .el-submenu {
    .el-menu-item {
      padding-left: 54px !important;
      span {
        font-size: 12px;
      }
    }
    &.is-active {
      background: #000d2f;
      .el-menu {
        background: #000d2f;
      }
      .nav-text {
        font-weight: 600;
      }
      .nav-text,
      .nav-icon {
        color: #fff;
      }
      .el-submenu__title .el-submenu__icon-arrow {
        color: #fff;
      }
    }
  }
}
</style>
