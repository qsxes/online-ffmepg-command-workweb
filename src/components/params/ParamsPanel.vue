<script setup lang="ts">
import CompressParams from './CompressParams.vue'
import MergeParams from './MergeParams.vue'
import ConvertParams from './ConvertParams.vue'
import AudioParams from './AudioParams.vue'
import CutParams from './CutParams.vue'

defineProps<{
  operation: 'compress' | 'merge' | 'convert' | 'audio-convert' | 'cut'
}>()
</script>

<template>
  <el-collapse>
    <el-collapse-item title="📖 参数说明" name="params">
      <CompressParams v-if="operation === 'compress'" />
      <MergeParams v-else-if="operation === 'merge'" />
      <ConvertParams v-else-if="operation === 'convert'" />
      <AudioParams v-else-if="operation === 'audio-convert'" />
      <CutParams v-else-if="operation === 'cut'" />
    </el-collapse-item>
  </el-collapse>
</template>