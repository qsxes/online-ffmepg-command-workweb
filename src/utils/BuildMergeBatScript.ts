import type { MergeForm } from '@/types/form'
import {buildMergeBatCommand} from "@/utils/BuildMergeBatCommand.ts";

/**
 * 根据用户配置生成 Windows 批处理脚本（.bat）
 *
 * 生成的脚本能力：
 * 1. 设置 UTF-8 编码，支持中文文件名
 * 2. 检查 ffmpeg 是否存在
 * 3. 按文件名自然顺序列出当前文件夹的视频/音频
 * 4. 用 concat 解复用器合并
 * 5. 快速合并（-c copy）或重新编码
 * 6. 结束后 pause，防止窗口闪退
 *
 * @param form 用户配置的合并表单
 * @returns 完整的 .bat 文件内容字符串（使用 \r\n 换行）
 */

export function buildMergeBatScript(form:MergeForm){
    const modeText = form.mode === 'copy' ? '快速合并（不重编码）' : '重新编码（兼容性优先）'
    const cmd = buildMergeBatCommand(form)
    // 输出文件名（如果用户没写扩展名，自动补上）
    const outputExt = form.inputPattern.replace('*', '')  // '*.mp4' → '.mp4'
    const outputFile = form.outputName.includes('.')
        ? form.outputName
        : `${form.outputName}${outputExt}`

    // concat 参数：快速合并用 -c copy，重编码用默认（重新编码）
    const concatArgs = form.mode === 'copy'
        ? '-c copy'
        : '-c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k'

    const script = `@echo off
chcp 65001 >nul
setlocal

REM ============================================
REM  FFmpeg 视频合并脚本
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

REM 准备临时列表文件
set "LIST=%TEMP%\\ffmpeg_merge_list.txt"
if exist "%LIST%" del "%LIST%"

REM 开始提示
echo.
echo ============================================
echo   FFmpeg 批量合并
echo ============================================
echo   输入格式=${form.inputPattern}
echo   合并模式=${modeText}
echo   输出文件=%OUT%\\${outputFile}
echo ============================================
echo.

REM 按文件名自然顺序列出文件，写入列表
echo [扫描] 正在按文件名顺序收集 ${form.inputPattern} 文件...
for /f "delims=" %%F in ('dir /b /on "%~dp0${form.inputPattern}"') do (
  echo file '%~dp0%%F'>>"%LIST%"
)

REM 检查列表是否为空
for %%A in ("%LIST%") do set "SIZE=%%~zA"
if "%SIZE%"=="0" (
  echo.
  echo [错误] 当前文件夹没有找到 ${form.inputPattern} 文件
  echo.
  echo 请把本脚本放到有视频的文件夹里再运行。
  echo.
  del "%LIST%"
  pause
  exit /b 1
)

echo [合并] 正在合并为 ${outputFile}...
echo.

${cmd}

if errorlevel 1 (
  echo.
  echo ============================================
  echo   [失败] 合并失败
  echo ============================================
  echo.
  if "${form.mode}"=="copy" (
    echo 常见原因：输入文件的编码格式、分辨率、帧率不一致。
    echo 解决方法：把合并模式改成「重新编码」，再重新生成脚本。
  ) else (
    echo 请检查文件是否损坏，或尝试减少合并文件数量。
  )
  echo.
  del "%LIST%"
  pause
  exit /b 1
)

echo.
echo ============================================
echo   [完成] 合并成功
echo ============================================
echo   输出文件=%OUT%\\${outputFile}
echo ============================================
echo.

del "%LIST%"
pause
`

    return script.replace(/\n/g, '\r\n')
}