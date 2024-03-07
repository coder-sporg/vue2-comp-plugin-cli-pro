<template>
  <div>
    <div class="flex fl-col upload-models">
      <div class="download-model bg-white radius flex fl-cen-cen">
        <DownLoadFile
          :download-text="downloadText"
          :dataTplPath="dataTplPath"
          :dataTplName="dataTplName"
        ></DownLoadFile>
      </div>
      <div
        class="upload-data-file fl-item bg-white radius mr-t-10 fl-cen-sta flex"
      >
        <UpLoadFile
          ref="upLoadFile"
          :uploadfile-type="uploadfileType"
          :upload-status="uploadStatus"
          :error-tip="errorTip"
          :title="'上传数据文件'"
          @get-filelist="fileListHandle"
          @upload-status="uploadChangeHandle"
          @error-tip="serErrorTip"
          @transData="transData"
        ></UpLoadFile>
      </div>
    </div>
  </div>
</template>
<script>
import DownLoadFile from "./DownLoadFile.vue";
import UpLoadFile from "./UpLoadFile.vue";
import Cookies from "js-cookie";

export default {
  name: "BulkImport",
  components: {
    DownLoadFile,
    UpLoadFile,
  },
  props: {
    downloadText: {
      type: String,
      default: "应用",
    },
    uploadfileType: {
      type: String,
      default: "",
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
    return {
      errorTip: "",
      fileList: [],
      uploadStatus: false,
    };
  },
  methods: {
    /** 校验错误状态 */
    uploadChangeHandle(status) {
      this.uploadStatus = status;
    },

    /** 校验错误信息 */
    serErrorTip(text) {
      this.errorTip = text;
    },

    /** 上传文件列表 */
    fileListHandle(fileList) {
      console.log("fileList", fileList);
      this.fileList = fileList;
    },
    transData(data) {
      console.log(data, 666);
      this.$emit("transData", data);
    },
    prevStepHandle() {
      sessionStorage.setItem("importCurrentPage", "1");
      this.$emit("update-page", 1);
    },

    nextStepHandle(reqApi) {
      if (!this.fileList.length) {
        this.$message({
          showClose: true,
          type: "error",
          message: "请上传数据文件",
        });
        return;
      }
      if (this.uploadStatus) return;
      this.$emit("update-loading", true);
      let formData = new FormData();
      formData.append("file", this.fileList[0].raw);
      console.log(this.$route.name);
      if (this.$route.name === "RuleImport") {
        formData.append("modifer", Cookies.get("ztpmsuser"));
      }
      reqApi(formData)
        .then((res) => {
          let tableData;
          if (this.$route.name === "HostImport") {
            tableData = res.data || [];
          } else {
            tableData = res.data.data || [];
          }
          sessionStorage.setItem("importTableData", JSON.stringify(tableData));
          sessionStorage.setItem("importCurrentPage", "2");
          this.$emit("update-page", 2);
          this.$emit("update-loading", false);
        })
        .catch((err) => {
          this.$emit("update-loading", false);
        });
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.download-model {
  height: 186px;
  min-height: 186px;
  padding: 24px 0;
}
.upload-data-file {
  min-height: 330px;
  padding: 24px 0;
}
.import-footer {
  margin-top: 40px;
  margin-bottom: 32px;
}
.upload-models {
  height: calc(100vh - 200px);
  overflow: auto;
}
</style>
