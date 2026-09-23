<template>
  <h3>输入音频格式</h3>
  <p>脚本会遍历当前文件夹里的这类音频文件，逐个转换。</p>
  <p><strong>常见：</strong>mp3 · wav · m4a · flac · aac · ogg · opus</p>
  <p><strong>特殊：</strong>amr（安卓通话录音）· ape（老无损）· 3gp（老安卓录音）· wma（Windows）</p>

  <h3>目标格式</h3>
  <ul>
    <li><strong>MP3</strong>：通用，任何设备都能播。有损</li>
    <li><strong>WAV</strong>：无损，体积大。适合存档或后期</li>
    <li><strong>M4A</strong>：AAC 封装。现代设备首选</li>
    <li><strong>AAC</strong>：裸流。少见，一般用 M4A</li>
    <li><strong>FLAC</strong>：无损压缩。体积比 wav 小，音质不损失</li>
    <li><strong>OGG</strong>：Opus 封装。开源，同码率音质最好</li>
  </ul>

  <p><strong>推荐：</strong>通用 / 车载 → mp3；存档 / 后期 → wav 或 flac；现代设备 → m4a</p>

  <h3>音频编码器</h3>
  <p>目标格式决定可用的编码器。<strong>灰掉的选项与当前目标格式不兼容。</strong></p>
  <ul>
    <li><strong>copy</strong>：不重新编码，仅换容器。只有源和目标编码一致时才可用</li>
    <li><strong>libmp3lame</strong>：MP3 编码器</li>
    <li><strong>aac</strong>：AAC 编码器（配 m4a / aac）</li>
    <li><strong>libopus</strong>：Opus 编码器（配 ogg）</li>
    <li><strong>flac</strong>：FLAC 无损编码器</li>
    <li><strong>pcm_s16le</strong>：PCM 无损编码器（配 wav）</li>
  </ul>

  <h3>音频码率</h3>
  <p>仅在音频编码器不是 copy 时生效。wav（PCM）和 flac 是无损格式，此参数无效。</p>
  <ul>
    <li>96k：体积小，适合语音</li>
    <li>128k：默认，平衡</li>
    <li>192k：音质好，适合音乐</li>
    <li>320k：接近 MP3 上限，适合高质量音乐</li>
  </ul>
  <p><strong>⚠️ 注意：</strong>如果源音频码率低于你选的码率，会"升码率"，文件反而变大。</p>
  <p><strong>推荐：</strong>语音 / 网课 → 96k；日常 → 128k；音乐 → 192k 或 320k</p>

  <h3>语音识别预设（ASR）</h3>
  <p>开启后，自动输出 <strong>16kHz / 单声道 / WAV</strong> 格式，适合喂给：</p>
  <ul>
    <li>Whisper（本地语音识别）</li>
    <li>通义听悟、飞书妙记</li>
    <li>各种在线 ASR 服务</li>
  </ul>
  <p>开启时其他参数（目标格式、编码器、码率）会被自动覆盖。</p>

  <h3>输出目录 / 后缀</h3>
  <p><strong>输出目录：</strong>默认 <code>converted</code>。</p>
  <p><strong>后缀：</strong>默认 <code>_converted</code>，即 <code>a.mp3 → a_converted.wav</code>。</p>

  <h3>跳过已存在</h3>
  <p>输出文件已存在时跳过不处理。</p>

  <el-divider />

  <h3>常见问题</h3>
  <p><strong>Q：音质变差了？</strong></p>
  <p>有损转有损必然有损失。要减少损失，码率选 192k 或 320k。</p>

  <p><strong>Q：MP3 转 WAV 有意义吗？</strong></p>
  <p>音质不会变好（MP3 已经损失了信息），但某些剪辑软件只认 WAV，所以有时候需要转。体积会变大。</p>

  <p><strong>Q：flac 转 mp3 会变差吗？</strong></p>
  <p>会。flac 是无损，mp3 是有损。但 mp3 320k 已经很接近原音，普通设备听不出区别。</p>
</template>

<style scoped src="../../assets/paramsCss.css">
</style>