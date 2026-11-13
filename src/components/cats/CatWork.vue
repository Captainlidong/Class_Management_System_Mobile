<script>
/** 工作中的三花猫：趴在小桌板前看纸（待办页） */
export default {
  props: {
    width: { type: [Number, String], default: 220 }
  }
}
</script>

<template>
  <svg
    :width="width"
    :height="Number(width) * 0.9"
    viewBox="0 0 220 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 桌板 -->
    <path d="M30 150 H190 A7 7 0 0 1 190 164 H30 A7 7 0 0 1 30 150 Z" fill="#DCE8DC" stroke="#C7D6C7" stroke-width="2" />
    <path d="M48 164 L44 194 M172 164 L176 194" stroke="#C7D6C7" stroke-width="3" stroke-linecap="round" />
    <!-- 尾巴翘起 -->
    <path d="M160 146 Q184 142 180 118" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />
    <path d="M160 146 Q184 142 180 118" stroke="#E6DBC8" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M178 116 C186 120 184 132 174 132 C166 132 164 124 168 118 Z" fill="#F2B279" />
    <!-- 纸张 -->
    <path d="M80 128 H142 V150 H80 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2" />
    <path d="M90 138 H124 M90 144 H114" stroke="#C9BFAF" stroke-width="2" stroke-linecap="round" />
    <!-- 铅笔 -->
    <path d="M130 126 L152 108" stroke="#D9A441" stroke-width="4.5" stroke-linecap="round" />
    <path d="M150 106 L157 102 L155 111 Z" fill="#D9A441" />
    <!-- 身体（桌后露出） -->
    <path d="M66 150 C66 122 84 108 110 108 C136 108 154 122 154 150" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 灰斑 -->
    <path d="M128 116 Q144 118 146 132 Q138 144 124 140 Q118 128 128 116 Z" fill="#B9C2C4" opacity="0.85" />
    <!-- 耳朵 -->
    <path d="M84 78 C76 52 80 34 94 30 C104 40 110 58 110 76 C102 82 92 82 84 78 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M87 66 C84 54 87 44 94 42 C98 50 100 62 98 72 Z" fill="#F2B279" />
    <path d="M136 78 C144 52 140 34 126 30 C116 40 110 58 110 76 C118 82 128 82 136 78 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M133 66 C136 54 133 44 126 42 C122 50 120 62 122 72 Z" fill="#F3C8C8" />
    <!-- 头（低头看纸，大圆） -->
    <path d="M110 108 C80 108 64 88 64 66 C64 44 84 30 110 30 C136 30 156 44 156 66 C156 88 140 108 110 108 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 额头橘斑（左） -->
    <path d="M72 66 C74 52 86 46 98 50 C104 56 102 66 94 72 C84 78 74 76 72 66 Z" fill="#F2B279" opacity="0.95" />
    <!-- 额头灰斑（右） -->
    <path d="M148 70 C146 56 134 50 122 54 C118 60 122 70 130 74 C138 78 146 76 148 70 Z" fill="#B9C2C4" opacity="0.9" />
    <!-- 专注看纸的眯眼（向下弯） -->
    <path d="M84 72 Q90 78 96 72" stroke="#3A4A3E" stroke-width="2.8" stroke-linecap="round" />
    <path d="M124 72 Q130 78 136 72" stroke="#3A4A3E" stroke-width="2.8" stroke-linecap="round" />
    <!-- 鼻嘴 -->
    <path d="M106 86 H114 L110 90.5 Z" fill="#E8A0A0" />
    <path d="M103 93 Q106.5 97.5 110 93.5 Q113.5 97.5 117 93" stroke="#3A4A3E" stroke-width="2.2" stroke-linecap="round" />
    <!-- 腮红 -->
    <circle cx="78" cy="82" r="7" fill="#F6C6C0" opacity="0.8" />
    <circle cx="142" cy="82" r="7" fill="#F6C6C0" opacity="0.8" />
    <!-- 前爪搭在桌沿 -->
    <ellipse cx="92" cy="148" rx="13" ry="8" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <ellipse cx="128" cy="148" rx="13" ry="8" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
  </svg>
</template>
