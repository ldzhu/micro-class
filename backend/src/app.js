const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const {UPLOAD_DIR, DATABASE_FILE} = require('../config/paths');

const videosRouter = require('./routes/videos');
const commentsRouter = require('./routes/comments');
const ratingsRouter = require('./routes/ratings');
const categoriesRouter = require('./routes/categories');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 路由配置
app.use('/api/videos', videosRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/categories', categoriesRouter);

// 视频上传
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, {recursive: true})
}
app.use('/uploads', express.static(UPLOAD_DIR, {
  setHeaders: (res) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  }
}));

// 前端代码
const history = require('connect-history-api-fallback')
app.use(history());

const PUBLIC_DIR = path.join(__dirname, '../public');
// const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');

app.use(express.static(PUBLIC_DIR, {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  setHeaders: (res, filePath) => {
    // 对HTML文件禁用缓存
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-store, max-age=0');
    }
  }
}));

// 错误处理中间件
app.use((req,res) => {
  res.status(500).json({ error: '服务器内部错误' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '未找到资源' });
});


// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
  console.log(`Database file: ${DATABASE_FILE}`);
});
