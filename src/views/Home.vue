<template>
  <div class="home">
    <Editor v-model:modelValue="jsonData" :config="compConfig" />
  </div>
</template>

<script lang="ts">
import Editor from '@/components/Editor' // @ is an alias to /src
import editorComp from '@/components/Editor/config/registerComponents'

export default {
  name: 'Home',
  components: {
    Editor,
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
            componentKey: 'button'
          },
          {
            top: 220,
            left: 230,
            componentKey: 'title'
          },
        ],
      },
      compConfig: editorComp,
    }
  },
}
</script>

<style scoped>
.home {
  height: 100%;
}
</style>
