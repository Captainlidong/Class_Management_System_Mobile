<script>
/** 喵班线性图标（替代 emoji） */
import AppIcon from './AppIcon.vue'

export default {
  components: { AppIcon },
  props: {
    icon: { type: String, default: '' },
    text: { type: String, default: '这里空空如也' }
  }
}
</script>

<template>
  <view class="empty">
    <!-- 睡觉的猫 -->
    <svg width="180" height="131" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-cat">
      <text x="184" y="46" font-size="20" fill="#B9C4B9" font-family="sans-serif" font-weight="600">z</text>
      <text x="200" y="28" font-size="26" fill="#B9C4B9" font-family="sans-serif" font-weight="700">Z</text>
      <path d="M186 122 C186 96 152 84 112 84 C74 84 44 92 38 112 C33 128 50 136 84 136 C136 136 186 136 186 122 Z" fill="#FFFFFF" stroke="#E3D9C8" stroke-width="2" />
      <path d="M132 96 Q160 94 168 110 Q160 126 136 122 Q126 108 132 96 Z" fill="#F0B27A" opacity="0.6" />
      <path d="M184 124 Q196 132 172 138 Q148 143 128 136" stroke="#B8C4CC" stroke-width="9" stroke-linecap="round" />
      <path d="M56 130 C38 130 26 116 26 100 C26 82 40 72 58 72 C76 72 88 84 88 102 C88 118 76 130 56 130 Z" fill="#FFFFFF" stroke="#E3D9C8" stroke-width="2" />
      <path d="M40 84 L34 62 L58 74 Z" fill="#F0B27A" stroke="#E3D9C8" stroke-width="2" stroke-linejoin="round" opacity="0.6" />
      <path d="M74 78 L82 58 L92 82 Z" fill="#FFFFFF" stroke="#E3D9C8" stroke-width="2" stroke-linejoin="round" />
      <path d="M42 102 Q48 108 54 102" stroke="#2F3B33" stroke-width="2.4" stroke-linecap="round" />
      <path d="M62 102 Q68 108 74 102" stroke="#2F3B33" stroke-width="2.4" stroke-linecap="round" />
      <path d="M54 112 H61 L57.5 116 Z" fill="#E8A0A0" />
      <circle cx="38" cy="112" r="5" fill="#F6C6C0" opacity="0.85" />
    </svg>
    <view class="empty-text">{{ text }}</view>
    <view v-if="icon" class="empty-hint">
      <AppIcon :name="icon" :size="14" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.empty {
  padding: 76rpx 40rpx 66rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-cat {
  opacity: 0.9;
  margin-bottom: 6rpx;
}
.empty-text {
  font-size: 26rpx;
  color: $ink-light;
  font-weight: 500;
}
.empty-hint {
  margin-top: 10rpx;
  color: #b9c4b9;
}
</style>
