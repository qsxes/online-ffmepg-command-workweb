<script setup lang="ts">
import type { ConvertForm } from '@/types/form'
import {watch} from "vue";

const form = defineModel<ConvertForm>({ required: true })

//合法编码策略映射表
const codecMap: Record<string, { video: string[]; audio: string[] }> = {
  mp4:  { video: ['copy', 'libx264', 'libx265'], audio: ['copy', 'aac'] },
  mkv:  { video: ['copy', 'libx264', 'libx265'], audio: ['copy', 'aac', 'libmp3lame'] },
  mov:  { video: ['copy', 'libx264', 'libx265'], audio: ['copy', 'aac'] },
  webm: { video: ['libvpx-vp9'],                  audio: ['libopus'] },
  avi:  { video: ['libx264'],                     audio: ['libmp3lame'] },
  mp3:  { video: [],                              audio: ['libmp3lame'] },
  wav:  { video: [],                              audio: ['pcm_s16le'] },
}

watch(() => form.value.targetFormat, (target) => {
  const allowed = codecMap[target]
  if (!allowed) return

  if (allowed.video.length && !allowed.video.includes(form.value.videoCodec)) {
    form.value.videoCodec = allowed.video[0] as any
  }
  if (!allowed.audio.includes(form.value.audioCodec)) {
    form.value.audioCodec = allowed.audio[0] as any
  }
})
</script>

<template>
  <el-form label-width="140px" label-position="top">

    <!-- inputPattern: 输入格式 -->
    <el-form-item label="输入文件格式">
      <el-select v-model="form.inputPattern">
        <el-option label="MP4 视频（*.mp4）" value="*.mp4" />
        <el-option label="MKV 视频（*.mkv）" value="*.mkv" />
        <el-option label="MOV 视频（*.mov）" value="*.mov" />
        <el-option label="AVI 视频（*.avi）" value="*.avi" />
        <el-option label="WebM 视频（*.webm）" value="*.webm" />
        <el-option label="TS 视频（*.ts）" value="*.ts" />
      </el-select>
    </el-form-item>

    <!-- targetFormat: 目标格式 -->
    <el-form-item label="目标格式">
      <el-select v-model="form.targetFormat">
        <el-option-group label="视频格式">
          <el-option
              :label="form.extractMode === 'audio' ? 'MP4（只提取音频时不可用）' :' MP4（兼容性最好）'"
              value="mp4"
              :disabled="form.extractMode === 'audio'"
          />
          <el-option
              :label="form.extractMode === 'audio' ? 'MKV（只提取音频时不可用）' :' MKV（万能容器）'"
              value="mkv"
              :disabled="form.extractMode === 'audio'"
          />
          <el-option
              :label="form.extractMode === 'audio' ? 'MOV（只提取音频时不可用）' : 'MOV（苹果生态）'"
              value="mov"
              :disabled="form.extractMode === 'audio'"
          />
          <el-option
              :label="form.extractMode === 'audio' ? 'WebM（只提取音频时不可用）' : 'WebM（网页友好）'"
              value="webm"
              :disabled="form.extractMode === 'audio'"
          />
          <el-option
              :label="form.extractMode === 'audio' ? 'AVI（只提取音频时不可用）' : 'AVI（老设备兼容）'"
              value="avi"
              :disabled="form.extractMode === 'audio'"
          />
        </el-option-group>

        <el-option-group label="音频格式">
          <el-option
              :label="form.extractMode === 'video' ? 'MP3（只提取视频时不可用）' : 'MP3（只抽音频）'"
              value="mp3"
              :disabled="form.extractMode === 'video'"

          />
          <el-option
              :label="form.extractMode === 'video' ? 'WAV（只提取视频时不可用）' : 'WAV（无损音频）'"
              value="wav"
              :disabled="form.extractMode === 'video'"
          />
        </el-option-group>
      </el-select>
    </el-form-item>

    <!-- extractMode: 提取模式，音频视频处理逻辑 -->
    <el-form-item label="提取模式(音频视频选择)">
      <el-radio-group v-model="form.extractMode">
        <el-radio value="none">正常转换（只要存在，音频视频全部保存）</el-radio>
        <el-radio value="audio">只提取音频（去掉视频）</el-radio>
        <el-radio value="video">只提取视频（去掉音频）</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="视频编码器">
      <el-select
          v-model="form.videoCodec"
          :disabled="form.extractMode === 'audio' || form.targetFormat === 'mp3' || form.targetFormat === 'wav'"
      >
        <el-option label="不重新编码" value="copy" :disabled="!codecMap[form.targetFormat]?.video.includes('copy')" />
        <el-option label="H.264" value="libx264" :disabled="!codecMap[form.targetFormat]?.video.includes('libx264')" />
        <el-option label="H.265" value="libx265" :disabled="!codecMap[form.targetFormat]?.video.includes('libx265')" />
        <el-option label="VP9" value="libvpx-vp9" :disabled="!codecMap[form.targetFormat]?.video.includes('libvpx-vp9')" />
      </el-select>
      <div v-if="form.extractMode === 'audio'" class="hint">
        已选择「只提取音频」，视频轨被丢弃，此选项无效。
      </div>
      <div v-else-if="form.targetFormat === 'mp3' || form.targetFormat === 'wav'" class="hint">
        目标格式是音频容器，无法保存视频轨，此选项无效。
      </div>
      <div v-else class="hint">
        灰掉的选项与当前目标格式不兼容。例如 VP9 只能配 WebM。
      </div>
    </el-form-item>

    <el-form-item label="音频编码器">
      <el-select
          v-model="form.audioCodec"
          :disabled="form.extractMode === 'video'"
      >
        <el-option label="不重新编码" value="copy" :disabled="!codecMap[form.targetFormat]?.audio.includes('copy')" />
        <el-option label="AAC" value="aac" :disabled="!codecMap[form.targetFormat]?.audio.includes('aac')" />
        <el-option label="MP3" value="libmp3lame" :disabled="!codecMap[form.targetFormat]?.audio.includes('libmp3lame')" />
        <el-option label="Opus" value="libopus" :disabled="!codecMap[form.targetFormat]?.audio.includes('libopus')" />
        <el-option label="PCM" value="pcm_s16le" :disabled="!codecMap[form.targetFormat]?.audio.includes('pcm_s16le')" />
      </el-select>
      <div v-if="form.extractMode === 'video'" class="hint">
        已选择「只提取视频」，音频轨被丢弃，此选项无效。
      </div>
      <div v-else class="hint">
        灰掉的选项与当前目标格式不兼容。例如 MP4 只支持 ACC
      </div>
    </el-form-item>

    <!-- audioBitrate: 音频码率（copy / wav 时置灰） -->
    <el-form-item label="音频码率">
      <el-select
          v-model="form.audioBitrate"
          :disabled="form.audioCodec === 'copy' || form.targetFormat === 'wav'"
      >
        <el-option label="96k（体积小）" value="96k" />
        <el-option label="128k（推荐）" value="128k" />
        <el-option label="192k（音质好）" value="192k" />
        <el-option label="320k（接近无损）" value="320k" />
      </el-select>
      <div v-if="form.audioCodec === 'copy'" class="hint">
        不重新编码时，码率由原文件决定，此选项无效。
      </div>
      <div v-else-if="form.targetFormat === 'wav'" class="hint">
        WAV 是无损格式，码率由采样率决定，此选项无效。
      </div>
    </el-form-item>

    <!-- outputDir: 输出目录 -->
    <el-form-item label="输出目录(建议此处使用全英文路径)">
      <el-input v-model="form.outputDir" placeholder="converted" />
    </el-form-item>

    <!-- suffix: 文件名后缀 -->
    <el-form-item label="文件名后缀(建议此处使用英文)">
      <el-input v-model="form.suffix" placeholder="_converted" />
    </el-form-item>

    <!-- skipExisting: boolean -->
    <el-form-item label="跳过已存在">
      <el-switch v-model="form.skipExisting" />
      <div class="hint">输出目录里已有同名文件时，跳过不处理。</div>
    </el-form-item>

    <!-- overwrite: boolean -->
    <el-form-item label="覆盖输出">
      <el-switch
          v-model="form.overwrite"
          :disabled="form.skipExisting"
      />
      <div v-if="form.skipExisting" class="hint">
        已开启「跳过已存在」，覆盖输出不会生效。
        关闭「跳过已存在」后，此开关才起作用。
      </div>
      <div v-else class="hint">
        FFmpeg 处理时，如果输出文件已存在，直接覆盖，不询问。
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

<!--
================================================================================
  参数说明与推荐值
================================================================================

【targetFormat · 目标格式】
  作用：决定输出文件用哪种容器格式。

  视频格式：
  - mp4：兼容性最好，网页、手机、剪辑软件都认。但只支持特定编码组合（H.264/H.265 + AAC）。
  - mkv：万能容器，几乎什么编码都能塞。缺点是不适合网页直接播放，部分播放器不支持。
  - mov：苹果生态，剪辑软件常用。本质和 mp4 类似，但兼容性稍差。
  - webm：网页友好，配 VP9/Opus，开源免费。适合网页嵌入。
  - avi：老格式，兼容旧设备。编码支持有限，不适合现代视频。

  音频格式：
  - mp3：只抽音频，丢弃视频轨。兼容性最好，任何设备都能播。
  - wav：无损音频，体积大。适合存档或后期处理。

  推荐：
  - 通用场景 → mp4
  - 需要塞多音轨/字幕 → mkv
  - 网页嵌入 → webm
  - 老设备播放 → mp4 或 avi
  - 只想要声音 → mp3

--------------------------------------------------------------------------------

【videoCodec · 视频编码器】
  作用：决定视频流用什么编码格式。
  当 targetFormat 是 mp3 / wav 时，此项无效（视频轨被丢弃）。

  - copy：不重新编码，直接复制视频流。最快，体积不变。但要求目标容器兼容原编码，否则报错。
  - libx264：H.264，兼容性最好。
  - libx265：H.265，体积更小，老设备可能不支持。
  - libvpx-vp9：VP9，配 webm 用，网页友好。

  推荐：
  - 只想换容器、不改画质 → copy
  - 通用场景 → libx264
  - 追求体积 → libx265
  - 目标格式 webm → libvpx-vp9

  ⚠️ copy 的兼容性：
  - mp4 → mkv：✅ 通常可以
  - mkv → mp4：⚠️ 取决于原编码
  - mp4 → webm：❌ H.264 不能塞进 webm
  - 不确定 → 不要用 copy

--------------------------------------------------------------------------------

【audioCodec · 音频编码器】
  作用：决定音频流用什么编码格式。

  - copy：不重新编码，直接复制音频流。最快。要求目标容器兼容原编码。
  - aac：兼容性最好，mp4/mkv/mov 都认。
  - libmp3lame：MP3，老设备友好。
  - libopus：Opus，配 webm 用，同码率音质最好。
  - pcm_s16le：无损 PCM，配 wav 用。

  推荐：
  - 只想换容器 → copy
  - 通用场景 → aac
  - 目标格式 webm → libopus
  - 目标格式 wav → pcm_s16le
  - 目标格式 mp3 → libmp3lame

--------------------------------------------------------------------------------

【audioBitrate · 音频码率】
  作用：控制音频质量和体积。
  仅在 audioCodec 不是 copy 时生效。
  wav（PCM）是无损格式，此参数无效。

  - 96k：体积小，音质一般，适合语音。
  - 128k：默认平衡，适合大多数视频。
  - 192k：音质好，适合音乐。
  - 320k：接近 MP3 上限，适合高质量音乐存档。

  推荐：
  - 语音 / 网课 → 96k
  - 日常视频 → 128k
  - 音乐 → 192k 或 320k

  ⚠️ 注意：如果源音频码率低于你选的码率，会"升码率"，文件反而变大。

--------------------------------------------------------------------------------

【outputDir · 输出目录】
  作用：转换后的文件放在哪个文件夹。
  默认 converted，脚本会在当前目录下自动创建。

  推荐：保持默认 converted，方便和原文件区分。

--------------------------------------------------------------------------------

【suffix · 文件名后缀】
  作用：输出文件的命名后缀，避免覆盖原文件。
  默认 _converted，例如 a.mp4 → a_converted.mkv。

  推荐：保持默认。留空则直接替换扩展名（有覆盖风险）。

--------------------------------------------------------------------------------

【overwrite · 覆盖输出】
  作用：FFmpeg 处理时，如果输出文件已存在，是否直接覆盖。
  批处理脚本里必须开启，否则 FFmpeg 会卡在询问。

  推荐：保持开启。

================================================================================

【典型场景推荐组合】

1. MP4 转 MKV（只换容器，不重编码）
   targetFormat: mkv | videoCodec: copy | audioCodec: copy
   （最快，几秒完成，画质音质完全不变）

2. MOV 转 MP4（苹果视频转通用格式）
   targetFormat: mp4 | videoCodec: libx264 | audioCodec: aac | audioBitrate: 128k

3. MP4 转 WebM（网页嵌入）
   targetFormat: webm | videoCodec: libvpx-vp9 | audioCodec: libopus | audioBitrate: 128k

4. 视频提取 MP3（只留声音）
   targetFormat: mp3 | audioCodec: libmp3lame | audioBitrate: 192k

5. 视频提取 WAV（无损音频，用于后期）
   targetFormat: wav | audioCodec: pcm_s16le

6. 老设备兼容（旧电视、旧播放器）
   targetFormat: avi | videoCodec: libx264 | audioCodec: libmp3lame | audioBitrate: 128k

7. 不确定选什么
   保持默认：targetFormat: mp4 | videoCodec: copy | audioCodec: copy

================================================================================
-->