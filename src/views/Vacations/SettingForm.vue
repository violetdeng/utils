<template>
<el-form ref="form" :model="form" :rules="rules" label-width="0">
  <el-form-item
    label="收件人"
    prop="mail.to"
    label-width="100px"
  >
    <el-input v-model="form.mail.to"/>
  </el-form-item>
  <el-form-item
    label="抄送"
    prop="mail.cc"
    :rules="[
      { type: 'email', message: '抄送必须为邮箱地址'}
    ]"
    label-width="100px"
  >
    <el-input v-model="form.mail.cc"/>
  </el-form-item>
  <el-form-item
    label="邮件模板"
    prop="mail.template"
    :rules="[
      { required: true, message: '邮件模板不能为空', trigger: 'blur' }
    ]"
    label-width="100px"
  >
    <el-input type="textarea" :rows="5" v-model="form.mail.template"/>
  </el-form-item>
  <el-form-item
    label="邮件签名"
    prop="mail.signature"
    :rules="[
      { required: true, message: '邮件签名不能为空' }
    ]"
    label-width="100px"
  >
    <el-upload
      :http-request="uploadFile"
      action=""
      accept="image/png, image/jpeg"
      :multiple="false"
      :on-change="handleChange"
      :file-list="fileList"
      list-type="picture"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <div v-if="signature">
      <el-image style="height: 100px" :src="signature" fit="contain"></el-image>
    </div>
  </el-form-item>
  <el-form-item
    v-for="(worktime, index) in form.worktimes"
    :label="'工作时段' + index"
    :key="'worktime' + index"
    :prop="'worktimes.' + index + '.value'"
    :rules="[
      { required: true, message: '工作时段不能为空', trigger: 'blur' },
    ]"
    label-width="100px">
    <el-time-picker
      is-range
      v-model="worktime.value"
      range-separator="至"
      value-format="HH:mm"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      placeholder="选择时间范围"
      style="margin-right:10px;">
    </el-time-picker>
    <el-button v-if="form.worktimes.length > 1" @click.prevent="removeWorktime(index)">删除</el-button>
  </el-form-item>
  <el-row :gutter="20">
    <el-col :span="6">
      <label class="el-form-item__label">类型</label>
    </el-col>
    <el-col :span="6">
      <label class="el-form-item__label">名称</label>
    </el-col>
    <el-col :span="4">
      <label class="el-form-item__label">时长</label>
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
    <el-col :span="6">
      <el-form-item
        :prop="'types.' + index + '.key'"
        :rules="{
          required: true, message: '类型不能为空', trigger: 'blur'
        }"
      >
        <el-input v-model="type.key"/>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item
        :prop="'types.' + index + '.title'"
        :rules="{
          required: true, message: '名称不能为空', trigger: 'blur'
        }"
      >
        <el-input v-model="type.title"/>
      </el-form-item>
    </el-col>
    <el-col :span="4">
      <el-form-item
        :prop="'types.' + index + '.timelong'"
        :rules="{
          required: true, message: '时长不能为空', trigger: 'blur'
        }"
      >
        <el-input v-model="type.timelong"/>
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
    <el-button @click="addWorktime">新增工作时段</el-button>
    <el-button @click="cancel">取消</el-button>
  </el-form-item>
</el-form>
</template>

<script>
import api from '@/api'
import schema from 'async-validator'

const emailValidator = function (rule, value, callback, source, options) {
  let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  let emails = value.split(',')
  for (let email of emails) {
    if (pattern.test(email) === false) {
      callback(new Error(email + '不是邮箱'))
    }
  }
  callback()
}

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
          signature: this.value.mail.signature ? true : false,
          template: this.value.mail.template || ''
        },
        worktimes: this.value.worktimes || [{ value: null }],
        types: this.value.types || []
      },
      rules: {
        mail: {
          to: [
            { required: true, message: '收件人不能为空', trigger: 'blur' },
            { validator: emailValidator, message: '收件人必须为邮箱地址', trigger: 'blur' }
          ]
        }
      },
      signature: this.value.mail.signature,
      fileList: []
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
          console.log(valid)
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
        timelong: -1,
        color,
        lightColor
      })
    },
    addWorktime() {
      this.form.worktimes.push({
        value: null
      })
    },
    removeWorktime(index) {
      this.form.worktimes.splice(index, 1)
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
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1);
    },
    uploadFile(file) {
      let param = new FormData()
      param.append('file', file.file)
      api.post('/leaves/settings/upload', param, {
        headers: {'Content-Type':'multipart/form-data'},
        transformRequest: function (data) {
          return data
        }
      }).then(result => {
        if (result.result !== 0) {
          this.fileList = []
          this.form.mail.signature = false
        } else {
          this.form.mail.signature = true
        }
      })
    }
  }
}
</script>
