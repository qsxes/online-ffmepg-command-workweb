<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type {AudioConvertForm, CompressForm, ConvertForm, CutForm, MergeForm} from '@/types/form'
import CompressFormView from '@/components/form/CompressForm.vue'
import MergeFormView from '@/components/form/MergeForm.vue'
import ScriptActions from '@/components/ScriptActions.vue'
import CommandPreview from '@/components/CommandPreview.vue'
import { buildCompressBatScript } from '@/utils/BuildCompressBatScript'
import { buildMergeBatScript } from '@/utils/BuildMergeBatScript'
import InstallDrawer from "@/components/drawers/InstallDrawer.vue";
import ConvertFormView from "@/components/form/ConvertForm.vue"
import {buildConvertBatScript} from "@/utils/BuildConvertBatScript.ts";
import {buildAudioConvertBatScript} from "@/utils/BuildAudioConvertBatScript.ts";
import AudioForm from "@/components/form/AudioForm.vue";
import {buildCutBatScript} from "@/utils/BuildCutBatScript.ts";
import CutFormView from "@/components/form/CutFormView.vue";
import FAQ_Drawer from "@/components/drawers/FAQ_Drawer.vue";

const operation = ref<'compress' | 'merge' |'convert' | 'audio-convert' | 'cut'>('compress')

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
})

const mergeForm = reactive<MergeForm>({
  skipExisting: true,
  operation: 'merge',
  inputPattern: '*.mp4',
  outputName: 'merged',
  outputDir: 'merged',
  mode: 'copy'
})

const convertForm = reactive<ConvertForm>({
  extractMode: 'none',
  inputPattern: '*.mp4',
  operation: 'convert',
  targetFormat: 'mp4',
  skipExisting: true,
  videoCodec: 'copy',
  audioCodec: 'copy',
  audioBitrate: '128k',
  outputDir: 'converted',
  suffix: '_converted',
})

const audioConvertForm = reactive<AudioConvertForm>({
  operation: 'audio-convert',
  inputPattern: '*.mp3',
  targetFormat: 'mp3',
  audioCodec: 'libmp3lame',
  audioBitrate: '192k',
  outputDir: 'converted',
  suffix: '_converted',
  skipExisting: true,
  asrPreset: false,
})

const cutForm = reactive<CutForm>({
  operation: 'cut',
  fileName: '',
  segments: [],
  mode: 'copy',
  suffix: '_cut',
  outputDir: 'cut',
  inputPattern: '*.mp4',
  skipExisting: true,
})

// 根据 operation 派发
const command = computed(() => {
  // if (operation.value === 'compress') {
  //   return buildCompressBatCommand(compressForm)
  // }
  return '（因浏览器暂时无法获取您的本地路径，故本网站暂不支持单条命令行模式）'
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
  else if(operation.value === 'audio-convert') {
    return buildAudioConvertBatScript(audioConvertForm)
  }else if(operation.value === 'cut'){
    return buildCutBatScript(cutForm)
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

  if (operation.value === 'audio-convert') {
    if (audioConvertForm.asrPreset) {
      return `批量音频转换_ASR格式.bat`
    }
    const source = audioConvertForm.inputPattern.replace('*.', '').toUpperCase()
    const target = audioConvertForm.targetFormat.toUpperCase()
    const audioCodec = audioConvertForm.audioCodec
    const bitrate = audioConvertForm.audioBitrate;
    return `批量音频转换_${source}转${target}_${audioCodec}-${bitrate}.bat`
  }

  if (operation.value === 'cut') {
    if (!cutForm.fileName) {
      return '视频裁剪.bat'
    }
    // 去掉扩展名，避免生成 .mp4.bat 被 Chrome 拦截
    const baseName = stripExt(cutForm.fileName)
    return `裁剪_${baseName}.bat`
  }
  return "未知错误！该文件名无法获取"
})

//去除扩展名
function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '')
}
//控制头部折叠
const collapsed = ref(false)
</script>

<template>
  <div class="app">
    <!-- header 独立，不在 grid 里 -->

    <header class="header">
      <div class="header-main">
        <div class="header-left">
          <h1>FFmpeg 本地批处理工作流生成器</h1>
          <p>压缩 · 合并 · 转格式 · 音频转换 · 裁剪</p>
        </div>
        <div class="header-right">
          <el-button size="small" @click="collapsed = !collapsed">
            {{ collapsed ? '展开' : '收起' }}
          </el-button>
        </div>
      </div>
      <div v-show="!collapsed" class="header-details">
        <p class="privacy">
          <el-text class="primary" size="small">
          <span class="float-text">
            文件不会离开你的电脑，下载 .bat，双击运行，批量压缩当前文件夹的视频。
          </span>
          </el-text>
        </p>

        <el-divider></el-divider>
        <el-space>
          <InstallDrawer></InstallDrawer>
          <FAQ_Drawer></FAQ_Drawer>
          <el-button
              tag="a"
              href="https://github.com/qsxes/online-ffmepg-command-workweb"
              target="_blank"
              title="GitHub 仓库"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <p>本项目开源仓库地址</p>
          </el-button>
        </el-space>

      </div>

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
          <el-tab-pane label="音频批量转格式" name="audio-convert">
            <AudioForm v-model="audioConvertForm"></AudioForm>
          </el-tab-pane>
          <el-tab-pane label="音频/视频剪辑" name="cut">
            <CutFormView v-model="cutForm"></CutFormView>
          </el-tab-pane>
        </el-tabs>
      </section>

      <section class="col col-right">
        <div class="actions-area">
          <ScriptActions :script="script" :fileName="batFilename" />
        </div>
        <div class="preview-area">
          <CommandPreview :command="command" :script="script" />
        </div>
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
  height: 100vh;
  overflow: hidden;
}

/* header 独占一行，不受 grid 影响 */
.header {
  flex-shrink: 0;
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
  min-height: 0;
  overflow: hidden;
}

/* 每一栏 */
.col {
  min-width: 0;
  padding: 24px 32px;
  overflow-y: auto;
}

/* 左栏右侧加分隔线 */
.col:first-child {
  min-width: 0;
  min-height: 0;
  padding: 24px 32px;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
}

.col:last-child {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;              /* 由内部元素控制 padding */
}

.actions-area {
  flex-shrink: 0;
  padding: 24px 32px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
  padding: 16px 32px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
  transition: padding 0.2s;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
}

.header-left p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
}

.header-details {
  margin-top: 12px;
}
</style>