const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const UPLOAD_DIR = path.resolve(PROJECT_ROOT, 'uploads');
const DATABASE_FILE = path.resolve(PROJECT_ROOT, 'data', 'videos.db');

// 导出路径配置
module.exports = {
  UPLOAD_DIR,
  DATABASE_FILE
}
