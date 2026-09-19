<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { CompressForm, MergeForm } from '@/types/form'
import CompressFormView from '@/components/CompressForm.vue'
import MergeFormView from '@/components/MergeForm.vue'
import ScriptActions from '@/components/ScriptActions.vue'
import CommandPreview from '@/components/CommandPreview.vue'
import { buildCompressBatCommand } from '@/utils/BuildCompressBatCommand'
import { buildCompressBatScript } from '@/utils/BuildCompressBatScript'
import { buildMergeBatScript } from '@/utils/BuildMergeBatScript'
import Drawer from "@/components/Drawer.vue";

const operation = ref<'compress' | 'merge'>('compress')

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

// 根据 operation 派发
const command = computed(() => {
  if (operation.value === 'compress') {
    return buildCompressBatCommand(compressForm)
  }
  return '（合并模式不使用单条命令）'
})

const script = computed(() => {
  if (operation.value === 'compress') {
    return buildCompressBatScript(compressForm)
  }
  return buildMergeBatScript(mergeForm)
})

// 下载文件名
const batFilename = computed(() => {
  if (operation.value === 'compress') {
    const codec = compressForm.codec === 'libx264' ? 'H264' : 'H265'
    const res = compressForm.resolution === 'source' ? '原始分辨率' : `${compressForm.resolution}p`
    return `批量压缩_${codec}_CRF${compressForm.crf}_${res}.bat`
  }
  return `批量合并_${mergeForm.inputPattern.replace('*', '')}.bat`
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