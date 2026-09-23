<script setup lang="ts">
import type { MergeForm } from '@/types/form'

const form = defineModel<MergeForm>({ required: true })
</script>

<template>
  <el-form label-width="140px" label-position="top">
    <el-form-item label="输入文件格式">
      <el-select v-model="form.inputPattern">
        <el-option label="MP4 视频（*.mp4）" value="*.mp4" />
        <el-option label="MP3 音频（*.mp3）" value="*.mp3" />
        <el-option label="TS 视频（*.ts）" value="*.ts" />
        <el-option label="MKV 视频（*.mkv）" value="*.mkv" />
      </el-select>
    </el-form-item>

    <el-form-item label="合并模式">
      <el-radio-group v-model="form.mode">
        <el-radio value="copy">快速合并（秒级，要求格式一致）</el-radio>
        <el-radio value="reencode">重新编码（慢，但兼容性好）</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="输出文件名">
      <el-input v-model="form.outputName" placeholder="merged" />
    </el-form-item>

    <el-form-item label="输出目录">
      <el-input v-model="form.outputDir" placeholder="merged" />
    </el-form-item>

    <el-form-item label="输出文件已存在时">
      <el-switch v-model="form.skipExisting" />
      <div class="hint">
        开启后，如果输出文件已存在，跳过不处理
        关闭后，会覆盖旧文件
      </div>
    </el-form-item>

    <el-alert type="info" :closable="false">
      <p>脚本会按文件名的自然顺序(0-9,a-z,无法识别拼音)合并，例如：1.mp4 → 2.mp4 → 10.mp4</p>
      <p>把 .bat 放到有视频的文件夹，双击运行。</p>
    </el-alert>
  </el-form>
</template>

<style scoped>
</style>