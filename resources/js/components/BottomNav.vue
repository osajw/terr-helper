<template>
  <v-footer padless fixed>
    <nav class="BottomNav">
      <ul class="BottomNav__list">
        <li v-for="(item, i) in items" :key="i" class="BottomNav__item">
          <router-link :class="['BottomNav__link', {active: currentPath == item.path}]" :to="item.path">
            <v-icon class="BottomNav__icon">{{ item.icon }}</v-icon>
            <span class="BottomNav__text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </v-footer>
</template>

<script>
import { mdiMapLegend, mdiHistory } from '@mdi/js'

export default {
  name: 'BottomNav',
  data () {
    return {
      items: [
        { icon: mdiMapLegend, path: '/territory', label: this.$t('territory.plural') },
        { icon: mdiHistory, path: '/history', label: this.$t('history.label') }
      ],
      activeI: 0
    }
  },
  computed: {
    currentPath () {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss">
.BottomNav {
  height: 56px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);

  &__list {
    padding-left: 0 !important;
    list-style: none;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0;
    padding: 0;
  }

  &__item {
    perspective: 100px
  }

  &__link {
    font-size: 12px;
    text-decoration: none;
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 30px;
    overflow: hidden;
    position: relative;
    outline: none;

    &::before {
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 15px;
      background-color: var(--v-accent-base);
      position: absolute;
      transform: translateY(60px) scale(.4);
      transition: all .35s cubic-bezier(0, 0.51, 0, 0.99);
      opacity: 0;
    }
  }

  &__icon {
    transition: all .35s ease;
    will-change: opacity, transform, background-color;
  }

  &__text {
    position: absolute;
    transform: translateY(60px) skewY(-20deg);
    transform-origin: left bottom;
    color: var(--v-primary-base);
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0;
    transition: all .35s ease;
    will-change: opacity, transform, background-color;
  }

  &__link.active &__icon {
    transform: translateY(-60px) rotateX(90deg) scale(.4) skewY(-30deg);
    opacity: 0;
  }

  &__link.active &__text {
    opacity: 1;
    transform: translateY(-3px) skewY(0deg);
  }

  &__link.active::before {
    transform: translateY(12px) scale(1);
    transition: all .35s cubic-bezier(0, 0.51, 0, 0.99) 0.2s;
    opacity: 1;
  }

  @keyframes dotAnime {
    0% {
      transform: translateY(60px) scale(.4);
      opacity: 0
    }

    75% {
      transform: translateY(-3px) scale(1);
      opacity: 1;
    }

    to {
      transform: translateY(12px);
      opacity: 1;
    }
  }

  @keyframes textAnime {
    from {
      transform-origin: right center;
      transform: skewY(0) translateY(0);
    }

    25% {
      transform: skewY(0) translateY(0);
    }

    60% {
      transform: skewY(-12deg) translateY(-22px);

    }

    to {
      transform: skewY(0) translateY(-3px);
    }

  }
}
</style>
