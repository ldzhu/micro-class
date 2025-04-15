const express = require('express');
const router = express.Router();
const db = require('../db/database');

// 获取评论
router.get('/', (req, res) => {
  const { video_id } = req.query;

  db.all(
    'SELECT * FROM comments WHERE video_id = ? ORDER BY created_at DESC',
    [video_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: rows});
    }
  );
});

// 提交评论
router.post('/', (req, res) => {
  const { video_id, content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  db.run(
    'INSERT INTO comments (video_id, content) VALUES (?, ?)',
    [video_id, content.trim()],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: this.lastID});
    }
  );
});

module.exports = router;
