import { defineStore } from 'pinia'

/**
 * 主题偏好（三态）：auto 跟随系统 / light 浅色 / dark 深色。
 * 深色实现 = 给 html（uni H5 页面根的祖先）挂 mb-dark class，
 * uni.scss 里 --mb-* 深色值挂在 html.mb-dark 下，切换即全页生效。
 * webview 里 matchMedia 可能不可靠，所以手动选 light/dark 是最可靠路径。
 */
const KEY = 'miaoban_theme'

function readPref() {
  try {
    const v = uni.getStorageSync(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function systemDark() {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function applyClass(pref) {
  // #ifdef H5
  const dark = pref === 'dark' || (pref === 'auto' && systemDark())
  const el = document.documentElement
  if (el) {
    el.classList.toggle('mb-dark', dark)
  }
  // #endif
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    pref: readPref(),
    systemDark: false
  }),
  getters: {
    /** 当前实际生效的主题（供 JS 取色等场景）。 */
    isDark(state) {
      if (state.pref === 'dark') return true
      if (state.pref === 'light') return false
      return state.systemDark
    }
  },
  actions: {
    init() {
      applyClass(this.pref)
      this.systemDark = systemDark()
      // auto 模式下监听系统切换（H5 有效；不支持的环境静默）
      try {
        if (typeof matchMedia === 'function') {
          matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.systemDark = e.matches
            if (this.pref === 'auto') applyClass('auto')
          })
        }
      } catch {
        /* 老内核无 addEventListener 形式，静默 */
      }
    },
    setPref(pref) {
      this.pref = pref
      try {
        uni.setStorageSync(KEY, pref)
      } catch {
        /* ignore */
      }
      applyClass(pref)
    },
    /** JS 取色（showModal confirmColor 等无法用 CSS 变量的场景）。 */
    jsColor(key) {
      const dark = {
        berry: '#D9756B',
        warn: '#E0B455',
        primary: '#7FB08F'
      }
      const light = {
        berry: '#C96F5E',
        warn: '#D9A441',
        primary: '#3E5C4B'
      }
      const palette = this.isDark ? dark : light
      return palette[key] || palette.primary
    }
  }
})
