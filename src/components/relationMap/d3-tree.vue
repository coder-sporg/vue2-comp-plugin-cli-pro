<template>
  <div class="full-height full-width">
    <!-- loading -->
    <div
      v-show="treeLoading"
      v-loading="treeLoading"
      class="full-width loading-box"
      element-loading-background="rgba(235,240,245, 0.4)"
    ></div>
    <div class="relationMap" :id="domId"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

/** 节点id */
let i = 1000000;

export default {
  name: "D3Tree",
  props: {
    domId: {
      type: String,
      default: "tree",
    },
    /** 根节点位置 */
    positionX: {
      type: Number,
      default: 0,
    },
    positionY: {
      type: Number,
      default: 0,
    },
    /** 节点渲染函数 */
    renderNodeFn: {
      type: Function,
      default: () => {},
    },
    /** 节点额外信息渲染函数 */
    renderNodeExtraInfoFn: {
      type: Function,
      default: () => {},
    },
    treeLoading: {
      type: Boolean,
      default: false,
    },
    /** 节点纵向距离 */
    nodeDx: {
      type: Number,
      default: 70,
    },
    /** 节点横向距离 */
    nodeDy: {
      type: Number,
      default: 180,
    },
  },
  data() {
    return {};
  },
  methods: {
    async createTree(data) {
      try {
        //(1) 配置树
        const source = await this.configTree(data);
        //(2) 更新布局
        this.renderTree(source);
      } catch (error) {
        console.log("error", error);
      }
    },
    /** 配置树 */
    configTree(data) {
      const self = this;

      let { domId, positionX } = this,
        width = document.getElementById(domId).offsetWidth,
        height = document.getElementById(domId).offsetHeight,
        root;

      // 设置节点距离
      this.tree = d3.layout.tree().nodeSize([this.nodeDx, this.nodeDy]);

      // 设置链接节点 连接线
      this.diagonal = d3.svg
        .diagonal()
        .source(function (d) {
          return { x: d.source.x, y: d.source.y + 100 };
        })
        .target(function (d) {
          return { x: d.target.x, y: d.target.y - 100 };
        })
        .projection(function (d) {
          return [d.y, d.x];
        });

      // 添加放大缩小事件
      let zoom = d3.behavior.zoom().scaleExtent([0.1, 100]).on("zoom", zoomed);

      this.svg = d3
        .select("body")
        .select(`#${domId}`)
        .html("")
        .append("svg")
        .call(zoom) //给svg绑定zoom事件
        .append("g")
        .attr("transform", `translate(${positionX}, ${height / 2})`);

      zoom.translate([positionX, height / 2]);

      function zoomed() {
        self.svg.attr(
          "transform",
          "translate(" +
            d3.event.translate +
            ")" +
            "scale(" +
            d3.event.scale +
            ")"
        );
      }

      // 设置根节点初始位置
      root = data;
      root.x0 = height / 2;
      root.y0 = 0;
      this.root = root;

      // 折叠函数，递归调用,有子孙的就把children（显示）给_children（不显示）暂存，便于折叠，
      // function collapse(d) {
      //     if (d.children) {
      //         d._children = d.children;
      //         d._children.forEach(collapse);
      //         d.children = null;
      //     }
      // }

      // 折叠根节点的每个孩子
      // root.children.forEach(collapse);

      return root;
    },
    /** 渲染树 */
    renderTree(source) {
      // (2-1) 计算新树的布局
      let duration = 750,
        nodes = this.tree.nodes(this.root).reverse(),
        links = this.tree.links(nodes);

      // (2-2) 树的深度这里树d.y。树的宽度最大720，要分四层，所以每层就乘180
      nodes.forEach((d) => {
        d.y = d.depth * 320; // 树的x,y倒置了，所以这里Y其实是横向的
      });

      // (2-3) 数据连接，根据id绑定数据
      let node = this.svg.selectAll("g.node").data(nodes, (d) => {
        return (
          //最初新点开的节点都没有id
          //为没有id的节点添加上ID
          d.id || (d.id = ++i)
        );
      });

      // (2-4) 渲染节点信息
      this.$emit("renderNodeFn", node, source);

      // (2-5) 原有节点更新到新位置
      let nodeUpdate = node
        .transition()
        .duration(duration)
        .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");

      nodeUpdate.select("text").style("fill-opacity", 1);

      // (2-6) 折叠节点的子节点收缩回来
      let nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr(
          "transform",
          (d) => "translate(" + source.y + "," + source.x + ")"
        )
        .remove();

      nodeExit.select("text").style("fill-opacity", 1);

      // (2-7) 数据连接，根据目标节点的id绑定数据
      let link = this.svg
        .selectAll("path.link")
        .data(links, (d) => d.target.id);

      // (2-8) 增加新连接
      link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", (d) => {
          let o = { x: source.x0, y: source.y0 };
          return this.diagonal({ source: o, target: o });
        });

      // (2-9) 原有连接更新位置
      link.transition().duration(duration).attr("d", this.diagonal);

      // (2-10) 折叠的链接，收缩到源节点处
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", (d) => {
          let o = { x: source.x, y: source.y };
          return this.diagonal({ source: o, target: o });
        })
        .remove();

      // 把旧位置存下来，用以过渡
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // 渲染节点额外信息
      this.$emit("renderNodeExtraInfoFn");
    },
    /** 树节点点击 */
    async nodeClickHandle(d, callback) {
      let _d = d;
      if (callback) {
        _d = await callback(d);
      }

      if (_d.children) {
        _d._children = _d.children;
        _d.children = [];
      } else {
        _d.children = _d._children;
        _d._children = null;
      }

      this.renderTree(_d);
    },
  },
};
</script>
<style lang="scss">
.relationMap {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  .node {
    cursor: pointer;
  }

  .node circle {
    fill: none;
    stroke: #fff;
    stroke-width: 1.5px;
  }

  .node rect {
    fill: #fff;
  }

  .node text {
    font: 14px;
  }

  .link {
    fill: none;
    stroke: #ccc;
    stroke-width: 1.5px;
  }

  .link {
    fill: none;
    stroke: #ccc;
    stroke-width: 1.5px;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
