<template>
  <view class="page">
    <view class="card search-card">
      <input
        v-model="keyword"
        class="field-input search-input"
        placeholder="搜索分组或成员姓名 / 学号"
      />
    </view>

    <view v-if="visibleGroups.length">
      <view v-for="g in visibleGroups" :key="g.id" class="card group-card">
        <view class="group-head" @tap="toggle(g)">
          <view class="group-info">
            <text class="group-name">{{ g.name }}</text>
            <text v-if="g.remark" class="group-remark">{{ g.remark }}</text>
          </view>
          <text class="group-count">{{ g.memberCount || (g.members || []).length }} 人</text>
          <AppIcon name="chevron" :size="16" class="group-arrow" :class="{ open: expanded === g.id }" />
        </view>
        <view v-if="expanded === g.id" class="members">
          <text class="muted-line">点名单可直接复制姓名</text>
          <view class="member-chips">
            <text
              v-for="m in visibleMembers(g)"
              :key="m.studentId"
              class="member-chip"
              :class="{ hit: isHit(m) }"
              @tap="copyName(m)"
            >{{ m.name }}<text class="member-no">{{ m.studentNo }}</text></text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState :text="keyword ? '没有匹配的分组或成员' : '还没有自定义分组，去桌面端创建后同步到这里'" />
    </view>

    <view class="tabbar-spacer"></view>
    <TabBar current="more" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import { groupList } from '../../api'

export default {
  components: { TabBar, AppIcon, EmptyState },
  data() {
    return { groups: [], keyword: '', expanded: null }
  },
  computed: {
    visibleGroups() {
      const kw = (this.keyword || '').trim().toLowerCase()
      if (!kw) return this.groups
      return this.groups.filter(
        (g) =>
          (g.name || '').toLowerCase().includes(kw) ||
          (g.members || []).some(
            (m) =>
              (m.name || '').toLowerCase().includes(kw) ||
              String(m.studentNo || '').toLowerCase().includes(kw)
          )
      )
    }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    async load() {
      try {
        this.groups = (await groupList()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    toggle(g) {
      this.expanded = this.expanded === g.id ? null : g.id
    },
    isHit(m) {
      const kw = (this.keyword || '').trim().toLowerCase()
      if (!kw) return false
      return (
        (m.name || '').toLowerCase().includes(kw) ||
        String(m.studentNo || '').toLowerCase().includes(kw)
      )
    },
    visibleMembers(g) {
      const kw = (this.keyword || '').trim().toLowerCase()
      if (!kw) return g.members || []
      return (g.members || []).filter(
        (m) =>
          (m.name || '').toLowerCase().includes(kw) ||
          String(m.studentNo || '').toLowerCase().includes(kw)
      )
    },
    copyName(m) {
      uni.setClipboardData({
        data: m.name,
        success: () => uni.showToast({ title: `已复制「${m.name}」`, icon: 'none' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
  padding-bottom: 60rpx;
}
.search-card {
  padding: 18rpx 24rpx;
}
.search-input {
  width: auto;
}
.group-card {
  padding: 26rpx 28rpx;
}
.group-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.group-info {
  flex: 1;
  min-width: 0;
}
.group-name {
  display: block;
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
}
.group-remark {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.group-count {
  font-size: 24rpx;
  color: $ink-light;
  flex-shrink: 0;
}
.group-arrow {
  color: $ink-light;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.group-arrow.open {
  transform: rotate(90deg);
}
.members {
  margin-top: 16rpx;
  border-top: 1rpx solid $line;
  padding-top: 12rpx;
}
.muted-line {
  font-size: 22rpx;
  color: $ink-light;
}
.member-chips {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12rpx;
}
.member-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: #dce8dc;
  color: #2f4838;
  border-radius: 999rpx;
  padding: 10rpx 22rpx;
  font-size: 26rpx;
  font-weight: 600;
  margin: 6rpx 10rpx 6rpx 0;
}
.member-chip.hit {
  background: #e8b4a0;
  color: #7a3d2b;
}
.member-no {
  font-size: 22rpx;
  color: #6d8577;
  font-weight: 500;
}
</style>
