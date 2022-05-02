export const i18nHelper = {
  methods: {
    $tcolon (...args) {
      return this.$t(...args) + this.$t(':')
    }
  }
}
