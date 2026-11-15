<template>
  <view class="login-page" :class="{ fading }">
    <view class="login-hero">
      <view class="bubble-wrap">
        <SpeechBubble :text="bubbleText" />
      </view>
      <view class="cat-stage">
        <CatSitting :width="330" :backdrop="true" />
      </view>
      <text class="hero-title">喵班</text>
      <text class="hero-sub">喵陪班 · 替你打理班级大小事</text>
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

      <button
        class="btn btn-primary login-btn"
        :class="{ 'btn-success': btnState === 'success', pulsing: btnState === 'submitting' }"
        :disabled="btnState !== 'idle'"
        @tap="submit"
      >
        {{ btnText }}
      </button>
      <text class="login-hint">与会话桌面版共用登录，7 天内免重复登录</text>
    </view>
  </view>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { authCaptcha } from '../../api'
import CatSitting from '../../components/cats/CatSitting.vue'
import SpeechBubble from '../../components/cats/SpeechBubble.vue'

const BUBBLES = ['今天也要好好生活', '班级的事，交给我喵', '今天也要加油喵']

export default {
  components: { CatSitting, SpeechBubble },
  data() {
    return {
      username: '',
      password: '',
      captchaCode: '',
      captchaId: '',
      captchaImage: '',
      btnState: 'idle', // idle | submitting | success
      fading: false,
      bubbleText: BUBBLES[Math.floor(Math.random() * BUBBLES.length)]
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    },
    btnText() {
      if (this.btnState === 'submitting') return '喵…正在验证身份'
      if (this.btnState === 'success') return '✓ 喵！欢迎回来'
      return '开启我的喵班 →'
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
      if (this.btnState !== 'idle') return
      if (!this.username.trim() || !this.password || !this.captchaCode.trim()) {
        uni.showToast({ title: '请填写账号、密码和验证码', icon: 'none' })
        return
      }
      this.btnState = 'submitting'
      try {
        await this.auth.login({
          username: this.username.trim(),
          password: this.password,
          captchaId: this.captchaId,
          captchaCode: this.captchaCode.trim()
        })
        // 成功反馈 → 写欢迎标志 → 登录页淡出 → 进入首页（首页显示欢迎过场）
        this.btnState = 'success'
        uni.setStorageSync(
          'miaoban_welcome',
          JSON.stringify({ name: this.username.trim(), ts: Date.now() })
        )
        setTimeout(() => {
          this.fading = true
          setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 240)
        }, 460)
      } catch (e) {
        // 验证码是一次性的，失败换一张
        this.btnState = 'idle'
        this.loadCaptcha()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: $cream-bg;
  padding: 0 48rpx;
  transition: opacity 0.22s ease;
}
.login-page.fading {
  opacity: 0;
}
.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 90rpx 0 30rpx;
}
.bubble-wrap {
  margin-bottom: -6rpx;
  z-index: 2;
}
.cat-stage {
  display: flex;
  justify-content: center;
}
.hero-title {
  font-size: 56rpx;
  font-weight: 800;
  color: $ink;
  margin-top: 10rpx;
  letter-spacing: 4rpx;
}
.hero-sub {
  font-size: 25rpx;
  color: $ink-light;
  margin-top: 10rpx;
}
.login-card {
  background: $card-bg;
  border-radius: 40rpx;
  padding: 44rpx 36rpx;
  border: 1rpx solid rgba(232, 226, 212, 0.7);
  box-shadow: 0 14rpx 50rpx rgba(122, 96, 76, 0.08);
  margin-top: 36rpx;
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
  background: $cream-bg;
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
.login-btn.pulsing {
  animation: btn-pulse 1s ease infinite;
}
.login-btn.btn-success {
  background: $matcha;
}
.login-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: $ink-light;
  margin-top: 22rpx;
}
</style>
