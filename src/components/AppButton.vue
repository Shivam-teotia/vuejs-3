<template>
  <button :class="`btn btn-${variant}`" :disabled="isDisabled || apiProgress">
    <span v-if="apiProgress" role="status" class="spinner-border spinner-border-sm"></span>
    <slot></slot>
  </button>
</template>
<script setup>
defineProps({
  isDisabled: Boolean,
  apiProgress: Boolean,
  variant: {
    type: String,
    default: 'primary'
  }
})
</script>