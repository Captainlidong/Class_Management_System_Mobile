/**
 * 自绘确认弹窗接线（配合 components/ConfirmDialog.vue）。
 * 页面引入本 mixin + 在模板放一个 <ConfirmDialog ...> 即可用
 * this.confirm(opts, fn) 替代 uni.showModal({ ... success })：
 *   opts: { title, content, confirmText?, danger?, showCancel? }
 *   fn:   点确认后执行的回调（对应原 success 里 res.confirm 分支）
 */
export default {
  data() {
    return {
      dlg: {
        visible: false,
        title: '',
        content: '',
        danger: false,
        confirmText: '确定',
        cancelText: '取消',
        showCancel: true,
        _fn: null
      }
    }
  },
  methods: {
    confirm(opts, fn) {
      this.dlg = {
        visible: true,
        title: (opts && opts.title) || '',
        content: (opts && opts.content) || '',
        danger: !!(opts && opts.danger),
        confirmText: (opts && opts.confirmText) || '确定',
        cancelText: (opts && opts.cancelText) || '取消',
        showCancel: !opts || opts.showCancel !== false,
        _fn: fn || null
      }
    },
    onDlgClose() {
      this.dlg.visible = false
    },
    onDlgConfirm() {
      this.dlg.visible = false
      const fn = this.dlg._fn
      if (fn) fn()
    }
  }
}
