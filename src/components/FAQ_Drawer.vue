<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
</script>

<template>
  <el-button type="primary" @click="drawer = true">常见问题</el-button>

  <el-drawer v-model="drawer" title="常见问题 FAQ" size="50%">

    <el-alert
        title="80% 的问题都能在这里找到答案。"
        type="info"
        :closable="false"
        show-icon
    />

    <!-- ============================================================ -->
    <h3>安装相关</h3>

    <el-collapse>
      <el-collapse-item title="❓ ffmpeg 不是内部或外部命令" name="no-ffmpeg">
        <p><strong>原因：</strong>没装 FFmpeg，或者装了但没加入 PATH。</p>
        <p><strong>解决：</strong></p>
        <ol>
          <li>确认 FFmpeg 已经安装（见「安装指南」）</li>
          <li>确认安装目录的 <code>bin</code> 文件夹加入了系统 PATH</li>
          <li>关闭所有 CMD / PowerShell 窗口，<strong>重新打开</strong></li>
          <li>输入 <code>ffmpeg -version</code> 验证</li>
        </ol>
      </el-collapse-item>

      <el-collapse-item title="❓ winget 下载失败 / 很慢" name="winget-slow">
        <p><strong>原因：</strong>winget 默认从 GitHub 下载，国内网络可能连不上。</p>
        <p><strong>解决：</strong>换成中科大镜像源。</p>
        <pre>winget source remove winget
winget source add winget https://mirrors.ustc.edu.cn/winget-source --trust-level trusted
winget install ffmpeg</pre>
      </el-collapse-item>

      <el-collapse-item title="❓ 装了 FFmpeg 但过几天又找不到了" name="winget-broken">
        <p><strong>原因：</strong>App Installer 更新时 PATH 可能失效。</p>
        <p><strong>解决：</strong>重新打开 PowerShell 执行：</p>
        <pre>Repair-WinGetPackageManager -Force -Latest</pre>
        <p>或者重新 <code>winget install ffmpeg</code>。</p>
      </el-collapse-item>
    </el-collapse>

    <!-- ============================================================ -->
    <h3>使用相关</h3>

    <el-collapse>
      <el-collapse-item title="❓ 下载的 .bat 应该放哪里？" name="where-bat">
        <p>放到<strong>你要处理的视频所在的文件夹</strong>，和视频文件放在一起。</p>
        <p>双击运行后，脚本会处理<strong>当前文件夹</strong>里的所有匹配文件，输出到子文件夹。</p>
        <p><strong>为什么不能自动定位？</strong>浏览器出于安全限制，拿不到文件的完整路径，所以脚本只能"处理自己所在文件夹"。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 为什么不能直接复制命令，非要下载 .bat？" name="why-bat">
        <p>命令里包含 <code>%%F</code>、<code>%OUT%</code> 等<strong>批处理专用变量</strong>，直接粘贴到 CMD 里会报错。</p>
        <p>这些变量只有在 .bat 文件里才生效。所以必须下载 .bat，双击运行。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 双击 .bat 闪退怎么办？" name="flash-exit">
        <p><strong>原因：</strong>脚本遇到错误直接退出了。</p>
        <p><strong>解决：</strong></p>
        <ol>
          <li>右键 .bat → <strong>在终端中打开</strong>，看完整输出</li>
          <li>或者：右键 .bat → 编辑，在最后一行看有没有 <code>pause</code></li>
        </ol>
        <p>最常见的闪退原因：<strong>没装 FFmpeg</strong>。见「安装指南」。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ Chrome 提示「可能有害」或「已屏蔽」" name="chrome-block">
        <p><strong>「可能有害」：</strong>点「保留」即可下载。Chrome 对所有 .bat 文件都会提示，不是脚本有问题。</p>
        <p><strong>「已屏蔽」：</strong>通常是文件名里出现了双扩展名（如 <code>video.mp4.bat</code>）。本工具已避免，如果遇到请联系反馈。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 输出文件在哪？" name="where-output">
        <p>输出文件在 .bat 同目录下的<strong>子文件夹</strong>里，名字由你设置的「输出目录」决定。</p>
        <p>默认：</p>
        <ul>
          <li>压缩 → <code>finished/</code></li>
          <li>合并 → <code>merged/</code></li>
          <li>转格式 → <code>converted/</code></li>
          <li>裁剪 → <code>cut/</code></li>
        </ul>
        <p>脚本会自动创建这些文件夹，如果不存在。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 想重新处理怎么办？" name="reprocess">
        <p>两种方式：</p>
        <ol>
          <li><strong>关闭「跳过已存在」</strong>：脚本会重新处理所有文件并覆盖旧输出</li>
          <li><strong>改文件名后缀</strong>（如 <code>_finished</code> → <code>_v2</code>）：生成新文件名，旧结果保留</li>
        </ol>
      </el-collapse-item>

      <el-collapse-item title="❓ 中文文件名 / 路径报错" name="chinese-path">
        <p>脚本已加 <code>chcp 65001</code> 支持中文。如果仍然报错：</p>
        <ol>
          <li>检查 CMD 字体是否支持中文（推荐 Consolas 或新宋体）</li>
          <li>尝试把文件移到<strong>无中文、无空格</strong>的路径（如 <code>D:\temp\</code>）</li>
          <li>如果问题持续，请反馈具体报错信息</li>
        </ol>
      </el-collapse-item>

      <el-collapse-item title="❓ 路径含空格 / & / % 报错" name="special-chars">
        <p>这些特殊字符在批处理里是转义重灾区。</p>
        <p><strong>已知情况：</strong></p>
        <ul>
          <li><strong>空格</strong>：脚本已用引号包裹，正常</li>
          <li><strong>&amp;</strong>：可能出问题，建议改文件名</li>
          <li><strong>%</strong>：批处理无法处理，必须改文件名</li>
        </ul>
        <p>如果报错，最简单的解决：<strong>改名去掉特殊字符</strong>。</p>
      </el-collapse-item>
    </el-collapse>

    <!-- ============================================================ -->
    <h3>功能相关</h3>

    <el-collapse>
      <el-collapse-item title="❓ 为什么压缩后文件反而变大？" name="bigger">
        <p><strong>可能原因：</strong></p>
        <ol>
          <li><strong>源视频已经被压缩过</strong>（比如从 B 站下载的），再压没效果</li>
          <li><strong>分辨率被放大</strong>：源 720p，你选 1080p，FFmpeg 会放大</li>
          <li><strong>音频码率被提升</strong>：源 64k，你选 128k，体积翻倍</li>
        </ol>
        <p><strong>解决：</strong>分辨率选「保持原始」，CRF 调到 26-28，音频选 96k。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 合并失败 / 只有第一段有声音" name="merge-fail">
        <p><strong>原因：</strong>快速合并（<code>-c copy</code>）要求所有视频的编码格式、分辨率、帧率完全一致。</p>
        <p><strong>解决：</strong>把「合并模式」改成「重新编码」，兼容性最好。</p>
        <p><strong>代价：</strong>慢，但任何视频都能合。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 裁剪位置偏移 1-2 秒" name="cut-offset">
        <p><strong>原因：</strong>快速裁剪（<code>-c copy</code>）只能在关键帧处切，不能精确到帧。</p>
        <p><strong>解决：</strong>把「裁剪方式」改成「精确裁剪（重编码）」，帧级精确。</p>
        <p><strong>代价：</strong>慢。10 分钟视频可能要几分钟。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 音频转格式后音质变差" name="audio-loss">
        <p><strong>原因：</strong>有损转有损必然有损失（如 m4a → mp3）。</p>
        <p><strong>减少损失：</strong>音频码率选 <code>192k</code> 或 <code>320k</code>。</p>
        <p><strong>无损方案：</strong>转成 wav 或 flac，但体积会变大很多。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 微信语音（.amr / .silk）能处理吗？" name="wechat-voice">
        <p><strong>.amr：</strong>可以，直接在音频转换里处理。</p>
        <p><strong>.silk：</strong>不能。这是腾讯自研格式，FFmpeg 不支持。</p>
        <p>需要先用第三方工具（如 silk2mp3）转成 mp3，再用本工具处理。</p>
      </el-collapse-item>
    </el-collapse>

    <!-- ============================================================ -->
    <h3>关于</h3>

    <el-collapse>
      <el-collapse-item title="❓ 这个工具会上传我的文件吗？" name="privacy">
        <p><strong>不会。</strong></p>
        <ul>
          <li>整个网站是纯前端，<strong>没有服务器</strong></li>
          <li>浏览器只读取文件的元数据（文件名、大小），不读取内容</li>
          <li>所有处理都在你本地用 FFmpeg 完成</li>
          <li>生成的 .bat 也只在你电脑上运行</li>
        </ul>
        <p>可以断网测试：打开网页、生成脚本、运行 .bat，全程不需要联网。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 收费吗？" name="price">
        <p>完全免费，开源，无广告，无需注册。</p>
        <p>项目部署在 GitHub Pages 上，没有服务器成本。</p>
      </el-collapse-item>

      <el-collapse-item title="❓ 支持 macOS / Linux 吗？" name="other-os">
        <p>目前只支持 Windows（生成 .bat 脚本）。</p>
        <p>macOS / Linux 理论上可以用 <code>.sh</code> 脚本，但还没做。有需求的话后续考虑。</p>
      </el-collapse-item>
    </el-collapse>

    <el-divider />

    <p style="color: #909399; font-size: 13px;">
      找不到答案？
      <a href="https://github.com/qsxes/online-ffmepg-command-workweb/issues" target="_blank">
        去 GitHub 提 Issue
      </a>
    </p>

  </el-drawer>
</template>

<style scoped>
h3 {
  margin: 24px 0 12px;
  font-size: 15px;
  color: #303133;
}

h3:first-of-type {
  margin-top: 16px;
}

p {
  margin: 6px 0;
  line-height: 1.6;
  font-size: 14px;
}

ol, ul {
  padding-left: 20px;
  margin: 6px 0;
}

li {
  margin: 4px 0;
  line-height: 1.6;
  font-size: 14px;
}

pre {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin: 8px 0;
  overflow-x: auto;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  font-family: Consolas, Monaco, monospace;
}

.el-alert {
  margin-bottom: 16px;
}

.el-collapse {
  margin-bottom: 8px;
}
</style>