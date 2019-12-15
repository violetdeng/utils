<template>
<div>
  <div style="margin-bottom: 15px; text-align: right;">
    <el-button-group>
      <el-button @click="statOpen = true" size="small" type="primary">统计</el-button>
      <el-button @click="settingOpen = true" size="small" type="primary">设置</el-button>
    </el-button-group>
  </div>
  <full-calendar :events="events" :config="config" @event-render="eventRender" @day-click="dayClick" @event-selected="eventClick" ref="calendar"></full-calendar>
  <el-dialog
    title="假期类型设置"
    :visible.sync="settingOpen"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <SettingForm v-model="settings" @input="saveSettings" @cancel="settingOpen = false" />
  </el-dialog>
  <el-dialog
    title="请假申请"
    :visible.sync="open"
  >
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="类型">
        <el-radio-group v-model="form.type" size="medium">
          <el-radio-button :label="eventType.key"  v-for="eventType in eventTypes" :key="eventType.key">{{eventType.title}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker
          v-model="form.time"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即申请</el-button>
        <el-button type="primary" plain @click="onSubmitAndSend">立即申请并发送邮件</el-button>
        <el-button @click="open = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog
    title="统计"
    :visible.sync="statOpen"
  >
    <el-table
      :data="statData">
      <el-table-column
        prop="type"
        label="类型">
      </el-table-column>
      <el-table-column
        prop="time"
        label="时长（小时）">
      </el-table-column>
    </el-table>
  </el-dialog>
</div>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar'
import moment from 'moment'
import api from '@/api'

import 'fullcalendar/dist/locale/zh-cn.js'
import 'fullcalendar/dist/fullcalendar.min.css'

import SettingForm from './SettingForm'

export default {
  name: 'Vacations',
  components: {
    FullCalendar,
    SettingForm
  },
  data() {
    return {
      settingOpen: false,
      config: {
        header: {
          right: 'month,agendaWeek,listYear'
        },
        defaultView: 'month'
      },
      open: false,
      events: [],

      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24);
            start.setHours(9);
            start.setMinutes(30);
            start.setSeconds(0);
            end.setTime(end.getTime() - 3600 * 1000 * 24);
            end.setHours(18);
            end.setMinutes(30);
            end.setSeconds(0);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '明天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() + 3600 * 1000 * 24);
            start.setHours(9);
            start.setMinutes(30);
            start.setSeconds(0);
            end.setTime(end.getTime() + 3600 * 1000 * 24);
            end.setHours(18);
            end.setMinutes(30);
            end.setSeconds(0);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      form: {
        type: '',
        time: ''
      },
      settings: {
        types: []
      },
      statOpen: false
    }
  },
  computed: {
    eventTypes () {
      let types = {}
      this.settings.types.map(item => {
        types[item.key] = item
      })
      return types
    },
    statData () {
      let types = {}
      if (this.settings.worktimes) {
        this.events.forEach(ev => {
          types[ev.type] || (types[ev.type] = 0)
          let datetime = moment(ev.start).format('YYYY-MM-DD ')
          let range = moment.range(ev.start, ev.end)

          this.settings.worktimes.forEach(worktime => {
            let worktimeRange = moment.range(datetime + worktime.value[0] + ':00', datetime + worktime.value[1] + ':00')

            types[ev.type] += (range.intersect(worktimeRange).diff() / 3600 / 1000)
          })
        })
      }

      let data = []
      for (let type in types) {
        data.push({
          type: this.eventTypes[type] ? this.eventTypes[type].title : '',
          time: types[type]
        })
      }
      return data
    }
  },
  created () {
    api.get('/leaves/settings').then(result => {
      this.settings = result.data
      this.loadLeaves()
    })
  },
  methods: {
    loadLeaves: _.debounce(function () {
      api.get('/leaves').then(result => {
        this.events = result.data.map(event => {
          let configure = this.eventTypes[event.type] || {}
          return {
            ...event,
            start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
            end: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
            id: event._id,
            title: configure.title,
            borderColor: configure.color,
            backgroundColor: event.status === 0 ? configure.lightColor : configure.color
          }
        })
      })
    }),
    saveSettings() {
      api.post('/leaves/settings', {
        ...this.settings
      }).then(result => {
        if (result.result === 0) {
          this.settingOpen = false
          this.$message({
            message: '保存成功',
            type: 'success'
          });
        }
      })
    },
    eventRender (event, el) {
      let destroy = document.createElement('a')
      destroy.className = 'destroy el-icon-close'
      destroy.addEventListener('click', (ev) => {
        ev.stopPropagation()

        this.$confirm('此操作将永久删除该请假申请, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const loading = this.$loading()
          api.get('/leaves/destroy?id=' + event.id).then(result => {
            if (result.result === 0) {
              this.loadLeaves()
              loading.close()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          }).finally(() => {
            loading.close()
          })
        }).catch(() => {})
      })
      el.append(destroy)
    },
    dayClick (moment, jsEvent, view) {
      this.open = true
      this.form = {
        type: 'year',
        time: [
          moment.hour(9).minute(30).format('YYYY-MM-DD HH:mm:ss'),
          moment.hour(18).minute(30).format('YYYY-MM-DD HH:mm:ss')
        ]
      }
    },
    eventClick (event, jsEvent, view) {
      this.form = {
        id: event.id,
        type: event.type,
        time: [
          event.start.format('YYYY-MM-DD HH:mm:ss'),
          event.end.format('YYYY-MM-DD HH:mm:ss')
        ]
      }
      this.open = true
    },
    toggle () {
      this.open = !this.open
    },
    save (params = {}) {
      let url = '/leaves/add'
      if (this.form.id) {
        url = '/leaves/update'
      }
      const loading = this.$loading()
      return api.post(url, {
        ...this.form,
        ...params,
        start: this.form.time[0],
        end: this.form.time[1]
      }).then(({ result, data }) => {
        if (result === 0) {
          this.toggle()
          this.loadLeaves()
          this.$message({
            message: '申请成功',
            type: 'success'
          });
        }
      }).finally(() => {
        loading.close()
      })
    },
    onSubmit () {
      this.save()
    },
    onSubmitAndSend () {
      this.save({ send: 'send'})
    },
    destroy (id) {
      api.get('/leaves/destroy', {
        ...this.form,
        start: this.form.time[0],
        end: this.form.time[1]
      }).then(({ result, data }) => {
        if (result === 0) {
          this.loadLeaves()
          this.toggle()
          this.$message({
            message: '删除成功',
            type: 'success'
          });
        }
      })
    }
  }
}
</script>

<style>
.fc-event-container {
  position: relative;
}
.destroy {
  position: absolute;
  right: 2px;
  top: 2px;
  color: #fff;
  font-weight: bold;
  z-index: 4;
}
</style>
