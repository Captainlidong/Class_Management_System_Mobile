<script>
/** 打招呼的三花猫：一只爪子举起挥手（首页问候区/头像） */
export default {
  props: {
    width: { type: [Number, String], default: 260 }
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
    <!-- 挥手动效弧线 -->
    <path d="M30 46 q-7 -9 0 -19" stroke="#D9A441" stroke-width="2.4" stroke-linecap="round" />
    <path d="M40 38 q-5 -7 0 -14" stroke="#D9A441" stroke-width="2.2" stroke-linecap="round" />
    <!-- 尾巴 -->
    <path d="M148 172 C170 168 174 148 160 138" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round" />
    <path d="M148 172 C170 168 174 148 160 138" stroke="#E6DBC8" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M162 136 C170 142 168 154 158 156 C150 158 146 150 150 144 Z" fill="#F2B279" />
    <!-- 身体 -->
    <path d="M100 190 C74 190 62 174 64 156 C66 142 80 132 100 132 C120 132 134 142 136 156 C138 174 126 190 100 190 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 身体灰斑 -->
    <path d="M128 152 C140 156 142 170 132 178 C122 182 114 174 118 164 C121 156 124 152 128 152 Z" fill="#B9C2C4" opacity="0.85" />
    <!-- 举起的左爪 -->
    <path d="M66 110 Q50 96 46 76" stroke="#FFFFFF" stroke-width="17" stroke-linecap="round" />
    <path d="M66 110 Q50 96 46 76" stroke="#E6DBC8" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <circle cx="44" cy="66" r="15" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <path d="M38 62 V55 M44 61 V54 M50 62 V55" stroke="#E0D5C2" stroke-width="2" stroke-linecap="round" />
    <!-- 耳朵 -->
    <path d="M62 74 C52 46 56 24 70 20 C82 30 88 48 90 64 C82 72 70 76 62 74 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M65 62 C61 46 64 32 72 28 C78 36 80 50 78 62 Z" fill="#F2B279" />
    <path d="M140 74 C150 46 146 24 132 20 C120 30 114 48 112 64 C120 72 132 76 140 74 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M137 62 C142 44 140 32 132 28 C126 36 122 50 122 62 Z" fill="#F3C8C8" />
    <!-- 头（大圆） -->
    <path d="M101 142 C64 142 45 117 45 90 C45 62 69 45 101 45 C133 45 157 62 157 90 C157 117 138 142 101 142 Z" fill="#FFFFFF" stroke="#E6DBC8" stroke-width="2.5" />
    <!-- 额头橘斑（左） -->
    <path d="M62 76 C64 60 76 52 90 56 C96 62 94 72 86 78 C76 84 64 84 62 76 Z" fill="#F2B279" opacity="0.95" />
    <!-- 额头灰斑（右） -->
    <path d="M140 78 C138 62 126 56 114 60 C110 66 114 76 122 80 C130 84 138 82 140 78 Z" fill="#B9C2C4" opacity="0.9" />
    <!-- 大眼睛 -->
    <ellipse cx="78" cy="94" rx="8.5" ry="11" fill="#35443A" />
    <circle cx="81" cy="89" r="3" fill="#FFFFFF" />
    <circle cx="75.5" cy="97" r="1.6" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="124" cy="94" rx="8.5" ry="11" fill="#35443A" />
    <circle cx="127" cy="89" r="3" fill="#FFFFFF" />
    <circle cx="121.5" cy="97" r="1.6" fill="#FFFFFF" opacity="0.85" />
    <!-- 鼻嘴 -->
    <path d="M97.5 108 H104.5 L101 112.5 Z" fill="#E8A0A0" />
    <path d="M94 115 Q97.5 119.5 101 115.5 Q104.5 119.5 108 115" stroke="#3A4A3E" stroke-width="2.2" stroke-linecap="round" />
    <!-- 腮红 -->
    <circle cx="63" cy="106" r="8" fill="#F6C6C0" opacity="0.8" />
    <circle cx="139" cy="106" r="8" fill="#F6C6C0" opacity="0.8" />
    <!-- 胡须 -->
    <path d="M51 100 H31 M53 110 H35" stroke="#D8CFC0" stroke-width="1.8" stroke-linecap="round" />
    <path d="M151 100 H171 M149 110 H167" stroke="#D8CFC0" stroke-width="1.8" stroke-linecap="round" />
    <!-- 薄荷项圈 + 金铃铛 -->
    <path d="M76 140 Q101 156 126 140" stroke="#A8CFC0" stroke-width="8" stroke-linecap="round" />
    <circle cx="101" cy="152" r="8" fill="#F2C94C" stroke="#D9A441" stroke-width="2" />
    <path d="M98 152 H104" stroke="#D9A441" stroke-width="1.8" />
  </svg>
</template>
