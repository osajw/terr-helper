<template>
  <v-main class="Home">
    HOME <span>!!</span>
    <v-btn text small color="primary">Primary</v-btn>
  </v-main>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.Home {
  span {
    color: red;
  }
}
</style>
