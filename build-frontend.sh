#!/bin/bash
set -euo pipefail

# 配置变量
readonly frontend_dir="frontend"
readonly dist_dir="${frontend_dir}/dist"
readonly backend_public="backend/public"

# 检查必要目录存在性
[ -d "${frontend_dir}" ] || { echo "错误：前端目录不存在"; exit 1; }
[ -d "${backend_public}" ] || mkdir -p "${backend_public}"

# 构建前端
echo "开始构建前端..."
(cd "${frontend_dir}" && npm run build) || {
  echo "前端构建失败，退出码：$?"
  exit 1
}

# 同步构建产物
echo "同步前端文件..."
rsync -a --delete "${dist_dir}/" "${backend_public}/" || {
  echo "文件同步失败，退出码：$?"
  exit 1
}

echo "部署流程成功完成"
