const express = require('express');
const router = express.Router();
const db = require('../db/database');

// 获取所有分类
router.get('/', (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json({success: true, data: rows});
  });
});

// 添加新分类
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: '分类名称不能为空' });
  }
  db.run(
    'INSERT INTO categories (name) VALUES (?)',
    [name.trim()],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({success: true, data: this.lastID});
    }
  );
});

module.exports = router;
