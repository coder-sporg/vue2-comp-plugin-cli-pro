<template>
  <div class="data-box fl-sta-cen fl-col">
    <div class="title">{{ data.title || "" }}</div>
    <div class="number fl-cen-cen">
      <div class="num-left" v-if="data.num_left !== 'undefined'">
        {{ data.num_left }}
      </div>
      <div class="num-split" v-if="data.num_left !== 'undefined'">/</div>
      <div class="num-right">{{ data.num_right }}</div>
    </div>
    <div class="divider"></div>
    <div class="info fl-cen-cen">
      <div
        v-for="item in data.infoList"
        :key="item.name"
        class="info-item flex"
      >
        <div class="info-name">{{ item.name }}</div>
        <div class="info-value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "card-data-show",
  data() {
    return {};
  },
  props: ["data"],
};
</script>

<style lang="scss" scoped>
.data-box {
  .title {
    color: #313131;
    font-size: 16px;
    margin-bottom: 22px;
  }
  .number {
    font-size: 40px;
    font-weight: bold;
    margin-bottom: 19px;
    .num-left {
      color: #5c5c5c;
    }
    .num-split {
      color: #d0d0d0;
      margin: 0 5px;
    }
    .num-right {
      color: #5a62b3;
    }
  }
  .divider {
    width: 180px;
    border: #eee 1px dotted;
    margin-bottom: 22px;
  }
  .info {
    .info-item {
      font-size: 12px;
      margin: 0 5px;
      .info-name {
        color: #313131;
      }
      .info-value {
        color: #5a62b3;
        margin-left: 3px;
      }
    }
  }
}
</style>
