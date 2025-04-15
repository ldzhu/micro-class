const path = require('path');

const getBasePath = () => {
  return __dirname
}

// 导出路径配置
module.exports = {
  UPLOAD_DIR: path.resolve(getBasePath(), '../uploads'),
  DATABASE_FILE: path.resolve(getBasePath(), '../data/videos.db')
}
