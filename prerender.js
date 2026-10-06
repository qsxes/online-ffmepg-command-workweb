import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from './src/App.vue'
import { routes } from './src/router/index'

export async function prerender(data) {
    const app = createSSRApp(App)
    const router = createRouter({
        history: createMemoryHistory(),
        routes,
    })

    app.use(router)
    router.push(data.url)
    await router.isReady()

    const html = await renderToString(app)
    const seo = getSEO(data.url)

    return {
        html,
        head: {
            lang: 'zh-CN',
            title: seo.title,
            elements: new Set([
                { type: 'meta', props: { name: 'description', content: seo.description } },
            ]),
        },
    }
}

function getSEO(url) {
    const map = {
        '/compress': {
            title: '批量压缩视频 · FFmpeg 工坊',
            description: '在线生成 FFmpeg 批量压缩脚本，H.264/H.265 可选，CRF 画质可调。文件不上传，本地运行。',
        },
        '/merge': {
            title: '按文件名合并视频 · FFmpeg 工坊',
            description: '按文件名自然顺序合并视频/音频，一键拼接分段录像。生成可双击运行的 .bat 脚本。',
        },
        '/convert': {
            title: '视频转格式 · FFmpeg 工坊',
            description: 'MP4 / MKV / MOV / WebM 互转，可提取音频或视频。在线生成 FFmpeg 脚本，文件不上传。',
        },
        '/audio-convert': {
            title: '音频转格式 · FFmpeg 工坊',
            description: 'MP3 / WAV / M4A / FLAC 等 10+ 音频格式互转，支持 ASR 预设。在线生成脚本，本地运行。',
        },
        '/cut': {
            title: '视频/音频裁剪 · FFmpeg 工坊',
            description: '本地预览，多片段裁剪，生成可双击运行的 .bat 脚本。支持快速裁剪和精确裁剪。',
        },
        '/install': {
            title: 'FFmpeg 安装指南 · FFmpeg 工坊',
            description: 'Windows / macOS / Linux 下安装 FFmpeg 的完整指南，包含常见错误排查。',
        },
        '/faq': {
            title: '常见问题 · FFmpeg 工坊',
            description: 'FFmpeg 工坊的常见问题解答：安装、使用、路径、错误排查。',
        },
        '/about': {
            title: '关于 · FFmpeg 工坊',
            description: '一个纯前端的 FFmpeg 本地批处理工作流生成器，文件不上传，本地运行。',
        },
    }
    return map[url] || {
        title: 'FFmpeg 工坊 · 本地批处理脚本生成',
        description: '在线生成 FFmpeg 批处理脚本，压缩、合并、转格式、音频转换、裁剪。',
    }
}