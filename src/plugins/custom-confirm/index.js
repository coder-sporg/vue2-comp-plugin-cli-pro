import CustomConfirm from "./src/main.vue";
import Vue from "vue";

(function () {
  Vue.prototype.$customConfirm = (message, title, options) => {
    let div = document.getElementById("custom-confirm");
    if (!div) {
      div = document.createElement("div");
      document.body.appendChild(div);
      div.id = "custom-confirm";
    }
    const TipConstructor = Vue.extend(CustomConfirm);
    const p = new Promise((resolve, reject) => {
      const instance = new TipConstructor({
        propsData: {
          title,
          message,
          options,
          resolveFn: resolve,
          rejectFn: reject,
        },
      });
      instance.$mount(div);
    });
    return p;
  };
})();
