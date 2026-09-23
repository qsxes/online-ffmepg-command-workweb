import type { ConvertForm } from '@/types/form'

/**
 * 生成格式转换模式下的 ffmpeg 命令片段
 *
 * ⚠️ 依赖 .bat 上下文：
 * - %%F      .bat 循环变量，代表当前处理的文件
 * - %%~nF    .bat 语法，取文件名（不含扩展名）
 * - %OUT%    .bat 中定义的输出目录
 */
export function buildConvertBatCommand(form: ConvertForm): string {
    const parts: string[] = ['ffmpeg', '-hide_banner', '-loglevel', 'error','-stats', '-y']

    // 输入
    parts.push('-i', '"%%F"')

    // ============================================================
    // 判断两个关键维度
    // ============================================================

    // 目标是不是音频容器
    const isAudioTarget = form.targetFormat === 'mp3' || form.targetFormat === 'wav'

    // 最终是否保留音频
    // - 目标是视频容器 + extractMode = 'video' → 不要音频
    // - 其他情况 → 要音频
    const keepAudio = !(form.extractMode === 'video' && !isAudioTarget)

    // 最终是否保留视频
    // - 目标是音频容器 → 不要视频
    // - extractMode = 'audio' → 不要视频
    // - 其他情况 → 要视频
    const keepVideo = !isAudioTarget && form.extractMode !== 'audio'

    // ============================================================
    // 视频轨处理
    // ============================================================

    if (keepVideo) {
        parts.push('-c:v', form.videoCodec)
    } else {
        parts.push('-vn')
    }

    // ============================================================
    // 音频轨处理
    // ============================================================

    if (keepAudio) {
        // 目标容器是音频格式时，copy 可能不兼容（比如 AAC 塞不进 MP3）
        // 自动修正：目标 mp3 且用户选了 copy → 用 libmp3lame
        //           目标 wav 且用户选了 copy → 用 pcm_s16le
        let audioCodec = form.audioCodec

        if (isAudioTarget && audioCodec === 'copy') {
            audioCodec = form.targetFormat === 'mp3' ? 'libmp3lame' : 'pcm_s16le'
        }

        parts.push('-c:a', audioCodec)

        // 音频码率：copy 不需要，wav 是无损
        if (audioCodec !== 'copy' && form.targetFormat !== 'wav') {
            parts.push('-b:a', form.audioBitrate)
        }
    } else {
        parts.push('-an')
    }

    // 输出
    parts.push(`"%OUT%\\%%~nF${form.suffix}.${form.targetFormat}"`)

    return parts.join(' ')
}