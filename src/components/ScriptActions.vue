<script setup lang="ts">
import {ElMessage} from "element-plus";

const props = defineProps<{
  script: string //运行bat文件
  fileName: string
}>()

const downloadBat=(content: string)=> {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.fileName
    a.click()
    URL.revokeObjectURL(url)
}

const copyScript= async (content: string)=>{
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动选择复制')
  }
}
</script>

<template>
<el-button @click="downloadBat(script)">点击下载ffmepg命令.bat文件(点击运行)</el-button>
  <el-button @click="copyScript(script)">点击复制ffmepg命令(复制脚本内容)</el-button>
</template>

<style scoped>

</style>