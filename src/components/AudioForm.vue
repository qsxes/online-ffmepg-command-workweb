<script setup lang="ts">
import { watch } from 'vue'
import type { AudioConvertForm } from '@/types/form'

const form = defineModel<AudioConvertForm>({ required: true })

// 表 1：目标格式 → 允许的编码器（不含 copy）
const codecMap: Record<string, string[]> = {
  mp3:  ['libmp3lame'],
  wav:  ['pcm_s16le'],
  m4a:  ['aac'],
  aac:  ['aac'],
  flac: ['flac'],
  ogg:  ['libopus'],
}

// 表 2：目标格式 → 允许 copy 的源格式
const copyAllowed: Record<string, string[]> = {
  mp3:  ['*.mp3'],
  wav:  ['*.wav'],
  m4a:  ['*.aac', '*.m4a'],
  aac:  ['*.m4a', '*.aac'],
  flac: ['*.flac'],
  ogg:  ['*.ogg'],
}

// 判断当前组合能不能 copy
function canCopy(): boolean {
  const allowed = copyAllowed[form.value.targetFormat]
  return allowed?.includes(form.value.inputPattern) ?? false
}

// 无损目标格式（不加码率）
const isLosslessTarget = (t: string) => t === 'wav' || t === 'flac'

// ============================================================
// watch：切换目标格式时，自动修正编码器
// ============================================================

//处理目标参数变化
// 切换目标格式时，修正编码器
function handleTargetFormatChange(target: string) {
  const allowed = codecMap[target]
  if (!allowed) return

  if (!allowed.includes(form.value.audioCodec) && form.value.audioCodec !== 'copy') {
    form.value.audioCodec = allowed[0] as AudioConvertForm['audioCodec']
  }

  // copy 不再允许时，切到目标格式的默认编码器
  if (form.value.audioCodec === 'copy' && !canCopy()) {
    form.value.audioCodec = allowed[0] as AudioConvertForm['audioCodec']
  }
}

// 切换源格式时，如果 copy 不再允许，也要修正
function handleInputPatternChange() {
  if (form.value.audioCodec === 'copy' && !canCopy()) {
    const allowed = codecMap[form.value.targetFormat]
    if (allowed) {
      form.value.audioCodec = allowed[0] as AudioConvertForm['audioCodec']
    }
  }
}


watch(() => form.value.targetFormat, handleTargetFormatChange)
watch(() => form.value.inputPattern, handleInputPatternChange)
</script>

<template>
  <el-form label-width="140px" label-position="top">


      <el-form-item label="语音识别格式">
        <el-switch v-model="form.asrPreset" />
        <div class="hint">
          开启后，自动输出 16kHz 单声道 WAV，适合喂给语音识别工具和大模型
          开启时，目标格式、编码器、码率会被自动覆盖
        </div>
      </el-form-item>


    <template v-if="!form.asrPreset">
      <!-- 输入音频格式 -->
      <el-form-item label="输入音频格式">
        <el-select v-model="form.inputPattern">
          <el-option-group label="常见格式">
            <el-option label="MP3（*.mp3）" value="*.mp3" />
            <el-option label="WAV（*.wav）" value="*.wav" />
            <el-option label="M4A（*.m4a 常见录音）" value="*.m4a" />
            <el-option label="FLAC（*.flac）" value="*.flac" />
            <el-option label="AAC（*.aac）" value="*.aac" />
            <el-option label="OGG（*.ogg）" value="*.ogg" />
            <el-option label="Opus（*.opus）" value="*.opus" />
          </el-option-group>
          <el-option-group label="特殊格式">
            <el-option label="AMR（*.amr，安卓通话语音）" value="*.amr" />
            <el-option label="APE（*.ape，无损）" value="*.ape" />
            <el-option label="3GP（*.3gp，安卓录音）" value="*.3gp" />
            <el-option label="WMA（*.wma，Windows）" value="*.wma" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <!-- 目标格式 -->
      <el-form-item label="目标格式">
        <el-select v-model="form.targetFormat">
          <el-option label="MP3（通用，有损）" value="mp3" />
          <el-option label="WAV（无损，体积大）" value="wav" />
          <el-option label="M4A（AAC 封装）" value="m4a" />
          <el-option label="AAC（裸流）" value="aac" />
          <el-option label="FLAC（无损压缩）" value="flac" />
          <el-option label="OGG（Opus 封装）" value="ogg" />
        </el-select>
      </el-form-item>

      <!-- 音频编码器 -->
      <el-form-item label="音频编码器">
        <el-select v-model="form.audioCodec">
          <el-option
              label="不重新编码（仅换容器，不改变音质）"
              value="copy"
              :disabled="!canCopy()"
          />
          <el-option
              label="MP3（libmp3lame）"
              value="libmp3lame"
              :disabled="!codecMap[form.targetFormat]?.includes('libmp3lame')"
          />
          <el-option
              label="AAC"
              value="aac"
              :disabled="!codecMap[form.targetFormat]?.includes('aac')"
          />
          <el-option
              label="Opus（libopus）"
              value="libopus"
              :disabled="!codecMap[form.targetFormat]?.includes('libopus')"
          />
          <el-option
              label="FLAC（无损）"
              value="flac"
              :disabled="!codecMap[form.targetFormat]?.includes('flac')"
          />
          <el-option
              label="PCM（无损，配 WAV）"
              value="pcm_s16le"
              :disabled="!codecMap[form.targetFormat]?.includes('pcm_s16le')"
          />
        </el-select>
        <div class="hint">
          灰色的选项与当前目标格式不兼容,例如 FLAC 无损格式只能用 FLAC 编码器<br>
          不重新编码选项：大部分情况下只支持相同的输入输出格式
        </div>
      </el-form-item>

      <!-- 音频码率 -->
      <el-form-item label="音频码率">
        <el-select
            v-model="form.audioBitrate"
            :disabled="form.audioCodec === 'copy' || isLosslessTarget(form.targetFormat)"
        >
          <el-option label="96k（体积小）" value="96k" />
          <el-option label="128k（推荐）" value="128k" />
          <el-option label="192k（音质好）" value="192k" />
          <el-option label="320k（接近无损）" value="320k" />
        </el-select>
        <div v-if="form.audioCodec === 'copy'" class="hint">
          不重新编码时，码率由原文件决定，此选项无效。
        </div>
        <div v-else-if="isLosslessTarget(form.targetFormat)" class="hint">
          {{ form.targetFormat.toUpperCase() }} 是无损格式，码率由采样率决定，此选项无效。
        </div>
      </el-form-item>


    </template>
    <!-- 输出目录 -->
    <el-form-item label="输出目录(建议此处使用全英文路径)">
      <el-input v-model="form.outputDir" placeholder="converted" />
    </el-form-item>

    <!-- 文件名后缀 -->
    <el-form-item label="文件名后缀(建议此处使用英文)">
      <el-input v-model="form.suffix" placeholder="_converted" />
    </el-form-item>

    <!-- 跳过已存在 -->
    <el-form-item label="跳过已存在">
      <el-switch v-model="form.skipExisting" />
      <div class="hint">
        输出目录里已有同名文件时跳过不处理。关闭后，会重新处理并覆盖旧文件。
      </div>
    </el-form-item>



  </el-form>
</template>

<style scoped>
.hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>