const sqlite3 = require('sqlite3').verbose();
const { DATABASE_FILE} = require('../../config/paths');

const db = new sqlite3.Database(DATABASE_FILE);

db.serialize(() => {
  // 创建表
  db.run(`
      CREATE TABLE IF NOT EXISTS videos
      (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          title       TEXT NOT NULL ,
          description TEXT,
          category_id INTEGER,
          file_path   TEXT NOT NULL,
          created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
          view_count  INTEGER  default 0
      )
  `);

  db.run(`
      CREATE TABLE IF NOT EXISTS categories
      (
          id   INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      )
  `);

  db.run(`
      CREATE TABLE IF NOT EXISTS comments
      (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          video_id   INTEGER NOT NULL,
          content    TEXT    NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (video_id) REFERENCES videos (id)
      )
  `);

  db.run(`
      CREATE TABLE IF NOT EXISTS ratings
      (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          video_id   INTEGER NOT NULL,
          rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (video_id) REFERENCES videos (id)
      )
  `);

  console.log('The database table schema is initialized');
});

module.exports = db;
