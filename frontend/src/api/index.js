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
  getVideos: (params) => instance.get('/videos', {params}),
  getVideo: (id) => instance.get(`/videos/${id}`),
  uploadVideo: (data) => instance.post('/videos/upload', data),
  updateVideo: (id, data) => instance.put(`/videos/${id}`, data),
  deleteVideo: (id) => instance.delete(`/videos/${id}`),
  updateView: (id) => instance.post(`/videos/${id}/view`),

  // 评论相关
  getComments: (videoId) => instance.get('/comments', { params: { video_id: videoId } }),
  postComment: (data) => instance.post('/comments', data),

  // 分类相关
  getCategories: () => instance.get('/categories'),
  createCategory: (name) => instance.post('/categories', { name }),

  // 评分相关
  submitRating: (data) => instance.post('/ratings', data)
}
