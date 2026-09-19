import type {CompressForm} from "@/types/form.ts";
import {buildCompressBatCommand} from "@/utils/BuildCompressBatCommand.ts";

export function buildCompressBatScript(form: CompressForm): string {
    const cmd = buildCompressBatCommand(form)

    // 把参数转成中文显示
    const codecText = form.codec === 'libx264' ? 'H.264' : 'H.265'
    const presetMap: Record<string, string> = {
        ultrafast: '最快',
        fast: '较快',
        medium: '平衡',
        slow: '最慢',
    }
    const presetText = presetMap[form.preset] ?? form.preset
    const resolutionText = form.resolution === 'source' ? '保持原始' : `${form.resolution}p`

    const script = `@echo off
chcp 65001 >nul
setlocal

REM ============================================
REM  FFmpeg 批量视频压缩脚本
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
echo   FFmpeg 批量压缩
echo ============================================
echo   编码器=${codecText}
echo   画质=CRF ${form.crf}
echo   速度=${presetText}
echo   分辨率=${resolutionText}
echo   音频=${form.audioBitrate}
echo   输出目录=%OUT%
echo ============================================
echo.

REM 遍历当前文件夹的所有 .mp4
for %%F in ("%~dp0*.mp4") do (
  if exist "%OUT%\\%%~nF${form.suffix}.mp4" (
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
  )
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