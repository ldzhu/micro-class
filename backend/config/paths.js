const path = require('path');
const fileURLToPath = require('url').fileURLToPath;

// 获取当前模块路径
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// 判断是否在打包环境中
const isPacked = process.pkg !== undefined

// 动态计算基础路径
const getBasePath = () => {
  if (isPacked) {
    // 打包后 process.execPath 是可执行文件路径
    return path.dirname(process.execPath)
  }
  return __dirname
}

// 导出路径配置
module.exports = {
  UPLOAD_DIR: path.resolve(getBasePath(), '../uploads'),
  DATABASE_FILE: path.resolve(getBasePath(), '../data/videos.db')
}
