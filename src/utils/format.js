/** 收集/分发双口径文案（与桌面版 kindText 对齐） */
export function kindText(kind) {
  return kind === 'distribute'
    ? {
        done: '已领',
        undone: '未领',
        statTotal: '应发人数',
        statusCol: '领取状态',
        timeCol: '领取时间',
        onlyToggle: '只看未领',
        markAllToggle: '一键标记全部已领',
        selectAllUndone: '勾选全部未领',
        copyBtn: '复制未领名单',
        copyDone: '全部同学都已领取 🎉',
        copyTemplate: (names, task) =>
          `以下同学还未领取「${task}」：${names}，请尽快找班长领取，谢谢配合~`,
        exportSuffix: '_领取情况',
        exportUndoneSuffix: '_未领名单'
      }
    : {
        done: '已交',
        undone: '未交',
        statTotal: '应交人数',
        statusCol: '提交状态',
        timeCol: '提交时间',
        onlyToggle: '只看未交',
        markAllToggle: '一键标记全部已交',
        selectAllUndone: '勾选全部未交',
        copyBtn: '复制未交名单',
        copyDone: '全部同学都已交齐 🎉',
        copyTemplate: (names, task) =>
          `以下同学还未提交「${task}」：${names}，请尽快交给班长，谢谢配合~`,
        exportSuffix: '_提交情况',
        exportUndoneSuffix: '_未交名单'
      }
}

export function fmtDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`
}

export function isPassed(iso) {
  return iso && new Date(iso).getTime() < Date.now()
}

export function pct(done, total) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export function todayLabel() {
  const d = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${week}`
}
