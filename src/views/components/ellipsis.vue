<template>
  <div class="parent">
    <h3>标题</h3>
    <div class="child" v-ellipsis>
      {{ msg }}
    </div>
    <div class="child" v-ellipsis="3">
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: "好雨知时节，当春乃发生。随风潜入夜，润物细无声。野径云俱黑，江船火独明。晓看红湿处，花重锦官城。",
    };
  },
};
</script>

<style>
.parent {
  display: flex;
  align-items: center;
  width: 400px;
  font-size: 12px;
  border: 1px solid #aaa;
}
h3 {
  margin-right: 4px;
  white-space: nowrap;
}
</style>
