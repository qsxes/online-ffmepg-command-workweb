<template>
  <h3>选择文件</h3>
  <p>选择一个视频或音频文件，浏览器会<strong>在本地加载预览</strong>，文件不上传。</p>
  <p>支持：mp4 · mkv · mov · avi · webm · ts · mp3 · wav · m4a · flac · aac · ogg</p>

  <h3>设置入点 / 出点</h3>
  <p>拖动进度条到位置，点「用当前进度」自动填入时间。</p>
  <p>也可以手动输入，格式支持：</p>
  <pre>00:01:23.450    ← 完整格式
01:23           ← 分:秒
83.45           ← 纯秒数</pre>

  <h3>片段列表</h3>
  <p>每条记录是一个时间段，对应一条 ffmpeg 命令。</p>
  <ul>
    <li><strong>整体预览</strong>：从入点播到出点，看裁剪效果</li>
    <li><strong>入点 / 出点</strong>：跳到入点或出点位置，显示静态帧</li>
    <li><strong>编辑</strong>：把片段时间回填到输入框，修改后保存</li>
    <li><strong>删除</strong>：移除该片段</li>
  </ul>
  <p><strong>支持多条片段</strong>，输出为 <code>video_cut_1.mp4</code>、<code>video_cut_2.mp4</code>...</p>

  <h3>裁剪方式</h3>

  <p><strong>快速裁剪（-c copy）</strong></p>
  <ul>
    <li>不重新编码，秒级完成</li>
    <li><strong>只在关键帧处切</strong>，起始点可能有 1-2 秒偏差</li>
    <li>适合：剪个大概，不要求精确</li>
  </ul>

  <p><strong>精确裁剪（重编码）</strong></p>
  <ul>
    <li>逐帧解码后重新编码，帧级精确</li>
    <li>慢，10 分钟视频可能要几分钟</li>
    <li>适合：需要精确到帧的场景</li>
  </ul>

  <p><strong>推荐：</strong>日常裁剪 → 快速；需要精确 → 精确</p>

  <h3>输出目录 / 后缀</h3>
  <p><strong>输出目录：</strong>默认 <code>cut</code>。</p>
  <p><strong>后缀：</strong>默认 <code>_cut</code>，即 <code>video.mp4 → video_cut_1.mp4</code>。</p>
  <p><strong>多次裁剪同一视频：</strong>请修改后缀（如 <code>_cut2</code>），避免覆盖上次的裁剪结果。</p>

  <h3>跳过已存在</h3>
  <p>输出文件已存在时跳过不处理。避免重复跑时覆盖旧结果。</p>

  <el-divider />

  <h3>常见问题</h3>
  <p><strong>Q：裁剪位置偏移 1-2 秒？</strong></p>
  <p>快速裁剪只能在关键帧切。改用「精确裁剪（重编码）」可帧级精确。</p>

  <p><strong>Q：预览画面和实际裁剪位置不一致？</strong></p>
  <p>浏览器的视频 seek 精度有限，预览是近似帧。实际裁剪位置由 FFmpeg 决定，精确模式会更准确。</p>

  <p><strong>Q：支持裁剪音频吗？</strong></p>
  <p>支持。选音频文件后，预览区会变成音频播放器，操作方式和视频一样。</p>

  <p><strong>Q：能一次剪很多段吗？</strong></p>
  <p>可以。每条片段独立输出一个文件。</p>
</template>

<style scoped src="../../assets/paramsCss.css">
</style>