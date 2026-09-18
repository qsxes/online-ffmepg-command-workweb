import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import {buildBatFFMpegCommand} from "@/utils/BuildBatFFMpegCommand.ts";
import {buildBatScript} from "@/utils/BuildeBatScript.ts";
import ElPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {useScriptGenerator} from "@/composables/useScirptGenerator.ts";

let ffmepgStr = buildBatFFMpegCommand({
    codec: 'libx264',
    crf: 23,
    preset: 'medium',
    resolution: 'source',
    audioBitrate: '128k',
    outputDir: 'compressed',
    suffix: '_compressed',
    skipExisting: true,
    overwrite: true,
})

let ffmepgBat = buildBatScript({
    codec: 'libx264',
    crf: 23,
    preset: 'medium',
    resolution: '1080',
    audioBitrate: '128k',
    outputDir: 'compressed',
    suffix: '_compressed',
    skipExisting: true,
    overwrite: true,
})

//控制台+alert验证
// console.log(JSON.stringify(ffmepgStr))
// alert(JSON.stringify(ffmepgStr))
// alert(JSON.stringify(ffmepgBat))

// //测试下载
// function downloadBat(content: string) {
//     const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = 'compress.bat'
//     a.click()
//     URL.revokeObjectURL(url)
// }
//
// downloadBat(ffmepgBat)

//测试脚本生成
const{command,script}=useScriptGenerator()
console.log(command)

const appV = createApp(App)
appV.use(ElPlus)
appV.mount('#app')
