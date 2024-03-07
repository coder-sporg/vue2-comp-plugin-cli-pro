import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

// 引入iconfont
import "./assets/fonts/iconfont.css";
import "./assets/fonts/iconfont";

import "@/assets/css/common.css";
import plugins from "./plugins";

import directives from "./directives";

import Message from "./plugins/custom-message";

ElementUI.Dialog.props.closeOnClickModal.default = false;
ElementUI.Dialog.props.closeOnPressEscape.default = false;
ElementUI.MessageBox.setDefaults({
  closeOnClickModal: false,
  closeOnPressEscape: false,
});

Vue.use(ElementUI, {
  size: "small",
});
Vue.use(plugins);
Vue.use(directives);

Vue.prototype.$customMessage = Message;

Vue.config.productionTip = false;

console.log("env", process.env);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
