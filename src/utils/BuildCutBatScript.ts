import type { CutForm } from '@/types/form'
import { buildCutBatCommand } from './BuildCutBatCommand'

/**
 * 根据用户配置生成 Windows 批处理脚本（.bat）
 *
 * 生成的脚本能力：
 * 1. 设置 UTF-8 编码，支持中文文件名
 * 2. 检查 ffmpeg 是否存在
 * 3. 自动创建输出目录
 * 4. 按片段列表逐条裁剪
 * 5. 根据 skipExisting 决定跳过或覆盖
 * 6. 失败写入 errors.log
 * 7. 结束后 pause，防止窗口闪退
 *
 * @param form 用户配置的裁剪表单
 * @returns 完整的 .bat 文件内容字符串（使用 \r\n 换行）
 */
export function buildCutBatScript(form: CutForm): string {
    const modeText = form.mode === 'copy' ? '快速裁剪（不重编码）' : '精确裁剪（重编码）'
    const isAudio = isAudioFile(form.fileName)
    const skipText = form.skipExisting ? '是' : '否'

    // ============================================================
    // 逐片段生成 block
    // ============================================================
    const segmentBlocks = form.segments.map((seg, i) => {
        const cmd = buildCutBatCommand(form, seg, i)
        const outputName = buildOutputName(form.fileName, form.suffix, i)

        // 处理一个片段的核心逻辑（不管跳不跳过，都执行这些）
        const processBlock = `echo [处理] 片段 ${i + 1}：${seg.start} → ${seg.end}
${cmd}
if errorlevel 1 (
  echo [失败] 片段 ${i + 1}
  echo ${outputName}>>"%ERR%"
) else (
  echo [完成] ${outputName}
)`

        // 根据 skipExisting 决定是否包 if exist
        // 跳过模式下，processBlock 需要多缩进 2 格（因为在 else 分支里）
        const body = form.skipExisting
            ? `if exist "%OUT%\\${outputName}" (
  echo [跳过] ${outputName} 已存在
) else (
${processBlock.split('\n').map(l => '  ' + l).join('\n')}
)`
            : processBlock

        return `REM ============================================
REM 片段 ${i + 1}：${seg.start} → ${seg.end}
REM ============================================
${body}`
    }).join('\r\n\r\n')

    // ============================================================
    // 拼装完整的 .bat 脚本
    // ============================================================
    const script = `@echo off
chcp 65001 >nul
setlocal

REM ============================================
REM  FFmpeg 批量裁剪脚本
REM  由 FFmpeg 本地批处理工作流生成器 生成
REM ============================================

REM 检查 ffmpeg 是否安装
where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo.
  echo [错误] 未找到 ffmpeg
  echo.
  echo 请先安装 FFmpeg 并加入系统 PATH。
  echo 推荐命令：winget install ffmpeg
  echo.
  pause
  exit /b 1
)

REM 准备输出目录
set "OUT=%~dp0${form.outputDir}"
if not exist "%OUT%" mkdir "%OUT%"

REM 准备错误日志
set "ERR=%OUT%\\errors.log"
if exist "%ERR%" del "%ERR%"

REM 开始提示
echo.
echo ============================================
echo   FFmpeg 批量裁剪
echo ============================================
echo   输入文件：${form.fileName}
echo   文件类型：${isAudio ? '音频' : '视频'}
echo   片段数量：${form.segments.length}
echo   裁剪方式：${modeText}
echo   跳过已存在：${skipText}
echo   输出目录：%OUT%
echo ============================================
echo.

${segmentBlocks}

REM 结束汇总
echo.
echo ============================================
echo   全部完成
echo   输出目录：%OUT%
if exist "%ERR%" (
  echo   错误日志：%ERR%
  echo   有片段处理失败，请查看日志。
) else (
  echo   所有片段处理成功。
)
echo ============================================
echo.
pause
`

    return script.replace(/\n/g, '\r\n')
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
        return `${fileName}${suffix}_${index + 1}`
    }
    const baseName = fileName.slice(0, dotIndex)
    const ext = fileName.slice(dotIndex)
    return `${baseName}${suffix}_${index + 1}${ext}`
}

/**
 * 判断文件是不是音频
 */
function isAudioFile(fileName: string): boolean {
    const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma', '.amr', '.ape']
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
    return audioExts.includes(ext)
}