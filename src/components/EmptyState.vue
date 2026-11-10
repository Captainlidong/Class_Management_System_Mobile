<script>
export default {
  props: {
    icon: { type: String, default: '🍃' },
    text: { type: String, default: '这里空空如也' }
  }
}
</script>

<template>
  <view class="empty">
    <view class="empty-icon">{{ icon }}</view>
    <view>{{ text }}</view>
  </view>
</template>

<style lang="scss" scoped>
.empty-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}
</style>
