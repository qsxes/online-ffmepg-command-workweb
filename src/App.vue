<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type {CompressForm, ConvertForm, MergeForm} from '@/types/form'
import CompressFormView from '@/components/CompressForm.vue'
import MergeFormView from '@/components/MergeForm.vue'
import ScriptActions from '@/components/ScriptActions.vue'
import CommandPreview from '@/components/CommandPreview.vue'
import { buildCompressBatCommand } from '@/utils/BuildCompressBatCommand'
import { buildCompressBatScript } from '@/utils/BuildCompressBatScript'
import { buildMergeBatScript } from '@/utils/BuildMergeBatScript'
import Drawer from "@/components/Drawer.vue";
import ConvertFormView from "@/components/ConvertForm.vue"
import {buildConvertBatScript} from "@/utils/BuildConvertBatScript.ts";

const operation = ref<'compress' | 'merge' |'convert'>('compress')

// 两个独立表单
const compressForm = reactive<CompressForm>({
  operation: 'compress',
  codec: 'libx264',
  crf: 23,
  preset: 'medium',
  resolution: 'source',
  audioBitrate: '128k',
  outputDir: 'finished',
  suffix: '_finished',
  skipExisting: true,
  overwrite: true,
})

const mergeForm = reactive<MergeForm>({
  operation: 'merge',
  inputPattern: '*.mp4',
  outputName: 'merged',
  outputDir: 'merged',
  mode: 'copy',
})

const convertForm = reactive<ConvertForm>({
  extractMode: 'none',
  inputPattern: '*.mp4',
  operation: 'convert',
  targetFormat: 'mp4',
  skipExisting: false,
  videoCodec: 'copy',
  audioCodec: 'copy',
  audioBitrate: '128k',
  outputDir: 'converted',
  suffix: '_converted',
  overwrite: true
})

// 根据 operation 派发
const command = computed(() => {
  // if (operation.value === 'compress') {
  //   return buildCompressBatCommand(compressForm)
  // }
  return '（因无法获取您的本地路径，暂不使用单条命令）'
})

const script = computed(() => {
  if (operation.value === 'compress') {
    return buildCompressBatScript(compressForm)
  }
  else if(operation.value === 'merge') {
    return buildMergeBatScript(mergeForm)
  }
  else if(operation.value === 'convert') {
    return buildConvertBatScript(convertForm)
  }
  return ''
})

// 下载文件名
const batFilename = computed(() => {
  if (operation.value === 'compress') {
    const codec = compressForm.codec === 'libx264' ? 'H264' : 'H265'
    const res = compressForm.resolution === 'source' ? '原始分辨率' : `${compressForm.resolution}p`
    return `批量压缩_${codec}_CRF${compressForm.crf}_${res}.bat`
  }

  if (operation.value === 'merge') {
    const format = mergeForm.inputPattern.replace('*.', '').toUpperCase()
    const mode = mergeForm.mode === 'copy' ? '快速' : '重编码'
    return `批量合并_${format}_${mode}.bat`
  }

  if (operation.value === 'convert') {
    const target = convertForm.targetFormat.toUpperCase()
    const isAudioOnly = convertForm.targetFormat === 'mp3' || convertForm.targetFormat === 'wav'

    if (isAudioOnly) {
      return `批量提取音频_${target}.bat`
    }

    return `批量转换_MP4转${target}.bat`
  }

  return "未知错误！该文件名无法获取"

})
</script>

<template>
  <div class="app">
    <!-- header 独立，不在 grid 里 -->
    <header class="header">
      <h1>FFmpeg 批量压缩脚本生成器</h1>
      <p class="privacy">文件不会离开你的电脑。下载 .bat，双击运行，批量压缩当前文件夹的视频。</p>
      <Drawer></Drawer>
    </header>

    <!-- 只有左右两栏参与 grid -->
    <main class="main">
      <section class="col">
        <el-tabs v-model="operation">
          <el-tab-pane label="批量压缩" name="compress">
            <CompressFormView v-model="compressForm" />
          </el-tab-pane>
          <el-tab-pane label="按文件名合并" name="merge">
            <MergeFormView v-model="mergeForm" />
          </el-tab-pane>
          <el-tab-pane label="视频批量转格式" name="convert">
            <ConvertFormView v-model="convertForm"></ConvertFormView>
          </el-tab-pane>
        </el-tabs>
      </section>

      <section class="col">
        <ScriptActions :script="script" :fileName="batFilename" />
        <el-divider />
        <CommandPreview :command="command" :script="script" />
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 最外层：竖向排列 header 和 main */
.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
}

/* header 独占一行，不受 grid 影响 */
.header {
  width: 100%;
  padding: 24px 32px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.header h1 {
  margin: 0;
  font-size: 22px;
}

.privacy {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

/* main 占满剩余高度，左右分栏 */
.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  flex: 1;
}

/* 每一栏 */
.col {
  min-width: 0;
  padding: 24px 32px;
  overflow-y: auto;
}

/* 左栏右侧加分隔线 */
.col:first-child {
  border-right: 1px solid #e4e7ed;
}
</style>