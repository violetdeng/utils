<template>
  <el-row :gutter="20" class="login-page">
    <div class="login-wrapper">
      <el-col :span="8" :offset="8" class="login-box">
        <el-card>
          <h1 class="title"><i class="icon-logo"></i>Violet's Tools</h1>
          <h2>登录</h2>
          <p style="description">一个个人效率提升的工具网站</p>
          <el-button type="primary" @click="gotoLogin('github')" icon="icon-github">Github</el-button>
        </el-card>
      </el-col>
    </div>
  </el-row>
</template>

<script>

export default {
  name: 'Login',
  mounted() {
    if (this.$route.query.token) {
      localStorage.setItem('Authorization', this.$route.query.token)
      this.$router.push('/')
    }
  },
  methods: {
    gotoLogin(type) {
      let redirectUrl = window.location.href
      window.location = 'http://violetdeng.com:3000/auth/' + type + '?redirectUrl=' + encodeURIComponent(redirectUrl)
    }
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  background: url(~@/assets/images/bg.jpg) center;
}
.login-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
}
.login-box {
  position: relative;
  top: -10%;
}
.title {
  text-align: center;
  color: #3fa085;
  font-family: fantasy;
}
.title .icon-logo {
  margin-right: 5px;
  color: #67af9b;
}
h2 {
  color: #666;
}
.title .icon-logo:before {
  transform: rotate(-16deg);
}
.description {
  color: #909399;
}
</style>
