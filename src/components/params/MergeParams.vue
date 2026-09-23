<template>
  <h3>输入文件格式</h3>
  <p>脚本会按文件名自然顺序合并<strong>当前文件夹</strong>里的这类文件。</p>
  <p>支持：<code>*.mp4</code> · <code>*.mp3</code> · <code>*.ts</code> · <code>*.mkv</code></p>
  <p><strong>自然顺序：</strong>按文件名排序，能正确处理数字。例如：</p>
  <pre>1.mp4 → 2.mp4 → 10.mp4   （不是 1 → 10 → 2）</pre>
  <p><strong>注意：</strong>只支持字母、数字、下划线，无法识别拼音顺序。</p>

  <h3>合并模式</h3>

  <p><strong>快速合并（-c copy）</strong></p>
  <ul>
    <li>直接复制流，不重新编码</li>
    <li>秒级完成，画质音质无损</li>
    <li><strong>要求：</strong>所有文件的编码格式、分辨率、帧率、音频参数必须完全一致</li>
    <li>适合：同一设备录制的分段视频</li>
  </ul>

  <p><strong>重新编码</strong></p>
  <ul>
    <li>全部解码后重新编码，参数统一</li>
    <li>慢，10 分钟视频可能要几分钟</li>
    <li>任何视频都能合，兼容性最好</li>
    <li>适合：来源不同、参数不一致的视频</li>
  </ul>

  <p><strong>推荐：</strong>手机分段录像 / 摄像机分段 → 快速合并；来源杂 / 编码不一致 → 重新编码</p>

  <h3>输出文件名</h3>
  <p>合并后的文件名。默认 <code>merged</code>。</p>
  <p>如果不写扩展名，脚本会自动补上和输入格式一致的扩展名：</p>
  <pre>merged     → merged.mp4
merged.mkv → merged.mkv</pre>

  <h3>输出目录</h3>
  <p>合并后的文件放在脚本所在目录下的这个文件夹里。默认 <code>merged</code>。</p>

  <h3>跳过已存在</h3>
  <p>输出文件已存在时跳过不处理。</p>
  <ul>
    <li><strong>开启（推荐）：</strong>避免误覆盖，想重新合并需要先删掉旧文件或改输出名</li>
    <li><strong>关闭：</strong>每次运行都重新合并并覆盖</li>
  </ul>

  <el-divider />

  <h3>常见问题</h3>
  <p><strong>Q：合并后只有第一段有声音？</strong></p>
  <p>快速合并遇到编码不一致的文件时，后续段的音轨可能被丢掉。改用「重新编码」。</p>

  <p><strong>Q：合并失败报错？</strong></p>
  <p>快速合并最常见的失败原因是文件参数不一致。改用「重新编码」即可解决。</p>

  <p><strong>Q：合并后时长不对？</strong></p>
  <p>检查是否有文件损坏，或用播放器确认每个文件本身能正常播放。</p>
</template>

<style scoped src="../../assets/paramsCss.css">

</style>