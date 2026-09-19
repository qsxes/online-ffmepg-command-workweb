import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import {buildCompressBatCommand} from "@/utils/BuildCompressBatCommand.ts";
import {buildBatScript} from "@/utils/BuildeBatScript.ts";
import ElPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {useScriptGenerator} from "@/composables/useScirptGenerator.ts";



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
