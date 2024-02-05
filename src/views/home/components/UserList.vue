<template>
  <div>
    <Card>
      <template v-slot:header>
        <h1>{{ $t('userList.header') }}</h1>
      </template>
      <template v-slot:default>
        <ul class="list-group list-group-flush">
          <UserItem v-for="user in pageData.content" :user="user" :key="user.id" />
        </ul>
      </template>
      <template v-slot:footer>
        <Spinner v-if="apiProgress" size="normal" />
        <button
          class="btn btn-outline-secondary btn-sm"
          v-if="pageData.page !== 0"
          @click="loadData(pageData.page - 1)"
        >
          {{ $t('userList.previous') }}
        </button>
        <button
          class="btn btn-outline-secondary btn-sm"
          @click="loadData(pageData.page + 1)"
          v-if="pageData.page + 1 < pageData.totalPages"
        >
          {{ $t('userList.next') }}
        </button>
      </template>
    </Card>
  </div>
</template>
<script setup>
import { loadUsers } from './api'
import { onMounted, reactive, ref } from 'vue'
import UserItem from './UserItem.vue'
import { Spinner, Card } from '@/components'
const pageData = reactive({
  content: [],
  page: 0,
  size: 0,
  totalPages: 0
})

const apiProgress = ref(true)

onMounted(async () => {
  loadData()
})

const loadData = async (pageIndex) => {
  apiProgress.value = true
  const {
    data: { content, page, size, totalPages }
  } = await loadUsers(pageIndex)
  pageData.content = content
  pageData.page = page
  pageData.size = size
  pageData.totalPages = totalPages
  apiProgress.value = false
}
</script>