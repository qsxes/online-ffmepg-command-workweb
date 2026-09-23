<template>
  <h3>输入文件格式</h3>
  <p>脚本会遍历当前文件夹里的这类文件，逐个转换。</p>
  <p>支持：mp4 · mkv · mov · avi · webm · ts</p>

  <h3>目标格式</h3>

  <p><strong>视频格式：</strong></p>
  <ul>
    <li><strong>MP4</strong>：兼容性最好，网页、手机、剪辑软件都认。只支持 H.264/H.265 + AAC 组合</li>
    <li><strong>MKV</strong>：万能容器，几乎什么编码都能塞。不适合网页直接播放</li>
    <li><strong>MOV</strong>：苹果生态，剪辑软件常用。本质和 mp4 类似，兼容性稍差</li>
    <li><strong>WebM</strong>：网页友好，配 VP9 / Opus，开源免费</li>
    <li><strong>AVI</strong>：老格式，兼容旧设备，编码支持有限</li>
  </ul>

  <p><strong>音频格式：</strong></p>
  <ul>
    <li><strong>MP3</strong>：只抽音频，视频轨丢弃。兼容性最好</li>
    <li><strong>WAV</strong>：无损音频，体积大，适合存档或后期处理</li>
  </ul>

  <p><strong>推荐：</strong>通用场景 → MP4；塞多音轨 / 字幕 → MKV；网页嵌入 → WebM；老设备 → MP4 或 AVI；只要声音 → MP3</p>

  <h3>提取模式</h3>
  <ul>
    <li><strong>正常转换</strong>：视频和音频都保留（目标是视频容器时）</li>
    <li><strong>只提取音频</strong>：丢弃视频轨，只保留音频</li>
    <li><strong>只提取视频</strong>：丢弃音频轨，只保留视频</li>
  </ul>
  <p><strong>注意：</strong>目标格式是 mp3 / wav 时，会自动只提取音频，不用手动切换。</p>

  <h3>视频编码器</h3>
  <p>决定视频流用什么编码格式。<strong>目标格式是 mp3 / wav 时此项无效（视频轨被丢弃）。</strong></p>
  <ul>
    <li><strong>copy</strong>：不重新编码，直接复制视频流。最快，体积不变。但要求目标容器兼容原编码</li>
    <li><strong>libx264</strong>：H.264，兼容性最好</li>
    <li><strong>libx265</strong>：H.265，体积更小，老设备可能不支持</li>
    <li><strong>libvpx-vp9</strong>：VP9，配 webm 用，网页友好</li>
  </ul>

  <p><strong>copy 的兼容性：</strong></p>
  <ul>
    <li>mp4 → mkv：✅ 通常可以</li>
    <li>mkv → mp4：⚠️ 取决于原编码</li>
    <li>mp4 → webm：❌ H.264 不能塞进 webm</li>
    <li>不确定 → 不要用 copy</li>
  </ul>

  <h3>音频编码器</h3>
  <ul>
    <li><strong>copy</strong>：不重新编码，直接复制音频流。最快。要求目标容器兼容原编码</li>
    <li><strong>aac</strong>：兼容性最好，mp4 / mkv / mov 都认</li>
    <li><strong>libmp3lame</strong>：MP3，老设备友好</li>
    <li><strong>libopus</strong>：Opus，配 webm 用，同码率音质最好</li>
    <li><strong>pcm_s16le</strong>：无损 PCM，配 wav 用</li>
  </ul>

  <p><strong>推荐：</strong>只换容器 → copy；通用 → aac；webm → libopus；wav → pcm_s16le；mp3 → libmp3lame</p>

  <h3>音频码率</h3>
  <p>仅在音频编码器不是 copy 时生效。wav（PCM）是无损格式，此参数无效。</p>
  <ul>
    <li>96k：体积小，适合语音</li>
    <li>128k：默认，平衡</li>
    <li>192k：音质好，适合音乐</li>
    <li>320k：接近 MP3 上限</li>
  </ul>

  <h3>输出目录 / 后缀</h3>
  <p><strong>输出目录：</strong>默认 <code>converted</code>。</p>
  <p><strong>后缀：</strong>默认 <code>_converted</code>，即 <code>a.mp4 → a_converted.mkv</code>。留空则直接替换扩展名（有覆盖原文件的风险）。</p>

  <h3>跳过已存在</h3>
  <p>输出文件已存在时跳过不处理。</p>

  <el-divider />

  <h3>典型场景</h3>
  <p><strong>1. MP4 转 MKV（只换容器，不重编码）</strong></p>
  <pre>目标 MKV · 视频 copy · 音频 copy   （秒级，画质音质不变）</pre>

  <p><strong>2. MOV 转 MP4（苹果视频转通用）</strong></p>
  <pre>目标 MP4 · 视频 libx264 · 音频 aac · 128k</pre>

  <p><strong>3. MP4 转 WebM（网页嵌入）</strong></p>
  <pre>目标 WebM · 视频 libvpx-vp9 · 音频 libopus · 128k</pre>

  <p><strong>4. 视频提取 MP3（只留声音）</strong></p>
  <pre>目标 MP3 · 音频 libmp3lame · 192k</pre>

  <p><strong>5. 视频提取 WAV（无损音频，用于后期）</strong></p>
  <pre>目标 WAV · 音频 pcm_s16le</pre>

  <p><strong>6. 老设备兼容（旧电视、旧播放器）</strong></p>
  <pre>目标 AVI · 视频 libx264 · 音频 libmp3lame · 128k</pre>
</template>

<style scoped src="../../assets/paramsCss.css">

</style>