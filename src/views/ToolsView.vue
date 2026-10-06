<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AudioConvertForm, CompressForm, ConvertForm, CutForm, MergeForm } from '@/types/form'
import CompressFormView from '@/components/form/CompressForm.vue'
import MergeFormView from '@/components/form/MergeForm.vue'
import ConvertFormView from '@/components/form/ConvertForm.vue'
import AudioForm from '@/components/form/AudioForm.vue'
import CutFormView from '@/components/form/CutFormView.vue'
import ScriptActions from '@/components/ScriptActions.vue'
import CommandPreview from '@/components/CommandPreview.vue'
import { buildCompressBatScript } from '@/utils/BuildCompressBatScript'
import { buildMergeBatScript } from '@/utils/BuildMergeBatScript'
import { buildConvertBatScript } from '@/utils/BuildConvertBatScript'
import { buildAudioConvertBatScript } from '@/utils/BuildAudioConvertBatScript'
import { buildCutBatScript } from '@/utils/BuildCutBatScript'

import { watch } from 'vue'

const SEO_MAP: Record<string, { title: string; description: string }> = {
  compress: {
    title: '批量压缩视频 · FFmpeg 工坊',
    description: '在线生成 FFmpeg 批量压缩脚本，H.264/H.265 可选，CRF 画质可调。文件不上传，本地运行。',
  },
  merge: {
    title: '按文件名合并视频 · FFmpeg 工坊',
    description: '按文件名自然顺序合并视频/音频，一键拼接分段录像。生成可双击运行的 .bat 脚本。',
  },
  convert: {
    title: '视频转格式 · FFmpeg 工坊',
    description: 'MP4 / MKV / MOV / WebM 互转，可提取音频或视频。在线生成 FFmpeg 脚本，文件不上传。',
  },
  'audio-convert': {
    title: '音频转格式 · FFmpeg 工坊',
    description: 'MP3 / WAV / M4A / FLAC 等 10+ 音频格式互转，支持 ASR 预设。在线生成脚本，本地运行。',
  },
  cut: {
    title: '视频/音频裁剪 · FFmpeg 工坊',
    description: '本地预览，多片段裁剪，生成可双击运行的 .bat 脚本。支持快速裁剪和精确裁剪。',
  },
}

const route = useRoute()
const router = useRouter()

// operation 和 URL 双向同步
const operation = computed({
  get: () => (route.params.op as string) || 'compress',
  set: (val: string) => router.push(`/${val}`),
})

watch(operation, (op) => {
  const seo = SEO_MAP[op]
  if (!seo) return
  document.title = seo.title
  const meta = document.querySelector('meta[name="description"]')
  if (meta) {
    meta.setAttribute('content', seo.description)
  }
}, { immediate: true })

// 5 个表单
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
  mode: 'copy',
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

// 命令占位
const command = computed(() => {
  return '（因浏览器暂时无法获取您的本地路径，故本网站暂不支持单条命令行模式）'
})

// 脚本派发
const script = computed(() => {
  switch (operation.value) {
    case 'compress': return buildCompressBatScript(compressForm)
    case 'merge': return buildMergeBatScript(mergeForm)
    case 'convert': return buildConvertBatScript(convertForm)
    case 'audio-convert': return buildAudioConvertBatScript(audioConvertForm)
    case 'cut': return buildCutBatScript(cutForm)
    default: return ''
  }
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
    if (isAudioOnly) return `批量提取音频_${target}.bat`
    return `批量转换_MP4转${target}.bat`
  }

  if (operation.value === 'audio-convert') {
    if (audioConvertForm.asrPreset) return `批量音频转换_ASR格式.bat`
    const source = audioConvertForm.inputPattern.replace('*.', '').toUpperCase()
    const target = audioConvertForm.targetFormat.toUpperCase()
    return `批量音频转换_${source}转${target}_${audioConvertForm.audioCodec}-${audioConvertForm.audioBitrate}.bat`
  }

  if (operation.value === 'cut') {
    if (!cutForm.fileName) return '视频裁剪.bat'
    const baseName = stripExt(cutForm.fileName)
    return `裁剪_${baseName}.bat`
  }

  return '未知错误！该文件名无法获取'
})

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '')
}
</script>

<template>
  <main class="main">
    <section class="col col-left">
      <el-tabs v-model="operation">
        <el-tab-pane label="批量压缩" name="compress">

          <div class="seo-content">
            <h2>批量压缩视频</h2>
            <p>把当前文件夹里的视频批量压小，支持 H.264 / H.265，CRF 画质可调，preset 速度可选。</p>
            <p>适合：手机视频太大发不出去、B站投稿前压缩、NAS 存档节省空间。</p>
            <p>文件不上传，所有处理在你本地用 FFmpeg 完成，生成的 .bat 脚本可以保存、复用、发给别人。</p>
          </div>
          <CompressFormView v-model="compressForm" />
        </el-tab-pane>

        <el-tab-pane label="按文件名合并" name="merge">
          <div class="seo-content">
            <h2>按文件名合并视频/音频</h2>
            <p>按文件名的自然顺序（1 → 2 → 10）合并当前文件夹里的视频或音频文件。</p>
            <p>适合：分段录像拼接、课程视频合并、多个片段合成一个文件。</p>
            <p>支持快速合并（秒级，要求编码一致）和重新编码（兼容性好，速度慢）。</p>
          </div>
          <MergeFormView v-model="mergeForm" />
        </el-tab-pane>

        <el-tab-pane label="视频批量转格式" name="convert">
          <div class="seo-content">
            <h2>视频批量转格式</h2>
            <p>MP4 / MKV / MOV / WebM / AVI 互转。可以只提取音频，也可以只提取视频。</p>
            <p>适合：MOV 转 MP4 让电视识别、MP4 转 WebM 嵌入网页、从视频里提取 MP3。</p>
            <p>支持不重新编码（copy 模式，秒级完成）和重新编码（兼容性最好）。</p>
          </div>
          <ConvertFormView v-model="convertForm" />
        </el-tab-pane>

        <el-tab-pane label="音频批量转格式" name="audio-convert">
          <div class="seo-content">
            <h2>音频批量转格式</h2>
            <p>MP3 / WAV / M4A / FLAC / AAC / OGG / AMR 等 10+ 格式互转。</p>
            <p>适合：m4a 转 mp3 发给别人、flac 转 mp3 放车里听、任意格式转 16kHz WAV 喂给语音识别工具。</p>
            <p>内置 ASR 预设，一键输出 Whisper、通义听悟等工具需要的标准格式。</p>
          </div>
          <AudioForm v-model="audioConvertForm" />
        </el-tab-pane>

        <el-tab-pane label="音频/视频剪辑" name="cut">
          <div class="seo-content">
            <h2>视频/音频裁剪</h2>
            <p>本地预览，拖进度条选起止时间，支持多片段管理，生成可双击运行的 .bat 脚本。</p>
            <p>适合：去片头片尾、截取精彩片段、从长视频里挑几段素材、制作铃声。</p>
            <p>支持快速裁剪（-c copy，秒级，可能偏移 1-2 秒）和精确裁剪（重编码，帧级精确）。</p>
          </div>
          <CutFormView v-model="cutForm" />
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
</template>

<style scoped>
.seo-content {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.seo-content h2 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.seo-content p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.col {
  min-width: 0;
  min-height: 0;
}

.col-left {
  padding: 24px 32px;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
}

.col-right {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
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
</style>