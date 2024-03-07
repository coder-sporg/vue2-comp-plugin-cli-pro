<template>
  <div>
    <el-menu-item
      v-if="menu.singleFlag"
      :index="menu.sub_permission[0].right_url"
      @click="gotoRouteHandle(menu.sub_permission[0].right_url)"
    >
      <svg class="niconfont nav-icon" aria-hidden="true">
        <use
          :xlink:href="`#${
            menu.right_url === curMenu ? menu.icon + 'H' : menu.icon
          }`"
        ></use>
      </svg>
      <span slot="title" class="nav-text mr-l-15 nav-flow popup-nav-flow">{{
        $t(menu.title)
      }}</span>
    </el-menu-item>
    <el-submenu :index="menu.right_url" v-else>
      <template v-if="menu.right_type === 1" slot="title">
        <svg class="niconfont nav-icon" aria-hidden="true">
          <use
            :xlink:href="`#${
              menu.right_url === curMenu ? menu.icon + 'H' : menu.icon
            }`"
          ></use>
        </svg>
        <span
          slot="title"
          class="nav-text mr-l-15 nav-flow"
          v-if="!$store.state.isCollapse"
        >
          {{ $t(menu.title) }}
        </span>
      </template>
      <el-menu-item
        v-for="childMenu in menu.sub_permission"
        :key="childMenu.right_url"
        :index="childMenu.right_url"
        class="menu-left-disc"
        @click="gotoRouteHandle(childMenu.right_url)"
      >
        <span slot="title">{{ $t(childMenu.title) }}</span>
      </el-menu-item>
    </el-submenu>
  </div>
</template>

<script>
import SubMenu from "@/components/common/main-sidebar-sub-menu.vue";

export default {
  name: "SubMenu",
  props: {
    menu: {
      type: Object,
      require: true,
    },
    curMenu: {
      type: String,
      default: "",
    },
  },
  components: {
    SubMenu,
  },
  methods: {
    gotoRouteHandle(right_url) {
      if (right_url === "ComponentManage") {
        sessionStorage.setItem("gatewayActive", "WebGatewayAcount");
      }
      this.$router.push({ name: right_url });
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-flow {
  display: inline-block;
  width: calc(100% - 30px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
}
.nav-icon {
  height: 20px;
  width: 20px;
  position: relative;
  left: -5px;
}
.popup-nav-flow {
  width: auto;
}
</style>
