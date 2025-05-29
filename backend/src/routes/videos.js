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
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const title = req.query.title;
  const category_id = req.query.category_id;

  // 构建查询条件
  let whereClauses = ['1=1'];
  let params = [];
  if (title) {
    whereClauses.push('videos.title LIKE ?')
    params.push(`%${title}%`)
  }

  if (category_id) {
    whereClauses.push('videos.category_id = ?')
    params.push(parseInt(category_id))
  }

  db.get(`
      SELECT COUNT(*) AS total
      FROM videos
      WHERE ${whereClauses.join(' AND ')}
  `, params, (err, row) => {
    if (err) return res.status(500).json(err);
    const total = row.total;

    const query = `
        SELECT videos.*,
               categories.name                            AS category_name,
               COALESCE(ROUND(AVG(ratings.rating), 1), 0) AS average_rating,
               COUNT(ratings.id)                          AS rating_count
        FROM videos
                 LEFT JOIN categories ON videos.category_id = categories.id
                 LEFT JOIN ratings ON videos.id = ratings.video_id
        WHERE ${whereClauses.join(' AND ')}
        GROUP BY videos.id, videos.created_at
        ORDER BY videos.created_at DESC
        LIMIT ? OFFSET ?
    `
    db.all(query, [...params, pageSize, offset], (err, rows) => {
      if (err) return res.status(500).json(err);

      res.json({success: true, data: rows, total: total});
    });
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
  const filePath = req.file.filename;

  db.run(
    'INSERT INTO videos (title, description, category_id, file_path) VALUES (?, ?, ?, ?)',
    [title, description, category_id, filePath],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: this.lastID});
    }
  );
});

// 更新视频
router.put('/:id', upload.single('video'), (req, res) => {
  const {id} = req.params;
  const {title, description, category_id} = req.body;
  const filePath = req.file.filename

  // 获取旧文件信息
  db.get('SELECT * FROM videos WHERE id = ?', [id], (err, oldVideo) => {
    if (err) return res.status(500).json(err)
    if (!oldVideo) return res.status(404).json({error: '视频不存在'})

    const updateData = {
      title: title || oldVideo.title,
      description: description || oldVideo.description,
      category_id: category_id || oldVideo.category_id,
      file_path: filePath || oldVideo.file_path
    }

    db.run(
      'UPDATE videos SET title = ?, description = ?, category_id = ?, file_path = ? WHERE id = ?',
      [updateData.title, updateData.description, updateData.category_id, updateData.file_path, id],
      function (err) {
        if (err) return res.status(500).json(err)

        res.json({success: true})
      }
    )
  })
})

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
      res.json({success: true, data: row["view_count"]});
    });
  });
});

module.exports = router;
