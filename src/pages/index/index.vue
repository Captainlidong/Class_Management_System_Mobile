<template>
  <!-- #ifdef APP-PLUS -->
  <!-- APK 壳方案：App 端直接全屏加载线上 H5（Cookie 同源、更新即时生效） -->
  <web-view :src="appUrl"></web-view>
  <!-- #endif -->
  <!-- #ifndef APP-PLUS -->
  <view class="page" :class="{ entered }">
    <!-- 问候区 -->
    <view class="greet-row anim d0">
      <view class="greet-left">
        <text class="greet-hello">{{ greetingText }}{{ auth.username ? '，' + auth.username : '' }}</text>
        <text class="greet-date">{{ dateText }}</text>
      </view>
      <view class="greet-bell" @tap="goTodos">
        <AppIcon name="bell" :size="22" />
        <view v-if="pendingTodos.length" class="bell-dot"></view>
      </view>
    </view>

    <!-- 待办提醒卡（未完成时置顶显示） -->
    <template v-if="pendingTodos.length">
      <view class="section-title anim d1">
        <text>待办，一件件来</text>
        <text class="section-more" @tap="goTodos">全部 ›</text>
      </view>
      <view class="card todo-card anim d1">
        <view
          v-for="(t, idx) in urgentTodos"
          :key="t.id"
          class="todo-row"
          :class="{ last: idx === urgentTodos.length - 1 }"
          @tap="goTodos"
        >
          <view class="todo-cat">
            <CatSitting v-if="idx === 0" :width="56" />
            <CatSleep v-else-if="idx === 1" :width="72" />
            <CatWave v-else :width="56" />
          </view>
          <view class="todo-row-main">
            <text class="todo-title">{{ t.title }}</text>
            <text v-if="t.dueAt" class="todo-due" :class="{ overdue: t.overdue }">{{ dueLabel(t) }}</text>
          </view>
          <view class="todo-badge" :class="t.overdue ? 'badge-overdue' : (t.dueToday ? 'badge-today' : 'badge-normal')">
            {{ t.overdue ? '已过期' : (t.dueToday ? '今天' : '待办') }}
          </view>
        </view>
        <text v-if="pendingTodos.length > urgentTodos.length" class="todo-more" @tap="goTodos">
          还有 {{ pendingTodos.length - urgentTodos.length }} 件待办 ›
        </text>
      </view>
    </template>

    <!-- 英雄卡：收集进度 -->
    <view class="section-title anim d2">
      <text>资料收集与分发</text>
      <text class="section-more" @tap="goCollection">全部 ›</text>
    </view>
    <view class="hero-card card anim d2" @tap="goCollection">
      <view class="hero-ring">
        <ProgressRing :size="170" :pct="overallPct" color="#3E5C4B" track="#DCE8DC">
          <text class="ring-pct">{{ overallPct }}%</text>
          <text class="ring-label">今日完成</text>
        </ProgressRing>
      </view>
      <view class="hero-right">
        <text class="hero-num">{{ overallReceived }} / {{ overallTotal }}</text>
        <text class="hero-unit">件已交 · 已经照顾班级很多啦</text>
        <view class="hero-btn" @tap.stop="goCollection">
          <text>查看收集任务</text>
          <AppIcon name="chevron" :size="14" />
        </view>
      </view>
      <view class="hero-cat">
        <CatSitting :width="120" />
      </view>
    </view>

    <!-- 三格小统计 -->
    <view class="mini-grid anim d3">
      <view class="mini-cell">
        <view class="mini-icon-wrap"><AppIcon name="clock" :size="18" /></view>
        <text class="mini-num">{{ pendingTodos.length }}</text>
        <text class="mini-label">待办事项</text>
      </view>
      <view class="mini-cell">
        <view class="mini-icon-wrap"><AppIcon name="moon" :size="18" /></view>
        <text class="mini-num">{{ leaveStats.activeCount || 0 }}</text>
        <text class="mini-label">请假中</text>
      </view>
      <view class="mini-cell">
        <view class="mini-icon-wrap"><AppIcon name="users" :size="18" /></view>
        <text class="mini-num">{{ studentsCount }}</text>
        <text class="mini-label">班级人数</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="section-title anim d4"><text>你来打理，记录交给喵</text></view>
    <view class="quick-grid anim d4">
      <view class="quick-cell" @tap="goCreate">
        <view class="quick-icon-wrap quick-green"><AppIcon name="plus" :size="20" /></view>
        <text class="quick-label">新建收集任务</text>
        <text class="quick-desc">收材料 · 发材料</text>
      </view>
      <view class="quick-cell" @tap="goLeaveEdit">
        <view class="quick-icon-wrap quick-sage"><AppIcon name="edit" :size="20" /></view>
        <text class="quick-label">登记请假</text>
        <text class="quick-desc">时长 · 类型 · 原因</text>
      </view>
      <view class="quick-cell" @tap="goCheck">
        <view class="quick-icon-wrap quick-butter"><AppIcon name="sparkle" :size="20" /></view>
        <text class="quick-label">名单筛查</text>
        <text class="quick-desc">粘贴名单一键比对</text>
      </view>
      <view class="quick-cell" @tap="goAnnouncements">
        <view class="quick-icon-wrap quick-peach"><AppIcon name="megaphone" :size="20" /></view>
        <text class="quick-label">群发素材</text>
        <text class="quick-desc">文案 · 拍照上传</text>
      </view>
    </view>

    <!-- 欢迎过场（登录成功后的第一次进入） -->
    <view class="welcome-overlay" :class="{ fadeout: overlayFade }" v-if="welcomeOverlay">
      <view class="w-bubble">
        <SpeechBubble :text="welcomeOverlayText" />
      </view>
      <view class="w-cat">
        <CatWave :width="260" />
      </view>
      <view class="w-dots">
        <view class="w-dot"></view>
        <view class="w-dot wd2"></view>
        <view class="w-dot wd3"></view>
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
import AppIcon from '../../components/AppIcon.vue'
import ProgressRing from '../../components/ProgressRing.vue'
import CatSitting from '../../components/cats/CatSitting.vue'
import CatSleep from '../../components/cats/CatSleep.vue'
import CatWave from '../../components/cats/CatWave.vue'
import SpeechBubble from '../../components/cats/SpeechBubble.vue'
import { useAuthStore } from '../../stores/auth'
import { collectionTasks, leaveStats, studentsList, todoList } from '../../api'
import { greeting, todayLabel, isPassed, fmtDateTime } from '../../utils/format'

export default {
  components: { TabBar, EmptyState, AppIcon, ProgressRing, CatSitting, CatSleep, CatWave, SpeechBubble },
  data() {
    return {
      tasks: [],
      leaveStats: {},
      studentsCount: 0,
      pendingTodos: [],
      loaded: false,
      welcomeOverlay: false,
      welcomeName: '',
      overlayFade: false,
      entered: false,
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
    },
    welcomeOverlayText() {
      return `欢迎回来，${this.welcomeName || '班长'} 喵～`
    },
    overallTotal() {
      return this.tasks.reduce((sum, t) => sum + (t.total || 0), 0)
    },
    overallReceived() {
      return this.tasks.reduce((sum, t) => sum + (t.received || 0), 0)
    },
    overallPct() {
      if (!this.overallTotal) return 0
      return Math.round((this.overallReceived / this.overallTotal) * 100)
    }
  },
  onShow() {
    // #ifdef APP-PLUS
    // App 端是 web-view 壳，一切逻辑在网页内，不发请求不做鉴权
    return
    // #endif
    const auth = this.auth
    // 欢迎过场：登录成功后的第一次进入
    const flagRaw = uni.getStorageSync('miaoban_welcome')
    if (flagRaw) {
      let name = ''
      try {
        const f = typeof flagRaw === 'string' ? JSON.parse(flagRaw) : flagRaw
        name = (f && f.name) || ''
      } catch (e) {
        /* ignore */
      }
      uni.removeStorageSync('miaoban_welcome')
      this.welcomeName = name
      this.welcomeOverlay = true
      this.overlayFade = false
      this.entered = false
    }
    if (!auth.statusLoaded) {
      auth.refresh().then(() => this.afterAuth())
    } else {
      this.afterAuth()
    }
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDateTime,
    afterAuth() {
      if (this.auth.authRequired && !this.auth.loggedIn) {
        uni.reLaunch({ url: '/pages/login/login' })
        return
      }
      this.beginEnter()
    },
    /** 数据加载与欢迎过场并行；过场最短停留后淡出揭开 */
    async beginEnter() {
      const min = new Promise((resolve) => setTimeout(resolve, this.welcomeOverlay ? 1300 : 0))
      await Promise.all([this.load(), min])
      if (this.welcomeOverlay) {
        this.overlayFade = true
        setTimeout(() => {
          this.welcomeOverlay = false
          this.entered = true
        }, 480)
      } else {
        this.entered = true
      }
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
    dueLabel(t) {
      if (t.overdue) return `已过期 · ${fmtDateTime(t.dueAt)}`
      if (t.dueToday) return `今天到期 · ${fmtDateTime(t.dueAt).slice(-5)}`
      return `截止 ${fmtDateTime(t.dueAt)}`
    },
    goTodos() {
      uni.navigateTo({ url: '/pages/more/todos' })
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
  padding-top: 20rpx;
}

/* —— 问候区 —— */
.greet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 40rpx 26rpx;
}
.greet-hello {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: $ink;
}
.greet-date {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.greet-bell {
  position: relative;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #fff;
  border: 1rpx solid $line;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary-deep;
}
.bell-dot {
  position: absolute;
  top: 14rpx;
  right: 16rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $berry;
  border: 2rpx solid #fff;
}

/* —— 待办提醒卡 —— */
.todo-card {
  padding: 8rpx 26rpx;
}
.todo-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $line;
}
.todo-row.last {
  border-bottom: none;
}
.todo-cat {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  width: 72rpx;
  height: 56rpx;
  overflow: visible;
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
.todo-due.overdue {
  color: $berry;
  font-weight: 600;
}
.todo-badge {
  flex-shrink: 0;
  font-size: 21rpx;
  font-weight: 700;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}
.badge-overdue {
  background: rgba(201, 111, 94, 0.16);
  color: #a8503f;
}
.badge-today {
  background: rgba(217, 164, 65, 0.2);
  color: #a2681f;
}
.badge-normal {
  background: $sage-light;
  color: $primary-deep;
}
.todo-more {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: $primary;
  padding: 16rpx 0 10rpx;
  font-weight: 600;
}

/* —— 英雄进度卡（鼠尾草底） —— */
.hero-card {
  background: $sage-card;
  border: none;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 34rpx 30rpx;
  overflow: hidden;
  position: relative;
}
.hero-ring {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.ring-pct {
  font-size: 34rpx;
  font-weight: 800;
  color: $primary-deep;
}
.ring-label {
  font-size: 19rpx;
  color: $ink-light;
}
.hero-right {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.hero-num {
  font-size: 40rpx;
  font-weight: 800;
  color: $primary-deep;
}
.hero-unit {
  font-size: 22rpx;
  color: rgba(47, 59, 51, 0.62);
}
.hero-btn {
  margin-top: 14rpx;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: $primary;
  color: #fff;
  border-radius: 999rpx;
  padding: 14rpx 26rpx;
  font-size: 24rpx;
  font-weight: 600;
}
.hero-cat {
  position: absolute;
  right: -14rpx;
  bottom: -20rpx;
  opacity: 0.9;
  z-index: 0;
}

/* —— 三格小统计（白卡+鼠尾草图标底） —— */
.mini-grid {
  display: flex;
  gap: 18rpx;
  margin: 0 24rpx 24rpx;
}
.mini-cell {
  flex: 1;
  background: #fff;
  border: 1rpx solid rgba(232, 226, 212, 0.7);
  border-radius: 28rpx;
  padding: 22rpx 0 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mini-icon-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 18rpx;
  background: $sage-light;
  color: $primary-deep;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}
.mini-num {
  font-size: 36rpx;
  font-weight: 800;
  color: $ink;
}
.mini-label {
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 2rpx;
}

/* —— 快捷入口 —— */
.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  padding: 0 24rpx;
}
.quick-cell {
  width: calc(50% - 9rpx);
  background: #fff;
  border: 1rpx solid rgba(232, 226, 212, 0.7);
  border-radius: 28rpx;
  padding: 26rpx 26rpx 22rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.quick-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}
.quick-green {
  background: $sage-light;
  color: $primary-deep;
}
.quick-sage {
  background: rgba(143, 183, 155, 0.24);
  color: #4e6b58;
}
.quick-butter {
  background: rgba(217, 164, 65, 0.18);
  color: #a2681f;
}
.quick-peach {
  background: rgba(201, 111, 94, 0.14);
  color: #b06050;
}
.quick-label {
  font-size: 27rpx;
  font-weight: 700;
  color: $ink;
}
.quick-desc {
  font-size: 22rpx;
  color: $ink-light;
}

/* —— 欢迎过场 —— */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: $cream-bg;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: opacity 0.45s ease;
}
.welcome-overlay.fadeout {
  opacity: 0;
  pointer-events: none;
}
.w-bubble {
  z-index: 2;
}
.w-cat {
  margin-top: -12rpx;
  animation: cat-sway 1.6s ease-in-out infinite;
}
.w-dots {
  display: flex;
  gap: 14rpx;
  margin-top: 16rpx;
}
.w-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $primary;
  animation: dot-bounce 1.1s ease infinite;
}
.w-dot.wd2 {
  animation-delay: 0.15s;
}
.w-dot.wd3 {
  animation-delay: 0.3s;
}

/* —— 登录后入场：卡片依次上浮渐入 —— */
.page.entered .anim {
  animation: rise 0.55s ease both;
}
.page.entered .d1 {
  animation-delay: 0.09s;
}
.page.entered .d2 {
  animation-delay: 0.18s;
}
.page.entered .d3 {
  animation-delay: 0.27s;
}
.page.entered .d4 {
  animation-delay: 0.36s;
}
</style>
