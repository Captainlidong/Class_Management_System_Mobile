<template>
  <view class="page">
    <view class="greet-card card">
      <view class="greet-row">
        <view>
          <text class="greet-hello">{{ greetingText }}{{ auth.username ? '，' + auth.username : '' }}</text>
          <text class="greet-date">{{ dateText }}</text>
        </view>
        <text class="greet-emoji">🌤️</text>
      </view>
    </view>

    <view class="section-title">
      <text>📋 资料收集与分发</text>
      <text class="section-more" @tap="goCollection">全部 ›</text>
    </view>
    <view v-if="tasks.length" class="card task-brief-card">
      <view
        v-for="t in tasks.slice(0, 3)"
        :key="t.id"
        class="task-brief"
        @tap="openTask(t)"
      >
        <view class="task-brief-left">
          <text class="task-kind-tag" :class="t.kind === 'distribute' ? 'tag-distribute' : 'tag-collect'">
            {{ t.kind === 'distribute' ? '发' : '收' }}
          </text>
          <text class="task-name">{{ t.name }}</text>
        </view>
        <text class="task-progress" :class="{ complete: t.received >= t.total && t.total > 0 }">
          {{ (t.kind === 'distribute' ? '已领 ' : '已交 ') + t.received + '/' + t.total }}
        </text>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="📋" text="还没有收集任务，去新建一个吧" />
    </view>

    <view class="section-title"><text>🌙 请假动态</text></view>
    <view class="card stat-grid">
      <view class="stat-cell" style="background: rgba(163, 217, 165, 0.18)">
        <text class="stat-num">{{ leaveStats.activeCount || 0 }}</text>
        <text class="stat-label">请假中</text>
      </view>
      <view class="stat-cell" style="background: rgba(201, 182, 228, 0.2)">
        <text class="stat-num">{{ leaveStats.monthCount || 0 }}</text>
        <text class="stat-label">本月登记</text>
      </view>
      <view class="stat-cell" style="background: rgba(127, 181, 232, 0.16)">
        <text class="stat-num">{{ studentsCount }}</text>
        <text class="stat-label">班级人数</text>
      </view>
    </view>

    <view class="section-title"><text>⚡ 快捷入口</text></view>
    <view class="quick-grid">
      <view class="quick-cell" style="background: rgba(255, 181, 167, 0.2)" @tap="goCreate">
        <text class="quick-icon">➕</text>
        <text class="quick-label">新建收集任务</text>
      </view>
      <view class="quick-cell" style="background: rgba(163, 217, 165, 0.2)" @tap="goLeaveEdit">
        <text class="quick-icon">📝</text>
        <text class="quick-label">登记请假</text>
      </view>
      <view class="quick-cell" style="background: rgba(127, 181, 232, 0.16)" @tap="goCheck">
        <text class="quick-icon">✨</text>
        <text class="quick-label">名单筛查</text>
      </view>
      <view class="quick-cell" style="background: rgba(201, 182, 228, 0.22)" @tap="goAnnouncements">
        <text class="quick-icon">📣</text>
        <text class="quick-label">群发素材</text>
      </view>
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="index" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../stores/auth'
import { collectionTasks, leaveStats, studentsList } from '../../api'
import { greeting, todayLabel, isPassed } from '../../utils/format'

export default {
  components: { TabBar, EmptyState },
  data() {
    return {
      tasks: [],
      leaveStats: {},
      studentsCount: 0,
      loaded: false
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    },
    greetingText() {
      return greeting()
    },
    dateText() {
      return todayLabel()
    }
  },
  onShow() {
    const auth = this.auth
    if (!auth.statusLoaded) {
      auth.refresh().then(() => this.guardAndLoad())
    } else {
      this.guardAndLoad()
    }
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    guardAndLoad() {
      if (this.auth.authRequired && !this.auth.loggedIn) {
        uni.reLaunch({ url: '/pages/login/login' })
        return
      }
      this.load()
    },
    async load() {
      try {
        const [tasks, stats, students] = await Promise.all([
          collectionTasks(),
          leaveStats().catch(() => ({})),
          studentsList().catch(() => ({ count: 0 }))
        ])
        this.tasks = (tasks || []).map((t) => ({ ...t, passed: isPassed(t.deadline) }))
        this.leaveStats = stats || {}
        this.studentsCount = (students && students.count) || 0
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openTask(t) {
      uni.navigateTo({ url: `/pages/collection/detail?id=${t.id}` })
    },
    goCollection() {
      uni.redirectTo({ url: '/pages/collection/list' })
    },
    goCreate() {
      uni.navigateTo({ url: '/pages/collection/create' })
    },
    goLeaveEdit() {
      uni.navigateTo({ url: '/pages/leave/edit' })
    },
    goCheck() {
      uni.navigateTo({ url: '/pages/more/check' })
    },
    goAnnouncements() {
      uni.navigateTo({ url: '/pages/more/announcements' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 16rpx;
}
.greet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff 60%, #fdeee0 100%);
}
.greet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.greet-hello {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: $ink;
}
.greet-date {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.greet-emoji {
  font-size: 56rpx;
}
.task-brief-card {
  padding: 8rpx 28rpx;
}
.task-brief {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $line;
}
.task-brief:last-child {
  border-bottom: none;
}
.task-brief-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex: 1;
  overflow: hidden;
}
.task-kind-tag {
  flex-shrink: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
}
.tag-collect {
  background: $matcha;
}
.tag-distribute {
  background: $peach;
}
.task-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.task-progress {
  flex-shrink: 0;
  font-size: 25rpx;
  color: #b07d1e;
  font-weight: 600;
}
.task-progress.complete {
  color: #4e9b52;
}
.stat-grid {
  display: flex;
  gap: 18rpx;
  padding: 26rpx;
}
.stat-cell {
  flex: 1;
  border-radius: 24rpx;
  padding: 22rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 40rpx;
  font-weight: 800;
  color: $ink;
}
.stat-label {
  font-size: 23rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  padding: 0 24rpx;
}
.quick-cell {
  width: calc(50% - 9rpx);
  border-radius: 28rpx;
  padding: 30rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-sizing: border-box;
}
.quick-icon {
  font-size: 42rpx;
}
.quick-label {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink;
}
</style>
