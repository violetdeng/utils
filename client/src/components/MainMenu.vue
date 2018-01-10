<template>
  <wrapper-component :tag="tag" :animation="animation" :visible="visible" :vertical="vertical" class="inverted">
    <sui-menu-item>
      <img src="../assets/logo.png">
    </sui-menu-item>
    <sui-menu-item v-for="menu in menus" :key="menu.title">
      <sui-menu-header>{{ menu.title }}</sui-menu-header>
      <sui-menu-menu>
        <sui-menu-item link v-for="m in menu.children" :key="m.title">
          <router-link :to="m.link">{{ m.title }}</router-link>
        </sui-menu-item>
      </sui-menu-menu>
    </sui-menu-item>
  </wrapper-component>
</template>

<script>

import Vue from 'vue'

Vue.component('wrapper-component', {
  name: 'wrapper-component',
  props: {
    tag: {
      type: String,
      required: true
    }
  },
  render (createElement) {
    console.log(this.$vnode.data.attrs)
    return createElement(
      this.tag,
      {
        props: this.$vnode.data.attrs,
        attrs: {}
      },
      this.$slots.default
    )
  }
})

const menus = [
  {
    title: '假期',
    children: [
      {
        title: '假期列表',
        link: '/holidays'
      }
    ]
  }
]

export default {
  name: 'MainMenu',
  props: [
    'type', 'animation', 'visible'
  ],
  computed: {
    tag: function () {
      return 'sui-' + this.type
    }
  },
  data () {
    return {
      vertical: true,
      menus
    }
  }
}
</script>
