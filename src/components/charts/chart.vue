<template>
  <div class="full-width fl-cen-cen">
    <div
      v-if="flag"
      :id="domId"
      :style="{ width: '100%', height: chartHeight + 'px' }"
    ></div>
    <div v-else class="no-chart-box">暂无相关图表数据</div>
  </div>
</template>
<script>
import * as echarts from "echarts";
import { BarChart, LineChart } from "echarts/charts";
import {
  ToolboxComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ChartConfig from "@/utils/chart";
echarts.use([
  ToolboxComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LineChart,
  LegendComponent,
]);
export default {
  props: {
    chartType: "",
    chartHeight: {
      type: Number,
      default: 240,
    },
    chartLeval: {
      type: Number,
      default: 1,
    },
    chartData: {
      type: Object,
      default() {
        return {};
      },
    },
    chartRef: {
      type: String,
      default: "",
    },
    chartOptions: {
      /** 一般是color等 */
      type: Object,
      default: () => ({}),
    },
    domId: "",
    gatewayEntry: {
      type: String,
      default: "default",
    },
    currentLevalDate: {
      type: String,
      default: "",
    },
  },
  watch: {
    chartOptions: {
      handler: function (data) {
        this.options = data;
      },
      immediate: true,
    },
    chartLeval(val) {
      console.log(val);
    },
  },
  data() {
    return {
      chart: null,
      flag: true,
      options: {},
    };
  },
  methods: {
    /** init chart */
    initChart() {
      if (this.chart) {
        this.chart.clear();
      }
      if (this.chartData.series && this.chartData.series.length) {
        this.flag = true;
        // this.options = Object.assign({}, ChartConfig(this.chartData, this.chartType));
        this.options = Object.assign(
          ChartConfig(
            this.chartData,
            this.chartType,
            this.gatewayEntry,
            this.chartLeval,
            this.currentLevalDate
          ),
          this.chartOptions
        );
      } else {
        this.flag = false;
      }
    },
    /** 设置网络智能网关x轴样式 */
    setGatewayChartStyle() {
      if (
        this.gatewayEntry === "gateway" &&
        this.options.xAxis &&
        this.options.xAxis.length
      ) {
        this.options.xAxis[0].axisLabel = {
          margin: 15,
          padding: [0, 0, 0, 15],
          textStyle: {
            color: "#888B91",
          },
        };
        this.options.xAxis[0].axisTick = {
          show: false,
        };
      }
    },
    /** drawChart */
    draw() {
      this.initChart();
      if (this.chart != null && this.chart != "" && this.chart != undefined) {
        this.chart.dispose();
      }
      this.chart = echarts.init(document.getElementById(this.domId));
      this.setGatewayChartStyle();
      this.chart.setOption(this.options);
      /** 网络智能网关 echarts图表点击事件开关 */
      if (this.gatewayEntry === "gateway") {
        const vm = this;
        /** 设置chart区域点击事件 */
        if (this.chartLeval > 2) return;
        this.chart.getZr().on("click", function (params) {
          // 获取点击位置
          const pointInPixel = [params.offsetX, params.offsetY];
          // 是否在 grid 里面点击
          if (vm.chart.containPixel("grid", pointInPixel)) {
            // 获取 点击的图是第几个(柱状图)
            let xIndex = vm.chart.convertFromPixel(
              { seriesIndex: 0 },
              pointInPixel
            )[0];
            // 找横坐标
            if (!vm.options.xAxis[0].data[xIndex]) {
              return;
            }
            // 查找数据，进行其他操作
            const gateParams = {
              date: vm.options.xAxis[0].data[xIndex],
              chartRef: vm.chartRef,
            };
            vm.chart.dispose();
            vm.$emit("drill-down", gateParams);
          }
        });
      }
    },
    /** resize */
    resize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    /** 遍历options对象 */
    combineProps(options) {
      // if(options instanceof Object){
      //     Object.keys(options).forEach(key => {
      //         if(options[key] instanceof Object){
      //         } else {
      //             if(options[key] && this.options[key]){
      //             }
      //         }
      //     });
      // }
    },
  },
};
</script>
<style scoped></style>
