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
            <view class="todo-title-row">
              <view class="prio-dot" :class="t.priority || 'mid'"></view>
              <text class="todo-title" :class="{ done: t.done }">{{ t.title }}</text>
              <text v-if="t.repeatRule && t.repeatRule !== 'none'" class="repeat-mark">↻ {{ repeatLabel(t.repeatRule) }}</text>
            </view>
            <view class="todo-meta">
              <text v-if="t.category && t.category !== '其他'" class="cate-chip">{{ t.category }}</text>
            </view>
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

    <view class="fab" @tap="openCreate"><AppIcon name="plus" :size="30" /></view>

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
        <text class="popup-label">优先级 / 分类</text>
        <view class="dt-row">
          <picker mode="selector" :range="PRIORITY_LABELS" :value="priorityIndex" @change="(e) => (form.priority = PRIORITY_KEYS[e.detail.value])">
            <view class="field-input dt-input">
              <text>{{ priorityLabel }}</text>
            </view>
          </picker>
          <picker mode="selector" :range="CATEGORIES" :value="categoryIndex" @change="(e) => (form.category = CATEGORIES[e.detail.value])">
            <view class="field-input dt-input">
              <text>{{ form.category || '其他' }}</text>
            </view>
          </picker>
        </view>
        <text class="popup-label">重复规则</text>
        <view class="dt-row">
          <picker mode="selector" :range="REPEAT_LABELS" :value="repeatIndex" @change="(e) => (form.repeatRule = REPEAT_KEYS[e.detail.value])">
            <view class="field-input dt-input">
              <text>{{ repeatLabel(form.repeatRule) || '不重复' }}</text>
            </view>
          </picker>
        </view>
        <text class="popup-hint">设了重复且填了截止时间：完成后自动生成下一期（如每周例会、每日体温上报）。</text>
        <button class="btn btn-primary popup-btn" :disabled="submitting" @tap="submit">
          {{ submitting ? '保存中…' : (form.id ? '保存修改' : '创建待办') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import AppIcon from '../../components/AppIcon.vue'
import { todoList, todoCreate, todoUpdate, todoDelete } from '../../api'
import { fmtDateTime } from '../../utils/format'

function pad(n) {
  return String(n).padStart(2, '0')
}

const PRIORITY_KEYS = ['high', 'mid', 'low']
const PRIORITY_LABELS = ['高', '中', '低']
const CATEGORIES = ['教学', '活动', '资料', '通知', '财务', '其他']
const REPEAT_KEYS = ['none', 'daily', 'weekly', 'monthly']
const REPEAT_LABELS = ['不重复', '每天', '每周', '每月']

export default {
  components: { EmptyState, AppIcon },
  data() {
    return {
      todos: [],
      overlay: false,
      submitting: false,
      form: { id: null, title: '', detail: '', dueDate: '', dueTime: '', priority: 'mid', category: '其他', repeatRule: 'none' }
    }
  },
  computed: {
    undoneCount() {
      return this.todos.filter((t) => !t.done).length
    },
    doneCount() {
      return this.todos.filter((t) => t.done).length
    },
    priorityIndex() {
      return Math.max(0, PRIORITY_KEYS.indexOf(this.form.priority))
    },
    categoryIndex() {
      return Math.max(0, CATEGORIES.indexOf(this.form.category || '其他'))
    },
    repeatIndex() {
      return Math.max(0, REPEAT_KEYS.indexOf(this.form.repeatRule || 'none'))
    },
    priorityLabel() {
      return PRIORITY_LABELS[Math.max(0, PRIORITY_KEYS.indexOf(this.form.priority))]
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
    repeatLabel(rule) {
      const i = REPEAT_KEYS.indexOf(rule)
      return i >= 0 ? REPEAT_LABELS[i] : '不重复'
    },
    async load() {
      try {
        this.todos = (await todoList()) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openCreate() {
      this.form = { id: null, title: '', detail: '', dueDate: '', dueTime: '', priority: 'mid', category: '其他', repeatRule: 'none' }
      this.overlay = true
    },
    openEdit(t) {
      this.form = {
        id: t.id,
        title: t.title,
        detail: t.detail || '',
        dueDate: t.dueAt ? t.dueAt.slice(0, 10) : '',
        dueTime: t.dueAt ? t.dueAt.slice(11, 16) : '',
        priority: t.priority || 'mid',
        category: t.category || '其他',
        repeatRule: t.repeatRule || 'none'
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
          dueAt: this.composeDue(),
          priority: this.form.priority,
          category: this.form.category,
          repeatRule: this.form.repeatRule
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
        confirmColor: '#C96F5E',
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
  border: 2rpx solid var(--mb-line);
  color: var(--mb-on-primary);
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
.todo-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
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
.prio-dot.low {
  background: $ink-light;
}
.todo-title {
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
  flex: 1;
  min-width: 0;
}
.repeat-mark {
  font-size: 22rpx;
  color: $ink-light;
  font-weight: 600;
  flex-shrink: 0;
}
.todo-meta {
  margin-top: 6rpx;
}
.cate-chip {
  display: inline-flex;
  font-size: 21rpx;
  color: var(--mb-primary);
  background: var(--mb-sage-card);
  border-radius: 999rpx;
  padding: 2rpx 16rpx;
  font-weight: 600;
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
  color: var(--mb-berry);
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
  color: var(--mb-primary);
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
  color: var(--mb-on-primary);
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx var(--mb-primary-soft);
  z-index: 900;
}
.overlay {
  position: fixed;
  inset: 0;
  background: var(--mb-overlay);
  /* 低于 uni-modal(999)，保证确认弹窗能盖在弹层上 */
  z-index: 998;
  display: flex;
  align-items: flex-end;
}
.popup {
  width: 100%;
  background: var(--mb-card-bg);
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
  color: var(--mb-ink-light);
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
