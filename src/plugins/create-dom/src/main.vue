<script>
export default {
  name: "CreateDom",
  functional: true,
  props: {
    row: Object,
    render: Function,
    index: Number,
    column: {
      type: Object,
      default: null,
    },
  },
  render: (h, ctx) => {
    const arr = [];
    // const params = {
    //     row: ctx.props.row,
    //     index: ctx.props.index
    // };
    // const VNode = ctx.props.render(h, params);
    const VNode = ctx.props.render(ctx.props.row);
    arr.push(VNode);
    return h("div", arr, "");
  },
};
</script>
