<template>
  <div class="manage-container">
    <el-alert
        title="提示"
        type="info"
        :closable="false"
        style="margin-bottom: 20px; padding-left: 0"
    >
      <template #title>
        <p>
          本页面仅供管理员使用，普通用户请勿访问！
        </p>
      </template>
    </el-alert>

    <el-dialog
        v-model="dialogVisible"
        title="上传新视频"
        width="600px"
        @closed="resetForm"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="视频标题" required>
          <el-input v-model="form.title" placeholder="请输入视频标题"/>
        </el-form-item>

        <el-form-item label="视频描述">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入视频描述"
          />
        </el-form-item>

        <el-form-item label="视频分类">
          <div class="category">
            <el-select
                v-model="form.category_id"
                placeholder="选择分类"
                class="category-select"
            >
              <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
              />
            </el-select>
            <el-input
                v-model="newCategory"
                placeholder="新建分类"
                class="new-category-input"
            />
            <el-button
                type="primary"
                @click="addCategory"
                :disabled="!newCategory"
                class="new-category-btn"
            >
              添加分类
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="视频文件" required>
          <el-upload
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
          >
            <template #trigger>
              <el-button type="primary">选择视频文件</el-button>
            </template>
            <div v-if="form.file" class="selected-file">
              已选择文件：{{ form.file.name }}
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitForm"
            :loading="isSubmitting"
        >
          确认上传
        </el-button>
      </template>
    </el-dialog>

    <el-button type="primary" size="large" @click="dialogVisible = true">
      上传新视频
    </el-button>

    <!-- 视频列表 -->
    <el-card class="video-list">
      <el-table :data="videos" height="100%">
        <el-table-column type="index" width="80"/>
        <el-table-column prop="title" label="标题"/>
        <el-table-column label="分类">
          <template #default="{ row }">
            {{ getCategoryName(row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" sortable label="上传时间"/>
        <el-table-column prop="view_count" sortable label="播放次数"/>
        <el-table-column prop="average_rating" sortable label="评分"/>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
                type="danger"
                size="small"
                @click="deleteVideo(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import api from "@/api/index.js";

const newCategory = ref('')
const categories = ref([])
const videos = ref([])
const isSubmitting = ref(false)
const dialogVisible = ref(false)
// 表单数据
const form = ref({
  title: '',
  description: '',
  category_id: null,
  file: null
})

// 初始化数据
onMounted(async () => {
  await fetchCategories()
  await fetchVideos()
})

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
    const res = await api.getVideos()
    videos.value = res.data
  } catch (error) {
    ElMessage.error('获取视频列表失败')
  }
}

// 添加新分类
const addCategory = async () => {
  try {
    await api.createCategory(newCategory.value)
    ElMessage.success('分类添加成功')
    newCategory.value = ''
    await fetchCategories()
  } catch (error) {
    ElMessage.error('添加分类失败')
  }
}

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('description', form.value.description)
  formData.append('category_id', form.value.category_id)
  formData.append('video', form.value.file)

  try {
    await api.uploadVideo(formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
    ElMessage.success('视频上传成功')
    resetForm()
    await fetchVideos()
  } catch (error) {
    ElMessage.error('视频上传失败')
  } finally {
    isSubmitting.value = false
    dialogVisible.value = false
  }
}

// 删除视频
const deleteVideo = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个视频吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await api.deleteVideo(id)
    ElMessage.success('视频删除成功')
    await fetchVideos()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除视频失败')
    }
  }
}

// 文件选择处理
const handleFileChange = file => form.value.file = file.raw;

// 表单验证
const validateForm = () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入视频标题')
    return false
  }
  if (!form.value.file) {
    ElMessage.warning('请选择视频文件')
    return false
  }
  return true
}

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    category_id: null,
    file: null
  }
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

</script>

<style lang="scss">
.manage-container {
  margin: 0 auto;
  padding: 20px;

  .category {
    display: flex;
    gap: 10px;
    align-items: center;

    .category-select {
      width: 150px;
    }

    .new-category-input {
      width: 200px;
    }

    .selected-file {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }
  }

  .video-list {
    margin-top: 20px;
    height: calc(100vh - 220px);
    display: flex;
    flex-direction: column;

    .el-card__body {
      height: 100%;
    }

  }

}


</style>
