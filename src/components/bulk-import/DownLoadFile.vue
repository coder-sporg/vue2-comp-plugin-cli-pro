<template>
  <div class="import-download-content">
    <div class="download-titles mr-b-15">
      <div class="fl-bet-cen full-width">
        <div class="fl-sta-cen import-textmsg">
          <div class="titleLitle"></div>
          <span>准备{{ downloadText }}信息</span>
        </div>
      </div>
    </div>
    <div class="download-message">
      <p>导入{{ downloadText }}的个数需≤100，超出的数据将不予导入</p>
      <p>所有导入字段格式请参考模板，请确保导入数据符合模板格式要求</p>
    </div>
    <el-button class="import-download-button" @click="downlaod">
      <i class="iconfont iconxiazai mr-r-5"></i>
      下载导入模板
    </el-button>
    <a href="" id="downLink" :download="dataTplName" v-show="false"></a>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    downloadText: {
      type: String,
      default: "应用",
    },

    // 数据模板路径
    dataTplPath: {
      type: String,
      default: "",
    },

    // 数据模板文件命名
    dataTplName: {
      type: String,
      default: "数据模板.xlsx",
    },
  },
  data() {
    return {};
  },
  methods: {
    downlaod() {
      if (this.$route.name === "HostImport") {
        let url =
          window.location.protocol +
          "//" +
          window.location.host +
          `/ztpManage/v1/operation/gateway/downloadHostTemplate`;
        window.open(url, "_blank");
      } else {
        this.$message.success("已开始下载模板文件");
        let url =
          window.location.protocol +
          "//" +
          window.location.host +
          this.dataTplPath;
        document.getElementById("downLink").href = url;
        document.getElementById("downLink").click();
      }
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.import-download-content {
  width: 700px;
}
/* 模块标题线 */
.titleLitle {
  width: 3px;
  height: 16px;
  margin: 0 10px 0 0;
  background-color: var(--defaultcolors);
}
.import-textmsg {
  span {
    font-size: 16px;
  }
}
.download-message {
  margin-bottom: 16px;
  padding-left: 11px;
  p {
    line-height: 26px;
  }
}
</style>
<style lang="scss">
.import-download-button {
  margin-left: 11px;
  border: 1px solid #5c8df8;
  border-radius: 4px;
  span {
    font-size: 13px;
    color: #3371fb;
  }

  i {
    vertical-align: middle;
  }
}
</style>
