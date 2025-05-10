<template>
  <div>
    <div class="video-player">
      <video
          v-if="videoUrl.length > 0"
          ref="videoElement"
          :src="videoUrl"
          controls
          preload="metadata"
          autoplay
          muted
          class="main-video"
      ></video>
    </div>

    <div class="rating-container">
      <el-rate
          class="rating"
          v-model="rating"
          @change="submitRating"
          size="large"
          show-score
      >
      </el-rate>
      <span class="rating-text">播放{{ viewCount }}次，共{{ ratingCount }}人参与评分</span>
    </div>

    <div class="comments-container">
      <el-form @submit.prevent="submitComment">
        <el-input
            type="textarea"
            :rows="3"
            v-model.trim="comment"
            placeholder="输入评论"
            :maxlength="200"
            show-word-limit
        ></el-input>
        <el-button
            type="primary"
            native-type="submit"
            :disabled="!commentValid"
        >提交评论
        </el-button>
      </el-form>

      <div class="comments">
        <div class="comment-header">
          <span v-if="comments.length === 0">暂无评论</span>
          <span v-else>共 {{ comments.length }} 条评论</span>
        </div>
        <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment"
        >
          <div class="comment-content" v-html="sanitizedContent(comment.content)"></div>
          <div class="comment-meta">{{ formatDateTime(comment.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import DOMPurify from 'dompurify';
import {format} from 'date-fns';
import {ElMessage} from "element-plus";
import api from "@/api/index.js";

const route = useRoute();

const video = ref({});
const videoUrl = ref('');
const rating = ref(0);
const ratingCount = ref(0);
const comments = ref([]);
const comment = ref('');
const videoElement = ref(null)
const viewCount = ref(0);
const hasCounted = ref(false);

onMounted(async () => {
  await fetchData();
  setupVideoListeners();
});

const fetchData = async () => {
  try {
    const [videoRes, commentsRes] = await Promise.all([
      api.getVideo(route.params.id),
      api.getComments(route.params.id)
    ]);

    if (!videoRes.data) {
      ElMessage.error('视频不存在');
      return;
    }

    videoUrl.value = new URL(`/uploads/${videoRes.data?.file_path}`, import.meta.env.VITE_API_BASE).href;
    rating.value = videoRes.data.average_rating;
    ratingCount.value = videoRes.data.rating_count;
    viewCount.value = videoRes.data.view_count;

    video.value = videoRes.data;
    comments.value = commentsRes.data;
  } catch (error) {
    ElMessage.error('视频加载失败');
    console.error(error);
  }
};

//  提交评分
const submitRating = async (value) => {
  try {
    await api.submitRating({
      video_id: route.params.id,
      rating: value
    });
    const res = await api.getVideo(route.params.id);
    rating.value = res.data.average_rating;
    ratingCount.value = res.data.rating_count;
  } catch (error) {
    ElMessage.error('评分提交失败');
    rating.value = video.value.average_rating;
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentValid.value) return;

  try {
    await api.postComment({
      video_id: route.params.id,
      content: comment.value
    });
    comment.value = '';
    await fetchData();
  } catch (error) {
    ElMessage.error('评论提交失败');
  }
};

// 评论是否合法
const commentValid = computed(() => comment.value.length > 0 && comment.value.length <= 200);

// 评论内容安全过滤
const sanitizedContent = content => DOMPurify.sanitize(content);

// 格式化评论时间
const formatDateTime = (dt) => format(new Date(dt), 'yyyy-MM-dd HH:mm');


// 发送播放统计
const countView = async () => {
  if (!hasCounted.value) {
    try {
      const res = await api.updateView(video.value.id);
      viewCount.value = res.data;

      hasCounted.value = true;
    } catch (error) {
      console.error('统计播放次数失败:', error)
    }
  }
}

// 播放进度监听，超过50%统计1次
const setupVideoListeners = () => {
  const $video = videoElement.value

  // 播放进度超过50%统计
  $video.addEventListener('timeupdate', () => {
    if ($video.currentTime > $video.duration * 0.5) {
      countView()
    }
  })
}

</script>

<style lang="scss">
.video-player {
  aspect-ratio: 16 / 9;
  max-width: 60vw;
  margin: auto;

  .main-video {
    width: 100%;
    height: 100%;
    max-width: 60vw;
    background-color: #000;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.rating-container {
  max-width: 60vw;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // 在现有样式基础上补充：
  .el-rate {
    margin: 20px 0;

    .el-rate__item {
      margin-right: 8px;
    }

  }
}

.comments-container {
  max-width: 60vw;
  margin: auto;

  .el-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .el-textarea {
      flex: 1;

      .el-textarea__inner {
        border-radius: 10px;
      }
    }

    .el-button {
      align-self: end;
      width: 100px;
      border-radius: 4px;
      padding: 8px 24px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
      }
    }
  }

  .comments {
    margin-top: 20px;
    background: var(--color-background-soft);
    border-radius: 8px;
    padding: 12px;

    .comment-header {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
    }

    .comment {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
      background: var(--el-bg-color);
      transition: all 0.2s ease;
      font-size: 14px;
      color: var(--el-text-color-primary);

      &:hover {
        transform: translateX(4px);
        background: var(--el-bg-color-overlay);
      }

      .comment-content {
        white-space: pre-wrap;
        word-break: break-word;
      }

      .comment-meta {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-align: right; /* 时间右对齐 */
      }
    }

  }
}

</style>

