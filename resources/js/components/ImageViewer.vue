<template>
  <v-overlay :value="value" class="ImageViewer" max-width="800px" z-index="100" @click.native="close">
    <div class="wrapper" @click.stop>
      <vue-photo-zoom-pro :high-url="url">
        <img :src="url" >
      </vue-photo-zoom-pro>
      <div class="actions d-flex flex-row-reverse">
        <v-btn class="close" elevation="0" fab dark small @click="close">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
      </div>
    </div>
  </v-overlay>
</template>

<script>
import vuePhotoZoomPro from 'vue-photo-zoom-pro'
import 'vue-photo-zoom-pro/dist/style/vue-photo-zoom-pro.css'
import { mdiClose } from '@mdi/js'

export default {
  name: 'ImageViewer',
  components: {
    vuePhotoZoomPro
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      mdiClose
    }
  },
  methods: {
    close () {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss">
.ImageViewer {
  .v-overlay__content {
    position: relative;
    width: 800px;
    height: 80vh;
    max-width: 100%;
    border-radius: 4px;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.6);
  }
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .actions {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 100%;
  }
}
</style>
