<template>
  <view class="page">
    <view class="stat-row card">
      <text class="stat-text">⏰ 未完成 <b>{{ undoneCount }}</b> 件 · 已完成 <b>{{ doneCount }}</b> 件</text>
    </view>

    <view v-if="todos.length">
      <view
        v-for="(t, idx) in todos"
        :key="t.id"
        class="card todo-card"
        :class="{ done: t.done }"
      >
        <view class="todo-head">
          <view class="check-circle" :class="{ on: t.done }" @tap="toggleDone(t)">✓</view>
          <view class="todo-main" @tap="toggleDone(t)">
            <text class="todo-title" :class="{ done: t.done }">{{ t.title }}</text>
            <text v-if="t.detail" class="todo-detail">{{ t.detail }}</text>
            <text v-if="t.dueAt" class="todo-due" :class="t.overdue ? 'overdue' : ''">
              ⏱ {{ t.overdue ? '已过期 · ' : '' }}{{ fmtDateTime(t.dueAt) }}{{ t.done && t.doneAt ? `　✔ ${fmtDateTime(t.doneAt)} 完成` : '' }}
            </text>
          </view>
        </view>
        <view class="todo-actions">
          <text class="todo-action" @tap="openEdit(t)">编辑</text>
          <text class="todo-action danger" @tap="remove(t)">删除</text>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="⏰" text="还没有待办事项，点右下角添加" />
    </view>

    <view class="fab" @tap="openCreate">➕</view>

    <!-- 新建 / 编辑 弹层 -->
    <view class="overlay" v-if="overlay" @tap="overlay = ''">
      <view class="popup" @tap.stop>
        <view class="popup-title">{{ form.id ? '编辑待办' : '新建待办' }}</view>
        <text class="popup-label">事项 *</text>
        <input v-model="form.title" class="field-input popup-input" maxlength="128" placeholder="如：结课前一周收齐课程作业" />
        <text class="popup-label">说明</text>
        <textarea v-model="form.detail" class="field-input popup-textarea" maxlength="512" placeholder="老师的要求、来源、注意事项（可选）" />
        <text class="popup-label">截止时间（可选）</text>
        <view class="dt-row">
          <picker mode="date" :value="form.dueDate" @change="(e) => (form.dueDate = e.detail.value)">
            <view class="field-input dt-input">
              <text :class="{ placeholder: !form.dueDate }">{{ form.dueDate || '日期' }}</text>
            </view>
          </picker>
          <picker mode="time" :value="form.dueTime" @change="(e) => (form.dueTime = e.detail.value)">
            <view class="field-input dt-input">
              <text :class="{ placeholder: !form.dueTime }">{{ form.dueTime || '时间' }}</text>
            </view>
          </picker>
          <text v-if="form.dueDate" class="dt-clear" @tap="form.dueDate = ''; form.dueTime = ''">清除</text>
        </view>
        <text class="popup-hint">填了就按时间提醒排序；不填则作为无期限的跟进事项（如"等通知再办"）。</text>
        <button class="btn btn-primary popup-btn" :disabled="submitting" @tap="submit">
          {{ submitting ? '保存中…' : (form.id ? '保存修改' : '创建待办') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import { todoList, todoCreate, todoUpdate, todoDelete } from '../../api'
import { fmtDateTime } from '../../utils/format'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default {
  components: { EmptyState },
  data() {
    return {
      todos: [],
      overlay: false,
      submitting: false,
      form: { id: null, title: '', detail: '', dueDate: '', dueTime: '' }
    }
  },
  computed: {
    undoneCount() {
      return this.todos.filter((t) => !t.done).length
    },
    doneCount() {
      return this.todos.filter((t) => t.done).length
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
    async load() {
      try {
        this.todos = (await todoList()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openCreate() {
      this.form = { id: null, title: '', detail: '', dueDate: '', dueTime: '' }
      this.overlay = true
    },
    openEdit(t) {
      this.form = {
        id: t.id,
        title: t.title,
        detail: t.detail || '',
        dueDate: t.dueAt ? t.dueAt.slice(0, 10) : '',
        dueTime: t.dueAt ? t.dueAt.slice(11, 16) : ''
      }
      this.overlay = true
    },
    composeDue() {
      if (!this.form.dueDate) return null
      return `${this.form.dueDate}T${this.form.dueTime || '23:59'}`
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.title.trim()) {
        uni.showToast({ title: '事项标题不能为空', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const payload = {
          title: this.form.title.trim(),
          detail: this.form.detail,
          dueAt: this.composeDue()
        }
        if (this.form.id) {
          await todoUpdate(this.form.id, payload)
          uni.showToast({ title: '待办已更新', icon: 'none' })
        } else {
          await todoCreate(payload)
          uni.showToast({ title: '待办已创建', icon: 'none' })
        }
        this.overlay = false
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      } finally {
        this.submitting = false
      }
    },
    async toggleDone(t) {
      try {
        await todoUpdate(t.id, { done: !t.done })
        uni.showToast({ title: t.done ? `已重新打开：${t.title}` : `已完成：${t.title} ✓`, icon: 'none' })
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    remove(t) {
      uni.showModal({
        title: '删除待办',
        content: `删除「${t.title}」？不可恢复。`,
        confirmColor: '#e06c75',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await todoDelete(t.id)
            uni.showToast({ title: '已删除', icon: 'none' })
            this.load()
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
  padding-bottom: 60rpx;
}
.stat-row {
  padding: 22rpx 28rpx;
}
.stat-text {
  font-size: 27rpx;
  color: $ink-light;
}
.stat-text b {
  color: $ink;
  font-size: 30rpx;
}
.todo-card.done {
  opacity: 0.75;
}
.todo-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.check-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #e0d6c8;
  color: #fff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}
.check-circle.on {
  background: $matcha;
  border-color: $matcha;
}
.todo-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.todo-title {
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
}
.todo-title.done {
  text-decoration: line-through;
  color: $ink-light;
  font-weight: 500;
}
.todo-detail {
  font-size: 24rpx;
  color: $ink-light;
  margin-top: 6rpx;
  line-height: 1.5;
}
.todo-due {
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 6rpx;
}
.todo-due.overdue {
  color: #e06c75;
  font-weight: 600;
}
.todo-actions {
  display: flex;
  justify-content: flex-end;
  gap: 34rpx;
  margin-top: 14rpx;
}
.todo-action {
  font-size: 25rpx;
  color: #4d8ecf;
  font-weight: 600;
}
.todo-action.danger {
  color: $berry;
}
.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(40rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $primary;
  color: #fff;
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(127, 181, 232, 0.45);
  z-index: 900;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 45, 35, 0.42);
  /* 低于 uni-modal(999)，保证确认弹窗能盖在弹层上 */
  z-index: 998;
  display: flex;
  align-items: flex-end;
}
.popup {
  width: 100%;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 36rpx 32rpx calc(30rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.popup-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $ink;
  margin-bottom: 18rpx;
}
.popup-label {
  display: block;
  font-size: 25rpx;
  color: $ink-light;
  margin: 20rpx 0 10rpx;
}
.popup-input {
  width: auto;
}
.popup-textarea {
  height: 140rpx;
  width: auto;
}
.dt-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.dt-row > picker {
  flex: 1;
}
.dt-input {
  text-align: center;
}
.dt-clear {
  font-size: 24rpx;
  color: $berry;
  flex-shrink: 0;
}
.placeholder {
  color: #b8b0c0;
}
.popup-hint {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 14rpx;
  line-height: 1.5;
}
.popup-btn {
  margin-top: 26rpx;
}
</style>
