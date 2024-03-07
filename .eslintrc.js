module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2020,
    sourceType: "module", // 启用 ES6 模块语法
    // 解决创建项目报错：Parsing error
    requireConfigFile: false,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/no-v-for-template-key": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-unused-vars": "off",
    "vue/require-v-for-key": "off",
    "vue/require-prop-type-constructor": "off",
    "vue/no-mutating-props": "off",
    "vue/require-valid-default-prop": "off",
    "vue/no-unused-components": "off",
    "vue/valid-v-for": "off",
    "vue/no-dupe-keys": "off",
    "no-prototype-builtins": "off",
    "no-unused-vars": "off",
    "no-undef": "off",
  },
};
