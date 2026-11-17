<template>
  <view class="page">
    <view v-if="rows.length">
      <view
        v-for="(a, idx) in rows"
        :key="a.id"
        class="card ann-card"
        :class="{ last: idx === rows.length - 1 }"
      >
        <view class="ann-head" @tap="toggle(a)">
          <text class="ann-title">{{ a.title }}</text>
          <view class="ann-tags">
            <text v-if="a.pinned" class="ann-tag pinned">置顶</text>
            <text class="ann-tag" :class="a.status === 'sent' ? 'sent' : 'unsent'">
              {{ a.status === 'sent' ? '已发送' : '草稿' }}
            </text>
            <text class="ann-arrow">{{ expandedId === a.id ? '▾' : '▸' }}</text>
          </view>
        </view>
        <text class="ann-cat">
          {{ a.category ? `分类：${categoryLabel(a.category)}` : '' }}
          {{ a.attachmentCount ? ` · 附件 ${a.attachmentCount}` : '' }}
        </text>

        <view v-if="expandedId === a.id" class="ann-body">
          <text v-if="a.editedText" class="ann-content">{{ a.editedText }}</text>
          <text v-else-if="a.originalText" class="ann-content">{{ a.originalText }}</text>
          <view v-if="a.files && a.files.length" class="ann-files">
            <text class="ann-files-title">📎 附件 {{ a.files.length }} 个</text>
            <view
              v-for="f in a.files"
              :key="f.id"
              class="ann-file-row"
              @tap="downloadFile(a.id, f)"
            >
              <text class="ann-file-name">{{ f.fileName }}</text>
              <text class="ann-file-down">下载</text>
            </view>
          </view>
          <text v-if="a.versions && a.versions.length" class="ann-versions">
            已存 {{ a.versions.length }} 个历史版本（查看/恢复请用桌面版）
          </text>
          <view class="ann-actions">
            <text class="ann-action" @tap.stop="openEdit(a)">编辑</text>
            <text class="ann-action" @tap.stop="copyDraft(a)">复制文案</text>
            <text class="ann-action" @tap.stop="togglePin(a)">{{ a.pinned ? '取消置顶' : '置顶' }}</text>
            <text class="ann-action" @tap.stop="uploadFile(a)">拍照/选图</text>
            <text class="ann-action" @tap.stop="markSent(a)">{{ a.status === 'sent' ? '取消发送标记' : '标记已发送' }}</text>
            <text class="ann-action danger" @tap.stop="removeAnn(a)">删除</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState text="还没有群发素材，点右下角新建" />
    </view>

    <view class="fab" @tap="openCreate"><AppIcon name="plus" :size="30" /></view>

    <!-- 新建 / 编辑 弹层 -->
    <view class="overlay" v-if="formOpen" @tap="formOpen = false">
      <view class="popup" @tap.stop>
        <view class="popup-title">{{ form.id ? '编辑文案' : '新建素材' }}</view>
        <text class="popup-label">标题 *</text>
        <input v-model="form.title" class="field-input popup-input" maxlength="128" placeholder="如：班会通知" />
        <text class="popup-label">类型</text>
        <view class="chips">
          <view
            v-for="c in categories"
            :key="c.value"
            class="chip"
            :class="{ on: form.category === c.value }"
            @tap="form.category = c.value"
          >
            <text>{{ c.label }}</text>
          </view>
        </view>
        <text class="popup-label">来源（可选）</text>
        <input v-model="form.source" class="field-input popup-input" maxlength="64" placeholder="如：辅导员群、年级通知" />
        <text class="popup-label">辅导员原件（可选）</text>
        <textarea
          v-model="form.originalText"
          class="field-input popup-textarea"
          maxlength="2000"
          placeholder="老师发的原话，存档备用"
        />
        <text class="popup-label">我改好的版本（可选）</text>
        <textarea
          v-model="form.editedText"
          class="field-input popup-textarea"
          maxlength="2000"
          placeholder="整理后要发到班群的版本"
        />
        <text class="popup-hint">
          两版分开存：原件留档，改稿发出；编辑改稿会自动保留历史版本。
        </text>
        <text class="popup-label">图片附件（可选）</text>
        <view class="pick-row" v-if="pickedFiles.length">
          <view v-for="(p, i) in pickedFiles" :key="p" class="pick-chip" @tap="pickedFiles.splice(i, 1)">
            <text class="pick-name">图 {{ i + 1 }}</text>
            <text class="pick-del">×</text>
          </view>
          <view class="pick-chip add" @tap="pickImages"><text class="pick-name">继续添加</text></view>
        </view>
        <view class="pick-row" v-else>
          <view class="pick-chip add" @tap="pickImages"><text class="pick-name">＋ 选图 / 拍照</text></view>
        </view>
        <button class="btn btn-primary popup-btn" :disabled="submitting" @tap="saveAnn">
          {{ submitting ? '保存中…' : (form.id ? '保存修改' : '创建素材') }}
        </button>
      </view>
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
import AppIcon from '../../components/AppIcon.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import confirmDialog from '../../mixins/confirmDialog'
import {
  announcementList,
  announcementDetail,
  announcementCreate,
  announcementUpdate,
  announcementSetPinned,
  announcementUploadFiles,
  announcementMarkSent,
  announcementUnmarkSent,
  announcementDelete
} from '../../api'
import { downloadByUrl } from '../../api/request'

const CATEGORIES = [
  { value: 'notice', label: '通知转发' },
  { value: 'file', label: '文件转发' },
  { value: 'copy', label: '文案话段' },
  { value: 'other', label: '其他' }
]

export default {
  components: { EmptyState, AppIcon, ConfirmDialog },
  mixins: [confirmDialog],
  data() {
    return {
      rows: [],
      expandedId: null,
      categories: CATEGORIES,
      formOpen: false,
      submitting: false,
      pickedFiles: [],
      form: { id: null, title: '', category: 'notice', source: '', originalText: '', editedText: '' }
    }
  },
  onShow() {
    this.load()
  },
  onPullDownRefresh() {
    this.load().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    categoryLabel(v) {
      const hit = CATEGORIES.find((c) => c.value === v)
      return hit ? hit.label : v
    },
    async load() {
      try {
        this.rows = (await announcementList(null)) || []
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async toggle(a) {
      if (this.expandedId === a.id) {
        this.expandedId = null
        return
      }
      try {
        const data = await announcementDetail(a.id)
        const i = this.rows.findIndex((x) => x.id === a.id)
        if (i >= 0) this.rows[i] = { ...this.rows[i], ...data }
        this.expandedId = a.id
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    openCreate() {
      this.form = { id: null, title: '', category: 'notice', source: '', originalText: '', editedText: '' }
      this.pickedFiles = []
      this.formOpen = true
    },
    async openEdit(a) {
      try {
        const d = await announcementDetail(a.id)
        const i = this.rows.findIndex((x) => x.id === a.id)
        if (i >= 0) this.rows[i] = { ...this.rows[i], ...d }
        this.form = {
          id: a.id,
          title: d.title || '',
          category: d.category || 'notice',
          source: d.source || '',
          originalText: d.originalText || '',
          editedText: d.editedText || ''
        }
        this.pickedFiles = []
        this.formOpen = true
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    pickImages() {
      uni.chooseImage({
        count: 9,
        success: (res) => {
          const paths = res.tempFilePaths || []
          for (const p of paths) {
            if (!this.pickedFiles.includes(p)) this.pickedFiles.push(p)
          }
        }
      })
    },
    async saveAnn() {
      if (!this.form.title.trim()) {
        uni.showToast({ title: '标题不能为空', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const body = {
          title: this.form.title.trim(),
          category: this.form.category,
          source: this.form.source.trim() || null,
          originalText: this.form.originalText.trim() || null,
          editedText: this.form.editedText.trim() || null
        }
        const saved = this.form.id
          ? await announcementUpdate(this.form.id, body)
          : await announcementCreate(body)
        if (this.pickedFiles.length) {
          for (const p of this.pickedFiles) {
            await announcementUploadFiles(saved.id, p)
          }
        }
        uni.showToast({ title: this.form.id ? '已保存（改稿变动自动存版本）' : '素材已创建', icon: 'none' })
        this.formOpen = false
        this.expandedId = null
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      } finally {
        this.submitting = false
      }
    },
    copyDraft(a) {
      const text = a.editedText || a.originalText
      if (!text) {
        uni.showToast({ title: '这条还没有文案', icon: 'none' })
        return
      }
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: a.editedText ? '已复制改好的版本' : '已复制原件', icon: 'none' }),
        fail: () => uni.showToast({ title: '复制失败，请手动选择文本', icon: 'none' })
      })
    },
    async togglePin(a) {
      try {
        await announcementSetPinned(a.id, !a.pinned)
        uni.showToast({ title: a.pinned ? '已取消置顶' : '已置顶', icon: 'none' })
        this.load()
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    downloadFile(annId, f) {
      downloadByUrl(`/announcements/${annId}/files/${f.id}`)
    },
    uploadFile(a) {
      uni.chooseImage({
        count: 3,
        success: async (res) => {
          const paths = res.tempFilePaths || []
          try {
            for (const p of paths) {
              await announcementUploadFiles(a.id, p)
            }
            uni.showToast({ title: `已上传 ${paths.length} 个附件`, icon: 'none' })
            this.load()
          } catch (e) {
            /* 拦截器已提示 */
          }
        }
      })
    },
    markSent(a) {
      const call = a.status === 'sent' ? announcementUnmarkSent(a.id) : announcementMarkSent(a.id)
      call
        .then(() => {
          uni.showToast({ title: a.status === 'sent' ? '已取消发送标记' : '已标记已发送', icon: 'none' })
          this.load()
        })
        .catch(() => {})
    },
    removeAnn(a) {
      this.confirm(
        { title: '删除素材', content: `删除「${a.title}」？附件与历史版本会一并删除。`, confirmText: '删除', danger: true },
        async () => {
          try {
            await announcementDelete(a.id)
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
.ann-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}
.ann-title {
  flex: 1;
  font-size: 29rpx;
  font-weight: 700;
  color: $ink;
}
.ann-tags {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}
.ann-tag {
  font-size: 21rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  color: var(--mb-warn-text);
  background: var(--mb-warn-soft);
}
.ann-tag.pinned {
  color: var(--mb-ink-light);
  background: var(--mb-sage-tint);
}
.ann-tag.sent {
  color: var(--mb-ok);
  background: var(--mb-sage-tint);
}
.ann-arrow {
  font-size: 26rpx;
  color: $ink-light;
}
.ann-cat {
  display: block;
  font-size: 23rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.ann-body {
  margin-top: 18rpx;
  border-top: 1rpx solid $line;
  padding-top: 18rpx;
}
.ann-content {
  display: block;
  font-size: 26rpx;
  color: $ink;
  line-height: 1.6;
  white-space: pre-wrap;
}
.ann-files {
  margin-top: 16rpx;
}
.ann-files-title {
  display: block;
  font-size: 24rpx;
  color: $ink-light;
  margin-bottom: 8rpx;
}
.ann-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--mb-cream-2);
  border-radius: 16rpx;
  padding: 14rpx 20rpx;
  margin-bottom: 10rpx;
}
.ann-file-name {
  font-size: 25rpx;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.ann-file-down {
  font-size: 24rpx;
  color: var(--mb-primary);
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 14rpx;
}
.ann-versions {
  display: block;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 12rpx;
}
.ann-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx 30rpx;
  margin-top: 18rpx;
}
.ann-action {
  font-size: 25rpx;
  color: var(--mb-primary);
  font-weight: 600;
}
.ann-action.danger {
  color: $berry;
}
.fab {
  position: fixed;
  right: 30rpx;
  bottom: calc(40rpx + env(safe-area-inset-bottom));
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: $primary;
  color: var(--mb-on-primary);
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
  max-height: 86vh;
  overflow-y: auto;
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
  height: 150rpx;
  width: auto;
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
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}
.chip {
  font-size: 24rpx;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: var(--mb-cream-2);
  color: $ink-light;
  border: 1rpx solid var(--mb-line-soft);
}
.chip.on {
  background: var(--mb-primary-soft);
  color: $primary;
  font-weight: 700;
  border-color: transparent;
}
.pick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}
.pick-chip {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  background: var(--mb-cream-2);
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
}
.pick-chip.add {
  border: 1rpx dashed var(--mb-line);
  background: transparent;
}
.pick-name {
  font-size: 24rpx;
  color: $ink;
}
.pick-del {
  font-size: 26rpx;
  color: $berry;
}
</style>
