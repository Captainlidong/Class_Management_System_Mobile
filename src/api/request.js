/**
 * uni.request 统一封装：
 * - 同源 H5：直接相对路径 /api，Cookie（CMS_SESSION）自动携带，与桌面版会话互通
 * - 响应包 {code,message,data}，code===0 且 HTTP 2xx 才算成功
 * - 401 统一触发 onUnauthorized（跳登录页）
 * - 未来打 App 包时，可在此处加 X-Auth-Token 头分支（后端 Filter 已支持）
 */
const BASE = '/api'

let unauthorizedHandler = null

export function onUnauthorized(fn) {
  unauthorizedHandler = fn
}

function toast(title) {
  uni.showToast({ title, icon: 'none', duration: 2200 })
}

function buildQuery(params) {
  if (!params) return ''
  const parts = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
  return parts.length ? '?' + parts.join('&') : ''
}

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE + options.url,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || 15000,
      success: (res) => {
        if (res.statusCode === 401) {
          toast('未登录或登录已过期')
          if (unauthorizedHandler) unauthorizedHandler()
          reject({ code: 401, message: '未登录或登录已过期' })
          return
        }
        const body = res.data || {}
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        const msg = body.message || `请求失败（${res.statusCode}）`
        toast(msg)
        reject({ code: body.code || res.statusCode, message: msg })
      },
      fail: (err) => {
        toast('网络错误，请检查连接')
        reject({ code: -1, message: (err && err.errMsg) || '网络错误' })
      }
    })
  })
}

export function get(url, params) {
  return request({ url: url + buildQuery(params), method: 'GET' })
}

export function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

export function put(url, data) {
  return request({ url, method: 'PUT', data })
}

export function patch(url, data) {
  return request({ url, method: 'PATCH', data })
}

export function del(url, data) {
  return request({ url, method: 'DELETE', data })
}

/** multipart 上传。announcements 附件的字段名是 files；单文件场景也传 files 数组语义由后端定 */
export function uploadFile(url, filePath, name = 'files', formData = {}) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE + url,
      filePath,
      name,
      formData,
      success: (res) => {
        let body = {}
        try {
          body = JSON.parse(res.data)
        } catch (e) {
          body = { code: res.statusCode, message: '响应解析失败' }
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        const msg = body.message || `上传失败（${res.statusCode}）`
        toast(msg)
        reject({ code: body.code || res.statusCode, message: msg })
      },
      fail: (err) => {
        toast('上传失败，请检查网络')
        reject({ code: -1, message: (err && err.errMsg) || '上传失败' })
      }
    })
  })
}

/** H5 同源下载：导出/附件等 byte[] 接口直接用浏览器下载（带会话 Cookie） */
export function downloadByUrl(urlAndQuery) {
  // #ifdef H5
  window.location.href = BASE + urlAndQuery
  // #endif
}
