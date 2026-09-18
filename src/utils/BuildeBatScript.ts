// 引入表单状态类型定义，用于约束参数形状
import type { FormState } from '@/types/form'


// 引入命令拼接函数，把参数拼成一条 ffmpeg 命令
import {buildBatFFMpegCommand} from "@/utils/BuildBatFFMpegCommand.ts";

/**
 * 根据用户配置生成 Windows 批处理脚本（.bat）内容
 *
 * 生成的脚本能力：
 * 1. 设置 UTF-8 编码，支持中文文件名
 * 2. 检查 ffmpeg 是否存在
 * 3. 自动创建输出目录
 * 4. 遍历脚本所在目录的所有 .mp4
 * 5. 跳过已存在的输出文件
 * 6. 失败时写入 errors.log
 * 7. 结束后 pause，防止窗口闪退
 *
 * @param form 用户在界面上配置的表单状态
 * @returns 完整的 .bat 文件内容字符串（使用 \r\n 换行）
 */
export function buildBatScript(form: FormState): string {
    const cmd = buildBatFFMpegCommand(form)

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
  if exist "%OUT%\\%%~nF_finished.mp4" (
    echo [跳过] %%~nxF 已处理过
  ) else (
    echo [处理] %%~nxF
    ffmpeg -hide_banner -loglevel error -y -i "%%F" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "%OUT%\\%%~nF_finished.mp4"
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