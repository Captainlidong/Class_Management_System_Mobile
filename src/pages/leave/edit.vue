<template>
  <view class="page">
    <view class="card">
      <template v-if="!editId">
        <text class="form-label">请假学生</text>
        <picker mode="selector" :range="studentNames" @change="onStudentChange">
          <view class="field-input picker-view">
            <text :class="{ placeholder: studentIndex < 0 }">
              {{ studentIndex >= 0 ? studentNames[studentIndex] : '点选请假学生' }}
            </text>
          </view>
        </picker>
      </template>
      <template v-else>
        <view class="edit-banner">正在编辑 {{ form.name }} 的请假记录</view>
      </template>

      <text class="form-label">请假类型</text>
      <view class="type-row">
        <text
          v-for="t in typeOptions"
          :key="t.value"
          class="chip"
          :class="{ active: form.leaveType === t.value }"
          @tap="form.leaveType = t.value"
        >{{ t.label }}</text>
      </view>

      <text class="form-label">开始时间</text>
      <view class="dt-row">
        <picker mode="date" :value="form.startDate" @change="(e) => (form.startDate = e.detail.value)">
          <view class="field-input dt-input">
            <text :class="{ placeholder: !form.startDate }">{{ form.startDate || '日期' }}</text>
          </view>
        </picker>
        <picker mode="time" :value="form.startTime" @change="(e) => (form.startTime = e.detail.value)">
          <view class="field-input dt-input">
            <text :class="{ placeholder: !form.startTime }">{{ form.startTime || '时间' }}</text>
          </view>
        </picker>
      </view>

      <text class="form-label">结束时间</text>
      <view class="dt-row">
        <picker mode="date" :value="form.endDate" @change="(e) => (form.endDate = e.detail.value)">
          <view class="field-input dt-input">
            <text :class="{ placeholder: !form.endDate }">{{ form.endDate || '日期' }}</text>
          </view>
        </picker>
        <picker mode="time" :value="form.endTime" @change="(e) => (form.endTime = e.detail.value)">
          <view class="field-input dt-input">
            <text :class="{ placeholder: !form.endTime }">{{ form.endTime || '时间' }}</text>
          </view>
        </picker>
      </view>

      <text class="form-label">请假原因</text>
      <textarea v-model="form.reason" class="field-input reason-area" maxlength="500" placeholder="如：家中有事 / 身体不适" />

      <text class="form-label">批假人（可选）</text>
      <input v-model="form.approver" class="field-input" placeholder="如：辅导员" />

      <text class="form-label">备注（可选）</text>
      <input v-model="form.remark" class="field-input" placeholder="补充说明" />
    </view>

    <button class="btn btn-primary submit-btn" :disabled="submitting" @tap="submit">
      {{ submitting ? '保存中…' : editId ? '保存修改' : '登记请假' }}
    </button>
  </view>
</template>

<script>
import { studentsList, leaveList, leaveCreate, leaveUpdate } from '../../api'

const TYPE_OPTIONS = [
  { value: 'sick', label: '病假' },
  { value: 'personal', label: '事假' },
  { value: 'official', label: '公假' },
  { value: 'other', label: '其他' }
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function nowDate() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default {
  data() {
    return {
      editId: null,
      typeOptions: TYPE_OPTIONS,
      students: [],
      studentIndex: -1,
      form: {
        name: '',
        leaveType: 'personal',
        startDate: nowDate(),
        startTime: nowTime(),
        endDate: nowDate(),
        endTime: '18:00',
        reason: '',
        approver: '',
        remark: ''
      },
      submitting: false
    }
  },
  computed: {
    studentNames() {
      return this.students.map((s) => `${s.name}（${s.studentNo || '无学号'}）`)
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.editId = Number(query.id)
    }
    this.init()
  },
  methods: {
    async init() {
      try {
        const data = await studentsList()
        this.students = (data && data.students) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
      if (this.editId) {
        try {
          const rows = (await leaveList(null)) || []
          const r = rows.find((x) => x.id === this.editId)
          if (r) {
            this.form.name = r.name
            this.form.leaveType = r.leaveType || 'personal'
            this.form.startDate = (r.startTime || '').slice(0, 10)
            this.form.startTime = (r.startTime || '').slice(11, 16)
            this.form.endDate = (r.endTime || '').slice(0, 10)
            this.form.endTime = (r.endTime || '').slice(11, 16)
            this.form.reason = r.reason || ''
            this.form.approver = r.approver || ''
            this.form.remark = r.remark || ''
          }
        } catch (e) {
          /* 拦截器已提示 */
        }
      }
    },
    onStudentChange(e) {
      this.studentIndex = Number(e.detail.value)
    },
    compose(field) {
      const d = this.form[field === 'start' ? 'startDate' : 'endDate']
      const t = this.form[field === 'start' ? 'startTime' : 'endTime']
      if (!d || !t) return null
      return `${d}T${t}`
    },
    async submit() {
      if (this.submitting) return
      const start = this.compose('start')
      const end = this.compose('end')
      if (!start || !end) {
        uni.showToast({ title: '请选择开始与结束时间', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        if (this.editId) {
          await leaveUpdate(this.editId, {
            leaveType: this.form.leaveType,
            startTime: start,
            endTime: end,
            reason: this.form.reason,
            approver: this.form.approver,
            remark: this.form.remark
          })
          uni.showToast({ title: '已更新', icon: 'none' })
        } else {
          if (this.studentIndex < 0) {
            uni.showToast({ title: '请选择请假学生', icon: 'none' })
            this.submitting = false
            return
          }
          const s = this.students[this.studentIndex]
          await leaveCreate({
            studentIds: [s.id],
            leaveType: this.form.leaveType,
            startTime: start,
            endTime: end,
            reason: this.form.reason,
            approver: this.form.approver,
            remark: this.form.remark
          })
          uni.showToast({ title: `已为 ${s.name} 登记请假`, icon: 'none' })
        }
        setTimeout(() => uni.navigateBack(), 700)
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
.type-row {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
}
.dt-row {
  display: flex;
  gap: 16rpx;
}
.dt-row > picker {
  flex: 1;
}
.dt-input {
  text-align: center;
}
.reason-area {
  height: 140rpx;
  width: auto;
}
.edit-banner {
  background: rgba(62, 92, 75, 0.1);
  border-radius: 18rpx;
  padding: 18rpx 22rpx;
  font-size: 26rpx;
  color: #3E5C4B;
  font-weight: 600;
  margin-top: 6rpx;
}
.submit-btn {
  margin: 10rpx 24rpx 0;
  width: auto;
}
.placeholder {
  color: #B0B4AC;
}
</style>
