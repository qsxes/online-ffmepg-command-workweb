import type { ConvertForm } from '@/types/form'
import { buildConvertBatCommand } from '@/utils/BuildConvertBatCommand'

/**
 * 根据用户配置生成 Windows 批处理脚本（.bat）
 *
 * @param form 用户配置的格式转换表单
 * @returns 完整的 .bat 文件内容字符串（使用 \r\n 换行）
 */
export function buildConvertBatScript(form: ConvertForm): string {
    // 生成单条 ffmpeg 命令片段
    const cmd = buildConvertBatCommand(form)

    const isAudioTarget = form.targetFormat === 'mp3' || form.targetFormat === 'wav'

    const videoCodecLine = isAudioTarget ? '' : `echo   视频编码=${form.videoCodec}\n `

    // 把参数转成中文显示
    const formatText = form.targetFormat.toUpperCase()
    const videoCodecText = form.videoCodec === 'copy' ? '不重新编码' : form.videoCodec
    const audioCodecText = form.audioCodec === 'copy' ? '不重新编码' : form.audioCodec
    const skipText = form.skipExisting ? '是' : '否'

    // 输出扩展名（比如 mp4 / mkv / mp3）
    const outputExt = form.targetFormat

    // ============================================================
    // 循环体：两种形态，取决于 skipExisting
    // ============================================================

    let loopBody: string

    if (form.skipExisting) {
        loopBody = `  if exist "%OUT%\\%%~nF${form.suffix}.${outputExt}" (
    echo [跳过] %%~nxF 已处理过
  ) else (
    echo [处理] %%~nxF
    ${cmd}
    if errorlevel 1 (
      echo [失败] %%~nxF
      echo %%~nxF>>"%ERR%"
    ) else (
      echo [完成] %%~nxF
    )
  )`
    } else {
        loopBody = `  echo [处理] %%~nxF
  ${cmd}
  if errorlevel 1 (
    echo [失败] %%~nxF
    echo %%~nxF>>"%ERR%"
  ) else (
    echo [完成] %%~nxF
  )`
    }

    // ============================================================
    // 拼装完整的 .bat 脚本
    // ============================================================

    const script = `@echo off
chcp 65001 >nul
setlocal

REM ============================================
REM  FFmpeg 批量格式转换脚本
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
echo   FFmpeg 批量格式转换
echo ============================================
echo   输入格式=${form.inputPattern}
echo   目标格式=${formatText}
${videoCodecLine}echo   音频编码=${audioCodecText}
echo   音频码率=${form.audioBitrate}
echo   跳过已存在=${skipText}
echo   输出目录=%OUT%
echo ============================================
echo.

REM 遍历当前文件夹的所有 .mp4
for %%F in ("%~dp0${form.inputPattern}") do (
${loopBody}
)

REM 结束汇总
echo.
echo ============================================
echo   全部完成
echo   输出目录：%OUT%
if exist "%ERR%" (
  echo   错误日志：%ERR%
  echo   有文件处理失败，请查看日志。
) else (
  echo   所有文件处理成功。
)
echo ============================================
echo.
pause
`

    return script.replace(/\n/g, '\r\n')
}