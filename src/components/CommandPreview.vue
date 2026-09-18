<script setup lang="ts">
defineProps<{
  command: string
  script: string
}>()
</script>

<template>
  <div>
    <h3>FFmpeg 命令</h3>
    <pre class="code-block">{{ command }}</pre>

    <h3>脚本预览</h3>
    <pre class="code-block">{{ script }}</pre>
  </div>
</template>

<style scoped>
.code-block {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>