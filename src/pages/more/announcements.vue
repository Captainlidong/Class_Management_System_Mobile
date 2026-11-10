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
          {{ a.category ? `分类：${a.category}` : '' }}
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
          <view class="ann-actions">
            <text class="ann-action" @tap.stop="uploadFile(a)">📷 拍照/选图上传</text>
            <text class="ann-action" @tap.stop="markSent(a)">{{ a.status === 'sent' ? '取消发送标记' : '标记已发送' }}</text>
            <text class="ann-action danger" @tap.stop="removeAnn(a)">删除</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="card">
      <EmptyState icon="📣" text="还没有群发素材" />
    </view>
  </view>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import { announcementList, announcementDetail, announcementUploadFiles, announcementMarkSent, announcementUnmarkSent, announcementDelete } from '../../api'
// announcementDeleteFile 暂未在移动端暴露（删除附件走桌面版更稳妥）
import { downloadByUrl } from '../../api/request'

export default {
  components: { EmptyState },
  data() {
    return {
      rows: [],
      expandedId: null
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
      uni.showModal({
        title: '删除素材',
        content: `删除「${a.title}」？附件与历史版本会一并删除。`,
        confirmColor: '#e06c75',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await announcementDelete(a.id)
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
  color: #b07d1e;
  background: rgba(255, 217, 142, 0.3);
}
.ann-tag.pinned {
  color: #8d7bc0;
  background: rgba(201, 182, 228, 0.24);
}
.ann-tag.sent {
  color: #4e9b52;
  background: rgba(163, 217, 165, 0.22);
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
  background: #faf5ee;
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
  color: #4d8ecf;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 14rpx;
}
.ann-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 18rpx;
}
.ann-action {
  font-size: 25rpx;
  color: #4d8ecf;
  font-weight: 600;
}
.ann-action.danger {
  color: $berry;
}
</style>
