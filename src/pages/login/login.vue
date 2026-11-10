<template>
  <view class="login-page">
    <view class="login-hero">
      <text class="hero-emoji">🎀</text>
      <text class="hero-title">班级管理助手</text>
      <text class="hero-sub">班长专属 · 移动端</text>
    </view>

    <view class="login-card">
      <view class="field">
        <text class="field-label">账号</text>
        <input v-model="username" class="field-input" placeholder="请输入账号" />
      </view>
      <view class="field">
        <text class="field-label">密码</text>
        <input v-model="password" class="field-input" password placeholder="请输入密码" />
      </view>
      <view class="field">
        <text class="field-label">验证码</text>
        <view class="captcha-row">
          <input v-model="captchaCode" class="field-input captcha-input" placeholder="不区分大小写" />
          <image
            v-if="captchaImage"
            :src="captchaImage"
            class="captcha-img"
            mode="aspectFit"
            @tap="loadCaptcha"
          />
          <view v-else class="captcha-img captcha-loading" @tap="loadCaptcha">…</view>
        </view>
      </view>

      <button class="btn btn-primary login-btn" :disabled="submitting" @tap="submit">
        {{ submitting ? '登录中…' : '登 录' }}
      </button>
      <text class="login-hint">与会话桌面版共用登录，7 天内免重复登录</text>
    </view>
  </view>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { authCaptcha } from '../../api'

export default {
  data() {
    return {
      username: '',
      password: '',
      captchaCode: '',
      captchaId: '',
      captchaImage: '',
      submitting: false
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    }
  },
  onLoad() {
    // 已登录（或未开启登录保护）直接进首页，避免登录循环
    const auth = this.auth
    if (!auth.statusLoaded) {
      auth.refresh().then(() => this.redirectIfLoggedIn())
    } else {
      this.redirectIfLoggedIn()
    }
  },
  onShow() {
    this.loadCaptcha()
  },
  methods: {
    redirectIfLoggedIn() {
      if (!this.auth.authRequired || this.auth.loggedIn) {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },
    async loadCaptcha() {
      try {
        const data = await authCaptcha()
        this.captchaImage = data.image
        this.captchaId = data.captchaId
        this.captchaCode = ''
      } catch (e) {
        /* 拦截器已提示 */
      }
    },
    async submit() {
      if (this.submitting) return
      if (!this.username.trim() || !this.password || !this.captchaCode.trim()) {
        uni.showToast({ title: '请填写账号、密码和验证码', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        await this.auth.login({
          username: this.username.trim(),
          password: this.password,
          captchaId: this.captchaId,
          captchaCode: this.captchaCode.trim()
        })
        uni.reLaunch({ url: '/pages/index/index' })
      } catch (e) {
        // 验证码是一次性的，失败换一张
        this.loadCaptcha()
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fdeee0 0%, #fdf8f2 42%);
  padding: 0 48rpx;
}
.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 140rpx 0 60rpx;
}
.hero-emoji {
  font-size: 96rpx;
}
.hero-title {
  font-size: 44rpx;
  font-weight: 800;
  color: $ink;
  margin-top: 16rpx;
}
.hero-sub {
  font-size: 25rpx;
  color: $ink-light;
  margin-top: 8rpx;
}
.login-card {
  background: #fff;
  border-radius: 40rpx;
  padding: 44rpx 36rpx;
  box-shadow: 0 14rpx 50rpx rgba(122, 96, 76, 0.1);
}
.field {
  margin-bottom: 30rpx;
}
.field-label {
  display: block;
  font-size: 26rpx;
  color: $ink-light;
  margin-bottom: 12rpx;
  padding-left: 6rpx;
}
.captcha-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.captcha-input {
  flex: 1;
}
.captcha-img {
  width: 220rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #fcf2f6;
  flex-shrink: 0;
}
.captcha-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $ink-light;
}
.login-btn {
  margin-top: 12rpx;
}
.login-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 22rpx;
}
</style>
