<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
</script>

<template>
  <el-button type="primary" @click="drawer = true">查看安装指南</el-button>

  <el-drawer v-model="drawer" title="FFmpeg 安装指南" size="50%">
    <el-alert
        title="Windows 10/11推荐使用方式一，方便快捷"
        type="info"
        :closable="false"
        show-icon
    />

    <h3>方式一：一行命令解决（推荐）</h3>
    <p>适合 Windows 10/11 用户，系统自带 winget（安装工具）</p>
    <ol>
      <li>按 <strong>Win 键</strong>，搜索 <code>PowerShell</code>。</li>
      <li>右键，选择 <strong>以管理员身份运行</strong>。</li>
      <li>复制以下命令粘贴至命令行中
        <pre>winget install ffmpeg</pre>
        随后回车执行
      </li>
      <li>等待 1-2 分钟安装完成。</li>
      <li>关闭 PowerShell，重新打开 CMD，输入验证：
        <pre>ffmpeg -version</pre>
      </li>
    </ol>
    <el-collapse>
      <el-collapse-item name="manual">
        <template #title>
          <span class="float-emoji">❓</span>
          <span>使用 winget 下载失败 / 很慢怎么办？</span>
        </template>
          <ol>
            <p>原因：winget 默认从 GitHub 下载，国内网络可能连不上。</p>
            <p>解决方法：换成国内镜像源</p>
            <ol>
              <li>以管理员身份打开 PowerShell</li>
              <li>执行：
                <pre>winget source remove winget</pre>
                <pre>winget source add winget https://mirrors.ustc.edu.cn/winget-source --trust-level trusted</pre>
              </li>
              <li> 重新执行安装命令：
                  <pre>winget install ffmpeg</pre>
                <p>换源后下载速度应该会明显变快。</p>
              </li>
            </ol>
          </ol>
      </el-collapse-item>
    </el-collapse>

    <h3>方式二：手动下载安装（备选）</h3>
    <el-collapse>
      <el-collapse-item title="点击展开详细步骤" name="manual">
        <ol>
          <li>访问下载页：
            <pre>https://www.gyan.dev/ffmpeg/builds/</pre>
          </li>
          <li>下载 <code>ffmpeg-release-essentials.zip</code>。</li>
          <li>解压到 <code>C:\ffmpeg\</code>，确认有 <code>C:\ffmpeg\bin\ffmpeg.exe</code>。</li>
          <li>把 <code>C:\ffmpeg\bin</code> 加入系统 PATH 环境变量。</li>
          <li>重新打开 CMD，输入 <code>ffmpeg -version</code> 验证。</li>
        </ol>
      </el-collapse-item>
    </el-collapse>

<!--    <h3>方式三：一键安装脚本（懒人）</h3>-->
<!--    <p>下载脚本，右键「以管理员身份运行」，自动安装 FFmpeg。</p>-->
<!--    <el-button type="primary">下载 install-ffmpeg.bat</el-button>-->

    <h3>验证安装是否成功</h3>
    <p>打开 CMD，输入：</p>
    <pre>ffmpeg -version</pre>
    <p>显示版本号即安装成功。</p>

    <h3>安装失败怎么办</h3>
    <el-collapse>
      <el-collapse-item title="ffmpeg 不是内部或外部命令" name="not-found">
        <p>FFmpeg 没安装，或没加入 PATH。</p>
        <p>解决：确认安装，确认 <code>C:\ffmpeg\bin</code> 在 PATH 里，关闭所有 CMD 重新打开。</p>
      </el-collapse-item>
      <el-collapse-item title="winget 不是内部或外部命令" name="no-winget">
        <p>系统太老，没有 winget。请用方式二手动安装。</p>
      </el-collapse-item>
      <el-collapse-item title="安装了但还是找不到 ffmpeg" name="path">
        <p>PATH 没生效。关闭所有 CMD / PowerShell，重新打开，或重启电脑。</p>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>

<style scoped>
h3 {
  margin: 20px 0 8px;
  font-size: 16px;
}

p {
  margin: 6px 0;
  line-height: 1.6;
}

pre {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin: 6px 0;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

ol {
  padding-left: 20px;
}

li {
  margin: 6px 0;
  line-height: 1.6;
}

.el-alert {
  margin-bottom: 16px;
}
</style>
