<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { CutForm, CutSegment } from '@/types/form'

const form = defineModel<CutForm>({ required: true })

// ============================================================
// 本地状态
// ============================================================
// mediaEl：指向当前渲染的 <video> 或 <audio> 元素
const mediaEl = ref<HTMLMediaElement>()

// mediaUrl：blob URL，指向用户选的文件（内存里，不上传）
const mediaUrl = ref('')

// currentTime：实时显示当前播放位置（格式化后的字符串）
const currentTime = ref('00:00:00.000')

// inputStart / inputEnd：输入框的临时值，添加或编辑时才写入 form.segments
const inputStart = ref('')
const inputEnd = ref('')

// editingIndex：正在编辑的片段索引；null 表示处于"添加"模式
const editingIndex = ref<number | null>(null)

// previewMode：预览状态
//   idle = 空闲
//   full = 整体预览（从入点播到出点，到边界自动暂停）
const previewMode = ref<'idle' | 'full'>('idle')

// previewSegment：当前正在预览的片段（用于 onTimeUpdate 判断边界）
const previewSegment = ref<CutSegment | null>(null)

// ============================================================
// 判断是音频还是视频
// ============================================================
// 根据文件扩展名判断，决定渲染 <video> 还是 <audio>
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

  // 释放旧 blob URL，避免内存泄漏
  if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value)
  mediaUrl.value = URL.createObjectURL(file)

  // 换文件后清空所有片段（旧片段对新文件无意义）
  form.value.segments = []
  previewMode.value = 'idle'
  previewSegment.value = null
  editingIndex.value = null
  inputStart.value = ''
  inputEnd.value = ''
}

// ============================================================
// 播放进度更新 + 预览边界检测
// ============================================================
// 每帧渲染都会触发（浏览器限制频率，大约 4Hz）
function onTimeUpdate() {
  const m = mediaEl.value
  if (!m) return

  currentTime.value = secondsToTime(m.currentTime)

  // 只在整体预览时检查边界
  const seg = previewSegment.value
  if (!seg || previewMode.value === 'idle') return

  const endSec = timeToSeconds(seg.end)

  // 播到出点就自动暂停
  if (previewMode.value === 'full' && m.currentTime >= endSec) {
    m.pause()
    previewMode.value = 'idle'
  }
}

// ============================================================
// 用当前播放位置填入入点 / 出点
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
// 根据 editingIndex 判断是"添加新片段"还是"保存修改"
function addOrSaveSegment() {
  if (!inputStart.value || !inputEnd.value) return

  if (editingIndex.value !== null) {
    // 编辑模式：覆盖原有片段
    form.value.segments[editingIndex.value] = {
      start: inputStart.value,
      end: inputEnd.value,
    }
    editingIndex.value = null
  } else {
    // 添加模式：追加到列表
    form.value.segments.push({
      start: inputStart.value,
      end: inputEnd.value,
    })
  }

  // 清空输入框，准备下一条
  inputStart.value = ''
  inputEnd.value = ''
}

// ============================================================
// 编辑 / 取消编辑
// ============================================================
// 把片段时间回填到输入框，进入编辑模式
function editSegment(index: number) {
  const seg = form.value.segments[index]
  if (!seg) return
  inputStart.value = seg.start
  inputEnd.value = seg.end
  editingIndex.value = index
}

// 退出编辑模式，清空输入框
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

// 整体预览：seek 到入点，播到出点，onTimeUpdate 里自动暂停
function previewFull(seg: CutSegment) {
  const m = mediaEl.value
  if (!m) return
  previewSegment.value = seg
  previewMode.value = 'full'
  m.currentTime = timeToSeconds(seg.start)
  m.play()
}

// 入点预览：seek 到入点后暂停，显示静态帧
function previewStartFrame(seg: CutSegment) {
  const m = mediaEl.value
  if (!m) return
  previewMode.value = 'idle'
  m.pause()
  m.currentTime = timeToSeconds(seg.start)
}

// 出点预览：seek 到出点后暂停，显示静态帧
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

// 浮点秒 → 'HH:MM:SS.mmm'
// 例：83.452 → '00:01:23.452'
function secondsToTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = (s % 60).toFixed(3)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(6, '0')}`
}

// 'HH:MM:SS.mmm' / 'MM:SS' / 'SS' → 浮点秒
// 兼容多种用户输入格式
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

// 计算片段时长，异常时返回 '—'
function segmentDuration(seg: CutSegment): string {
  const dur = timeToSeconds(seg.end) - timeToSeconds(seg.start)
  if (isNaN(dur) || dur < 0) return '—'
  return dur.toFixed(2) + ' 秒'
}

// ============================================================
// 生命周期
// ============================================================
// 组件卸载时释放 blob URL
onUnmounted(() => {
  if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value)
})
</script>

<template>
  <el-form label-width="140px" label-position="top">

    <!-- ============================================================ -->
    <!-- 选择文件                                                       -->
    <!-- ============================================================ -->
    <el-form-item label="选择文件">
      <input type="file" accept="video/*,audio/*" @change="onFileChange" />
      <span v-if="form.fileName" class="filename">{{ form.fileName }}</span>
    </el-form-item>

    <!-- ============================================================ -->
    <!-- 本地预览：根据文件类型自动选 <video> 或 <audio>                -->
    <!-- 都绑定到同一个 mediaEl，控制逻辑（seek / play / pause）共用     -->
    <!-- ============================================================ -->
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

    <!-- 实时显示当前播放位置，用户拖动进度条时能看到精确时间 -->
    <p v-if="mediaUrl" class="current-time">
      当前播放位置：{{ currentTime }}
    </p>

    <!-- ============================================================ -->
    <!-- 时间输入区                                                     -->
    <!-- 用户拖到位置 → 点按钮 → 自动填入时间                           -->
    <!-- ============================================================ -->
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

    <!-- 添加/保存按钮：根据 editingIndex 切换文案和行为 -->
    <el-form-item>
      <el-button type="primary" @click="addOrSaveSegment">
        {{ editingIndex !== null ? '保存修改' : '+ 添加到片段列表' }}
      </el-button>
      <el-button v-if="editingIndex !== null" @click="cancelEdit">取消编辑</el-button>
    </el-form-item>

    <!-- ============================================================ -->
    <!-- 片段列表                                                       -->
    <!-- 每条记录显示时间段、时长、预览与编辑操作                        -->
    <!-- ============================================================ -->
    <div v-if="form.segments.length" class="segment-list">
      <h4 class="segment-list-title">片段列表（{{ form.segments.length }}）</h4>

      <div
          v-for="(seg, i) in form.segments"
          :key="i"
          class="segment-card"
          :class="{ editing: editingIndex === i }"
      >
        <!-- 片段头部：序号 / 时间段 / 时长 -->
        <div class="segment-header">
          <span class="segment-index">#{{ i + 1 }}</span>
          <span class="segment-time">{{ seg.start }} → {{ seg.end }}</span>
          <span class="segment-duration">时长：{{ segmentDuration(seg) }}</span>
        </div>

        <!-- 操作按钮：3 种预览 + 编辑 + 删除 -->
        <div class="segment-actions">
          <!-- 整体预览：播放裁剪后的片段 -->
          <el-button size="small" @click="previewFull(seg)">▶ 整体预览</el-button>
          <!-- 入点预览：seek 到入点，显示静态帧 -->
          <el-button size="small" @click="previewStartFrame(seg)">▢ 入点</el-button>
          <!-- 出点预览：seek 到出点，显示静态帧 -->
          <el-button size="small" @click="previewEndFrame(seg)">▢ 出点</el-button>
          <el-button size="small" @click="editSegment(i)">编辑</el-button>
          <el-button size="small" type="danger" @click="removeSegment(i)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <el-alert v-else type="info" :closable="false" class="empty-alert">
      还没有片段。拖动视频进度条到位置，点「用当前进度」设置入点和出点，再添加到列表。
    </el-alert>

    <el-divider />

    <!-- ============================================================ -->
    <!-- 裁剪方式                                                       -->
    <!-- copy：快速，秒级，但吸附关键帧                                 -->
    <!-- reencode：慢，帧级精确                                         -->
    <!-- ============================================================ -->
    <el-form-item label="裁剪方式">
      <el-radio-group v-model="form.mode">
        <el-radio value="copy">快速裁剪（秒级，开头可能偏移 1-2 秒）</el-radio>
        <el-radio value="reencode">精确裁剪（重编码，帧级精确）</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- ============================================================ -->
    <!-- 输出设置                                                       -->
    <!-- ============================================================ -->
    <el-form-item label="输出目录">
      <el-input v-model="form.outputDir" placeholder="cut" />
    </el-form-item>

    <el-form-item label="文件名后缀">
      <el-input v-model="form.suffix" placeholder="_cut" />
      <div class="hint">多次裁剪同一文件时，请修改后缀（如 _cut2）避免覆盖。</div>
    </el-form-item>

    <el-form-item label="跳过已存在">
      <el-switch v-model="form.skipExisting" />
      <div class="hint">输出文件已存在时跳过不处理。关闭后会覆盖旧文件。</div>
    </el-form-item>

    <!-- 使用提示 -->
    <el-alert type="warning" :closable="false">
      下载 .bat 后，请把它放到与视频同一文件夹，双击运行。
    </el-alert>

  </el-form>
</template>

<style scoped>
/* 文件名显示 */
.filename {
  margin-left: 12px;
  color: #303133;
  font-size: 13px;
}

/* 视频/音频预览区 */
.media-preview {
  width: 100%;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #000;
}

/* 当前播放位置显示 */
.current-time {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
}

/* 片段列表容器 */
.segment-list {
  margin-top: 16px;
}

.segment-list-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

/* 单个片段卡片 */
.segment-card {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
  transition: border-color 0.2s;
}

/* 编辑中的卡片高亮 */
.segment-card.editing {
  border-color: #409eff;
  background: #ecf5ff;
}

/* 卡片头部 */
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

/* 操作按钮区 */
.segment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 空状态提示 */
.empty-alert {
  margin-top: 16px;
}

/* 字段说明文字 */
.hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

/*
等比缩放视频避免布局问题
 */
.media-preview {
  width: 100%;
  max-height: 360px;      /* 限制高度 */
  object-fit: contain;    /* 保持宽高比，letterbox */
  background: #000;
  border-radius: 4px;
}
</style>