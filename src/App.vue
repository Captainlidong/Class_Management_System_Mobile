<script>
import { useAuthStore } from './stores/auth'

export default {
  onLaunch() {
    // #ifdef APP-PLUS
    // App 端是 web-view 壳：登录态由网页（同源 Cookie）自己管理，
    // 壳的 JS 上下文没有域名基准，发起 /api 请求必然失败，直接跳过
    return
    // #endif
    const auth = useAuthStore()
    auth.bindUnauthorized()
    auth.refresh()
  }
}
</script>

<style lang="scss">
/* 全局样式：App.vue 的 style 在 uni-app 里是全局生效的 —— 喵班 · 奶油治愈系 */
@import './styles/theme.scss';

page {
  background: $cream-bg;
  color: $ink;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI',
    'Microsoft YaHei', sans-serif;
}

/* —— 通用卡片：白底大圆角，阴影极轻（参考图扁平风） —— */
.card {
  background: $card-bg;
  border-radius: $radius-card;
  padding: 28rpx;
  margin: 0 24rpx 24rpx;
  border: 1rpx solid rgba(232, 226, 212, 0.7);
  box-shadow: 0 4rpx 18rpx rgba(122, 96, 76, 0.05);
}

/* —— 胶囊按钮（深绿底白字，参考图样式） —— */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-btn;
  padding: 24rpx 0;
  font-size: 30rpx;
  font-weight: 700;
  transition: opacity 0.15s ease;
}
.btn:active {
  opacity: 0.8;
}
.btn-primary {
  background: $primary;
  color: #fff;
}
.btn-ghost {
  background: $primary-soft;
  color: $primary-deep;
}
.btn-danger-ghost {
  background: rgba(201, 111, 94, 0.14);
  color: $berry;
}
.btn[disabled] {
  opacity: 0.45;
}

/* —— 状态小药丸 —— */
.pill {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}
.pill-done {
  background: $sage-light;
  color: $primary-deep;
}
.pill-undone {
  background: rgba(217, 164, 65, 0.18);
  color: #a2681f;
}

/* —— 通用输入：奶油内衬 —— */
.field-input {
  background: #fbf7ee;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $ink;
}

/* —— 底部安全区占位（配合自绘 TabBar） —— */
.tabbar-spacer {
  height: calc(140rpx + env(safe-area-inset-bottom));
}
</style>
