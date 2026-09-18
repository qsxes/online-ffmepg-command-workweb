import { reactive, computed } from 'vue'
import type { FormState } from '@/types/form'
import { buildBatFFMpegCommand } from '@/utils/BuildBatFFMpegCommand.ts'
import { buildBatScript } from '@/utils/BuildeBatScript.ts'

export function useScriptGenerator(){
    const form = reactive<FormState>({
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

    const command = computed(() => buildBatFFMpegCommand(form))
    const script = computed(() => buildBatScript(form))

    return { form, command, script }
}