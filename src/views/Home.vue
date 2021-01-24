<template>
  <div class="home">
    <EditorLayout v-model:modelValue="jsonData" :config="compConfig" />
  </div>
</template>

<script lang="ts">
import EditorLayout from '@/components/EditorLayout' // @ is an alias to /src
import registerCompMap from '@/data'

export default {
  name: 'Home',
  components: {
    EditorLayout,
  },
  data() {
    return {
      jsonData: {
        contain: {
          width: 1320,
          height: 820,
        },
        blocks: [
          {
            top: 100,
            left: 100,
            componentKey: 'button',
            focus: false
          },
          {
            top: 220,
            left: 230,
            componentKey: 'title',
            focus: false
          },
        ],
      },
      compConfig: registerCompMap,
    }
  },
}
</script>

<style scoped>
.home {
  height: 100%;
}
</style>
