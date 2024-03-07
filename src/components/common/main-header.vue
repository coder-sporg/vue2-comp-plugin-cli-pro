<template>
  <div
    class="full-width"
    v-show="!$store.state.bredcrumbVisible"
    id="main-header"
  >
    <!-- <el-header class="header-cont full-width" :class="{'calc-53':$store.state.isCollapse && !isFullScreen,'calc-180':!$store.state.isCollapse && !isFullScreen}"> -->
    <el-header class="header-cont full-width">
      <div class="header fl-bet-cen">
        <div class="fl-sta-cen tab-list">
          <!-- 数据分析全屏时显示logoo -->
          <img
            v-if="isFullScreen"
            class="logo mr-r-20"
            src="~@/assets/imgs/logo-white-bg.svg"
            alt=""
            @click="goHome"
          />
          <!-- <div v-else>
                        <i
                            class="niconfont nicon-sq f-t-16 mr-r-10 cursor" :class="{'collapse-icon-transform':$store.state.isCollapse,'collapse-icon':!$store.state.isCollapse}"
                            @click="$store.state.isCollapse = !$store.state.isCollapse"
                        ></i>
                    </div> -->

          <template v-if="isFullScreen">
            <span
              v-for="(item, index) in tabmenu"
              :key="item.right_url"
              class="tab-item tab-click f-t-14"
              :class="currentIndex === index ? 'active' : ''"
              style="line-height: 54px; padding-bottom: 0"
              @click="tabChange(item.right_url, index)"
              :title="$t(item.title)"
            >
              {{ $t(item.title) }}
            </span>
          </template>
          <template v-else>
            <div style="line-height: 56px">
              <template
                v-if="
                  $store.state.activeRouteData.parent_nav &&
                  $store.state.activeRouteData.parent_nav.singleFlag
                "
              >
                <span
                  class="single-tab-item tab-click active"
                  :class="
                    $store.state.activeTabnav ==
                    $store.state.activeRouteData.right_url
                      ? 'active'
                      : ''
                  "
                  @click="tabChange($store.state.activeRouteData.right_url)"
                  :title="$t($store.state.activeRouteData.title)"
                >
                  {{ $t($store.state.activeRouteData.title) }}
                </span>
              </template>

              <template
                v-else-if="
                  $store.state.activeRouteData.parent_nav &&
                  !$store.state.activeRouteData.parent_nav.singleFlag
                "
              >
                <template>
                  <div class="flex" style="padding-left: 15px">
                    <span class="f-t-16" style="color: #8a9099">
                      {{ $t($store.state.activeRouteData.parent_nav.title) }}
                    </span>
                    <span class="f-t-16 mr-l-8 mr-r-8" style="color: #8a9099"
                      >/</span
                    >
                    <span class="f-t-16" style="color: #111d3e">
                      {{ $t($store.state.activeRouteData.title) }}
                    </span>
                  </div>
                </template>
                <div
                  v-show="
                    $store.state.activeRouteData.sub_permission &&
                    $store.state.activeRouteData.sub_permission.length
                  "
                  style="height: 26px; line-height: 16px"
                >
                  <template
                    v-for="item in $store.state.activeRouteData.sub_permission"
                  >
                    <span
                      :key="item.right_url"
                      class="tab-item tab-click"
                      :class="
                        $store.state.activeTabnav == item.right_url
                          ? 'active'
                          : ''
                      "
                      @click="tabChange(item.right_url)"
                      :title="$t(item.title)"
                    >
                      {{ $t(item.title) }}
                    </span>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>
        <div class="fl-sta-cen user-info">
          <div
            class="alarm-prompt fl-cen-cen mr-r-16"
            @click="showAlarmPrompt"
            ref="alarmref"
          >
            <div class="cursor language-div common-hover-status">
              <svg
                class="nicon cursor"
                aria-hidden="true"
                style="width: 32px; height: 32px"
              >
                <use xlink:href="#nicon-xx1"></use>
              </svg>
              <span
                :class="[
                  promptNumber > 9
                    ? promptNumber > 99
                      ? 'alarm-more'
                      : 'alarm-radius'
                    : 'alarm-circle',
                ]"
                v-if="promptNumber > 0"
              >
                {{ getPromptNumber }}
              </span>
            </div>
          </div>
          <!-- <CollapseTransition> -->
          <transition name="alarmtransion">
            <div
              class="alarm-wrapper"
              ref="alarms"
              :class="{
                'hide-alarm-list': !flag,
                'alarm-haslist': !alarmList.length,
              }"
              v-show="flag"
            >
              <ul class="alarm-list" v-if="alarmList.length">
                <li
                  class="alarm-item flex fl-col"
                  v-for="(item, index) in alarmList"
                  :key="index + 'alarm'"
                >
                  <span class="alarm-title">{{ item.ruleMessage }}</span>
                  <span
                    class="alarm-description"
                    v-for="(rule, ruleIndex) in item.realMessage"
                    :key="ruleIndex"
                  >
                    {{ rule }}
                  </span>
                  <span class="alarm-tag" :class="getTagType(item.tag)">{{
                    item.tag
                  }}</span>
                </li>
              </ul>
              <div class="empty-alarmlist fl-cen-cen" v-else>暂无消息</div>
            </div>
          </transition>
          <!-- </CollapseTransition> -->

          <el-popover placement="bottom" trigger="hover">
            <ul class="user-opt">
              <!-- <li>{{ $t('common.change_pwd') }}</li> -->
              <li @click="changeLang('zh-CN')">中</li>
              <li @click="changeLang('en-US')">EN</li>
            </ul>
            <div
              slot="reference"
              class="cursor mr-r-16 language-div common-hover-status"
            >
              <svg
                class="nicon cursor"
                aria-hidden="true"
                style="
                  width: 28px;
                  height: 28px;
                  position: relative;
                  top: 2px;
                  display: inline-block;
                "
              >
                <use xlink:href="#nicon-yyqh1"></use>
              </svg>
            </div>
          </el-popover>
          <el-popover placement="bottom" trigger="hover">
            <ul class="user-opt">
              <!-- <li>{{ $t('common.change_pwd') }}</li> -->
              <li @click="showVersionHandle">{{ $t("common.version") }}</li>
              <li @click="logoutHandle">{{ $t("common.logout_btn") }}</li>
            </ul>
            <!-- <div slot="reference" class="cursor fl-sta-cen hover-bg">
                            <img src="../../assets/imgs/avatar.png" alt="" class="user-avatar" />
                            <span class="f-t-16 mr-l-10" style="white-space: nowrap">{{ userName }}</span>
                        </div> -->
            <div slot="reference" class="cursor name-text common-hover-status">
              {{ userName.slice(0, 1).toUpperCase() }}
            </div>
          </el-popover>
        </div>
      </div>
    </el-header>
    <!-- 显示切换主题 -->
    <!-- <el-dialog
            title="切换主题"
            :visible.sync="switchVisible"
            width="30%"
            :close-on-click-modal="true"
            custom-class="themeWrap"
        >
            <div class="fl-cen-cen themeDialog">
                <div
                    class="themeItem fl-cen-cen fl-col"
                    v-for="theme in themeList"
                    :key="theme.name"
                    @click="switchTheme(theme)"
                >
                    <div class="colorBox">
                        <img :src="theme.bgIcon" alt="" v-if="theme.name === '炫彩蓝'" />
                        <span :style="{ background: '#' + theme.bgColor }" v-else></span>
                        <img
                            class="theme-checked"
                            src="~@/assets/imgs/theme-checked.png"
                            v-if="theme.bgColor === currentTheme"
                            alt=""
                        />
                    </div>
                    <span class="textBox">{{ theme.name }}</span>
                </div>
            </div>
        </el-dialog> -->
    <!-- 显示版本 -->
    <el-dialog
      :title="$t('common.version')"
      :visible.sync="showVersion"
      width="30%"
      :close-on-click-modal="true"
      custom-class="versionWrap"
    >
      <div class="fl-cen-cen fl-col">
        <span class="version">v{{ versionJSON.version }}</span>
        <span class="compileTime"
          >{{ $t("common.version_time_tip")
          }}{{ versionJSON.compileTime }}</span
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import Cookies from "js-cookie";
import { mapMutations } from "vuex";
import versionJSON from "@/utils/version.json";
import CollapseTransition from "@/utils/collapse-transition";

import { logoutApi } from "@/api/system.api.js";
import { alarmMessageListApi } from "@/api/component.api.js";

import bgIcon from "@/assets/imgs/bgColor.png";

export default {
  components: {
    CollapseTransition,
  },
  data() {
    return {
      userName: "user",
      isCh: true,
      switchVisible: false,
      currentIndex: 0,
      showVersion: false,
      flag: false,
      currentTheme: this.$store.state.elementuiTheme,
      isFullScreen: this.$store.state.isFullScreen,
      themeList: [
        { name: "幻影黑", bgColor: "242832", bgIcon: "" },
        { name: "冰川白", bgColor: "FFFFFF", bgIcon: "" },
        { name: "炫彩蓝", bgColor: "2994FF", bgIcon: bgIcon },
      ],
      versionJSON: {},
      tabmenu: [],
      promptNumber: 0,
      alarmList: [],
    };
  },
  computed: {
    getPromptNumber() {
      return this.promptNumber > 99 ? "99＋" : this.promptNumber;
    },
    getTagType() {
      return (tag) => {
        var tagClass = null;
        switch (tag) {
          case "服务异常":
            tagClass = "tag-error";
            break;
          case "即将停用":
            tagClass = "tag-error";
            break;
          case "资源不足":
            tagClass = "tag-error";
            break;
          case "即将超限":
            tagClass = "tag-warning";
            break;
          case "即将到期":
            tagClass = "tag-warning";
            break;
        }
        return tagClass;
      };
    },
  },
  methods: {
    ...mapMutations(["setMenuList", "setActiveTab"]),
    tabChange(name, index) {
      this.currentIndex = index;
      this.$router.push({ name });
    },
    /** 切换中英文 */
    changeLang(name) {
      localStorage.setItem("lang", name);
      location.reload();
    },
    /** 退出登录 */
    logoutHandle() {
      logoutApi().then((res) => {
        Cookies.remove("ztpssession");
        Cookies.remove("ztpmsuser");
        this.setMenuList([]);
        this.$router.replace("/login");
      });
    },
    /** 展示主题色 */
    showSwitchTheme() {
      this.switchVisible = true;
    },
    /** 展示主题 */
    showVersionHandle() {
      this.showVersion = true;
    },
    /** 切换主题 */
    switchTheme(theme) {
      let href = `/static/css/${theme.bgColor}/theme/index.css`;
      let elementuiStyle = `/static/css/${theme.bgColor}/theme/elementui.css`;
      localStorage.setItem("themeStyle", href);
      localStorage.setItem("elementuiStyle", elementuiStyle);
      localStorage.setItem("theme", theme.bgColor);
      document.getElementById("themeLinkId").href = href;
      document.getElementById("elementuiLinkId").href = elementuiStyle;
      this.$store.commit("switchTheme", theme.bgColor);
    },
    goHome() {
      if (this.$route.path.includes("/DataSecurity/AnalysisTraceability")) {
        this.$router.push({ name: "LogAnalysis" });
      } else {
        this.$router.push({ name: "SecPosture" });
      }
    },
    showAlarmPrompt() {
      if (this.flag) {
        this.flag = false;
        return;
      }
      this.flag = !this.flag;
      this.$nextTick(() => {
        this.$refs.alarms.scrollTop = 0;
      });
    },
    getAlarmList() {
      alarmMessageListApi().then((res) => {
        if (res && res.data) {
          this.alarmList = res.data.message;
          this.promptNumber = this.alarmList.length;
        }
      });
    },
    clickHidden(event) {
      let alarmRef = this.$refs.alarmref;
      let hasClass =
        typeof event.target.className === "string" &&
        event.target.className !== "alarm-list" &&
        event.target.className !== "alarm-title" &&
        event.target.className !== "alarm-description" &&
        event.target.className.indexOf("alarm-item") < 0 &&
        event.target.className.indexOf("alarm-tag") < 0 &&
        event.target.className.indexOf("empty-alarmlist") < 0;
      if (alarmRef && !alarmRef.contains(event.target) && hasClass) {
        this.flag = false;
      }
    },
    computedHeight() {
      const height = document
        .getElementById("main-header")
        .getBoundingClientRect().height;
      const bredcrumbVisible = this.$store.state.bredcrumbVisible;
      document.getElementById("main-content").style.height = bredcrumbVisible
        ? "100vh"
        : `calc(100vh - ${height}px)`;
    },
  },
  mounted() {
    let lang = localStorage.getItem("lang") || "zh-CN";
    this.$i18n.locale = lang;
    this.isCh = lang == "zh-CN";
    this.userName = Cookies.get("ztpmsuser");
    this.versionJSON = {
      compileTime: moment(versionJSON.compileTime).format(
        "YYYY/MM/DD HH:mm:ss"
      ),
      version: versionJSON.version,
    };
    this.getAlarmList();
    document.addEventListener("click", this.clickHidden);
  },
  destroyed() {
    document.removeEventListener("click", this.clickHidden);
  },
  watch: {
    $route: {
      handler(val) {
        this.getAlarmList();
        setTimeout(() => {
          this.computedHeight();
        }, 0);
      },
    },
    "$store.state.elementuiTheme": {
      handler(newVal) {
        this.currentTheme = newVal;
      },
    },
    "$store.state.isFullScreen": {
      handler(newVal) {
        this.isFullScreen = newVal;
      },
    },
    "$store.state.activeRouteData": {
      handler: function (newVal, oldVal) {
        console.log(newVal, 666);
        // 安全分析日志全屏
        if (this.isFullScreen) {
          if (newVal.sub_permission) {
            let routeName = this.$route.name;
            // 主机代理菜单，顺序不许变，与菜单高亮相关
            let hostAgentTabList = [
              "HostConRetrieval",
              "SessionLog",
              "CommandLog",
              "FileLog",
              "HostRecord",
            ];
            //三级菜单有sub_permission的集合
            let arr = newVal.sub_permission.filter(
              (item) => item.sub_permission && item.sub_permission.length
            );
            //四级菜单相关路由的集合
            let arr2;
            newVal.sub_permission.forEach((item) => {
              if (item.sub_permission && item.sub_permission.length) {
                arr2 = item.sub_permission;
              }
            });
            //没有sub_permission的集合
            let arr4 = newVal.sub_permission.filter(
              (item) => !item.sub_permission || item.sub_permission == 0
            );
            if (arr) {
              arr.forEach((ele) => {
                if (
                  this.$route.path.includes(
                    "/DataSecurity/AnalysisTraceability"
                  )
                ) {
                  //数据安全二期-日志分析-特殊处理
                  ele.sub_permission.forEach((item2) => {
                    if (item2.right_url == routeName) {
                      this.tabmenu = [];
                      this.tabmenu.push(item2);
                    }
                  });
                } else {
                  if (ele.right_url == routeName) {
                    this.tabmenu = [];
                    this.tabmenu.push(ele);
                  }
                }
                this.currentIndex = 0;
              });
            } else {
              newVal.sub_permission.forEach((item) => {
                if (item.right_url == routeName) {
                  this.tabmenu = [];
                  this.tabmenu.push(item);
                }
              });
              this.currentIndex = 0;
            }
            //四级菜单导航单独处理
            if (arr2) {
              if (hostAgentTabList.includes(routeName)) {
                //针对主机代理网关日志特殊处理
                this.tabmenu = arr2.filter(
                  (item) =>
                    !["HostRecordDetail", "HostRecord"].includes(item.right_url)
                );
                if (routeName === "HostRecord") {
                  this.currentIndex = 0;
                } else {
                  this.currentIndex = hostAgentTabList.indexOf(routeName);
                }
              } else if (routeName === "HostRecordDetail") {
                this.tabmenu = ele.sub_permission.filter(
                  (item) => item.right_url == "HostRecordDetail"
                );
                this.currentIndex = 0;
              } else {
                arr2.forEach((params) => {
                  if (params.right_url == routeName) {
                    this.tabmenu = [];
                    this.tabmenu.push(params);
                    this.currentIndex = 0;
                  }
                });
              }
            }
            if (arr4) {
              arr4.forEach((params) => {
                if (params.right_url == routeName) {
                  this.tabmenu = [];
                  this.tabmenu.push(params);
                  this.currentIndex = 0;
                }
              });
            }
          }
        }
      },
      // 深度观察监听
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.calc-180 {
  width: calc(100% - 180px);
}
.calc-53 {
  width: calc(100% - 53px);
}
.header-cont {
  padding-left: 0;
  // position: absolute;
  background: #f8fafe;
  box-shadow: none;
  border-bottom: 1px solid #e6eaf5;
}
.header {
  width: 100%;
  min-height: 56px;
  .logo {
    width: 100px;
    height: 34px;
  }
}
.user-info {
  position: relative;
}
.alarm-wrapper {
  width: 314px;
  margin-left: -130px;
  background: #fff;
  border-radius: 4px;
  position: absolute;
  top: 55px;
  box-shadow: 0px 2px 12px rgba(6, 23, 56, 0.08);
  opacity: 1;
  transition: all 0.5s;
}
.alarm-haslist {
  width: 200px;
  margin-left: -90px;
}
.alarm-list {
  width: 312px;
  max-height: 231px;
  padding: 0 24px;
  overflow: auto !important;
  padding-right: 22px;
  .alarm-item {
    position: relative;
    margin-top: 24px;
    span {
      display: inline-block;
    }
    &:last-child {
      margin-bottom: 24px;
    }
  }
  .alarm-title {
    margin-bottom: 4px;
    height: 20px;
    font-size: 14px;
    line-height: 20px;
    color: #1d2128;
  }
  .alarm-description {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: #888b91;
  }
  .alarm-tag {
    position: absolute;
    top: -4px;
    right: 0;
    width: 64px;
    height: 25px;
    line-height: 25px;
    font-size: 12px;
    text-align: center;
    border-radius: 2px;
  }
  .tag-error {
    color: #ed3138;
    background: #fff5f8;
    border: 1px solid #ffccce;
  }
  .tag-warning {
    color: #eb8015;
    background: #fff9f4;
    border: 1px solid #fcd5ae;
  }
}
.hide-alarm-list {
  opacity: 0;
  transition: all 0.5s;
}
.empty-alarmlist {
  // height: 231px;
  color: #888b91;
  // padding: 24px 0;
}
.alarm-prompt {
  position: relative;
  i {
    font-size: 24px;
    cursor: pointer;
  }
  span {
    display: inline-block;
    position: absolute;
    height: 16px;
    line-height: 16px;
    text-align: center;
    background: #fa353c;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
  }
  .alarm-circle {
    width: 16px;
    border-radius: 50%;
    top: 14px;
    right: -3px;
  }
  .alarm-more {
    top: 14px;
    right: -20px;
    padding: 0 4px;
    border-radius: 9px;
    padding-right: 2px;
  }

  .alarm-radius {
    width: 24px;
    border-radius: 9px;
    top: 14px;
    right: -10px;
  }
}
.tab-list {
  width: calc(100% - 270px);
  padding-left: 16px;
  .tab-item {
    padding: 0 10px;
    max-width: 20%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 0 5px;
    padding-bottom: 8px;
  }
  .tab-item.tab-click:hover {
    background-color: #f1f8ff;
    // color: #0581FE;
    color: var(--defaaultTabColor);
  }
  .tab-item.tab-click {
    cursor: pointer;
  }
  .tab-item.tab-click.active {
    color: var(--defaaultTabColor);
    border-bottom: var(--defaaultTabColor) 2px inset;
    // height: 61.6px;
    // line-height: 61.6px;
    font-weight: 600;
    font-family: PingFang SC-Semibold, PingFang SC;
  }

  .single-tab-item {
    padding: 0 10px;
    max-width: 20%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 30px 5px 0;
    padding-bottom: 15px;
  }
  .single-tab-item.tab-click:hover {
    background-color: #f1f8ff;
    // color: #0581FE;
    color: var(--defaaultTabColor);
  }
  .single-tab-item.tab-click {
    cursor: pointer;
  }
  .single-tab-item.tab-click.active {
    color: var(--defaaultTabColor);
    border-bottom: var(--defaaultTabColor) 2px inset;
    // height: 61.6px;
    // line-height: 61.6px;
    font-weight: 600;
    font-family: PingFang SC-Semibold, PingFang SC;
  }
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: block;
  border-radius: 50%;
}
.user-opt {
  li {
    padding: 10px 15px;
  }
  li:hover {
    cursor: pointer;
    background-color: #ecf5ff;
    color: var(--defaaultTabColor);
  }
}
.hover-bg {
  padding: 0 15px;
}
.hover-bg:hover {
  background-color: #f5f5f5;
}
.opacity {
  color: rgba(0, 0, 0, 0.5);
}
.themeWrap {
  .themeItem {
    margin-left: 56px;
    margin-bottom: 42px;
    cursor: pointer;
    .colorBox {
      height: 48px;
      width: 48px;
      padding: 4px;
      border: 1px solid #b6bac1;
      border-radius: 4px;
      position: relative;
      span,
      img {
        border-radius: 4px;
        height: 100%;
        width: 100%;
        display: block;
      }
      .theme-checked {
        height: 24px;
        width: 24px;
        position: absolute;
        bottom: -10px;
        right: -10px;
      }
    }
    .textBox {
      line-height: 32px;
    }
  }
  .themeItem:first-of-type {
    margin-left: 0;
  }
  .themeItem:nth-of-type(2) {
    .colorBox {
      span {
        border: 1px solid #b6bac1;
      }
    }
  }
}
.common-hover-status:hover {
  background: rgba(86, 130, 247, 0.1);
}
.common-hover-status:active {
  background: rgba(86, 130, 247, 0.3);
}
.name-text {
  width: 32px;
  height: 32px;
  background: rgba(86, 130, 247, 0.2);
  border-radius: 17px 17px 17px 17px;
  text-align: center;
  line-height: 32px;
  font-size: 16px;
  font-weight: 600;
  color: #5682f7;
}
.language-div {
  width: 32px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  border-radius: 17px 17px 17px 17px;
  background: rgba(86, 130, 247, 0.2);
}
</style>
<style lang="scss">
.versionWrap {
  .el-dialog__body {
    padding: 30px 0 80px;
  }
  .version {
    font-size: 24px;
    color: #434a57;
    line-height: 64px;
  }
  .compileTime {
    color: #888b91;
    margin-top: 15px;
  }
}
</style>
