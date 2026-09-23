<script setup lang="ts">
defineProps<{
  command: string
  script: string
}>()
</script>

<template>
  <div class="command-preview">
    <h3>FFmpeg 命令</h3>
    <pre class="code-block">{{ command }}</pre>

    <h3>脚本预览</h3>
    <pre class="code-block script-block">{{ script }}</pre>
  </div>
</template>

<style scoped>
.command-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 32px 24px;
  overflow-y: auto;          /* ← 内部滚动 */
}

h3 {
  flex-shrink: 0;
  margin: 8px 0;
  font-size: 14px;
}

.code-block {
  flex-shrink: 0;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.script-block {
  flex: 1;                   /* ← 脚本区占满剩余 */
  min-height: 200px;         /* ← 保证最小可读高度 */
  overflow-y: auto;          /* ← 脚本超长时内部滚动 */
}
</style>