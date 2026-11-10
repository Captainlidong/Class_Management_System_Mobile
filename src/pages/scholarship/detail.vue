<template>
  <view class="page" v-if="batch">
    <view class="card head-card">
      <text class="batch-name">{{ batch.name }}</text>
      <text v-if="batch.remark" class="batch-remark">{{ batch.remark }}</text>
      <view class="stat-row">
        <view class="stat-cell" style="background: rgba(201, 182, 228, 0.18)">
          <text class="stat-num">{{ batch.awardCount }}</text>
          <text class="stat-label">获奖人数</text>
        </view>
        <view class="stat-cell" style="background: rgba(163, 217, 165, 0.2)">
          <text class="stat-num">{{ batch.receivedCount }}</text>
          <text class="stat-label">已交表</text>
        </view>
        <view class="stat-cell" style="background: rgba(255, 217, 142, 0.24)">
          <text class="stat-num">{{ batch.awardCount - batch.receivedCount }}</text>
          <text class="stat-label">未交表</text>
        </view>
        <view class="ring-wrap">
          <ProgressRing :size="140" :pct="progress" color="#A3D9A5">
            <text class="ring-pct">{{ progress }}%</text>
            <text class="ring-sub">已交 {{ batch.receivedCount }}/{{ batch.awardCount }}</text>
          </ProgressRing>
        </view>
      </view>
    </view>

    <view class="chips-row" v-if="batch.levels && batch.levels.length">
      <text v-for="lv in batch.levels" :key="lv.name" class="chip">{{ lv.name }} ×{{ lv.count }}</text>
    </view>

    <view class="filter-row">
      <view class="filter-switch" @tap="onlyUndone = !onlyUndone">
        <text class="switch-label">只看未交表</text>
        <view class="mini-switch" :class="{ on: onlyUndone }"><view class="knob"></view></view>
      </view>
    </view>

    <view v-if="filteredAwards.length" class="card member-card">
      <view
        v-for="(a, idx) in filteredAwards"
        :key="a.id"
        class="award-row"
        :class="{ last: idx === filteredAwards.length - 1 }"
      >
        <view class="award-left">
          <text class="award-name">{{ a.name }}</text>
          <text class="award-no">{{ a.studentNo || '无学号' }} · {{ a.awardName }}{{ a.amount ? ` · ${a.amount}元` : '' }}</text>
          <text v-if="a.formReceived && a.receivedAt" class="award-no">🌷 收妥于 {{ fmtDateTime(a.receivedAt) }}</text>
        </view>
        <view class="award-right">
          <view class="pill" :class="a.formReceived ? 'pill-done' : 'pill-undone'" @tap="toggleForm(a)">
            {{ a.formReceived ? '已交表' : '未交表' }}
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="📋" :text="awards.length ? '没有符合筛选的同学' : '批次暂无获奖记录'" />
    </view>
  </view>
</template>

<script>
import ProgressRing from '../../components/ProgressRing.vue'
import EmptyState from '../../components/EmptyState.vue'
import { scholarshipBatch, scholarshipMarkReceived } from '../../api'
import { fmtDateTime } from '../../utils/format'

export default {
  components: { ProgressRing, EmptyState },
  data() {
    return {
      batchId: null,
      batch: null,
      awards: [],
      onlyUndone: false
    }
  },
  computed: {
    progress() {
      if (!this.batch || !this.batch.awardCount) return 0
      return Math.round((this.batch.receivedCount / this.batch.awardCount) * 100)
    },
    filteredAwards() {
      return this.onlyUndone ? this.awards.filter((a) => !a.formReceived) : this.awards
    }
  },
  onLoad(query) {
    this.batchId = Number(query.id)
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDateTime,
    async load() {
      try {
        const data = await scholarshipBatch(this.batchId)
        this.batch = { ...data }
        delete this.batch.awards
        this.awards = (data.awards || []).map((a) => ({ ...a, _savedRemark: a.remark || '' }))
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async toggleForm(a) {
      const target = !a.formReceived
      try {
        await scholarshipMarkReceived(a.id, target)
        a.formReceived = target
        a.receivedAt = target ? new Date().toISOString() : null
        uni.showToast({ title: target ? `${a.name} 申请表已收到 🌷` : `已标记 ${a.name} 未交表`, icon: 'none' })
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 16rpx;
  padding-bottom: 40rpx;
}
.head-card {
  padding-bottom: 34rpx;
}
.batch-name {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $ink;
}
.batch-remark {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin: 8rpx 0 16rpx;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.stat-cell {
  flex: 1;
  border-radius: 24rpx;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 38rpx;
  font-weight: 800;
  color: $ink;
}
.stat-label {
  font-size: 22rpx;
  color: $ink-light;
}
.ring-wrap {
  flex-shrink: 0;
  margin-left: 4rpx;
}
.ring-pct {
  font-size: 30rpx;
  font-weight: 800;
  color: #4e9b52;
}
.ring-sub {
  font-size: 20rpx;
  color: $ink-light;
}
.chips-row {
  padding: 0 24rpx 16rpx;
  display: flex;
  flex-wrap: wrap;
}
.filter-row {
  padding: 0 24rpx 16rpx;
}
.filter-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 18rpx rgba(122, 96, 76, 0.06);
}
.switch-label {
  font-size: 25rpx;
  color: $ink;
  font-weight: 500;
  margin-right: 10rpx;
}
.mini-switch {
  width: 76rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: #e8e0d6;
  position: relative;
  transition: background 0.2s ease;
}
.mini-switch.on {
  background: $matcha;
}
.mini-switch .knob {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  transition: left 0.2s ease;
}
.mini-switch.on .knob {
  left: calc(100% - 38rpx);
}
.member-card {
  padding: 8rpx 26rpx;
}
.award-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $line;
}
.award-row.last {
  border-bottom: none;
}
.award-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.award-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
}
.award-no {
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.award-right {
  display: flex;
  gap: 10rpx;
  flex-shrink: 0;
}
.pill-money {
  background: rgba(201, 182, 228, 0.2);
  color: #8d7bc0;
}
</style>
