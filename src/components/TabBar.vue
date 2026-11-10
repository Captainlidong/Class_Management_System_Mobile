<script>
/** 自绘底部导航（奶油马卡龙风）：5 个主页面各自引入，redirectTo 切换避免页面栈膨胀 */
const TABS = [
  { key: 'index', icon: '🏡', label: '首页', url: '/pages/index/index' },
  { key: 'collection', icon: '📋', label: '收集', url: '/pages/collection/list' },
  { key: 'leave', icon: '🌙', label: '请假', url: '/pages/leave/list' },
  { key: 'scholarship', icon: '🏆', label: '奖学金', url: '/pages/scholarship/list' },
  { key: 'more', icon: '✨', label: '更多', url: '/pages/more/more' }
]

export default {
  props: {
    current: { type: String, required: true }
  },
  data() {
    return { tabs: TABS }
  },
  methods: {
    switchTab(tab) {
      if (tab.key === this.current) return
      uni.redirectTo({ url: tab.url })
    }
  }
}
</script>

<template>
  <view class="tabbar">
    <view
      v-for="t in tabs"
      :key="t.key"
      class="tab-item"
      :class="{ active: t.key === current }"
      @tap="switchTab(t)"
    >
      <text class="tab-icon">{{ t.icon }}</text>
      <text class="tab-label">{{ t.label }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 36rpx;
  padding: 14rpx 10rpx;
  box-shadow: 0 10rpx 40rpx rgba(122, 96, 76, 0.14);
  z-index: 999;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  padding: 8rpx 0;
  border-radius: 24rpx;
  transition: background 0.2s ease;
}
.tab-item.active {
  background: rgba(127, 181, 232, 0.16);
}
.tab-icon {
  font-size: 38rpx;
  line-height: 1.1;
}
.tab-label {
  font-size: 21rpx;
  color: $ink-light;
  font-weight: 500;
}
.tab-item.active .tab-label {
  color: #4d8ecf;
  font-weight: 700;
}
</style>
