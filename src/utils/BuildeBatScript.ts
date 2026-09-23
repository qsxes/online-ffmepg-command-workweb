import type { FormState } from '@/types/form'
import { buildCompressBatScript } from './BuildCompressBatScript'
import { buildMergeBatScript } from './BuildMergeBatScript'
import {buildConvertBatScript} from "@/utils/BuildConvertBatScript.ts";
import {buildAudioConvertBatScript} from "@/utils/BuildAudioConvertBatScript.ts";
import {buildCutBatScript} from "@/utils/BuildCutBatScript.ts";

/**
 * 根据操作类型派发到对应的脚本生成器
 *
 * - compress：批量压缩视频
 * - merge：按文件名合并视频/音频
 */
export function buildBatScript(form: FormState): string {
    switch (form.operation) {
        case 'compress':      return buildCompressBatScript(form)
        case 'merge':         return buildMergeBatScript(form)
        case 'convert':       return buildConvertBatScript(form)
        case 'audio-convert': return buildAudioConvertBatScript(form)
        case 'cut':           return buildCutBatScript(form)
    }
}