<script setup lang="ts">
import type { FormState } from '@/types/form'

const form = defineModel<FormState>({ required: true })
</script>

<template>
  <el-form label-width="140px" label-position="top">
    <!-- codec: 'libx264' | 'libx265' 视频格式	用哪种格式存视频，影响兼容性 -->
    <el-form-item label="编码器">
      <el-select v-model="form.codec">
        <el-option label="H.264（兼容性好）" value="libx264" />
        <el-option label="H.265（体积更小）" value="libx265" />
      </el-select>
    </el-form-item>

    <!-- crf: number, 18-28 画质	数字越小越清晰、文件越大 -->
    <el-form-item :label="`画质 CRF：${form.crf}`">
      <el-slider v-model="form.crf" :min="18" :max="28" :step="1" />
    </el-form-item>

    <!-- preset: 'ultrafast' | 'fast' | 'medium' | 'slow' 压缩速度	越快越省时间，但文件可能更大 -->
    <el-form-item label="编码速度">
      <el-select v-model="form.preset">
        <el-option label="最快（文件最大）" value="ultrafast" />
        <el-option label="较快" value="fast" />
        <el-option label="平衡（推荐）" value="medium" />
        <el-option label="最慢（文件最小）" value="slow" />
      </el-select>
    </el-form-item>

    <!-- resolution: 'source' | '1080' | '720' | '480' 画面尺寸	视频的清晰度尺寸，越大越清晰 -->
    <el-form-item label="分辨率">
      <el-select v-model="form.resolution">
        <el-option label="保持原始" value="source" />
        <el-option label="1080p" value="1080" />
        <el-option label="720p" value="720" />
        <el-option label="480p" value="480" />
      </el-select>
    </el-form-item>

    <!-- audioBitrate: '96k' | '128k' | '192k' 声音质量	越高越好听，文件也越大 -->
    <el-form-item label="音频码率">
      <el-select v-model="form.audioBitrate">
        <el-option label="96k（体积小）" value="96k" />
        <el-option label="128k（推荐）" value="128k" />
        <el-option label="192k（音质好）" value="192k" />
      </el-select>
    </el-form-item>

    <!-- outputDir: string 保存到文件夹	压缩后的视频放哪 -->
    <el-form-item label="输出目录(建议此处使用全英文路径)">
      <el-input v-model="form.outputDir" placeholder="finished" />
    </el-form-item>

    <!-- suffix: string 新文件名加尾缀	避免覆盖原文件 -->
    <el-form-item label="文件名后缀(建议此处使用英文)">
      <el-input v-model="form.suffix" placeholder="_finished" />
    </el-form-item>

    <!-- skipExisting: boolean 已有结果就跳过	不重复处理 -->
    <el-form-item label="跳过已存在">
      <el-switch v-model="form.skipExisting" />
    </el-form-item>

    <!-- overwrite: boolean 自动覆盖同名文件	不弹窗询问 -->
    <el-form-item label="覆盖输出">
      <el-switch v-model="form.overwrite" />
    </el-form-item>
  </el-form>
</template>

<style scoped>
</style>

<!--
================================================================================
  参数说明与推荐值
================================================================================

【codec · 视频编码器】
  作用：决定视频用什么编码格式存储。
  - libx264（H.264）：兼容性最好，手机、电视、浏览器、剪辑软件全都认。
  - libx265（H.265）：同画质下体积约小 30%-50%，但老设备、部分播放器不支持。

  推荐：
  - 不确定给谁看 → libx264
  - 自己存档、设备较新 → libx265
  - 需要上传到网页/微信/B站 → libx264（兼容性优先）

--------------------------------------------------------------------------------

【crf · 画质（恒定质量因子）】
  作用：控制画质和体积的平衡。数字越小画质越好、文件越大。
  范围：0-51，常用 18-28。

  - 18：视觉无损，文件很大，适合高质量存档
  - 20：画质很好，文件较大
  - 23：默认平衡值，适合大多数场景
  - 26：画质可接受，体积明显减小
  - 28：画质一般，体积最小，适合只做预览或发送

  推荐：
  - 高画质存档 → 18-20
  - 日常压缩 → 23
  - 节省空间 → 26-28
  - 源视频已被压过一遍（如 B 站下载） → 26-28（再压空间有限）

--------------------------------------------------------------------------------

【preset · 编码速度】
  作用：决定编码器花多少时间换压缩效率。不影响画质，只影响速度与体积。
  - ultrafast：最快，文件最大
  - fast：较快，体积略大
  - medium：默认平衡，推荐
  - slow：最慢，同画质下体积最小（比 medium 小 5%-10%）

  推荐：
  - 赶时间 / 测试 → ultrafast 或 fast
  - 日常 → medium
  - 存档、批量处理不赶时间 → slow

--------------------------------------------------------------------------------

【resolution · 输出分辨率】
  作用：把视频缩放到指定高度，宽度按比例自动计算。
  - source：保持原始分辨率，不缩放
  - 1080：缩到 1920x1080
  - 720：缩到 1280x720
  - 480：缩到 854x480

  ⚠️ 注意：如果源分辨率低于目标，会被"放大"，反而增大体积、损失画质。
  所以默认选「保持原始」。

  推荐：
  - 源 4K / 2K，想省空间 → 1080p
  - 源 1080p，想省空间 → 720p
  - 源 720p → 保持原始（不要选 1080p，会放大）
  - 源 480p → 保持原始
  - 手机拍摄（多为 1080p / 4K） → 1080p
  - 网课录像、监控 → 720p 或 480p（内容简单，降分辨率不影响观看）
  - 不确定 → 保持原始

--------------------------------------------------------------------------------

【audioBitrate · 音频码率】
  作用：控制音频质量与体积。
  - 96k：体积小，音质一般，适合语音、网课
  - 128k：默认平衡，适合大多数视频
  - 192k：音质好，体积稍大，适合音乐类视频

  推荐：
  - 语音 / 网课 / 会议录像 → 96k
  - 日常视频 → 128k
  - 音乐 MV / 高质量内容 → 192k

  ⚠️ 注意：如果源音频码率低于你选的码率，会"升码率"，文件反而变大。
  例如源音频 64k，你选 128k，音频部分体积会翻倍。

--------------------------------------------------------------------------------

【outputDir · 输出目录】
  作用：压缩后的视频放在哪个文件夹。
  默认 compressed，脚本会在当前目录下自动创建。

  推荐：保持默认 compressed，方便和原文件区分。

--------------------------------------------------------------------------------

【suffix · 文件名后缀】
  作用：输出文件的命名后缀，避免覆盖原文件。
  默认 _compressed，例如 a.mp4 → a_compressed.mp4。

  推荐：保持默认。如果多次压缩，可改成 _v2、_small 等区分。

--------------------------------------------------------------------------------

【skipExisting · 跳过已存在】
  作用：如果输出目录里已经有同名文件，是否跳过。
  开启后，脚本中断再跑不会重复处理。

  推荐：保持开启。批量处理时尤其有用。

--------------------------------------------------------------------------------

【overwrite · 覆盖输出】
  作用：FFmpeg 处理时，如果输出文件已存在，是否直接覆盖。
  在批处理脚本里必须开启，否则 FFmpeg 会卡在询问，脚本停住。

  推荐：保持开启。配合 skipExisting 使用：
  - skipExisting 先判断，跳过的就不处理
  - 没跳过的，进入 FFmpeg 时用 -y 直接覆盖

================================================================================

【典型场景推荐组合】

1. 手机拍摄视频，想发给朋友 / 微信
   codec: libx264 | crf: 23 | preset: medium | resolution: 1080 | audio: 128k

2. 4K 视频，想存到 NAS 省空间
   codec: libx265 | crf: 24 | preset: slow | resolution: 1080 | audio: 128k

3. B 站下载的视频，想再压小一点
   codec: libx264 | crf: 26 | preset: medium | resolution: source | audio: 96k
   （B 站视频已被压缩，CRF 调高一点才有明显效果）

4. 网课录像、会议记录，体积优先
   codec: libx265 | crf: 28 | preset: slow | resolution: 720 | audio: 96k

5. 高质量存档，画质优先
   codec: libx264 | crf: 18 | preset: slow | resolution: source | audio: 192k

6. 不确定选什么
   保持默认：libx264 / CRF 23 / medium / source / 128k

================================================================================
-->