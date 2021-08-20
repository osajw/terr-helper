<template>
  <div class="Password">
    <v-overlay :value="true">
      <v-progress-circular v-if="!ready" indeterminate color="primary" />
      <v-slide-y-transition>
        <v-card v-if="ready && pref.password" outlined>
          <v-card-title class="headline">Entrer votre mot de passe :</v-card-title>
          <v-form ref="loginForm" v-model="isFormLoginValid" @submit.prevent="login">
            <v-text-field
              v-model="form.password"
              ref="password"
              :rules="passwordRulesSimple"
              :error-messages="errPwd"
              :prepend-icon="mdiLock"
              label="Mot de passe"
              name="password"
              type="password"
              required
              @input="errPwd = ''"
              @keyup.enter.native="login"
            />
          </v-form>
          <v-card-actions>
            <v-btn :disabled="!isFormLoginValid" class="mb-2" color="primary" @click="login">
              Valider
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-slide-y-transition>
      <v-slide-y-transition>
        <v-card v-if="ready && !pref.password" outlined>
          <v-card-title class="headline">Créer un mot de passe :</v-card-title>
          <v-card-text>
            <span class="info">Le mot de passe sera utilisé à chaque fois que vous ouvrirez l'application. <b>Le mot de passe ne pourra PAS être changé</b></span>
            <v-form ref="registerForm" v-model="isFormRegisterValid" @submit.prevent="createAccount">
              <v-text-field v-model="form.password" ref="password" label="Mot de passe" :rules="passwordRules"
                :prepend-icon="mdiLock" name="password" type="password" required />
              <v-text-field v-model="form.c_password" label="Confirmation du mot de passe" :rules="c_passwordRules"
                :prepend-icon="mdiLock" name="c_password" type="password" @keyup.enter.native="createAccount" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="!isFormRegisterValid" class="mb-2" color="primary" @click="createAccount">
              Créer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-slide-y-transition>
    </v-overlay>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mdiLock } from '@mdi/js'

export default {
  name: 'Password',
  data () {
    return {
      mdiLock,
      form: {
        password: '',
        c_password: ''
      },
      isFormRegisterValid: false,
      isFormLoginValid: false,
      loginShowMore: false,
      passwordRulesSimple: [
        v => !!v || ''
      ],
      passwordRules: [
        v => !!v || 'Le mot de passe est nécessaire',
        v => (!!v && v.length >= 6) || 'Le mot de passe doit comporter plus de 6 caractères'
      ],
      c_passwordRules: [
        v => !!v || 'Le mot de passe est nécessaire',
        v => v === this.form.password || 'Les mots de passe doivent être identiques'
      ],
      errPwd: ''
    }
  },
  computed: {
    ...mapState(['preferences', 'password', 'ready']),
    pref () {
      return this.preferences[0] || {}
    }
  },
  watch: {
    ready () {
      if (this.ready) {
        this.$nextTick(() => this.$refs.password.focus())
      }
    }
  },
  methods: {
    createAccount () {
      if (!this.isFormRegisterValid) { return }
      this.$store.dispatch('createPassword', this.form.password).then((ok) => {
        this.$router.push({ path: '/' })
      })
    },
    login () {
      this.$store.dispatch('checkPassword', this.form.password).then((ok) => {
        if (ok) {
          this.$router.push({ path: '/' })
        } else {
          this.errPwd = 'Mauvais mot de passe'
        }
      })
    }
  }
}
</script>

<style lang="scss">
// .Password {
// }
</style>
