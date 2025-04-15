<template>
  <div class="video-list">
    <el-row :gutter="20">
      <el-col :span="6" v-for="video in videos" :key="video.id">
        <el-card @click="goToPlayer(video.id)">
          <video :src="video.file_path" class="video-thumbnail"></video>
          <h3>{{ video.title }}</h3>
          <el-tag>{{video.category_name || '未知分类'}}</el-tag>
          <div class="view-count">播放次数：{{ video.view_count}}</div>
          <div class="rating">评分：{{ video.average_rating || '暂无' }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {ElMessage} from "element-plus";
import api from "@/api/index.js";

const videos = ref([]);
const router = useRouter();

onMounted(async () => {
  await fetchVideos()
});

const goToPlayer = (id) => {
  router.push(`/video/${id}`);
};

// 获取视频列表
const fetchVideos = async () => {
  try {
    const res = await api.getVideos()

    videos.value = []
    // 循环遍历视频列表，设置file_path为视频的完整URL
    for (const video of res.data) {
      video.file_path = new URL(video.file_path, import.meta.env.VITE_API_BASE).href;
      videos.value.push(video);
    }

  } catch (error) {
    ElMessage.error('获取视频列表失败')
  }
}

</script>

<style lang="scss">
.video-list {
  padding: 20px;

  .el-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-5px);
    }

    /* 视频播放器缩略图 */
    .video-thumbnail {
      width: 100%;
      max-width: 100%;
      height: 180px;
      background-color: #000;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .rating, .view-count {
      padding-top: 4px;
      font-size: 12px;
    }


  }
}
</style>


