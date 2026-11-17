import { get, post, put, patch, del, uploadFile } from './request'

/* —— 登录 —— */
export const authStatus = () => get('/auth/status')
export const authCaptcha = () => get('/auth/captcha')
export const authLogin = (payload) => post('/auth/login', payload)
export const authLogout = () => post('/auth/logout')

/* —— 基准名单 —— */
export const studentsList = () => get('/students')

/* —— 资料收集与分发 —— */
export const collectionTasks = () => get('/collections/tasks')
export const collectionTask = (id) => get(`/collections/tasks/${id}`)
export const collectionCreate = (payload) => post('/collections/tasks', payload)
export const collectionUpdate = (id, payload) => patch(`/collections/tasks/${id}`, payload)
export const collectionDelete = (id) => del(`/collections/tasks/${id}`)
export const collectionUpdateEntry = (entryId, payload) => patch(`/collections/entries/${entryId}`, payload)
export const collectionAddStudents = (taskId, studentIds) =>
  post(`/collections/tasks/${taskId}/students`, { studentIds })
export const collectionRemoveStudent = (taskId, studentId) =>
  del(`/collections/tasks/${taskId}/students/${studentId}`)
export const collectionMarkByText = (taskId, text, submitted = true) =>
  post(`/collections/tasks/${taskId}/mark`, { text, submitted })
export const collectionMarkAll = (taskId, submitted) =>
  post(`/collections/tasks/${taskId}/mark-all`, { submitted })
export const collectionBatchRemove = (taskId, studentIds) =>
  post(`/collections/tasks/${taskId}/students/batch-remove`, { studentIds })
export const collectionStudents = (taskId) => get(`/collections/tasks/${taskId}`)
export const studentsForPicker = () => get('/students')

/* —— 请假 —— */
export const leaveList = (params) => get('/leaves', params)
export const leaveStats = () => get('/leaves/stats')
export const leaveCreate = (payload) => post('/leaves', payload)
export const leaveUpdate = (id, payload) => patch(`/leaves/${id}`, payload)
export const leaveClose = (id) => post(`/leaves/${id}/close`, {})
export const leaveReopen = (id) => post(`/leaves/${id}/reopen`, {})
export const leaveDelete = (id) => del(`/leaves/${id}`)

/* —— 奖学金 —— */
export const scholarshipBatches = () => get('/scholarships/batches')
export const scholarshipBatch = (id) => get(`/scholarships/batches/${id}`)
export const scholarshipMarkReceived = (awardId, received = true) =>
  post(`/scholarships/awards/${awardId}/mark-received`, { received })
export const scholarshipUpdateAward = (awardId, payload) =>
  patch(`/scholarships/awards/${awardId}`, payload)

/* —— 群发素材 —— */
export const announcementList = (params) => get('/announcements', params)
export const announcementDetail = (id) => get(`/announcements/${id}`)
export const announcementUploadFiles = (id, filePath) =>
  uploadFile(`/announcements/${id}/files`, filePath, 'files')
export const announcementDeleteFile = (id, fileId) =>
  del(`/announcements/${id}/files/${fileId}`)
export const announcementMarkSent = (id) => post(`/announcements/${id}/mark-sent`)
export const announcementUnmarkSent = (id) => post(`/announcements/${id}/unmark-sent`)
export const announcementDelete = (id) => del(`/announcements/${id}`)
export const announcementCreate = (body) => post('/announcements', body)
export const announcementUpdate = (id, body) => put(`/announcements/${id}`, body)
export const announcementSetPinned = (id, pinned) => patch(`/announcements/${id}/pin`, { pinned })

/* —— 待办事务 —— */
export const todoList = () => get('/todos')
export const todoCreate = (payload) => post('/todos', payload)
export const todoUpdate = (id, payload) => patch(`/todos/${id}`, payload)
export const todoDelete = (id) => del(`/todos/${id}`)

/* —— 名单筛查 —— */
export const checkRun = (payload) => post('/check', payload)
export const checkRecords = (params) => get('/check-records', params)
export const checkRecord = (id) => get(`/check-records/${id}`)
export const checkRecordDelete = (id) => del(`/check-records/${id}`)

/* —— 长期任务 / 自定义分组（只读视图） —— */
export const taskList = () => get('/tasks')
export const taskRecords = (id) => get(`/tasks/${id}/records`)
export const groupList = () => get('/groups')

/* —— 学期档案 / 通知中心 —— */
export const termList = () => get('/terms')
export const termSwitch = (id) => post(`/terms/${id}/switch`)
export const termCreate = (payload) => post('/terms', payload)
export const notificationList = () => get('/notifications')
export const notificationRead = (id) => post(`/notifications/${id}/read`)
export const notificationReadAll = () => post('/notifications/read-all')

/* —— 数据洞察 —— */
export const dashboardTrends = () => get('/dashboard/trends')
