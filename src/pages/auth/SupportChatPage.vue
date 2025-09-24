<template>
  <div class="support-chat-page">
    <SupportChat :support-chat-id="supportChatId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SupportChat from '../../components/SupportChat.vue'

// Component name for ESLint
defineOptions({
  name: 'SupportChatPage'
})

const route = useRoute()
const supportChatId = ref(route.params.id)

onMounted(() => {
  // The chat ID comes from the route params
  if (!supportChatId.value) {
    console.error('No support chat ID provided')
  }
})
</script>

<style scoped>
.support-chat-page {
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

@media (max-width: 768px) {
  .support-chat-page {
    padding: 10px;
  }
}
</style>
