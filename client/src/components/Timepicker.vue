<script>
import VueTimepicker from 'vue2-timepicker'

export default {
  extends: VueTimepicker,
  props: {
    hourStart: {
      type: Number
    },
    hourEnd: {
      type: Number
    }
  },
  watch: {
    hourStart () {
      this.renderHoursList()
    },
    hourEnd () {
      this.renderHoursList()
    }
  },
  methods: {
    renderHoursList () {
      const hoursCount = this.hourEnd ? this.hourEnd + 1 : undefined || ((this.hourType === 'h' || this.hourType === 'hh') ? 12 : 24)
      this.hours = []
      let i = this.hourStart || 0
      for (i; i < hoursCount; i++) {
        this.hours.push(this.formatValue(this.hourType, i))
      }
    }
  }
}
</script>
