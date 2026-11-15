<template>
  <view class="page">
    <view class="card user-card">
      <view class="user-row">
        <view class="user-avatar"><CatWave :width="72" /></view>
        <view class="user-info">
          <text class="user-name">{{ auth.username || '班长' }}</text>
          <text class="user-sub">{{ auth.authRequired ? '🔒 已启用登录保护' : '本机模式' }}</text>
        </view>
      </view>
    </view>

    <view class="card menu-card">
      <view class="menu-cell" @tap="go('/pages/more/notifications')">
        <view class="menu-icon"><AppIcon name="bell" :size="22" /></view>
        <text class="menu-name">消息中心</text>
        <text class="menu-extra">{{ unread ? unread + ' 条未读' : '' }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="switchTerm">
        <view class="menu-icon"><AppIcon name="calendar" :size="22" /></view>
        <text class="menu-name">学期切换</text>
        <text class="menu-extra">{{ termName }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/todos')">
        <view class="menu-icon"><AppIcon name="clock" :size="22" /></view>
        <text class="menu-name">待办事务</text>
        <text class="menu-extra">{{ pendingCount ? pendingCount + ' 件未完成' : '' }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/tasks')">
        <view class="menu-icon"><AppIcon name="calendar" :size="22" /></view>
        <text class="menu-name">长期任务</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/groups')">
        <view class="menu-icon"><AppIcon name="grid" :size="22" /></view>
        <text class="menu-name">自定义分组</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/students')">
        <view class="menu-icon"><AppIcon name="users" :size="22" /></view>
        <text class="menu-name">基准名单</text>
        <text class="menu-extra">{{ studentsCount }} 人</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/announcements')">
        <view class="menu-icon"><AppIcon name="megaphone" :size="22" /></view>
        <text class="menu-name">群发素材</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/check')">
        <view class="menu-icon"><AppIcon name="sparkle" :size="22" /></view>
        <text class="menu-name">名单筛查</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell last" @tap="go('/pages/more/history')">
        <view class="menu-icon"><AppIcon name="book" :size="22" /></view>
        <text class="menu-name">筛查历史</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="card menu-card">
      <view class="menu-cell only" @tap="about">
        <view class="menu-icon"><AppIcon name="grid" :size="22" /></view>
        <text class="menu-name">关于</text>
        <text class="menu-extra">v{{ version }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <button class="btn btn-danger-ghost logout-btn" @tap="logout">退出登录</button>

    <view class="tabbar-spacer"></view>
    <TabBar current="more" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import CatWave from '../../components/cats/CatWave.vue'
import { useAuthStore } from '../../stores/auth'
import { studentsList, todoList, notificationList, termList, termSwitch } from '../../api'

export default {
  components: { TabBar, AppIcon, CatWave },
  data() {
    return { studentsCount: 0, pendingCount: 0, unread: 0, termName: '', terms: [], version: __APP_VERSION__ }
  },
  computed: {
    auth() {
      return useAuthStore()
    }
  },
  onShow() {
    this.load()
  },
  methods: {
    async load() {
      try {
        const data = await studentsList()
        this.studentsCount = (data && data.count) || 0
      } catch (e) {
        /* 拦截器已提示 */
      }
      try {
        const todos = (await todoList()) || []
        this.pendingCount = todos.filter((t) => !t.done).length
      } catch (e) {
        /* 拦截器已提示 */
      }
      try {
        const notices = await notificationList()
        this.unread = notices.unread || 0
      } catch (e) {
        /* 拦截器已提示 */
      }
      try {
        const terms = await termList()
        this.terms = terms.terms || []
        const view = this.terms.find((t) => t.current) || this.terms[0]
        this.termName = view ? view.name : ''
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    switchTerm() {
      if (!this.terms.length) {
        uni.showToast({ title: '暂无学期数据', icon: 'none' })
        return
      }
      uni.showActionSheet({
        itemList: this.terms.map((t) => t.name + (t.archived ? '（已归档）' : '')),
        success: async (res) => {
          const target = this.terms[res.tapIndex]
          if (!target || target.current) return
          try {
            await termSwitch(target.id)
            uni.reLaunch({ url: '/pages/index/index' })
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    go(url) {
      uni.navigateTo({ url })
    },
    about() {
      uni.showModal({
        title: '关于',
        content: `喵班 · 班级事务管理系统移动端 v${__APP_VERSION__}\n基于 uni-app · 数据与桌面版互通`,
        showCancel: false,
        confirmText: '知道了'
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '退出后需要重新输入账号密码和验证码，确认退出？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await this.auth.logout()
            uni.reLaunch({ url: '/pages/login/login' })
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 22rpx;
}
.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $sage-light, $sage-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
}
.user-name {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $ink;
}
.user-sub {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 6rpx;
}
.menu-card {
  padding: 8rpx 26rpx;
}
.menu-cell {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $line;
}
.menu-cell.last,
.menu-cell.only {
  border-bottom: none;
}
.menu-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 20rpx;
  background: $cream-bg;
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.menu-name {
  font-size: 29rpx;
  font-weight: 600;
  color: $ink;
  flex: 1;
}
.menu-extra {
  font-size: 24rpx;
  color: $ink-light;
}
.menu-arrow {
  font-size: 34rpx;
  color: $ink-light;
}
.logout-btn {
  margin: 0 24rpx;
  width: auto;
}
</style>
