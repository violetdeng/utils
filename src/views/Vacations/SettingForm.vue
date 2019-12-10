<template>
<el-form ref="form" :model="form" label-width="0">
  <el-form-item
    label="收件人"
    prop="mail.to"
    :rules="[
      { required: true, message: '收件人不能为空', trigger: 'blur' },
      { type: 'email', message: '收件人必须为邮箱地址'}
    ]"
    label-width="80px"
  >
    <el-input v-model="form.mail.to"/>
  </el-form-item>
  <el-form-item
    label="抄送"
    prop="mail.to"
    :rules="[
      { type: 'email', message: '抄送必须为邮箱地址'}
    ]"
    label-width="80px"
  >
    <el-input v-model="form.mail.cc"/>
  </el-form-item>
  <el-form-item
    label="邮件模板"
    prop="mail.template"
    :rules="[
      { required: true, message: '邮件模板不能为空', trigger: 'blur' }
    ]"
    label-width="80px"
  >
    <el-input type="textarea" :rows="5" v-model="form.mail.template"/>
  </el-form-item>
  <el-row :gutter="20">
    <el-col :span="8">
      <label class="el-form-item__label">类型</label>
    </el-col>
    <el-col :span="8">
      <label class="el-form-item__label">名称</label>
    </el-col>
    <el-col :span="3">
      <label class="el-form-item__label">颜色</label>
    </el-col>
    <el-col :span="3">
      <label class="el-form-item__label">背景色</label>
    </el-col>
  </el-row>
  <el-row
    :gutter="20"
    v-for="(type, index) in form.types"
    :key="index"
  >
    <el-col :span="8">
      <el-form-item
        :prop="'types.' + index + '.key'"
        :rules="{
          required: true, message: '类型不能为空', trigger: 'blur'
        }"
      >
        <el-input v-model="type.key"/>
      </el-form-item>
    </el-col>
    <el-col :span="8">
      <el-form-item
        :prop="'types.' + index + '.title'"
        :rules="{
          required: true, message: '名称不能为空', trigger: 'blur'
        }"
      >
        <el-input v-model="type.title"/>
      </el-form-item>
    </el-col>
    <el-col :span="3">
      <el-form-item
        :prop="'types.' + index + '.color'"
        :rules="{
          required: true, message: '颜色不能为空', trigger: 'change'
        }"
      >
        <el-color-picker v-model="type.color"/>
      </el-form-item>
    </el-col>
    <el-col :span="3">
      <el-form-item
        :prop="'types.' + index + '.lightColor'"
        :rules="{
          required: true, message: '背景色不能为空', trigger: 'change'
        }"
      >
        <el-color-picker v-model="type.lightColor"/>
      </el-form-item>
    </el-col>
    <el-col :span="2">
      <el-button v-if="form.types.length > 1" icon="el-icon-delete" circle @click="del(index)"></el-button>
    </el-col>
  </el-row>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即保存</el-button>
    <el-button @click="add">新增假期类型</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</template>

<script>

const colors = [
  {
    color: '#16a085',
    lightColor: '#1abc9c'
  },
  {
    color: '#27ae60',
    lightColor: '#2ecc71'
  },
  {
    color: '#2980b9',
    lightColor: '#3498db'
  },
  {
    color: '#8e44ad',
    lightColor: '#9b59b6'
  },
  {
    color: '#2c3e50',
    lightColor: '#34495e'
  },
  {
    color: '#f39c12',
    lightColor: '#f1c40f'
  },
  {
    color: '#d35400',
    lightColor: '#e67e22'
  },
  {
    color: '#c0392b',
    lightColor: '#e74c3c'
  }
]
export default {
  name: 'SettingForm',
  props: {
    value: {
      type: Object
    }
  },
  data() {
    return {
      form: {
        mail: {
          to: this.value.mail.to || '',
          cc: this.value.mail.cc || '',
          template: this.value.mail.template || ''
        },
        types: this.value.types || []
      }
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
    add() {
      let { color, lightColor } = this.pickColor()
      this.form.types.push({
        key: '',
        title: '',
        color,
        lightColor
      })
    },
    pickColor() {
      for (let i in colors) {
        let color = colors[i]
        if (undefined === this.form.types.find(item => {
          return item.color.toLowerCase() === color.color.toLowerCase()
        })) {
          return color
        }
      }
      return colors[0]
    },
    del(index) {
      this.form.types.splice(index, 1)
    },
    cancel() {
      this.$refs.form.resetFields()
      this.$emit('cancel')
    }
  }
}
</script>
