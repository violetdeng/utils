<template>
<el-form ref="form" :model="form" :rules="rules" label-width="0">
  <el-form-item
    label="书籍名称"
    prop="title"
    label-width="100px"
  >
    <el-input v-model="form.title"/>
  </el-form-item>
  <el-form-item
    label="作者"
    prop="author"
    label-width="100px"
  >
    <el-input v-model="form.author"/>
  </el-form-item>
  <el-form-item
    label="类型"
    prop="type"
    label-width="100px"
    >
    <el-radio-group v-model="form.type">
      <el-radio-button :label="1" border>上传</el-radio-button>
      <el-radio-button :label="2" border>下载</el-radio-button>
    </el-radio-group>
  </el-form-item>
  <template v-if="form.type === 1">
  <el-form-item
    label="文件"
    prop="file"
    :rules="[
      { required: true, message: '上传书籍不能为空' }
    ]"
    label-width="100px"
  >
    <el-upload
      :http-request="uploadFile"
      action=""
      accept="text/plain"
      :multiple="false"
      :on-change="handleChange"
      :file-list="fileList"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div class="el-upload__tip" slot="tip">只能上传txt文件，且不超过50M</div>
    </el-upload>
    <div v-if="signature">
    </div>
  </el-form-item>
  </template>
  <template v-if="form.type === 2">
    <el-form-item
      label="网站"
      prop="website"
      :rules="[
        { required: true, message: '请选择网站' }
      ]"
      label-width="100px"
    >
    <el-radio v-model="form.website" :label="item.type" v-for="item in websites">{{ item.title }}【{{ item.website }}】</el-radio>
    </el-form-item>
    <el-form-item v-for="attr in attributes"
      :label="attr.title"
      label-width="100px"
      :prop="'attributes.' + attr.name"
      :rules="[
        { required: true, message: attr.title + '不能为空' }
      ]"
    >
      <el-input v-model="form.attributes[attr.name]"></el-input>
    </el-form-item>
  </template>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即保存</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api'
import schema from 'async-validator'

export default {
  name: 'BookForm',
  props: {
    value: {
      type: Object
    }
  },
  computed: {
    ...mapGetters({
      websites: 'books/downloadConfigure',
    }),
    attributes() {
      if (this.form.website) {
        let attrs = this.websites.find(item => {
          return item.type === this.form.website
        }).attributes

        attrs.forEach(item => {
          this.$set(this.form.attributes, item.name, '')
        })

        return attrs
      } else {
        return []
      }
    }
  },
  data() {
    return {
      form: {
        title: this.value.title || '',
        author: this.value.author || '',
        type: 1,
        file: null,
        website: null,
        attributes: {}
      },
      rules: {
        title: [
          { required: true, message: '书籍名称不能为空', trigger: 'blur' },
        ],
        author: [
          { required: true, message: '作者不能为空', trigger: 'blur' },
        ],
        type: [
          { required: true, trigger: 'change' }
        ]
      },
      signature: this.value.signature,
      fileList: []
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('input', this.form)
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$refs.form.resetFields()
      this.$emit('cancel')
    },
    handleChange(file, fileList) {
      let name = file.name.replace('.txt', '')
      let parts = name.split('-')
      let title = name
      let author
      if (parts.length > 1) {
        author = parts.shift()
        title = parts.join()
      }
      if (!this.form.title) this.form.title = title
      if (!this.form.author) this.form.author = author
      this.fileList = fileList.slice(-1);
    },
    uploadFile(file) {
      let param = new FormData()
      param.append('file', file.file)
      api.post('/books/upload', param, {
        headers: {'Content-Type':'multipart/form-data'},
        transformRequest: function (data) {
          return data
        }
      }).then(result => {
        if (result.result !== 0) {
          this.fileList = []
          this.form.file = false
        } else {
          this.form.file = result.data
        }
      })
    }
  }
}
</script>
