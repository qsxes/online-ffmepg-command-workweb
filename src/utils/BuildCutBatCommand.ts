import type { CutForm, CutSegment } from '@/types/form'

/**
 * 生成裁剪模式下单个片段的 ffmpeg 命令
 *
 * ⚠️ 依赖 .bat 上下文：
 * - %OUT% 是 .bat 中定义的输出目录
 *
 * 与压缩/转换不同，裁剪不使用 %%F 循环变量，
 * 而是针对固定的 fileName 生成多条命令，每条对应一个片段。
 *
 * @param form 裁剪表单
 * @param segment 单个片段（start / end）
 * @param index 片段序号（从 0 开始），用于生成输出文件名
 */
export function buildCutBatCommand(
    form: CutForm,
    segment: CutSegment,
    index: number
): string {
    const parts: string[] = ['ffmpeg', '-hide_banner', '-loglevel', 'error','-stats', '-y']

    // -ss / -to 放在 -i 前面：
    // 1. 快速 seek，不解码前面的内容
    // 2. -c copy 时精度更高（对齐最近关键帧）
    parts.push('-ss', segment.start)
    parts.push('-to', segment.end)

    // 输入
    parts.push('-i', `"${form.fileName}"`)

    // 编码模式
    if (form.mode === 'copy') {
        parts.push('-c', 'copy')
    } else {
        // 重编码：根据源是音频还是视频，用不同的编码参数
        const isAudio = isAudioFile(form.fileName)
        if (isAudio) {
            parts.push('-c:a', 'libmp3lame', '-b:a', '192k')
        } else {
            parts.push(
                '-c:v', 'libx264',
                '-crf', '23',
                '-preset', 'medium',
                '-c:a', 'aac',
                '-b:a', '128k',
            )
        }
    }

    // 输出文件名：原名 + suffix + 序号 + 原扩展名
    const outputName = buildOutputName(form.fileName, form.suffix, index)

    parts.push(`"%OUT%\\${outputName}"`)

    return parts.join(' ')
}

/**
 * 根据原文件名 + 后缀 + 序号，生成输出文件名
 *
 * video.mp4 + '_cut' + 0 → video_cut_1.mp4
 * audio.mp3 + '_cut' + 2 → audio_cut_3.mp3
 */
function buildOutputName(fileName: string, suffix: string, index: number): string {
    const dotIndex = fileName.lastIndexOf('.')
    if (dotIndex === -1) {
        // 没有扩展名，直接拼
        return `${fileName}${suffix}_${index + 1}`
    }
    const baseName = fileName.slice(0, dotIndex)
    const ext = fileName.slice(dotIndex)  // 含点，如 '.mp4'
    return `${baseName}${suffix}_${index + 1}${ext}`
}

/**
 * 判断文件是不是音频
 * 用于决定重编码模式下的编码参数
 */
function isAudioFile(fileName: string): boolean {
    const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma', '.amr', '.ape']
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
    return audioExts.includes(ext)
}