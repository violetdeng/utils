<template>
<el-dialog
  title="文字处理"
  :visible.sync="manageOpen"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
>
<el-form ref="form" :model="form" :rules="rules" label-width="0">
  <el-form-item
    label="目标文字"
    prop="from"
    label-width="100px"
  >
    <el-input :value="form.from" @input="changeFormValue('from', $event)"/>
  </el-form-item>
  <el-form-item
    label="替换文字"
    prop="to"
    label-width="100px"
  >
    <el-input :value="form.to" @input="changeFormValue('to', $event)"/>
  </el-form-item>
  <el-form-item
    label="文件路径"
    prop="file"
    label-width="100px"
    >
    <el-input :value="form.file" @input="changeFormValue('file', $event)"/>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即保存</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</el-dialog>
</template>

<script>

function initialState() {
  return {
    realValue: {
      from: null,
      to: null,
      file: null
    },
    rules: {
      from: [
        { required: true, message: '目标文字不能为空', trigger: 'blur' },
      ],
      file: [
        { required: true, message: '文件路径不能为空', trigger: 'blur' }
      ]
    }
  }
}

export default {
  name: 'WordForm',
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
    form() {
      return {
        id: this.value._id || this.value.id,
        from: this.realValue.from || this.value.from,
        to: this.realValue.to || this.value.to,
        file: this.realValue.file || this.value.file
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
    changeFormValue(key, value) {
      this.realValue[key] = value
    }
  }
}
</script>
