import ellipsis from "./ellipsis";

const directives = {
  ellipsis,
};

const install = function (app) {
  Object.keys(directives).forEach((key) => {
    app.directive(key, directives[key]);
  });
};

export default {
  install,
};
