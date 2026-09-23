<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { CutForm, CutSegment } from '@/types/form'

const form = defineModel<CutForm>({ required: true })

const mediaEl = ref<HTMLMediaElement>()
const mediaUrl = ref('')
const currentTime = ref('00:00:00.000')

const inputStart = ref('')
const inputEnd = ref('')
const editingIndex = ref<number | null>(null)

// 预览状态：idle 空闲 / full 整体播放
const previewMode = ref<'idle' | 'full'>('idle')
const previewSegment = ref<CutSegment | null>(null)

// ============================================================
// 判断是音频还是视频
// ============================================================
const isAudio = computed(() => {
  const name = form.value.fileName
  if (!name) return false
  const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma', '.amr', '.ape']
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return audioExts.includes(ext)
})

// ============================================================
// 文件选择
// ============================================================
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  form.value.fileName = file.name

  // 释放旧 URL
  if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value)
  mediaUrl.value = URL.createObjectURL(file)

  // 重置状态
  form.value.segments = []
  previewMode.value = 'idle'
  previewSegment.value = null
  editingIndex.value = null
  inputStart.value = ''
  inputEnd.value = ''
}

// ============================================================
// 当前播放位置更新 + 预览边界检测
// ============================================================
function onTimeUpdate() {
  const m = mediaEl.value
  if (!m) return

  currentTime.value = secondsToTime(m.currentTime)

  const seg = previewSegment.value
  if (!seg || previewMode.value === 'idle') return

  const endSec = timeToSeconds(seg.end)

  if (previewMode.value === 'full' && m.currentTime >= endSec) {
    m.pause()
    previewMode.value = 'idle'
  }
}

// ============================================================
// 用当前进度填入入点/出点
// ============================================================
function setStartFromCurrent() {
  const m = mediaEl.value
  if (!m) return
  inputStart.value = secondsToTime(m.currentTime)
}

function setEndFromCurrent() {
  const m = mediaEl.value
  if (!m) return
  inputEnd.value = secondsToTime(m.currentTime)
}

// ============================================================
// 添加 / 保存片段
// ============================================================
function addOrSaveSegment() {
  if (!inputStart.value || !inputEnd.value) return

  if (editingIndex.value !== null) {
    // 保存修改
    form.value.segments[editingIndex.value] = {
      start: inputStart.value,
      end: inputEnd.value,
    }
    editingIndex.value = null
  } else {
    // 添加新片段
    form.value.segments.push({
      start: inputStart.value,
      end: inputEnd.value,
    })
  }

  inputStart.value = ''
  inputEnd.value = ''
}

// ============================================================
// 编辑 / 取消编辑
// ============================================================
function editSegment(index: number) {
  const seg = form.value.segments[index]
  if (!seg) {
    return
  }
  inputStart.value = seg.start
  inputEnd.value = seg.end
  editingIndex.value = index
}

function cancelEdit() {
  editingIndex.value = null
  inputStart.value = ''
  inputEnd.value = ''
}

// ============================================================
// 删除片段
// ============================================================
function removeSegment(index: number) {
  form.value.segments.splice(index, 1)
}

// ============================================================
// 预览
// ============================================================

// 整体预览：从入点播到出点
function previewFull(seg: CutSegment) {
  const m = mediaEl.value
  if (!m) return
  previewSegment.value = seg
  previewMode.value = 'full'
  m.currentTime = timeToSeconds(seg.start)
  m.play()
}

// 入点预览：seek 到入点，暂停（显示静态帧）
function previewStartFrame(seg: CutSegment) {
  const m = mediaEl.value
  if (!m) return
  previewMode.value = 'idle'
  m.pause()
  m.currentTime = timeToSeconds(seg.start)
}

// 出点预览：seek 到出点，暂停
function previewEndFrame(seg: CutSegment) {
  const m = mediaEl.value
  if (!m) return
  previewMode.value = 'idle'
  m.pause()
  m.currentTime = timeToSeconds(seg.end)
}

// ============================================================
// 工具函数
// ============================================================
function secondsToTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = (s % 60).toFixed(3)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(6, '0')}`
}

function timeToSeconds(t: string): number {
  const parts = t.split(':').map(Number)

  if (parts.length === 3) {
    const [h = 0, m = 0, s = 0] = parts
    return h * 3600 + m * 60 + s
  }

  if (parts.length === 2) {
    const [m = 0, s = 0] = parts
    return m * 60 + s
  }

  return parts[0] ?? 0
}

function segmentDuration(seg: CutSegment): string {
  const dur = timeToSeconds(seg.end) - timeToSeconds(seg.start)
  if (isNaN(dur) || dur < 0) return '—'
  return dur.toFixed(2) + ' 秒'
}

// ============================================================
// 组件卸载时释放 URL
// ============================================================
onUnmounted(() => {
  if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value)
})
</script>

<template>
  <el-form label-width="140px" label-position="top">

    <!-- 选择文件 -->
    <el-form-item label="选择文件">
      <input type="file" accept="video/*,audio/*" @change="onFileChange" />
      <span v-if="form.fileName" class="filename">{{ form.fileName }}</span>
    </el-form-item>

    <!-- 预览 -->
    <video
        v-if="mediaUrl && !isAudio"
        ref="mediaEl"
        :src="mediaUrl"
        controls
        class="media-preview"
        @timeupdate="onTimeUpdate"
    />
    <audio
        v-else-if="mediaUrl && isAudio"
        ref="mediaEl"
        :src="mediaUrl"
        controls
        class="media-preview"
        @timeupdate="onTimeUpdate"
    />

    <p v-if="mediaUrl" class="current-time">
      当前播放位置：{{ currentTime }}
    </p>

    <!-- 时间输入 -->
    <el-form-item label="入点">
      <el-input v-model="inputStart" placeholder="00:00:10.000" style="width: 220px;" />
      <el-button size="small" @click="setStartFromCurrent" style="margin-left: 8px;">
        用当前进度
      </el-button>
    </el-form-item>

    <el-form-item label="出点">
      <el-input v-model="inputEnd" placeholder="00:00:25.000" style="width: 220px;" />
      <el-button size="small" @click="setEndFromCurrent" style="margin-left: 8px;">
        用当前进度
      </el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="addOrSaveSegment">
        {{ editingIndex !== null ? '保存修改' : '+ 添加到片段列表' }}
      </el-button>
      <el-button v-if="editingIndex !== null" @click="cancelEdit">取消编辑</el-button>
    </el-form-item>

    <!-- 片段列表 -->
    <div v-if="form.segments.length" class="segment-list">
      <h4 class="segment-list-title">片段列表（{{ form.segments.length }}）</h4>

      <div
          v-for="(seg, i) in form.segments"
          :key="i"
          class="segment-card"
          :class="{ editing: editingIndex === i }"
      >
        <div class="segment-header">
          <span class="segment-index">#{{ i + 1 }}</span>
          <span class="segment-time">{{ seg.start }} → {{ seg.end }}</span>
          <span class="segment-duration">时长：{{ segmentDuration(seg) }}</span>
        </div>
        <div class="segment-actions">
          <el-button size="small" @click="previewFull(seg)">▶ 整体预览</el-button>
          <el-button size="small" @click="previewStartFrame(seg)">▢ 入点</el-button>
          <el-button size="small" @click="previewEndFrame(seg)">▢ 出点</el-button>
          <el-button size="small" @click="editSegment(i)">编辑</el-button>
          <el-button size="small" type="danger" @click="removeSegment(i)">删除</el-button>
        </div>
      </div>
    </div>

    <el-alert v-else type="info" :closable="false" class="empty-alert">
      还没有片段。拖动视频进度条到位置，点「用当前进度」设置入点和出点，再添加到列表。
    </el-alert>

    <el-divider />

    <!-- 裁剪方式 -->
    <el-form-item label="裁剪方式">
      <el-radio-group v-model="form.mode">
        <el-radio value="copy">快速裁剪（秒级，开头可能偏移 1-2 秒）</el-radio>
        <el-radio value="reencode">精确裁剪（重编码，帧级精确）</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 输出目录 -->
    <el-form-item label="输出目录">
      <el-input v-model="form.outputDir" placeholder="cut" />
    </el-form-item>

    <!-- 文件名后缀 -->
    <el-form-item label="文件名后缀">
      <el-input v-model="form.suffix" placeholder="_cut" />
      <div class="hint">多次裁剪同一文件时，请修改后缀（如 _cut2）避免覆盖。</div>
    </el-form-item>

    <!-- 跳过已存在 -->
    <el-form-item label="跳过已存在">
      <el-switch v-model="form.skipExisting" />
      <div class="hint">输出文件已存在时跳过不处理。关闭后会覆盖旧文件。</div>
    </el-form-item>

    <el-alert type="warning" :closable="false">
      下载 .bat 后，请把它放到与视频同一文件夹，双击运行。
    </el-alert>

  </el-form>
</template>

<style scoped>
.filename {
  margin-left: 12px;
  color: #303133;
  font-size: 13px;
}

.media-preview {
  width: 100%;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #000;
}

.current-time {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
}

.segment-list {
  margin-top: 16px;
}

.segment-list-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

.segment-card {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
  transition: border-color 0.2s;
}

.segment-card.editing {
  border-color: #409eff;
  background: #ecf5ff;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}

.segment-index {
  color: #909399;
  font-weight: 600;
}

.segment-time {
  color: #303133;
  font-family: monospace;
}

.segment-duration {
  color: #909399;
  margin-left: auto;
}

.segment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-alert {
  margin-top: 16px;
}

.hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>