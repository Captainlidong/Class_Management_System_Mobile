<template>
  <view class="page">
    <view class="card user-card">
      <view class="user-row">
        <text class="user-avatar">🎀</text>
        <view class="user-info">
          <text class="user-name">{{ auth.username || '班长' }}</text>
          <text class="user-sub">{{ auth.authRequired ? '🔒 已启用登录保护' : '本机模式' }}</text>
        </view>
      </view>
    </view>

    <view class="card menu-card">
      <view class="menu-cell" @tap="go('/pages/more/students')">
        <text class="menu-icon">🌸</text>
        <text class="menu-name">基准名单</text>
        <text class="menu-extra">{{ studentsCount }} 人</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/announcements')">
        <text class="menu-icon">📣</text>
        <text class="menu-name">群发素材</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell" @tap="go('/pages/more/check')">
        <text class="menu-icon">✨</text>
        <text class="menu-name">名单筛查</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-cell last" @tap="go('/pages/more/history')">
        <text class="menu-icon">📖</text>
        <text class="menu-name">筛查历史</text>
        <text class="menu-extra"></text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="card menu-card">
      <view class="menu-cell only" @tap="about">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-name">关于</text>
        <text class="menu-extra">v1.0.0</text>
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
import { useAuthStore } from '../../stores/auth'
import { studentsList } from '../../api'

export default {
  components: { TabBar },
  data() {
    return { studentsCount: 0 }
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
    },
    go(url) {
      uni.navigateTo({ url })
    },
    about() {
      uni.showModal({
        title: '关于',
        content: '班级管理助手移动端 v1.0.0\n基于 uni-app · 数据与桌面版互通',
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
  background: linear-gradient(135deg, #fdeee0, #fbd9e0);
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
  font-size: 38rpx;
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
