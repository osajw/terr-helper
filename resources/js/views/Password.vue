<template>
  <div class="Password">
    <v-overlay :value="true">
      <v-progress-circular v-if="!ready" indeterminate color="primary" />
      <v-slide-y-transition>
        <v-card v-if="ready && !needPassword" outlined>
          <v-card-title class="headline">
            <span />
            <span>{{ $tcolon('password.enterYour') }}</span>
          </v-card-title>
          <v-form ref="loginForm" v-model="isFormLoginValid" @submit.prevent="login">
            <v-text-field
              v-model="form.password"
              ref="password"
              :rules="passwordRulesSimple"
              :error-messages="errPwd"
              :prepend-icon="mdiLock"
              :label="$t('password.label')"
              name="password"
              type="password"
              required
              @input="errPwd = ''"
              @keyup.enter.native="login"
            />
          </v-form>
          <v-card-actions>
            <v-btn :disabled="!isFormLoginValid" class="mb-2" color="primary" @click="login">
              {{ $t('form.validate') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-slide-y-transition>
      <v-slide-y-transition>
        <v-card v-if="ready && needPassword" outlined>
          <v-card-title class="headline">
            <LocaleChanger small />
            <span>{{ $tcolon('password.create') }}</span>
          </v-card-title>
          <v-card-text>
            <span class="info">{{ $t('password.info') }} <b>{{ $t('password.cantBeChange') }}</b></span>
            <v-form ref="registerForm" v-model="isFormRegisterValid" @submit.prevent="createAccount">
              <v-text-field v-model="form.password" ref="password" :label="$t('password.label')" :rules="passwordRules"
                :prepend-icon="mdiLock" name="password" type="password" required />
              <v-text-field v-model="form.c_password" :label="$t('password.confirm')" :rules="c_passwordRules"
                :prepend-icon="mdiLock" name="c_password" type="password" @keyup.enter.native="createAccount" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="!isFormRegisterValid" class="mb-2" color="primary" @click="createAccount">
              {{ $t('form.create') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-slide-y-transition>
    </v-overlay>
  </div>
</template>

<script>
import { mdiLock } from '@mdi/js'
import LocaleChanger from '../components/LocaleChanger'

export default {
  name: 'Password',
  components: {
    LocaleChanger
  },
  data () {
    return {
      mdiLock,
      form: {
        password: '',
        c_password: ''
      },
      ready: false,
      needPassword: false,
      isFormRegisterValid: false,
      isFormLoginValid: false,
      loginShowMore: false,
      passwordRulesSimple: [
        v => !!v || ''
      ],
      passwordRules: [
        v => !!v || this.$t('password.isNecessary'),
        v => (!!v && v.length >= 6) || this.$t('password.min6Char')
      ],
      c_passwordRules: [
        v => !!v || this.$t('password.isNecessary'),
        v => v === this.form.password || this.$t('password.mustBeIdentical')
      ],
      errPwd: ''
    }
  },
  watch: {
    ready () {
      if (this.ready) {
        this.$nextTick(() => this.$refs.password.focus())
      }
    }
  },
  mounted () {
    this.$store.dispatch('needCreatePassword').then(val => {
      this.needPassword = !val
      this.ready = true
    })
  },
  methods: {
    createAccount () {
      if (!this.isFormRegisterValid) { return }
      this.$store.dispatch('createPassword', this.form.password).then((res) => {
        if (res.password) {
          return alert(res.password.join(','))
        }
        this.$router.push({ path: '/' })
      })
    },
    login () {
      this.$store.dispatch('checkPassword', this.form.password).then(() => {
        this.$router.push({ path: '/' })
      }).catch(() => (this.errPwd = this.$t('password.bad')))
    }
  }
}
</script>

<style lang="scss">
.Password {
  .headline {
    display: grid;
    grid-template-columns: 50px 1fr 50px;
    gap: 12px;
    > .v-btn {
      opacity: 0.5;
      min-width: 50px;
    }
  }
}
</style>
