<template>
  <div class="import-upload-container">
    <div class="uoload-titles mr-b-20">
      <div class="fl-bet-cen full-width">
        <div class="fl-sta-cen import-textmsg">
          <div class="titleLitle"></div>
          <span>{{ title }}</span>
        </div>
      </div>
    </div>
    <div class="fl-cen-cen upload-content">
      <el-upload
        ref="upload-txt"
        action=""
        class="uploadBox"
        drag
        show-file-list
        :auto-upload="false"
        :file-list="fileList"
        :on-change="changeFile"
        :on-success="handleSuccess"
        :http-request="uploadHandler"
        :on-remove="removeFileList"
      >
        <div v-if="!uploadLoading">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            {{ $t("certifyManage.upload_tip_1")
            }}<em>{{ $t("certifyManage.upload_tip_2") }}</em>
          </div>
        </div>
        <div
          class="upload-loading fl-cen-cen"
          v-loading="uploadLoading"
          element-loading-text="正在上传文件"
          v-else
        ></div>
        <div class="el-upload__tip" slot="tip">
          {{ $t(uploadfileType) }}
        </div>
      </el-upload>
      <div class="error-text" v-if="uploadStatus">
        <span>{{ errorTip }}</span>
        <i class="el-icon-warning"></i>
      </div>
    </div>
  </div>
</template>
<script>
import * as XLSX from "xlsx/xlsx.mjs";
import { uploadHostTemplate } from "@/api/hostResource.api.js";

export default {
  components: {},
  props: {
    uploadfileType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "上传数据文件",
    },
    uploadStatus: {
      type: Boolean,
      default: false,
    },
    errorTip: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      fileList: [],
      uploadLoading: false,
      web: {},
    };
  },
  methods: {
    changeFile(file, fileList) {
      if (file.status === "ready") {
        this.$emit("upload-status", false);
        // 已上传文件列表如果存在 2 条记录，移除第一条，实现替换效果
        if (fileList.length === 2) {
          fileList.shift();
        }
        this.$emit("get-filelist", fileList);
        // 手动开始上传
        this.uploadLoading = true;
        setTimeout(() => {
          this.$refs["upload-txt"].submit();
        }, 500);
      }
    },
    handleSuccess(res, file, fileList) {
      if (this.$route.name === "HostImport") {
        let formData = new FormData();
        formData.append("file", file.raw);
        uploadHostTemplate(formData)
          .then((res) => {
            if (res.code === 10000) {
              this.$emit("transData", "true");
              localStorage.setItem("isPass", "true");
            } else {
              this.$emit("transData", "false");
              localStorage.setItem("isPass", "false");
            }
          })
          .catch(() => {
            this.$emit("transData", "false");
            localStorage.setItem("isPass", "false");
          });
      }
    },

    getRandomNum(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /** 移除列表回调 */
    removeFileList(file, fileList) {
      if (!fileList.length) {
        this.$emit("get-filelist", fileList);
        this.$emit("upload-status", false);
      }
    },

    /** 文件格式校验 */
    uploadHandler(params) {
      console.log(params, ".....");
      if (!params.file) return;
      // const isLt2M = params.file.size / 1024 / 1024 <= 20;
      const fileType = params.file.name.substring(
        params.file.name.lastIndexOf(".") + 1
      );
      // if (!isLt2M) {
      //     this.$notify({
      //         message: '上传的文件不能大于20MB',
      //         type: 'warning',
      //         title: '提示'
      //     })
      //     return
      // }
      if (fileType !== "xls" && fileType !== "xlsx") {
        this.uploadLoading = false;
        this.$message({
          showClose: true,
          type: "error",
          message: "导入文件格式不正确",
        });
        this.$emit("upload-status", true);
        this.$emit("error-tip", "导入文件格式不正确");
        return;
      } else {
        this.$emit("upload-status", false);
        // 调用 element ui 进度条
        params.onProgress({ percent: this.getRandomNum(19, 99) });
        setTimeout(() => {
          this.readText(params).then((excels) => {
            this.valitedFileContent(params, excels);
          });
        }, 100);
      }
    },

    /** 校验excel内容与表头格式 */
    valitedFileContent(params, excels) {
      console.log(params, excels);
      if (excels && excels.length) {
        // const startIp = '开始IP',
        //     endIp = '结束IP',
        //     region = '省/州',
        //     city = '城市',
        //     country = '国家',
        //     location = '办公区域';
        const hasContent = excels[0].sheet;
        if (!hasContent.length) {
          this.$message({
            showClose: true,
            type: "error",
            message: "上传的文件中无数据，请重新上传",
          });
          this.$emit("upload-status", true);
          this.$emit("error-tip", "上传的文件中无数据，请重新上传");
          return;
        }
        // const keys = Object.keys(hasContent[0]);
        // // excel顺序必须一致
        // if (keys[0] !== startIp || keys[1] !== endIp || keys[2] !== country || keys[3] !== region || keys[4] !== city || keys[5] !== location) {
        //     this.$message({
        //         showClose: true,
        //         type: 'error',
        //         message: '表头格式与模板不符，请重新上传'
        //     })
        //     this.$emit('upload-status', true);
        //     this.$emit('error-tip', '表头格式与模板不符，请重新上传');
        //     return;
        // }
      }
    },

    /** 解析excel读取内容 */
    readText(params) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          const result = [];
          this.web = XLSX.read(data, { type: "binary" });
          this.uploadLoading = false;
          // 调用 element ui 进度条
          params.onProgress({ percent: 100 });
          // 调用 element ui 上传成功方法
          params.onSuccess();
          this.web.SheetNames.forEach((sheetName) => {
            result.push({
              sheetName,
              sheet: XLSX.utils.sheet_to_json(this.web.Sheets[sheetName], {
                raw: false,
                defval: "",
              }),
            });
          });
          resolve(result);
        };
        reader.readAsBinaryString(params.file);
      });
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.import-upload-container {
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
.upload-loading {
  width: 100%;
  height: 100%;
}
.upload-content {
  position: relative;
}
.error-text {
  position: absolute;
  right: 30px;
  bottom: 3px;
  color: #fe575d;
  font-size: 13px;
  i {
    color: #fa575d;
    margin-left: 5px;
  }
}
</style>
<style lang="scss">
.upload-content {
  .el-upload-list__item.is-success .el-upload-list__item-status-label {
    display: none;
  }
}
</style>
