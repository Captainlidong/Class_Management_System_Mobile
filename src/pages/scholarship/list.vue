<template>
  <view class="page">
    <view v-if="batches.length">
      <view
        v-for="b in batches"
        :key="b.id"
        class="card batch-card"
        @tap="openBatch(b)"
      >
        <view class="batch-head">
          <text class="batch-name">{{ b.name }}</text>
          <text class="batch-arrow">›</text>
        </view>
        <text v-if="b.remark" class="batch-remark">{{ b.remark }}</text>
        <view class="batch-meta">
          <text class="batch-meta-item">🏆 获奖人数 {{ b.awardCount }}</text>
          <text class="batch-meta-item" :class="{ complete: b.receivedCount >= b.awardCount && b.awardCount > 0 }">
            📋 已交表 {{ b.receivedCount }} / {{ b.awardCount }}
          </text>
        </view>
        <view v-if="b.levels && b.levels.length" class="level-tags">
          <text v-for="lv in b.levels" :key="lv.name" class="level-tag">{{ lv.name }} ×{{ lv.count }}</text>
        </view>
        <text class="batch-created">{{ fmtDate(b.createdAt) }}</text>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="🏆" text="还没有奖学金批次" />
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="scholarship" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { scholarshipBatches } from '../../api'
import { fmtDate } from '../../utils/format'

export default {
  components: { TabBar, EmptyState },
  data() {
    return { batches: [] }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDate,
    async load() {
      try {
        this.batches = (await scholarshipBatches()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openBatch(b) {
      uni.navigateTo({ url: `/pages/scholarship/detail?id=${b.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 16rpx;
}
.batch-card:active {
  transform: scale(0.985);
}
.batch-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.batch-name {
  font-size: 31rpx;
  font-weight: 700;
  color: $ink;
}
.batch-arrow {
  font-size: 36rpx;
  color: $ink-light;
}
.batch-remark {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.batch-meta {
  display: flex;
  gap: 28rpx;
  margin-top: 16rpx;
}
.batch-meta-item {
  font-size: 25rpx;
  color: #b07d1e;
  font-weight: 600;
}
.batch-meta-item.complete {
  color: #4e9b52;
}
.level-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.level-tag {
  font-size: 22rpx;
  color: #8d7bc0;
  background: rgba(201, 182, 228, 0.22);
  border-radius: 999rpx;
  padding: 6rpx 18rpx;
}
.batch-created {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 14rpx;
}
</style>
