<template>
  <div data-testid="activation-page">
    <Alert v-if="status === 'fail'" variant="danger">{{ error }}</Alert>
    <Alert v-if="status === 'success'">{{ data.message }}</Alert>
    <Alert v-if="status === 'loading'" variant="secondary" center>
      <Spinner size="normal" v-if="status === 'loading'" />
    </Alert>
  </div>
</template>
<script setup>
import { Alert, Spinner } from '@/components'
import { activate } from './api'
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest'
const { status, data, error } = useRouteParamApiRequest(activate, 'token')
</script>