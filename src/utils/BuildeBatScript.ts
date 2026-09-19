import type { FormState } from '@/types/form'
import { buildCompressBatScript } from './BuildCompressBatScript'
import { buildMergeBatScript } from './BuildMergeBatScript'

/**
 * 根据操作类型派发到对应的脚本生成器
 *
 * - compress：批量压缩视频
 * - merge：按文件名合并视频/音频
 */
export function buildBatScript(form: FormState): string {
    if (form.operation === 'compress') {
        return buildCompressBatScript(form)
    }
    return buildMergeBatScript(form)
}