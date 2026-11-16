<template>
  <view class="page">
    <view class="section-title">
      <text>共 {{ tasks.length }} 个任务</text>
      <text class="section-more" @tap="goCreate">＋ 新建任务</text>
    </view>

    <view v-if="tasks.length">
      <view
        v-for="t in tasks"
        :key="t.id"
        class="card task-card"
        @tap="openTask(t)"
      >
        <view class="task-head">
          <text class="task-kind-tag" :class="t.kind === 'distribute' ? 'tag-distribute' : 'tag-collect'">
            {{ t.kind === 'distribute' ? '分发' : '收集' }}
          </text>
          <text class="task-name">{{ t.name }}</text>
        </view>
        <text v-if="t.remark" class="task-remark">{{ t.remark }}</text>
        <view class="task-progress-row">
          <view class="progress-bar">
            <view
              class="progress-inner"
              :style="{ width: progressPct(t) + '%', background: t.received >= t.total && t.total > 0 ? 'var(--mb-matcha)' : 'var(--mb-primary)' }"
            ></view>
          </view>
          <text class="task-progress-text" :class="{ complete: t.received >= t.total && t.total > 0 }">
            {{ (t.kind === 'distribute' ? '已领 ' : '已交 ') + t.received + ' / ' + t.total }}
          </text>
        </view>
        <view class="task-meta-row">
          <text v-if="t.deadline" class="task-deadline" :class="{ passed: isPassed(t.deadline) }">
            截止 {{ fmtDate(t.deadline) }}{{ isPassed(t.deadline) ? '（已过期）' : '' }}
          </text>
          <text class="task-created">{{ fmtDate(t.createdAt) }}</text>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="还没有任务，点右上角新建一个吧" />
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="collection" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { collectionTasks } from '../../api'
import { fmtDate, isPassed } from '../../utils/format'

export default {
  components: { TabBar, EmptyState },
  data() {
    return { tasks: [] }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDate,
    isPassed,
    progressPct(t) {
      if (!t.total) return 0
      return Math.round((t.received / t.total) * 100)
    },
    async load() {
      try {
        this.tasks = (await collectionTasks()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openTask(t) {
      uni.navigateTo({ url: `/pages/collection/detail?id=${t.id}` })
    },
    goCreate() {
      uni.navigateTo({ url: '/pages/collection/create' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 16rpx;
}
.task-card:active {
  transform: scale(0.985);
}
.task-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.task-kind-tag {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: var(--mb-on-primary);
}
.tag-collect {
  background: $matcha;
}
.tag-distribute {
  background: $peach;
}
.task-name {
  font-size: 31rpx;
  font-weight: 700;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.task-remark {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.task-progress-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 20rpx;
}
.progress-bar {
  flex: 1;
  height: 14rpx;
  border-radius: 999rpx;
  background: var(--mb-sage-light);
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  border-radius: 999rpx;
  transition: width 0.3s ease;
}
.task-progress-text {
  flex-shrink: 0;
  font-size: 25rpx;
  color: var(--mb-warn-text);
  font-weight: 600;
}
.task-progress-text.complete {
  color: var(--mb-ok);
}
.task-meta-row {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
}
.task-deadline {
  font-size: 23rpx;
  color: $ink-light;
}
.task-deadline.passed {
  color: var(--mb-berry);
  font-weight: 600;
}
.task-created {
  font-size: 23rpx;
  color: $ink-light;
}
</style>
