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
import { LogIn } from './api'

const { t } = useI18n()
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
    await LogIn(formState)
  } catch (error) {
    if (error.response?.status == 400) {
      errors.value = error.response.data.validationErrors
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else errorMessage.value = t('genericError')
  } finally {
    apiProgress.value = false
  }
}
</script>