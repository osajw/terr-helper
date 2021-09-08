
export const urlHelper = {
  methods: {
    $terrUrl (name = '') {
      return `./images/${name.replaceAll('/', '_')}.jpg`
    },
    $npvUrl (planUrl = '') {
      return `./images/${planUrl}`
    }
  }
}
