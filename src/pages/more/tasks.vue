<template>
  <view class="page">
    <view v-if="tasks.length">
      <view
        v-for="t in tasks"
        :key="t.id"
        class="card task-card"
        @tap="toggle(t)"
      >
        <view class="task-head">
          <view class="task-info">
            <text class="task-name">{{ t.name }}</text>
            <text v-if="t.remark" class="task-remark">{{ t.remark }}</text>
          </view>
          <view class="task-side">
            <text class="task-badge">{{ t.type || '自定义' }}</text>
            <text class="task-count">{{ t.recordCount || 0 }} 次筛查</text>
            <AppIcon name="chevron" :size="16" class="task-arrow" :class="{ open: expanded === t.id }" />
          </view>
        </view>
        <view v-if="expanded === t.id" class="records">
          <view v-if="recordsLoading" class="muted-line">加载中…</view>
          <view v-else-if="!records.length" class="muted-line">这个任务下还没有筛查记录</view>
          <view v-else v-for="r in records" :key="r.id" class="record-row">
            <text class="record-title">{{ r.title || '未命名筛查' }}</text>
            <text class="record-meta">
              {{ fmtDateTime(r.checkedAt) }} · 未参与 {{ r.absentCount }}/{{ r.baselineCount }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="还没有长期任务，去桌面端创建后同步到这里" />
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="more" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import { taskList, taskRecords } from '../../api'
import { fmtDateTime } from '../../utils/format'

export default {
  components: { TabBar, AppIcon, EmptyState },
  data() {
    return { tasks: [], expanded: null, records: [], recordsLoading: false }
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
        this.tasks = (await taskList()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async toggle(t) {
      if (this.expanded === t.id) {
        this.expanded = null
        return
      }
      this.expanded = t.id
      this.records = []
      this.recordsLoading = true
      try {
        this.records = (await taskRecords(t.id)) || []
      } catch (e) {
        /* 拦截器已提示 */
      } finally {
        this.recordsLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
  padding-bottom: 60rpx;
}
.task-card {
  padding: 26rpx 28rpx;
}
.task-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.task-info {
  flex: 1;
  min-width: 0;
}
.task-name {
  display: block;
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
}
.task-remark {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 6rpx;
  line-height: 1.5;
}
.task-side {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}
.task-badge {
  font-size: 22rpx;
  color: #3e5c4b;
  background: #dce8dc;
  border-radius: 999rpx;
  padding: 4rpx 16rpx;
  font-weight: 600;
}
.task-count {
  font-size: 24rpx;
  color: $ink-light;
}
.task-arrow {
  color: $ink-light;
  transition: transform 0.2s ease;
}
.task-arrow.open {
  transform: rotate(90deg);
}
.records {
  margin-top: 16rpx;
  border-top: 1rpx solid $line;
  padding-top: 8rpx;
}
.record-row {
  padding: 14rpx 0;
}
.record-title {
  display: block;
  font-size: 26rpx;
  color: $ink;
  font-weight: 600;
}
.record-meta {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.muted-line {
  font-size: 24rpx;
  color: $ink-light;
  padding: 14rpx 0;
}
</style>
