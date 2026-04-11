<script setup>
import { computed } from 'vue';
import * as Icons from 'lucide-vue-next';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: 22,
  },
  /** Brand default for complaint categories */
  color: {
    type: String,
    default: '#AF1E23',
  },
  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
});

const Icon = computed(() => {
  const key = props.name?.trim();
  if (!key) return Icons.CircleHelp;
  return Icons[key] || Icons.CircleHelp;
});
</script>

<template>
  <component
    :is="Icon"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    class="complaint-lucide-icon"
    aria-hidden="true"
  />
</template>

<style scoped>
.complaint-lucide-icon {
  flex-shrink: 0;
  display: block;
}
</style>
