<script>
/** 纯 CSS 环形进度（conic-gradient），无图表库依赖 */
export default {
  props: {
    size: { type: Number, default: 150 },   // rpx
    pct: { type: Number, default: 0 },      // 0-100
    color: { type: String, default: 'var(--mb-primary)' },
    track: { type: String, default: 'var(--mb-sage-card)' },
    holePercent: { type: Number, default: 66 } // 中空占比
  },
  computed: {
    deg() {
      const v = Math.max(0, Math.min(100, Number(this.pct) || 0))
      return v * 3.6
    },
    ringStyle() {
      return {
        width: this.size + 'rpx',
        height: this.size + 'rpx',
        background: `conic-gradient(${this.color} ${this.deg}deg, ${this.track} ${this.deg}deg)`
      }
    },
    holeStyle() {
      return {
        width: this.holePercent + '%',
        height: this.holePercent + '%'
      }
    }
  }
}
</script>

<template>
  <view class="ring" :style="ringStyle">
    <view class="ring-hole" :style="holeStyle">
      <slot></slot>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ring {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.4s ease;
}
.ring-hole {
  background: var(--mb-card-bg);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
