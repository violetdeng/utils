<template>
<el-dialog
  title="书籍管理"
  :visible.sync="manageOpen"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
>
<el-form ref="form" :model="form" :rules="rules" label-width="0">
  <el-form-item
    label="书籍名称"
    prop="title"
    label-width="100px"
  >
    <el-input :value="form.title" @input="changeFormValue('title', $event)"/>
  </el-form-item>
  <el-form-item
    label="作者"
    prop="author"
    label-width="100px"
  >
    <el-input :value="form.author" @input="changeFormValue('author', $event)"/>
  </el-form-item>
  <el-form-item
    label="类型"
    prop="type"
    label-width="100px"
    >
    <el-radio-group :value="form.type" @input="changeFormValue('type', $event)">
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
    <el-tag v-if="form.file" :title="form.file">已存在</el-tag>
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
    <el-radio :value="form.website" :label="item.type" v-for="item in websites" @input="changeFormValue('website', $event)">{{ item.title }}【{{ item.website }}】</el-radio>
    </el-form-item>
    <el-form-item v-for="attr in attributes"
      :label="attr.title"
      label-width="100px"
      :prop="'attributes.' + attr.name"
      :rules="[
        { required: true, message: attr.title + '不能为空' }
      ]"
    >
      <el-input :value="form.attributes[attr.name]" @input="changeFormValue('attributes', attr.name, $event)"></el-input>
    </el-form-item>
  </template>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即保存</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api'
import schema from 'async-validator'

function initialState() {
  return {
    realValue: {
      title: null,
      author: null,
      type: null,
      file: null,
      website: null,
      attributes: null
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
    fileList: []
  }
}

export default {
  name: 'BookForm',
  props: {
    value: {
      type: Object
    },
    open: {
      type: Boolean,
      default: false
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

        if (!this.realValue.attributes) {
          this.realValue.attributes = {}
          attrs.forEach(item => {
            this.$set(this.realValue.attributes, item.name, '')
          })
        }

        return attrs
      } else {
        return []
      }
    },
    form() {
      return {
        id: this.value._id || this.value.id,
        title: this.realValue.title || this.value.title,
        author: this.realValue.author || this.value.author,
        type: this.realValue.type || this.value.type,
        file: this.realValue.file || this.value.file,
        website: this.realValue.website || (this.value.crawlers ? this.value.crawlers.website : this.value.website),
        attributes: this.realValue.attributes || (this.value.crawlers ? this.value.crawlers.attributes : this.value.attributes)
      }
    },
    manageOpen: {
      get() {
        return this.open || false
      },
      set(v) {
        this.cancel()
      }
    }
  },
  data() {
    return initialState()
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
      Object.assign(this.$data, initialState())
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
      if (!this.realValue.title) this.realValue.title = title
      if (!this.realValue.author) this.realValue.author = author
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
          this.realValue.file = false
        } else {
          this.realValue.file = result.data
        }
      })
    },
    changeFormValue(key, subkey, value) {
      if (!value) {
        value = subkey
        this.realValue[key] = value
      } else {
        if (!this.realValue[key]) {
          this.realValue[key] = {}
        }
        this.$set(this.realValue[key], subkey, value)
      }
    }
  }
}
</script>
