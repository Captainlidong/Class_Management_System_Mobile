<script>
/** 睡觉的三花猫：空态/统计卡角落专用（同款治愈画风） */
export default {
  props: {
    width: { type: [Number, String], default: 200 }
  }
}
</script>

<template>
  <svg
    :width="width"
    :height="Number(width) * 0.78"
    viewBox="0 0 220 172"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- zZ -->
    <text x="180" y="52" font-size="22" fill="#A9B4A9" font-family="sans-serif" font-weight="600">z</text>
    <text x="198" y="32" font-size="28" fill="#A9B4A9" font-family="sans-serif" font-weight="700">Z</text>
    <!-- 尾巴 -->
    <path d="M188 126 Q202 136 176 144 Q152 150 132 142" stroke="#B9C2C4" stroke-width="10" stroke-linecap="round" />
    <!-- 身体（横躺） -->
    <path d="M190 124 C190 96 154 82 112 82 C72 82 42 92 36 114 C31 132 50 140 86 140 C140 140 190 140 190 124 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 橘斑 -->
    <path d="M134 92 Q164 90 172 108 Q164 126 138 122 Q126 108 134 92 Z" fill="#F2B279" opacity="0.92" />
    <!-- 灰斑 -->
    <path d="M96 100 Q110 104 106 118 Q94 124 86 114 Q88 104 96 100 Z" fill="#B9C2C4" opacity="0.8" />
    <!-- 头（枕在左侧，大头） -->
    <path d="M58 134 C36 134 22 116 22 96 C22 76 38 64 60 64 C82 64 96 78 96 98 C96 118 82 134 58 134 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 耳朵（放松） -->
    <path d="M36 82 C30 62 34 48 46 44 C56 52 62 66 62 80 C54 86 44 86 36 82 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M38 74 C36 62 40 54 46 52 C50 58 52 66 50 74 Z" fill="#F2B279" />
    <path d="M66 76 L76 56 L86 78 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M68 70 L74 60 L80 72 Z" fill="#F3C8C8" />
    <!-- 安睡的闭眼 -->
    <path d="M40 102 Q46 108 52 102" stroke="#3A4A3E" stroke-width="2.6" stroke-linecap="round" />
    <path d="M64 102 Q70 108 76 102" stroke="#3A4A3E" stroke-width="2.6" stroke-linecap="round" />
    <!-- 鼻嘴 -->
    <path d="M54 114 H62 L58 118.5 Z" fill="#E8A0A0" />
    <path d="M52 121 Q56 125.5 60 121" stroke="#3A4A3E" stroke-width="2.2" stroke-linecap="round" />
    <!-- 腮红 -->
    <circle cx="34" cy="114" r="6" fill="#F6C6C0" opacity="0.8" />
    <circle cx="80" cy="112" r="6" fill="#F6C6C0" opacity="0.8" />
    <!-- 前爪 -->
    <path d="M70 136 Q76 142 88 138" stroke="#E6DBC8" stroke-width="2" stroke-linecap="round" />
  </svg>
</template>
