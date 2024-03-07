import InputNumber from "./input-number/index.js";
import CreateDom from "./create-dom/index.js";
import Empty from "./empty/index.js";
import InputTag from "./input-tag/index.js";
import EllipsisTooltip from "./ellipsis-tooltip/index.js";
import "./custom-confirm/index.js";
import CustomDialog from "./custom-dialog/index.js";
import CustomButton from "./button/index.js";

const components = [
  InputNumber,
  CreateDom,
  Empty,
  InputTag,
  EllipsisTooltip,
  CustomDialog,
  CustomButton,
];

const install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

export default {
  install,
};
