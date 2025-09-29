<template>
  <VDatePicker v-model="date" mode="date" :disabled-dates="disabledDates" 
  />
</template>

<script setup>
import { ref } from 'vue';
const date = ref(new Date());
const disabledDates = ref([
  {
    repeat: {
      weekdays: [1],
    },
  },
]);
</script>
