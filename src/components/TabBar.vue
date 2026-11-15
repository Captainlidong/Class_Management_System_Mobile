<script>
/** 自绘底部导航（喵班 · 奶油绿）：线性图标 + 选中态鼠尾草胶囊 */
import AppIcon from './AppIcon.vue'

const TABS = [
  { key: 'index', icon: 'home', label: '首页', url: '/pages/index/index' },
  { key: 'collection', icon: 'clipboard', label: '收集', url: '/pages/collection/list' },
  { key: 'leave', icon: 'moon', label: '请假', url: '/pages/leave/list' },
  { key: 'scholarship', icon: 'trophy', label: '奖学金', url: '/pages/scholarship/list' },
  { key: 'more', icon: 'grid', label: '更多', url: '/pages/more/more' }
]

export default {
  components: { AppIcon },
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
      <view class="tab-icon-wrap">
        <AppIcon :name="t.icon" :size="24" :stroke-width="1.7" />
      </view>
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
  background: $veil;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1rpx solid $line;
  border-radius: 40rpx;
  padding: 12rpx 10rpx;
  box-shadow: 0 10rpx 40rpx $shadow;
  z-index: 999;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  padding: 10rpx 0 8rpx;
  border-radius: 28rpx;
  color: $ink-light;
  transition: background 0.2s ease, color 0.2s ease;
}
.tab-item.active {
  background: $sage-light;
  color: $primary-deep;
}
.tab-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
}
.tab-label {
  font-size: 21rpx;
  font-weight: 500;
}
.tab-item.active .tab-label {
  color: $primary-deep;
  font-weight: 700;
}
</style>
