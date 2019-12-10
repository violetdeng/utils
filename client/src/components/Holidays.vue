<template>
  <div class="calendar-wrapper">
    <full-calendar :events="events" :config="config" @day-click="dayClick" @event-selected="eventClick" ref="calendar"></full-calendar>
    <div class="ui flowing popup bottom left transition" v-bind:class="{ visible: show }" ref="popup">
      <sui-list>
        <sui-list-item @click.native="eventUpdate">修改</sui-list-item>
        <sui-list-item>发邮件</sui-list-item>
        <sui-list-item>删除</sui-list-item>
      </sui-list>
    </div>
    <sui-modal v-model="open">
      <sui-modal-header>请假</sui-modal-header>
      <sui-modal-content>
        <sui-modal-description>
          <event-form :startDate="startDate" :endDate="endDate" :event="event" v-on:submitEvent="toggle" v-on:cancelEvent="toggle" v-on:deleteEvent="toggle"></event-form>
        </sui-modal-description>
      </sui-modal-content>
    </sui-modal>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { FullCalendar } from 'vue-full-calendar'
import $ from 'jquery'
import MobileDetect from 'mobile-detect'
import EventForm from './EventForm.vue'

import 'fullcalendar/dist/locale/zh-cn.js'
import 'fullcalendar/dist/fullcalendar.min.css'

const md = new MobileDetect(window.navigator.userAgent)

export default {
  name: 'Holidays',
  components: {
    FullCalendar,
    EventForm
  },
  computed: {
    ...mapGetters([
      'events'
    ]),
    config: function () {
      if (md.mobile()) {
        const that = this
        return {
          customButtons: {
            addEvent: {
              text: '添加',
              click: function () {
                that.event = undefined
                that.toggle()
              }
            }
          },
          height: 'parent',
          header: {
            left: 'prev,next today,addEvent',
            right: ''
          },
          defaultView: 'listMonth'
        }
      } else {
        return {
          header: { right: 'month,agendaWeek,listMonth' },
          defaultView: 'month'
        }
      }
    }
  },
  data () {
    return {
      open: false,
      startDate: new Date(),
      endDate: new Date(),
      event: null,
      show: false
    }
  },
  methods: {
    dayClick (moment, jsEvent, view) {
      this.open = true
      this.startDate = moment.toDate()
      this.endDate = moment.toDate()
      this.event = undefined
    },
    eventClick (event, jsEvent, view) {
      const pos = $(jsEvent.target).offset()
      pos.top += $(jsEvent.target).height()
      pos.left -= $(jsEvent.target).width()
      this.show = true
      $(this.$refs.popup).css(pos)
      this.event = event
    },
    eventUpdate () {
      this.show = false
      this.open = true
    },
    toggle () {
      this.open = !this.open
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.calendar-wrapper {
  height: 100%;
}
</style>
