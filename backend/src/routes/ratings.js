const express = require('express');
const router = express.Router();
const db = require('../db/database');

// 提交评分
router.post('/', (req, res) => {
  const { video_id, rating } = req.body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: '无效的评分值' });
  }

  db.run(
    'INSERT INTO ratings (video_id, rating) VALUES (?, ?)',
    [video_id, rating],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: this.lastID});
    }
  );
});

// 获取平均分
router.get('/average', (req, res) => {
  const { video_id } = req.query;

  db.get(
    `SELECT AVG(rating) as average FROM ratings WHERE video_id = ?`,
    [video_id],
    (err, row) => {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: row.average || 0 });
    }
  );
});

module.exports = router;
