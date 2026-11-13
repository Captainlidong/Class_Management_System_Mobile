<script>
/** 手绘语气泡：猫头上的说话泡（文案可自定义） */
export default {
  props: {
    text: { type: String, default: '今天也要好好生活' }
  }
}
</script>

<template>
  <view class="bubble-wrap">
    <view class="bubble">
      <text class="bubble-text">{{ text }}</text>
    </view>
    <view class="bubble-tail"></view>
  </view>
</template>

<style lang="scss" scoped>
.bubble-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.bubble {
  background: #fff;
  border: 2rpx solid #e8e2d4;
  border-radius: 26rpx;
  padding: 14rpx 28rpx;
  box-shadow: 0 4rpx 14rpx rgba(122, 96, 76, 0.08);
}
.bubble-text {
  font-size: 24rpx;
  color: #4e6b58;
  font-weight: 600;
}
.bubble-tail {
  width: 0;
  height: 0;
  border-left: 12rpx solid transparent;
  border-right: 12rpx solid transparent;
  border-top: 14rpx solid #fff;
  margin-top: -2rpx;
}
</style>
