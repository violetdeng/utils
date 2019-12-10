<template>
  <el-container>
    <el-header class="login-header">
      violet's tools
    </el-header>
    <el-button type="primary" @click="gotoLogin('github')">Github</el-button>
  </el-container>
</template>

<script>

export default {
  name: 'Login',
  mounted() {
    if (this.$route.query.token) {
      localStorage.setItem('Authorization', this.$route.query.token)
      this.$router.push('/home')
    }
  },
  methods: {
    gotoLogin(type) {
      let redirectUrl = 'http://localhost:8081#/login'
      window.location = 'http://violetdeng.com:3000/auth/' + type + '?redirectUrl=' + encodeURIComponent(redirectUrl)
    }
  }
}
</script>

<style>
.login-header {
  margin: 30px 0;
  line-height: 60px;
  text-align: center;
  font-weight: bold;
  font-size: 30px;
}
</style>
