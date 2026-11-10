<template>
  <view class="page">
    <view class="card">
      <text class="form-label">任务类型</text>
      <view class="kind-row">
        <view class="kind-cell" :class="{ active: form.kind === 'collect' }" @tap="form.kind = 'collect'">
          <text class="kind-icon">📥</text>
          <text class="kind-name">收集材料</text>
          <text class="kind-desc">培养计划、问卷、表格</text>
        </view>
        <view class="kind-cell" :class="{ active: form.kind === 'distribute' }" @tap="form.kind = 'distribute'">
          <text class="kind-icon">📤</text>
          <text class="kind-name">分发材料</text>
          <text class="kind-desc">通知附件、盖章资料</text>
        </view>
      </view>

      <text class="form-label">任务名称</text>
      <input v-model="form.name" class="field-input" :placeholder="form.kind === 'distribute' ? '如：盖章成绩单分发' : '如：培养计划提交'" maxlength="128" />

      <text class="form-label">截止日期（可选）</text>
      <picker mode="date" :value="form.deadline" @change="onDeadlineChange">
        <view class="field-input picker-view">
          <text :class="{ placeholder: !form.deadline }">{{ form.deadline || '点选日期' }}</text>
          <text v-if="form.deadline" class="picker-clear" @tap.stop="form.deadline = ''">✕</text>
        </view>
      </picker>

      <text class="form-label">备注（可选）</text>
      <textarea v-model="form.remark" class="field-input form-textarea" maxlength="512" placeholder="补充说明" />
    </view>

    <view class="card">
      <view class="range-head">
        <text class="form-label range-label">名单范围</text>
        <view class="range-tools">
          <text class="range-link" @tap="selectAll">全选</text>
          <text class="range-link" @tap="form.studentIds = []">清空</text>
        </view>
      </view>
      <text class="range-hint">已选 {{ form.studentIds.length }} / {{ students.length }} 人（默认全班）</text>
      <input v-model="keyword" class="field-input range-search" placeholder="搜索姓名 / 学号" />
      <scroll-view scroll-y class="range-list">
        <view
          v-for="s in filteredStudents"
          :key="s.id"
          class="popup-row"
          @tap="toggleStudent(s.id)"
        >
          <view class="check-circle" :class="{ on: form.studentIds.includes(s.id) }">✓</view>
          <text class="popup-row-name">{{ s.name }}（{{ s.studentNo || '无学号' }}）</text>
        </view>
        <view v-if="!filteredStudents.length" class="empty">没有匹配的同学</view>
      </scroll-view>
    </view>

    <button class="btn btn-primary submit-btn" :disabled="submitting" @tap="submit">
      {{ submitting ? '创建中…' : '创建任务' }}
    </button>
  </view>
</template>

<script>
import { studentsList, collectionCreate } from '../../api'

export default {
  data() {
    return {
      form: { kind: 'collect', name: '', deadline: '', remark: '', studentIds: [] },
      students: [],
      keyword: '',
      submitting: false
    }
  },
  computed: {
    filteredStudents() {
      const k = this.keyword.trim().toLowerCase()
      if (!k) return this.students
      return this.students.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(k) ||
          (s.studentNo || '').toLowerCase().includes(k)
      )
    }
  },
  onLoad() {
    this.loadStudents()
  },
  methods: {
    async loadStudents() {
      try {
        const data = await studentsList()
        this.students = (data && data.students) || []
        // 默认全班
        this.form.studentIds = this.students.map((s) => s.id)
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    onDeadlineChange(e) {
      this.form.deadline = e.detail.value
    },
    toggleStudent(id) {
      const i = this.form.studentIds.indexOf(id)
      if (i >= 0) this.form.studentIds.splice(i, 1)
      else this.form.studentIds.push(id)
    },
    selectAll() {
      this.form.studentIds = this.students.map((s) => s.id)
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.name.trim()) {
        uni.showToast({ title: '任务名称不能为空', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const data = await collectionCreate({
          kind: this.form.kind,
          name: this.form.name.trim(),
          remark: this.form.remark,
          deadline: this.form.deadline ? `${this.form.deadline}T00:00:00` : null,
          studentIds: this.form.studentIds
        })
        uni.showToast({ title: `任务已创建，共 ${data.total} 人`, icon: 'none' })
        setTimeout(() => {
          uni.redirectTo({ url: `/pages/collection/detail?id=${data.id}` })
        }, 700)
      } catch (e) {
        /* 拦截器已提示 */
      } finally {
        this.submitting = false
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
.form-label {
  display: block;
  font-size: 26rpx;
  color: $ink-light;
  margin: 26rpx 0 12rpx;
  font-weight: 500;
}
.kind-row {
  display: flex;
  gap: 16rpx;
}
.kind-cell {
  flex: 1;
  border: 2rpx solid $line;
  border-radius: 24rpx;
  padding: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  transition: all 0.15s ease;
}
.kind-cell.active {
  border-color: $primary;
  background: rgba(127, 181, 232, 0.1);
}
.kind-icon {
  font-size: 40rpx;
}
.kind-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
}
.kind-desc {
  font-size: 22rpx;
  color: $ink-light;
}
.pickerView,
.picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.placeholder {
  color: #b8b0c0;
}
.picker-clear {
  color: $ink-light;
  font-size: 26rpx;
  padding: 0 8rpx;
}
.form-textarea {
  height: 130rpx;
  width: auto;
}
.range-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.range-label {
  margin: 0;
}
.range-tools {
  display: flex;
  gap: 24rpx;
}
.range-link {
  font-size: 25rpx;
  color: #4d8ecf;
  font-weight: 600;
}
.range-hint {
  display: block;
  font-size: 23rpx;
  color: $ink-light;
  margin: 10rpx 0 14rpx;
}
.range-search {
  margin-bottom: 14rpx;
}
.range-list {
  max-height: 44vh;
  border-top: 1rpx solid $line;
}
.popup-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 4rpx;
  border-bottom: 1rpx solid $line;
}
.popup-row-name {
  flex: 1;
  font-size: 27rpx;
  color: $ink;
}
.check-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #e0d6c8;
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.check-circle.on {
  background: $primary;
  border-color: $primary;
}
.submit-btn {
  margin: 10rpx 24rpx 0;
  width: auto;
}
</style>
