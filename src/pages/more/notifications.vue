<template>
  <view class="page">
    <view v-if="items.length" class="toolbar-line">
      <text class="muted-line">点击消息标记已读 · 共 {{ unread }} 条未读</text>
      <text class="read-all" @tap="readAll">全部已读</text>
    </view>
    <view v-if="items.length">
      <view
        v-for="n in items"
        :key="n.id"
        class="card notify-card"
        :class="{ unread: !n.read }"
        @tap="readOne(n)"
      >
        <view class="notify-head">
          <view class="prio-dot" :class="dotClass(n.type)"></view>
          <text class="notify-title">{{ n.title }}</text>
        </view>
        <text v-if="n.body" class="notify-body">{{ n.body }}</text>
        <text class="notify-time">{{ fmtDateTime(n.createdAt) }}{{ n.read ? '　已读' : '' }}</text>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="暂无消息，处理中的事项到期会出现在这里" />
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="more" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { notificationList, notificationRead, notificationReadAll } from '../../api'
import { fmtDateTime } from '../../utils/format'

export default {
  components: { TabBar, EmptyState },
  data() {
    return { items: [], unread: 0 }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDateTime,
    dotClass(type) {
      return type === 'leave_end' ? 'high' : type === 'collection_deadline' ? 'mid' : 'low'
    },
    async load() {
      try {
        const data = await notificationList()
        this.items = data.items || []
        this.unread = data.unread || 0
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async readOne(n) {
      if (n.read) return
      try {
        await notificationRead(n.id)
        n.read = true
        this.unread = Math.max(0, this.unread - 1)
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async readAll() {
      try {
        await notificationReadAll()
        await this.load()
        uni.showToast({ title: '已全部标记为已读', icon: 'none' })
      } catch (e) {
        /* 拦截器已提示 */
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
.toolbar-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10rpx 14rpx;
}
.muted-line {
  font-size: 24rpx;
  color: $ink-light;
}
.read-all {
  font-size: 25rpx;
  color: #3e5c4b;
  font-weight: 600;
}
.notify-card {
  padding: 26rpx 28rpx;
}
.notify-card.unread {
  background: #fbf8f0;
}
.notify-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.prio-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: $ink-light;
}
.prio-dot.high {
  background: $berry;
}
.prio-dot.mid {
  background: $warn;
}
.notify-title {
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
  flex: 1;
  min-width: 0;
}
.notify-body {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 8rpx;
  line-height: 1.5;
}
.notify-time {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
</style>
