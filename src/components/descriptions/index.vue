<template>
  <div style="width: auto">
    <ul style="width: auto">
      <template v-for="(item, index) in userInfo">
        <li :key="index" v-if="item.value" style="padding: 8px 0">
          <div v-if="Array.isArray(item.value)" style="display: flex">
            <div style="width: 90px; text-align: right">{{ item.label }}</div>
            :
            <div style="margin-left: 3px; max-width: 210px">
              <p v-for="(itemChild, index) in item.value" :key="index">
                {{ itemChild }}
              </p>
            </div>
          </div>
          <div v-else>
            <span>{{ item.label }}</span
            >:
            <span
              style="
                display: inline-block;
                max-width: 210px;
                word-wrap: break-word;
                vertical-align: top;
                color: #fe575d;
              "
              v-if="usernameDisabled(item)"
            >
              {{ item.value }}
            </span>
            <span
              style="
                display: inline-block;
                max-width: 210px;
                word-wrap: break-word;
                vertical-align: top;
              "
              v-else
              >{{ item.value }}</span
            >
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  name: "descriptions",
  props: {
    customData: {
      type: Array,
      default: () => [],
    },
    gobackData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    usernameDisabled() {
      return (val) => {
        return val.label === "账号状态" && val.value === "禁用";
      };
    },
  },
  data() {
    return {
      userInfo: [],
    };
  },
  methods: {
    getPropValue(data, prop) {
      const keys = prop.split(".");
      return keys.reduce((values, key) => {
        return values[key];
      }, data);
    },
    dataReconstrucTool(data, values) {
      return data.map(
        ({ label, value, enumMap, defaultValue, render } = {}) => {
          let text = this.getPropValue(values, value);
          if (enumMap) {
            text = enumMap[text];
          }
          if (render) {
            text = render(text, values);
          }
          return {
            label,
            value: text || defaultValue,
          };
        }
      );
    },
  },
  created() {
    this.userInfo = this.dataReconstrucTool(this.customData, this.gobackData);
  },
  watch: {
    gobackData: {
      handler(param) {
        this.userInfo = this.dataReconstrucTool(this.customData, param);
      },
      deep: true,
    },
  },
};
</script>
<style scoped lang="scss">
ul > li {
  div {
    span:nth-child(1) {
      width: 90px;
      display: inline-block;
      text-align: right;
    }
  }
}
</style>
