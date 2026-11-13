<template>
  <view class="page">
    <view class="card">
      <text class="form-label">粘贴名单</text>
      <textarea
        v-model="text"
        class="field-input paste-area"
        placeholder="一行一个，或用逗号/顿号/空格分隔&#10;例如：&#10;绳涵戈&#10;孟庆成、徐昊"
      />
      <text class="form-label">任务名称（可选）</text>
      <input v-model="title" class="field-input" placeholder="如：运动会签到" maxlength="60" />
      <view class="save-row" @tap="save = !save">
        <view class="check-circle" :class="{ on: save }">✓</view>
        <text class="save-label">保存为历史记录</text>
      </view>
      <button class="btn btn-primary run-btn" :disabled="running || !text.trim()" @tap="run">
        {{ running ? '筛查中…' : '一键筛查' }}
      </button>
    </view>

    <view v-if="result">
      <view class="card result-card">
        <view class="result-group" style="background: rgba(220, 232, 220, 0.65)">
          <text class="result-title">✔ 已参与 {{ result.participated.length }}</text>
          <view class="result-names">
            <text v-for="n in result.participated" :key="'p' + n" class="result-name done">{{ n }}</text>
          </view>
        </view>
        <view class="result-group" style="background: rgba(217, 164, 65, 0.16)">
          <text class="result-title">✖ 未参与 {{ result.absent.length }}</text>
          <view class="result-names">
            <text v-for="n in result.absent" :key="'a' + n" class="result-name undone">{{ n }}</text>
          </view>
        </view>
        <view v-if="result.invalid && result.invalid.length" class="result-group" style="background: rgba(201, 111, 94, 0.14)">
          <text class="result-title">⚠ 无效名单 {{ result.invalid.length }}</text>
          <view class="result-names">
            <text v-for="n in result.invalid" :key="'i' + n" class="result-name invalid">{{ n }}</text>
          </view>
        </view>
        <view v-if="result.duplicates && result.duplicates.length" class="result-group" style="background: rgba(220, 232, 220, 0.6)">
          <text class="result-title">🔁 重复 {{ result.duplicates.length }}</text>
          <view class="result-names">
            <text v-for="n in result.duplicates" :key="'d' + n" class="result-name dup">{{ n }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { checkRun } from '../../api'

export default {
  data() {
    return {
      text: '',
      title: '',
      save: true,
      running: false,
      result: null
    }
  },
  methods: {
    async run() {
      if (this.running || !this.text.trim()) return
      this.running = true
      try {
        this.result = await checkRun({
          text: this.text,
          save: this.save,
          title: this.title.trim() || ''
        })
        uni.showToast({ title: '筛查完成', icon: 'none' })
      } catch (e) {
        /* 拦截器已提示 */
      } finally {
        this.running = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-top: 20rpx;
}
.paste-area {
  height: 220rpx;
  width: auto;
  line-height: 1.5;
}
.save-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin: 26rpx 0 0;
}
.save-label {
  font-size: 26rpx;
  color: $ink;
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
}
.check-circle.on {
  background: $primary;
  border-color: $primary;
}
.run-btn {
  margin-top: 28rpx;
}
.result-card {
  padding: 20rpx 26rpx;
}
.result-group {
  border-radius: 24rpx;
  padding: 22rpx;
  margin-bottom: 18rpx;
}
.result-group:last-child {
  margin-bottom: 0;
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
  background: #fff;
  color: $ink;
  font-weight: 500;
}
.result-name.done {
  color: #4e9b52;
}
.result-name.undone {
  color: #A2681F;
}
.result-name.invalid,
.result-name.dup {
  color: #c26b83;
}
</style>
