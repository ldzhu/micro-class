<template>
  <div class="video-container">
    <!-- 新增查询条件表单 -->
    <el-card class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="标题搜索">
          <el-input
              v-model="searchForm.title"
              placeholder="输入视频标题"
              clearable
          />
        </el-form-item>
        <el-form-item label="分类筛选">
          <el-select
              v-model="searchForm.category_id"
              placeholder="全部分类"
              clearable
          >
            <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              class="search-btn"
              @click="handleSearch"
              :loading="isSearching"
          >
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 视图切换控件 -->
    <div class="view-toggle">
      <el-radio-group v-model="viewType" size="large">
        <el-radio-button value="card">
          <el-icon>
            <Grid/>
          </el-icon>
          卡片视图
        </el-radio-button>
        <el-radio-button value="list">
          <el-icon>
            <List/>
          </el-icon>
          列表视图
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 卡片视图 -->
    <div class="video-list" v-if="viewType === 'card'">
      <el-row :gutter="20">
        <el-col :span="6" v-for="video in videos" :key="video.id">
          <el-card @click="goToPlayer(video.id)">
            <video :src="video.file_path" class="video-thumbnail"></video>
            <h3>{{ video.title }}</h3>
            <el-tag>{{ video.category_name || '未知分类' }}</el-tag>
            <div class="view-count">播放次数：{{ video.view_count }}</div>
            <div class="rating">评分：{{ video.average_rating || '暂无' }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 列表视图 -->
    <el-card class="video-table" v-else>
      <el-table :data="videos">
        <el-table-column prop="title" label="标题">
          <template #default="{ row }">
            <div @click="handleRowClick(row)">
              <el-link type="primary" underline>{{ row.title }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类">
          <template #default="{ row }">
            {{ getCategoryName(row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" sortable label="上传时间"/>
        <el-table-column prop="view_count" sortable label="播放次数"/>
        <el-table-column prop="average_rating" sortable label="评分"/>
      </el-table>
    </el-card>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="handlePageChange"
      />
    </div>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {useRouter} from 'vue-router';
import {ElMessage} from "element-plus";
import {Grid, List} from '@element-plus/icons-vue'
import api from "@/api/index.js";

const router = useRouter();
// 查询条件表单
const searchForm = reactive({
  title: '',
  category_id: ''
})
const isSearching = ref(false);
// 视图类型：card/list
const viewType = ref('card')
const videos = ref([]);
const categories = ref([])
// 分页相关变量
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

onMounted(async () => {
  await fetchCategories()
  await fetchVideos()
});

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await api.getCategories()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类失败')
  }
}

// 获取视频列表
const fetchVideos = async () => {
  try {
    isSearching.value = true

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.title,
      category_id: searchForm.category_id
    }

    const res = await api.getVideos(params)

    videos.value = []
    // 循环遍历视频列表，设置file_path为视频的完整URL
    for (const video of res.data) {
      video.file_path = new URL(`/uploads/${video.file_path}`, import.meta.env.VITE_API_BASE).href;
      videos.value.push(video);
    }
    total.value = res.total

  } catch (error) {
    ElMessage.error('获取视频列表失败')
  } finally {
    isSearching.value = false
  }
}

const goToPlayer = (id) => {
  router.push(`/video/${id}`);
};

const handleSearch = () => {
  currentPage.value = 1
  fetchVideos()
}

const handleRowClick = (row) => {
  goToPlayer(row.id)
}

// 处理分页变化
const handlePageChange = (newPage) => {
  currentPage.value = newPage
  fetchVideos()
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

</script>

<style lang="scss">
.video-container {
  .search-form {
    margin-bottom: 10px;

    .el-form-item {
      width: 250px;
      margin-right: 30px;
      margin-bottom: 0;
    }

    .search-btn {
      width: 100px;
    }
  }

  .view-toggle {
    display: flex;
    justify-content: flex-end;
  }

  .video-list {
    padding: 10px 0 0 0;

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

  .video-table {
    margin-top: 10px;
    display: flex;
    flex-direction: column;

    .el-card__body {
      height: 100%;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>


