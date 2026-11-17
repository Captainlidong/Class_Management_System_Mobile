<template>
  <view class="page">
    <view v-if="rows.length">
      <view
        v-for="(r, idx) in rows"
        :key="r.id"
        class="card record-card"
        :class="{ last: idx === rows.length - 1 }"
      >
        <view class="record-head" @tap="toggle(r)">
          <view class="record-head-left">
            <text class="record-title">{{ r.title }}</text>
            <text class="record-meta">
              🕒 {{ fmtDateTime(r.checkedAt) }}
              · ✔ {{ r.participatedCount }} / ✖ {{ r.absentCount }}
              <template v-if="r.baselineCount"> · 基准 {{ r.baselineCount }} 人</template>
            </text>
          </view>
          <text class="ann-arrow">{{ expandedId === r.id ? '▾' : '▸' }}</text>
        </view>

        <view v-if="expandedId === r.id" class="record-body">
          <view class="result-group" style="background: var(--mb-sage-tint)">
            <text class="result-title">✔ 已参与 {{ detail.participated.length }}</text>
            <view class="result-names">
              <text v-for="n in detail.participated" :key="'p' + n" class="result-name done">{{ n }}</text>
            </view>
          </view>
          <view class="result-group" style="background: var(--mb-warn-soft)">
            <text class="result-title">✖ 未参与 {{ detail.absent.length }}</text>
            <view class="result-names">
              <text v-for="n in detail.absent" :key="'a' + n" class="result-name undone">{{ n }}</text>
            </view>
          </view>
          <view class="record-actions">
            <text class="record-action danger" @tap.stop="remove(r)">删除记录</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="暂无筛查历史" />
    </view>

    <ConfirmDialog
      :visible="dlg.visible"
      :title="dlg.title"
      :content="dlg.content"
      :danger="dlg.danger"
      :confirm-text="dlg.confirmText"
      :cancel-text="dlg.cancelText"
      :show-cancel="dlg.showCancel"
      @confirm="onDlgConfirm"
      @close="onDlgClose"
    />
  </view>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import confirmDialog from '../../mixins/confirmDialog'
import { checkRecords, checkRecord, checkRecordDelete } from '../../api'
import { fmtDateTime } from '../../utils/format'

const EMPTY_DETAIL = { participated: [], absent: [], invalid: [], duplicates: [] }

export default {
  components: { EmptyState, ConfirmDialog },
  mixins: [confirmDialog],
  data() {
    return {
      rows: [],
      expandedId: null,
      detail: EMPTY_DETAIL
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
        this.rows = (await checkRecords(null)) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async toggle(r) {
      if (this.expandedId === r.id) {
        this.expandedId = null
        return
      }
      try {
        const data = await checkRecord(r.id)
        this.detail = {
          participated: data.participated || [],
          absent: data.absent || [],
          invalid: data.invalid || [],
          duplicates: data.duplicates || []
        }
        this.expandedId = r.id
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    remove(r) {
      this.confirm(
        { title: '删除记录', content: `删除「${r.title}」？不可恢复。`, confirmText: '删除', danger: true },
        async () => {
          try {
            await checkRecordDelete(r.id)
            uni.showToast({ title: '已删除', icon: 'none' })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
}
.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}
.record-head-left {
  flex: 1;
  min-width: 0;
}
.record-title {
  display: block;
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-meta {
  display: block;
  font-size: 23rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.ann-arrow {
  font-size: 26rpx;
  color: $ink-light;
  flex-shrink: 0;
}
.record-body {
  margin-top: 18rpx;
  border-top: 1rpx solid $line;
  padding-top: 18rpx;
}
.result-group {
  border-radius: 24rpx;
  padding: 22rpx;
  margin-bottom: 16rpx;
}
.result-title {
  display: block;
  font-size: 27rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 14rpx;
}
.result-names {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.result-name {
  font-size: 25rpx;
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  background: var(--mb-card-bg);
  color: $ink;
  font-weight: 500;
}
.result-name.done {
  color: var(--mb-ok);
}
.result-name.undone {
  color: var(--mb-warn-text);
}
.record-actions {
  display: flex;
  justify-content: flex-end;
}
.record-action {
  font-size: 25rpx;
  color: $berry;
  font-weight: 600;
}
</style>
