import axios from 'axios'

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`
})

// 统一响应处理
instance.interceptors.response.use(response => {
  return response.data
})

export default {
  // 视频相关
  getVideos: () => instance.get('/videos'),
  getVideo: (id) => instance.get(`/videos/${id}`),
  uploadVideo: (data) => instance.post('/videos/upload', data),
  deleteVideo: (id) => instance.delete(`/videos/${id}`),
  updateView: (id) => instance.post(`/videos/${id}/view`),

  // 评论相关
  getComments: (videoId) => instance.get('/comments', { params: { video_id: videoId } }),
  postComment: (data) => instance.post('/comments', data),

  // 分类相关
  getCategories: () => instance.get('/categories'),
  createCategory: (name) => instance.post('/categories', { name }),

  // 评分相关
  submitRating: (data) => instance.post('/ratings', data),
  getAverageRating: (videoId) => instance.get('/ratings/average', { params: { video_id: videoId } }),
  getRatingDistribution: (videoId) => instance.get('/ratings/distribution', { params: { video_id: videoId } })
}
