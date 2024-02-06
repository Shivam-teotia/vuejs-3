<template>
  <div
    class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5"
    data-testid="password-reset-request-page"
  >
    <form @submit.prevent="submit">
      <Card class="card">
        <template v-slot:header>
          <h1>{{ $t('passwordReset.request') }}</h1>
        </template>
        <template v-slot:body>
          <AppInput id="e-mail" :label="$t('email')" :help="errors.email" v-model="email" />
          <Alert v-if="successMessage">{{ successMessage }}</Alert>
          <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
          <div class="text-center">
            <AppButton :api-progress="apiProgress" :is-disabled="!email">
              {{ $t('passwordReset.request') }}
            </AppButton>
          </div>
        </template>
      </Card>
      <div class="card-body"></div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { AppButton, Card, Alert } from '@/components'
import Spinner from '../../../components/Spinner.vue'
import AppInput from '../../../components/AppInput.vue'
import { passwordReset } from './api'
import { useI18n } from 'vue-i18n'
const email = ref('')
const apiProgress = ref(false)
const errors = ref({})
const errorMessage = ref('')
const successMessage = ref('')
const { t } = useI18n()
watch(
  () => email.value,
  () => {
    errors.value = {}
  }
)

const submit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  try {
    const response = await passwordReset({ email: email.value })
    successMessage.value = response.data.message
  } catch (apiError) {
    if (apiError.response?.data?.validationErrors) {
      errors.value = apiError.response.data.validationErrors
    } else if (apiError.response?.data?.message) {
      errorMessage.value = apiError.response.data.message
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
</script>