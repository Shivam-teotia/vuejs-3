<template>
  <div data-testid="user-page">
    <Alert v-if="status === 'success'">{{ successMessage }}</Alert>
    <Alert v-if="status === 'fail'" variant="danger">{{ errorMessage }}</Alert>
    <Alert v-if="status === 'loading'" variant="secondary" center>
      <Spinner size="normal" v-if="status === 'loading'" />
    </Alert>
    <ProfileCard v-if="status === 'success'" :user="user" />
  </div>
</template>
<script setup>
import { Alert, Spinner } from '@/components'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getUserById } from './api'
import { ref, watchEffect } from 'vue'
const { t } = useI18n()
const route = useRoute()
const errorMessage = ref()
const successMessage = ref()
const status = ref('')

watchEffect(async () => {
  status.value = 'loading'
  try {
    const response = await getUserById(route.params.id)
    successMessage.value = response.data
    status.value = 'success'
  } catch (apiError) {
    if (apiError.response?.data?.message) {
      errorMessage.value = apiError.response.data.message
    } else {
      errorMessage.value = t('genericError')
    }
    status.value = 'fail'
  }
})
</script>