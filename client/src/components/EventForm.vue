<template>
  <sui-form>
    <sui-form-field>
      <label>类型</label>
      <Radio v-for="eventType in eventTypes" :key="eventType.key" v-model="currentEvent.type" :value="eventType.key" name="type">{{ eventType.title }}</Radio>
    </sui-form-field>
    <sui-form-field>
      <label>开始时间</label>
      <sui-grid>
        <sui-grid-column :width="8">
          <datepicker v-model="currentEvent.start.date" format="yyyy-MM-dd"></datepicker>
        </sui-grid-column>
        <sui-grid-column :width="8">
          <timepicker v-model="currentEvent.start.time" :hour-start="9" :hour-end="18" :minute-interval="10"></timepicker>
        </sui-grid-column>
      </sui-grid>
    </sui-form-field>
    <sui-form-field>
      <label>结束时间</label>
      <sui-grid>
        <sui-grid-column :width="8">
          <datepicker v-model="currentEvent.end.date" format="yyyy-MM-dd"></datepicker>
        </sui-grid-column>
        <sui-grid-column :width="8">
          <timepicker v-model="currentEvent.end.time" :hour-start="9" :hour-end="18" :minute-interval="10"></timepicker>
        </sui-grid-column>
      </sui-grid>
    </sui-form-field>
    <sui-button positive @click.native="submit">确定</sui-button>
    <sui-button negative v-if="currentEvent.id" @click.native="trash">删除</sui-button>
    <sui-button @click.native="cancel">取消</sui-button>
  </sui-form>
</template>

<script>

import { mapActions } from 'vuex'
import Datepicker from 'vuejs-datepicker'
import VueTimepicker from './Timepicker.vue'
import { Radio } from 'vue-checkbox-radio'
import moment from 'moment'

const eventTypes = {
  // @olive
  year: {
    key: 'year',
    color: '#32CD32',
    title: '年假'
  },
  // @pink
  business: {
    key: 'business',
    color: '#FF1493',
    title: '事假'
  },
  // @brown
  ill: {
    key: 'ill',
    color: '#A52A2A',
    title: '病假'
  }
}

export default {
  name: 'EventForm',
  components: {
    Datepicker,
    'timepicker': VueTimepicker,
    Radio
  },
  props: {
    event: {
      type: Object
    },
    startDate: {
      type: Date,
      default: function () {
        return new Date()
      }
    },
    endDate: {
      type: Date,
      default: function () {
        return new Date()
      }
    }
  },
  created () {
    this.getEvents()
  },
  computed: {
    currentEvent: function () {
      if (this.event) {
        return {
          id: this.event.id,
          type: this.event.type,
          start: {
            date: this.event.start.format('YYYY-MM-DD'),
            time: {
              HH: this.event.start.format('HH'),
              mm: this.event.start.format('mm')
            }
          },
          end: {
            date: this.event.end.format('YYYY-MM-DD'),
            time: {
              HH: this.event.end.format('HH'),
              mm: this.event.end.format('mm')
            }
          },
          color: this.event.color,
          title: this.event.title
        }
      } else {
        return {
          type: 'year',
          start: this.start,
          end: this.end,
          color: eventTypes['year'].color,
          title: eventTypes['year'].title
        }
      }
    },
    start: function () {
      return {
        date: this.startDate,
        time: {
          HH: '09',
          mm: '30'
        }
      }
    },
    end: function () {
      return {
        date: this.endDate,
        time: {
          HH: '18',
          mm: '30'
        }
      }
    }
  },
  data () {
    return {
      eventTypes
    }
  },
  methods: {
    ...mapActions([
      'getEvents',
      'add',
      'update',
      'delete'
    ]),
    submit () {
      const e = {
        ...this.currentEvent,
        title: eventTypes[this.currentEvent.type].title,
        color: eventTypes[this.currentEvent.type].color,
        start: moment(this.currentEvent.start.date).format('YYYY-MM-DD') + ' ' + this.currentEvent.start.time.HH + ':' + this.currentEvent.start.time.mm,
        end: moment(this.currentEvent.end.date).format('YYYY-MM-DD') + ' ' + this.currentEvent.end.time.HH + ':' + this.currentEvent.end.time.mm
      }
      if (this.currentEvent.id) {
        this.update(e).then(() => {
          console.log('here')
        })
      } else {
        this.add(e).then(() => {
          console.log('here')
        })
      }
      this.$emit('submitEvent', e)
    },
    cancel () {
      this.$emit('cancelEvent')
    },
    trash () {
      this.delete(this.currentEvent.id)
      this.$emit('deleteEvent')
    }
  }
}
</script>

<style>
.time-picker input.display-time {
  height: auto !important;
}
</style>
