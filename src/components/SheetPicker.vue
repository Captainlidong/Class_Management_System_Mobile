<template>
  <view v-if="visible" class="sp-overlay" @tap="close">
    <view class="sp-sheet" @tap.stop>
      <view class="sp-grabber"></view>
      <view class="sp-title">{{ title }}</view>
      <view
        v-for="it in items"
        :key="String(it.key)"
        class="sp-item"
        :class="{ 'sp-item-active': String(it.key) === String(selected) }"
        hover-class="sp-item-hover"
        :hover-stay-time="60"
        @tap="pick(it)"
      >
        <view v-if="it.icon" class="sp-ico"><AppIcon :name="it.icon" :size="21" /></view>
        <view class="sp-main">
          <text class="sp-label">{{ it.label }}</text>
          <text v-if="it.desc" class="sp-desc">{{ it.desc }}</text>
        </view>
        <text v-if="it.extra" class="sp-extra">{{ it.extra }}</text>
        <view v-if="String(it.key) === String(selected)" class="sp-check">
          <AppIcon name="check" :size="17" :stroke-width="2.6" />
        </view>
      </view>
      <view class="sp-cancel" hover-class="sp-cancel-hover" :hover-stay-time="60" @tap="close">
        <text class="sp-cancel-text">取消</text>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from './AppIcon.vue'

/**
 * 自绘底部选择弹层：替代 uni.showActionSheet（系统白板样式与喵班主题不符，
 * 深色模式下也是白底刺眼）。配色全走 --mb-* 变量，深浅色自动跟随。
 * z-index 998：低于 uni-modal(999)，保证确认弹窗仍能盖在上面。
 */
export default {
  components: { AppIcon },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    // [{ key, label, icon?, desc?, extra? }]
    items: { type: Array, default: () => [] },
    // 当前选中项的 key（显示对勾高亮）
    selected: { type: [String, Number], default: '' }
  },
  emits: ['close', 'select'],
  methods: {
    close() {
      this.$emit('close')
    },
    pick(it) {
      this.$emit('select', it)
    }
  }
}
</script>

<style lang="scss" scoped>
.sp-overlay {
  position: fixed;
  inset: 0;
  background: var(--mb-overlay);
  /* 低于 uni-modal(999)，保证确认弹窗能盖在弹层上 */
  z-index: 998;
  display: flex;
  align-items: flex-end;
  animation: spFade 0.2s ease both;
}
.sp-sheet {
  width: 100%;
  background: var(--mb-card-bg);
  border-radius: 36rpx 36rpx 0 0;
  padding: 18rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  animation: spUp 0.26s cubic-bezier(0.22, 0.9, 0.36, 1) both;
}
.sp-grabber {
  width: 72rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: var(--mb-line);
  margin: 0 auto 16rpx;
}
.sp-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $ink;
  padding: 4rpx 10rpx 14rpx;
}
.sp-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 18rpx;
  border-radius: 22rpx;
}
.sp-item-hover {
  background: var(--mb-sage-light);
}
.sp-item-active {
  background: var(--mb-primary-soft);
}
.sp-ico {
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  background: var(--mb-cream-2);
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sp-item-active .sp-ico {
  background: var(--mb-card-bg);
}
.sp-main {
  flex: 1;
  min-width: 0;
}
.sp-label {
  display: block;
  font-size: 29rpx;
  font-weight: 600;
  color: $ink;
}
.sp-item-active .sp-label {
  color: $primary;
  font-weight: 800;
}
.sp-desc {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.sp-extra {
  font-size: 23rpx;
  color: $ink-light;
  flex-shrink: 0;
}
.sp-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $primary;
  color: var(--mb-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sp-cancel {
  margin-top: 18rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: var(--mb-cream-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sp-cancel-hover {
  background: var(--mb-sage-light);
}
.sp-cancel-text {
  font-size: 29rpx;
  font-weight: 600;
  color: $ink-light;
}
@keyframes spFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes spUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
