<template>
  <div>
    <span data-testid="language-tr-selector" @click="setLanguage('tr')" role="button">Tr</span>
    <span data-testid="language-en-selector" @click="setLanguage('en')" role="button">En</span>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const setLanguage = (language) => {
  localStorage.setItem('app-lang', language)
  locale.value = language
}
</script>