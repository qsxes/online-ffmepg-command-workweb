<script setup lang="ts">
import { ref } from 'vue'
import CompressParams from '@/components/params/CompressParams.vue'
import MergeParams from '@/components/params/MergeParams.vue'
import ConvertParams from '@/components/params/ConvertParams.vue'
import AudioParams from '@/components/params/AudioParams.vue'
import CutParams from '@/components/params/CutParams.vue'

const props = defineProps<{
  operation: 'compress' | 'merge' | 'convert' | 'audio-convert' | 'cut'
}>()

const drawer = ref(false)

const titleMap: Record<string, string> = {
  compress: '压缩参数说明',
  merge: '合并参数说明',
  convert: '转换参数说明',
  'audio-convert': '音频参数说明',
  cut: '裁剪参数说明',
}
</script>

<template>
  <el-button @click="drawer = true">参数说明</el-button>

  <el-drawer  :modal="false"
              :close-on-click-modal="false" v-model="drawer"
              :title="titleMap[operation]" size="40%"
              direction="rtl"
  >
    <CompressParams v-if="operation === 'compress'" />
    <MergeParams v-else-if="operation === 'merge'" />
    <ConvertParams v-else-if="operation === 'convert'" />
    <AudioParams v-else-if="operation === 'audio-convert'" />
    <CutParams v-else-if="operation === 'cut'" />
  </el-drawer>
</template>