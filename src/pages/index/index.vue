<template>
  <!-- #ifdef APP-PLUS -->
  <!-- APK 壳方案：App 端直接全屏加载线上 H5（Cookie 同源、更新即时生效） -->
  <web-view :src="appUrl"></web-view>
  <!-- #endif -->
  <!-- #ifndef APP-PLUS -->
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

    <template v-if="urgentTodos.length">
      <view class="section-title">
        <text>⏰ 待办提醒</text>
        <text class="section-more" @tap="goTodos">全部 ›</text>
      </view>
      <view class="card todo-card">
        <view
          v-for="(t, idx) in urgentTodos"
          :key="t.id"
          class="todo-row"
          :class="{ last: idx === urgentTodos.length - 1 }"
          @tap="goTodos"
        >
          <view class="todo-badge" :class="t.overdue ? 'badge-overdue' : (t.dueToday ? 'badge-today' : 'badge-normal')">
            {{ t.overdue ? '已过期' : (t.dueToday ? '今天' : '待办') }}
          </view>
          <view class="todo-row-main">
            <text class="todo-title">{{ t.title }}</text>
            <text v-if="t.dueAt" class="todo-due">⏱ {{ fmtDateTime(t.dueAt) }}</text>
          </view>
        </view>
        <text v-if="pendingTodos.length > urgentTodos.length" class="todo-more" @tap="goTodos">
          还有 {{ pendingTodos.length - urgentTodos.length }} 件待办 ›
        </text>
      </view>
    </template>

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
  <!-- #endif -->
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../stores/auth'
import { collectionTasks, leaveStats, studentsList, todoList } from '../../api'
import { greeting, todayLabel, isPassed, fmtDateTime } from '../../utils/format'

export default {
  components: { TabBar, EmptyState },
  data() {
    return {
      tasks: [],
      leaveStats: {},
      studentsCount: 0,
      pendingTodos: [],
      loaded: false,
      // APK 壳加载的线上地址（方案 A：web-view 壳）
      appUrl: 'http://your-server-ip/m/'
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
    },
    /** 未完成待办（服务端已按紧迫度排序），首页卡只展示前 3 条 */
    urgentTodos() {
      return this.pendingTodos.slice(0, 3)
    }
  },
  onShow() {
    // #ifdef APP-PLUS
    // App 端是 web-view 壳，一切逻辑在网页内，不发请求不做鉴权
    return
    // #endif
    const auth = this.auth
    if (!auth.statusLoaded) {
      auth.refresh().then(() => this.guardAndLoad())
    } else {
      this.guardAndLoad()
    }
  },
  // #ifdef APP-PLUS
  /** Android 返回键：优先让网页后退，退无可退再退出应用 */
  onBackPress() {
    const page = typeof this.$getAppWebview === 'function' ? this.$getAppWebview() : null
    const wv = page && page.children ? page.children()[0] : null
    if (wv) {
      try {
        wv.canGoBack((evt) => {
          if (evt && evt.canBack) {
            wv.back()
          } else {
            plus.runtime.quit()
          }
        })
      } catch (err) {
        plus.runtime.quit()
      }
      return true
    }
  },
  // #endif
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
        const [tasks, stats, students, todos] = await Promise.all([
          collectionTasks(),
          leaveStats().catch(() => ({})),
          studentsList().catch(() => ({ count: 0 })),
          todoList().catch(() => [])
        ])
        this.tasks = (tasks || []).map((t) => ({ ...t, passed: isPassed(t.deadline) }))
        this.leaveStats = stats || {}
        this.studentsCount = (students && students.count) || 0
        this.pendingTodos = (todos || []).filter((t) => !t.done)
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    goTodos() {
      uni.navigateTo({ url: '/pages/more/todos' })
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

/* —— 待办提醒卡 —— */
.todo-card {
  padding: 8rpx 26rpx;
}
.todo-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $line;
}
.todo-row.last {
  border-bottom: none;
}
.todo-badge {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: #fff;
}
.badge-overdue {
  background: #f49fb6;
  color: #a02040;
}
.badge-today {
  background: $butter;
  color: #8a5b00;
}
.badge-normal {
  background: rgba(127, 181, 232, 0.3);
  color: #4d8ecf;
}
.todo-row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.todo-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.todo-due {
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.todo-more {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: $primary;
  padding: 16rpx 0 10rpx;
  font-weight: 600;
}
</style>
