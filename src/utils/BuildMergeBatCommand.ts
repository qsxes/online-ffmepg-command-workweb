import type { MergeForm } from '@/types/form'

/**
 * 生成合并模式下的 ffmpeg 命令片段
 *
 * ⚠️ 依赖 .bat 上下文：
 * - %LIST% 是 .bat 中定义的临时列表文件
 * - %OUT%  是 .bat 中定义的输出目录
 */
export function buildMergeBatCommand(form: MergeForm): string {
    const parts: string[] = [
        'ffmpeg',
        '-hide_banner',
        '-loglevel',
        'error',
        '-stats',
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', '"%LIST%"',
    ]

    if (form.mode === 'copy') {
        parts.push('-c', 'copy')
    } else {
        parts.push(
            '-c:v', 'libx264',
            '-crf', '23',
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
        )
    }

    // 输出文件名（自动补扩展名）
    const outputExt = form.inputPattern.replace('*', '')
    const outputFile = form.outputName.includes('.')
        ? form.outputName
        : `${form.outputName}${outputExt}`

    parts.push(`"%OUT%\\${outputFile}"`)

    return parts.join(' ')
}