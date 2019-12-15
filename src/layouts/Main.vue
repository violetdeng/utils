<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <h1 class="logo"><img src="../assets/logo.svg" />violet's 工具平台</h1>
      <div class="app-tools">
        <span>{{ user.nickname }}</span>
        <el-link :href="logout" style="margin-left: 10px;" type="primary">退出</el-link>
      </div>
    </el-header>
    <el-container class="app-main">
      <el-aside style="width:150px" class="app-aside">
        <el-menu :router="true" :default-active="$route.path" class="app-menu">
          <el-menu-item index="/vacations">
            <i class="el-icon-menu"></i>
            <span slot="title">假期统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="app-content">
        <router-view v-if="!loading && isRouterAlice" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters } from "vuex";
import { logout } from "@/api";

export default {
  name: "Main",
  computed: {
    ...mapGetters({
      loading: "loadingUser",
      user: "user"
    })
  },
  beforeCreate() {
    this.$store.dispatch("initUser");
  },
  provide() {
    return {
      reload: this.reload,
      isAdmin: this.isAdmin,
      userName: this.userName
    };
  },
  data() {
    return {
      isRouterAlice: true,
      logout
    }
  },
  methods: {
    isAdmin() {
      return this.user.is_super_admin;
    },
    userName() {
      return this.user.nickname;
    },
    reload() {
      this.isRouterAlice = false;
      this.$nextTick(() => {
        this.isRouterAlice = true;
      });
    }
  }
};
</script>

<style lang="scss">
.app-container {
  height: 100%;
}
.app-header {
  display: flex;
  justify-content: space-between;
  border-bottom: solid 1px #e6e6e6;
}
.app-main {
  height: calc(100% - 60px);
}
.app-aside {
  border-right: solid 1px #e6e6e6;
}
.app-content {
  height: 100%;
}
.el-menu.app-menu {
  border-right: none;
}
.logo {
  color: $theme-color;
  vertical-align: middle;
  height: 60px;
  line-height: 60px;
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}
.logo img {
  vertical-align: middle;
  height: 40px;
  line-height: 60px;
  margin-right: 10px;
}
.app-tools {
  display: flex;
  align-items: center;
}
.content-wrapper {
  height: 100%;
  overflow: hidden;
}

.el-table .el-form-item {
  margin-bottom: 0;
}
</style>
