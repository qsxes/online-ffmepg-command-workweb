<!--暂且不使用该方案，label目前足以应付-->
<script setup lang="ts">
defineProps<{
  label: string
  value: string
  disabled?: boolean
  disabledReason?: string
}>()
</script>

<template>
  <el-option :value="value" :disabled="disabled">
    <el-tooltip
        :content="disabledReason ?? ''"
        :disabled="!disabled"
        placement="right"
    >
      <span>{{ label }}</span>
    </el-tooltip>
  </el-option>
</template>
