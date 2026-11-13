<template>
  <view class="page">
    <!-- 头部：任务信息 + 统计 -->
    <view class="card head-card" v-if="task">
      <view class="task-head">
        <text class="task-kind-tag" :class="kt.kind === 'distribute' ? 'tag-distribute' : 'tag-collect'">
          {{ task.kind === 'distribute' ? '分发' : '收集' }}
        </text>
        <text class="task-name">{{ task.name }}</text>
      </view>
      <text v-if="task.deadline" class="task-deadline" :class="{ passed: isPassed(task.deadline) }">
        截止 {{ fmtDateTime(task.deadline) }}{{ isPassed(task.deadline) ? '（已过期）' : '' }}
      </text>
      <view class="stat-row">
        <view class="stat-cell" style="background: rgba(220, 232, 220, 0.6)">
          <text class="stat-num">{{ entries.length }}</text>
          <text class="stat-label">{{ kt.statTotal }}</text>
        </view>
        <view class="stat-cell" style="background: rgba(220, 232, 220, 0.65)">
          <text class="stat-num">{{ receivedCount }}</text>
          <text class="stat-label">{{ kt.done }}</text>
        </view>
        <view class="stat-cell" style="background: rgba(217, 164, 65, 0.16)">
          <text class="stat-num">{{ entries.length - receivedCount }}</text>
          <text class="stat-label">{{ kt.undone }}</text>
        </view>
        <view class="ring-wrap">
          <ProgressRing :size="140" :pct="progress" color="#3E5C4B">
            <text class="ring-pct">{{ progress }}%</text>
            <text class="ring-sub">{{ kt.done }} {{ receivedCount }}/{{ entries.length }}</text>
          </ProgressRing>
        </view>
      </view>
    </view>

    <!-- 筛选与一键操作 -->
    <view class="filter-row" v-if="task">
      <view class="filter-switch" @tap="onlyUndone = !onlyUndone">
        <text class="switch-label">{{ kt.onlyToggle }}</text>
        <view class="mini-switch" :class="{ on: onlyUndone }"><view class="knob"></view></view>
      </view>
      <view class="filter-switch" @tap="onMarkAllTap">
        <text class="switch-label">{{ kt.markAllToggle }}</text>
        <view class="mini-switch" :class="{ on: allDone }"><view class="knob"></view></view>
      </view>
    </view>
    <view class="search-row" v-if="task">
      <input v-model="keyword" class="field-input search-input" placeholder="搜索姓名 / 学号" />
      <text class="search-count">{{ filteredEntries.length }} / {{ entries.length }}</text>
    </view>

    <!-- 名单 -->
    <view v-if="filteredEntries.length" class="card member-card">
      <view
        v-for="(e, idx) in filteredEntries"
        :key="e.id"
        class="member-row"
        :class="{ last: idx === filteredEntries.length - 1 }"
      >
        <view class="member-left" @tap="toggleRow(e)">
          <text class="member-name">{{ e.name }}</text>
          <text class="member-no">{{ e.studentNo || '无学号' }}</text>
        </view>
        <view class="member-right">
          <view class="remark-wrap">
            <input
              v-model="e.remark"
              class="field-input remark-input"
              :placeholder="task.kind === 'distribute' ? '如：1份未盖章' : '如：少交1份'"
              @blur="saveRemark(e)"
            />
          </view>
          <view class="pill" :class="e.submitted ? 'pill-done' : 'pill-undone'" @tap="toggleRow(e)">
            {{ e.submitted ? kt.done : kt.undone }}
          </view>
          <text class="member-remove" @tap.stop="removeSingle(e)">移除</text>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState :text="entries.length ? '没有符合筛选的同学' : '任务名单为空'" />
    </view>

    <view style="height: 150rpx"></view>

    <!-- 底部操作栏 -->
    <view class="action-bar" v-if="task">
      <view class="action-btn primary" @tap="copyUndone"><AppIcon name="clipboard" :size="18" style="margin-right: 8rpx" />{{ kt.copyBtn }}</view>
      <view class="action-btn ghost" @tap="overlay = 'remove'"><AppIcon name="trash" :size="18" style="margin-right: 8rpx" />批量移除</view>
      <view class="action-btn ghost" @tap="showMore"><AppIcon name="grid" :size="18" style="margin-right: 8rpx" />更多</view>
    </view>

    <!-- 遮罩弹层：批量移除 -->
    <view class="overlay" v-if="overlay === 'remove'" @tap="overlay = ''">
      <view class="popup" @tap.stop>
        <view class="popup-title">批量移除人员</view>
        <view class="popup-tools">
          <text class="popup-tool-link" @tap="selectUndone">{{ kt.selectAllUndone }}</text>
          <text class="popup-tool-link" @tap="removeIds = []">清空</text>
          <text class="popup-count">已选 {{ removeIds.length }} / {{ entries.length }} 人</text>
        </view>
        <scroll-view scroll-y class="popup-list">
          <view
            v-for="e in entries"
            :key="e.id"
            class="popup-row"
            @tap="toggleRemoveId(e.studentId)"
          >
            <view class="check-circle" :class="{ on: removeIds.includes(e.studentId) }">✓</view>
            <text class="popup-row-name">{{ e.name }}（{{ e.studentNo || '无学号' }}）</text>
            <text class="popup-row-state" :class="e.submitted ? 'st-done' : 'st-undone'">
              {{ e.submitted ? kt.done : kt.undone }}
            </text>
          </view>
        </scroll-view>
        <button class="btn btn-primary popup-btn" :disabled="!removeIds.length" @tap="saveBatchRemove">移除所选</button>
      </view>
    </view>

    <!-- 遮罩弹层：添加人员 -->
    <view class="overlay" v-if="overlay === 'add'" @tap="overlay = ''">
      <view class="popup" @tap.stop>
        <view class="popup-title">添加人员</view>
        <text class="popup-hint">只显示还没在该任务名单里的同学（{{ availableStudents.length }} 人），新人员默认{{ kt.undone }}。</text>
        <scroll-view scroll-y class="popup-list">
          <view
            v-for="s in availableStudents"
            :key="s.id"
            class="popup-row"
            @tap="toggleAddId(s.id)"
          >
            <view class="check-circle" :class="{ on: addIds.includes(s.id) }">✓</view>
            <text class="popup-row-name">{{ s.name }}（{{ s.studentNo || '无学号' }}）</text>
          </view>
          <view v-if="!availableStudents.length" class="empty">全班都在名单里啦</view>
        </scroll-view>
        <button class="btn btn-primary popup-btn" :disabled="!addIds.length" @tap="saveAddPersons">添加所选</button>
      </view>
    </view>
  </view>
</template>

<script>
import ProgressRing from '../../components/ProgressRing.vue'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import { collectionTask, collectionUpdateEntry, collectionMarkAll, collectionBatchRemove, collectionRemoveStudent, collectionAddStudents, collectionDelete, studentsList } from '../../api'
import { downloadByUrl } from '../../api/request'
import { kindText, fmtDateTime, isPassed } from '../../utils/format'

export default {
  components: { ProgressRing, EmptyState, AppIcon },
  data() {
    return {
      taskId: null,
      task: null,
      entries: [],
      onlyUndone: false,
      keyword: '',
      overlay: '',           // '' | 'remove' | 'add'
      removeIds: [],
      addIds: [],
      allStudents: []
    }
  },
  computed: {
    kt() {
      return kindText(this.task ? this.task.kind : 'collect')
    },
    receivedCount() {
      return this.entries.filter((e) => e.submitted).length
    },
    allDone() {
      return this.entries.length > 0 && this.receivedCount === this.entries.length
    },
    progress() {
      if (!this.entries.length) return 0
      return Math.round((this.receivedCount / this.entries.length) * 100)
    },
    filteredEntries() {
      let list = this.entries
      if (this.onlyUndone) list = list.filter((e) => !e.submitted)
      const k = this.keyword.trim().toLowerCase()
      if (k) {
        list = list.filter(
          (e) =>
            (e.name || '').toLowerCase().includes(k) ||
            (e.studentNo || '').toLowerCase().includes(k)
        )
      }
      return list
    },
    availableStudents() {
      const used = new Set(this.entries.map((e) => e.studentId))
      return (this.allStudents || []).filter((s) => !used.has(s.id))
    }
  },
  onLoad(query) {
    this.taskId = Number(query.id)
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    fmtDateTime,
    isPassed,
    async load() {
      try {
        const data = await collectionTask(this.taskId)
        this.task = { ...data }
        delete this.task.entries
        this.entries = (data.entries || []).map((e) => ({ ...e, _savedRemark: e.remark || '' }))
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async toggleRow(e) {
      const target = !e.submitted
      try {
        const data = await collectionUpdateEntry(e.id, { submitted: target })
        e.submitted = data.submitted
        e.submittedAt = data.submittedAt
        uni.showToast({
          title: target ? `${e.name} ${this.kt.done} ✓` : `已标记 ${e.name} ${this.kt.undone}`,
          icon: 'none'
        })
      } catch (err) {
        /* 拦截器已提示 */
      }
    },
    async saveRemark(e) {
      if ((e.remark || '') === e._savedRemark) return
      try {
        const data = await collectionUpdateEntry(e.id, { remark: e.remark })
        e.remark = data.remark || ''
        e._savedRemark = e.remark
        uni.showToast({ title: '备注已保存', icon: 'none', duration: 1000 })
      } catch (err) {
        e.remark = e._savedRemark || ''
      }
    },
    onMarkAllTap() {
      const target = !this.allDone
      const done = this.kt.done
      const undone = this.kt.undone
      const text = target
        ? `将把全部 ${this.entries.length} 人标记为${done}，确认？`
        : `将清空全部${done}标记（${this.receivedCount} 人回${undone}），确认？`
      uni.showModal({
        title: '一键标记',
        content: text,
        confirmText: '确定',
        success: async (res) => {
          if (!res.confirm) return
          try {
            const data = await collectionMarkAll(this.taskId, target)
            uni.showToast({
              title: target ? `已全部标记${done}（共 ${data.total} 人）` : `已清空标记（${data.changed} 人回${undone}）`,
              icon: 'none'
            })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    copyUndone() {
      const names = this.entries.filter((e) => !e.submitted).map((e) => e.name)
      if (!names.length) {
        uni.showToast({ title: this.kt.copyDone, icon: 'none' })
        return
      }
      const text = this.kt.copyTemplate(names.join('、'), this.task.name)
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: `已复制 ${names.length} 位${this.kt.undone}同学名单`, icon: 'none' })
      })
    },
    exportTask(scope) {
      downloadByUrl(
        `/collections/tasks/${this.taskId}/export?format=xlsx&scope=${scope}&columns=no,name,studentNo,status,time,remark&summary=false`
      )
    },
    removeSingle(e) {
      uni.showModal({
        title: '移除人员',
        content: `从任务名单移除 ${e.name}？其记录会一并删除。`,
        confirmText: '移除',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await collectionRemoveStudent(this.taskId, e.studentId)
            uni.showToast({ title: '已移除', icon: 'none' })
            this.load()
          } catch (err) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    showMore() {
      const kt = this.kt
      uni.showActionSheet({
        itemList: ['添加人员', '导出全部', `导出${kt.undone}`, '删除任务'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.openAdd()
          } else if (res.tapIndex === 1) {
            this.exportTask('all')
          } else if (res.tapIndex === 2) {
            this.exportTask('undelivered')
          } else if (res.tapIndex === 3) {
            this.deleteTask()
          }
        }
      })
    },
    deleteTask() {
      uni.showModal({
        title: '删除任务',
        content: `删除任务「${this.task.name}」？名单和标记记录会一起删除，不可恢复。`,
        confirmColor: '#C96F5E',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await collectionDelete(this.taskId)
            uni.showToast({ title: '已删除', icon: 'none' })
            setTimeout(() => uni.redirectTo({ url: '/pages/collection/list' }), 600)
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    async openAdd() {
      this.addIds = []
      try {
        this.allStudents = (await studentsList()).students || []
      } catch (e) {
        return
      }
      this.overlay = 'add'
    },
    toggleRemoveId(id) {
      const i = this.removeIds.indexOf(id)
      if (i >= 0) this.removeIds.splice(i, 1)
      else this.removeIds.push(id)
    },
    toggleAddId(id) {
      const i = this.addIds.indexOf(id)
      if (i >= 0) this.addIds.splice(i, 1)
      else this.addIds.push(id)
    },
    selectUndone() {
      this.removeIds = this.entries.filter((e) => !e.submitted).map((e) => e.studentId)
      if (!this.removeIds.length) {
        uni.showToast({ title: this.kt.copyDone, icon: 'none' })
      }
    },
    async saveBatchRemove() {
      const names = this.entries
        .filter((e) => this.removeIds.includes(e.studentId))
        .map((e) => e.name)
      uni.showModal({
        title: '批量移除',
        content: `将从任务中移除 ${names.length} 人：${names.slice(0, 6).join('、')}${names.length > 6 ? ' 等' : ''}？记录会一并删除，不可恢复。`,
        confirmColor: '#C96F5E',
        success: async (res) => {
          if (!res.confirm) return
          try {
            const data = await collectionBatchRemove(this.taskId, this.removeIds)
            this.overlay = ''
            uni.showToast({
              title: `已移除 ${data.removed} 人${data.skipped ? `，跳过 ${data.skipped} 人` : ''}`,
              icon: 'none'
            })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    async saveAddPersons() {
      try {
        const data = await collectionAddStudents(this.taskId, this.addIds)
        this.overlay = ''
        uni.showToast({
          title: `已添加 ${data.added} 人${data.skipped ? `，跳过 ${data.skipped} 人` : ''}`,
          icon: 'none'
        })
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 16rpx;
}
.head-card {
  padding-bottom: 34rpx;
}
.task-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 8rpx;
}
.task-kind-tag {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: #fff;
}
.tag-collect {
  background: $matcha;
}
.tag-distribute {
  background: $peach;
}
.task-name {
  font-size: 34rpx;
  font-weight: 800;
  color: $ink;
}
.task-deadline {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-bottom: 20rpx;
}
.task-deadline.passed {
  color: #C96F5E;
  font-weight: 600;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.stat-cell {
  flex: 1;
  border-radius: 24rpx;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 38rpx;
  font-weight: 800;
  color: $ink;
}
.stat-label {
  font-size: 22rpx;
  color: $ink-light;
}
.ring-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4rpx;
}
.ring-pct {
  font-size: 30rpx;
  font-weight: 800;
  color: #3E5C4B;
}
.ring-sub {
  font-size: 20rpx;
  color: $ink-light;
}

.filter-row {
  display: flex;
  gap: 16rpx;
  padding: 0 24rpx 16rpx;
}
.filter-switch {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 18rpx rgba(122, 96, 76, 0.06);
}
.switch-label {
  font-size: 25rpx;
  color: $ink;
  font-weight: 500;
  margin-right: 10rpx;
}
.mini-switch {
  width: 76rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: #E8E2D4;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.mini-switch.on {
  background: $primary;
}
.mini-switch .knob {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  transition: left 0.2s ease;
}
.mini-switch.on .knob {
  left: calc(100% - 38rpx);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx 16rpx;
}
.search-input {
  flex: 1;
}
.search-count {
  font-size: 24rpx;
  color: $ink-light;
  flex-shrink: 0;
}

.member-card {
  padding: 8rpx 26rpx;
}
.member-row {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $line;
  gap: 12rpx;
}
.member-row.last {
  border-bottom: none;
}
.member-left {
  width: 150rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.member-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
}
.member-no {
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 4rpx;
}
.member-right {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}
.remark-wrap {
  flex: 1;
  min-width: 0;
}
.remark-input {
  padding: 12rpx 18rpx;
  font-size: 24rpx;
  border-radius: 16rpx;
}
.member-remove {
  flex-shrink: 0;
  font-size: 24rpx;
  color: $berry;
  font-weight: 600;
}

.action-bar {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 14rpx;
  z-index: 900;
}
.action-btn {
  border-radius: 28rpx;
  padding: 22rpx 0;
  text-align: center;
  font-size: 27rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 30rpx rgba(122, 96, 76, 0.16);
}
.action-btn.primary {
  flex: 1.4;
  background: $primary;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action-btn.ghost {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  color: #3E5C4B;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 45, 35, 0.42);
  /* 低于 uni-modal(999)/uni-toast，保证二次确认弹窗能盖在弹层之上 */
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
.popup-hint {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-bottom: 16rpx;
}
.popup-tools {
  display: flex;
  align-items: center;
  gap: 26rpx;
  margin-bottom: 14rpx;
}
.popup-tool-link {
  font-size: 25rpx;
  color: #3E5C4B;
  font-weight: 600;
}
.popup-count {
  font-size: 23rpx;
  color: $ink-light;
  margin-left: auto;
}
.popup-list {
  max-height: 46vh;
  border-top: 1rpx solid $line;
}
.popup-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 4rpx;
  border-bottom: 1rpx solid $line;
}
.popup-row-name {
  flex: 1;
  font-size: 27rpx;
  color: $ink;
  font-weight: 500;
}
.popup-row-state {
  font-size: 23rpx;
}
.st-done {
  color: #4e9b52;
}
.st-undone {
  color: #A2681F;
}
.check-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #E8E2D4;
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
.popup-btn {
  margin-top: 22rpx;
}
</style>
