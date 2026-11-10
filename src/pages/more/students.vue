<template>
  <view class="page">
    <view class="search-row">
      <input v-model="keyword" class="field-input search-input" placeholder="搜索姓名 / 学号" />
      <text class="search-count">{{ filtered.length }} / {{ students.length }}</text>
    </view>
    <view class="card" v-if="students.length">
      <view class="lock-banner">
        {{ locked ? '🔒 名单已锁定（筛查基准不会被误改）' : '🔓 名单未锁定' }}
      </view>
      <view
        v-for="(s, idx) in filtered"
        :key="s.id"
        class="student-row"
        :class="{ last: idx === filtered.length - 1 }"
      >
        <text class="student-idx">{{ idx + 1 }}</text>
        <text class="student-name">{{ s.name }}</text>
        <text class="student-no">{{ s.studentNo || '—' }}</text>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="🌸" text="基准名单为空，请先在桌面版导入" />
    </view>
  </view>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import { studentsList } from '../../api'

export default {
  components: { EmptyState },
  data() {
    return {
      students: [],
      locked: false,
      keyword: ''
    }
  },
  computed: {
    filtered() {
      const k = this.keyword.trim().toLowerCase()
      if (!k) return this.students
      return this.students.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(k) ||
          (s.studentNo || '').toLowerCase().includes(k)
      )
    }
  },
  onShow() {
    this.load()
  },
  methods: {
    async load() {
      try {
        const data = await studentsList()
        this.students = (data && data.students) || []
        this.locked = !!(data && data.locked)
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
}
.search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx 18rpx;
}
.search-input {
  flex: 1;
}
.search-count {
  font-size: 24rpx;
  color: $ink-light;
  flex-shrink: 0;
}
.lock-banner {
  font-size: 24rpx;
  color: $ink-light;
  background: #faf5ee;
  border-radius: 16rpx;
  padding: 16rpx 22rpx;
  margin-bottom: 8rpx;
}
.student-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $line;
}
.student-row.last {
  border-bottom: none;
}
.student-idx {
  width: 50rpx;
  font-size: 24rpx;
  color: $ink-light;
  text-align: center;
}
.student-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}
.student-no {
  font-size: 24rpx;
  color: $ink-light;
}
</style>
