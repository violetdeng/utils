<template>
  <sui-sidebar-pushable>
    <app-menu type="sidebar" animation="overlay" :visible="visible"></app-menu>
    <sui-menu fixed inverted class="main">
      <sui-container>
        <a class="item" @click="toggle">
          <sui-icon name="sidebar"></sui-icon>
        </a>
      </sui-container>
    </sui-menu>
    <sui-sidebar-pusher :dimmed="dimmed" @click.native="hide">
      <div class="full height">
        <div class="toc">
          <app-menu type="menu"></app-menu>
        </div>
        <div class="wrapper">
          <div class="content">
            <router-view/>
          </div>
        </div>
      </div>
    </sui-sidebar-pusher>
  </sui-sidebar-pushable>
</template>

<script>

import MainMenu from './components/MainMenu'

export default {
  name: 'app',
  components: {
    'app-menu': MainMenu
  },
  data () {
    return {
      visible: false,
      dimmed: false
    }
  },
  methods: {
    toggle () {
      this.visible = !this.visible
      this.dimmed = !this.dimmed
    },
    hide () {
      this.visible = false
      this.dimmed = false
    }
  }
}
</script>

<style>
/* page layout */
.full.height {
  display: flex;
  flex-direction: row;
  height: 100vh;
}
.full.height > .toc {
  position: relative;
  z-index: 1;
  width: 250px;
  flex: 0 0 auto;
  background: #1B1C1D;
}
.full.height > .toc .ui.menu {
  border-radius: 0;
  border-width: 0 1px 0 0;
  box-shadow: none;
  margin: 0;
  width: inherit;
  overflow: hidden;
  will-change: transform;
}
.item {
  display: block;
}
.wrapper {
  flex: 1 1 auto;
  min-width: 0px;
}
.content {
  padding: 1rem;
  height: 100%;
}
/* below resize */
@media only screen and (max-width: 1272px) {
  /* Resize TOC  */
  .full.height > .toc {
    width: 200px;
  }
}
@media only screen and (min-width: 1145px) {
  .fixed.main.menu {
    display: none;
  }
}
@media only screen and (max-width: 1144px) {
  /* Hide Sidebar */
  .full.height > .toc {
    display: none;
  }
  .wrapper {
    padding-top: 3em;
  }
}
@media only screen and (max-width: 768px) {
  .full.height {
    flex: 1 0 auto;
  }
  .content {
    padding-right: 0;
    padding-left: 0;
  }
}
</style>
