<template>
  <div class="about fl-cen-cen">
    <tree-card />
  </div>
</template>
<script>
import TreeCard from "./components/tree-card.vue";
export default {
  name: "AboutView",
  components: {
    TreeCard,
  },
};
</script>
<style lang="scss" scoped>
.about {
  background-color: #fff;
  color: #3a424f;
}
</style>
