<script>
/** 喵班主视觉：坐姿三花猫（大头治愈系 · 橘灰双色斑 · 薄荷项圈金铃铛） */
export default {
  props: {
    width: { type: [Number, String], default: 320 },
    /** 是否绘制薄荷色圆底（登录页大图用） */
    backdrop: { type: Boolean, default: false }
  }
}
</script>

<template>
  <svg
    :width="width"
    :height="Number(width)"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 可选薄荷圆底 -->
    <circle v-if="backdrop" cx="100" cy="100" r="97" fill="#D8E8DC" />

    <!-- 尾巴（右侧翘起，带橘斑） -->
    <path d="M148 172 C168 168 172 148 160 138" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
    <path d="M148 172 C168 168 172 148 160 138" stroke="#E6DBC8" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M162 136 C170 142 168 154 158 156 C150 158 146 150 150 144 Z" fill="#F2B279" />
    <path d="M150 142 C146 146 148 152 154 152" stroke="#B9C2C4" stroke-width="7" stroke-linecap="round" opacity="0.7" />

    <!-- 身体（坐姿） -->
    <path d="M100 192 C76 192 62 178 64 158 C66 142 80 132 100 132 C120 132 134 142 136 158 C138 178 124 192 100 192 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 身体灰斑 -->
    <path d="M128 152 C140 156 142 170 132 178 C122 182 114 174 118 164 C121 156 124 152 128 152 Z" fill="#B9C2C4" opacity="0.85" />
    <!-- 身体橘斑 -->
    <path d="M76 152 C72 160 76 172 86 174 C92 168 92 158 88 152 C84 149 80 149 76 152 Z" fill="#F2B279" opacity="0.85" />

    <!-- 前爪（两只小爪 + 趾线） -->
    <ellipse cx="82" cy="186" rx="15" ry="10" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <ellipse cx="118" cy="186" rx="15" ry="10" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <path d="M78 182 V189 M84 181 V188 M118 182 V189 M124 181 V188" stroke="#E6DBC8" stroke-width="1.8" stroke-linecap="round" />

    <!-- 耳朵（高而清晰，橘斑左耳 / 素色右耳） -->
    <path d="M60 74 C50 44 54 20 68 14 C80 24 88 44 90 66 C80 74 68 76 60 74 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M63 62 C58 44 60 30 68 24 C74 32 78 46 78 60 Z" fill="#F2B279" />
    <path d="M140 74 C150 44 146 20 132 14 C120 24 112 44 110 66 C120 74 132 76 140 74 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M137 62 C142 44 140 30 132 24 C126 32 122 46 122 60 Z" fill="#F3C8C8" />

    <!-- 头（大圆，覆盖耳根形成自然过渡） -->
    <path d="M100 142 C62 142 44 116 44 90 C44 62 68 46 100 46 C132 46 156 62 156 90 C156 116 138 142 100 142 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 额头橘斑（左眼上方，小而有机） -->
    <path d="M62 74 C64 60 76 54 88 58 C94 62 94 70 88 76 C80 82 68 82 62 74 Z" fill="#F2B279" opacity="0.95" />
    <!-- 额头灰斑（右眼上方） -->
    <path d="M138 76 C136 62 124 56 112 60 C108 66 112 76 120 80 C128 84 136 82 138 76 Z" fill="#B9C2C4" opacity="0.9" />

    <!-- 大眼睛（深绿黑 + 双高光） -->
    <ellipse cx="76" cy="94" rx="8.5" ry="11" fill="#35443A" />
    <circle cx="79" cy="89" r="3" fill="#FFFFFF" />
    <circle cx="73.5" cy="97" r="1.6" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="124" cy="94" rx="8.5" ry="11" fill="#35443A" />
    <circle cx="127" cy="89" r="3" fill="#FFFFFF" />
    <circle cx="121.5" cy="97" r="1.6" fill="#FFFFFF" opacity="0.85" />

    <!-- 鼻子 + ω 嘴 -->
    <path d="M96.5 108 H103.5 L100 112.5 Z" fill="#E8A0A0" />
    <path d="M93 115 Q96.5 119.5 100 115.5 Q103.5 119.5 107 115" stroke="#3A4A3E" stroke-width="2.2" stroke-linecap="round" />

    <!-- 腮红 -->
    <circle cx="62" cy="108" r="8" fill="#F6C6C0" opacity="0.8" />
    <circle cx="138" cy="108" r="8" fill="#F6C6C0" opacity="0.8" />

    <!-- 胡须 -->
    <path d="M48 104 H28 M50 114 H32" stroke="#D8CFC0" stroke-width="1.8" stroke-linecap="round" />
    <path d="M152 104 H172 M150 114 H168" stroke="#D8CFC0" stroke-width="1.8" stroke-linecap="round" />

    <!-- 薄荷项圈 + 金铃铛 -->
    <path d="M74 140 Q100 156 126 140" stroke="#A8CFC0" stroke-width="8" stroke-linecap="round" />
    <circle cx="100" cy="152" r="8" fill="#F2C94C" stroke="#D9A441" stroke-width="2" />
    <path d="M97 152 H103" stroke="#D9A441" stroke-width="1.8" />
  </svg>
</template>
