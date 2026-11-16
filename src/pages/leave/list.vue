<template>
  <view class="page">
    <view class="chips-row">
      <text
        v-for="c in chips"
        :key="c.value"
        class="chip"
        :class="{ active: status === c.value }"
        @tap="status = c.value"
      >{{ c.label }}</text>
    </view>

    <view v-if="rows.length">
      <view
        v-for="(l, idx) in rows"
        :key="l.id"
        class="card leave-card"
        :class="{ last: false }"
      >
        <view class="leave-head">
          <text class="leave-name">{{ l.name }}</text>
          <text class="pill" :class="l.status === 'active' ? 'pill-undone' : 'pill-done'">
            {{ l.status === 'active' ? '请假中' : '已结束' }}
          </text>
        </view>
        <text class="leave-info">学号 {{ l.studentNo || '—' }} · {{ typeLabel(l.leaveType) }}</text>
        <text class="leave-info">
          ⏱ {{ fmtDateTime(l.startTime) }} ~ {{ fmtDateTime(l.endTime) }}
        </text>
        <text v-if="l.reason" class="leave-reason">“{{ l.reason }}”</text>
        <text v-if="l.status !== 'active' && l.returnedAt" class="leave-info">
          ✔ 已销假：{{ fmtDateTime(l.returnedAt) }}
        </text>
        <view class="leave-actions">
          <text
            v-if="l.status === 'active'"
            class="leave-action"
            @tap.stop="closeLeave(l)"
          >销假</text>
          <text
            v-if="l.status === 'active'"
            class="leave-action"
            @tap.stop="editLeave(l)"
          >编辑</text>
          <text
            v-if="l.status !== 'active'"
            class="leave-action"
            @tap.stop="reopenLeave(l)"
          >重新打开</text>
          <text class="leave-action danger" @tap.stop="deleteLeave(l)">删除</text>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="暂无请假记录" />
    </view>

    <view class="fab" @tap="goEdit"><AppIcon name="plus" :size="30" /></view>
    <view class="tabbar-spacer"></view>
    <TabBar current="leave" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import { leaveList, leaveClose, leaveReopen, leaveDelete } from '../../api'
import { fmtDateTime } from '../../utils/format'

const TYPE_MAP = { sick: '病假', personal: '事假', official: '公假', other: '其他' }

export default {
  components: { TabBar, EmptyState, AppIcon },
  data() {
    return {
      status: '',
      rows: [],
      chips: [
        { label: '全部', value: '' },
        { label: '请假中', value: 'active' },
        { label: '已销假', value: 'closed' }
      ]
    }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDateTime,
    typeLabel(v) {
      return TYPE_MAP[v] || '其他'
    },
    async load() {
      try {
        this.rows = (await leaveList(this.status ? { status: this.status } : null)) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    closeLeave(l) {
      uni.showModal({
        title: '销假',
        content: `为 ${l.name} 办理销假？`,
        success: async (res) => {
          if (!res.confirm) return
          try {
            await leaveClose(l.id)
            uni.showToast({ title: '已销假', icon: 'none' })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    reopenLeave(l) {
      uni.showModal({
        title: '重新打开',
        content: `将 ${l.name} 的请假重新打开？`,
        success: async (res) => {
          if (!res.confirm) return
          try {
            await leaveReopen(l.id)
            uni.showToast({ title: '已重新打开', icon: 'none' })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    deleteLeave(l) {
      uni.showModal({
        title: '删除记录',
        content: `删除 ${l.name} 的请假记录？不可恢复。`,
        confirmColor: '#C96F5E',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await leaveDelete(l.id)
            uni.showToast({ title: '已删除', icon: 'none' })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    editLeave(l) {
      uni.navigateTo({ url: `/pages/leave/edit?id=${l.id}` })
    },
    goEdit() {
      uni.navigateTo({ url: '/pages/leave/edit' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
}
.chips-row {
  padding: 0 32rpx 18rpx;
  display: flex;
  flex-wrap: wrap;
}
.leave-card {
  padding-bottom: 20rpx;
}
.leave-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.leave-name {
  font-size: 31rpx;
  font-weight: 700;
  color: $ink;
}
.leave-info {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 10rpx;
}
.leave-reason {
  display: block;
  font-size: 25rpx;
  color: $ink;
  background: var(--mb-cream-2);
  border-radius: 16rpx;
  padding: 14rpx 20rpx;
  margin-top: 14rpx;
}
.leave-actions {
  display: flex;
  justify-content: flex-end;
  gap: 34rpx;
  margin-top: 18rpx;
}
.leave-action {
  font-size: 25rpx;
  color: var(--mb-primary);
  font-weight: 600;
}
.leave-action.danger {
  color: $berry;
}
.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(180rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $primary;
  color: var(--mb-on-primary);
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx var(--mb-primary-soft);
  z-index: 900;
}
</style>
