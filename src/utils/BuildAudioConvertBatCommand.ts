import type { AudioConvertForm } from '@/types/form'

/**
 * 生成音频格式转换的 ffmpeg 命令片段
 *
 * ⚠️ 依赖 .bat 上下文：
 * - %%F      .bat 循环变量，代表当前处理的文件
 * - %%~nF    .bat 语法，取文件名（不含扩展名）
 * - %OUT%    .bat 中定义的输出目录
 */
export function buildAudioConvertBatCommand(form: AudioConvertForm): string {
    const parts: string[] = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']

    if (form.asrPreset) {
        // ASR 预设：强制 wav + pcm_s16le + 16k + mono
        parts.push('-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le')
        parts.push(`"%OUT%\\%%~nF_asr.wav"`)
        return parts.join(' ')
    }
    // 输入
    parts.push('-i', '"%%F"')

    // 音频编码器
    let audioCodec = form.audioCodec

    // 兜底：目标是 wav/flac（无损）时，copy 一定不可用
    // 因为 wav 是 PCM，flac 是 FLAC，几乎不可能是源编码
    if (form.targetFormat === 'wav' && audioCodec === 'copy') {
        audioCodec = 'pcm_s16le'
    }
    if (form.targetFormat === 'flac' && audioCodec === 'copy') {
        audioCodec = 'flac'
    }

    parts.push('-c:a', audioCodec)

    // 音频码率：
    // - copy 时不适用
    // - wav（PCM）/ flac 是无损，也不需要
    const isLosslessTarget = form.targetFormat === 'wav' || form.targetFormat === 'flac'
    if (audioCodec !== 'copy' && !isLosslessTarget) {
        parts.push('-b:a', form.audioBitrate)
    }

    //m4a转acc特殊处理
    if (form.targetFormat === 'aac' && audioCodec === 'copy') {
        parts.push('-f', 'adts')
    }
    // 输出
    parts.push(`"%OUT%\\%%~nF${form.suffix}.${form.targetFormat}"`)

    return parts.join(' ')
}