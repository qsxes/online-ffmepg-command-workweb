import type { FormState } from '@/types/form'
import { buildCompressBatScript } from './BuildCompressBatScript'
import { buildMergeBatScript } from './BuildMergeBatScript'
import {buildConvertBatCommand} from "@/utils/BuildConvertBatCommand.ts";

/**
 * 根据操作类型派发到对应的脚本生成器
 *
 * - compress：批量压缩视频
 * - merge：按文件名合并视频/音频
 */
export function buildBatScript(form: FormState): string {
    if (form.operation === 'compress') {
        return buildCompressBatScript(form)
    } else if (form.operation === 'merge') {
        return buildMergeBatScript(form)
    } else if (form.operation === 'convert') {
        return buildConvertBatCommand(form)
    }
    return "未知错误，文件名生成失败!"
}