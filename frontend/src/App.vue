<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <el-menu
        mode="horizontal"
        :router="true"
        class="main-nav"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        default-active="/"
    >
      <el-menu-item index="/" class="logo-item">
        <span class="site-title">微课视频</span>
      </el-menu-item>

      <el-menu-item index="/">全部视频</el-menu-item>
      <el-menu-item index="/manage">视频管理</el-menu-item>
    </el-menu>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view/>
    </div>
  </div>
</template>

<script setup>
import {RouterView} from 'vue-router'
import {ElMenu, ElMenuItem} from 'element-plus'

// 不需要额外的逻辑，路由由vue-router自动处理
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .main-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 20px;

    .logo-item {
      margin-right: 40px;

      .site-title {
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 2px;
      }
    }

    .el-menu-item {
      font-size: 16px;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
    }
  }

  .main-content {
    flex: 1;
    margin-top: 60px; /* 与导航栏高度一致 */
    //background-color: #f5f5f5;
    min-height: calc(100vh - 60px);
  }

}
</style>
