import { reactive, computed } from 'vue'
import type {CompressForm, FormState} from '@/types/form'
import { buildCompressBatCommand } from '@/utils/BuildCompressBatCommand.ts'
import { buildBatScript } from '@/utils/BuildeBatScript.ts'

export function useScriptGenerator(){
    const form = reactive<CompressForm>({
        operation: 'compress',
        codec: 'libx264',
        crf: 23,
        preset: 'medium',
        resolution: 'source',
        audioBitrate: '128k',
        outputDir: 'finished',
        suffix: '_finished',
        skipExisting: true,
        overwrite: true,
    })

    const command = computed(() => buildCompressBatCommand(form))
    const script = computed(() => buildBatScript(form))

    return { form, command, script }
}