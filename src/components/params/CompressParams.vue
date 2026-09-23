<template>
  <h3>编码器</h3>
  <p>决定视频用什么编码格式存储。</p>
  <ul>
    <li><strong>H.264（libx264）</strong>：兼容性最好，手机、电视、浏览器、剪辑软件全认</li>
    <li><strong>H.265（libx265）</strong>：同画质下体积约小 30%-50%，但老设备可能不支持</li>
  </ul>
  <p><strong>推荐：</strong>不确定给谁看 → H.264；自己存档、设备新 → H.265；上传到微信 / B站 → H.264</p>

  <h3>画质 CRF</h3>
  <p>恒定质量因子，控制画质和体积的平衡。<strong>数字越小画质越好、文件越大。</strong></p>
  <ul>
    <li>18：视觉无损，文件很大，适合高质量存档</li>
    <li>20：画质很好，文件较大</li>
    <li>23：默认值，平衡，适合大多数场景</li>
    <li>26：画质可接受，体积明显减小</li>
    <li>28：画质一般，体积最小，适合预览或发送</li>
  </ul>
  <p><strong>推荐：</strong>高画质存档 → 18-20；日常压缩 → 23；节省空间 → 26-28</p>
  <p><strong>⚠️ 注意：</strong>如果源视频已经被压缩过（如从 B 站下载），CRF 要调高一点（26-28）才有明显效果。</p>

  <h3>编码速度 preset</h3>
  <p>决定编码器花多少时间换压缩效率。<strong>不影响画质，只影响速度和体积。</strong></p>
  <ul>
    <li>ultrafast：最快，文件最大</li>
    <li>fast：较快，体积略大</li>
    <li>medium：默认，平衡</li>
    <li>slow：最慢，同画质下体积最小（比 medium 小 5%-10%）</li>
  </ul>
  <p><strong>推荐：</strong>赶时间 / 测试 → ultrafast 或 fast；日常 → medium；存档 → slow</p>

  <h3>分辨率</h3>
  <p>把视频缩放到指定高度，宽度按比例自动计算。</p>
  <ul>
    <li>source：保持原始分辨率，不缩放</li>
    <li>1080：缩到 1920x1080</li>
    <li>720：缩到 1280x720</li>
    <li>480：缩到 854x480</li>
  </ul>
  <p><strong>⚠️ 注意：</strong>如果源分辨率低于目标，会被"放大"，反而增大体积、损失画质。所以默认选「保持原始」。</p>
  <p><strong>推荐：</strong></p>
  <ul>
    <li>源 4K / 2K，想省空间 → 1080p</li>
    <li>源 1080p，想省空间 → 720p</li>
    <li>源 720p 或更低 → 保持原始（不要选 1080p）</li>
    <li>手机拍摄 → 1080p</li>
    <li>网课 / 监控 → 720p 或 480p</li>
  </ul>

  <h3>音频码率</h3>
  <p>控制音频质量和体积。</p>
  <ul>
    <li>96k：体积小，适合语音、网课</li>
    <li>128k：默认，适合大多数视频</li>
    <li>192k：音质好，适合音乐类视频</li>
  </ul>
  <p><strong>⚠️ 注意：</strong>如果源音频码率低于你选的码率，会"升码率"，文件反而变大。</p>
  <p><strong>推荐：</strong>语音 / 网课 → 96k；日常 → 128k；音乐 MV → 192k</p>

  <h3>输出目录 / 后缀</h3>
  <p><strong>输出目录：</strong>压缩后的视频放在脚本所在目录下的这个文件夹里，脚本会自动创建。默认 <code>finished</code>。</p>
  <p><strong>后缀：</strong>输出文件名后缀，避免覆盖原文件。默认 <code>_finished</code>，即 <code>a.mp4 → a_finished.mp4</code>。</p>

  <h3>跳过已存在</h3>
  <p>输出目录里已有同名文件时，跳过不处理。</p>
  <ul>
    <li><strong>开启（推荐）：</strong>脚本中断后再跑不会重复处理</li>
    <li><strong>关闭：</strong>会重新处理所有文件并覆盖旧输出</li>
  </ul>

  <el-divider />

  <h3>典型场景推荐组合</h3>
  <p><strong>1. 手机拍摄视频，想发给朋友 / 微信</strong></p>
  <pre>H.264 · CRF 23 · medium · 1080p · 音频 128k</pre>
  <p><strong>2. 4K 视频，想存到 NAS 省空间</strong></p>
  <pre>H.265 · CRF 24 · slow · 1080p · 音频 128k</pre>
  <p><strong>3. B 站下载的视频，想再压小一点</strong></p>
  <pre>H.264 · CRF 26 · medium · 保持原始 · 音频 96k</pre>
  <p><strong>4. 网课录像 / 会议记录，体积优先</strong></p>
  <pre>H.265 · CRF 28 · slow · 720p · 音频 96k</pre>
  <p><strong>5. 高质量存档，画质优先</strong></p>
  <pre>H.264 · CRF 18 · slow · 保持原始 · 音频 192k</pre>
  <p><strong>6. 不确定选什么</strong></p>
  <pre>保持默认：H.264 · CRF 23 · medium · 保持原始 · 音频 128k</pre>
</template>

<style scoped src="../../assets/paramsCss.css">

</style>