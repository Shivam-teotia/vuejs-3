<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5" data-testid="login-page">
    <form @submit.prevent="submit">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('login') }}</h1>
        </template>
        <template v-slot:body>
          <AppInput
            id="email"
            :label="$t('email')"
            :help="errors.email"
            v-model="formState.email"
          />
          <AppInput
            id="password"
            :label="$t('password')"
            :help="errors.password"
            v-model="formState.password"
            type="password"
          />
          <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
          <div class="text-center">
            <AppButton :is-disabled="isDisabled" :api-progress="apiProgress">
              {{ $t('login') }}
            </AppButton>
          </div>
        </template>
        <template v-slot:footer>
          <router-link to="/password-reset/request">
            {{ $t('passwordReset.forgot') }}
          </router-link>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppInput from '../../components/AppInput.vue'
import Alert from '../../components/Alert.vue'
import AppButton from '../../components/AppButton.vue'
import Card from '../../components/Card.vue'
import { useI18n } from 'vue-i18n'
import { Login } from './api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const { setLoggedIn } = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const formState = reactive({
  password: '',
  email: ''
})

const apiProgress = ref(false)
const errorMessage = ref('')
const errors = ref({})

const isDisabled = computed(() => {
  return !(formState.email && formState.password)
})

watch(
  () => formState.email,
  () => {
    delete errors.value.email
  }
)

watch(
  () => formState.password,
  () => {
    delete errors.value.password
  }
)

const submit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  try {
    const response = await Login(formState)
    setLoggedIn(response.data)
    router.push('/')
  } catch (apiError) {
    if (apiError.response?.status === 400) {
      errors.value = apiError.response.data.validationErrors
    } else if (apiError.response?.data?.validationErrors) {
      errorMessage.value = apiError.response.data.validationErrors
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
</script>