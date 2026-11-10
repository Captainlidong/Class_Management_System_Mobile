<script>
import { useAuthStore } from './stores/auth'

export default {
  onLaunch() {
    const auth = useAuthStore()
    auth.bindUnauthorized()
    auth.refresh()
  }
}
</script>

<style lang="scss">
/* 全局样式：App.vue 的 style 在 uni-app 里是全局生效的 */
@import './styles/theme.scss';

page {
  background: $cream-bg;
  color: $ink;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI',
    'Microsoft YaHei', sans-serif;
}

/* —— 通用卡片 —— */
.card {
  background: $card-bg;
  border-radius: $radius-card;
  padding: 28rpx;
  margin: 0 24rpx 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(122, 96, 76, 0.06);
}

/* —— 通用按钮 —— */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-btn;
  padding: 22rpx 0;
  font-size: 30rpx;
  font-weight: 600;
  transition: opacity 0.15s ease;
}
.btn:active {
  opacity: 0.75;
}
.btn-primary {
  background: $primary;
  color: #fff;
}
.btn-ghost {
  background: rgba(127, 181, 232, 0.14);
  color: #4d8ecf;
}
.btn-danger-ghost {
  background: rgba(244, 159, 182, 0.16);
  color: #d97794;
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
  background: rgba(163, 217, 165, 0.22);
  color: #4e9b52;
}
.pill-undone {
  background: rgba(255, 217, 142, 0.3);
  color: #b07d1e;
}

/* —— 通用输入 —— */
.field-input {
  background: #faf5ee;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $ink;
}

/* —— 空态 —— */
.empty {
  padding: 100rpx 40rpx;
  text-align: center;
  color: $ink-light;
  font-size: 26rpx;
}

/* —— 底部安全区占位（配合自绘 TabBar） —— */
.tabbar-spacer {
  height: calc(140rpx + env(safe-area-inset-bottom));
}
</style>
