<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2" data-testid="signup-page">
    <form class="card" @submit.prevent="submit" data-testid="form-sign-up" v-if="!successMessage">
      <div class="card-header text-center">
        <h1>{{ $t('signUp') }}</h1>
      </div>
      <div class="card-body">
        <AppInput
          id="username"
          :label="$t('username')"
          :help="errors.username"
          v-model="formState.username"
        />
        <AppInput id="email" :label="$t('email')" :help="errors.email" v-model="formState.email" />
        <AppInput
          id="password"
          :label="$t('password')"
          type="password"
          :help="errors.password"
          v-model="formState.password"
        />
        <AppInput
          id="passwordRepeat"
          :label="$t('passwordRepeat')"
          type="password"
          :help="passwordMismatchErroe"
          v-model="formState.passwordRepeat"
        />
        <Alert v-if="errorMessages" class="alert alert-danger">{{ errorMessages }}</Alert>
        <div class="text-center">
          <AppButton :is-disabled="isDisabled" :api-progress="apiProgress">
            {{ $t('signUp') }}
          </AppButton>
          <!-- <button class="btn btn-primary" :disabled="isDisabled || apiProgress">
            <Spinner v-if="apiProgress" />
            {{ $t('signUp') }}
          </button> -->
        </div>
      </div>
    </form>
    <Alert v-else>
      {{ successMessage }}
    </Alert>
  </div>
</template>
<script setup>
import { signUp } from './api'
import { computed, reactive, ref, watch } from 'vue'
import { AppInput, AppButton, Alert } from '../../components'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const formState = reactive({
  username: '',
  email: '',
  password: '',
  passwordRepeat: ''
})

const apiProgress = ref(false)
const successMessage = ref('')
const errorMessages = ref('')
const errors = ref({})
const submit = async () => {
  apiProgress.value = true
  errorMessages.value = undefined
  const { passwordRepeat, ...body } = formState
  try {
    const response = await signUp(body)
    successMessage.value = response?.data?.message
  } catch (apiError) {
    if (apiError.response?.status === 400) {
      errors.value = apiError.response.data.validationErrors
    } else {
    }
    errorMessages.value = t('genericError')
  } finally {
    apiProgress.value = false
  }
}
const isDisabled = computed(() => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true
})

const passwordMismatchErroe = computed(() => {
  return formState.password !== formState.passwordRepeat ? t('passwordMismatch') : undefined
})
watch(
  () => formState.username,
  () => {
    delete errors.value.username
  }
)
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
</script>
