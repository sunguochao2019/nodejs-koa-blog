<template>
  <section>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
      <FormItem label="文章标题" prop="title">
        <Input v-model="formValidate.title" placeholder="文章标题"></Input>
      </FormItem>
      <FormItem label="文章作者" prop="author">
        <Input v-model="formValidate.author" placeholder="文章作者"></Input>
      </FormItem>
      <FormItem label="文章简介" prop="description">
        <Input v-model="formValidate.description" placeholder="文章简介"></Input>
      </FormItem>
      <FormItem label="文章关键字" prop="keyword">
        <Input v-model="formValidate.keyword" placeholder="文章简介"></Input>
      </FormItem>
      <FormItem label="文章分类" v-if="categoryList.length > 0">
        <Select v-model="formValidate.category_id">
          <Option v-for="(item, index) in categoryList" :value="item.id" :key="index">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="文章封面" prop="cover">
        <div class="cover">
          <div class="upload">
            <Upload
              multiple
              type="drag"
              action="http://up-z2.qiniu.com"
              :show-upload-list="false"
              :on-success="uploadSuccess"
              :on-error="uploadError"
              :data="{token}"
            >
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>点击或者拖拽上传</p>
              </div>
            </Upload>
          </div>
          <div class="article-cover" v-if="formValidate.cover">
            <img :src="formValidate.cover" alt="cover" />
          </div>
        </div>
      </FormItem>
      <FormItem label="文章内容" prop="content">
        <mavon-editor
          v-model="formValidate.content"
          :placeholder="'开始编辑...'"
          ref="md"
          @imgAdd="$imgAdd"
          @imgDel="$imgDel"
          :ishljs="true"
          :codeStyle="codeStyle"
          :toolbars="toolbars"
          v-highlight
          :toolbarsBackground="'#f9f9f9'"
          style="height: calc(100vh - 50px)"
        ></mavon-editor>
      </FormItem>
      <FormItem>
        <Button @click="handleReset('formValidate')">重置</Button>
        <Button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</Button>
      </FormItem>
    </Form>
  </section>
</template>
<script>
import { mapActions } from "vuex";
import getUploadToken from "../../libs/upload-token";
import $axios from "axios";

export default {
  data() {
    return {
      token: "",
      id: this.$route.params.id,
      detail: null,
      imgFile:[],
      categoryList: [],
      formValidate: {
        title: "",
        author: "",
        category_id: "",
        cover: "",
        description: "",
        keyword: "",
        content: ""
      },

      //参数
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: false, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: false // 预览
      },
      codeStyle:'monokai-sublime',
      ruleValidate: {
        title: [
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ],
        author: [
          { required: true, message: "文章作者不能为空", trigger: "blur" }
        ],
        cover: [
          { required: true, message: "文章封面不能为空", trigger: "blur" }
        ],
        description: [
          { required: true, message: "文章简介不能为空", trigger: "blur" }
        ],
        keyword: [
          { required: true, message: "文章关键字不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "文章内容不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this._getCategoryList();
    this._getUploadToken();
  },
  methods: {
    ...mapActions({
      createArticle: "article/createArticle",
      getCategoryList: "category/getCategoryList"
    }),
     //富文本上传图片
    $imgAdd(pos, file) {
      let formdata = new FormData();
      formdata.append("file", file);
      formdata.append("token", this.token);

      this.imgFile[pos] = file;

      let instance = $axios.create({
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      instance.post("http://up-z2.qiniu.com", formdata).then(res => {
        console.log(res);
        if (res.status === 200) {
          this.$Message.success("上传成功");
          let url = res.data.key;
          console.log(url);
          this.$refs.md.$img2Url(
            pos,
            "http://qdm05omqc.bkt.clouddn.com/" + url
          );
        } else {
          this.$Message.error(res.statusText);
        }
      });
    },

    $imgDel(pos) {
      delete this.img_file[pos];
    },
    // 上传图片成功
    uploadSuccess(response) {
      //const url = `https://cdn.boblog.com/${response.key}`;
      const url = `http://qdm05omqc.bkt.clouddn.com/${response.key}`;
      this.formValidate.cover = url;
      this.$Message.success("上传成功!");
    },
    // 上传图片失败
    uploadError(response) {
      this.$Message.error("上传失败!");
      console.log(response);
    },
    // 获取上传token
    async _getUploadToken() {
      try {
        const res = await getUploadToken();
        this.token = res.token;
      } catch (e) {
        console.log(e);
      }
    },
    // 获取分类列表
    async _getCategoryList() {
      const res = await this.getCategoryList();
      this.categoryList = res.data.data;
    },
    // 创建
    async _createArticle() {
      this.formValidate.id = this.id;

      try {
        await this.createArticle(this.formValidate);
        this.$Message.success("新增成功!");
        this.$router.push("/article");
      } catch (e) {}
    },
    // 提交
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this._createArticle();
        } else {
          this.$Message.error("请完成表单!");
        }
      });
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    }
  }
};
</script>
<style scoped>
.article-cover {
  width: 120px;
}

.article-cover img {
  width: 100%;
}

.cover {
  display: flex;
}

.cover .upload {
  width: 280px;
  margin-right: 32px;
}
</style>
