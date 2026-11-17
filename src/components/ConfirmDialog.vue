<template>
  <view v-if="visible" class="cd-overlay" @tap="close">
    <view class="cd-box" @tap.stop>
      <view class="cd-title">{{ title }}</view>
      <view class="cd-content">{{ content }}</view>
      <view class="cd-actions">
        <view v-if="showCancel" class="cd-btn cd-cancel" hover-class="cd-btn-hover" :hover-stay-time="60" @tap="close">
          <text>{{ cancelText }}</text>
        </view>
        <view
          class="cd-btn cd-confirm"
          :class="{ 'cd-danger': danger }"
          hover-class="cd-btn-hover"
          :hover-stay-time="60"
          @tap="ok"
        >
          <text>{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 自绘居中确认弹窗：替代 uni.showModal（系统白板样式与喵班主题不符，
 * 深色模式下尤其突兀）。配色全走 --mb-* 变量，深浅色自动跟随。
 * 配合 mixins/confirmDialog.js 的 confirm(opts, fn) 使用。
 * z-index 998：低于 uni-modal(999)，系统弹窗仍能盖在上面兜底。
 */
export default {
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    confirmText: { type: String, default: '确定' },
    cancelText: { type: String, default: '取消' },
    // 危险操作（删除/移除等）确认键用莓红
    danger: { type: Boolean, default: false },
    showCancel: { type: Boolean, default: true }
  },
  emits: ['confirm', 'close'],
  methods: {
    close() {
      this.$emit('close')
    },
    ok() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.cd-overlay {
  position: fixed;
  inset: 0;
  background: var(--mb-overlay);
  /* 低于 uni-modal(999)，保证系统弹窗兜底可用 */
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 74rpx;
  animation: cdFade 0.18s ease both;
}
.cd-box {
  width: 100%;
  background: var(--mb-card-bg);
  border-radius: 36rpx;
  padding: 44rpx 36rpx 32rpx;
  box-sizing: border-box;
  animation: cdPop 0.22s cubic-bezier(0.22, 0.9, 0.36, 1) both;
}
.cd-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $ink;
  text-align: center;
}
.cd-content {
  font-size: 27rpx;
  color: $ink-light;
  line-height: 1.6;
  text-align: center;
  margin-top: 18rpx;
  white-space: pre-line;
  word-break: break-all;
}
.cd-actions {
  display: flex;
  gap: 18rpx;
  margin-top: 34rpx;
}
.cd-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 29rpx;
  font-weight: 700;
}
.cd-btn-hover {
  opacity: 0.82;
}
.cd-cancel {
  background: var(--mb-cream-2);
  color: $ink-light;
}
.cd-confirm {
  background: $primary;
  color: $on-primary;
}
.cd-danger {
  background: var(--mb-berry);
  color: #ffffff;
}
@keyframes cdFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes cdPop {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
