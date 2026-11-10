import { defineStore } from 'pinia'
import { onUnauthorized } from '../api/request'
import { authStatus, authLogin, authLogout } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authRequired: false,
    loggedIn: false,
    username: '',
    statusLoaded: false
  }),
  actions: {
    async refresh() {
      try {
        const data = await authStatus()
        this.authRequired = !!(data && data.authRequired)
        this.loggedIn = !!(data && data.loggedIn)
        this.username = (data && data.username) || ''
      } catch (e) {
        this.authRequired = false
        this.loggedIn = false
      } finally {
        this.statusLoaded = true
      }
    },
    async login(payload) {
      const data = await authLogin(payload)
      this.loggedIn = true
      this.username = (data && data.username) || ''
      return data
    },
    async logout() {
      try {
        await authLogout()
      } finally {
        this.loggedIn = false
        this.username = ''
      }
    },
    /** 401 时跳登录页（App.onLaunch 注册一次） */
    bindUnauthorized() {
      onUnauthorized(() => {
        this.authRequired = true
        this.loggedIn = false
        uni.reLaunch({ url: '/pages/login/login' })
      })
    }
  }
})
