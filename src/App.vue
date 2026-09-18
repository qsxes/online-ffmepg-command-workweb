<script setup lang="ts">
import {useScriptGenerator} from "@/composables/useScirptGenerator.ts";
import ParameterForm from '@/components/ParameterForm.vue'
import CommandPreview from '@/components/CommandPreview.vue'
import ScriptActions from '@/components/ScriptActions.vue'
import {computed} from "vue";

const { form, command, script } = useScriptGenerator()

const batFilename = computed(() => {
  const codec = form.codec === 'libx264' ? 'H264' : 'H265'
  const res = form.resolution === 'source' ? '原始分辨率' : `${form.resolution}p`
  return `批量压缩_${codec}_画质CRF${form.crf}_${res}.bat`
})
</script>

<template>
  <div class="app">
    <!-- header 独立，不在 grid 里 -->
    <header class="header">
      <h1>FFmpeg 批量压缩脚本生成器</h1>
      <p class="privacy">文件不会离开你的电脑。下载 .bat，双击运行，批量压缩当前文件夹的视频。</p>
    </header>

    <!-- 只有左右两栏参与 grid -->
    <main class="main">
      <section class="col">
        <ParameterForm v-model="form" />
      </section>

      <section class="col">
        <ScriptActions :script="script" :fileName="batFilename"/>
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