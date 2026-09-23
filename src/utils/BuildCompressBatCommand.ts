import type { CompressForm } from '@/types/form'


export function buildCompressBatCommand(form: CompressForm): string {

    //命令行选项
    const parts: string[] = ['ffmpeg', '-hide_banner', '-loglevel', 'error','-stats', '-y']

    // 输入（脚本里用 %%F 表示当前文件）
    parts.push('-i', '"%%F"')

    // 视频编码
    parts.push('-c:v', form.codec)

    // 画质
    parts.push('-crf', String(form.crf))

    // 编码速度
    parts.push('-preset', form.preset)

    // 分辨率
    if (form.resolution !== 'source') {
        parts.push('-vf', `"scale=-2:${form.resolution}"`)
    }

    // 音频
    parts.push('-c:a', 'aac', '-b:a', form.audioBitrate)

    // 输出
    parts.push(`"%OUT%\\%%~nF${form.suffix}.mp4"`)

    return parts.join(' ')
}

