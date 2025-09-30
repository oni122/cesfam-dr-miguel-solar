<template>
  <div class="bg-[#200934] w-[90%] text-center py-4 rounded">
    <div class="flex justify-around">
        <button @click="showElement = !showElement" class="py-3 px-8 outline rounded outline-2 bg-[#2c0a71]">Por hora</button>
        <button @click="showElement = !showElement" class="py-3 px-8 outline rounded outline-2 bg-[#2c0a71]">Por doctor</button>
    </div>

    <div :class="{ invisible: !showElement}">
      <h2>Por hora</h2>
      <VDatePicker v-model="date" mode="date" :disabled-dates="disabledDates" />

    </div>
    <div :class="{ invisible: showElement}">
      <h2>Por Medico</h2>
    </div>
  </div>
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

<style>
  .invisible {
    display: none;
  }
</style>