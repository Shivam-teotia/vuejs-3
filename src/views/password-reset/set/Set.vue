
import { AppButton } from '@/components';
<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5" data-testid="password-reset-set-page">
    <form @submit.prevent="submit">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('passwordReset.set') }}</h1>
        </template>
        <template v-slot:body>
          <div class="card-body">
            <AppInput
              id="password"
              :label="$t('password')"
              :help="errors.password"
              v-model="password"
              type="password"
            />
            <AppInput
              id="passwordRepeat"
              :label="$t('passwordRepeat')"
              :help="passwordMatchError"
              v-model="passwordRepeat"
              type="password"
            />
            <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
            <Alert v-if="successMessage">{{ successMessage }}</Alert>
            <div class="text-center">
              <AppButton :is-disabled="isDisabled" :api-progress="apiProgress">
                {{ $t('passwordReset.set') }}
              </AppButton>
            </div>
          </div>
        </template>
      </Card>
    </form>
  </div>
</template>
<script setup>
import { AppInput, AppButton, Alert, Card } from '@/components'
import { passwordSet } from './api'
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const route = useRoute()
const { t } = useI18n()
const password = ref('')
const passwordRepeat = ref('')
const apiProgress = ref(false)
const successMessage = ref()
const errorMessage = ref()
const errors = ref({})
const submit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  try {
    const response = await passwordSet(route.query.tk, { password: password.value })
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
watch(
  () => password.value,
  () => {
    delete errors.value.password
  }
)
const isDisabled = computed(() => {
  return password.value || passwordRepeat.value ? password.value !== passwordRepeat.value : true
})
const passwordMatchError = computed(() => {
  return password.value !== passwordRepeat.value ? t('passwordMismatch') : ''
})
</script>