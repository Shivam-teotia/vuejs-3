<template>
  <div data-testid="user-page">
    <!-- <Alert v-if="status === 'success'">{{ successMessage }}</Alert> -->
    <Alert v-if="status === 'fail'" variant="danger">{{ error }}</Alert>
    <Alert v-if="status === 'loading'" variant="secondary" center>
      <Spinner size="normal" />
    </Alert>
    <ProfileCard v-if="status === 'success'" :user="data" />
  </div>
</template>
<script setup>
import { Alert, Spinner } from '@/components'
import ProfileCard from './components/ProfileCard.vue'
import { getUserById } from './api'
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest'
const { status, data, error } = useRouteParamApiRequest(getUserById, 'id')
</script>