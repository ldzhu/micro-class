const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/database');
const {UPLOAD_DIR} = require('../../config/paths');


if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, {recursive: true})
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 处理编码问题（两步解码确保兼容性）
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const originalName = path.basename(decodedName);
    // 替换特殊字符（可选）
    const safeName = originalName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_.]/g, '');
    cb(null, safeName);
  }
});

const upload = multer({storage});

// 获取视频列表
router.get('/', (req, res) => {
  db.all(`
      SELECT videos.*,
             categories.name                            as category_name,
             COALESCE(ROUND(AVG(ratings.rating), 1), 0) AS average_rating,
             COUNT(ratings.id)                          AS rating_count
      FROM videos
               LEFT JOIN categories ON videos.category_id = categories.id
               LEFT JOIN ratings ON videos.id = ratings.video_id
      GROUP BY videos.id, videos.created_at
      ORDER BY videos.created_at DESC
  `, (err, rows) => {
    if (err) return res.status(500).json(err);

    res.json({success: true, data: rows});
  });
});

// 根据 id 获取视频
router.get('/:id', (req, res) => {
  const {id} = req.params;
  db.get(`
      SELECT videos.*,
             categories.name                            AS category_name,
             COALESCE(ROUND(AVG(ratings.rating), 1), 0) AS average_rating,
             COUNT(ratings.id)                          AS rating_count

      FROM videos
               LEFT JOIN categories ON videos.category_id = categories.id
               LEFT JOIN ratings ON videos.id = ratings.video_id
      WHERE videos.id = ?
      GROUP BY videos.id, videos.created_at
  `, [id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json({success: true, data: row});
  });
})

// 上传视频
router.post('/upload', upload.single('video'), (req, res) => {
  const {title, description, category_id} = req.body;
  const filePath = req.file.path;

  db.run(
    'INSERT INTO videos (title, description, category_id, file_path) VALUES (?, ?, ?, ?)',
    [title, description, category_id, filePath],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: this.lastID});
    }
  );
});

// 删除视频
router.delete('/:id', (req, res) => {
  const {id} = req.params;
  db.run('DELETE FROM videos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(err);
    if (this.changes === 0) {
      return res.status(404).json({error: '视频不存在'});
    }
    res.json({success: true});
  });
});

// 更新视频播放次数
router.post('/:id/view', (req, res) => {
  const {id} = req.params;
  db.run('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(err);
    if (this.changes === 0) {
      return res.status(404).json({error: '视频不存在'});
    }

    // 查询最新的 view_count
    db.get('SELECT view_count FROM videos WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json(err);
      if (!row) {
        return res.status(404).json({error: '视频不存在'});
      }
      res.json({success: true, data: row.view_count});
    });
  });
});

module.exports = router;
