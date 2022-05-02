export const dateHelper = {
  methods: {
    $formatDate (date, atHour = false) {
      if (!date) { return '' }
      const d = new Date(date)
      const n2 = n => ('0' + n).slice(-2)
      const dd = n2(d.getDate())
      const mm = n2(d.getMonth() + 1)
      const yy = n2(d.getFullYear())
      if (!atHour) {
        return this.$t('date', { dd, mm, yy })
      }
      const hh = n2(d.getHours())
      const mn = n2(d.getMinutes())
      return this.$t('dateAtTime', { dd, mm, yy, hh, mn })
    },
    $dateDaysDiff (d1, d2) {
      const diffTime = Math.abs(d2 - d1)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
  }
}
