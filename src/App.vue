<template>
  <el-container class="app-wrapper">
    <router-view />
  </el-container>
</template>

<script>
export default {
  name: "app"
};
</script>

<style lang="scss">
html,
body,
.app-wrapper {
  height: 100%;
}
body {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
}
</style>
