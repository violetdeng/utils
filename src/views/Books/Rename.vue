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
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即保存</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</template>

<script>
import api from '@/api'
import schema from 'async-validator'

export default {
  name: 'Rename',
  props: {
    value: {
      type: Object
    }
  },
  data() {
    return {
      form: {
        title: this.value.title || '',
        author: this.value.author || ''
      },
      rules: {
        title: [
          { required: true, message: '书籍名称不能为空', trigger: 'blur' },
        ],
        author: [
          { required: true, message: '作者不能为空', trigger: 'blur' },
        ]
      }
    }
  },
  watch: {
    value: {
      handler(n, o) {
        if (n.title !== o.title) {
          this.form.title = n.title
        } else if (n.author !== o.author) {
          this.form.author = n.author
        }
      },
      deep: true
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('input', {
            id: this.value._id,
            ...this.form
          })
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$refs.form.resetFields()
      this.$emit('cancel')
    }
  }
}
</script>
